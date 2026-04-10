# IVTI · 你是哪一型

一个面向中国用户、基于微信传播的轻量级人格测试网站。灵感来自 [sbti.unun.dev](https://sbti.unun.dev)，做中文本土化 + 合规部署 + 数据统计。

- **测试形式**：多道二选一题目，6 维度向量打分，欧氏距离匹配人格
- **技术路线**：静态前端 + Serverless 后端 + NoSQL（方案 B）
- **传播路径**：微信 H5，支持生成结果海报长按保存 + 自定义分享卡片
- **数据目标**：显示参与总人数、人格分布、每题选项占比

---

## 当前状态

MVP 最小可运行版本已完成并本地验证通过：

- ✅ 3 屏 SPA（介绍 / 答题 / 结果）
- ✅ 6 维度 + 12 题 + 8 人格
- ✅ 向量距离算法匹配人格类型
- ✅ html2canvas 生成结果海报
- ✅ 本地 Node.js 零依赖开发服务器
- ✅ `/api/stats` 上报 + `/api/stats/summary` 聚合接口
- ✅ 基础防护：限流、路径穿越防护、payload 大小限制

接下来要做：扩题库、加选项分布统计、上云部署。详见文末「路线图」。

---

## 架构

### 本地开发架构

```
浏览器
  │
  ├─ GET /             ──→ server/index.js ──→ public/index.html
  ├─ GET /js/*.js      ──→ server/index.js ──→ public/js/*.js
  ├─ GET /css/*.css    ──→ server/index.js ──→ public/css/*.css
  │
  ├─ POST /api/stats          ──→ server/index.js ──→ server/stats.json
  └─ GET  /api/stats/summary  ──→ server/index.js ──→ server/stats.json
```

- 零依赖（不需要 `npm install`）
- 原生 Node.js `http` / `fs` / `path` 模块
- `server/stats.json` 作为本地"数据库"（模拟云数据库的读写契约）

### 生产架构（上云后，方案 B）

```
                       用户浏览器
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    [静态资源请求]                   [API 请求]
           │                               │
           ▼                               ▼
      [阿里云 CDN]                   [阿里云 CDN]
           │                               │
           ▼                               ▼
   [阿里云 OSS 对象存储]            [阿里云 函数计算 FC]
   (public/ 目录下的静态文件)              │
                                           ▼
                                [阿里云 表格存储 Tablestore]
                                (计数器表：total / type:* / q*:*)
```

本地 `server/index.js` 里的 `handleStatsPost` / `handleStatsSummary` 会 1:1 移植到 FC，前端接口契约保持不变。

---

## 技术栈

| 层 | 本地 | 生产（阿里云） |
|---|---|---|
| 前端 | 原生 HTML/CSS/JS（无构建）| 同左 → OSS + CDN |
| 后端 | 原生 Node.js http 模块 | 函数计算 FC（Node Runtime）|
| 数据 | `server/stats.json` 文件 | 表格存储 Tablestore（NoSQL）|
| 海报生成 | html2canvas（jsdelivr CDN，待自托管）| html2canvas（自托管） |
| 证书 | — | 免费 DV 证书 |
| 备案 | — | ICP 备案（轻量应用服务器作为凭证）|

**不需要的东西**：React/Vue/任何前端框架、Webpack/Vite 构建工具、Express/Koa 后端框架、MySQL/RDS 关系数据库、ECS 云主机作为业务服务器。

---

## 目录结构

```
IVTI/
├── README.md              # 本文件
├── package.json           # 只有一个 dev 脚本，无依赖
├── .gitignore
├── public/                # 纯静态前端（未来上传到 OSS）
│   ├── index.html         # 三屏 SPA
│   ├── css/
│   │   └── style.css      # 绿色系、22px 圆角、响应式
│   └── js/
│       ├── data.js        # 维度、题库、人格定义
│       ├── scoring.js     # 向量打分 + 距离匹配
│       └── app.js         # UI 流转 + 海报生成 + 埋点
└── server/                # 本地开发服务器（未来迁移到 FC）
    ├── index.js           # 零依赖 Node http 服务器
    └── stats.json         # 本地数据文件（.gitignore 中，不入库）
```

---

## 本地运行

```bash
node server/index.js
```

然后浏览器打开 http://localhost:3000

### 可用接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | `/` | 测试页面 |
| GET  | `/css/*`、`/js/*` | 静态资源 |
| POST | `/api/stats` | 上报一次测试结果 |
| GET  | `/api/stats/summary` | 聚合统计数据 |

### POST /api/stats 数据格式

```json
{
  "type": "SCHOLAR",
  "scores": {
    "social": -40,
    "logic": 70,
    "plan": 60,
    "vision": -30,
    "risk": -50,
    "express": -20
  }
}
```

约束：
- `type` 必须是字符串，最长 32 字符
- 请求体最大 10 KB
- 每 IP 每分钟最多 30 次（简单限流）

### GET /api/stats/summary 返回格式

```json
{
  "total": 2,
  "types": { "SCHOLAR": 1, "ARTIST": 1 }
}
```

> 后续会扩展：加 per-question option 分布，见路线图 #19。

---

## 数据模型

### 维度（6 个）

每个维度是 `[-100, +100]` 的连续分数，低分和高分代表两个极端。

| key | 低分（-）| 高分（+）|
|---|---|---|
| `social` | 独处 | 社交 |
| `logic` | 感性 | 理性 |
| `plan` | 随性 | 计划 |
| `vision` | 务实 | 想象 |
| `risk` | 稳健 | 冒险 |
| `express` | 含蓄 | 外放 |

### 题目

```js
{
  id: 'q1',
  text: '周末你更想——',
  options: [
    { text: '宅家追剧 / 打游戏', effects: { social: -15, express: -8 } },
    { text: '约朋友出门浪',     effects: { social: +15, express: +8 } },
  ],
}
```

每个选项对一个或多个维度有加减分效果。累加所有题目的效果得到用户的 6 维向量。

### 人格类型

```js
{
  code: 'SCHOLAR',
  name: '学究型',
  color: '#6c8d71',
  vector: { social: -40, logic: +70, plan: +60, vision: -30, risk: -50, express: -20 },
  desc: '你习惯把世界拆成逻辑零件……',
}
```

每个人格有一个目标向量。用户测完后，系统计算用户向量和每个人格目标向量的欧氏距离，最近的就是匹配结果。匹配百分比 = `1 − distance / maxDistance`，地板 40%。

### 上云后的 Tablestore 表设计

单表 `counters`，主键 `key`（字符串），列 `count`（整数）：

| key | 用途 | 示例 |
|---|---|---|
| `total` | 总参与人数 | 12345 |
| `type:<CODE>` | 每种人格的人数 | `type:SCHOLAR` → 1523 |
| `q<id>:<optionIndex>` | 每题每个选项的人数 | `q1:0` → 7200 |

写入用 Tablestore 的原子递增操作，并发安全。免费额度（1000 万读 + 1000 万写 + 25GB 存储）足够 65 万次完整测试/月。

---

## 部署计划（方案 B · 阿里云）

### 服务清单

| 服务 | 作用 | 月度成本 |
|---|---|---|
| 轻量应用服务器 | 备案凭证（闲置不跑业务）| ¥5~9（¥60~108/年） |
| OSS 对象存储 | 存 `public/` 静态文件 | ¥0~3（免费额度内） |
| CDN | 加速 + 绑定自定义域名 + HTTPS | ¥0（新用户流量包） |
| 函数计算 FC | 跑 stats API | ¥0（永久免费额度） |
| 表格存储 Tablestore | 存计数器数据 | ¥0（永久免费 25GB） |
| 数字证书 | 免费 DV 证书 | ¥0 |
| **合计** | | **约 ¥10/月** |

### 不买的东西（坑）

- ❌ ECS 云服务器（¥100+/月）— Serverless 架构用不到
- ❌ RDS 关系数据库（¥50+/月）— Tablestore 免费且更适合
- ❌ SLB 负载均衡（¥30+/月）— CDN + FC 已经自带
- ❌ WAF 高级版 — MVP 阶段用不到

### 备案说明

阿里云的备案政策要求必须有一个"包年包月的计算类产品"才会签发备案服务号。OSS / CDN / FC 都不签发，所以必须买最便宜的轻量应用服务器（¥60~108/年）作为备案凭证。这台服务器不跑真实业务，备案通过后也要保留（否则可能触发备案注销）。

---

## 路线图

### ✅ Phase 0 · 已完成

- [x] MVP 前端（3 屏 SPA + 6 维度 + 12 题 + 8 人格）
- [x] 评分算法（向量距离匹配）
- [x] 本地 Node.js 开发服务器（零依赖）
- [x] `/api/stats` 上报 + summary 接口
- [x] 基础防护（限流、路径穿越、payload 限制）
- [x] 推送到 GitHub

### 🔴 Phase 1 · 关键路径（用户做）

- [ ] 注册阿里云账号 + 个人实名认证
- [ ] 域名 DNS 解析托管到阿里云云解析
- [ ] 购买最便宜的轻量应用服务器（备案凭证）
- [ ] 生成备案服务号
- [ ] 提交 ICP 备案（等待 2~3 周）
- [ ] 注册微信订阅号（可选，用于 JSSDK 分享卡片）

### 🟡 Phase 2 · 备案期间并行做（开发）

- [ ] 扩展 stats 数据模型，支持每题选项分布统计
- [ ] 结果页增加「参与人数 / 人格占比 / 题目热力图」展示
- [ ] 扩充题库到 20~24 题、人格到 10~12 种
- [ ] 做专门的海报模板 DOM（带品牌字样 + 二维码位置）
- [ ] 自托管 html2canvas，去掉 jsdelivr CDN 依赖
- [ ] 埋点改用 `navigator.sendBeacon` 更可靠

### 🟢 Phase 3 · 备案通过后（开发 + 部署）

- [ ] 开通 OSS、CDN、函数计算 FC、表格存储 Tablestore
- [ ] 写 FC 版 stats API（和本地版契约一致）
- [ ] Tablestore 建表（counters 单表）
- [ ] 上传 `public/` 到 OSS 静态网站托管
- [ ] 配置 CDN 绑定自定义域名
- [ ] 申请免费 DV 证书 + 上 HTTPS
- [ ] 写微信 JSSDK 签名云函数（需要订阅号 appId/appSecret）
- [ ] 前端接入 `wx.updateAppMessageShareData`

### 🔵 Phase 4 · 上线前最后一步

- [ ] 加隐私说明（页脚弹层）
- [ ] 接入百度统计
- [ ] 微信内真机测试分享卡片
- [ ] iOS + Android 双平台测试长按保存海报
- [ ] 观察人格分布，调平题库和向量

---

## 合规红线

- ❌ 不要叫 "MBTI"（注册商标），用 "IVTI"、"XBTI"、"某某型人" 之类的戏仿名
- ❌ 不要出现政治、宗教、赌博、算命等敏感内容
- ❌ 不要在备案时把内容写成"心理测试""性格分析"，用"个人博客/工具类"更安全
- ✅ 所有计算在用户本地浏览器完成，仅匿名聚合统计
- ✅ 上线前加隐私说明，写明不收集 PII

---

## 许可

私有项目，暂无开源许可证。

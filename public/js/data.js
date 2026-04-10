// IVTI · 题库、维度、人格类型
// 所有数值都在 [-100, +100] 的语义区间上（未必恰好达到）
window.IVTI_DATA = {
  dimensions: [
    { key: 'social',  low: '独处', high: '社交' },
    { key: 'logic',   low: '感性', high: '理性' },
    { key: 'plan',    low: '随性', high: '计划' },
    { key: 'vision',  low: '务实', high: '想象' },
    { key: 'risk',    low: '稳健', high: '冒险' },
    { key: 'express', low: '含蓄', high: '外放' },
  ],

  questions: [
    {
      id: 'q1',
      text: '周末你更想——',
      options: [
        { text: '宅家追剧 / 打游戏', effects: { social: -15, express: -8 } },
        { text: '约朋友出门浪',     effects: { social: +15, express: +8 } },
      ],
    },
    {
      id: 'q2',
      text: '做重要决定时，你更依赖——',
      options: [
        { text: '列表分析利弊', effects: { logic: +15, plan: +5 } },
        { text: '跟着直觉走',   effects: { logic: -15, plan: -5 } },
      ],
    },
    {
      id: 'q3',
      text: '接到一个新项目，你的第一反应是——',
      options: [
        { text: '先列一份计划表', effects: { plan: +15, risk: -5 } },
        { text: '边做边调整',     effects: { plan: -15, risk: +5 } },
      ],
    },
    {
      id: 'q4',
      text: '你更愿意读哪一类书？',
      options: [
        { text: '非虚构 / 纪实',  effects: { vision: -12, logic: +8 } },
        { text: '奇幻 / 科幻小说', effects: { vision: +12, logic: -8 } },
      ],
    },
    {
      id: 'q5',
      text: '收到一笔意外的钱，你会——',
      options: [
        { text: '存起来或还贷',   effects: { risk: -15, plan: +5 } },
        { text: '拿去投资或尝鲜', effects: { risk: +15, plan: -5 } },
      ],
    },
    {
      id: 'q6',
      text: '在聊天中，你通常是——',
      options: [
        { text: '安静的倾听者',   effects: { express: -12, social: -5 } },
        { text: '抢着表达的那个', effects: { express: +12, social: +5 } },
      ],
    },
    {
      id: 'q7',
      text: '朋友遇到烦心事，你会先——',
      options: [
        { text: '给出具体建议',   effects: { logic: +12, express: +5 } },
        { text: '默默陪着安慰',   effects: { logic: -12, express: -5 } },
      ],
    },
    {
      id: 'q8',
      text: '旅行前你会——',
      options: [
        { text: '做好攻略和行程', effects: { plan: +12, vision: -5 } },
        { text: '说走就走',       effects: { plan: -12, vision: +5 } },
      ],
    },
    {
      id: 'q9',
      text: '你更想去哪种公司？',
      options: [
        { text: '稳定的大厂 / 体制内', effects: { risk: -12, logic: +5 } },
        { text: '有想象力的创业公司',  effects: { risk: +12, logic: -5 } },
      ],
    },
    {
      id: 'q10',
      text: '选餐厅吃饭，你通常——',
      options: [
        { text: '直接去熟悉的老店',     effects: { risk: -10, vision: -8 } },
        { text: '挑一家没去过的新店',   effects: { risk: +10, vision: +8 } },
      ],
    },
    {
      id: 'q11',
      text: '表达喜欢 / 爱意的方式是——',
      options: [
        { text: '默默做很多小事', effects: { express: -12, vision: -5 } },
        { text: '大声说出来',     effects: { express: +12, vision: +5 } },
      ],
    },
    {
      id: 'q12',
      text: '在聚会上，你通常是——',
      options: [
        { text: '角落里的观察者', effects: { social: -12, express: -8 } },
        { text: '气氛担当',       effects: { social: +12, express: +8 } },
      ],
    },
  ],

  personalities: [
    {
      code: 'SCHOLAR',
      name: '学究型',
      color: '#6c8d71',
      vector: { social: -40, logic: +70, plan: +60, vision: -30, risk: -50, express: -20 },
      desc: '你习惯把世界拆成逻辑零件，再小心翼翼地拼回去。遇事先思考三秒，能用数据说话就不靠情绪。你的武器是严谨，软肋是有时太怕出错。',
    },
    {
      code: 'ARTIST',
      name: '造梦艺术家',
      color: '#c98474',
      vector: { social: -10, logic: -60, plan: -50, vision: +70, risk: +20, express: +40 },
      desc: '你活在自己的平行宇宙里。灵感来的时候挡不住，走了也只能躺平等它回来。世界在你眼里永远可以重新画一遍。',
    },
    {
      code: 'SOCIAL',
      name: '气氛组组长',
      color: '#e0a94b',
      vector: { social: +70, logic: -20, plan: -10, vision: +10, risk: +30, express: +70 },
      desc: '你是人形加热器，走到哪里都能把冷场盘活。朋友的朋友的朋友都还记得你，但你偶尔也需要一个人发呆。',
    },
    {
      code: 'HOMEBODY',
      name: '宅家派',
      color: '#8a7ca8',
      vector: { social: -70, logic: +10, plan: 0, vision: -10, risk: -40, express: -50 },
      desc: '你家是世界上最好的地方，沙发是第二张床。对"出门"这件事你需要充分的心理建设，但一旦投入某件事就异常专注。',
    },
    {
      code: 'EXPLORER',
      name: '冒险家',
      color: '#4a90a4',
      vector: { social: +30, logic: -10, plan: -40, vision: +50, risk: +70, express: +40 },
      desc: '地平线之外的一切都在吸引你。讨厌重复，渴望新鲜，哪怕迷路也觉得是意外收获。保险这种东西是写给别人的。',
    },
    {
      code: 'THINKER',
      name: '深夜思考者',
      color: '#5d6b8a',
      vector: { social: -50, logic: +50, plan: +10, vision: +60, risk: -10, express: -40 },
      desc: '你和自己的大脑是最好的朋友。独处时最有创造力，洗澡和散步时灵感最多。别人以为你安静，其实你脑子里已经开了三个会。',
    },
    {
      code: 'CARETAKER',
      name: '暖心管家',
      color: '#c48b9f',
      vector: { social: +20, logic: -40, plan: +50, vision: -20, risk: -30, express: -10 },
      desc: '你是那个默默把每个人都照顾到的人。记得朋友的生日、同事的忌口、父母的用药时间。温柔不是软弱，而是你的选择。',
    },
    {
      code: 'ACHIEVER',
      name: '人生 CEO',
      color: '#3a6b5c',
      vector: { social: +40, logic: +60, plan: +70, vision: +10, risk: +40, express: +50 },
      desc: '目标导向到骨子里。日历密密麻麻，待办永远有下一条。别人摸鱼你复盘，别人复盘你已经在规划下一季度。',
    },
  ],
};

// IVTI · 打分与人格匹配
(function () {
  const { dimensions, questions, personalities } = window.IVTI_DATA;

  // 把答案累加成 6 维向量，每维裁剪到 [-100, 100]
  function computeScores(answers) {
    const scores = {};
    dimensions.forEach((d) => { scores[d.key] = 0; });

    for (const { questionId, optionIndex } of answers) {
      const q = questions.find((x) => x.id === questionId);
      if (!q) continue;
      const effects = q.options[optionIndex].effects || {};
      for (const [k, v] of Object.entries(effects)) {
        if (k in scores) scores[k] += v;
      }
    }

    for (const k of Object.keys(scores)) {
      if (scores[k] > 100) scores[k] = 100;
      if (scores[k] < -100) scores[k] = -100;
    }
    return scores;
  }

  // 与每个人格的目标向量计算欧氏距离，取最近者
  function findBestMatch(scores) {
    let best = null;
    let bestDist = Infinity;

    for (const p of personalities) {
      let sq = 0;
      for (const d of dimensions) {
        const diff = scores[d.key] - (p.vector[d.key] || 0);
        sq += diff * diff;
      }
      const dist = Math.sqrt(sq);
      if (dist < bestDist) {
        bestDist = dist;
        best = p;
      }
    }

    // 把距离转成匹配度百分比；地板 40% 避免出现难堪的低分
    const maxDist = Math.sqrt(dimensions.length) * 200;
    const raw = (1 - bestDist / maxDist) * 100;
    const match = Math.max(40, Math.min(99, Math.round(raw)));

    return { personality: best, match, distance: bestDist };
  }

  window.IVTI_SCORING = { computeScores, findBestMatch };
})();

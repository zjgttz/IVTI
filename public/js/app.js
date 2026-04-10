// IVTI · 主流程
(function () {
  const { dimensions, questions } = window.IVTI_DATA;
  const { computeScores, findBestMatch } = window.IVTI_SCORING;

  const state = {
    current: 0,
    answers: [],
    order: [],
  };

  const screens = {
    intro: document.getElementById('screen-intro'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result'),
  };
  const progressBar = document.getElementById('progress-bar');
  const quizIndex = document.getElementById('quiz-index');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const btnBack = document.getElementById('btn-back');

  function show(name) {
    for (const [k, el] of Object.entries(screens)) {
      el.classList.toggle('hidden', k !== name);
    }
    window.scrollTo(0, 0);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz() {
    state.current = 0;
    state.answers = [];
    state.order = shuffle(questions);
    show('quiz');
    renderQuestion();
  }

  function renderQuestion() {
    const q = state.order[state.current];
    quizIndex.textContent = `${state.current + 1} / ${state.order.length}`;
    quizQuestion.textContent = q.text;
    quizOptions.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => answer(idx));
      quizOptions.appendChild(btn);
    });

    progressBar.style.width = `${(state.current / state.order.length) * 100}%`;
    btnBack.style.visibility = state.current === 0 ? 'hidden' : 'visible';
  }

  function answer(optionIndex) {
    const q = state.order[state.current];
    state.answers[state.current] = { questionId: q.id, optionIndex };
    if (state.current < state.order.length - 1) {
      state.current++;
      renderQuestion();
    } else {
      finish();
    }
  }

  function back() {
    if (state.current > 0) {
      state.current--;
      renderQuestion();
    }
  }

  function finish() {
    const scores = computeScores(state.answers);
    const result = findBestMatch(scores);
    progressBar.style.width = '100%';
    renderResult(result, scores);
    show('result');
    uploadStats(result.personality.code, scores);
  }

  function renderResult({ personality, match }, scores) {
    document.getElementById('result-code').textContent = personality.code;
    document.getElementById('result-name').textContent = personality.name;
    document.getElementById('result-match').textContent = match;
    document.getElementById('result-desc').textContent = personality.desc;

    document.getElementById('result-code').style.color = personality.color;
    document.getElementById('result-header').style.borderBottomColor = personality.color;

    const dimsEl = document.getElementById('dims');
    dimsEl.innerHTML = '';
    for (const d of dimensions) {
      const score = scores[d.key];
      const fillWidth = Math.abs(score) / 2;                 // 0..50 (%)
      const fillLeft = score >= 0 ? 50 : 50 - fillWidth;     // %

      const row = document.createElement('div');
      row.className = 'dim';
      row.innerHTML =
        '<div class="dim-labels"><span>' + d.low + '</span><span>' + d.high + '</span></div>' +
        '<div class="dim-track"><div class="dim-fill" style="left:' +
        fillLeft + '%; width:' + fillWidth + '%; background:' + personality.color + ';"></div></div>';
      dimsEl.appendChild(row);
    }
  }

  function uploadStats(type, scores) {
    try {
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, scores }),
      }).catch(() => {});
    } catch (_) { /* 离线环境静默失败 */ }
  }

  async function generatePoster() {
    if (typeof html2canvas !== 'function') {
      alert('海报生成库未加载，请检查网络连接');
      return;
    }
    const target = document.getElementById('result-card');
    try {
      const canvas = await html2canvas(target, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(
          '<title>长按保存图片</title>' +
          '<body style="margin:0;background:#f5f3ee;padding:20px;text-align:center;font-family:sans-serif;">' +
          '<p style="color:#666;font-size:13px;margin-bottom:12px;">长按图片保存到相册</p>' +
          '<img src="' + dataUrl + '" style="max-width:100%;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.1);">' +
          '</body>'
        );
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'ivti-result.png';
        a.click();
      }
    } catch (e) {
      alert('生成海报失败：' + e.message);
    }
  }

  document.getElementById('btn-start').addEventListener('click', startQuiz);
  document.getElementById('btn-restart').addEventListener('click', () => show('intro'));
  document.getElementById('btn-poster').addEventListener('click', generatePoster);
  btnBack.addEventListener('click', back);
})();

// Science Lab: pick a grade, play with simulations (with guided "try this → what did you notice?" questions), practice
// units with endless generated questions, a 10-question mixed quiz, and printable worksheets.
// Hash routes: #/  #/g/5  #/sims  #/sim/<id>  #/p/<unit>  #/quiz/5  #/print/<unit|g5>
import SIMS from './sims/index.js';
import BANK from './bank/index.js';
import { rng, tx } from './util.js';
import { check } from './check.js';
import { kit } from './kit.js';
import { logAnswer, logActivity } from './learnlog.js';

const APP = 'sciencelab', META = { name: { zh: '自然科學實驗室', en: 'Science Lab' }, url: '/science-lab/' };
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const store = {
  get(k, d) { try { const v = localStorage.getItem('sl-' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sl-' + k, JSON.stringify(v)); } catch {} },
};
let lang = store.get('lang', (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
const stats = store.get('stats', {});      // unit id → [answered, correct]
const simDone = store.get('sims', {});     // sim id → best score 0–1
const L = (zh, en) => (lang === 'zh' ? zh : en);
const X = (x) => tx(x, lang);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const ZH_N = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const gradeName = (g) => (lang === 'en' ? `Grade ${g}` : g <= 6 ? `國小${ZH_N[g]}年級` : g <= 9 ? `國${ZH_N[g - 6]}（${ZH_N[g]}年級）` : `高${ZH_N[g - 9]}（${ZH_N[g]}年級）`);
const gradeRange = ([a, b]) => (a === b ? (lang === 'zh' ? `${a} 年級` : `Grade ${a}`) : lang === 'zh' ? `${a}–${b} 年級` : `Grades ${a}–${b}`);
const BANDS = [[1, 2, 'b1', ['國小低年級', 'Early elementary']], [3, 4, 'b2', ['國小中年級', 'Middle elementary']], [5, 6, 'b3', ['國小高年級', 'Upper elementary']],
  [7, 9, 'b4', ['國中 理化・生物・地科', 'Middle school']], [10, 12, 'b5', ['高中 物理・化學・生物・地科', 'High school']]];
const bandOf = (g) => BANDS.find(([a, b]) => g >= a && g <= b);
const SUBJ = { phys: ['物理', 'Physics', '⚡'], chem: ['化學', 'Chemistry', '🧪'], bio: ['生物', 'Life science', '🌱'], earth: ['地球科學', 'Earth & space', '🌏'] };
const subjTag = (s) => (SUBJ[s] ? `<span class="tag s-${s}">${SUBJ[s][2]} ${L(SUBJ[s][0], SUBJ[s][1])}</span>` : '');
const curTags = (cur = {}) => Object.entries(cur).map(([c, v]) => `<span class="tag t-${c}" title="${esc(X(v))}">${c === 'tw' ? L('台灣', 'TW') : L('美國', 'US')} · ${esc(X(v))}</span>`).join('');
const inG = (x, g) => x.grades[0] <= g && g <= x.grades[1];
const simsFor = (g) => SIMS.filter((s) => inG(s, g));
const unitsFor = (g) => BANK.filter((u) => inG(u, g));
const simById = (id) => SIMS.find((s) => s.id === id);
const unitById = (id) => BANK.find((u) => u.id === id);
const newSeed = () => (Math.random() * 2 ** 31) >>> 0;
const draw = (u, seed) => ({ ...u.gen(rng(seed)), u, seed });
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function stars(id) {
  const s = stats[id]; if (!s) return 0;
  const [n, ok] = s;
  return ok >= 20 && ok / n >= 0.8 ? 3 : ok >= 8 ? 2 : ok >= 3 ? 1 : 0;
}
const starHTML = (k) => `<span class="stars">${'★'.repeat(k)}<i>${'★'.repeat(3 - k)}</i></span>`;
function record(u, ok, g) {
  const s = (stats[u.id] ||= [0, 0]); s[0]++; if (ok) s[1]++; store.set('stats', stats);
  logAnswer(APP, META, { id: u.id, name: u.name, grade: g ?? u.grades[0] }, ok);
}

// ---------- header ----------
function header() {
  $('.bt').innerHTML = `<b>${L('自然科學實驗室', 'Science Lab')}</b><small>${L('1–12 年級 · 動手模擬 · 觀察與練習', 'Grades 1–12 · hands-on simulations · practice')}</small>`;
  $('#lang').textContent = lang === 'zh' ? 'EN' : '中文';
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  document.title = L('自然科學實驗室 Science Lab', 'Science Lab 自然科學實驗室');
  $('#foot').innerHTML = L(`共 ${SIMS.length} 個模擬實驗、${BANK.length} 個練習單元。題目由程式隨機產生，每次數字不同。進度只存在這台裝置的瀏覽器裡。依據台灣 108 課綱自然科學領域與美國 NGSS。`,
    `${SIMS.length} simulations and ${BANK.length} practice units. Questions are generated with new numbers each time. Progress is saved only in this browser. Follows Taiwan’s 108 curriculum (Natural Sciences) and the US NGSS.`);
}
let relang = null, cleanup = null;
$('#lang').onclick = () => { lang = lang === 'zh' ? 'en' : 'zh'; store.set('lang', lang); header(); relang ? relang() : route(); };

// ---------- cards ----------
const simCard = (s) => `<a class="simcard" href="#/sim/${s.id}"><span class="si">${s.icon}</span><span class="sn">${X(s.name)}</span>
  <span class="tags">${subjTag(s.subj)}<span class="tag">${gradeRange(s.grades)}</span>${simDone[s.id] != null ? `<span class="tag done">✓ ${L('做過了', 'Done')}</span>` : ''}</span></a>`;
const unitCard = (u) => {
  const s = stats[u.id];
  return `<a class="topic" href="#/p/${u.id}"><span class="tn">${X(u.name)}</span>${starHTML(stars(u.id))}
    <span class="tags">${subjTag(u.subj)}${curTags(u.cur)}</span><span class="ts">${s ? L(`答對 ${s[1]} / ${s[0]} 題`, `${s[1]} / ${s[0]} correct`) : L('還沒練習', 'Not started')}</span></a>`;
};

// ---------- pages ----------
function home() {
  let h = `<section class="hero"><h1>${L('今天想做什麼實驗？', 'What will you explore today?')}</h1>
    <p>${L('選一個年級：每個年級都有可以動手玩的模擬實驗（拉滑桿、按按鈕、看看會發生什麼事），還有題目做不完的練習單元。', 'Pick a grade. Each one has simulations to play with — drag sliders, press buttons, see what happens — and practice units with endless questions.')}</p>
    <a class="btn ghost" href="#/sims">🔬 ${L(`看全部 ${SIMS.length} 個模擬實驗`, `All ${SIMS.length} simulations`)}</a></section>`;
  h += `<div class="legend">${BANDS.map(([a, b, band, nm]) => `<span class="lg ${band}"><i></i>${L(...nm)}</span>`).join('')}</div><div class="grades">`;
  for (const [a, b, band, nm] of BANDS) {
    for (let g = a; g <= b; g++) {
      const us = unitsFor(g), ss = simsFor(g), done = us.reduce((s, u) => s + stars(u.id), 0), max = us.length * 3;
      h += `<a class="gcard ${band}" href="#/g/${g}"><span class="gn">${g}</span><span class="gl">${gradeName(g)}</span>
        <span class="gc">🔬 ${ss.length} · ✏️ ${us.length}</span>
        <span class="gicons">${ss.slice(0, 5).map((s) => s.icon).join('')}</span>
        <span class="bar"><i style="width:${max ? (100 * done) / max : 0}%"></i></span></a>`;
    }
  }
  h += `</div><p class="gnote">🔬 ${L('模擬實驗', 'simulations')}　✏️ ${L('練習單元', 'practice units')}</p>`;
  const feat = ['magnets', 'circuits', 'water-cycle', 'light', 'density-buoyancy', 'punnett', 'projectile', 'titration', 'orbits', 'dna-protein'].map(simById).filter(Boolean);
  h += `<h2 class="sech">✨ ${L('試試這些實驗', 'Try these simulations')}</h2><div class="sims">${feat.map(simCard).join('')}</div>`;
  app.innerHTML = h;
}

function allSims() {
  let h = `<nav class="crumb"><a href="#/">← ${L('首頁', 'Home')}</a></nav><section class="ghead"><h1>🔬 ${L('全部模擬實驗', 'All simulations')}</h1>
    <div class="acts" id="sf"></div></section><div id="sl"></div>`;
  app.innerHTML = h;
  let f = 'all';
  const paint = () => {
    $('#sf').innerHTML = [['all', L('全部', 'All'), ''], ...Object.entries(SUBJ).map(([k, v]) => [k, L(v[0], v[1]), v[2]])]
      .map(([k, n, i]) => `<button class="chip ${f === k ? 'on' : ''}" data-f="${k}">${i} ${n}</button>`).join('');
    $('#sf').querySelectorAll('button').forEach((b) => (b.onclick = () => { f = b.dataset.f; paint(); }));
    $('#sl').innerHTML = BANDS.map(([a, b, band, nm]) => {
      const ss = SIMS.filter((s) => s.grades[0] >= a && s.grades[0] <= b && (f === 'all' || s.subj === f));
      return ss.length ? `<h2 class="bandh ${band}">${L(...nm)} <small>${gradeRange([a, b])}</small></h2><div class="sims">${ss.map(simCard).join('')}</div>` : '';
    }).join('');
  };
  paint();
}

function grade(g) {
  const us = unitsFor(g), ss = simsFor(g);
  app.innerHTML = `<nav class="crumb"><a href="#/">← ${L('所有年級', 'All grades')}</a></nav>
    <section class="ghead"><h1>${gradeName(g)}</h1><span class="cur-tag">${L(...bandOf(g)[3])}</span>
    <div class="acts">${us.length ? `<a class="btn big" href="#/quiz/${g}">🎯 ${L('綜合測驗 10 題', 'Mixed quiz · 10 questions')}</a>
    <a class="btn ghost" href="#/print/g${g}">🖨️ ${L('列印學習單', 'Print a worksheet')}</a>` : ''}</div></section>
    <h2 class="sech">🔬 ${L('模擬實驗', 'Simulations')} <small>${ss.length}</small></h2>
    <div class="sims">${ss.map(simCard).join('') || `<p class="empty">${L('還沒有。', 'None yet.')}</p>`}</div>
    <h2 class="sech">✏️ ${L('練習單元', 'Practice units')} <small>${us.length}</small></h2>
    <div class="topics">${us.map(unitCard).join('') || `<p class="empty">${L('還沒有。', 'None yet.')}</p>`}</div>`;
}

// ---------- simulation page ----------
const obsState = {};   // sim id → [{ left, done, ok }]
function simPage(id) {
  const s = simById(id); if (!s) return (location.hash = '#/sims');
  const g = s.grades[0];
  const units = BANK.filter((u) => u.sim === id);
  app.innerHTML = `<nav class="crumb"><a href="#/g/${g}">← ${gradeName(g)}</a><a href="#/sims">🔬 ${L('全部實驗', 'All simulations')}</a></nav>
    <section class="phead"><h1><span class="hi">${s.icon}</span> ${X(s.name)}</h1>
    <span class="tags">${subjTag(s.subj)}<span class="tag">${gradeRange(s.grades)}</span>${curTags(s.cur)}</span>
    <p class="intro">${X(s.intro)}</p></section>
    <article class="simbox" id="simbox"></article>
    <section class="obs"><h2 class="sech">🔍 ${L('試試看，你發現了什麼？', 'Try this — what did you notice?')}</h2><div id="obs"></div></section>
    ${units.length ? `<section><h2 class="sech">✏️ ${L('相關練習', 'Practice')}</h2><div class="topics">${units.map(unitCard).join('')}</div></section>` : ''}`;
  const box = $('#simbox');
  let k = null;
  try {
    k = kit(box, lang, { done: (sc) => { logActivity(APP, META, { id: 'sim-' + id, name: s.name, grade: g }, sc); } });
    s.mount(k);
  } catch (e) {
    console.error(e);
    box.insertAdjacentHTML('beforeend', `<p class="fb no">⚠️ ${L('這個實驗出了問題', 'This simulation hit a problem')}: ${esc(e.message)}</p>`);
  }
  cleanup = () => k?.destroy();
  observations(s, $('#obs'));
  relang = () => { const y = window.scrollY; cleanup?.(); simPage(id); window.scrollTo(0, y); };
}

function observations(s, el) {
  const st = (obsState[s.id] ||= s.observe.map(() => ({ left: 2, done: false, ok: false, wrong: [] })));
  const unit = { id: 'sim-' + s.id, name: s.name, grade: s.grades[0] };
  const paint = () => {
    el.innerHTML = s.observe.map((o, i) => {
      const x = st[i], order = rng(i * 7919 + s.id.length).shuffle(o.options.map((op, j) => j));
      return `<div class="ob ${x.done ? (x.ok ? 'ok' : 'no') : ''}" data-i="${i}"><div class="obn">${i + 1}</div><div class="obb">
        <p class="try">🧪 <b>${L('試試看', 'Try this')}：</b>${X(o.try)}</p>
        <p class="ask">❓ ${X(o.ask)}</p>
        <div class="choices sm">${order.map((j) => `<button class="ch ${x.done && j === 0 ? 'right' : ''} ${x.wrong.includes(j) ? 'wrong' : ''}" data-j="${j}" ${x.done || x.wrong.includes(j) ? 'disabled' : ''}>${X(o.options[j])}</button>`).join('')}</div>
        <div class="fb ${x.done ? (x.ok ? 'ok' : 'no') : x.wrong.length ? 'no' : ''}">${x.done ? (x.ok ? '✅ ' + L('對了！', 'Right!') : '💡 ' + L('看看為什麼：', 'Here’s why:')) : x.wrong.length ? '🤔 ' + L('再看看模擬，然後再試一次！', 'Look at the simulation again and try once more!') : ''}</div>
        ${x.done ? `<p class="why">${X(o.why)}</p>` : ''}</div></div>`;
    }).join('') + (st.every((x) => x.done) ? `<p class="obsum">🎉 ${L(`觀察完成！答對 ${st.filter((x) => x.ok).length} / ${st.length} 題。`, `All done! ${st.filter((x) => x.ok).length} / ${st.length} right.`)}
      <button class="link" id="obr">${L('重新作答', 'Answer again')}</button></p>` : '');
    el.querySelectorAll('.ch').forEach((b) => (b.onclick = () => {
      const i = +b.closest('.ob').dataset.i, j = +b.dataset.j, x = st[i];
      if (x.done) return;
      if (j === 0) { x.done = true; x.ok = true; }
      else { x.wrong.push(j); if (--x.left <= 0) x.done = true; }
      if (x.done) {
        logAnswer(APP, META, unit, x.ok);
        if (st.every((y) => y.done)) {
          const sc = st.filter((y) => y.ok).length / st.length;
          simDone[s.id] = Math.max(simDone[s.id] ?? 0, sc); store.set('sims', simDone);
          logActivity(APP, META, unit, sc);
        }
      }
      paint();
    }));
    const r = $('#obr', el); if (r) r.onclick = () => { obsState[s.id] = null; observations(s, el); };
  };
  paint();
}

// ---------- question card (practice / quiz) ----------
function card(q, el, { tries = 2, onDone, quiz = false } = {}) {
  let left = tries, finished = false;
  const a = q.ans;
  const opts = a.type === 'choice' ? rng(q.seed ^ 0x5bd1e995).shuffle(a.options.map((o, i) => ({ o, i }))) : null;
  const gr = q.u.grades[0];
  el.innerHTML = `<div class="q">${X(q.q)}</div>${q.fig ? `<div class="figs">${q.fig}</div>` : ''}
    ${opts ? `<div class="choices">${opts.map((x, k) => `<button class="ch" data-i="${x.i}"><b>${'ABCDEF'[k]}</b><span>${X(x.o)}</span></button>`).join('')}</div>`
      : `<form class="ansrow" autocomplete="off"><input id="ans" type="text" inputmode="decimal" spellcheck="false" placeholder="${L('輸入答案', 'Your answer')}" aria-label="answer">
        <button class="btn" type="submit">${L('送出', 'Check')}</button></form>
        <div class="keys">${keysFor(gr).map((k) => `<button type="button" class="key" data-k="${k}">${k === '-' ? '−' : k}</button>`).join('')}
        <span class="fmt">${gr <= 4 ? L('只要寫數字', 'just type the number') : gr <= 6 ? L('寫數字就好，也可以加單位', 'type the number; a unit is OK too') : L('可加單位（12 m/s）；科學記號 3×10^8 或 3e8', 'units OK (12 m/s); scientific notation 3×10^8 or 3e8')}</span></div>`}
    <div class="fb" aria-live="polite"></div>${q.hint && !quiz ? `<button class="link hintb">💡 ${L('提示', 'Hint')}</button>` : ''}
    <div class="sol" hidden></div>`;
  const fb = $('.fb', el), solEl = $('.sol', el);
  const showSol = () => {
    solEl.hidden = false;
    solEl.innerHTML = `<h3>📖 ${L('詳細解說', 'Step-by-step explanation')}</h3><ol>${q.sol.map((s) => `<li>${X(s)}</li>`).join('')}</ol>
      <p class="ansline">${L('答案', 'Answer')}：<b>${answerHTML(q)}</b></p>`;
    $('h3', solEl).onclick = () => solEl.classList.remove('fold');
  };
  const end = (ok, given) => {
    finished = true;
    el.querySelectorAll('input,.ch,.key,.ansrow button').forEach((b) => (b.disabled = true));
    if (opts) el.querySelectorAll('.ch').forEach((b) => { if (+b.dataset.i === a.correct) b.classList.add('right'); });
    if (!quiz) { record(q.u, ok); showSol(); if (ok) solEl.classList.add('fold'); }
    onDone?.(ok, given);
  };
  const judge = (given, btn) => {
    if (finished) return;
    const r = check(a, given);
    if (r.ok) { fb.className = 'fb ok'; fb.innerHTML = `✅ ${L(pick(['答對了！', '太棒了！', '完全正確！', '好厲害！']), pick(['Correct!', 'Great job!', 'Exactly right!', 'Nice work!']))}`; btn?.classList.add('right'); return end(true, given); }
    left--; btn?.classList.add('wrong'); if (btn) btn.disabled = true;
    if (left > 0 && !quiz) {
      fb.className = 'fb no';
      fb.innerHTML = `🤔 ${r.note ? X(r.note) : L('不太對，再想一次！', 'Not quite — try once more!')}${q.hint ? ` <span class="h">💡 ${X(q.hint)}</span>` : ''}`;
      $('#ans', el)?.select();
      return;
    }
    fb.className = 'fb no';
    fb.innerHTML = quiz ? '' : `❌ ${r.note ? X(r.note) + ' ' : ''}${L('沒關係，看看下面的解說。', 'That’s OK — read the explanation below.')}`;
    end(false, given);
  };
  if (opts) el.querySelectorAll('.ch').forEach((b) => (b.onclick = () => judge(+b.dataset.i, b)));
  else {
    const inp = $('#ans', el);
    $('.ansrow', el).onsubmit = (e) => { e.preventDefault(); if (inp.value.trim()) judge(inp.value); };
    el.querySelectorAll('.key').forEach((b) => (b.onclick = () => {
      const k = b.dataset.k, s = inp.selectionStart ?? inp.value.length;
      inp.value = inp.value.slice(0, s) + k + inp.value.slice(inp.selectionEnd ?? s); inp.focus(); inp.setSelectionRange(s + k.length, s + k.length);
    }));
    setTimeout(() => inp.focus({ preventScroll: true }), 30);
  }
  const hb = $('.hintb', el); if (hb) hb.onclick = () => { hb.remove(); fb.className = 'fb'; fb.innerHTML = `💡 ${X(q.hint)}`; };
}
const keysFor = (g) => (g <= 4 ? ['.'] : g <= 6 ? ['.', '/', '-'] : ['.', '-', '/', '^', '×10^']);
function answerHTML(q) {
  const a = q.ans;
  if (a.type === 'choice') return X(a.options[a.correct]);
  const u = a.unit ? ' ' + X(a.unit) : '';
  return String(a.text).replace(/-/g, '−').replace(/\*/g, '×').replace(/\^(\d+)/g, '<sup>$1</sup>') + u;
}

function practice(id, seed0) {
  const u = unitById(id); if (!u) return (location.hash = '#/');
  const g = u.grades[0];
  let streak = 0, right = 0, done = 0, q;
  const sim = u.sim && simById(u.sim);
  app.innerHTML = `<nav class="crumb"><a href="#/g/${g}">← ${gradeName(g)}</a></nav>
    <section class="phead"><h1>${X(u.name)}</h1><span class="tags">${subjTag(u.subj)}<span class="tag">${gradeRange(u.grades)}</span>${curTags(u.cur)}</span></section>
    <div class="score"><span id="sc"></span><span id="st"></span>${sim ? `<a class="link" href="#/sim/${sim.id}">${sim.icon} ${L('去做實驗', 'Try the simulation')}</a>` : ''}<a class="link" href="#/print/${u.id}">🖨️ ${L('列印學習單', 'Worksheet')}</a></div>
    <article class="card" id="card"></article><div class="next"><button class="btn big" id="next" hidden>${L('下一題', 'Next question')} →</button></div>`;
  const sc = () => { $('#sc').innerHTML = L(`本次答對 <b>${right}</b> / ${done}`, `This session: <b>${right}</b> / ${done}`); $('#st').innerHTML = streak >= 2 ? `🔥 ${L(`連續答對 ${streak} 題`, `${streak} in a row`)}` : ''; };
  const nextB = $('#next');
  const one = (seed) => {
    q = draw(u, seed); nextB.hidden = true;
    card(q, $('#card'), { onDone(ok) { done++; if (ok) { right++; streak++; } else streak = 0; sc(); nextB.hidden = false; nextB.focus({ preventScroll: true }); } });
    sc();
  };
  nextB.onclick = () => { one(newSeed()); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const key = (e) => { if (e.key === 'Enter' && !nextB.hidden && document.activeElement?.id !== 'ans') { e.preventDefault(); nextB.click(); } };
  document.addEventListener('keydown', key); cleanup = () => document.removeEventListener('keydown', key);
  one(seed0 ?? newSeed());
  relang = () => practice(id, q.seed);
}

function quiz(g) {
  const us = unitsFor(g); if (!us.length) return (location.hash = '#/g/' + g);
  const order = []; let pool = [];
  while (order.length < 10) { if (!pool.length) pool = us.slice().sort(() => Math.random() - 0.5); order.push(pool.pop()); }
  const qs = order.map((u) => draw(u, newSeed())), res = [];
  let k = 0, nextB;
  const quizShell = () => {
    app.innerHTML = `<nav class="crumb"><a href="#/g/${g}">← ${gradeName(g)}</a></nav>
      <section class="phead"><h1>🎯 ${L('綜合測驗', 'Mixed quiz')} · ${gradeName(g)}</h1></section>
      <div class="qprog" id="qp"></div><article class="card" id="card"></article><div class="next"><button class="btn big" id="next" hidden></button></div>`;
    nextB = $('#next');
    nextB.onclick = () => { if (++k < 10) { show(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else results(); };
  };
  const show = () => {
    const q = qs[k];
    $('#qp').innerHTML = qs.map((_, i) => `<i class="${i < k ? (res[i].ok ? 'ok' : 'no') : i === k ? 'now' : ''}"></i>`).join('') + `<span>${k + 1} / 10 · ${X(q.u.name)}</span>`;
    nextB.hidden = true;
    card(q, $('#card'), { tries: 1, quiz: true, onDone(ok, given) {
      res[k] = { ok, given }; record(q.u, ok, g);
      nextB.textContent = k < 9 ? L('下一題 →', 'Next →') : L('看成績 →', 'See results →'); nextB.hidden = false; nextB.focus({ preventScroll: true });
    } });
  };
  relang = () => { if (k >= 10) results(); else { quizShell(); show(); } };
  const results = () => {
    const n = res.filter((r) => r.ok).length;
    const msg = n === 10 ? L('滿分！太厲害了！🏆', 'Perfect score! 🏆') : n >= 8 ? L('很棒！再接再厲！🌟', 'Great work! 🌟') : n >= 5 ? L('不錯喔，看看錯的題目為什麼。💪', 'Good — check the ones you missed. 💪') : L('先看解說，再去做實驗、挑單元慢慢練。📚', 'Read the explanations, try the simulations, then practice unit by unit. 📚');
    app.innerHTML = `<nav class="crumb"><a href="#/g/${g}">← ${gradeName(g)}</a></nav>
      <section class="result"><div class="big-score">${n}<small>/10</small></div><p>${msg}</p>
      <div class="acts"><a class="btn big" href="#/quiz/${g}" id="again">${L('再考一次', 'Another quiz')}</a><a class="btn ghost" href="#/g/${g}">${L('回到年級頁', 'Back to the grade')}</a></div></section>
      <div class="review">${qs.map((q, i) => {
        const r = res[i], given = r.given == null ? '—' : q.ans.type === 'choice' ? X(q.ans.options[r.given]) : esc(r.given);
        return `<details class="rv ${r.ok ? 'ok' : 'no'}" ${r.ok ? '' : 'open'}><summary><b>${i + 1}.</b> ${r.ok ? '✅' : '❌'} ${X(q.u.name)}</summary>
          <div class="q">${X(q.q)}</div>${q.fig ? `<div class="figs">${q.fig}</div>` : ''}
          <p>${L('你的答案', 'Your answer')}：<b>${given}</b>　${L('正確答案', 'Correct answer')}：<b>${answerHTML(q)}</b></p>
          <ol class="steps">${q.sol.map((s) => `<li>${X(s)}</li>`).join('')}</ol></details>`;
      }).join('')}</div>`;
    $('#again').onclick = (e) => { e.preventDefault(); quiz(g); };
  };
  quizShell();
  show();
}

function print(what) {
  const g = what.match(/^g(\d+)$/)?.[1];
  const us = g ? unitsFor(+g) : [unitById(what)].filter(Boolean);
  if (!us.length) return (location.hash = '#/');
  const title = g ? gradeName(+g) : X(us[0].name);
  const qs = Array.from({ length: 20 }, (_, i) => draw(us[i % us.length], newSeed()));
  if (g) qs.sort((a, b) => us.indexOf(a.u) - us.indexOf(b.u));
  const shuf = (q) => rng(q.seed ^ 0x5bd1e995).shuffle(q.ans.options.map((o, j) => ({ o, j })));
  const qHTML = (q) => `<li class="pq"><div class="q">${X(q.q)}</div>${q.fig ? `<div class="figs">${q.fig}</div>` : ''}${q.ans.type === 'choice'
    ? `<div class="pch">${shuf(q).map((x, k) => `<span>(${'ABCDEF'[k]}) ${X(x.o)}</span>`).join('')}</div>` : '<div class="line"></div>'}</li>`;
  const key = (q) => { if (q.ans.type !== 'choice') return answerHTML(q); const k = shuf(q).findIndex((x) => x.j === q.ans.correct); return `(${'ABCDEF'[k]}) ${X(q.ans.options[q.ans.correct])}`; };
  app.innerHTML = `<nav class="crumb noprint"><a href="javascript:history.back()">← ${L('返回', 'Back')}</a>
      <button class="btn" onclick="window.print()">🖨️ ${L('列印', 'Print')}</button><button class="btn ghost" id="regen">🔄 ${L('換一批題目', 'New questions')}</button></nav>
    <section class="sheet"><h1>${L('自然科學習單', 'Science worksheet')} · ${title}</h1><p class="who">${L('姓名', 'Name')}：＿＿＿＿＿＿　${L('日期', 'Date')}：＿＿＿＿＿＿　${L('得分', 'Score')}：＿＿＿ / 20</p>
    <ol class="pqs">${qs.map(qHTML).join('')}</ol></section>
    <section class="sheet key"><h1>${L('解答', 'Answer key')} · ${title}</h1><ol class="keys-list">${qs.map((q) => `<li><b>${key(q)}</b><ol class="steps">${q.sol.map((s) => `<li>${X(s)}</li>`).join('')}</ol></li>`).join('')}</ol></section>`;
  $('#regen').onclick = () => print(what);
  relang = () => print(what);
}

// ---------- router ----------
function route() {
  cleanup?.(); cleanup = null; relang = null;
  const h = location.hash;
  let m;
  if ((m = h.match(/^#\/g\/(\d+)/))) grade(+m[1]);
  else if (h.startsWith('#/sims')) allSims();
  else if ((m = h.match(/^#\/sim\/(.+)/))) simPage(decodeURIComponent(m[1]));
  else if ((m = h.match(/^#\/p\/(.+)/))) practice(decodeURIComponent(m[1]));
  else if ((m = h.match(/^#\/quiz\/(\d+)/))) quiz(+m[1]);
  else if ((m = h.match(/^#\/print\/(.+)/))) print(decodeURIComponent(m[1]));
  else home();
  document.body.dataset.page = (h.match(/^#\/(\w+)/) || [, 'home'])[1];
}
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
header();
route();

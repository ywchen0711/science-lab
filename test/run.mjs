// Checks every simulation and every practice unit:  node test/run.mjs [file …]
//   (default: all of js/sims/g*.js and js/bank/g*.js; a file under js/sims is checked as sims, under js/bank as units)
// Simulations: metadata in both languages, observation questions, and the sim's own model checks (sim.checks), run headless.
// Units: draws 300 questions per unit and checks the text in both languages, that the stated answer passes the answer
// checker (also with its unit typed after it), that choices are distinct, that the questions vary, that every item of a
// concept bank is valid and gets drawn, and — when the unit has verify(vars) — that an independent recomputation agrees.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { rng } from '../js/util.js';
import { check } from '../js/check.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const list = (d) => readdirSync(path.join(root, d)).filter((f) => /^g.*\.js$/.test(f)).map((f) => path.join(root, d, f));
const files = process.argv.slice(2).length ? process.argv.slice(2).map((f) => path.resolve(f)) : [...list('js/sims'), ...list('js/bank')];
const strip = (s) => String(s).replace(/<[^>]*>/g, '');
const bad = (s) => typeof s !== 'string' || !s.trim() || /undefined|NaN|\[object|Infinity|null/.test(strip(s));
const txt = (x) => (typeof x === 'string' ? [x, x] : x && typeof x === 'object' ? [x.zh, x.en] : [undefined, undefined]);
const zhIn = (s) => /[㐀-鿿]/.test(strip(s));
const SUBJ = ['phys', 'chem', 'bio', 'earth'];
let errs = 0, nSims = 0, nUnits = 0, nChecks = 0, nDraws = 0;
const perGrade = {}, simGrade = {};
const fail = (id, where, msg) => { if (errs++ < 80) console.log(`✗ ${id} ${where}: ${msg}`); };
const bil = (id, where, x) => {
  const [a, b] = txt(x);
  if (bad(a) || bad(b)) return fail(id, where, 'missing/bad text ' + JSON.stringify(x)?.slice(0, 160)), false;
  if (typeof x === 'object' && zhIn(b)) return fail(id, where, 'Chinese in English text: ' + strip(b).slice(0, 100)), false;
  return true;
};
const grOk = (g) => Array.isArray(g) && g.length === 2 && g[0] >= 1 && g[1] <= 12 && g[0] <= g[1];

const simIds = new Set(), unitIds = new Set(), unitSims = [];
for (const f of files) {
  const isSim = /[\\/]sims[\\/]/.test(f);
  const arr = (await import(pathToFileURL(f).href)).default;
  for (const x of arr) {
    const id = x.id;
    const ids = isSim ? simIds : unitIds;
    if (!id || ids.has(id)) fail(id, '-', 'missing or duplicate id'); ids.add(id);
    if (!grOk(x.grades)) fail(id, '-', 'bad grades ' + JSON.stringify(x.grades));
    if (!SUBJ.includes(x.subj)) fail(id, '-', 'bad subj ' + x.subj);
    bil(id, 'name', x.name);
    for (const [c, v] of Object.entries(x.cur || {})) { if (!['tw', 'us'].includes(c)) fail(id, 'cur', 'unknown curriculum ' + c); if (c === 'tw' && typeof v !== 'object') fail(id, 'cur.tw', 'must be T(zh, en)'); bil(id, 'cur.' + c, v); }
    if (isSim) checkSim(x); else checkUnit(x);
  }
}
for (const [id, s] of unitSims) if (!simIds.has(s) && files.some((f) => /sims/.test(f))) fail(id, 'sim', `links to unknown sim "${s}"`);

function checkSim(s) {
  nSims++;
  const id = s.id;
  for (let g = s.grades?.[0]; g <= s.grades?.[1]; g++) simGrade[g] = (simGrade[g] || 0) + 1;
  if (!s.icon) fail(id, '-', 'no icon');
  bil(id, 'intro', s.intro);
  if (typeof s.mount !== 'function') fail(id, '-', 'no mount()');
  if (!Array.isArray(s.observe) || s.observe.length < 3) fail(id, 'observe', 'needs 3+ observation questions');
  (s.observe || []).forEach((o, i) => {
    bil(id, `observe[${i}].try`, o.try); bil(id, `observe[${i}].ask`, o.ask); bil(id, `observe[${i}].why`, o.why);
    if (!Array.isArray(o.options) || o.options.length < 2 || o.options.length > 5) fail(id, `observe[${i}]`, 'needs 2–5 options');
    else {
      o.options.forEach((op, j) => bil(id, `observe[${i}].options[${j}]`, op));
      for (const k of [0, 1]) if (new Set(o.options.map((op) => strip(txt(op)[k]))).size !== o.options.length) fail(id, `observe[${i}]`, 'duplicate options');
    }
  });
  if (typeof s.checks !== 'function') return fail(id, 'checks', 'no checks(model, ok)');
  let n = 0;
  try { s.checks(s.model, (cond, msg) => { n++; nChecks++; if (!cond) fail(id, 'model', msg || 'check failed'); }); }
  catch (e) { fail(id, 'model', 'checks() throws ' + e.stack); }
  if (n < 3) fail(id, 'model', `only ${n} model checks (need 3+)`);
}

function checkUnit(u) {
  nUnits++;
  const id = u.id;
  for (let g = u.grades?.[0]; g <= u.grades?.[1]; g++) perGrade[g] = (perGrade[g] || 0) + 1;
  if (u.sim) unitSims.push([id, u.sim]);
  if (typeof u.gen !== 'function') return fail(id, '-', 'no gen()');
  if (u.bank) {
    if (u.bank.length < (u.mixed ? 5 : 8)) fail(id, 'bank', `only ${u.bank.length} items (need ${u.mixed ? 5 : 8}+)`);
    u.bank.forEach((it, i) => {
      bil(id, `bank[${i}].q`, it.q);
      if (!Array.isArray(it.options) || it.options.length < 2 || it.options.length > 6) fail(id, `bank[${i}]`, 'needs 2–6 options');
      else { it.options.forEach((o, j) => bil(id, `bank[${i}].options[${j}]`, o)); for (const k of [0, 1]) if (new Set(it.options.map((o) => strip(txt(o)[k]))).size !== it.options.length) fail(id, `bank[${i}]`, 'duplicate options'); }
      if (!Array.isArray(it.why) || !it.why.length) fail(id, `bank[${i}]`, 'needs why: [T, …]'); else it.why.forEach((w, j) => bil(id, `bank[${i}].why[${j}]`, w));
    });
  }
  const seen = new Set(), seenQ = new Set();
  for (let k = 1; k <= 300; k++) {
    const seed = k * 7919 + 13;
    let q;
    nDraws++;
    try { q = u.gen(rng(seed)); } catch (e) { fail(id, 'seed ' + seed, 'throws ' + e.message); continue; }
    if (!bil(id, 'seed ' + seed + ' q', q.q)) continue;
    seenQ.add(strip(txt(q.q)[1]));
    seen.add(txt(q.q)[1] + JSON.stringify(q.ans) + (q.fig || ''));
    if (q.fig != null && typeof q.fig !== 'string') fail(id, 'seed ' + seed, 'fig must be a string');
    if (!Array.isArray(q.sol) || !q.sol.length) fail(id, 'seed ' + seed, 'needs sol steps');
    else for (const st of q.sol) if (!bil(id, 'seed ' + seed + ' sol', st)) break;
    if (q.hint != null) bil(id, 'seed ' + seed + ' hint', q.hint);
    const a = q.ans;
    if (!a) { fail(id, 'seed ' + seed, 'no answer'); continue; }
    if (a.type === 'choice') {
      if (!Array.isArray(a.options) || a.options.length < 2 || a.options.length > 6) fail(id, 'seed ' + seed, 'choice needs 2–6 options');
      else {
        for (const kk of [0, 1]) if (new Set(a.options.map((o) => strip(txt(o)[kk]).trim())).size !== a.options.length) { fail(id, 'seed ' + seed, 'duplicate options ' + JSON.stringify(a.options).slice(0, 200)); break; }
        a.options.forEach((o) => bil(id, 'seed ' + seed + ' option', o));
      }
      if (a.correct !== 0) fail(id, 'seed ' + seed, 'correct must be 0');
    } else if (a.type === 'num') {
      if (!Number.isFinite(a.v)) fail(id, 'seed ' + seed, 'answer not finite ' + JSON.stringify(a));
      else if (bad(a.text) || !check(a, a.text).ok) fail(id, 'seed ' + seed, `answer text "${a.text}" fails the checker for ${a.v}`);
      else if (a.unit) {
        bil(id, 'unit', a.unit);
        for (const t of txt(a.unit)) if (!check(a, `${a.text} ${strip(t)}`).ok) fail(id, 'seed ' + seed, `"${a.text} ${strip(t)}" (with unit) fails the checker`);
      }
      if (typeof u.verify === 'function') {
        if (!q.vars) fail(id, 'seed ' + seed, 'verify() given but gen returned no vars');
        else { const w = u.verify(q.vars); if (!check(a, String(w)).ok && !(Math.abs(w - a.v) <= (a.tol ?? 1e-6 * Math.max(1, Math.abs(a.v))))) fail(id, 'seed ' + seed, `verify() says ${w}, answer is ${a.v}`); }
      }
    } else if (a.type === 'set' || a.type === 'pair') {
      if (a.v.some((v) => !Number.isFinite(v)) || !check(a, a.text).ok) fail(id, 'seed ' + seed, 'bad answer ' + JSON.stringify(a));
    } else fail(id, 'seed ' + seed, 'unknown answer type ' + a.type);
  }
  if (u.bank && !u.mixed) {
    const qs = new Set(u.bank.map((it) => strip(txt(it.q)[1])));
    const missed = [...qs].filter((x) => !seenQ.has(x));
    if (missed.length && u.bank.length <= 40) fail(id, 'bank', `${missed.length} bank items never drawn in 300 draws`);
  } else if (seen.size < 12) fail(id, '-', `only ${seen.size} different questions in 300 draws`);
}

console.log(`${nSims} simulations (${nChecks} model checks), ${nUnits} units (${nDraws} draws), ${errs} problems`);
console.log('sims per grade  ' + Object.entries(simGrade).sort((a, b) => a[0] - b[0]).map(([k, v]) => `G${k}:${v}`).join(' '));
console.log('units per grade ' + Object.entries(perGrade).sort((a, b) => a[0] - b[0]).map(([k, v]) => `G${k}:${v}`).join(' '));
process.exit(errs ? 1 : 0);

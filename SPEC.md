# Science Lab content spec (for whoever writes js/sims/gXX.js and js/bank/gXX.js)

自然科學實驗室 Science Lab: interactive science for grades 1–12 in Traditional Chinese (繁體, Taiwan usage) and English,
following the Taiwan 108 課綱 自然科學領域 and the US NGSS. Static site, vanilla ES modules, no build step, no libraries.

Two kinds of content, one pair of files per grade band:

| band | sims file | units file |
|---|---|---|
| G1–2 | js/sims/g12.js | js/bank/g12.js |
| G3–4 | js/sims/g34.js | js/bank/g34.js |
| G5–6 | js/sims/g56.js | js/bank/g56.js |
| G7–9 physics & chemistry (理化) | js/sims/g79p.js | js/bank/g79p.js |
| G7–9 life & earth science (生物・地科) | js/sims/g79l.js | js/bank/g79l.js |
| G10–12 physics | js/sims/g1012p.js | js/bank/g1012p.js |
| G10–12 chemistry, biology (and earth) | js/sims/g1012c.js | js/bank/g1012c.js |

**Reference example: js/sims/g56.js (the pendulum) and js/bank/g56.js (two units). Read them first, plus js/kit.js
and js/util.js.** Each file is an ES module `export default [ … ]`, importing only from '../util.js' (and, for sims, nothing
else — the kit is passed to mount). No other dependencies.

## A simulation
```js
{
  id: 'pendulum',                 // unique across all sims, short kebab-case, no grade prefix
  grades: [5, 6],                 // grades whose page lists it (1–12, inside your band; G7–9 sims may be [7, 9], [8, 8] …)
  subj: 'phys',                   // 'phys' | 'chem' | 'bio' | 'earth'
  icon: '⏱️',                      // one emoji
  name: T('單擺', 'The pendulum'),
  intro: T('…', '…'),             // 2–4 friendly sentences: what it is, what you can change, what to look for
  cur: { tw: T('國小高年級 擺的規律', 'Upper elementary · pendulums'), us: 'NGSS 3-PS2-2' },
  model: { …pure functions… },    // the science: formulas / step functions, NO DOM. mount() must use these.
  checks(m, ok) { ok(cond, 'message'); … },   // ≥ 4 headless sanity checks of the model (see below)
  mount(k) { … },                 // builds the picture + controls with the kit
  observe: [ { try, ask, options, why }, … ], // ≥ 3 (better 4) guided questions
}
```
- `cur.tw` is `T(zh, en)` (a Taiwan stage + unit name: 國小低年級 / 國小中年級 / 國小高年級 / 國中 理化 / 國中 生物 /
  國中 地球科學 / 高中 物理 / 高中 化學 / 高中 生物 / 高中 地球科學 + the topic). `cur.us` is a plain string: an NGSS
  performance expectation code **only if you are sure it matches** (e.g. K-PS2-1, 1-LS1-1, 2-PS1-1, 3-PS2-3, 3-LS1-1,
  4-PS4-2, 4-ESS1-1, 5-PS1-1, 5-LS2-1, 5-ESS1-2, MS-PS1-2, MS-PS2-2, MS-LS1-1, MS-LS3-2, MS-ESS2-3, HS-PS2-1, HS-PS4-1,
  HS-LS3-3, HS-LS4-4 …); otherwise a topic label like 'NGSS MS · Forces and motion' or omit `us`.
- **model / checks**: put every formula in `model` and make `mount` call it, so the test exercises the real code.
  `checks(m, ok)` runs in node (no DOM): e.g. energy conserved in a frictionless step loop, projectile range = v²sin2θ/g,
  series bulbs dimmer than parallel, Punnett ratios sum to 1 and Aa×Aa gives 1:2:1, pH of 0.01 M HCl = 2, half-life halves
  the count, Snell's law angles, density → sinks iff ρ > 1 g/cm³, population model never negative, balanced equations
  conserve atoms. Use real formulas and SI units (and Taiwan terms 牛頓 N, 焦耳 J, 瓦特 W, 歐姆 Ω, 伏特 V, 安培 A,
  公尺 m, 公斤 kg, 公克 g, 秒 s, 莫耳 mol, 帕 Pa, 克耳文 K, 攝氏 °C). Physics must be correct.
- **observe**: `try` = what to do in the sim ("把繩長調成 2 公尺…"); `ask` = "what did you notice?" question;
  `options` = 2–5 answers, **right one first** (the app shuffles), wrong ones are real misconceptions; `why` = the
  explanation (1–3 sentences). All `T(zh, en)`. The question must be answerable by doing the `try` in *your* sim.

### mount(k) — the kit (js/kit.js)
```js
mount(k) {
  const v = k.canvas(640, 380), { ctx, W, H } = v;   // logical size; it scales to the page width (phone ≈ 330 px wide!)
  let L = 1;
  k.slider({ label: T('繩長', 'String length'), min: 0.2, max: 2.2, step: 0.05, value: L, unit: T('公尺', 'm'), onInput: (x) => { L = x; } });
  k.seg({ label: T('在哪裡？', 'Where?'), value: 'earth', options: [{ v: 'earth', label: T('地球', 'Earth') }, …], onChange: (x) => … });
  k.toggle({ label: T('…', '…'), value: false, onChange: (on) => … });
  k.buttons([{ label: T('▶ 開始', '▶ Start'), primary: true, on: () => … }, { label: T('重來', 'Reset'), on: reset }]);
  const ro = k.readout();            // ro.set(html) — live numbers with units
  k.pointer(v.cv, { down(p) {…}, move(p, isDown) {…}, up(p) {…} });   // p in logical canvas coords (drag things!)
  k.loop((dt, t) => { const c = k.colors(); ctx.clearRect(0, 0, W, H); … draw … });   // animation; or draw on change
}
```
- Controls go in `k.panel` automatically (right column on desktop, below the canvas on a phone). Labels/units are
  `T(zh, en)` (or plain strings for symbols like '°', 'm/s'). Text drawn on the canvas uses `k.L(zh, en)`.
- For a static picture (no animation), draw in a `redraw()` function, call it after every change and set `v.redraw = redraw`
  (the canvas is cleared when resized). Or just use `k.loop` — it is cheap.
- Colors: call `k.colors()` inside the draw function (dark mode!) and use `c.ink` for text/lines, `c.muted`, `c.line`
  (grid), `c.soft`, `c.card`, `c.bg`, `c.acc` (teal accent), `c.acc2` (blue), `c.ok` (green), `c.no` (red). Fixed nature
  colors (sky, water, grass, sun) are fine, but text must stay readable in both themes (`c.dark` tells you which).
- Helpers on k: `k.text(ctx, s, x, y, { color, size, align, base, bold })`, `k.arrow(ctx, x1, y1, x2, y2, color, w)`,
  `k.circle(ctx, x, y, r, fill, stroke)`, `k.rrect(ctx, x, y, w, h, r, fill, stroke)`, `k.line(ctx, x1, y1, x2, y2, color, w, dash)`,
  `k.axes(ctx, box, { xmin, xmax, ymin, ymax, xlabel, ylabel, c, xdp, ydp })` → map `{X(x), Y(y)}`, `k.plotLine(ctx, map, pts, color)`,
  `k.fmt(x, dp)`.
- **Readable on a phone**: canvas logical width 560–700; text on canvas ≥ 15 px (labels 16–20 px, big numbers bigger).
  Big drag targets (≥ 30 px radius). Keep ≤ 6 controls. Show live numbers with units in the readout.
- Make it lively and good-looking: real-looking objects (beakers with liquid, a sun with rays, plants, particles that
  move, arrows for forces), smooth animation, immediate feedback when a control moves. Should look like PhET-lite.
- Every number shown must be physically right (a readout of 2.01 s for T = 2π√(1/9.8)).
- No `setInterval`/global listeners: use `k.loop`, `k.on(target, event, fn)` and `k.onDestroy(fn)` so everything stops
  when the page changes. No `localStorage`. No `alert`. No external images; draw everything (emoji via fillText is OK).

## A practice unit
```js
{
  id: 'g56-dissolve-mass',        // unique, starts with g<first grade>-
  grades: [5, 6], subj: 'chem',
  name: T('溶解前後的重量', 'Mass before and after dissolving'),
  cur: { tw: T('國小高年級 水溶液', 'Upper elementary · solutions'), us: 'NGSS 5-PS1-2' },
  sim: 'dissolving',              // optional: id of the related simulation (shows a link both ways)
  verify: (vars) => number,       // optional but REQUIRED for formula units: recompute the answer independently
  gen(r) { return { q, fig?, ans, sol, hint?, vars? }; },
}
```
- `gen(r)` gets a seeded random source (`r()`, `r.int(lo, hi)`, `r.pick(arr)`, `r.shuffle(arr)`, `r.chance(p)`).
- `q`: `T(zh, en)` question (HTML ok: `<sub>`, `<sup>`, `<b>`; util's `frac`, `num`, `sci`). English must contain no Chinese.
- `fig` (optional): an SVG string (language-neutral; use `currentColor` / the CSS classes f-line, f-soft, f-txt, f-acc,
  f-accfill, f-dot) — circuit diagrams, a Punnett square, a graph…
- `ans`, one of (from util.js):
  - `ansChoice([right, wrong1, wrong2, wrong3])` — right first; options `T(zh, en)` or strings; all different; wrong ones
    = mistakes kids really make (forgot to convert units, used the wrong formula, flipped the ratio…).
  - `ansNum(v)` — an exact number (integers, simple decimals).
  - `ansQty(v, dp, unit)` — a measured quantity rounded to `dp` decimals, with a unit `T('公尺/秒', 'm/s')` or 'm/s'.
    The question must say how to round ("四捨五入到小數第一位 / round to one decimal place") unless the value is exact.
    The checker accepts the unit typed after the number, scientific notation (3e8, 3×10^8), and ±1 % or ±half a unit
    in the last place.
- `sol`: 2–6 `T(zh, en)` steps — a real explanation with the actual numbers: the idea, the formula, substitution with
  units, the result, and why it makes sense. Written for a child of that grade.
- `hint` (optional): one-line nudge.
- `vars` + unit `verify(vars)`: for every formula unit, return the raw inputs in `vars` and write `verify` as an
  independent recomputation (e.g. from the raw quantities in SI, a different algebra path); the test compares it with
  `ans.v`.
- **Concept units** use a reviewed bank: put `bank: [{ q, options: [right, …wrong], why: [T, …], fig? }, …]` (≥ 8 items,
  better 10–14) on the unit and `gen(r) { return pickItem(r, this.bank); }` (pickItem from util). A unit may mix:
  `gen(r) { return r.chance(0.5) ? pickItem(r, this.bank) : formulaQuestion(r); }` — then also set `mixed: true`
  (mixed units need ≥ 5 bank items).
- Generated units should have ≥ 3 templates (direct computation, word problem with names/objects, reverse/find-the-input,
  compare/choose) and varied numbers. Names: `NAMES` in util ([zh, en] pairs). Keep numbers realistic (a car at 20 m/s,
  not 3000 m/s; a 2 kg cart, not 0.0001 kg) and answers reasonably nice.
- **Correctness first.** Never ship a question whose right answer is wrong or arguable. Avoid trick wording. Concept
  options must be unambiguous (no "both could be right").

## Language
- Traditional Chinese with Taiwan terms: 公分、公尺、公斤、公克、公升、毫升、秒、牛頓、焦耳、瓦特、伏特、安培、歐姆、莫耳、
  密度、浮力、速率、速度、加速度、電流、電壓、電阻、串聯、並聯、導體、絕緣體、酸鹼指示劑、石蕊、廣用試紙、細胞、
  顯性、隱性、基因型、表現型、板塊、震央、天擇、半衰期、滴定、反應速率、化學平衡、轉錄、轉譯…
  Use 「」 quotes in Chinese. Not simplified characters (not 电、动、实验 in simplified form).
- English: plain, friendly, US spelling. Every string exists in both languages.

## Tests
- `node test/run.mjs js/sims/<yours>.js js/bank/<yours>.js` must print `0 problems` (the "links to unknown sim" check
  needs the sims file in the same run). It runs `checks`, validates observe/bank items, draws 300 questions per unit and
  verifies answers (and `verify`).
- Browser: a server for C:\ScienceLab is (or will be) running on your assigned port (start your own:
  `python -m http.server <port>` from C:\ScienceLab, in the background; stop it by its PID when done).
  - `powershell -ExecutionPolicy Bypass -File C:\ScienceLab\.probe\probe.ps1 -Port <port> -File g12 -Profile <yourname>`
    mounts every sim in your file in both languages, moves every slider, clicks every button, pokes the canvas and
    reports errors, NaN/undefined in the UI, and Chinese left in the English UI. Must say `0 errors`.
  - Screenshots: `python C:\ScienceLab\.probe\shot.py --port <port> --hash sim/<id> --out x.png [--w 390 --h 1000] [--lang en]
    [--js "...click..."] [--theme dark]` (real-time CDP screenshots; `--w` < 500 emulates a phone). Older alternative
    (call it from the **PowerShell tool** with `&`, not from bash):
    `& C:\ScienceLab\.probe\shot.ps1 -Port <port> -Hash "#/sim/<id>" -Out <scratch>\x.png` (add `-W 390 -H 1300` for a
    phone, `-Lang en` for English). LOOK at them with Read: is it clear, pretty, readable on the phone?

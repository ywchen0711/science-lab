// Simulations for grades 7–9, physics & chemistry (國中 理化). Format: see SPEC.md.
import { T } from '../util.js';

const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const emo = (k, ctx, e, x, y, size) => k.text(ctx, e, x, y, { size, align: 'center', font: EMOJI });
const g = 9.8;

// ---------------- density & buoyancy ----------------
const MATS = [
  { v: 'wood', zh: '木頭', en: 'wood', rho: 0.6, col: '#c8935a' },
  { v: 'ice', zh: '冰', en: 'ice', rho: 0.92, col: '#d6f0ff' },
  { v: 'al', zh: '鋁', en: 'aluminum', rho: 2.7, col: '#b8c0c8' },
  { v: 'iron', zh: '鐵', en: 'iron', rho: 7.9, col: '#6d7278' },
];
const LIQS = [
  { v: 'alcohol', zh: '酒精', en: 'alcohol', rho: 0.79, col: 'rgba(230,230,255,0.45)' },
  { v: 'water', zh: '水', en: 'water', rho: 1.0, col: 'rgba(80,160,235,0.4)' },
  { v: 'salt', zh: '濃鹽水', en: 'strong salt water', rho: 1.2, col: 'rgba(120,190,235,0.55)' },
];
const buoy = {
  MATS, LIQS, g,
  // masses in g, volumes in cm³, forces in gw (公克重) — 1 gw = 0.0098 N
  floats: (rhoO, rhoL) => rhoO < rhoL,
  // lowered into the liquid so that `depth` (0–1) of its volume would be under; returns the forces
  forces(rhoO, V, rhoL, depth) {
    const W = rhoO * V, vFloat = W / rhoL, vSub = Math.min(depth * V, vFloat);
    const B = rhoL * vSub;
    return { W, B, vSub, scale: Math.max(0, W - B), floating: depth * V >= vFloat };
  },
  toN: (gw) => (gw / 1000) * g,
};

// ---------------- motion ----------------
const motion = {
  x: (x0, v0, a, t) => x0 + v0 * t + 0.5 * a * t * t,
  v: (v0, a, t) => v0 + a * t,
};

// ---------------- Newton's cart ----------------
const cart = {
  g,
  // one time step; F applied force (N), m (kg), mu friction coefficient; returns new state and the forces
  step({ x, v }, F, m, mu, dt) {
    const fmax = mu * m * g;
    let fr;
    if (Math.abs(v) < 1e-6) fr = Math.abs(F) <= fmax ? -F : -Math.sign(F) * fmax;   // static friction holds it, or kinetic friction once it slides
    else fr = -Math.sign(v) * fmax;
    let a = (F + fr) / m, nv = v + a * dt;
    if (Math.abs(v) > 1e-6 && Math.sign(nv) !== Math.sign(v) && Math.abs(F) <= fmax) { nv = 0; a = -v / dt; }   // friction stops it, never pushes it backward
    return { x: x + ((v + nv) / 2) * dt, v: Math.abs(nv) < 1e-9 ? 0 : nv, a, fr, net: F + fr };
  },
};

// ---------------- heat ----------------
const SUBS = [
  { v: 'water', zh: '水', en: 'water', c: 4.18, col: '#3b8fe0' },
  { v: 'oil', zh: '沙拉油', en: 'cooking oil', c: 2.0, col: '#e0a92a' },
  { v: 'al', zh: '鋁', en: 'aluminum', c: 0.9, col: '#9aa4ad' },
  { v: 'iron', zh: '鐵', en: 'iron', c: 0.45, col: '#6d7278' },
];
const heat = {
  SUBS,
  Q: (m, c, dT) => m * c * dT,                                      // J, m in g, c in J/(g·°C)
  mix: (m1, T1, m2, T2, c1 = 4.18, c2 = 4.18) => (m1 * c1 * T1 + m2 * c2 * T2) / (m1 * c1 + m2 * c2),
  warm: (T0, P, t, m, c) => T0 + (P * t) / (m * c),
};

// ---------------- pH ----------------
const SOLNS = [
  { v: 'hcl', zh: '稀鹽酸 0.1 M', en: 'dilute HCl 0.1 M', pH: 1.0 },
  { v: 'lemon', zh: '檸檬汁', en: 'lemon juice', pH: 2.2 },
  { v: 'vinegar', zh: '白醋', en: 'vinegar', pH: 2.9 },
  { v: 'water', zh: '純水', en: 'pure water', pH: 7.0 },
  { v: 'soda', zh: '小蘇打水', en: 'baking soda water', pH: 8.3 },
  { v: 'soap', zh: '肥皂水', en: 'soapy water', pH: 10.0 },
  { v: 'ammonia', zh: '氨水', en: 'ammonia water', pH: 11.5 },
  { v: 'naoh', zh: '稀氫氧化鈉 0.1 M', en: 'dilute NaOH 0.1 M', pH: 13.0 },
];
const UNIV = ['#d7191c', '#e8412b', '#f46d43', '#fb9a3a', '#fdc040', '#fee55a', '#c7e35a', '#66bd63', '#3fa48c', '#2c8fb8', '#3366cc', '#4b3fa8', '#6a2c9a', '#7b1f87', '#86157a'];
const ph = {
  SOLNS,
  // strong acid (Ca, Va mL) + strong base (Cb, Vb mL) at 25 °C
  mixPH(Ca, Va, Cb, Vb) {
    const nH = Ca * Va, nOH = Cb * Vb, V = Va + Vb;
    if (Math.abs(nH - nOH) < 1e-12) return 7;
    if (nH > nOH) return -Math.log10((nH - nOH) / V);
    return 14 + Math.log10((nOH - nH) / V);
  },
  litmus: (p) => (p < 4.5 ? 'red' : p > 8.3 ? 'blue' : 'purple'),
  phenol: (p) => (p < 8.2 ? 'colorless' : 'pink'),
  btb: (p) => (p < 6.0 ? 'yellow' : p > 7.6 ? 'blue' : 'green'),
  univ: (p) => UNIV[Math.max(0, Math.min(14, Math.round(p)))],
  kind: (p) => (p < 6.95 ? 'acid' : p > 7.05 ? 'base' : 'neutral'),
};

// ---------------- balancing equations ----------------
function parseFormula(f) {
  const re = /([A-Z][a-z]?)(\d*)|\(|\)(\d*)/g, stack = [{}];
  let m;
  while ((m = re.exec(f))) {
    if (m[0] === '(') stack.push({});
    else if (m[0][0] === ')') { const top = stack.pop(), n = +(m[3] || 1), cur = stack[stack.length - 1]; for (const [el, c] of Object.entries(top)) cur[el] = (cur[el] || 0) + c * n; }
    else { const cur = stack[stack.length - 1]; cur[m[1]] = (cur[m[1]] || 0) + +(m[2] || 1); }
  }
  return stack[0];
}
const EQS = [
  { L: ['H2', 'O2'], R: ['H2O'], ans: [2, 1, 2] },
  { L: ['N2', 'H2'], R: ['NH3'], ans: [1, 3, 2] },
  { L: ['Na', 'Cl2'], R: ['NaCl'], ans: [2, 1, 2] },
  { L: ['Cu', 'O2'], R: ['CuO'], ans: [2, 1, 2] },
  { L: ['CH4', 'O2'], R: ['CO2', 'H2O'], ans: [1, 2, 1, 2] },
  { L: ['Mg', 'HCl'], R: ['MgCl2', 'H2'], ans: [1, 2, 1, 1] },
  { L: ['H2O2'], R: ['H2O', 'O2'], ans: [2, 2, 1] },
  { L: ['Fe', 'O2'], R: ['Fe2O3'], ans: [4, 3, 2] },
  { L: ['Al', 'O2'], R: ['Al2O3'], ans: [4, 3, 2] },
  { L: ['KClO3'], R: ['KCl', 'O2'], ans: [2, 2, 3] },
  { L: ['NaOH', 'H2SO4'], R: ['Na2SO4', 'H2O'], ans: [2, 1, 1, 2] },
  { L: ['C3H8', 'O2'], R: ['CO2', 'H2O'], ans: [1, 5, 3, 4] },
  { L: ['C6H12O6', 'O2'], R: ['CO2', 'H2O'], ans: [1, 6, 6, 6] },
  { L: ['Ca(OH)2', 'HCl'], R: ['CaCl2', 'H2O'], ans: [1, 2, 1, 2] },
];
const gcdA = (a) => a.reduce((x, y) => { while (y) [x, y] = [y, x % y]; return x; });
const eqn = {
  EQS, parseFormula,
  count(eq, co) {
    const side = (list, cs) => { const o = {}; list.forEach((f, i) => { for (const [el, n] of Object.entries(parseFormula(f))) o[el] = (o[el] || 0) + n * cs[i]; }); return o; };
    const l = side(eq.L, co.slice(0, eq.L.length)), r = side(eq.R, co.slice(eq.L.length));
    const els = [...new Set([...Object.keys(l), ...Object.keys(r)])];
    return { els, l, r, balanced: els.every((e) => (l[e] || 0) === (r[e] || 0)) };
  },
  lowest: (co) => gcdA(co) === 1,
};

// ---------------- electromagnet ----------------
const emag = {
  R: 2,             // ohms of the coil wire (toy value)
  current: (cells) => (cells * 1.5) / 2,
  // relative field strength ∝ turns × current, about 200× stronger with a soft-iron core (toy value; real cores saturate)
  strength: (N, I, core) => N * I * (core ? 200 : 1) / 1000,
  clips: (s) => Math.min(24, Math.floor(s * 0.8)),
  // with the battery the normal way, current goes around so that the right end is N (right-hand rule)
  northEnd: (reversed) => (reversed ? 'left' : 'right'),
};

const fmtSub = (f) => f.replace(/(\d+)/g, '<sub>$1</sub>');

export default [
  {
    id: 'density-buoyancy', grades: [7, 9], subj: 'phys', icon: '⚓',
    name: T('密度與浮力', 'Density and buoyancy'),
    intro: T('把物體掛在彈簧秤上，慢慢放進液體裡，秤的讀數會變小——因為液體往上推，這就是浮力。阿基米德發現：浮力等於物體排開的液體重量。換不同的材料和液體，看看什麼時候會浮起來。',
      'Hang a block from a spring scale and lower it into a liquid: the reading drops because the liquid pushes up — that push is buoyancy. Archimedes found that the buoyant force equals the weight of the liquid the object pushes aside. Try different materials and liquids and find out when things float.'),
    cur: { tw: T('國中 理化 密度與浮力', 'Junior high physical science · density and buoyancy'), us: 'NGSS MS-PS1-2' },
    model: buoy,
    checks(m, ok) {
      const iron = m.forces(7.9, 100, 1.0, 1);
      ok(Math.abs(iron.W - 790) < 1e-9 && Math.abs(iron.B - 100) < 1e-9 && Math.abs(iron.scale - 690) < 1e-9, '100 cm³ iron in water: 790 gw − 100 gw = 690 gw');
      const wood = m.forces(0.6, 200, 1.0, 1);
      ok(wood.floating && Math.abs(wood.vSub - 120) < 1e-9 && wood.scale === 0 && Math.abs(wood.B - wood.W) < 1e-9, 'floating wood: buoyancy = weight, 60 % under water');
      ok(!m.floats(1.0, 0.79) && m.floats(0.92, 1.0) && !m.floats(0.92, 0.79), 'ice floats in water but sinks in alcohol');
      ok(m.forces(2.7, 100, 1.2, 1).B > m.forces(2.7, 100, 1.0, 1).B, 'denser liquid → more buoyancy');
      ok(Math.abs(m.forces(2.7, 100, 1.0, 0.5).B - 50) < 1e-9, 'half under → half the buoyancy');
      ok(Math.abs(m.toN(1000) - 9.8) < 1e-9, '1000 gw = 9.8 N');
    },
    mount(k) {
      const m = buoy, v = k.canvas(640, 400), { ctx, W, H } = v;
      let mat = MATS[3], liq = LIQS[1], V = 125, depth = 0, cut = false, yDrop = 0;
      k.seg({ label: T('材料', 'Material'), value: 'iron', options: MATS.map((x) => ({ v: x.v, label: T(`${x.zh} ${x.rho}`, `${x.en} ${x.rho}`) })), onChange: (x) => { mat = MATS.find((y) => y.v === x); cut = false; } });
      k.seg({ label: T('液體（密度 g/cm³）', 'Liquid (density g/cm³)'), value: 'water', options: LIQS.map((x) => ({ v: x.v, label: T(`${x.zh} ${x.rho}`, `${x.en} ${x.rho}`) })), onChange: (x) => { liq = LIQS.find((y) => y.v === x); cut = false; } });
      k.slider({ label: T('體積', 'Volume'), min: 27, max: 343, step: 1, value: V, unit: 'cm³', onInput: (x) => { V = x; cut = false; } });
      const dS = k.slider({ label: T('放進液體的深度', 'How far it is lowered'), min: 0, max: 100, step: 1, value: 0, unit: '%', onInput: (x) => { depth = x / 100; cut = false; } });
      k.buttons([{ label: T('✂️ 剪斷繩子', '✂️ Cut the string'), primary: true, on: () => { cut = true; yDrop = 0; } }, { label: T('↺ 掛回去', '↺ Hang it back'), on: () => { cut = false; dS.set(0); } }]);
      const ro = k.readout();
      const tank = { x: 200, y: 200, w: 260, h: 180 }, surf = 230;
      k.loop((dt) => {
        const c = k.colors(), side = Math.cbrt(V) * 7, f = m.forces(mat.rho, V, liq.rho, depth);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = liq.col; ctx.fillRect(tank.x, surf, tank.w, tank.y + tank.h - surf);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tank.x, tank.y); ctx.lineTo(tank.x, tank.y + tank.h); ctx.lineTo(tank.x + tank.w, tank.y + tank.h); ctx.lineTo(tank.x + tank.w, tank.y); ctx.stroke();
        let by;   // top of the block
        const cx = tank.x + tank.w / 2;
        if (cut) {
          const fl = m.floats(mat.rho, liq.rho), target = fl ? surf - side + side * (mat.rho / liq.rho) : tank.y + tank.h - side - 2;
          yDrop += (target - yDrop) * Math.min(1, dt * 3); if (!yDrop) yDrop = surf - side * (1 - depth) - side * 0;
          by = yDrop;
        } else {
          const fl = f.floating, sub = fl ? f.vSub / V : depth;
          by = surf - side + side * sub;
          // spring scale
          const sx = cx, top = 20, len = 40 + Math.min(110, f.scale / 8);
          k.rrect(ctx, sx - 14, top, 28, 70, 6, c.soft, c.ink, 2);
          ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 12; i++) ctx.lineTo(sx + (i % 2 ? 7 : -7), top + 8 + (i * Math.min(54, len * 0.5)) / 12); ctx.stroke();
          k.line(ctx, sx, top + 70, sx, by, c.ink, fl ? 1 : 2, fl ? [4, 4] : null);
          k.text(ctx, `${k.fmt(f.scale, 0)} gw`, sx + 24, top + 35, { color: c.acc, size: 20, bold: true });
        }
        k.rrect(ctx, cx - side / 2, by, side, side, 3, mat.col, c.ink, 2);
        k.text(ctx, k.L(mat.zh, mat.en), cx, by + side / 2, { color: mat.v === 'iron' ? '#fff' : '#222', size: 14, bold: true, align: 'center' });
        if (!cut) {
          k.arrow(ctx, cx + side / 2 + 20, by + side / 2, cx + side / 2 + 20, by + side / 2 + Math.min(120, f.W / 8 + 10), '#e5484d', 4);
          k.text(ctx, k.L('重量', 'weight'), cx + side / 2 + 28, by + side / 2 + Math.min(120, f.W / 8 + 10), { color: '#e5484d', size: 14, bold: true });
          if (f.B > 0) { k.arrow(ctx, cx - side / 2 - 20, by + side, cx - side / 2 - 20, by + side - Math.min(120, f.B / 8 + 10), '#2f9e44', 4); k.text(ctx, k.L('浮力', 'buoyancy'), cx - side / 2 - 28, by + side - Math.min(120, f.B / 8 + 10), { color: '#2f9e44', size: 14, bold: true, align: 'right' }); }
        }
        k.text(ctx, k.L(`${liq.zh}  ρ = ${liq.rho} g/cm³`, `${liq.en}  ρ = ${liq.rho} g/cm³`), tank.x + tank.w - 8, tank.y + tank.h - 14, { color: c.ink, size: 14, align: 'right', bold: true });
        k.text(ctx, k.L(`質量 ${k.fmt(f.W, 0)} g`, `mass ${k.fmt(f.W, 0)} g`), 20, 30, { color: c.ink, size: 16 });
        k.text(ctx, `ρ = ${mat.rho} g/cm³`, 20, 54, { color: c.ink, size: 16 });
        k.text(ctx, `V = ${V} cm³`, 20, 78, { color: c.ink, size: 16 });
        const fl = m.floats(mat.rho, liq.rho);
        ro.set(k.L(`重量 W = ρ × V = ${mat.rho} × ${V} = <b>${k.fmt(f.W, 1)} gw</b>（${k.fmt(m.toN(f.W), 2)} N）<br>浮力 B = ρ<sub>液</sub> × V<sub>排開</sub> = ${liq.rho} × ${k.fmt(f.vSub, 1)} = <b>${k.fmt(f.B, 1)} gw</b><br>彈簧秤讀數 = W − B = <b>${k.fmt(f.scale, 1)} gw</b><br>${fl ? `物體密度 &lt; 液體密度 → <b>會浮</b>（浮起時 ${Math.round((mat.rho / liq.rho) * 100)}% 在液面下）` : '物體密度 &gt; 液體密度 → <b>會沉</b>'}`,
          `Weight W = ρ × V = ${mat.rho} × ${V} = <b>${k.fmt(f.W, 1)} gw</b> (${k.fmt(m.toN(f.W), 2)} N)<br>Buoyancy B = ρ<sub>liquid</sub> × V<sub>displaced</sub> = ${liq.rho} × ${k.fmt(f.vSub, 1)} = <b>${k.fmt(f.B, 1)} gw</b><br>Scale reading = W − B = <b>${k.fmt(f.scale, 1)} gw</b><br>${fl ? `object less dense than the liquid → <b>floats</b> (${Math.round((mat.rho / liq.rho) * 100)}% under when floating)` : 'object denser than the liquid → <b>sinks</b>'}`) +
          `<div class="muted">${k.L('gw = 公克重，1 gw ≈ 0.0098 N', 'gw = gram-weight; 1 gw ≈ 0.0098 N')}</div>`);
      });
    },
    observe: [
      { try: T('選「鐵」和「水」，把深度從 0% 慢慢調到 100%。', 'Choose iron and water, and lower it from 0% to 100%.'),
        ask: T('鐵塊愈往下放，彈簧秤的讀數…', 'As the iron goes deeper, the scale reading…'),
        options: [T('愈來愈小，完全浸入後就不再變', 'drops, then stays the same once fully under'), T('一直不變', 'never changes'), T('愈來愈大', 'keeps rising')],
        why: T('浸入液體的體積愈大，排開的液體愈多，浮力就愈大。全部浸入後排開的體積固定，浮力就不再增加。', 'The more of the block is under, the more liquid it pushes aside and the bigger the buoyancy. Once it is fully under, the displaced volume stops changing, so the buoyancy does too.') },
      { try: T('鐵塊完全浸入水中，記下浮力；再換成「濃鹽水」。', 'With the iron fully in water, note the buoyancy; then switch to strong salt water.'),
        ask: T('在濃鹽水中的浮力…', 'In strong salt water the buoyancy is…'),
        options: [T('比較大', 'bigger'), T('比較小', 'smaller'), T('一樣', 'the same')],
        why: T('浮力 = 液體密度 × 排開的體積。鹽水密度比較大，同樣的體積排開的液體比較重，所以浮力比較大。', 'Buoyancy = liquid density × displaced volume. Salt water is denser, so the same volume of it weighs more and the buoyancy is bigger.') },
      { try: T('選「冰」，分別放進水和酒精，然後剪斷繩子。', 'Choose ice, put it in water and then in alcohol, and cut the string each time.'),
        ask: T('冰在哪一種液體裡會沉下去？', 'In which liquid does the ice sink?'),
        options: [T('酒精', 'Alcohol'), T('水', 'Water'), T('兩種都會浮', 'It floats in both')],
        why: T('冰的密度 0.92 g/cm³，比水（1.0）小所以浮在水上，但比酒精（0.79）大，所以在酒精裡會沉。', 'Ice (0.92 g/cm³) is less dense than water (1.0), so it floats in water, but denser than alcohol (0.79), so it sinks in alcohol.') },
      { try: T('選「木頭」放進水裡，看浮起來時有多少在水面下。', 'Choose wood in water and see how much is under the surface when it floats.'),
        ask: T('漂浮的木塊，浮力和重量的關係是…', 'For the floating wood, buoyancy compared with weight is…'),
        options: [T('浮力 = 重量', 'buoyancy = weight'), T('浮力 > 重量', 'buoyancy > weight'), T('浮力 < 重量', 'buoyancy < weight')],
        why: T('漂浮時物體靜止，向上的浮力剛好和向下的重量抵消。密度 0.6 的木頭會有 60% 浸在水裡。', 'A floating object is at rest, so the upward buoyancy exactly balances its weight. Wood of density 0.6 floats 60% under water.') },
    ],
  },
  {
    id: 'motion-graphs', grades: [8, 9], subj: 'phys', icon: '🚗',
    name: T('運動與圖形', 'Motion and graphs'),
    intro: T('設定小車的初速度和加速度，按「出發」。路上每 1 秒留下一個點，下面同時畫出位置–時間圖和速度–時間圖。看看等速度和等加速度運動的圖長什麼樣子。',
      'Set the car’s starting velocity and acceleration and press Go. It leaves a dot on the road every second, and the position–time and velocity–time graphs are drawn as it moves. Compare constant velocity with constant acceleration.'),
    cur: { tw: T('國中 理化 直線運動', 'Junior high physical science · motion in a line'), us: 'NGSS MS-PS2-2' },
    model: motion,
    checks(m, ok) {
      const v0 = 3, a = 1.5, t = 4, h = 1e-5;
      ok(Math.abs((m.x(0, v0, a, t + h) - m.x(0, v0, a, t - h)) / (2 * h) - m.v(v0, a, t)) < 1e-6, 'slope of x–t equals v');
      let area = 0; const n = 4000; for (let i = 0; i < n; i++) { const t1 = (i * t) / n, t2 = ((i + 1) * t) / n; area += ((m.v(v0, a, t1) + m.v(v0, a, t2)) / 2) * (t2 - t1); }
      ok(Math.abs(area - m.x(0, v0, a, t)) < 1e-6, 'area under v–t equals displacement');
      ok(Math.abs(m.v(v0, a, t) ** 2 - (v0 ** 2 + 2 * a * m.x(0, v0, a, t))) < 1e-9, 'v² = v0² + 2aΔx');
      ok(m.x(0, 5, 0, 2) === 10 && m.x(0, 5, 0, 4) === 20, 'constant velocity → equal distances in equal times');
      ok(m.x(0, 0, 2, 1) === 1 && m.x(0, 0, 2, 2) === 4 && m.x(0, 0, 2, 3) === 9, 'from rest: distances 1 : 4 : 9');
    },
    mount(k) {
      const m = motion, v = k.canvas(640, 420), { ctx, W, H } = v;
      let v0 = 5, a = 0, t = 0, run = false;
      const TMAX = 8;
      k.slider({ label: T('初速度 v₀', 'Starting velocity v₀'), min: -5, max: 10, step: 1, value: v0, unit: 'm/s', onInput: (x) => { v0 = x; t = 0; run = false; } });
      k.slider({ label: T('加速度 a', 'Acceleration a'), min: -2, max: 2, step: 0.5, value: a, unit: 'm/s²', dp: 1, onInput: (x) => { a = x; t = 0; run = false; } });
      const b = k.buttons([{ label: T('▶ 出發', '▶ Go'), primary: true, on: () => { if (t >= TMAX) t = 0; run = !run; } }, { label: T('↺ 回起點', '↺ Reset'), on: () => { t = 0; run = false; } }]);
      const ro = k.readout();
      const X = (x) => 40 + ((x + 110) / 260) * 560;
      k.loop((dt) => {
        if (run) { t = Math.min(TMAX, t + dt); if (t >= TMAX) run = false; }
        b.firstChild.textContent = run ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 出發', '▶ Go');
        const c = k.colors(), x = m.x(0, v0, a, t), vel = m.v(v0, a, t);
        ctx.clearRect(0, 0, W, H);
        // road with metre marks
        ctx.fillStyle = c.dark ? '#3a3f44' : '#d9dde0'; ctx.fillRect(20, 40, 600, 34);
        for (let xm = -100; xm <= 150; xm += 25) { k.line(ctx, X(xm), 74, X(xm), 82, c.ink, 1.5); k.text(ctx, `${xm}`, X(xm), 92, { color: c.muted, size: 12, align: 'center' }); }
        k.text(ctx, 'x (m)', 620, 92, { color: c.muted, size: 12, align: 'right' });
        for (let s = 0; s <= Math.floor(t + 1e-9); s++) k.circle(ctx, X(m.x(0, v0, a, s)), 66, 4, c.no);
        ctx.save(); ctx.translate(X(x), 54); if (vel < 0 || (vel === 0 && a < 0)) ctx.scale(-1, 1); emo(k, ctx, '🚗', 0, 0, 34); ctx.restore();
        k.arrow(ctx, X(x), 26, X(x) + vel * 6, 26, c.acc2, 3);
        // graphs
        const xs = []; const vs = []; for (let s = 0; s <= t + 1e-9; s += 0.05) { xs.push([s, m.x(0, v0, a, s)]); vs.push([s, m.v(v0, a, s)]); }
        const xm = Math.max(10, ...[0, 2, 4, 6, 8].map((s) => Math.abs(m.x(0, v0, a, s))));
        const mp1 = k.axes(ctx, { x: 60, y: 140, w: 230, h: 230 }, { xmin: 0, xmax: TMAX, ymin: -xm, ymax: xm, c, xdp: 0, ydp: 0, xlabel: 't (s)', ylabel: k.L('位置 x (m)', 'position x (m)') });
        k.plotLine(ctx, mp1, xs, c.acc, 3);
        const vm = 12;
        const mp2 = k.axes(ctx, { x: 380, y: 140, w: 230, h: 230 }, { xmin: 0, xmax: TMAX, ymin: -vm, ymax: vm, c, xdp: 0, ydp: 0, xlabel: 't (s)', ylabel: k.L('速度 v (m/s)', 'velocity v (m/s)') });
        if (vs.length > 1) { ctx.fillStyle = 'rgba(14,158,134,0.15)'; ctx.beginPath(); ctx.moveTo(mp2.X(0), mp2.Y(0)); vs.forEach(([s, y]) => ctx.lineTo(mp2.X(s), mp2.Y(y))); ctx.lineTo(mp2.X(t), mp2.Y(0)); ctx.fill(); }
        k.plotLine(ctx, mp2, vs, c.acc2, 3);
        ro.set(`t = <b>${k.fmt(t, 1)} s</b>　x = <b>${k.fmt(x, 1)} m</b>　v = <b>${k.fmt(vel, 1)} m/s</b>　a = <b>${k.fmt(a, 1)} m/s²</b><br>` +
          k.L(`x = v₀t + ½at² = ${v0}×${k.fmt(t, 1)} + ½×${a}×${k.fmt(t, 1)}² = ${k.fmt(x, 1)} m<br><span class="muted">速度圖下的面積（綠色）＝位移；位置圖的斜率＝速度。</span>`,
            `x = v₀t + ½at² = ${v0}×${k.fmt(t, 1)} + ½×${a}×${k.fmt(t, 1)}² = ${k.fmt(x, 1)} m<br><span class="muted">The shaded area under v–t is the displacement; the slope of x–t is the velocity.</span>`));
      });
    },
    observe: [
      { try: T('把加速度設為 0、初速度 5 m/s，按出發，看路上的點。', 'Set a = 0 and v₀ = 5 m/s, press Go, and look at the dots on the road.'),
        ask: T('等速度運動時，每秒留下的點…', 'At constant velocity, the dots left each second are…'),
        options: [T('間隔一樣，x–t 圖是一條斜直線', 'evenly spaced; the x–t graph is a straight sloped line'), T('間隔愈來愈大', 'farther and farther apart'), T('都疊在同一點', 'all in the same place')],
        why: T('等速度時每秒走的距離一樣（5 公尺），所以點的間隔相同；位置隨時間均勻增加，x–t 圖是直線，v–t 圖是水平線。', 'At constant velocity the car covers the same distance (5 m) every second, so the dots are evenly spaced; x–t is a straight line and v–t is flat.') },
      { try: T('初速度 0、加速度 2 m/s²，按出發。', 'Set v₀ = 0 and a = 2 m/s² and press Go.'),
        ask: T('等加速度運動的 v–t 圖是…', 'For constant acceleration, the v–t graph is…'),
        options: [T('一條斜直線', 'a straight sloped line'), T('一條水平線', 'a flat line'), T('一條曲線', 'a curve')],
        why: T('速度每秒增加 2 m/s，均勻增加，所以 v–t 圖是斜直線，斜率就是加速度；x–t 圖則是往上彎的曲線（拋物線）。', 'The velocity grows by 2 m/s every second, steadily, so v–t is a straight line whose slope is the acceleration. The x–t graph curves upward (a parabola).') },
      { try: T('同樣 v₀ = 0、a = 2，看 1 秒、2 秒、3 秒時的位置。', 'Same v₀ = 0 and a = 2: read the position at 1, 2 and 3 s.'),
        ask: T('第 1、2、3 秒結束時的位置比是…', 'The positions at 1, 2 and 3 s are in the ratio…'),
        options: ['1 : 4 : 9', '1 : 2 : 3', '1 : 3 : 5'],
        why: T('由靜止開始等加速度，x = ½at²，所以位置和時間的平方成正比：1² : 2² : 3² = 1 : 4 : 9。（每一秒內走的距離才是 1 : 3 : 5。）', 'Starting from rest with constant acceleration, x = ½at², so position goes with time squared: 1 : 4 : 9. (The distance covered during each separate second is 1 : 3 : 5.)') },
      { try: T('v₀ = 8 m/s、a = −2 m/s²，按出發。', 'Set v₀ = 8 m/s and a = −2 m/s², and press Go.'),
        ask: T('第 4 秒時小車…', 'At t = 4 s the car…'),
        options: [T('瞬間停住，然後往回開', 'stops for an instant, then moves backward'), T('一直往前、愈來愈快', 'keeps speeding forward'), T('一直以 8 m/s 前進', 'keeps going 8 m/s')],
        why: T('v = 8 + (−2)×4 = 0，第 4 秒速度為零，接著速度變成負的，車子往回走。此時離起點最遠：8×4 − ½×2×4² = 16 公尺。', 'v = 8 − 2×4 = 0, so it stops at 4 s and then the velocity turns negative — it moves back. It is farthest away then: 8×4 − ½×2×4² = 16 m.') },
    ],
  },
  {
    id: 'newton-cart', grades: [8, 9], subj: 'phys', icon: '🛒',
    name: T('牛頓運動定律', 'Newton’s laws of motion'),
    intro: T('用力推一台小車：合力愈大加速度愈大，質量愈大加速度愈小（F = ma）。摩擦力會阻止運動。把摩擦關掉、推一下就放手，看看第一運動定律（慣性）。',
      'Push a cart: the bigger the net force, the bigger the acceleration; the bigger the mass, the smaller the acceleration (F = ma). Friction resists the motion. Turn friction off, give one push and let go to see Newton’s first law (inertia).'),
    cur: { tw: T('國中 理化 力與運動（牛頓運動定律）', 'Junior high physical science · force and motion (Newton’s laws)'), us: 'NGSS MS-PS2-2' },
    model: cart,
    checks(m, ok) {
      let s = m.step({ x: 0, v: 0 }, 10, 2, 0, 0.01); ok(Math.abs(s.a - 5) < 1e-9, 'a = F/m = 10/2 = 5 m/s² with no friction');
      ok(Math.abs(m.step({ x: 0, v: 0 }, 10, 4, 0, 0.01).a - 2.5) < 1e-9, 'double the mass → half the acceleration');
      s = m.step({ x: 0, v: 0 }, 5, 2, 0.5, 0.01); ok(s.a === 0 && s.v === 0, 'static friction holds when F < μmg (9.8 N)');
      s = m.step({ x: 0, v: 0 }, 20, 2, 0.5, 0.01); ok(Math.abs(s.a - (20 - 9.8) / 2) < 1e-9, 'sliding: a = (F − μmg)/m');
      let st = { x: 0, v: 3 }; for (let i = 0; i < 1000; i++) st = m.step(st, 0, 2, 0, 0.01); ok(Math.abs(st.v - 3) < 1e-12 && Math.abs(st.x - 30) < 1e-9, 'no force, no friction → constant velocity (first law)');
      st = { x: 0, v: 3 }; for (let i = 0; i < 1000; i++) st = m.step(st, 0, 2, 0.2, 0.01); ok(st.v === 0 && Math.abs(st.x - 9 / (2 * 0.2 * 9.8)) < 0.02, 'friction stops it after v²/(2μg) and never pushes it backward');
    },
    mount(k) {
      const m = cart, v = k.canvas(640, 360), { ctx, W, H } = v;
      let F = 10, mass = 2, mu = 0.1, s = { x: 0, v: 0 }, last = { a: 0, fr: 0, net: 0 }, pushing = false, pushT = 0, mode = 'hold', hist = [], t = 0;
      k.slider({ label: T('推力 F', 'Push F'), min: -30, max: 30, step: 1, value: F, unit: T('牛頓 N', 'N'), onInput: (x) => (F = x) });
      k.slider({ label: T('質量 m', 'Mass m'), min: 1, max: 10, step: 0.5, value: mass, unit: T('公斤', 'kg'), dp: 1, onInput: (x) => (mass = x) });
      k.seg({ label: T('地面（摩擦係數 μ）', 'Surface (friction μ)'), value: 0.1, options: [{ v: 0, label: T('無摩擦 0', 'frictionless 0') }, { v: 0.1, label: T('木板 0.1', 'wood 0.1') }, { v: 0.4, label: T('地毯 0.4', 'carpet 0.4') }], onChange: (x) => (mu = x) });
      k.seg({ label: T('推法', 'How to push'), value: 'hold', options: [{ v: 'hold', label: T('一直推', 'Keep pushing') }, { v: 'tap', label: T('推 1 秒就放手', 'Push 1 s, let go') }], onChange: (x) => (mode = x) });
      const b = k.buttons([{ label: T('▶ 開始推', '▶ Push'), primary: true, on: () => { pushing = !pushing; pushT = 0; } }, { label: T('↺ 重來', '↺ Reset'), on: () => { s = { x: 0, v: 0 }; pushing = false; hist = []; t = 0; } }]);
      const ro = k.readout();
      k.loop((dt) => {
        const c = k.colors();
        let Fnow = 0;
        if (pushing) { pushT += dt; Fnow = mode === 'tap' && pushT > 1 ? 0 : F; }
        if (pushing || Math.abs(s.v) > 0) { const n = 8; for (let i = 0; i < n; i++) { const r = m.step(s, Fnow, mass, mu, dt / n); s = { x: r.x, v: r.v }; last = r; } t += dt; hist.push([t, s.v]); if (hist.length > 400) hist.shift(); }
        else last = m.step(s, 0, mass, mu, dt);
        b.firstChild.textContent = pushing ? k.L('⏸ 停止推', '⏸ Stop pushing') : k.L('▶ 開始推', '▶ Push');
        ctx.clearRect(0, 0, W, H);
        const gy = 200, wrap = ((s.x % 20) + 20) % 20, cx = 320;
        ctx.fillStyle = mu === 0 ? (c.dark ? '#2d4d5c' : '#d6f0fb') : mu < 0.3 ? '#c9a06a' : '#a0524a'; ctx.fillRect(0, gy, W, 16);
        for (let i = -2; i < 34; i++) { const xx = i * 20 - wrap * 20 + 0; k.line(ctx, xx, gy + 16, xx - 8, gy + 28, c.muted, 1.2); }
        // cart
        const cw = 80 + mass * 6, ch = 40 + mass * 2;
        k.rrect(ctx, cx - cw / 2, gy - ch - 14, cw, ch, 6, '#4b7bd8', c.ink, 2);
        k.text(ctx, `${mass} kg`, cx, gy - ch / 2 - 14, { color: '#fff', size: 16, bold: true, align: 'center' });
        for (const wx of [cx - cw / 3, cx + cw / 3]) { k.circle(ctx, wx, gy - 7, 8, '#333'); const r = (s.x * 10) % (Math.PI * 2); k.line(ctx, wx, gy - 7, wx + Math.cos(r) * 7, gy - 7 + Math.sin(r) * 7, '#bbb', 2); }
        const sc = 4;
        if (Fnow) { const x0 = Fnow > 0 ? cx - cw / 2 : cx + cw / 2; k.arrow(ctx, x0 - Fnow * sc, gy - ch / 2 - 14, x0, gy - ch / 2 - 14, '#e8590c', 5); k.text(ctx, `F = ${Fnow} N`, x0 - Fnow * sc, gy - ch / 2 - 34, { color: '#e8590c', size: 15, bold: true, align: 'center' }); }
        if (Math.abs(last.fr) > 1e-6) { k.arrow(ctx, cx, gy + 4, cx + last.fr * sc, gy + 4, '#ae3ec9', 4); k.text(ctx, k.L(`摩擦力 ${k.fmt(Math.abs(last.fr), 1)} N`, `friction ${k.fmt(Math.abs(last.fr), 1)} N`), cx + last.fr * sc, gy + 44, { color: '#ae3ec9', size: 14, bold: true, align: 'center' }); }
        if (Math.abs(last.net) > 1e-6) { k.arrow(ctx, cx, 40, cx + last.net * sc, 40, c.ok, 5); k.text(ctx, k.L(`合力 ${k.fmt(last.net, 1)} N`, `net ${k.fmt(last.net, 1)} N`), cx, 20, { color: c.ok, size: 15, bold: true, align: 'center' }); }
        // speed graph
        const mp = k.axes(ctx, { x: 70, y: 260, w: 520, h: 70 }, { xmin: Math.max(0, t - 10), xmax: Math.max(10, t), ymin: -15, ymax: 15, c, xdp: 0, ydp: 0, yticks: 2, xlabel: 't (s)', ylabel: 'v (m/s)' });
        k.plotLine(ctx, mp, hist.filter(([x]) => x >= t - 10), c.acc2, 2.5);
        ro.set(k.L(`合力 = 推力 + 摩擦力 = ${Fnow} ${last.fr < 0 ? '−' : '+'} ${k.fmt(Math.abs(last.fr), 1)} = <b>${k.fmt(last.net, 1)} N</b><br>加速度 a = F<sub>合</sub> ÷ m = ${k.fmt(last.net, 1)} ÷ ${mass} = <b>${k.fmt(last.net / mass, 2)} m/s²</b><br>速度 <b>${k.fmt(s.v, 2)} m/s</b><span class="muted">（最大靜摩擦力 μmg = ${k.fmt(mu * mass * g, 1)} N）</span>`,
          `Net force = push + friction = ${Fnow} ${last.fr < 0 ? '−' : '+'} ${k.fmt(Math.abs(last.fr), 1)} = <b>${k.fmt(last.net, 1)} N</b><br>a = F<sub>net</sub> ÷ m = ${k.fmt(last.net, 1)} ÷ ${mass} = <b>${k.fmt(last.net / mass, 2)} m/s²</b><br>velocity <b>${k.fmt(s.v, 2)} m/s</b><span class="muted"> (max friction μmg = ${k.fmt(mu * mass * g, 1)} N)</span>`));
      });
    },
    observe: [
      { try: T('選「無摩擦」，推力 10 N，比較質量 2 kg 和 4 kg 的加速度。', 'Choose frictionless, push with 10 N, and compare 2 kg with 4 kg.'),
        ask: T('質量變成 2 倍，加速度…', 'Doubling the mass makes the acceleration…'),
        options: [T('變成一半', 'half as big'), T('變成 2 倍', 'twice as big'), T('不變', 'unchanged')],
        why: T('a = F ÷ m：10 ÷ 2 = 5 m/s²，10 ÷ 4 = 2.5 m/s²。同樣的力，質量愈大愈難加速。', 'a = F ÷ m: 10 ÷ 2 = 5 m/s² and 10 ÷ 4 = 2.5 m/s². With the same force, more mass is harder to speed up.') },
      { try: T('選「無摩擦」和「推 1 秒就放手」，按開始推。', 'Choose frictionless and “Push 1 s, let go”, then press Push.'),
        ask: T('放手以後小車…', 'After you let go, the cart…'),
        options: [T('以固定速度一直前進', 'keeps going at a steady speed'), T('慢慢停下來', 'slowly stops'), T('馬上停住', 'stops right away')],
        why: T('沒有外力（也沒有摩擦）時，運動中的物體會保持等速度直線運動——這是牛頓第一運動定律（慣性定律）。', 'With no force acting (and no friction) a moving object keeps moving at constant velocity — Newton’s first law, the law of inertia.') },
      { try: T('選「地毯」，質量 2 kg，用 5 N 推。', 'Choose carpet, 2 kg, and push with 5 N.'),
        ask: T('為什麼小車推不動？', 'Why doesn’t the cart move?'),
        options: [T('靜摩擦力和推力一樣大、方向相反，合力為 0', 'Static friction matches the push, so the net force is 0'), T('推力太小所以沒有力', 'A small push is no force at all'), T('車子太重沒有慣性', 'The cart is too heavy to have inertia')],
        why: T('地毯的最大靜摩擦力約 μmg = 0.4 × 2 × 9.8 ≈ 7.8 N。5 N 的推力被同樣大的靜摩擦力抵消，合力 0，所以不會動。', 'The carpet can supply up to μmg = 0.4 × 2 × 9.8 ≈ 7.8 N of static friction. It cancels the 5 N push, the net force is zero, so the cart stays put.') },
      { try: T('選「木板」，推力 20 N 推一陣子再按「停止推」。', 'Choose wood, push with 20 N for a while, then press “Stop pushing”.'),
        ask: T('停止推以後，小車的加速度方向…', 'After you stop pushing, the acceleration points…'),
        options: [T('和運動方向相反（減速）', 'opposite the motion (slowing down)'), T('和運動方向相同', 'the same way as the motion'), T('沒有加速度', 'there is no acceleration')],
        why: T('停止推以後只剩摩擦力，它和運動方向相反，所以合力和加速度都向後，小車減速直到停止。', 'Once you stop pushing only friction is left, pointing against the motion, so the net force and acceleration point backward and the cart slows to a stop.') },
    ],
  },
  {
    id: 'heat-temperature', grades: [7, 9], subj: 'phys', icon: '🌡️',
    name: T('熱量與溫度', 'Heat and temperature'),
    intro: T('熱量會從高溫的物體流向低溫的物體，直到溫度相同（熱平衡）。試著把冷水和熱水混合，預測最後的溫度。再用同樣的加熱器加熱相同質量的不同物質：比熱愈小的物質，溫度上升得愈快。',
      'Heat flows from hotter things to colder things until they reach the same temperature (thermal equilibrium). Mix hot and cold water and predict the final temperature. Then heat the same mass of different substances with the same heater: the smaller the specific heat, the faster the temperature rises.'),
    cur: { tw: T('國中 理化 溫度與熱', 'Junior high physical science · temperature and heat'), us: 'NGSS MS-PS3-4' },
    model: heat,
    checks(m, ok) {
      ok(Math.abs(m.mix(100, 80, 100, 20) - 50) < 1e-9, 'equal masses → the average');
      ok(Math.abs(m.mix(100, 80, 300, 20) - 35) < 1e-9, '100 g at 80 °C + 300 g at 20 °C → 35 °C');
      const Tf = m.mix(150, 90, 250, 10); ok(Math.abs(m.Q(150, 4.18, 90 - Tf) - m.Q(250, 4.18, Tf - 10)) < 1e-6, 'heat lost = heat gained');
      ok(Math.abs(m.Q(100, 4.18, 10) - 4180) < 1e-9, 'Q = mcΔT: 100 g water warmed 10 °C takes 4180 J');
      ok(Math.abs((m.warm(20, 100, 60, 100, 0.45) - 20) / (m.warm(20, 100, 60, 100, 4.18) - 20) - 4.18 / 0.45) < 1e-9, 'same heat: iron warms 9.3× as much as water');
    },
    mount(k) {
      const m = heat, v = k.canvas(640, 380), { ctx, W, H } = v;
      let mode = 'mix', m1 = 200, T1 = 80, m2 = 200, T2 = 20, mixed = 0, sA = SUBS[0], sB = SUBS[3], P = 50, th = 0, run = false, hist = [];
      k.seg({ label: T('實驗', 'Experiment'), value: 'mix', options: [{ v: 'mix', label: T('冷熱水混合', 'Mix hot and cold') }, { v: 'spec', label: T('比熱比賽', 'Specific-heat race') }], onChange: (x) => { mode = x; vis(); } });
      const c1 = [k.slider({ label: T('熱水質量', 'Hot water mass'), min: 50, max: 400, step: 10, value: m1, unit: 'g', onInput: (x) => { m1 = x; mixed = 0; } }),
        k.slider({ label: T('熱水溫度', 'Hot water temperature'), min: 40, max: 100, step: 1, value: T1, unit: '°C', onInput: (x) => { T1 = x; mixed = 0; } }),
        k.slider({ label: T('冷水質量', 'Cold water mass'), min: 50, max: 400, step: 10, value: m2, unit: 'g', onInput: (x) => { m2 = x; mixed = 0; } }),
        k.slider({ label: T('冷水溫度', 'Cold water temperature'), min: 0, max: 35, step: 1, value: T2, unit: '°C', onInput: (x) => { T2 = x; mixed = 0; } })];
      const c2 = [k.seg({ label: T('左邊', 'Left'), value: 'water', options: SUBS.map((s) => ({ v: s.v, label: T(s.zh, s.en) })), onChange: (x) => { sA = SUBS.find((s) => s.v === x); th = 0; hist = []; } }),
        k.seg({ label: T('右邊', 'Right'), value: 'iron', options: SUBS.map((s) => ({ v: s.v, label: T(s.zh, s.en) })), onChange: (x) => { sB = SUBS.find((s) => s.v === x); th = 0; hist = []; } }),
        k.slider({ label: T('加熱器功率', 'Heater power'), min: 10, max: 100, step: 10, value: P, unit: 'W', onInput: (x) => (P = x) })];
      const bt = k.buttons([{ label: T('▶ 開始', '▶ Start'), primary: true, on: () => { if (mode === 'mix') mixed = mixed ? 0 : 0.001; else run = !run; } }, { label: T('↺ 重來', '↺ Reset'), on: () => { mixed = 0; th = 0; hist = []; run = false; } }]);
      const ro = k.readout();
      const vis = () => { c1.forEach((x) => (x.el.style.display = mode === 'mix' ? '' : 'none')); c2.forEach((x) => (x.el.style.display = mode === 'spec' ? '' : 'none')); };
      vis();
      const cup = (x, y, w, h, fill, col, label, temp) => {
        const c = k.colors();
        ctx.fillStyle = col; ctx.fillRect(x + 3, y + h - h * fill, w - 6, h * fill);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y); ctx.stroke();
        k.text(ctx, label, x + w / 2, y + h + 20, { color: c.ink, size: 15, align: 'center', bold: true });
        k.text(ctx, `${k.fmt(temp, 1)} °C`, x + w / 2, y - 16, { color: temp > 45 ? '#e5484d' : temp < 20 ? '#2f7de1' : c.ink, size: 20, align: 'center', bold: true });
      };
      const tcol = (T) => `rgb(${Math.round(60 + T * 1.9)},${Math.round(130 - Math.abs(T - 50) * 0.6)},${Math.round(235 - T * 1.9)})`;
      k.loop((dt) => {
        const c = k.colors();
        bt.firstChild.textContent = mode === 'mix' ? (mixed ? k.L('↺ 倒回去', '↺ Separate') : k.L('▶ 倒在一起', '▶ Pour together')) : run ? k.L('⏸ 停止加熱', '⏸ Stop heating') : k.L('▶ 開始加熱', '▶ Start heating');
        ctx.clearRect(0, 0, W, H);
        if (mode === 'mix') {
          const Tf = m.mix(m1, T1, m2, T2);
          if (mixed) mixed = Math.min(1, mixed + dt * 0.5);
          const f = mixed;
          if (f < 1) {
            cup(60, 120, 110, 160, Math.min(1, m1 / 400) * (1 - f), tcol(T1), k.L(`熱水 ${m1} g`, `hot ${m1} g`), T1 + (Tf - T1) * f);
            cup(470, 120, 110, 160, Math.min(1, m2 / 400) * (1 - f), tcol(T2), k.L(`冷水 ${m2} g`, `cold ${m2} g`), T2 + (Tf - T2) * f);
          }
          cup(255, 120, 130, 180, Math.min(1, (m1 + m2) / 800) * f, tcol(Tf), k.L(`混合 ${m1 + m2} g`, `mixed ${m1 + m2} g`), f > 0 ? Tf : 0);
          if (f > 0 && f < 1) { k.arrow(ctx, 175, 150, 250, 190, tcol(T1), 4); k.arrow(ctx, 465, 150, 390, 190, tcol(T2), 4); }
          const lost = m.Q(m1, 4.18, T1 - Tf), gained = m.Q(m2, 4.18, Tf - T2);
          ro.set(k.L(`最後溫度 T = (m₁T₁ + m₂T₂) ÷ (m₁ + m₂) = (${m1}×${T1} + ${m2}×${T2}) ÷ ${m1 + m2} = <b>${k.fmt(Tf, 1)} °C</b><br>熱水放出 ${k.fmt(lost, 0)} J ＝ 冷水吸收 ${k.fmt(gained, 0)} J`,
            `Final T = (m₁T₁ + m₂T₂) ÷ (m₁ + m₂) = (${m1}×${T1} + ${m2}×${T2}) ÷ ${m1 + m2} = <b>${k.fmt(Tf, 1)} °C</b><br>Heat lost by hot water ${k.fmt(lost, 0)} J = heat gained by cold water ${k.fmt(gained, 0)} J`) +
            `<div class="muted">${k.L('假設沒有熱散失到空氣和杯子。', 'Assuming no heat escapes to the air or the cup.')}</div>`);
        } else {
          if (run) { th += dt * 6; hist.push([th, m.warm(20, P, th, 100, sA.c), m.warm(20, P, th, 100, sB.c)]); }
          const TA = m.warm(20, P, th, 100, sA.c), TB = m.warm(20, P, th, 100, sB.c);
          [[sA, TA, 70], [sB, TB, 230]].forEach(([s, Tn, x]) => {
            k.rrect(ctx, x, 150, 90, 80, 8, s.col, c.ink, 2);
            k.text(ctx, k.L(`${s.zh} 100 g`, `${s.en} 100 g`), x + 45, 245, { color: c.ink, size: 14, align: 'center', bold: true });
            k.text(ctx, `${k.fmt(Math.min(Tn, 999), 1)} °C`, x + 45, 130, { color: tcol(Math.min(100, Tn)), size: 20, align: 'center', bold: true });
            for (let i = 0; i < 4; i++) if (run) { ctx.fillStyle = i % 2 ? '#ff7a1a' : '#ffc23f'; ctx.beginPath(); ctx.moveTo(x + 15 + i * 20, 265); ctx.quadraticCurveTo(x + 22 + i * 20, 240 + Math.sin(th * 3 + i) * 4, x + 29 + i * 20, 265); ctx.fill(); }
            k.rrect(ctx, x, 265, 90, 10, 3, '#555');
            k.text(ctx, `c = ${s.c} J/(g·°C)`, x + 45, 292, { color: c.muted, size: 13, align: 'center' });
          });
          const mp = k.axes(ctx, { x: 400, y: 40, w: 220, h: 280 }, { xmin: 0, xmax: Math.max(60, th), ymin: 0, ymax: 120, c, xdp: 0, ydp: 0, xlabel: 't (s)', ylabel: 'T (°C)' });
          k.plotLine(ctx, mp, hist.map((h) => [h[0], Math.min(120, h[1])]), sA.col, 3); k.plotLine(ctx, mp, hist.map((h) => [h[0], Math.min(120, h[2])]), sB.col, 3);
          ro.set(k.L(`兩邊都加熱 ${k.fmt(th, 0)} 秒 × ${P} W = <b>${k.fmt(P * th, 0)} J</b><br>ΔT = Q ÷ (m × c)：${sA.zh} 升高 <b>${k.fmt(TA - 20, 1)} °C</b>，${sB.zh} 升高 <b>${k.fmt(TB - 20, 1)} °C</b>`,
            `Both got ${k.fmt(th, 0)} s × ${P} W = <b>${k.fmt(P * th, 0)} J</b><br>ΔT = Q ÷ (m × c): ${sA.en} rose <b>${k.fmt(TA - 20, 1)} °C</b>, ${sB.en} rose <b>${k.fmt(TB - 20, 1)} °C</b>`) +
            `<div class="muted">${k.L('加熱器的熱全部被吸收（理想情況），時間快轉。', 'All the heater’s energy is absorbed (ideal); time is sped up.')}</div>`);
        }
      });
    },
    observe: [
      { try: T('熱水 200 g、80 °C，冷水 200 g、20 °C，倒在一起。', 'Hot water 200 g at 80 °C, cold water 200 g at 20 °C: pour them together.'),
        ask: T('最後溫度是多少？', 'What is the final temperature?'),
        options: ['50 °C', '100 °C', '60 °C'],
        why: T('質量相同時，熱水放出的熱等於冷水吸收的熱，最後溫度剛好是平均：(80 + 20) ÷ 2 = 50 °C。溫度不能相加！', 'With equal masses, the heat lost by the hot water equals the heat gained by the cold water, so the final temperature is the average: (80 + 20) ÷ 2 = 50 °C. Temperatures don’t add up!') },
      { try: T('把冷水改成 400 g，再倒在一起。', 'Make the cold water 400 g and pour again.'),
        ask: T('冷水比較多時，最後溫度會…', 'With more cold water, the final temperature is…'),
        options: [T('比較接近冷水的溫度', 'closer to the cold water’s temperature'), T('比較接近熱水的溫度', 'closer to the hot water’s temperature'), T('還是平均值 50 °C', 'still the average, 50 °C')],
        why: T('(200×80 + 400×20) ÷ 600 = 40 °C。質量大的那一杯「拉」溫度比較用力，最後溫度比較靠近它。', '(200×80 + 400×20) ÷ 600 = 40 °C. The bigger mass pulls harder, so the final temperature ends up nearer to it.') },
      { try: T('換到「比熱比賽」，左邊水、右邊鐵，開始加熱。', 'Switch to the specific-heat race: water on the left, iron on the right, and start heating.'),
        ask: T('吸收一樣多的熱，哪一個溫度升得比較快？', 'With the same heat, which one warms up faster?'),
        options: [T('鐵', 'Iron'), T('水', 'Water'), T('一樣快', 'Both the same')],
        why: T('鐵的比熱 0.45 J/(g·°C) 遠小於水的 4.18，ΔT = Q ÷ (mc)，c 愈小溫度升得愈快。水的比熱很大，所以海邊的氣溫變化比較小。', 'Iron’s specific heat (0.45 J/(g·°C)) is much smaller than water’s (4.18). Since ΔT = Q ÷ (mc), smaller c means a faster rise. Water’s big specific heat is why coastal temperatures change slowly.') },
    ],
  },
  {
    id: 'ph-indicator', grades: [8, 9], subj: 'chem', icon: '🧪',
    name: T('酸鹼與指示劑', 'Acids, bases and indicators'),
    intro: T('用指示劑測試生活中的溶液是酸性、中性還是鹼性。石蕊試紙、酚酞、溴瑞香草酚藍（BTB）和廣用試劑在不同 pH 會變成不同顏色。再試試把鹽酸和氫氧化鈉混合——酸鹼中和！',
      'Test everyday solutions with indicators to see if they are acidic, neutral or basic. Litmus paper, phenolphthalein, bromothymol blue (BTB) and universal indicator change color at different pH. Then mix hydrochloric acid with sodium hydroxide — neutralization!'),
    cur: { tw: T('國中 理化 酸鹼鹽', 'Junior high physical science · acids, bases and salts'), us: 'NGSS MS-PS1-2' },
    model: ph,
    checks(m, ok) {
      ok(Math.abs(m.mixPH(0.1, 20, 0.1, 0) - 1) < 1e-9 && Math.abs(m.mixPH(0.1, 0.000001, 0.1, 20) - 13) < 1e-4, '0.1 M HCl pH 1, 0.1 M NaOH pH 13');
      ok(m.mixPH(0.1, 20, 0.1, 20) === 7, 'equal moles → neutral, pH 7');
      ok(Math.abs(m.mixPH(0.1, 20, 0.1, 10) - (-Math.log10(1 / 30))) < 1e-9, 'half neutralised: [H⁺] = 1 mmol / 30 mL');
      let mono = true, last = 0; for (let vb = 0; vb <= 40; vb += 0.5) { const p = m.mixPH(0.1, 20, 0.1, vb); if (p < last - 1e-9) mono = false; last = p; } ok(mono, 'pH rises as base is added');
      ok(m.litmus(2) === 'red' && m.litmus(12) === 'blue' && m.phenol(7) === 'colorless' && m.phenol(9) === 'pink' && m.btb(4) === 'yellow' && m.btb(7) === 'green' && m.btb(10) === 'blue', 'indicator colors');
      ok(m.SOLNS.filter((s) => s.pH < 7).every((s) => m.kind(s.pH) === 'acid'), 'acids below 7');
    },
    mount(k) {
      const m = ph, v = k.canvas(640, 380), { ctx, W, H } = v;
      let mode = 'test', sol = SOLNS[2], ind = 'univ', vb = 0, drip = 0;
      k.seg({ label: T('實驗', 'Experiment'), value: 'test', options: [{ v: 'test', label: T('測試溶液', 'Test a solution') }, { v: 'neut', label: T('酸鹼中和', 'Neutralization') }], onChange: (x) => { mode = x; vis(); } });
      const a1 = k.seg({ label: T('溶液', 'Solution'), value: 'vinegar', options: SOLNS.map((s) => ({ v: s.v, label: T(s.zh, s.en) })), onChange: (x) => (sol = SOLNS.find((s) => s.v === x)) });
      k.seg({ label: T('指示劑', 'Indicator'), value: 'univ', options: [{ v: 'univ', label: T('廣用試劑', 'universal') }, { v: 'phenol', label: T('酚酞', 'phenolphthalein') }, { v: 'btb', label: 'BTB' }, { v: 'litmus', label: T('石蕊試紙', 'litmus paper') }], onChange: (x) => (ind = x) });
      const a2 = k.slider({ label: T('滴入 0.1 M NaOH', 'Add 0.1 M NaOH'), min: 0, max: 40, step: 0.5, value: 0, unit: 'mL', dp: 1, onInput: (x) => { vb = x; drip = 1; } });
      const ro = k.readout();
      const vis = () => { a1.el.style.display = mode === 'test' ? '' : 'none'; a2.el.style.display = mode === 'neut' ? '' : 'none'; };
      vis();
      const colorFor = (p) => ind === 'univ' ? m.univ(p) : ind === 'phenol' ? (m.phenol(p) === 'pink' ? (p > 10 ? '#d6249f' : '#f06bc0') : 'rgba(235,240,245,0.55)') : ind === 'btb' ? { yellow: '#f2d43a', green: '#4caf50', blue: '#2f6fd6' }[m.btb(p)] : 'rgba(235,240,245,0.55)';
      k.loop((dt) => {
        const c = k.colors(), p = mode === 'test' ? sol.pH : m.mixPH(0.1, 20, 0.1, vb);
        drip = Math.max(0, drip - dt);
        ctx.clearRect(0, 0, W, H);
        const bx = 140, by = 110, bw = 170, bh = 152;
        const level = mode === 'neut' ? by + bh - 50 - vb * 1.6 : by + 40;
        ctx.fillStyle = colorFor(p); ctx.fillRect(bx + 3, level, bw - 6, by + bh - level);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 6, by - 6); ctx.lineTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
        if (mode === 'neut') {
          k.rrect(ctx, bx + bw / 2 - 8, 0, 16, 80, 4, 'rgba(200,220,240,0.6)', c.ink, 2); k.line(ctx, bx + bw / 2, 80, bx + bw / 2, 92, c.ink, 3);
          if (drip > 0) k.circle(ctx, bx + bw / 2, 96 + (1 - drip) * (level - 100), 4, '#9ec5ff');
          k.text(ctx, 'NaOH', bx + bw / 2 + 14, 40, { color: c.ink, size: 14, bold: true });
          k.text(ctx, k.L('20 mL 0.1 M 鹽酸', '20 mL of 0.1 M HCl'), bx + bw / 2, by + bh + 18, { color: c.ink, size: 15, align: 'center', bold: true });
        } else k.text(ctx, k.L(sol.zh, sol.en), bx + bw / 2, by + bh + 18, { color: c.ink, size: 15, align: 'center', bold: true });
        if (ind === 'litmus') {
          const red = m.litmus(p) === 'red', blue = m.litmus(p) === 'blue';
          k.rrect(ctx, 30, 130, 26, 110, 4, blue ? '#3d6fd8' : '#e5484d', c.ink, 1.5); k.rrect(ctx, 66, 130, 26, 110, 4, red ? '#e5484d' : '#3d6fd8', c.ink, 1.5);
          k.text(ctx, k.L('紅', 'red'), 43, 255, { color: c.ink, size: 13, align: 'center' }); k.text(ctx, k.L('藍', 'blue'), 79, 255, { color: c.ink, size: 13, align: 'center' });
          k.text(ctx, k.L('浸過後', 'dipped'), 61, 115, { color: c.muted, size: 13, align: 'center' });
        }
        // pH meter
        k.rrect(ctx, 370, 120, 110, 70, 10, '#37474f'); k.rrect(ctx, 380, 132, 90, 40, 6, '#c5e8b7');
        k.text(ctx, k.fmt(p, 2), 425, 153, { color: '#1b3a1b', size: 24, bold: true, align: 'center', font: 'ui-monospace, monospace' });
        k.text(ctx, 'pH', 425, 205, { color: c.ink, size: 15, align: 'center', bold: true });
        // universal scale
        for (let i = 0; i <= 14; i++) { ctx.fillStyle = UNIV[i]; ctx.fillRect(40 + i * 38, 330, 38, 22); k.text(ctx, String(i), 59 + i * 38, 364, { color: c.ink, size: 13, align: 'center' }); }
        const px = 40 + (p / 14) * 570; ctx.fillStyle = c.ink; ctx.beginPath(); ctx.moveTo(px, 326); ctx.lineTo(px - 8, 314); ctx.lineTo(px + 8, 314); ctx.fill();
        k.text(ctx, k.L('← 酸性', '← acidic'), 40, 302, { color: '#d7191c', size: 14, bold: true }); k.text(ctx, k.L('中性', 'neutral'), 325, 302, { color: '#2f9e44', size: 14, bold: true, align: 'center' }); k.text(ctx, k.L('鹼性 →', 'basic →'), 610, 302, { color: '#4b3fa8', size: 14, bold: true, align: 'right' });
        const kind = m.kind(p), kz = { acid: '酸性', base: '鹼性', neutral: '中性' }[kind], ke = { acid: 'acidic', base: 'basic', neutral: 'neutral' }[kind];
        const lit = { red: ['紅色', 'red'], blue: ['藍色', 'blue'], purple: ['紫色（不變）', 'purple (no change)'] }[m.litmus(p)];
        ro.set(k.L(`pH = <b>${k.fmt(p, 2)}</b> → <b>${kz}</b><br>石蕊：紅色試紙${p > 8.3 ? '變<b>藍</b>' : '不變'}、藍色試紙${p < 4.5 ? '變<b>紅</b>' : '不變'}<br>酚酞：<b>${m.phenol(p) === 'pink' ? '粉紅色' : '無色'}</b>　BTB：<b>${{ yellow: '黃色', green: '綠色', blue: '藍色' }[m.btb(p)]}</b>` + (mode === 'neut' ? `<br><span class="muted">H⁺ ${k.fmt(2, 1)} mmol，加入 OH⁻ ${k.fmt(vb * 0.1, 2)} mmol${Math.abs(vb - 20) < 0.01 ? '：剛好中和！' : ''}</span>` : ''),
          `pH = <b>${k.fmt(p, 2)}</b> → <b>${ke}</b><br>Litmus: red paper ${p > 8.3 ? 'turns <b>blue</b>' : 'stays red'}, blue paper ${p < 4.5 ? 'turns <b>red</b>' : 'stays blue'}<br>Phenolphthalein: <b>${m.phenol(p) === 'pink' ? 'pink' : 'colorless'}</b>　BTB: <b>${m.btb(p)}</b>` + (mode === 'neut' ? `<br><span class="muted">H⁺ 2.0 mmol; OH⁻ added ${k.fmt(vb * 0.1, 2)} mmol${Math.abs(vb - 20) < 0.01 ? ' — exactly neutralized!' : ''}</span>` : '')));
        void lit;
      });
    },
    observe: [
      { try: T('用「酚酞」測試白醋、純水和肥皂水。', 'Test vinegar, pure water and soapy water with phenolphthalein.'),
        ask: T('酚酞在哪一個變成粉紅色？', 'In which one does phenolphthalein turn pink?'),
        options: [T('肥皂水', 'Soapy water'), T('白醋', 'Vinegar'), T('純水', 'Pure water')],
        why: T('酚酞在酸性和中性溶液中無色，在鹼性溶液（pH 約 8.2 以上）中變成粉紅色。肥皂水是鹼性的。', 'Phenolphthalein is colorless in acidic and neutral solutions and turns pink in basic ones (above about pH 8.2). Soapy water is basic.') },
      { try: T('用「石蕊試紙」測試檸檬汁。', 'Test lemon juice with litmus paper.'),
        ask: T('檸檬汁讓哪一張試紙變色？', 'Which litmus paper changes color in lemon juice?'),
        options: [T('藍色石蕊試紙變紅', 'Blue litmus turns red'), T('紅色石蕊試紙變藍', 'Red litmus turns blue'), T('兩張都不變', 'Neither changes')],
        why: T('酸性溶液使藍色石蕊試紙變紅；鹼性溶液使紅色石蕊試紙變藍。檸檬汁 pH 約 2，是酸性。', 'Acids turn blue litmus red; bases turn red litmus blue. Lemon juice (pH about 2) is acidic.') },
      { try: T('換到「酸鹼中和」，用廣用試劑，把 NaOH 慢慢加到 20 mL。', 'Switch to Neutralization with universal indicator and slowly add NaOH up to 20 mL.'),
        ask: T('加到 20 mL 時發生什麼事？', 'What happens at 20 mL?'),
        options: [T('pH 剛好 7，酸和鹼完全中和', 'pH is exactly 7 — the acid is completely neutralized'), T('溶液變成強酸', 'It becomes a strong acid'), T('pH 會一直維持 1', 'The pH stays at 1')],
        why: T('20 mL 0.1 M 鹽酸含 2 mmol H⁺，加入 20 mL 0.1 M NaOH 含 2 mmol OH⁻，剛好結合成水：H⁺ + OH⁻ → H₂O，溶液變成中性的食鹽水。', '20 mL of 0.1 M HCl has 2 mmol of H⁺. 20 mL of 0.1 M NaOH adds 2 mmol of OH⁻. They combine exactly into water (H⁺ + OH⁻ → H₂O), leaving neutral salt water.') },
      { try: T('在接近 20 mL 時（例如 19 → 21 mL），仔細看 pH 怎麼變。', 'Near 20 mL (say 19 → 21 mL), watch the pH closely.'),
        ask: T('在中和點附近，pH…', 'Near the neutralization point, the pH…'),
        options: [T('變化得非常快（一下子跳很多）', 'changes very quickly — it jumps'), T('幾乎不變', 'hardly changes'), T('慢慢地平均改變', 'changes slowly and evenly')],
        why: T('pH 是對數：剩下的酸從 0.1 mmol 變成 0 再變成多 0.1 mmol 的鹼，pH 會從大約 2.6 跳到 11.4。所以滴定時接近終點要一滴一滴慢慢加。', 'pH is logarithmic: going from 0.1 mmol of leftover acid to 0.1 mmol of extra base makes the pH jump from about 2.6 to 11.4. That is why you add the last drops slowly in a titration.') },
    ],
  },
  {
    id: 'balance-equations', grades: [8, 9], subj: 'chem', icon: '⚗️',
    name: T('平衡化學反應式', 'Balancing chemical equations'),
    intro: T('化學反應時原子不會憑空出現或消失，只是重新組合（質量守恆）。調整每個分子前面的係數，讓反應前後每一種原子的數目都相等。下面的小球會幫你數原子。',
      'In a chemical reaction atoms are never created or destroyed — they are only rearranged (conservation of mass). Change the coefficient in front of each substance until every kind of atom has the same count on both sides. The balls below count the atoms for you.'),
    cur: { tw: T('國中 理化 化學反應與質量守恆', 'Junior high physical science · reactions and conservation of mass'), us: 'NGSS MS-PS1-5' },
    model: eqn,
    checks(m, ok) {
      ok(JSON.stringify(m.parseFormula('Ca(OH)2')) === JSON.stringify({ Ca: 1, O: 2, H: 2 }) && m.parseFormula('C6H12O6').H === 12 && m.parseFormula('Al2(SO4)3').O === 12, 'formula parser');
      for (const eq of m.EQS) {
        ok(m.count(eq, eq.ans).balanced && m.lowest(eq.ans), `${eq.L.join('+')} → ${eq.R.join('+')} answer balanced and lowest`);
        // brute force: the answer is the balanced set with the smallest coefficients
        const n = eq.ans.length; let best = null;
        const rec = (i, co) => { if (best) return; if (i === n) { if (m.count(eq, co).balanced) best = co.slice(); return; } for (let c = 1; c <= 8; c++) { co[i] = c; rec(i + 1, co); } };
        rec(0, []);
        ok(best && best.join() === eq.ans.join(), `${eq.L.join('+')}: smallest solution ${best} = ${eq.ans}`);
      }
      ok(!m.count(m.EQS[0], [1, 1, 1]).balanced, 'H2 + O2 → H2O with 1,1,1 is not balanced');
    },
    mount(k) {
      const m = eqn, v = k.canvas(640, 300), { ctx, W, H } = v;
      let qi = 0, co = [];
      const box = k.el('div', 'eqbox'); k.stage.prepend(box);
      const COL = { H: '#f1f3f5', O: '#e5484d', C: '#343a40', N: '#3b7be0', Na: '#9c6ade', Cl: '#2fb344', Fe: '#c2620c', Al: '#adb5bd', Cu: '#d9822b', Mg: '#94d82d', K: '#cc5de8', S: '#fab005', Ca: '#74c0fc' };
      const build = () => {
        const eq = m.EQS[qi]; co = eq.ans.map(() => 1);
        const sp = [...eq.L, '→', ...eq.R];
        let j = 0;
        box.innerHTML = sp.map((f, i) => {
          if (f === '→') return '<span class="eqop">→</span>';
          const idx = j++, plus = (i > 0 && sp[i - 1] !== '→') ? '<span class="eqop">+</span>' : '';
          return `${plus}<span class="eqsp"><span class="eqc"><button type="button" data-i="${idx}" data-d="1">▲</button><b data-c="${idx}">1</b><button type="button" data-i="${idx}" data-d="-1">▼</button></span><span class="eqf">${fmtSub(f)}</span></span>`;
        }).join('');
        box.querySelectorAll('button').forEach((b) => k.on(b, 'click', () => { const i = +b.dataset.i; co[i] = Math.max(1, Math.min(12, co[i] + +b.dataset.d)); box.querySelector(`[data-c="${i}"]`).textContent = co[i]; }));
      };
      k.seg({ label: T('反應', 'Reaction'), value: 0, options: m.EQS.map((e, i) => ({ v: i, label: `${e.L.join('+')}` })), onChange: (x) => { qi = x; build(); } });
      k.buttons([{ label: T('💡 看答案', '💡 Show answer'), on: () => { m.EQS[qi].ans.forEach((a, i) => { co[i] = a; box.querySelector(`[data-c="${i}"]`).textContent = a; }); } }, { label: T('↺ 全部設為 1', '↺ All back to 1'), on: build }]);
      const ro = k.readout();
      build();
      k.loop(() => {
        const c = k.colors(), eq = m.EQS[qi], r = m.count(eq, co);
        ctx.clearRect(0, 0, W, H);
        k.text(ctx, k.L('反應物', 'Reactants'), 160, 22, { color: c.ink, size: 17, bold: true, align: 'center' });
        k.text(ctx, k.L('生成物', 'Products'), 480, 22, { color: c.ink, size: 17, bold: true, align: 'center' });
        k.line(ctx, 320, 10, 320, H - 10, c.line, 2, [5, 5]);
        r.els.forEach((el, row) => {
          const y = 60 + row * (220 / Math.max(3, r.els.length)), nl = r.l[el] || 0, nr = r.r[el] || 0, okRow = nl === nr;
          const balls = (n, x0) => { const per = 12, rr = Math.min(9, 120 / Math.max(per, 1) / 1.1); for (let i = 0; i < n; i++) k.circle(ctx, x0 + (i % per) * (rr * 2.2), y + Math.floor(i / per) * (rr * 2.2) - 6, rr, COL[el] || '#888', c.ink, 1); };
          balls(nl, 40); balls(nr, 360);
          k.text(ctx, `${el}: ${nl}`, 300, y - 6, { color: okRow ? c.ok : c.no, size: 16, bold: true, align: 'right' });
          k.text(ctx, `${nr}`, 340, y - 6, { color: okRow ? c.ok : c.no, size: 16, bold: true });
          k.text(ctx, okRow ? '✔' : '✘', 625, y - 6, { color: okRow ? c.ok : c.no, size: 18, bold: true, align: 'right' });
        });
        const low = m.lowest(co);
        ro.set(r.balanced ? (low ? k.L('🎉 <b>平衡了！</b>每一種原子在兩邊的數目都一樣。', '🎉 <b>Balanced!</b> Every kind of atom has the same count on both sides.')
          : k.L('兩邊平衡了，但係數可以再約分成最簡單的整數比。', 'Balanced, but the coefficients can be divided down to the smallest whole numbers.'))
          : k.L('還沒平衡：紅色的原子兩邊數目不一樣。只能改係數，不能改化學式裡的小數字！', 'Not balanced yet: the red atoms don’t match. Change only the coefficients — never the small numbers inside a formula!'));
      });
    },
    observe: [
      { try: T('選 H₂ + O₂ → H₂O，先全部設為 1，看氧原子。', 'Pick H₂ + O₂ → H₂O with all coefficients 1 and look at oxygen.'),
        ask: T('為什麼不能把 H₂O 改成 H₂O₂ 來平衡？', 'Why can’t we balance it by changing H₂O into H₂O₂?'),
        options: [T('改化學式會變成另一種物質（過氧化氫）', 'Changing the formula makes a different substance (hydrogen peroxide)'), T('因為 H₂O₂ 太重', 'Because H₂O₂ is too heavy'), T('其實可以，兩種寫法一樣', 'It’s fine — both mean the same')],
        why: T('化學式代表物質本身，H₂O 是水，H₂O₂ 是雙氧水。平衡時只能改前面的係數（分子的個數）。', 'A formula says which substance it is: H₂O is water, H₂O₂ is hydrogen peroxide. To balance, change only the coefficients — how many molecules.') },
      { try: T('把 H₂ + O₂ → H₂O 平衡好。', 'Balance H₂ + O₂ → H₂O.'),
        ask: T('正確的係數是？', 'The coefficients are…'),
        options: ['2, 1, 2', '1, 1, 1', '2, 2, 2'],
        why: T('2H₂ + O₂ → 2H₂O：左邊 4 個 H、2 個 O，右邊 4 個 H、2 個 O。（2, 2, 2 不平衡：左邊 4 個 O、右邊只有 2 個。）', '2H₂ + O₂ → 2H₂O: 4 H and 2 O on each side. (2, 2, 2 isn’t balanced: 4 O on the left but only 2 on the right.)') },
      { try: T('平衡 CH₄ + O₂ → CO₂ + H₂O（天然氣燃燒）。', 'Balance CH₄ + O₂ → CO₂ + H₂O (burning natural gas).'),
        ask: T('一個甲烷分子需要幾個氧分子？', 'How many O₂ molecules does one CH₄ need?'),
        options: ['2', '1', '4'],
        why: T('CH₄ + 2O₂ → CO₂ + 2H₂O：先平衡 C（1 個）和 H（4 個 → 2 個 H₂O），右邊共有 2 + 2 = 4 個 O，所以需要 2 個 O₂。', 'CH₄ + 2O₂ → CO₂ + 2H₂O: balance C (1) and H (4 → two H₂O) first; then the right side has 2 + 2 = 4 O atoms, so we need 2 O₂.') },
    ],
  },
  {
    id: 'electromagnet', grades: [8, 9], subj: 'phys', icon: '🧲',
    name: T('電磁鐵', 'Electromagnets'),
    intro: T('電流通過線圈會產生磁場，線圈中放鐵芯磁性會強很多，這就是電磁鐵。改變電池數（電流）、線圈圈數和鐵芯，看它能吸起幾個迴紋針；把電池反接，看指北針怎麼轉。',
      'Current through a coil makes a magnetic field, and an iron core inside makes it much stronger — an electromagnet. Change the number of batteries (current), the number of turns and the core, and count the paper clips it picks up. Reverse the battery and watch the compasses.'),
    cur: { tw: T('國中 理化 電流的磁效應', 'Junior high physical science · magnetic effects of current'), us: 'NGSS MS-PS2-3' },
    model: emag,
    checks(m, ok) {
      const I = m.current(2);
      ok(Math.abs(I - 1.5) < 1e-9, '2 cells (3 V) through 2 Ω → 1.5 A');
      ok(Math.abs(m.strength(100, I, true) / m.strength(50, I, true) - 2) < 1e-9, 'twice the turns → twice as strong');
      ok(Math.abs(m.strength(50, m.current(2), true) / m.strength(50, m.current(1), true) - 2) < 1e-9, 'twice the current → twice as strong');
      ok(m.strength(50, I, true) > 50 * m.strength(50, I, false), 'iron core makes it much stronger');
      ok(m.northEnd(false) !== m.northEnd(true), 'reversing the current swaps the poles');
      ok(m.clips(m.strength(100, 0, true)) === 0 && m.clips(m.strength(100, m.current(3), true)) > m.clips(m.strength(20, m.current(1), true)), 'no current → no clips; more → more');
    },
    mount(k) {
      const m = emag, v = k.canvas(640, 360), { ctx, W, H } = v;
      let cells = 1, N = 40, core = true, rev = false, on = true, t = 0;
      k.slider({ label: T('電池數（串聯）', 'Batteries (in series)'), min: 1, max: 3, step: 1, value: cells, onInput: (x) => (cells = x) });
      k.slider({ label: T('線圈圈數', 'Turns of wire'), min: 10, max: 100, step: 10, value: N, unit: T('圈', 'turns'), onInput: (x) => (N = x) });
      k.toggle({ label: T('放入鐵芯', 'Iron core inside'), value: true, onChange: (x) => (core = x) });
      k.toggle({ label: T('電池反接', 'Battery reversed'), value: false, onChange: (x) => (rev = x) });
      k.toggle({ label: T('開關接通', 'Switch on'), value: true, onChange: (x) => (on = x) });
      const ro = k.readout();
      k.loop((dt) => {
        t += dt; const c = k.colors(), I = on ? m.current(cells) : 0, s = m.strength(N, I, core), clips = m.clips(s), nE = m.northEnd(rev);
        ctx.clearRect(0, 0, W, H);
        const cx = 320, cy = 140, len = 240;
        if (core) k.rrect(ctx, cx - len / 2 - 20, cy - 16, len + 40, 32, 6, '#8a9199', c.ink, 1.5);
        else { ctx.strokeStyle = c.line; ctx.setLineDash([4, 4]); ctx.strokeRect(cx - len / 2 - 20, cy - 16, len + 40, 32); ctx.setLineDash([]); }
        const turnsDrawn = Math.round(N / 5);
        for (let i = 0; i < turnsDrawn; i++) { const x = cx - len / 2 + (i + 0.5) * (len / turnsDrawn); ctx.strokeStyle = '#c87533'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, cy, 5, 26, 0, 0, Math.PI * 2); ctx.stroke(); }
        // wires to battery
        k.line(ctx, cx - len / 2, cy + 26, cx - len / 2, 290, '#c87533', 3); k.line(ctx, cx + len / 2, cy + 26, cx + len / 2, 290, '#c87533', 3);
        k.line(ctx, cx - len / 2, 290, cx - 40, 290, '#c87533', 3); k.line(ctx, cx + 40, 290, cx + len / 2, 290, '#c87533', 3);
        for (let i = 0; i < cells; i++) { const x = cx - 30 + i * 22; k.rrect(ctx, x, 276, 18, 28, 3, '#2b2d42'); k.text(ctx, rev ? '−' : '+', x + 9, 270, { color: rev ? c.acc2 : c.no, size: 13, bold: true, align: 'center' }); }
        if (I > 0) for (let i = 0; i < 10; i++) { const u = ((t * 0.6 * I + i / 10) % 1), dir = rev ? -1 : 1; const x = cx - len / 2 + (dir > 0 ? u : 1 - u) * len; k.circle(ctx, x, 290, 3, '#ffb300'); }
        // poles
        if (s > 0) {
          const nL = nE === 'left';
          k.text(ctx, nL ? 'N' : 'S', cx - len / 2 - 40, cy, { color: nL ? '#e5484d' : '#3b7be0', size: 28, bold: true, align: 'center' });
          k.text(ctx, nL ? 'S' : 'N', cx + len / 2 + 40, cy, { color: nL ? '#3b7be0' : '#e5484d', size: 28, bold: true, align: 'center' });
        }
        // compasses: needle's N end points away from the N pole (field lines leave N) — near the right end it points right if the right end is N
        const comp = (x, y, ang) => { k.circle(ctx, x, y, 24, c.card, c.ink, 2); ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(0, -5); ctx.lineTo(0, 5); ctx.fill(); ctx.fillStyle = '#3b7be0'; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(0, -5); ctx.lineTo(0, 5); ctx.fill(); ctx.restore(); };
        const north = -Math.PI / 2, pull = Math.min(1, s / 3);
        const leftAng = s > 0 ? (nE === 'left' ? Math.PI : 0) : north, rightAng = s > 0 ? (nE === 'right' ? 0 : Math.PI) : north;
        const mixA = (a, b, f) => a + (Math.atan2(Math.sin(b - a), Math.cos(b - a))) * f;
        comp(70, cy, mixA(north, leftAng, pull)); comp(570, cy, mixA(north, rightAng, pull));
        // clips hanging under the core
        for (let i = 0; i < clips; i++) { const x = cx - len / 2 + 10 + (i % 12) * 20, y = cy + 34 + Math.floor(i / 12) * 26; emo(k, ctx, '📎', x, y, 20); }
        for (let i = clips; i < 24; i++) emo(k, ctx, '📎', 140 + (i % 12) * 30, 340 - Math.floor(i / 12) * 4, 18);
        ro.set(k.L(`電流 I = ${cells * 1.5} V ÷ ${m.R} Ω = <b>${k.fmt(I, 2)} A</b><br>磁力強度（相對）∝ 圈數 × 電流${core ? ' × 鐵芯' : ''} = <b>${k.fmt(s, 2)}</b><br>吸起 <b>${clips}</b> 個迴紋針　N 極在<b>${nE === 'left' ? '左' : '右'}</b>端`,
          `Current I = ${cells * 1.5} V ÷ ${m.R} Ω = <b>${k.fmt(I, 2)} A</b><br>Strength (relative) ∝ turns × current${core ? ' × iron core' : ''} = <b>${k.fmt(s, 2)}</b><br>Picks up <b>${clips}</b> clips　N pole on the <b>${nE}</b> end`));
      });
    },
    observe: [
      { try: T('保持其他條件不變，把線圈從 20 圈加到 80 圈。', 'Keep everything else the same and go from 20 to 80 turns.'),
        ask: T('線圈圈數變多，電磁鐵…', 'With more turns, the electromagnet…'),
        options: [T('磁力變強，吸更多迴紋針', 'gets stronger and picks up more clips'), T('磁力變弱', 'gets weaker'), T('沒有改變', 'doesn’t change')],
        why: T('每一圈電流都產生磁場，圈數愈多，磁場疊加愈強。', 'Every turn of current adds its own magnetic field, so more turns make a stronger magnet.') },
      { try: T('關掉「放入鐵芯」。', 'Turn off the iron core.'),
        ask: T('拿掉鐵芯以後…', 'Without the iron core…'),
        options: [T('磁力弱很多，幾乎吸不起迴紋針', 'it is much weaker and picks up almost nothing'), T('磁力變得更強', 'it gets stronger'), T('完全一樣', 'it is exactly the same')],
        why: T('鐵芯在線圈的磁場中被磁化，自己也變成磁鐵，讓磁場強很多倍。', 'The iron core is magnetized by the coil’s field and becomes a magnet itself, making the field many times stronger.') },
      { try: T('打開「電池反接」，看兩邊的指北針。', 'Turn on “Battery reversed” and watch both compasses.'),
        ask: T('電流方向相反時，電磁鐵的 N、S 極…', 'When the current reverses, the N and S poles…'),
        options: [T('互換', 'swap ends'), T('不會變', 'stay the same'), T('消失', 'disappear')],
        why: T('電磁鐵的極性由電流方向決定（右手定則：四指沿電流方向彎曲，大拇指指向 N 極）。電流反向，N、S 極就互換。', 'The poles depend on the current’s direction (right-hand rule: curl your fingers with the current and your thumb points to N). Reverse the current and the poles swap.') },
      { try: T('關掉「開關接通」。', 'Turn the switch off.'),
        ask: T('切斷電流後，迴紋針…', 'When the current stops, the paper clips…'),
        options: [T('掉下來，因為磁性消失了', 'fall off, because the magnetism is gone'), T('還是吸著不掉', 'stay stuck'), T('被推開', 'get pushed away')],
        why: T('電磁鐵只有通電時才有磁性，可以隨時開關——這是它比永久磁鐵方便的地方，例如廢鐵場的起重電磁鐵。', 'An electromagnet is magnetic only while current flows, so it can be switched on and off — handy for things like scrapyard crane magnets.') },
    ],
  },
];

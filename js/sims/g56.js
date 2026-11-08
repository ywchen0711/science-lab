// Simulations for grades 5–6. Format: see SPEC.md. The pendulum is the reference example.
import { T } from '../util.js';


const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const emo = (k, ctx, e, x, y, size) => k.text(ctx, e, x, y, { size, align: 'center', font: EMOJI });
const D2R = Math.PI / 180;

// ---------------- light ----------------
const N_IDX = { air: 1.0, water: 1.33, glass: 1.5 };
const light = {
  N: N_IDX,
  // Snell's law n1·sin θ1 = n2·sin θ2 (degrees); null when there is total internal reflection
  refract(n1, n2, deg) { const s = (n1 / n2) * Math.sin(deg * D2R); return Math.abs(s) > 1 ? null : Math.asin(s) / D2R; },
  critical: (n1, n2) => (n1 > n2 ? Math.asin(n2 / n1) / D2R : null),
  reflect: (deg) => deg,
};

// ---------------- food chain ----------------
const chain = {
  P: { a1: 3, c1: 1, e1: 0.6, m1: 0.3, a2: 3, c2: 1.5, e2: 0.5, m2: 0.2 },
  // one step of a grass → rabbit → fox model (relative amounts; predators share food, so it settles down)
  step([G, R, F], dt, grow = 1) {
    const P = chain.P;
    const fr = (P.a1 * G * R) / (1 + P.a1 * G + P.c1 * R), ff = (P.a2 * R * F) / (1 + P.a2 * R + P.c2 * F);
    return [Math.max(0, G + (grow * G * (1 - G) - fr) * dt), Math.max(0, R + (P.e1 * fr - P.m1 * R - ff) * dt), Math.max(0, F + (P.e2 * ff - P.m2 * F) * dt)];
  },
  settle(opts = {}, T = 300) { let s = [0.8, 0.2, opts.fox === false ? 0 : 0.1]; if (opts.grass === false) s[0] = 0; for (let t = 0; t < T; t += 0.02) s = chain.step(s, 0.02, opts.grow ?? 1); return s; },
};
const WEB = {
  nodes: [
    { id: 'grass', zh: '草', en: 'grass', e: '🌿', x: 320, y: 340, lv: 0 },
    { id: 'hopper', zh: '蚱蜢', en: 'grasshopper', e: '🦗', x: 120, y: 250, lv: 1 },
    { id: 'rabbit', zh: '兔子', en: 'rabbit', e: '🐇', x: 320, y: 250, lv: 1 },
    { id: 'mouse', zh: '老鼠', en: 'mouse', e: '🐁', x: 520, y: 250, lv: 1 },
    { id: 'frog', zh: '青蛙', en: 'frog', e: '🐸', x: 120, y: 150, lv: 2 },
    { id: 'snake', zh: '蛇', en: 'snake', e: '🐍', x: 420, y: 150, lv: 3 },
    { id: 'hawk', zh: '老鷹', en: 'hawk', e: '🦅', x: 320, y: 55, lv: 4 },
    { id: 'fungi', zh: '菇類和細菌', en: 'fungi and bacteria', e: '🍄', x: 560, y: 345, lv: -1 },
  ],
  // arrows point from the food to the eater (the way energy flows)
  edges: [['grass', 'hopper'], ['grass', 'rabbit'], ['grass', 'mouse'], ['hopper', 'frog'], ['frog', 'snake'], ['mouse', 'snake'], ['mouse', 'hawk'], ['rabbit', 'hawk'], ['snake', 'hawk']],
};

// ---------------- seasons ----------------
const seasons = {
  TILT: 23.44,
  // Sun's declination (degrees) on day-of-year d (d = 80 ≈ March 21)
  decl: (d, tilt = 23.44) => tilt * Math.sin((2 * Math.PI * (d - 80)) / 365),
  noonAlt: (lat, dec) => 90 - Math.abs(lat - dec),
  // hours of daylight from cos H = −tan φ · tan δ
  dayLength(lat, dec) { const x = -Math.tan(lat * D2R) * Math.tan(dec * D2R); if (x <= -1) return 24; if (x >= 1) return 0; return (2 * Math.acos(x)) / D2R / 15; },
  // Earth–Sun distance in AU (closest, 0.983 AU, around January 3)
  dist: (d) => 1 - 0.0167 * Math.cos((2 * Math.PI * (d - 3)) / 365),
  // sunlight energy on flat ground at noon compared with the Sun straight overhead
  strength: (alt) => Math.max(0, Math.sin(alt * D2R)),
};

// ---------------- water cycle ----------------
const wcycle = {
  // saturation vapour pressure (hPa), Magnus formula
  es: (T) => 6.112 * Math.exp((17.67 * T) / (T + 243.5)),
  LAPSE: 6.5,                                 // air cools about 6.5 °C for every km you go up
  tempAt: (T0, km) => T0 - 6.5 * km,
  evapRate: (T) => wcycle.es(T) / wcycle.es(20),   // relative to a 20 °C sea
};

// ---------------- dissolving ----------------
const SOLUB = { // grams that dissolve in 100 g of water
  salt: [[0, 35.7], [20, 35.9], [40, 36.4], [60, 37.1], [80, 38.0], [100, 39.2]],
  sugar: [[0, 179], [20, 200], [40, 238], [60, 287], [80, 362], [100, 487]],
};
const dissolve = {
  SOLUB,
  solubility(kind, T) { const t = SOLUB[kind]; for (let i = 1; i < t.length; i++) if (T <= t[i][0]) { const [x0, y0] = t[i - 1], [x1, y1] = t[i]; return y0 + ((y1 - y0) * (T - x0)) / (x1 - x0); } return t[t.length - 1][1]; },
  // how much of `added` grams can dissolve in `water` grams at T °C
  result(kind, added, water, T) {
    const max = (dissolve.solubility(kind, T) * water) / 100, d = Math.min(added, max);
    return { max, dissolved: d, left: added - d, saturated: added >= max, total: water + added, percent: (100 * d) / (water + d) };
  },
};

const G = { earth: 9.8, moon: 1.62, mars: 3.71 };

// θ'' = −(g/L)·sin θ − c·θ'   (full non-linear pendulum, RK4)
function pendStep(s, dt, L, g, c = 0) {
  const f = (th, w) => [w, -(g / L) * Math.sin(th) - c * w];
  const [k1a, k1b] = f(s.th, s.w);
  const [k2a, k2b] = f(s.th + (dt / 2) * k1a, s.w + (dt / 2) * k1b);
  const [k3a, k3b] = f(s.th + (dt / 2) * k2a, s.w + (dt / 2) * k2b);
  const [k4a, k4b] = f(s.th + dt * k3a, s.w + dt * k3b);
  return { th: s.th + (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a), w: s.w + (dt / 6) * (k1b + 2 * k2b + 2 * k3b + k4b) };
}
const pendulum = {
  G,
  step: pendStep,
  // small-angle period T = 2π√(L/g)
  period: (L, g) => 2 * Math.PI * Math.sqrt(L / g),
  // energy per unit mass relative to the lowest point: ½(Lω)² + gL(1 − cos θ)
  energy: (s, L, g) => 0.5 * (L * s.w) ** 2 + g * L * (1 - Math.cos(s.th)),
  // simulate and measure the period from the first two times θ goes from + to − … (one full swing)
  measure(L, g, deg) {
    let s = { th: (deg * Math.PI) / 180, w: 0 }, t = 0, cross = [];
    const dt = 0.001;
    while (cross.length < 3 && t < 60) {
      const n = pendStep(s, dt, L, g);
      if (s.th > 0 && n.th <= 0) cross.push(t + dt * (s.th / (s.th - n.th)));
      s = n; t += dt;
    }
    return cross[2] - cross[1];
  },
};

export default [
  {
    id: 'pendulum',
    grades: [5, 6],
    subj: 'phys',
    icon: '⏱️',
    name: T('單擺', 'The pendulum'),
    intro: T('一個重物綁在繩子下面來回擺動，就是「擺」。擺來回一次所花的時間叫做「週期」。改變繩長、擺錘重量、放手的角度，甚至把擺帶到月球，看看哪些會改變週期。',
      'A weight hanging on a string that swings back and forth is a pendulum. The time for one full swing (there and back) is its period. Change the string length, the mass, the starting angle — even take it to the Moon — and find out what changes the period.'),
    cur: { tw: T('國小高年級 擺的規律', 'Upper elementary · pendulums'), us: 'NGSS 3-PS2-2' },
    model: pendulum,
    checks(m, ok) {
      // energy is conserved without friction
      let s = { th: 0.6, w: 0 }; const L = 1.2, g = 9.8, e0 = m.energy(s, L, g);
      for (let i = 0; i < 10000; i++) s = m.step(s, 0.001, L, g);
      ok(Math.abs(m.energy(s, L, g) - e0) / e0 < 1e-6, 'pendulum energy drifts');
      // small swings follow T = 2π√(L/g)
      ok(Math.abs(m.measure(1, 9.8, 5) - m.period(1, 9.8)) < 0.01, 'small-angle period ≠ 2π√(L/g)');
      ok(Math.abs(m.period(1, 9.8) - 2.007) < 0.001, 'period of 1 m pendulum should be 2.007 s');
      // 4× length → 2× period; Moon is slower; bigger angle is a little slower
      ok(Math.abs(m.period(4, 9.8) / m.period(1, 9.8) - 2) < 1e-9, 'period should scale with √L');
      ok(m.measure(1, 1.62, 10) > m.measure(1, 9.8, 10) * 2.4, 'moon pendulum should be ~2.46× slower');
      const p10 = m.measure(1, 9.8, 10), p40 = m.measure(1, 9.8, 40);
      ok(p40 > p10 && p40 / p10 < 1.04, 'large-angle correction should be small and positive');
      // damping removes energy
      s = { th: 0.6, w: 0 }; for (let i = 0; i < 5000; i++) s = m.step(s, 0.001, L, g, 0.3);
      ok(m.energy(s, L, g) < e0, 'damping should remove energy');
    },
    mount(k) {
      const m = pendulum;
      const v = k.canvas(640, 380), { ctx, W, H } = v;
      let L = 1, deg = 20, mass = 0.5, g = G.earth, fric = false;
      let s = { th: (deg * Math.PI) / 180, w: 0 }, t = 0, swings = 0, lastSign = 1, timing = 0, held = false, trail = [];
      const reset = () => { s = { th: (deg * Math.PI) / 180, w: 0 }; t = 0; swings = 0; lastSign = 1; timing = 0; trail = []; };
      const pxPerM = 140, px = W / 2, py = 30;
      k.slider({ label: T('繩長', 'String length'), min: 0.2, max: 2.2, step: 0.05, value: L, unit: T('公尺', 'm'), onInput: (x) => { L = x; reset(); } });
      k.slider({ label: T('放手角度', 'Release angle'), min: 5, max: 70, step: 1, value: deg, unit: '°', onInput: (x) => { deg = x; reset(); } });
      k.slider({ label: T('擺錘質量', 'Mass of the bob'), min: 0.1, max: 2, step: 0.1, value: mass, unit: T('公斤', 'kg'), onInput: (x) => { mass = x; reset(); } });
      k.seg({ label: T('在哪裡擺？', 'Where?'), value: 'earth', options: [
        { v: 'earth', label: T('🌍 地球', '🌍 Earth') }, { v: 'moon', label: T('🌙 月球', '🌙 Moon') }, { v: 'mars', label: T('🔴 火星', '🔴 Mars') }],
        onChange: (x) => { g = G[x]; reset(); } });
      k.toggle({ label: T('有空氣阻力（會慢慢停下）', 'Air friction (slowly stops)'), value: false, onChange: (x) => (fric = x) });
      k.buttons([{ label: T('⟲ 重新放手', '⟲ Release again'), primary: true, on: reset }]);
      const ro = k.readout();
      k.pointer(v.cv, {
        down(p) { const bx = px + Math.sin(s.th) * L * pxPerM, by = py + Math.cos(s.th) * L * pxPerM; if (Math.hypot(p.x - bx, p.y - by) < 40) held = true; },
        move(p, d) { if (held && d) { s = { th: Math.max(-1.3, Math.min(1.3, Math.atan2(p.x - px, p.y - py))), w: 0 }; deg = Math.round(Math.abs(s.th) * 180 / Math.PI); } },
        up() { if (held) { held = false; t = 0; swings = 0; timing = 0; trail = []; lastSign = Math.sign(s.th) || 1; } },
      });
      k.loop((dt) => {
        if (!held) {
          const n = 10;
          for (let i = 0; i < n; i++) {
            const prev = s.th;
            s = m.step(s, dt / n, L, g, fric ? 0.15 : 0);
            t += dt / n;
            if (prev > 0 && s.th <= 0) { if (timing) swings++; timing = timing || t; }
          }
        }
        const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = c.soft; ctx.fillRect(0, 0, W, 18);
        k.line(ctx, px - 60, 18, px + 60, 18, c.ink, 3);
        // protractor-ish guide
        k.line(ctx, px, py, px, py + L * pxPerM + 30, c.line, 1, [4, 4]);
        const bx = px + Math.sin(s.th) * L * pxPerM, by = py + Math.cos(s.th) * L * pxPerM;
        trail.push([bx, by]); if (trail.length > 60) trail.shift();
        ctx.save(); ctx.globalAlpha = 0.35; trail.forEach(([x, y], i) => k.circle(ctx, x, y, 2 + i / 30, c.acc2)); ctx.restore();
        k.line(ctx, px, py, bx, by, c.ink, 2);
        k.circle(ctx, px, py, 4, c.ink);
        const r = 10 + 10 * Math.cbrt(mass);
        k.circle(ctx, bx, by, r, c.acc, c.ink, 2);
        k.text(ctx, `${k.fmt(mass, 1)} kg`, bx, by, { color: '#fff', size: r > 17 ? 13 : 11, align: 'center', bold: true });
        // ruler
        k.text(ctx, `L = ${k.fmt(L, 2)} m`, px + 70, py + 10, { color: c.muted, size: 17 });
        const Tf = m.period(L, g), meas = swings > 0 ? (t - timing) / swings : null;
        ro.set(`<div><b>${k.L('週期公式', 'Formula')}</b> T = 2π√(L/g) = <b>${k.fmt(Tf, 2)} s</b></div>
          <div><b>${k.L('實際計時', 'Stopwatch')}</b> ${meas ? `${k.L(`擺了 ${swings} 次，平均每次`, `${swings} swings, average`)} <b>${k.fmt(meas, 2)} s</b>` : k.L('等它擺一次…', 'wait for one swing…')}</div>
          <div class="muted">g = ${k.fmt(g, 2)} m/s²　${k.L('時間', 'time')} ${k.fmt(t, 1)} s</div>`);
      });
    },
    observe: [
      { try: T('把繩長調成 2 公尺看看擺得多慢，再調成 0.5 公尺。', 'Set the string to 2 m and watch, then change it to 0.5 m.'),
        ask: T('繩子變短，擺動有什麼改變？', 'What happens when the string gets shorter?'),
        options: [T('擺得比較快，週期變短', 'It swings faster — the period gets shorter'), T('擺得比較慢，週期變長', 'It swings slower — the period gets longer'), T('完全沒有改變', 'Nothing changes')],
        why: T('繩長愈短，擺錘走的弧愈短，週期就愈短。公式 T = 2π√(L/g)：繩長變成 ¼，週期變成一半。', 'A shorter string means a shorter arc, so the period is shorter. From T = 2π√(L/g): a string ¼ as long swings with half the period.') },
      { try: T('繩長不變，把擺錘質量從 0.1 公斤調到 2 公斤，看計時。', 'Keep the length the same and change the mass from 0.1 kg to 2 kg. Watch the stopwatch.'),
        ask: T('擺錘變重，週期會怎樣？', 'What does a heavier bob do to the period?'),
        options: [T('幾乎不變', 'It stays the same'), T('變短（擺得比較快）', 'It gets shorter (faster)'), T('變長（擺得比較慢）', 'It gets longer (slower)')],
        why: T('重的擺錘受到較大的重力，但也比較難推動，兩個效果剛好抵消，所以週期和質量無關。', 'A heavier bob is pulled harder by gravity, but it is also harder to speed up. The two effects cancel, so the period does not depend on the mass.') },
      { try: T('選「月球」，比較它和地球的週期。', 'Pick “Moon” and compare its period with Earth’s.'),
        ask: T('在月球上，同一個擺會…', 'On the Moon, the same pendulum…'),
        options: [T('擺得比較慢', 'swings more slowly'), T('擺得比較快', 'swings faster'), T('擺的速度一樣', 'swings at the same rate')],
        why: T('月球的重力只有地球的大約六分之一（g = 1.62 m/s²），把擺錘拉回來的力比較小，所以擺得比較慢，週期大約是地球的 2.5 倍。', 'Gravity on the Moon is about one sixth of Earth’s (g = 1.62 m/s²). The pull back to the middle is weaker, so it swings slower — the period is about 2.5 times longer.') },
      { try: T('在地球上，把放手角度從 10° 改成 40°，比較計時的週期。', 'On Earth, change the release angle from 10° to 40° and compare the measured period.'),
        ask: T('擺幅變大，週期改變多少？', 'How much does a bigger swing change the period?'),
        options: [T('只變長一點點（大約 3%）', 'Only a tiny bit longer (about 3 %)'), T('變成兩倍', 'It doubles'), T('變成一半', 'It halves')],
        why: T('擺幅大時要走比較長的路，但速度也比較快，所以週期幾乎一樣——這叫做「擺的等時性」。角度很大時才會稍微變長。', 'A bigger swing travels farther but also moves faster, so the period hardly changes — pendulums keep nearly equal time. Only at large angles does it get slightly longer.') },
    ],
  },
  {
    id: 'light', grades: [5, 6], subj: 'phys', icon: '🔦',
    name: T('光的反射與折射', 'Reflection and refraction of light'),
    intro: T('光照到鏡子會反彈回來（反射），從空氣斜斜地照進水或玻璃會轉彎（折射）。轉動雷射筆的角度，比較入射角、反射角和折射角。最後試試光從水裡射向空氣，角度大到某個程度會發生什麼事？',
      'Light bounces off a mirror (reflection) and bends when it goes at a slant from air into water or glass (refraction). Turn the laser and compare the angles. Finally, shine light from water up into air — what happens when the angle gets big?'),
    cur: { tw: T('國小高年級 光的反射與折射', 'Upper elementary · reflection and refraction'), us: 'NGSS 4-PS4-2' },
    model: light,
    checks(m, ok) {
      ok(m.reflect(35) === 35, 'angle of reflection = angle of incidence');
      ok(Math.abs(m.refract(1, 1.33, 30) - 22.08) < 0.05, 'air → water at 30° bends to about 22.1°');
      ok(m.refract(1, 1.33, 0) === 0, 'straight in → no bending');
      ok(m.refract(1, 1.5, 40) < m.refract(1, 1.33, 40), 'glass bends light more than water');
      ok(Math.abs(m.critical(1.33, 1) - 48.75) < 0.05 && m.refract(1.33, 1, 50) === null && m.refract(1.33, 1, 45) !== null, 'total internal reflection beyond ≈ 48.8° (water → air)');
      const t = m.refract(1, 1.33, 50); ok(Math.abs(Math.sin(50 * D2R) - 1.33 * Math.sin(t * D2R)) < 1e-12, 'Snell’s law holds');
    },
    mount(k) {
      const m = light, v = k.canvas(640, 400), { ctx, W, H } = v;
      let mode = 'mirror', ang = 40;
      k.seg({ label: T('實驗', 'Setup'), value: 'mirror', options: [{ v: 'mirror', label: T('🪞 鏡子', '🪞 Mirror') }, { v: 'water', label: T('空氣 → 水', 'Air → water') }, { v: 'glass', label: T('空氣 → 玻璃', 'Air → glass') }, { v: 'up', label: T('水 → 空氣', 'Water → air') }], onChange: (x) => (mode = x) });
      const sl = k.slider({ label: T('入射角（和法線的夾角）', 'Angle of incidence (from the normal)'), min: 0, max: 85, step: 1, value: ang, unit: '°', onInput: (x) => (ang = x) });
      const ro = k.readout();
      const O = { x: 320, y: 210 }, L = 230;
      k.pointer(v.cv, { move(p, d) { if (!d) return; const up = mode !== 'up'; const dx = p.x - O.x, dy = up ? O.y - p.y : p.y - O.y; if (dy <= 2) return; sl.set(Math.min(85, Math.round(Math.atan2(Math.abs(dx), dy) / D2R))); } });
      const beam = (x1, y1, x2, y2, alpha = 1, w = 4) => { ctx.save(); ctx.globalAlpha = alpha; ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 10; k.line(ctx, x1, y1, x2, y2, '#ff3b3b', w); ctx.restore(); };
      const arc = (a0, a1, r, col, label) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(O.x, O.y, r, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke(); const am = (a0 + a1) / 2; k.text(ctx, label, O.x + Math.cos(am) * (r + 22), O.y + Math.sin(am) * (r + 22), { color: col, size: 16, bold: true, align: 'center' }); };
      k.loop(() => {
        const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        const n1 = mode === 'up' ? N_IDX.water : 1, n2 = mode === 'water' ? N_IDX.water : mode === 'glass' ? N_IDX.glass : 1;
        // media
        if (mode === 'mirror') { ctx.fillStyle = c.dark ? '#5d6b73' : '#c9d6dd'; ctx.fillRect(40, O.y, 560, 14); k.line(ctx, 40, O.y, 600, O.y, '#ffffff', 2); for (let x = 50; x < 600; x += 18) k.line(ctx, x, O.y + 14, x - 10, O.y + 28, c.muted, 1.5); }
        else {
          ctx.fillStyle = mode === 'glass' ? 'rgba(160,220,215,0.45)' : 'rgba(80,160,235,0.35)'; ctx.fillRect(0, O.y, W, H - O.y);
          k.line(ctx, 0, O.y, W, O.y, c.ink, 2);
          k.text(ctx, k.L('空氣', 'air'), 20, 30, { color: c.ink, size: 16, bold: true });
          k.text(ctx, k.L(mode === 'glass' ? '玻璃' : '水', mode === 'glass' ? 'glass' : 'water'), 20, H - 24, { color: c.ink, size: 16, bold: true });
        }
        // normal
        k.line(ctx, O.x, 20, O.x, H - 20, c.muted, 1.5, [6, 6]);
        k.text(ctx, k.L('法線', 'normal'), O.x + 6, 30, { color: c.muted, size: 14 });
        const a = ang * D2R, sgnY = mode === 'up' ? 1 : -1;   // the source is above (−y) unless shining up from the water
        const sx = O.x - Math.sin(a) * L, sy = O.y + sgnY * Math.cos(a) * L;
        beam(sx, sy, O.x, O.y);
        k.arrow(ctx, sx + (O.x - sx) * 0.45, sy + (O.y - sy) * 0.45, sx + (O.x - sx) * 0.55, sy + (O.y - sy) * 0.55, '#ff3b3b', 3, 14);
        // laser pen
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.atan2(O.y - sy, O.x - sx)); k.rrect(ctx, -50, -9, 50, 18, 5, c.dark ? '#cfd8dc' : '#37474f'); ctx.restore();
        const nSrc = sgnY < 0 ? -Math.PI / 2 : Math.PI / 2;   // the normal on the source side (canvas angle)
        if (ang > 0) arc(nSrc, Math.atan2(sgnY * Math.cos(a), -Math.sin(a)), 60, '#ff6b6b', `${ang}°`);
        const t = mode === 'mirror' ? null : m.refract(n1, n2, ang);
        const reflAlpha = mode === 'mirror' || t === null ? 1 : 0.25;
        const rx = O.x + Math.sin(a) * L, ry = O.y + sgnY * Math.cos(a) * L;
        beam(O.x, O.y, rx, ry, reflAlpha, mode === 'mirror' || t === null ? 4 : 2.5);
        if ((mode === 'mirror' || t === null) && ang > 0) arc(nSrc, Math.atan2(sgnY * Math.cos(a), Math.sin(a)), 75, '#f59f00', `${ang}°`);
        if (t !== null && mode !== 'mirror') {
          const b = t * D2R, tx = O.x + Math.sin(b) * L, ty = O.y - sgnY * Math.cos(b) * L;
          beam(O.x, O.y, tx, ty);
          if (t > 0.05) arc(-nSrc, Math.atan2(-sgnY * Math.cos(b), Math.sin(b)), 70, '#2f9e44', `${k.fmt(t, 1)}°`);
        }
        let html;
        if (mode === 'mirror') html = k.L(`入射角 <b>${ang}°</b> ＝ 反射角 <b>${ang}°</b>`, `Angle of incidence <b>${ang}°</b> = angle of reflection <b>${ang}°</b>`);
        else if (t === null) html = k.L(`入射角 <b>${ang}°</b> 大於臨界角 <b>${k.fmt(m.critical(n1, n2), 1)}°</b>：光全部反射回水裡！這叫「全反射」。`, `Angle <b>${ang}°</b> is bigger than the critical angle <b>${k.fmt(m.critical(n1, n2), 1)}°</b>: all the light reflects back into the water — total internal reflection!`);
        else html = k.L(`入射角 <b>${ang}°</b> → 折射角 <b>${k.fmt(t, 1)}°</b><br>${n2 > n1 ? '光進入水或玻璃時，往法線偏折' : '光從水進入空氣時，偏離法線'}${mode === 'up' ? `<br><span class="muted">臨界角 ${k.fmt(m.critical(n1, n2), 1)}°</span>` : ''}`,
          `Incidence <b>${ang}°</b> → refraction <b>${k.fmt(t, 1)}°</b><br>${n2 > n1 ? 'Going into water or glass, light bends toward the normal' : 'Going from water into air, light bends away from the normal'}${mode === 'up' ? `<br><span class="muted">critical angle ${k.fmt(m.critical(n1, n2), 1)}°</span>` : ''}`);
        ro.set(html + `<div class="muted">${k.L('拖拉畫面也可以改角度。', 'You can also drag on the picture to aim.')}</div>`);
      });
    },
    observe: [
      { try: T('選「鏡子」，把入射角調成 20°、50°、70°。', 'Choose “Mirror” and set the angle to 20°, 50° and 70°.'),
        ask: T('反射角和入射角有什麼關係？', 'How does the angle of reflection compare with the angle of incidence?'),
        options: [T('永遠相等', 'They are always equal'), T('反射角比較大', 'Reflection is always bigger'), T('反射角永遠是 90°', 'Reflection is always 90°')],
        why: T('光的反射定律：入射角等於反射角（都是和法線的夾角）。', 'The law of reflection: the angle of incidence equals the angle of reflection (both measured from the normal).') },
      { try: T('選「空氣 → 水」，把角度調成 40°。', 'Choose “Air → water” and set the angle to 40°.'),
        ask: T('光進入水裡後怎麼走？', 'What does the light do when it enters the water?'),
        options: [T('往法線偏折（折射角比較小）', 'It bends toward the normal (smaller angle)'), T('往遠離法線的方向偏折', 'It bends away from the normal'), T('完全不轉彎', 'It goes straight on')],
        why: T('光在水中走得比在空氣中慢，斜斜照進水裡時會往法線偏折。所以筷子插在水裡看起來像折斷了。', 'Light travels slower in water than in air, so when it enters at a slant it bends toward the normal. That is why a chopstick in water looks broken.') },
      { try: T('角度不變，切換「空氣 → 水」和「空氣 → 玻璃」。', 'Keep the angle and switch between water and glass.'),
        ask: T('哪一種讓光偏折得比較多？', 'Which one bends the light more?'),
        options: [T('玻璃', 'Glass'), T('水', 'Water'), T('一樣多', 'The same')],
        why: T('光在玻璃中走得比在水中更慢（折射率 1.5 比 1.33 大），所以偏折得更多。', 'Light is even slower in glass than in water (index 1.5 vs 1.33), so glass bends it more.') },
      { try: T('選「水 → 空氣」，把角度慢慢加大到 60°。', 'Choose “Water → air” and slowly turn the angle up to 60°.'),
        ask: T('角度超過大約 49° 以後發生什麼事？', 'What happens beyond about 49°?'),
        options: [T('光全部反射回水裡，出不去', 'All the light reflects back into the water'), T('光變得更亮地射出去', 'More light comes out'), T('光直直地射出去不偏折', 'The light goes straight out')],
        why: T('光從水射向空氣時，入射角大於臨界角（約 48.8°）就會全反射。光纖就是利用全反射把光關在裡面傳送。', 'Going from water into air, beyond the critical angle (about 48.8°) all the light reflects back. Optical fibers use this total internal reflection to trap light inside.') },
    ],
  },
  {
    id: 'food-web', grades: [5, 6], subj: 'bio', icon: '🕸️',
    name: T('食物鏈與食物網', 'Food chains and food webs'),
    intro: T('箭頭從「被吃的」指向「吃牠的」，代表能量流動的方向。點一點每種生物看牠吃什麼、被誰吃。右邊的小實驗是一條食物鏈：草 → 兔子 → 狐狸，試著拿走狐狸或發生乾旱，看看數量怎麼變。',
      'Arrows point from the food to the eater — the way energy flows. Tap a living thing to see what it eats and what eats it. The experiment on the right is one food chain, grass → rabbit → fox: remove the foxes or cause a drought and watch the numbers change.'),
    cur: { tw: T('國小高年級 生物與環境', 'Upper elementary · living things and the environment'), us: 'NGSS 5-LS2-1' },
    model: { chain, WEB },
    checks(m, ok) {
      const all = m.chain.settle(), noFox = m.chain.settle({ fox: false }), dry = m.chain.settle({ grow: 0.5 }), none = m.chain.settle({ grass: false });
      ok(all.every((x) => x > 0.03 && x <= 1), 'all three survive together');
      ok(noFox[1] > all[1] * 1.5 && noFox[0] < all[0], 'without foxes: more rabbits, less grass');
      ok(dry.every((x, i) => x < all[i]), 'a drought means fewer of everything');
      ok(none[1] < 1e-3 && none[2] < 1e-3, 'no plants → the animals cannot survive');
      ok(m.WEB.edges.every(([a, b]) => m.WEB.nodes.find((n) => n.id === a).lv < m.WEB.nodes.find((n) => n.id === b).lv), 'arrows go from food to eater (up the levels)');
      let s = [0.8, 0.2, 0.1], neg = false; for (let i = 0; i < 20000; i++) { s = m.chain.step(s, 0.02); if (s.some((x) => x < 0)) neg = true; } ok(!neg, 'never negative');
    },
    mount(k) {
      const m = chain, v = k.canvas(640, 400), { ctx, W, H } = v;
      let view = 'web', sel = 'snake', fox = true, drought = false, s = [0.8, 0.2, 0.1], hist = [], t = 0;
      k.seg({ label: T('看什麼', 'View'), value: 'web', options: [{ v: 'web', label: T('🕸️ 食物網', '🕸️ Food web') }, { v: 'chain', label: T('📈 食物鏈實驗', '📈 Food-chain experiment') }], onChange: (x) => (view = x) });
      const t1 = k.toggle({ label: T('🦊 有狐狸', '🦊 Foxes present'), value: true, onChange: (x) => { fox = x; if (x && s[2] < 0.02) s[2] = 0.05; else if (!x) s[2] = 0; } });
      const t2 = k.toggle({ label: T('☀️ 乾旱（草長得慢）', '☀️ Drought (grass grows slowly)'), value: false, onChange: (x) => (drought = x) });
      k.buttons([{ label: T('↺ 重來', '↺ Restart'), on: () => { s = [0.8, 0.2, fox ? 0.1 : 0]; hist = []; t = 0; } }]);
      const ro = k.readout();
      k.pointer(v.cv, { down(p) { if (view !== 'web') return; const n = WEB.nodes.find((n) => Math.hypot(p.x - n.x, p.y - n.y) < 36); if (n) sel = n.id; } });
      k.loop((dt) => {
        const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        t1.el.style.display = t2.el.style.display = view === 'chain' ? '' : 'none';
        if (view === 'web') {
          for (const [a, b] of WEB.edges) {
            const A = WEB.nodes.find((n) => n.id === a), B = WEB.nodes.find((n) => n.id === b), on = a === sel || b === sel;
            const ang = Math.atan2(B.y - A.y, B.x - A.x);
            k.arrow(ctx, A.x + Math.cos(ang) * 32, A.y + Math.sin(ang) * 32, B.x - Math.cos(ang) * 34, B.y - Math.sin(ang) * 34, on ? (a === sel ? '#e8590c' : '#2f9e44') : c.line, on ? 4 : 2.5, 12);
          }
          for (const n of WEB.nodes) {
            k.circle(ctx, n.x, n.y, 31, n.id === sel ? c.card : c.soft, n.id === sel ? c.acc : c.line, n.id === sel ? 3 : 1.5);
            emo(k, ctx, n.e, n.x, n.y, 34);
            k.text(ctx, k.L(n.zh, n.en), n.x, n.y + 44, { color: c.ink, size: 14, align: 'center', bold: n.id === sel });
          }
          k.text(ctx, k.L('分解者：把死掉的生物分解回土壤', 'Decomposers: break dead things back into soil'), 630, 392, { color: c.muted, size: 12, align: 'right' });
          const N = WEB.nodes.find((n) => n.id === sel);
          const eats = WEB.edges.filter(([, b]) => b === sel).map(([a]) => WEB.nodes.find((n) => n.id === a));
          const eaten = WEB.edges.filter(([a]) => a === sel).map(([, b]) => WEB.nodes.find((n) => n.id === b));
          const role = N.lv === 0 ? k.L('生產者（自己行光合作用製造養分）', 'producer (makes its own food by photosynthesis)') : N.lv < 0 ? k.L('分解者', 'decomposer') : N.lv === 1 ? k.L('初級消費者（吃植物）', 'primary consumer (eats plants)') : N.lv === 4 ? k.L('最高級消費者（沒有天敵）', 'top consumer (nothing here eats it)') : k.L('高級消費者（吃其他動物）', 'higher-level consumer (eats other animals)');
          const nm = (a) => a.map((n) => k.L(n.zh, n.en)).join(k.L('、', ', ')) || '—';
          ro.set(k.L(`<b>${N.zh}</b>：${role}<br><span style="color:#2f9e44">⬅ 吃：<b>${nm(eats)}</b></span><br><span style="color:#e8590c">➡ 被吃：<b>${nm(eaten)}</b></span>`,
            `<b>${N.en}</b>: ${role}<br><span style="color:#2f9e44">⬅ eats: <b>${nm(eats)}</b></span><br><span style="color:#e8590c">➡ eaten by: <b>${nm(eaten)}</b></span>`));
        } else {
          for (let i = 0; i < 6; i++) { s = m.step(s, dt / 6 * 1.4, drought ? 0.5 : 1); t += dt / 6 * 1.4; }
          if (!fox) s[2] = 0;
          if (!hist.length || t - hist[hist.length - 1][0] > 0.1) hist.push([t, ...s]);
          if (hist.length > 600) hist.shift();
          const x0 = Math.max(0, t - 60);
          const mp = k.axes(ctx, { x: 60, y: 30, w: 420, h: 320 }, { xmin: x0, xmax: x0 + 60, ymin: 0, ymax: 1, c, xdp: 0, ydp: 1, xlabel: k.L('時間', 'time'), ylabel: k.L('數量（相對）', 'amount (relative)') });
          const cols = ['#2f9e44', '#8d6e63', '#e8590c'];
          [1, 2, 3].forEach((i) => k.plotLine(ctx, mp, hist.filter((h) => h[0] >= x0).map((h) => [h[0], h[i] * (i === 3 ? 4 : i === 2 ? 2 : 1)]), cols[i - 1], 3));
          const lab = [['🌿', k.L('草', 'grass'), s[0]], ['🐇', k.L('兔子 ×2', 'rabbits ×2'), s[1] * 2], ['🦊', k.L('狐狸 ×4', 'foxes ×4'), s[2] * 4]];
          lab.forEach(([e, n2, val], i) => { emo(k, ctx, e, 520, 70 + i * 70, 34); k.text(ctx, n2, 545, 70 + i * 70, { color: cols[i], size: 15, bold: true }); k.text(ctx, k.fmt(val, 2), 545, 92 + i * 70, { color: c.ink, size: 14 }); });
          ro.set(k.L(`草 <b>${Math.round(s[0] * 100)}%</b> 覆蓋　兔子 <b>${Math.round(s[1] * 400)}</b> 隻　狐狸 <b>${Math.round(s[2] * 400)}</b> 隻<br><span class="muted">（圖上兔子 ×2、狐狸 ×4，比較好看）</span>`,
            `Grass cover <b>${Math.round(s[0] * 100)}%</b>　rabbits <b>${Math.round(s[1] * 400)}</b>　foxes <b>${Math.round(s[2] * 400)}</b><br><span class="muted">(rabbits ×2 and foxes ×4 on the graph so they are easy to see)</span>`));
        }
      });
    },
    observe: [
      { try: T('在食物網裡點「草」。', 'In the food web, tap the grass.'),
        ask: T('草在食物網裡是什麼角色？', 'What role does grass play?'),
        options: [T('生產者：用陽光製造養分', 'Producer: it makes food using sunlight'), T('消費者：吃別的生物', 'Consumer: it eats other living things'), T('分解者：分解死掉的生物', 'Decomposer: it breaks down dead things')],
        why: T('植物行光合作用，利用陽光、水和二氧化碳製造養分，是食物網中所有能量的來源，叫做生產者。', 'Plants make their own food by photosynthesis from sunlight, water and carbon dioxide. They are the source of all the energy in the web — producers.') },
      { try: T('點「蛇」，看看箭頭。', 'Tap the snake and look at the arrows.'),
        ask: T('蛇吃什麼？', 'What does the snake eat?'),
        options: [T('青蛙和老鼠', 'Frogs and mice'), T('老鷹', 'Hawks'), T('草', 'Grass')],
        why: T('箭頭從食物指向吃牠的動物。指向蛇的箭頭來自青蛙和老鼠，所以蛇吃青蛙和老鼠；從蛇指出去的箭頭指向老鷹，表示蛇會被老鷹吃。', 'Arrows point from the food to the eater. The arrows into the snake come from the frog and the mouse, so it eats those; the arrow out of the snake goes to the hawk, which eats snakes.') },
      { try: T('換到「食物鏈實驗」，關掉「有狐狸」。', 'Switch to the food-chain experiment and turn off the foxes.'),
        ask: T('沒有狐狸以後，兔子和草會怎樣？', 'Without foxes, what happens to the rabbits and the grass?'),
        options: [T('兔子變多，草變少', 'More rabbits, less grass'), T('兔子變少，草變多', 'Fewer rabbits, more grass'), T('都不會改變', 'Nothing changes')],
        why: T('沒有天敵，兔子大量增加，吃掉更多的草，草就變少了。食物鏈中一種生物改變，會影響其他生物。', 'With no predators the rabbits multiply and eat more grass, so the grass shrinks. Changing one link in a food chain affects the others.') },
      { try: T('打開狐狸，再打開「乾旱」。', 'Turn the foxes back on and turn on the drought.'),
        ask: T('乾旱讓草長得慢，結果…', 'The drought slows the grass, and then…'),
        options: [T('兔子和狐狸也跟著變少', 'there are fewer rabbits and foxes too'), T('狐狸變多', 'there are more foxes'), T('只有草變少，動物不受影響', 'only the grass shrinks; the animals are fine')],
        why: T('所有動物的能量最後都來自植物。草少了，兔子的食物不夠，數量下降，吃兔子的狐狸也跟著變少。', 'All the animals’ energy comes from plants in the end. Less grass means less food for rabbits, so they decline, and so do the foxes that eat them.') },
    ],
  },
  {
    id: 'seasons', grades: [5, 6], subj: 'earth', icon: '🌍',
    name: T('四季是怎麼來的？', 'Why do we have seasons?'),
    intro: T('地球一年繞太陽一圈，地軸傾斜約 23.5°，而且一直指向同一個方向。選日期和緯度，看看正午太陽有多高、白天有多長。試著把地軸「扶正」，四季還會存在嗎？',
      'Earth goes around the Sun once a year with its axis tilted about 23.5°, always pointing the same way in space. Pick a date and a latitude to see how high the noon Sun is and how long the day lasts. Then try straightening the axis — would there still be seasons?'),
    cur: { tw: T('國小高年級 太陽與四季', 'Upper elementary · the Sun and the seasons'), us: 'NGSS 5-ESS1-2' },
    model: seasons,
    checks(m, ok) {
      const jun = 172, dec = 355, mar = 80;
      ok(Math.abs(m.decl(jun) - 23.44) < 0.05 && Math.abs(m.decl(dec) + 23.44) < 0.1 && Math.abs(m.decl(mar)) < 1e-9, 'declination: +23.44° in June, −23.44° in December, 0 at the equinox');
      ok(Math.abs(m.noonAlt(25, m.decl(jun)) - 88.4) < 0.1 && Math.abs(m.noonAlt(25, m.decl(dec)) - 41.6) < 0.1, 'Taipei noon Sun ≈ 88° in June, ≈ 42° in December');
      ok(Math.abs(m.dayLength(25, 0) - 12) < 1e-9 && m.dayLength(25, m.decl(jun)) > 13 && m.dayLength(25, m.decl(dec)) < 11, 'equinox 12 h; summer days longer');
      ok(m.dayLength(70, m.decl(jun)) === 24 && m.dayLength(70, m.decl(dec)) === 0, 'midnight sun / polar night');
      ok(m.dayLength(-30, m.decl(jun)) < 12, 'southern hemisphere has winter in June');
      ok([0, 100, 200, 300].every((d) => m.decl(d, 0) === 0), 'no tilt → no seasons');
      ok(m.dist(3) < m.dist(185), 'Earth is closest to the Sun in January (northern winter) — distance is not the cause');
    },
    mount(k) {
      const m = seasons, v = k.canvas(640, 380), { ctx, W, H } = v;
      let day = 172, lat = 25, tilt = true, play = false;
      const MON = [['1月', 'Jan'], ['2月', 'Feb'], ['3月', 'Mar'], ['4月', 'Apr'], ['5月', 'May'], ['6月', 'Jun'], ['7月', 'Jul'], ['8月', 'Aug'], ['9月', 'Sep'], ['10月', 'Oct'], ['11月', 'Nov'], ['12月', 'Dec']];
      const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const dateOf = (d) => { let mm = 0; d = Math.round(d); while (d >= MD[mm]) { d -= MD[mm]; mm = (mm + 1) % 12; } return [mm, d + 1]; };
      const ds = k.slider({ label: T('日期（一年中的第幾天）', 'Date (day of the year)'), min: 0, max: 364, step: 1, value: day, onInput: (x) => (day = x) });
      k.slider({ label: T('緯度（台北約 25°N）', 'Latitude (Taipei ≈ 25° N)'), min: -66, max: 66, step: 1, value: lat, unit: '°', onInput: (x) => (lat = x) });
      k.toggle({ label: T('地軸傾斜 23.5°', 'Axis tilted 23.5°'), value: true, onChange: (x) => (tilt = x) });
      const b = k.buttons([{ label: T('▶ 播放一年', '▶ Play a year'), primary: true, on: () => (play = !play) }]);
      const ro = k.readout();
      k.loop((dt) => {
        if (play) { day = (day + dt * 40) % 365; ds.set(Math.round(day)); }
        b.firstChild.textContent = play ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 播放一年', '▶ Play a year');
        const c = k.colors(), T0 = tilt ? m.TILT : 0, dec = m.decl(day, T0), alt = m.noonAlt(lat, dec), dl = m.dayLength(lat, dec);
        ctx.fillStyle = '#0d1630'; ctx.fillRect(0, 0, 330, H);
        // orbit (top-down view, Earth's axis leans toward the right in June)
        const sx = 165, sy = 175, R = 120;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.ellipse(sx, sy, R, R * 0.55, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, 40); g.addColorStop(0, '#fff6c0'); g.addColorStop(1, 'rgba(255,190,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 40, 0, Math.PI * 2); ctx.fill();
        k.circle(ctx, sx, sy, 20, '#ffcf3f');
        const a = (2 * Math.PI * (day - 172)) / 365, ex = sx - R * Math.cos(a), ey = sy + R * 0.55 * Math.sin(a);
        k.circle(ctx, ex, ey, 16, '#2f7de1');
        const toSun = Math.atan2(sy - ey, sx - ex); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.arc(ex, ey, 16, toSun + Math.PI / 2, toSun - Math.PI / 2); ctx.fill();
        if (tilt) { k.line(ctx, ex - 9, ey + 20, ex + 9, ey - 20, '#ffffff', 2); k.text(ctx, 'N', ex + 11, ey - 24, { color: '#fff', size: 12, bold: true }); }
        else k.line(ctx, ex, ey + 22, ex, ey - 22, '#ffffff', 2);
        for (const [d, zh, en] of [[172, '夏至', 'June solstice'], [266, '秋分', 'Sept equinox'], [355, '冬至', 'Dec solstice'], [80, '春分', 'March equinox']]) {
          const aa = (2 * Math.PI * (d - 172)) / 365; k.text(ctx, k.L(zh, en), sx - (R + 6) * Math.cos(aa), sy + (R * 0.55 + 18) * Math.sin(aa) + (d === 172 ? 0 : d === 355 ? 0 : 0), { color: '#9fb3d9', size: 12, align: 'center' });
        }
        const [mm, dd] = dateOf(day);
        k.text(ctx, k.L(`${MON[mm][0]}${dd}日`, `${MON[mm][1]} ${dd}`), 14, 24, { color: '#fff', size: 18, bold: true });
        k.text(ctx, k.L(`日地距離 ${k.fmt(m.dist(day), 3)} AU`, `Sun–Earth ${k.fmt(m.dist(day), 3)} AU`), 14, H - 16, { color: '#9fb3d9', size: 13 });
        // noon sky at the chosen latitude
        ctx.fillStyle = c.dark ? '#1d2a3a' : '#cfe8ff'; ctx.fillRect(330, 0, 310, 250);
        ctx.fillStyle = c.dark ? '#2c3a2a' : '#9ccc7a'; ctx.fillRect(330, 250, 310, 130);
        const gx = 485, gy = 250, altC = Math.max(0, alt);
        const sunA = altC * D2R, sunX = gx + Math.cos(sunA) * 150 * (lat >= dec ? 1 : -1), sunY = gy - Math.sin(sunA) * 150;
        ctx.strokeStyle = c.muted; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(gx, gy, 150, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]);
        if (alt > 0) {
          const spread = 60 / Math.max(0.15, Math.sin(sunA));
          // a parallel beam of sunlight, 60 px wide, hitting the ground: it covers 60 / sin(altitude) px of ground
          const dl = Math.hypot(gx - sunX, gy - sunY), dx = (gx - sunX) / dl, dy = (gy - sunY) / dl, Lb = 130;
          ctx.fillStyle = 'rgba(255,214,90,0.4)'; ctx.beginPath(); ctx.moveTo(gx - spread / 2, gy); ctx.lineTo(gx + spread / 2, gy); ctx.lineTo(gx + spread / 2 - dx * Lb, gy - dy * Lb); ctx.lineTo(gx - spread / 2 - dx * Lb, gy - dy * Lb); ctx.closePath(); ctx.fill();
          k.line(ctx, gx - spread / 2, gy + 3, gx + spread / 2, gy + 3, '#e8590c', 4);
          k.circle(ctx, sunX, sunY, 16, '#ffcf3f', '#f59f00', 2);
        }
        k.text(ctx, k.L(`正午太陽高度 ${k.fmt(alt, 1)}°`, `Noon Sun height ${k.fmt(alt, 1)}°`), 485, 24, { color: c.ink, size: 16, bold: true, align: 'center' });
        k.text(ctx, k.L('同樣的陽光，照到的地面愈小 → 愈熱', 'Same sunlight on a smaller patch → hotter'), 485, 272, { color: c.ink, size: 12, align: 'center' });
        // day-length bar
        k.text(ctx, k.L(`白天 ${k.fmt(dl, 1)} 小時`, `Daylight ${k.fmt(dl, 1)} h`), 350, 305, { color: c.ink, size: 15, bold: true });
        k.rrect(ctx, 350, 320, 270, 22, 6, '#24324a'); k.rrect(ctx, 350 + (270 * (12 - dl / 2)) / 24, 320, (270 * dl) / 24, 22, 6, '#ffd75a');
        const seasonN = dec > 8 ? 0 : dec < -8 ? 2 : day < 172 ? 1 : 3;
        const nmN = [['夏天', 'summer'], ['春天', 'spring'], ['冬天', 'winter'], ['秋天', 'autumn']][seasonN], nmS = [['冬天', 'winter'], ['秋天', 'autumn'], ['夏天', 'summer'], ['春天', 'spring']][seasonN];
        ro.set(tilt ? k.L(`北半球是<b>${nmN[0]}</b>，南半球是<b>${nmS[0]}</b>。<br>正午太陽高度 <b>${k.fmt(alt, 1)}°</b>（陽光強度約直射的 ${Math.round(m.strength(alt) * 100)}%）<br>白天長 <b>${k.fmt(dl, 1)}</b> 小時`,
          `Northern Hemisphere: <b>${nmN[1]}</b>; Southern: <b>${nmS[1]}</b>.<br>Noon Sun <b>${k.fmt(alt, 1)}°</b> high (sunlight about ${Math.round(m.strength(alt) * 100)}% of overhead)<br>Daylight <b>${k.fmt(dl, 1)}</b> hours`)
          : k.L(`地軸不傾斜：每天正午太陽一樣高（${k.fmt(alt, 1)}°），白天永遠 12 小時——沒有四季！`, `No tilt: the noon Sun is the same height every day (${k.fmt(alt, 1)}°) and days are always 12 hours — no seasons!`));
      });
    },
    observe: [
      { try: T('緯度 25°（台北），比較 6 月 21 日（第 172 天）和 12 月 21 日（第 355 天）。', 'At 25° (Taipei), compare June 21 (day 172) with December 21 (day 355).'),
        ask: T('夏天和冬天比，正午太陽…', 'Compared with winter, the summer noon Sun is…'),
        options: [T('比較高，白天也比較長', 'higher, and the days are longer'), T('比較低，白天比較短', 'lower, and the days are shorter'), T('一樣高', 'the same height')],
        why: T('夏天太陽比較高，陽光集中照在比較小的地面上，而且白天比較長，所以比較熱。', 'In summer the Sun is higher, so its light is concentrated on a smaller patch of ground, and days are longer — so it is hotter.') },
      { try: T('看看左下角的「日地距離」，比較 1 月和 7 月。', 'Look at the Sun–Earth distance and compare January and July.'),
        ask: T('北半球的冬天（1 月），地球離太陽…', 'In northern winter (January), Earth is…'),
        options: [T('反而比較近', 'actually closest to the Sun'), T('最遠', 'farthest from the Sun'), T('距離完全不變', 'always the same distance')],
        why: T('地球在 1 月初最靠近太陽，那時北半球卻是冬天。所以四季不是因為遠近，而是因為地軸傾斜。', 'Earth is closest to the Sun in early January — during northern winter! So the seasons are not caused by distance but by the tilt.') },
      { try: T('關掉「地軸傾斜」，播放一年。', 'Turn off the tilt and play a year.'),
        ask: T('如果地軸不傾斜…', 'If Earth’s axis were not tilted…'),
        options: [T('就不會有四季', 'there would be no seasons'), T('四季會更明顯', 'seasons would be stronger'), T('永遠是夏天', 'it would always be summer everywhere')],
        why: T('沒有傾斜，太陽每天在同樣的高度，白天都是 12 小時，各地全年溫度差不多，就沒有四季了。', 'Without the tilt the Sun would be at the same height every day with 12-hour days everywhere, so there would be no seasons.') },
      { try: T('把緯度調到 −30°（南半球），日期選 6 月。', 'Set the latitude to −30° (Southern Hemisphere) in June.'),
        ask: T('6 月的南半球是什麼季節？', 'What season is it in the Southern Hemisphere in June?'),
        options: [T('冬天', 'Winter'), T('夏天', 'Summer'), T('和北半球一樣', 'The same as in the north')],
        why: T('6 月時地球北半球傾向太陽，南半球背向太陽，所以南半球是冬天——澳洲的聖誕節在夏天！', 'In June the Northern Hemisphere leans toward the Sun and the Southern Hemisphere leans away, so it is winter there — Christmas in Australia is in summer!') },
    ],
  },
  {
    id: 'water-cycle', grades: [5, 6], subj: 'earth', icon: '🌧️',
    name: T('水循環與天氣', 'The water cycle and weather'),
    intro: T('太陽把海水曬熱，水蒸發成看不見的水蒸氣往上升；空氣愈往高處愈冷，水蒸氣凝結成小水滴變成雲；雲裡的水滴變大就降下雨或雪，再沿著河流回到大海。調整海水溫度和山的高度，看看水怎麼循環。',
      'The Sun warms the sea and water evaporates into invisible water vapor that rises. Higher up the air is colder, so the vapor condenses into tiny droplets — clouds. When the droplets grow they fall as rain or snow and flow back to the sea in rivers. Change the sea temperature and the mountain height and watch the water go around.'),
    cur: { tw: T('國小高年級 水的循環與天氣', 'Upper elementary · the water cycle and weather'), us: 'NGSS 5-ESS2-1' },
    model: wcycle,
    checks(m, ok) {
      ok(Math.abs(m.es(20) - 23.4) < 0.2 && Math.abs(m.es(30) - 42.4) < 0.3, 'saturation vapor pressure 23.4 hPa at 20 °C, 42.4 hPa at 30 °C');
      ok(m.evapRate(30) > m.evapRate(20) && m.evapRate(20) > m.evapRate(10), 'warmer water evaporates faster');
      ok(Math.abs(m.tempAt(25, 2) - 12) < 1e-9, '2 km up is 13 °C colder');
      ok(m.tempAt(25, 4) < 0 && m.tempAt(25, 3) > 0, 'snow on a 4 km peak, rain at 3 km when the sea is 25 °C');
    },
    mount(k) {
      const m = wcycle, v = k.canvas(640, 380), { ctx, W, H } = v;
      let Tsea = 25, km = 3, vap = [], drops = [], river = [], cloud = 0, t = 0, counts = { ev: 0, rain: 0, snow: 0 };
      k.slider({ label: T('🌊 海水溫度', '🌊 Sea temperature'), min: 5, max: 32, step: 1, value: Tsea, unit: '°C', onInput: (x) => (Tsea = x) });
      k.slider({ label: T('⛰️ 山的高度', '⛰️ Mountain height'), min: 1, max: 4.5, step: 0.5, value: km, unit: T('公里', 'km'), dp: 1, onInput: (x) => (km = x) });
      const ro = k.readout();
      const sea = 300, base = 330, peakX = 500;
      const peakY = () => base - km * 55;
      const ground = (x) => { const py = peakY(); if (x < sea) return base; if (x < peakX) return base - ((x - sea) / (peakX - sea)) * (base - py); return py + ((x - peakX) / (W - peakX)) * (base - py) * 0.8; };
      k.loop((dt) => {
        t += dt; const c = k.colors();
        const rate = m.evapRate(Tsea) * 6;
        if (Math.random() < rate * dt) { vap.push({ x: 20 + Math.random() * (sea - 40), y: base - 5, vx: 25 + Math.random() * 20 }); counts.ev++; }
        const topT = m.tempAt(Tsea, km);
        // sky
        const sky = ctx.createLinearGradient(0, 0, 0, base); sky.addColorStop(0, c.dark ? '#16304a' : '#7cc3f5'); sky.addColorStop(1, c.dark ? '#2b4a66' : '#d8f0ff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
        // sun
        const sr = 22 + (Tsea - 5) * 0.4; k.circle(ctx, 60, 50, sr, '#ffd23f', '#ffb300', 3);
        // sea
        ctx.fillStyle = '#2f7de1'; ctx.fillRect(0, base, sea + 10, H - base);
        for (let i = 0; i < 8; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(20 + i * 38 + Math.sin(t + i) * 4, base + 14, 8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
        // land + mountain
        ctx.fillStyle = c.dark ? '#3c5a34' : '#6fb05a'; ctx.beginPath(); ctx.moveTo(sea, H); for (let x = sea; x <= W; x += 5) ctx.lineTo(x, ground(x)); ctx.lineTo(W, H); ctx.fill();
        const py = peakY();
        if (topT < 0) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(peakX, py); ctx.lineTo(peakX - 30, py + 30); ctx.lineTo(peakX + 25, py + 24); ctx.fill(); }
        // river back to the sea
        ctx.strokeStyle = '#4aa3f0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(peakX - 10, py + 30); ctx.quadraticCurveTo(420, base - 20, sea + 5, base + 2); ctx.stroke();
        // vapour rising and drifting toward the mountain
        const cloudX = peakX - 60, cloudY = Math.min(py - 40, 120);
        vap = vap.filter((p) => { p.y -= 35 * dt; p.x += p.vx * dt * 0.8; if (p.y < cloudY + 10 || p.x > cloudX + 40) { cloud += 1; return false; } k.circle(ctx, p.x, p.y, 2.5, 'rgba(255,255,255,0.85)'); return true; });
        // cloud
        const cs = Math.min(1, cloud / 40);
        if (cloud > 2) { ctx.fillStyle = cs > 0.7 ? '#9aa6b2' : '#f4f7fa'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(cloudX - 50 + i * 26, cloudY + Math.sin(i * 2) * 8, 18 + cs * 16, 0, Math.PI * 2); ctx.fill(); } }
        if (cloud > 30 && Math.random() < dt * 8) { cloud -= 1; const snow = topT < 0; drops.push({ x: cloudX - 50 + Math.random() * 110, y: cloudY + 20, snow }); snow ? counts.snow++ : counts.rain++; }
        drops = drops.filter((d) => { d.y += (d.snow ? 40 : 160) * dt; if (d.snow) d.x += Math.sin(t * 3 + d.y) * 0.5; if (d.y > ground(d.x)) { river.push({ s: 0 }); return false; } d.snow ? k.text(ctx, '❄', d.x, d.y, { color: '#ffffff', size: 12 }) : k.line(ctx, d.x, d.y, d.x - 2, d.y + 8, '#1e66c8', 2); return true; });
        river = river.filter((r) => { r.s += dt * 0.5; if (r.s > 1) return false; const u = r.s, x = (1 - u) * (1 - u) * (peakX - 10) + 2 * (1 - u) * u * 420 + u * u * (sea + 5), y = (1 - u) * (1 - u) * (py + 30) + 2 * (1 - u) * u * (base - 20) + u * u * (base + 2); k.circle(ctx, x, y, 2.5, '#d6ecff'); return true; });
        // labels
        const lab = (s, x, y) => { ctx.font = '700 14px system-ui'; const w = ctx.measureText(s).width + 12; k.rrect(ctx, x - w / 2, y - 12, w, 24, 8, 'rgba(255,255,255,0.85)'); k.text(ctx, s, x, y, { color: '#1b3a57', size: 14, bold: true, align: 'center' }); };
        lab(k.L('① 蒸發', '① Evaporation'), 150, base - 60);
        lab(k.L('② 凝結成雲', '② Condensation'), cloudX - 10, cloudY - 48);
        lab(k.L(topT < 0 ? '③ 降雪' : '③ 降雨', topT < 0 ? '③ Snow' : '③ Rain'), cloudX + 100, cloudY + 50);
        lab(k.L('④ 河流流回大海', '④ Runoff to the sea'), 420, base + 30);
        ro.set(k.L(`海面 <b>${Tsea} °C</b>，山頂（${k.fmt(km, 1)} 公里高）約 <b>${k.fmt(topT, 1)} °C</b>${topT < 0 ? '：低於 0 °C，所以下<b>雪</b>' : '：所以下<b>雨</b>'}<br>蒸發速度：<b>${k.fmt(m.evapRate(Tsea), 2)}</b> 倍（和 20 °C 的海比）`,
          `Sea surface <b>${Tsea} °C</b>; the peak (${k.fmt(km, 1)} km up) is about <b>${k.fmt(topT, 1)} °C</b>${topT < 0 ? ' — below 0 °C, so it <b>snows</b>' : ' — so it <b>rains</b>'}<br>Evaporation: <b>${k.fmt(m.evapRate(Tsea), 2)}×</b> as fast as from a 20 °C sea`) +
          `<div class="muted">${k.L('空氣每升高 1 公里約降溫 6.5 °C。', 'Air cools about 6.5 °C for every km higher.')}</div>`);
      });
    },
    observe: [
      { try: T('把海水溫度從 10 °C 調到 30 °C，看蒸發的水蒸氣。', 'Change the sea from 10 °C to 30 °C and watch the vapor.'),
        ask: T('海水愈溫暖，蒸發…', 'The warmer the sea, the evaporation is…'),
        options: [T('愈快，雲和雨也愈多', 'faster — more clouds and rain'), T('愈慢', 'slower'), T('不會改變', 'unchanged')],
        why: T('溫度愈高，水分子跑得愈快，愈容易離開水面變成水蒸氣，所以夏天和熱帶地區常下大雨。', 'At higher temperatures water molecules move faster and escape into the air more easily, which is why hot places and summers often get heavy rain.') },
      { try: T('看看水蒸氣升到高空後發生什麼事。', 'Watch what happens to the vapor high up.'),
        ask: T('雲是怎麼形成的？', 'How do clouds form?'),
        options: [T('水蒸氣上升變冷，凝結成小水滴', 'Rising vapor cools and condenses into tiny droplets'), T('煙霧飄到天上', 'Smoke floats up into the sky'), T('太陽把空氣變白', 'The Sun turns the air white')],
        why: T('空氣愈高愈冷，水蒸氣遇冷凝結成很多小水滴或小冰晶，聚在一起就是我們看到的雲。', 'Air gets colder the higher you go. The vapor condenses into countless tiny droplets or ice crystals, and together they make a cloud.') },
      { try: T('把山調到 4.5 公里高，海水 25 °C。', 'Make the mountain 4.5 km high with a 25 °C sea.'),
        ask: T('為什麼高山上下的是雪？', 'Why does it snow on the high peak?'),
        options: [T('山頂溫度低於 0 °C', 'The peak is colder than 0 °C'), T('高山比較靠近太陽', 'The peak is closer to the Sun'), T('高山上的雲比較白', 'Clouds over mountains are whiter')],
        why: T('每升高 1 公里大約冷 6.5 °C，4.5 公里高的山頂大約比海邊冷 29 °C，低於 0 °C，所以降下的是雪。玉山冬天也會下雪。', 'Air cools about 6.5 °C per km, so a 4.5 km peak is about 29 °C colder than the coast — below freezing, so it snows. Yushan in Taiwan gets snow in winter too.') },
    ],
  },
  {
    id: 'dissolving', grades: [5, 6], subj: 'chem', icon: '🧂',
    name: T('溶解與水溶液', 'Dissolving and solutions'),
    intro: T('把鹽或糖加進水裡攪拌，它會「溶解」變成看不見的小粒子。但是水能溶解的量有限，加太多就會沉在杯底——這時叫做「飽和」。改變水量和溫度，看看能溶解多少。',
      'Stir salt or sugar into water and it dissolves into particles too small to see. But water can only dissolve so much — add too much and the rest sits on the bottom. Then the solution is saturated. Change the amount of water and the temperature and see how much dissolves.'),
    cur: { tw: T('國小高年級 水溶液', 'Upper elementary · solutions'), us: 'NGSS 5-PS1-2' },
    model: dissolve,
    checks(m, ok) {
      ok(Math.abs(m.solubility('salt', 20) - 35.9) < 1e-9 && Math.abs(m.solubility('sugar', 20) - 200) < 1e-9, 'table values at 20 °C');
      ok(Math.abs(m.solubility('salt', 30) - 36.15) < 1e-9, 'interpolates between table rows');
      ok(m.solubility('sugar', 80) > 1.5 * m.solubility('sugar', 20) && m.solubility('salt', 80) < 1.1 * m.solubility('salt', 20), 'sugar solubility rises a lot with temperature, salt hardly at all');
      const r = m.result('salt', 50, 100, 20);
      ok(Math.abs(r.dissolved - 35.9) < 1e-9 && Math.abs(r.left - 14.1) < 1e-9 && r.saturated, '50 g salt in 100 g water at 20 °C: 35.9 g dissolve, 14.1 g stay solid');
      ok(r.total === 150, 'total mass is conserved');
      ok(Math.abs(m.result('salt', 20, 80, 20).percent - 20) < 1e-9, '20 g in 80 g water → 20 % by mass');
      ok(Math.abs(m.result('salt', 50, 200, 20).max - 71.8) < 1e-9, 'twice the water dissolves twice as much');
    },
    mount(k) {
      const m = dissolve, v = k.canvas(640, 380), { ctx, W, H } = v;
      let kind = 'salt', added = 20, water = 100, temp = 20, shown = 0, stir = 0, t = 0;
      k.seg({ label: T('要溶解的東西', 'What to dissolve'), value: 'salt', options: [{ v: 'salt', label: T('🧂 食鹽', '🧂 Salt') }, { v: 'sugar', label: T('🍬 砂糖', '🍬 Sugar') }], onChange: (x) => { kind = x; sA.set(Math.min(sA.value, 300)); } });
      const sA = k.slider({ label: T('加入的量', 'Amount added'), min: 0, max: 300, step: 5, value: added, unit: T('公克', 'g'), onInput: (x) => (added = x) });
      k.slider({ label: T('水量', 'Water'), min: 50, max: 200, step: 10, value: water, unit: T('毫升', 'mL'), onInput: (x) => (water = x) });
      k.slider({ label: T('水溫', 'Water temperature'), min: 0, max: 100, step: 5, value: temp, unit: '°C', onInput: (x) => (temp = x) });
      k.buttons([{ label: T('🥄 攪拌', '🥄 Stir'), primary: true, on: () => (stir = 2) }]);
      const ro = k.readout();
      const bx = 150, by = 60, bw = 220, bh = 260;
      k.loop((dt) => {
        t += dt; const c = k.colors(), r = m.result(kind, added, water, temp);
        // dissolving takes a little time; stirring speeds it up
        const rate = (stir > 0 ? 60 : 12) * (1 + temp / 50);
        shown += Math.sign(r.dissolved - shown) * Math.min(Math.abs(r.dissolved - shown), rate * dt);
        stir = Math.max(0, stir - dt);
        ctx.clearRect(0, 0, W, H);
        const level = by + bh - (water / 200) * (bh - 40) - 20;
        // liquid
        ctx.fillStyle = kind === 'sugar' ? `rgba(240,200,120,${0.18 + Math.min(0.35, shown / 600)})` : `rgba(90,170,240,${0.35 + Math.min(0.2, shown / 300)})`;
        ctx.fillRect(bx, level, bw, by + bh - level);
        // dissolved particles (tiny, spread out)
        const nP = Math.min(160, Math.round(shown * (kind === 'salt' ? 3 : 0.8)));
        for (let i = 0; i < nP; i++) { const px = bx + 8 + ((i * 73.3 + t * (stir > 0 ? 80 : 6) * (i % 3 + 1)) % (bw - 16)), py = level + 8 + ((i * 41.7 + Math.sin(t + i) * 5) % (by + bh - level - 14)); k.circle(ctx, px, py, 1.6, kind === 'salt' ? '#ffffff' : '#b97a1f'); }
        // undissolved pile
        const left = added - shown;
        if (left > 0.5) { const pw = Math.min(bw - 20, 30 + left * 1.2), ph2 = Math.min(60, 4 + Math.sqrt(left) * 4); ctx.fillStyle = kind === 'salt' ? '#f2f4f5' : '#f1d9a6'; ctx.beginPath(); ctx.moveTo(bx + bw / 2 - pw / 2, by + bh - 2); ctx.quadraticCurveTo(bx + bw / 2, by + bh - 2 - ph2 * 2, bx + bw / 2 + pw / 2, by + bh - 2); ctx.fill(); for (let i = 0; i < Math.min(60, left); i++) k.rrect(ctx, bx + bw / 2 - pw / 2 + ((i * 37) % pw), by + bh - 6 - ((i * 13) % ph2), 4, 4, 1, kind === 'salt' ? '#ffffff' : '#e6c27a', '#9aa', 0.5); }
        // spoon while stirring
        if (stir > 0) { const sx2 = bx + bw / 2 + Math.sin(t * 10) * 60; k.line(ctx, sx2, by - 40, sx2 - 10, by + bh - 40, '#9aa3a8', 6); }
        // beaker
        ctx.strokeStyle = c.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 6, by - 10); ctx.lineTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
        for (let ml = 50; ml <= 200; ml += 50) { const y = by + bh - (ml / 200) * (bh - 40) - 20; k.line(ctx, bx + bw - 24, y, bx + bw, y, c.muted, 2); k.text(ctx, `${ml}`, bx + bw + 6, y, { color: c.muted, size: 13 }); }
        k.text(ctx, 'mL', bx + bw + 6, by - 6, { color: c.muted, size: 13 });
        // thermometer
        k.rrect(ctx, 430, 70, 16, 200, 8, c.card, c.ink, 2); k.circle(ctx, 438, 285, 14, '#e5484d', c.ink, 2); ctx.fillStyle = '#e5484d'; ctx.fillRect(434, 268 - (temp / 100) * 190, 8, (temp / 100) * 190 + 6);
        k.text(ctx, `${temp} °C`, 438, 52, { color: c.ink, size: 17, bold: true, align: 'center' });
        // scale under the beaker
        k.rrect(ctx, bx - 20, by + bh + 8, bw + 40, 30, 6, '#5c6770');
        k.text(ctx, `${k.fmt(r.total, 0)} g`, bx + bw / 2, by + bh + 23, { color: '#7CFC9A', size: 17, bold: true, align: 'center', font: 'ui-monospace, monospace' });
        k.text(ctx, k.L('（水＋加入的全部）', '(water + everything added)'), bx + bw / 2, by + bh + 52, { color: c.muted, size: 13, align: 'center' });
        if (r.saturated) k.text(ctx, k.L('飽和了！', 'Saturated!'), 520, 140, { color: c.no, size: 24, bold: true, align: 'center' });
        k.text(ctx, k.L(`最多可溶 ${k.fmt(r.max, 1)} g`, `Max ${k.fmt(r.max, 1)} g`), 540, 190, { color: c.ink, size: 16, align: 'center' });
        k.text(ctx, k.L(`已溶解 ${k.fmt(shown, 1)} g`, `Dissolved ${k.fmt(shown, 1)} g`), 540, 220, { color: c.acc, size: 16, align: 'center', bold: true });
        ro.set(k.L(`${water} 毫升（約 ${water} 公克）${temp} °C 的水，最多能溶解 <b>${k.fmt(r.max, 1)} 公克</b>${kind === 'salt' ? '食鹽' : '砂糖'}。<br>已溶解 <b>${k.fmt(r.dissolved, 1)} g</b>，沒溶解 <b>${k.fmt(r.left, 1)} g</b>。<br>濃度（重量百分比）= ${k.fmt(r.dissolved, 1)} ÷ ${k.fmt(water + r.dissolved, 1)} × 100% ≈ <b>${k.fmt(r.percent, 1)}%</b>`,
          `${water} mL (about ${water} g) of water at ${temp} °C can dissolve at most <b>${k.fmt(r.max, 1)} g</b> of ${kind}.<br>Dissolved <b>${k.fmt(r.dissolved, 1)} g</b>, left solid <b>${k.fmt(r.left, 1)} g</b>.<br>Concentration (by mass) = ${k.fmt(r.dissolved, 1)} ÷ ${k.fmt(water + r.dissolved, 1)} × 100% ≈ <b>${k.fmt(r.percent, 1)}%</b>`));
      });
    },
    observe: [
      { try: T('食鹽、100 毫升、20 °C，把加入的量慢慢調到 60 公克。', 'Salt, 100 mL, 20 °C: slowly raise the amount to 60 g.'),
        ask: T('加到大約多少公克以後，鹽開始溶不掉？', 'At about how many grams does salt stop dissolving?'),
        options: [T('大約 36 公克', 'About 36 g'), T('大約 10 公克', 'About 10 g'), T('加多少都溶得掉', 'It never stops')],
        why: T('20 °C 時，100 公克的水最多只能溶解大約 36 公克的食鹽，再多就沉在杯底，溶液達到飽和。', 'At 20 °C, 100 g of water can dissolve only about 36 g of salt. Any more sits on the bottom — the solution is saturated.') },
      { try: T('保持 60 公克食鹽，把水量加到 200 毫升。', 'Keep 60 g of salt and increase the water to 200 mL.'),
        ask: T('水變多以後…', 'With more water…'),
        options: [T('可以溶解更多，鹽全部溶掉了', 'more can dissolve — all the salt dissolves'), T('能溶解的量不變', 'the amount that dissolves stays the same'), T('能溶解的反而變少', 'less dissolves')],
        why: T('水量變成 2 倍，能溶解的量也變成 2 倍（約 72 公克），所以 60 公克全部溶解了。', 'Twice the water dissolves twice as much (about 72 g), so all 60 g dissolves.') },
      { try: T('換成砂糖，200 公克、100 毫升，把水溫從 20 °C 調到 80 °C；再換回食鹽比較。', 'Switch to sugar, 200 g in 100 mL, and heat from 20 °C to 80 °C; then compare with salt.'),
        ask: T('水溫升高時…', 'When the water gets hotter…'),
        options: [T('糖能溶解的量大增，鹽幾乎不變', 'much more sugar dissolves; salt hardly changes'), T('糖和鹽都溶得少了', 'less of both dissolves'), T('鹽溶解的量大增，糖不變', 'much more salt dissolves; sugar doesn’t change')],
        why: T('大多數固體在熱水中溶解得比較多，像糖就很明顯；但食鹽很特別，溫度升高只能多溶一點點。', 'Most solids dissolve more in hot water — sugar a lot more. Salt is special: heating lets it dissolve only a little more.') },
      { try: T('加 50 公克的鹽到 100 毫升的水，看看秤的數字。', 'Add 50 g of salt to 100 mL of water and watch the scale.'),
        ask: T('鹽溶解看不見之後，總重量…', 'After the salt dissolves out of sight, the total mass…'),
        options: [T('還是 150 公克，不會變', 'is still 150 g — unchanged'), T('變輕了，因為鹽消失了', 'is less, because the salt vanished'), T('變重了', 'is more')],
        why: T('溶解只是把鹽分散成看不見的小粒子，鹽還在水裡，所以總重量不變。', 'Dissolving only spreads the salt into particles too small to see. It is still in the water, so the total mass does not change.') },
    ],
  },
];

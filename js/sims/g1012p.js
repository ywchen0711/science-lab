// Simulations for grades 10–12, physics (高中 物理). Format: see SPEC.md.
import { T } from '../util.js';

// scattered star positions in [0, 1)
const STAR = (i, j) => { const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };

const D2R = Math.PI / 180;

// ---------------- projectile ----------------
const proj = {
  G: { earth: 9.8, moon: 1.62, mars: 3.71 },
  range: (v, deg, g) => (v * v * Math.sin(2 * deg * D2R)) / g,                                   // launched from ground level
  tFlight: (v, deg, g, h = 0) => { const vy = v * Math.sin(deg * D2R); return (vy + Math.sqrt(vy * vy + 2 * g * h)) / g; },
  hMax: (v, deg, g, h = 0) => h + (v * Math.sin(deg * D2R)) ** 2 / (2 * g),
  // numerical flight with optional quadratic air drag (kd = drag constant per unit mass, 1/m); returns the path and landing point
  fly(v, deg, g, h = 0, kd = 0, dt = 0.002) {
    let x = 0, y = h, vx = v * Math.cos(deg * D2R), vy = v * Math.sin(deg * D2R), t = 0;
    const pts = [[0, h]];
    const acc = (vx2, vy2) => { const s = Math.hypot(vx2, vy2); return [-kd * s * vx2, -g - kd * s * vy2]; };
    while (t < 600) {
      const [a1x, a1y] = acc(vx, vy), [a2x, a2y] = acc(vx + a1x * dt / 2, vy + a1y * dt / 2), [a3x, a3y] = acc(vx + a2x * dt / 2, vy + a2y * dt / 2), [a4x, a4y] = acc(vx + a3x * dt, vy + a3y * dt);
      const nx = x + dt * (vx + dt / 6 * (a1x + a2x + a3x)), ny = y + dt * (vy + dt / 6 * (a1y + a2y + a3y));
      const nvx = vx + dt / 6 * (a1x + 2 * a2x + 2 * a3x + a4x), nvy = vy + dt / 6 * (a1y + 2 * a2y + 2 * a3y + a4y);
      if (ny < 0 && t > 0) { const f = y / (y - ny); x += (nx - x) * f; t += dt * f; pts.push([x, 0]); return { pts, R: x, T: t, H: Math.max(...pts.map((p) => p[1])) }; }
      x = nx; y = ny; vx = nvx; vy = nvy; t += dt;
      if (pts.length < 4000 && Math.round(t / dt) % 5 === 0) pts.push([x, y]);
    }
    return { pts, R: x, T: t, H: Math.max(...pts.map((p) => p[1])) };
  },
};

// ---------------- DC circuits ----------------
const ohm = {
  par: (a, b) => (a * b) / (a + b),
  // topologies: 'series' R1–R2; 'parallel' R1 ∥ R2; 'combo' R1 + (R2 ∥ R3). E (V), r internal (Ω)
  solve(top, E, r, R1, R2, R3) {
    const Req = top === 'series' ? R1 + R2 : top === 'parallel' ? ohm.par(R1, R2) : R1 + ohm.par(R2, R3);
    const I = E / (Req + r), Vt = E - I * r;
    let I1, I2, I3 = 0, V1, V2, V3 = 0;
    if (top === 'series') { I1 = I2 = I; V1 = I * R1; V2 = I * R2; }
    else if (top === 'parallel') { V1 = V2 = Vt; I1 = Vt / R1; I2 = Vt / R2; }
    else { I1 = I; V1 = I * R1; V2 = V3 = Vt - V1; I2 = V2 / R2; I3 = V3 / R3; }
    return { Req, I, Vt, I1, I2, I3, V1, V2, V3, P: [I1 * V1, I2 * V2, I3 * V3], Pr: I * I * r };
  },
};

// ---------------- ideal gas ----------------
const R_GAS = 8.314, kB = 1.380649e-23;
const gas = {
  R: R_GAS,
  P: (n, Tk, VL) => (n * R_GAS * Tk) / (VL / 1000) / 1000,          // kPa from mol, K, L
  // a 2-D box of non-colliding particles (sim units: m = 1, k = 1). Returns the measured wall pressure and the theory N·T/A.
  boxPressure(N, Tk, Wd, Ht, steps = 4000, dt = 0.01, seed = 7) {
    let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
    const p = Array.from({ length: N }, () => ({ x: rnd() * Wd, y: rnd() * Ht, vx: gauss() * Math.sqrt(Tk), vy: gauss() * Math.sqrt(Tk) }));
    let imp = 0;
    for (let i = 0; i < steps; i++) for (const q of p) {
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.x < 0) { q.x = -q.x; q.vx = -q.vx; imp += 2 * Math.abs(q.vx); } if (q.x > Wd) { q.x = 2 * Wd - q.x; q.vx = -q.vx; imp += 2 * Math.abs(q.vx); }
      if (q.y < 0) { q.y = -q.y; q.vy = -q.vy; imp += 2 * Math.abs(q.vy); } if (q.y > Ht) { q.y = 2 * Ht - q.y; q.vy = -q.vy; imp += 2 * Math.abs(q.vy); }
    }
    const ke = p.reduce((a, q) => a + (q.vx * q.vx + q.vy * q.vy) / 2, 0) / N;
    return { measured: imp / (steps * dt) / (2 * (Wd + Ht)), theory: (N * ke) / (Wd * Ht) };
  },
  vrms: (Tk, M) => Math.sqrt((3 * R_GAS * Tk) / M),                 // m/s, M in kg/mol
};

// ---------------- orbits ----------------
// units: AU, years, solar masses → G·M = 4π² M
const GM = (M) => 4 * Math.PI * Math.PI * M;
const orbit = {
  GM,
  vCirc: (M, r) => Math.sqrt(GM(M) / r),
  period: (M, a) => Math.sqrt(a ** 3 / M),                        // Kepler's 3rd law, years
  step(s, dt, M) {      // velocity Verlet
    const acc = (x, y) => { const r3 = Math.hypot(x, y) ** 3; return [-GM(M) * x / r3, -GM(M) * y / r3]; };
    const [ax, ay] = acc(s.x, s.y);
    const vx = s.vx + ax * dt / 2, vy = s.vy + ay * dt / 2, x = s.x + vx * dt, y = s.y + vy * dt;
    const [bx, by] = acc(x, y);
    return { x, y, vx: vx + bx * dt / 2, vy: vy + by * dt / 2 };
  },
  energy: (s, M) => 0.5 * (s.vx ** 2 + s.vy ** 2) - GM(M) / Math.hypot(s.x, s.y),
  angMom: (s) => s.x * s.vy - s.y * s.vx,
  semiMajor: (s, M) => -GM(M) / (2 * orbit.energy(s, M)),
};

// ---------------- waves ----------------
const waves = {
  v: (f, lam) => f * lam,
  harmonic: (n, v, L) => (n * v) / (2 * L),
  // two equal in-phase sources: amplitude at a point from the path difference
  amp: (dPath, lam) => Math.abs(2 * Math.cos((Math.PI * dPath) / lam)),
  fringe: (lam, L, d) => (lam * L) / d,
};

// ---------------- half-life ----------------
const ISOS = {
  c14: { zh: '碳-14', en: 'carbon-14', half: 5730, unit: ['年', 'years'] },
  i131: { zh: '碘-131', en: 'iodine-131', half: 8.02, unit: ['天', 'days'] },
  rn222: { zh: '氡-222', en: 'radon-222', half: 3.82, unit: ['天', 'days'] },
  u238: { zh: '鈾-238', en: 'uranium-238', half: 4.47e9, unit: ['年', 'years'] },
};
const decay = {
  ISOS,
  left: (N0, t, h) => N0 * Math.pow(0.5, t / h),
  pDecay: (dt, h) => 1 - Math.pow(0.5, dt / h),
  age: (frac, h) => h * Math.log2(1 / frac),
};

export default [
  {
    id: 'projectile', grades: [10, 11], subj: 'phys', icon: '🎯',
    name: T('拋體運動', 'Projectile motion'),
    intro: T('拋出去的物體水平方向等速、鉛直方向受重力等加速度，合起來是一條拋物線。調整發射速度、角度、高度和重力，比較不同角度的射程；打開空氣阻力看看真實世界的差別。',
      'A launched object moves at constant speed sideways while gravity accelerates it downward — together they make a parabola. Change the launch speed, angle, height and gravity, compare ranges, and switch on air resistance to see the real-world difference.'),
    cur: { tw: T('高中 物理 平面運動（拋體）', 'Senior high physics · motion in a plane (projectiles)'), us: 'NGSS HS-PS2-1' },
    model: proj,
    checks(m, ok) {
      const g = 9.8, a = m.fly(20, 30, g);
      ok(Math.abs(a.R - m.range(20, 30, g)) < 0.01 && Math.abs(a.T - m.tFlight(20, 30, g)) < 0.002 && Math.abs(a.H - m.hMax(20, 30, g)) < 0.01, 'numeric flight matches R = v²sin2θ/g, t and H');
      ok([20, 30, 40, 50, 60, 70].every((d) => m.range(25, d, g) < m.range(25, 45, g)), '45° gives the longest range on flat ground');
      ok(Math.abs(m.range(25, 30, g) - m.range(25, 60, g)) < 1e-9, 'complementary angles give the same range');
      ok(m.fly(30, 45, g, 0, 0.02).R < m.range(30, 45, g) * 0.8, 'air drag shortens the range');
      const b = m.fly(15, 40, g, 10); ok(Math.abs(b.T - m.tFlight(15, 40, g, 10)) < 0.003, 'launch from a height: time of flight formula');
      ok(Math.abs(m.range(20, 45, 1.62) / m.range(20, 45, 9.8) - 9.8 / 1.62) < 1e-9, 'range ∝ 1/g (Moon ≈ 6× farther)');
    },
    mount(k) {
      const m = proj, v = k.canvas(640, 380), { ctx, W, H } = v;
      let v0 = 20, ang = 45, h0 = 0, gk = 'earth', drag = false, shots = [], cur = null, t = 0;
      k.slider({ label: T('發射速率 v₀', 'Launch speed v₀'), min: 5, max: 40, step: 1, value: v0, unit: 'm/s', onInput: (x) => (v0 = x) });
      k.slider({ label: T('仰角 θ', 'Angle θ'), min: 0, max: 90, step: 1, value: ang, unit: '°', onInput: (x) => (ang = x) });
      k.slider({ label: T('發射高度 h', 'Launch height h'), min: 0, max: 30, step: 1, value: h0, unit: 'm', onInput: (x) => (h0 = x) });
      k.seg({ label: T('重力', 'Gravity'), value: 'earth', options: [{ v: 'earth', label: T('地球 9.8', 'Earth 9.8') }, { v: 'moon', label: T('月球 1.62', 'Moon 1.62') }, { v: 'mars', label: T('火星 3.71', 'Mars 3.71') }], onChange: (x) => (gk = x) });
      k.toggle({ label: T('空氣阻力（棒球大小）', 'Air resistance (baseball-like)'), value: false, onChange: (x) => (drag = x) });
      k.buttons([{ label: T('🚀 發射', '🚀 Launch'), primary: true, on: () => { const g = m.G[gk]; cur = { ...m.fly(v0, ang, g, h0, drag ? 0.005 : 0), v0, ang, g, drag }; t = 0; shots.push(cur); if (shots.length > 5) shots.shift(); } }, { label: T('🧹 清除', '🧹 Clear'), on: () => { shots = []; cur = null; } }]);
      const ro = k.readout();
      k.loop((dt) => {
        const c = k.colors(), g = m.G[gk];
        const fit = Math.max(20, ...shots.map((s) => Math.max(s.R, s.H * 1.8)), m.range(v0, 45, g) * 1.05 + 0, h0 * 2);
        const sc = 560 / fit, X = (x) => 50 + x * sc, Y = (y) => 330 - y * sc;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = c.dark ? '#33402f' : '#dcefcf'; ctx.fillRect(0, 330, W, 50);
        const step = [1, 2, 5, 10, 20, 50, 100, 200, 500][[1, 2, 5, 10, 20, 50, 100, 200, 500].findIndex((s) => fit / s <= 8)] || 1000;
        for (let x = 0; x <= fit; x += step) { k.line(ctx, X(x), 330, X(x), 337, c.ink, 1.5); k.text(ctx, String(x), X(x), 350, { color: c.muted, size: 12, align: 'center' }); }
        k.text(ctx, 'x (m)', 620, 366, { color: c.muted, size: 12, align: 'right' });
        // launcher
        k.rrect(ctx, 38, Y(h0), 24, 330 - Y(h0), 3, '#90a4ae');
        ctx.save(); ctx.translate(X(0), Y(h0)); ctx.rotate(-ang * D2R); k.rrect(ctx, 0, -6, 36, 12, 4, c.ink); ctx.restore();
        shots.forEach((s, i) => {
          const live = s === cur, upto = live ? t : Infinity;
          ctx.strokeStyle = live ? c.acc : `rgba(120,120,120,${0.3 + 0.1 * i})`; ctx.lineWidth = live ? 3 : 2; ctx.setLineDash(s.drag ? [6, 4] : []); ctx.beginPath();
          let last = null; const tt = s.T / (s.pts.length - 1);
          s.pts.forEach(([x, y], j) => { if (j * tt > upto) return; last = [x, y]; j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }); ctx.stroke(); ctx.setLineDash([]);
          if (live && last) {
            k.circle(ctx, X(last[0]), Y(last[1]), 8, '#e5484d', c.ink);
            const tn = Math.min(t, s.T), vx = s.v0 * Math.cos(s.ang * D2R), vy = s.v0 * Math.sin(s.ang * D2R) - s.g * tn;
            if (!s.drag && t < s.T) { k.arrow(ctx, X(last[0]), Y(last[1]), X(last[0]) + vx * 2.2, Y(last[1]), '#2f7de1', 3); k.arrow(ctx, X(last[0]), Y(last[1]), X(last[0]), Y(last[1]) - vy * 2.2, '#2f9e44', 3); }
          }
          if (!live || t >= s.T) k.text(ctx, `${k.fmt(s.R, 1)} m`, X(s.R), 318, { color: live ? c.acc : c.muted, size: 13, bold: live, align: 'center' });
        });
        if (cur) t = Math.min(cur.T, t + dt * Math.max(1, cur.T / 4));
        const R = h0 ? null : m.range(v0, ang, g);
        ro.set(k.L(`射程（理論，${h0 ? '有高度' : 'R = v₀²sin2θ / g'}）：<b>${R != null ? k.fmt(R, 2) : k.fmt(m.fly(v0, ang, g, h0).R, 2)} m</b><br>飛行時間 <b>${k.fmt(m.tFlight(v0, ang, g, h0), 2)} s</b>　最大高度 <b>${k.fmt(m.hMax(v0, ang, g, h0), 2)} m</b>${cur && cur.drag ? `<br>有空氣阻力時射程只有 <b>${k.fmt(cur.R, 1)} m</b>（虛線）` : ''}<br><span class="muted">藍箭頭 vₓ 不變，綠箭頭 v<sub>y</sub> 每秒減少 g。</span>`,
          `Range (theory${h0 ? ', from a height' : ', R = v₀²sin2θ / g'}): <b>${R != null ? k.fmt(R, 2) : k.fmt(m.fly(v0, ang, g, h0).R, 2)} m</b><br>Flight time <b>${k.fmt(m.tFlight(v0, ang, g, h0), 2)} s</b>　max height <b>${k.fmt(m.hMax(v0, ang, g, h0), 2)} m</b>${cur && cur.drag ? `<br>With air resistance the range is only <b>${k.fmt(cur.R, 1)} m</b> (dashed)` : ''}<br><span class="muted">Blue arrow vₓ stays the same; green v<sub>y</sub> drops by g every second.</span>`));
      });
    },
    observe: [
      { try: T('v₀ = 20 m/s、高度 0，分別用 30°、45°、60° 發射。', 'With v₀ = 20 m/s from the ground, launch at 30°, 45° and 60°.'),
        ask: T('哪一個角度射得最遠？30° 和 60° 呢？', 'Which angle goes farthest? And how do 30° and 60° compare?'),
        options: [T('45° 最遠；30° 和 60° 射程相同', '45° is farthest; 30° and 60° tie'), T('60° 最遠', '60° is farthest'), T('30° 最遠；60° 最近', '30° is farthest; 60° is shortest')],
        why: T('R = v₀²sin2θ / g，sin2θ 在 θ = 45° 時最大；sin60° = sin120°，所以互餘的 30° 和 60° 射程一樣（20²×0.866 ÷ 9.8 ≈ 35.3 m）。', 'R = v₀² sin2θ / g, and sin2θ is largest at θ = 45°. Since sin60° = sin120°, complementary angles 30° and 60° give the same range (20² × 0.866 ÷ 9.8 ≈ 35.3 m).') },
      { try: T('發射後觀察藍色和綠色箭頭。', 'Launch and watch the blue and green arrows.'),
        ask: T('飛行中水平速度 vₓ…', 'During the flight the horizontal velocity vₓ…'),
        options: [T('保持不變', 'stays constant'), T('愈來愈小', 'keeps decreasing'), T('在最高點變成 0', 'becomes 0 at the top')],
        why: T('沒有空氣阻力時，水平方向不受力，vₓ = v₀cosθ 不變；只有鉛直速度受重力影響，在最高點 v<sub>y</sub> = 0。', 'Without air resistance there is no horizontal force, so vₓ = v₀cosθ stays constant. Only the vertical velocity changes; v<sub>y</sub> is zero at the top.') },
      { try: T('同樣的設定，比較「地球」和「月球」。', 'Same settings: compare Earth and the Moon.'),
        ask: T('在月球上射程大約變成幾倍？', 'About how many times farther does it go on the Moon?'),
        options: [T('約 6 倍', 'About 6 times'), T('約 1/6', 'About 1/6 as far'), T('一樣遠', 'The same')],
        why: T('射程和 g 成反比：9.8 ÷ 1.62 ≈ 6.0，所以月球上射程約為地球的 6 倍，飛行時間和最大高度也約 6 倍。', 'Range is inversely proportional to g: 9.8 ÷ 1.62 ≈ 6.0, so it flies about 6 times farther — and the flight time and height are about 6 times bigger too.') },
      { try: T('打開空氣阻力，用 35 m/s、45° 發射，和沒有阻力比較。', 'Turn on air resistance and launch at 35 m/s and 45°; compare with no air.'),
        ask: T('有空氣阻力時…', 'With air resistance…'),
        options: [T('射程變短，軌跡不再對稱（下降比較陡）', 'the range is shorter and the path is lopsided (steeper on the way down)'), T('射程變長', 'the range is longer'), T('軌跡完全一樣', 'the path is identical')],
        why: T('空氣阻力一直和運動方向相反，讓物體減速，所以射程和高度都變小，下降段比上升段陡。', 'Air resistance always opposes the motion and slows the ball, so the range and height shrink and the way down is steeper than the way up.') },
    ],
  },
  {
    id: 'circuits-ohm', grades: [10, 11], subj: 'phys', icon: '🔌',
    name: T('歐姆定律與電路', 'Ohm’s law and circuits'),
    intro: T('V = IR：電阻兩端的電壓等於電流乘以電阻。把電阻串聯或並聯，調整電動勢、內電阻和各個電阻，看電流表和電壓表的讀數，驗證克希何夫定律和功率 P = IV。',
      'V = IR: the voltage across a resistor equals current × resistance. Connect resistors in series or parallel, change the EMF, the internal resistance and each resistor, and read the meters to check Kirchhoff’s laws and power P = IV.'),
    cur: { tw: T('高中 物理 電流與電路', 'Senior high physics · current and circuits'), us: 'NGSS HS-PS3-1' },
    model: ohm,
    checks(m, ok) {
      const s = m.solve('series', 12, 0, 4, 2, 1); ok(Math.abs(s.I - 2) < 1e-12 && Math.abs(s.V1 - 8) < 1e-12 && Math.abs(s.V2 - 4) < 1e-12, 'series 12 V across 4 Ω + 2 Ω → 2 A; 8 V and 4 V');
      const p = m.solve('parallel', 12, 0, 4, 12, 1); ok(Math.abs(p.Req - 3) < 1e-12 && Math.abs(p.I - 4) < 1e-12 && Math.abs(p.I1 + p.I2 - p.I) < 1e-12, 'parallel 4 Ω ∥ 12 Ω = 3 Ω; currents add (KCL)');
      const c = m.solve('combo', 9, 1, 2, 6, 3); ok(Math.abs(c.Req - 4) < 1e-12 && Math.abs(c.I - 1.8) < 1e-12 && Math.abs(c.I2 + c.I3 - c.I) < 1e-12, 'combo: 2 + (6 ∥ 3) = 4 Ω; with r = 1 Ω, I = 1.8 A');
      ok(Math.abs(c.V1 + c.V2 + c.I * 1 - 9) < 1e-12, 'Kirchhoff voltage law around the loop');
      ok(Math.abs(c.P.reduce((a, b) => a + b, 0) + c.Pr - 9 * c.I) < 1e-12, 'power delivered by the EMF = power in all resistors');
      ok(m.solve('series', 6, 0, 10, 10, 1).Req > m.solve('parallel', 6, 0, 10, 10, 1).Req, 'series adds, parallel is less than the smallest');
    },
    mount(k) {
      const m = ohm, v = k.canvas(640, 380), { ctx, W, H } = v;
      let top = 'combo', E = 9, r = 0.5, R1 = 10, R2 = 20, R3 = 30, ph = 0;
      k.seg({ label: T('接法', 'Circuit'), value: 'combo', options: [{ v: 'series', label: T('串聯 R₁ + R₂', 'Series R₁ + R₂') }, { v: 'parallel', label: T('並聯 R₁ ∥ R₂', 'Parallel R₁ ∥ R₂') }, { v: 'combo', label: 'R₁ + (R₂ ∥ R₃)' }], onChange: (x) => (top = x) });
      k.slider({ label: T('電動勢 ε', 'EMF ε'), min: 1, max: 24, step: 0.5, value: E, unit: 'V', dp: 1, onInput: (x) => (E = x) });
      k.slider({ label: T('內電阻 r', 'Internal resistance r'), min: 0, max: 5, step: 0.5, value: r, unit: 'Ω', dp: 1, onInput: (x) => (r = x) });
      k.slider({ label: 'R₁', min: 1, max: 100, step: 1, value: R1, unit: 'Ω', onInput: (x) => (R1 = x) });
      k.slider({ label: 'R₂', min: 1, max: 100, step: 1, value: R2, unit: 'Ω', onInput: (x) => (R2 = x) });
      const s3 = k.slider({ label: 'R₃', min: 1, max: 100, step: 1, value: R3, unit: 'Ω', onInput: (x) => (R3 = x) });
      const ro = k.readout();
      const res = (x, y, vert, label, val, I, Vv) => {
        const c = k.colors();
        ctx.save(); ctx.translate(x, y); if (vert) ctx.rotate(Math.PI / 2);
        ctx.fillStyle = c.card; ctx.fillRect(-30, -11, 60, 22); ctx.strokeStyle = c.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-30, 0); for (let i = 0; i < 6; i++) ctx.lineTo(-25 + i * 10, i % 2 ? 10 : -10); ctx.lineTo(30, 0); ctx.stroke(); ctx.restore();
        const lx = vert ? x + 18 : x, ly = vert ? y : y - 22;
        k.text(ctx, `${label} = ${val} Ω`, lx, ly - (vert ? 16 : 0), { color: c.ink, size: 13, bold: true, align: vert ? 'left' : 'center' });
        k.text(ctx, `${k.fmt(I, 3)} A · ${k.fmt(Vv, 2)} V`, lx, ly + (vert ? 4 : 40 + 4), { color: c.acc, size: 13, bold: true, align: vert ? 'left' : 'center' });
      };
      k.loop((dt) => {
        const c = k.colors(), s = m.solve(top, E, r, R1, R2, R3), wire = c.ink;
        s3.el.style.display = top === 'combo' ? '' : 'none';
        ctx.clearRect(0, 0, W, H);
        const L = 80, Rx = 560, Tp = 70, Bt = 320;
        k.line(ctx, L, Tp, Rx, Tp, wire, 3); k.line(ctx, L, Bt, Rx, Bt, wire, 3); k.line(ctx, L, Tp, L, 170, wire, 3); k.line(ctx, L, 230, L, Bt, wire, 3);
        // battery with internal resistance
        k.line(ctx, L - 20, 190, L + 20, 190, wire, 4); k.line(ctx, L - 11, 205, L + 11, 205, wire, 7);
        k.text(ctx, `ε = ${k.fmt(E, 1)} V`, L - 26, 180, { color: c.ink, size: 14, bold: true, align: 'right' });
        k.text(ctx, `r = ${k.fmt(r, 1)} Ω`, L - 26, 220, { color: c.muted, size: 13, align: 'right' });
        k.line(ctx, L, 170, L, 190, wire, 3); k.line(ctx, L, 205, L, 230, wire, 3);
        if (top === 'series') { res(240, Tp, false, 'R₁', R1, s.I1, s.V1); res(400, Tp, false, 'R₂', R2, s.I2, s.V2); k.line(ctx, Rx, Tp, Rx, Bt, wire, 3); }
        else if (top === 'parallel') { k.line(ctx, Rx, Tp, Rx, Bt, wire, 3); k.line(ctx, 330, Tp, 330, Bt, wire, 3); res(330, 195, true, 'R₁', R1, s.I1, s.V1); res(Rx, 195, true, 'R₂', R2, s.I2, s.V2); }
        else { res(220, Tp, false, 'R₁', R1, s.I1, s.V1); k.line(ctx, 380, Tp, 380, Bt, wire, 3); k.line(ctx, Rx, Tp, Rx, Bt, wire, 3); res(380, 195, true, 'R₂', R2, s.I2, s.V2); res(Rx, 195, true, 'R₃', R3, s.I3, s.V3); }
        // ammeter on the main line
        k.circle(ctx, L + 60, Bt, 16, c.card, c.ink, 2); k.text(ctx, 'A', L + 60, Bt, { color: c.ink, size: 15, bold: true, align: 'center' });
        k.text(ctx, `I = ${k.fmt(s.I, 3)} A`, L + 60, Bt + 30, { color: c.no, size: 15, bold: true, align: 'center' });
        k.text(ctx, k.L(`端電壓 ${k.fmt(s.Vt, 2)} V`, `terminal ${k.fmt(s.Vt, 2)} V`), L + 4, 262, { color: c.muted, size: 13 });
        ph += dt * s.I * 60;
        for (let i = 0; i < 16; i++) { const u = ((ph / 900 + i / 16) % 1), x = L + u * (Rx - L); k.circle(ctx, x, Tp, 3, '#ffb300'); k.circle(ctx, Rx - u * (Rx - L), Bt, 3, '#ffb300'); }
        const Ptot = s.P.reduce((a, b) => a + b, 0);
        ro.set(k.L(`等效電阻 R<sub>eq</sub> = <b>${k.fmt(s.Req, 2)} Ω</b>　I = ε ÷ (R<sub>eq</sub> + r) = ${k.fmt(E, 1)} ÷ ${k.fmt(s.Req + r, 2)} = <b>${k.fmt(s.I, 3)} A</b><br>電阻消耗功率 <b>${k.fmt(Ptot, 2)} W</b>，內電阻 ${k.fmt(s.Pr, 2)} W，電池輸出 ε·I = ${k.fmt(E * s.I, 2)} W`,
          `Equivalent R<sub>eq</sub> = <b>${k.fmt(s.Req, 2)} Ω</b>　I = ε ÷ (R<sub>eq</sub> + r) = ${k.fmt(E, 1)} ÷ ${k.fmt(s.Req + r, 2)} = <b>${k.fmt(s.I, 3)} A</b><br>Power in resistors <b>${k.fmt(Ptot, 2)} W</b>, in r ${k.fmt(s.Pr, 2)} W, EMF supplies ε·I = ${k.fmt(E * s.I, 2)} W`));
      });
    },
    observe: [
      { try: T('選「串聯」，r = 0，R₁ = 10 Ω、R₂ = 20 Ω、ε = 9 V。', 'Choose series, r = 0, R₁ = 10 Ω, R₂ = 20 Ω, ε = 9 V.'),
        ask: T('哪一個電阻兩端的電壓比較大？', 'Which resistor has the bigger voltage across it?'),
        options: [T('R₂（20 Ω），是 R₁ 的 2 倍', 'R₂ (20 Ω), twice R₁’s'), T('R₁（10 Ω）', 'R₁ (10 Ω)'), T('兩個一樣', 'They are equal')],
        why: T('串聯時電流相同（9 ÷ 30 = 0.3 A），V = IR，所以電阻大的分到比較多電壓：3 V 和 6 V，加起來等於 9 V。', 'In series the current is the same (9 ÷ 30 = 0.3 A). Since V = IR, the bigger resistor gets more voltage: 3 V and 6 V, which add to 9 V.') },
      { try: T('選「並聯」，R₁ = 10 Ω、R₂ = 20 Ω。', 'Choose parallel with R₁ = 10 Ω and R₂ = 20 Ω.'),
        ask: T('並聯的等效電阻是…', 'The equivalent resistance in parallel is…'),
        options: [T('比最小的電阻還小（約 6.67 Ω）', 'smaller than the smallest resistor (about 6.67 Ω)'), T('30 Ω', '30 Ω'), T('15 Ω（平均）', '15 Ω (the average)')],
        why: T('1/R = 1/10 + 1/20 = 3/20，R = 6.67 Ω。並聯多了一條路讓電流通過，總電阻反而變小。', '1/R = 1/10 + 1/20 = 3/20, so R = 6.67 Ω. Parallel adds another path for current, so the total resistance goes down.') },
      { try: T('任選一個電路，把內電阻 r 從 0 調到 5 Ω。', 'Pick any circuit and raise r from 0 to 5 Ω.'),
        ask: T('內電阻變大，端電壓…', 'As the internal resistance grows, the terminal voltage…'),
        options: [T('變小', 'drops'), T('變大', 'rises'), T('永遠等於電動勢', 'always equals the EMF')],
        why: T('端電壓 V = ε − Ir，電池內部的電阻也會分掉一部分電壓，電流愈大或 r 愈大，端電壓愈低。', 'Terminal voltage V = ε − Ir: the battery’s own resistance uses up some voltage, so the bigger I or r, the lower the terminal voltage.') },
    ],
  },
  {
    id: 'ideal-gas', grades: [10, 11], subj: 'chem', icon: '🎈',
    name: T('理想氣體', 'The ideal gas'),
    intro: T('氣體的壓力來自無數分子撞擊器壁。改變溫度、體積（推動活塞）和分子數，看看壓力怎麼變，驗證波以耳定律、查理定律和 PV = nRT。右邊的長條圖是分子速率的分布。',
      'Gas pressure comes from countless molecules hitting the walls. Change the temperature, the volume (move the piston) and the number of molecules and watch the pressure — check Boyle’s law, Charles’s law and PV = nRT. The histogram shows how fast the molecules move.'),
    cur: { tw: T('高中 化學／物理 氣體', 'Senior high chemistry / physics · gases'), us: 'NGSS HS-PS3-2' },
    model: gas,
    checks(m, ok) {
      ok(Math.abs(m.P(1, 273.15, 22.414) - 101.325) < 0.05, '1 mol at 273.15 K in 22.4 L → 101.3 kPa');
      ok(Math.abs(m.P(1, 300, 10) * 10 - m.P(1, 300, 20) * 20) < 1e-9, 'Boyle: PV constant at fixed T');
      ok(Math.abs(m.P(1, 600, 10) / m.P(1, 300, 10) - 2) < 1e-12, 'Gay-Lussac: P ∝ T at fixed V');
      const b = m.boxPressure(200, 1, 10, 10); ok(Math.abs(b.measured / b.theory - 1) < 0.05, `particle box pressure matches N·kT/A (ratio ${b.measured / b.theory})`);
      const b2 = m.boxPressure(200, 1, 20, 10); ok(Math.abs((b.measured * 100) / (b2.measured * 200) - 1) < 0.07, 'particle box obeys Boyle’s law');
      ok(Math.abs(m.vrms(300, 0.028) - 517) < 1, 'N₂ at 300 K: v_rms ≈ 517 m/s');
    },
    mount(k) {
      const m = gas, v = k.canvas(640, 380), { ctx, W, H } = v;
      let Tk = 300, Vfrac = 1, N = 100, ps = [], imp = 0, tAcc = 0, Pmeas = 0;
      const box = { x: 30, y: 40, h: 280, wmax: 380 };
      const seedP = (n) => { const o = []; for (let i = 0; i < n; i++) { const r1 = Math.random(), r2 = Math.random(), s = Math.sqrt(-2 * Math.log(r1 + 1e-12)); o.push({ x: box.x + Math.random() * box.wmax * Vfrac, y: box.y + Math.random() * box.h, vx: s * Math.cos(6.283 * r2), vy: s * Math.sin(6.283 * r2) }); } return o; };
      ps = seedP(N);
      k.slider({ label: T('溫度 T', 'Temperature T'), min: 100, max: 600, step: 10, value: Tk, unit: 'K', onInput: (x) => (Tk = x) });
      k.slider({ label: T('體積（活塞位置）', 'Volume (piston)'), min: 0.3, max: 1, step: 0.05, value: 1, dp: 2, unit: '× V₀', onInput: (x) => { Vfrac = x; } });
      k.slider({ label: T('分子數', 'Molecules'), min: 20, max: 200, step: 10, value: N, onInput: (x) => { N = x; while (ps.length < N) ps.push(...seedP(1)); ps.length = N; } });
      const ro = k.readout();
      // real-unit version: N=100 molecules ↔ 1 mol in V₀ = 24.9 L at 300 K → 100 kPa
      const V0 = 24.94;
      k.loop((dt) => {
        const c = k.colors(), wid = box.wmax * Vfrac, sp = 60 * Math.sqrt(Tk / 300);
        dt = Math.min(dt, 0.03);
        for (const p of ps) {
          p.x += p.vx * sp * dt; p.y += p.vy * sp * dt;
          if (p.x < box.x) { p.x = 2 * box.x - p.x; p.vx = Math.abs(p.vx); imp += 2 * Math.abs(p.vx) * sp; }
          if (p.x > box.x + wid) { p.x = Math.max(box.x, 2 * (box.x + wid) - p.x); p.vx = -Math.abs(p.vx); imp += 2 * Math.abs(p.vx) * sp; }
          if (p.y < box.y) { p.y = 2 * box.y - p.y; p.vy = Math.abs(p.vy); imp += 2 * Math.abs(p.vy) * sp; }
          if (p.y > box.y + box.h) { p.y = 2 * (box.y + box.h) - p.y; p.vy = -Math.abs(p.vy); imp += 2 * Math.abs(p.vy) * sp; }
        }
        tAcc += dt; if (tAcc > 0.5) { const per = 2 * (wid + box.h); Pmeas = Pmeas ? Pmeas * 0.5 + 0.5 * (imp / tAcc / per) : imp / tAcc / per; imp = 0; tAcc = 0; }
        ctx.clearRect(0, 0, W, H);
        const hot = Math.min(1, (Tk - 100) / 500);
        ctx.fillStyle = `rgba(${Math.round(80 + 170 * hot)},${Math.round(140 - 60 * hot)},${Math.round(230 - 170 * hot)},0.12)`; ctx.fillRect(box.x, box.y, wid, box.h);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.strokeRect(box.x, box.y, box.wmax + 10, box.h);
        k.rrect(ctx, box.x + wid, box.y - 2, 12, box.h + 4, 3, '#78909c', c.ink); k.rrect(ctx, box.x + wid + 12, box.y + box.h / 2 - 8, box.wmax - wid + 40, 16, 4, '#b0bec5');
        for (const p of ps) { const s = Math.hypot(p.vx, p.vy); k.circle(ctx, p.x, p.y, 4.5, s > 1.8 ? '#e5484d' : s > 0.9 ? '#f59f00' : '#2f7de1'); }
        // speed histogram
        const bins = Array(10).fill(0); ps.forEach((p) => { const s = Math.hypot(p.vx, p.vy); bins[Math.min(9, Math.floor(s / 0.35))]++; });
        const hx = 470, hy = 300, hw = 150, hh = 150;
        bins.forEach((b, i) => { const bh = (b / N) * hh * 2.2; ctx.fillStyle = i > 5 ? '#e5484d' : i > 2 ? '#f59f00' : '#2f7de1'; ctx.fillRect(hx + i * 15, hy - bh, 13, bh); });
        k.line(ctx, hx, hy, hx + hw, hy, c.ink, 1.5);
        k.text(ctx, k.L('分子速率分布', 'speed distribution'), hx + hw / 2, hy + 18, { color: c.ink, size: 13, align: 'center' });
        k.text(ctx, k.L('慢 → 快', 'slow → fast'), hx + hw / 2, hy + 36, { color: c.muted, size: 12, align: 'center' });
        const n = N / 100, VL = V0 * Vfrac, Pth = m.P(n, Tk, VL);
        const Psim = Pmeas / (N / (box.wmax * Vfrac * box.h) * (60 * Math.sqrt(Tk / 300)) ** 2) || 0;   // measured ÷ ideal-gas prediction
        k.text(ctx, `P = ${k.fmt(Pth, 1)} kPa`, 545, 60, { color: c.acc, size: 22, bold: true, align: 'center' });
        k.text(ctx, k.L(`（撞牆測量 ÷ 理論 = ${k.fmt(Psim, 2)}）`, `(measured ÷ theory = ${k.fmt(Psim, 2)})`), 545, 88, { color: c.muted, size: 12, align: 'center' });
        ro.set(k.L(`n = <b>${k.fmt(n, 1)} mol</b>（每 100 顆代表 1 mol）　T = <b>${Tk} K</b>　V = <b>${k.fmt(VL, 1)} L</b><br>P = nRT ÷ V = ${k.fmt(n, 1)} × 8.314 × ${Tk} ÷ ${k.fmt(VL / 1000, 4)} m³ = <b>${k.fmt(Pth, 1)} kPa</b><br><span class="muted">PV = ${k.fmt(Pth * VL, 0)} kPa·L（溫度和 n 不變時固定）</span>`,
          `n = <b>${k.fmt(n, 1)} mol</b> (100 dots = 1 mol)　T = <b>${Tk} K</b>　V = <b>${k.fmt(VL, 1)} L</b><br>P = nRT ÷ V = ${k.fmt(n, 1)} × 8.314 × ${Tk} ÷ ${k.fmt(VL / 1000, 4)} m³ = <b>${k.fmt(Pth, 1)} kPa</b><br><span class="muted">PV = ${k.fmt(Pth * VL, 0)} kPa·L (constant when T and n are fixed)</span>`));
      });
    },
    observe: [
      { try: T('溫度固定，把體積從 1 × V₀ 推到 0.5 × V₀。', 'Keep T fixed and push the volume from 1 × V₀ to 0.5 × V₀.'),
        ask: T('體積減半，壓力…', 'Halving the volume makes the pressure…'),
        options: [T('變成 2 倍', 'double'), T('變成一半', 'halve'), T('不變', 'stay the same')],
        why: T('波以耳定律：溫度和分子數不變時 PV = 定值。空間變小，分子撞牆的次數變多，壓力變成 2 倍。', 'Boyle’s law: at fixed T and n, PV is constant. In a smaller space molecules hit the walls more often, so the pressure doubles.') },
      { try: T('體積固定，把溫度從 300 K 加到 600 K。', 'Keep the volume fixed and heat from 300 K to 600 K.'),
        ask: T('絕對溫度加倍，壓力…', 'Doubling the absolute temperature makes the pressure…'),
        options: [T('變成 2 倍', 'double'), T('變成 4 倍', 'four times bigger'), T('不變', 'stay the same')],
        why: T('P ∝ T（體積固定）。溫度升高，分子平均動能增加，撞牆更用力也更頻繁。要用絕對溫度（K），不能用 °C。', 'P ∝ T at fixed volume. Hotter molecules have more kinetic energy and hit the walls harder and more often. Always use kelvins, not °C.') },
      { try: T('溫度調高，看右邊的速率分布長條圖。', 'Raise the temperature and watch the speed histogram.'),
        ask: T('溫度升高時分子的速率…', 'At a higher temperature the molecules’ speeds…'),
        options: [T('整體變快，分布往右移、變寬', 'shift faster — the distribution moves right and spreads out'), T('全部變成一樣快', 'all become exactly the same'), T('變慢', 'get slower')],
        why: T('同一溫度下分子有快有慢；溫度愈高，平均速率愈大（v<sub>rms</sub> ∝ √T），分布也愈寬。', 'At any temperature some molecules are fast and some slow. Higher temperature raises the average speed (v<sub>rms</sub> ∝ √T) and widens the spread.') },
    ],
  },
  {
    id: 'orbits', grades: [11, 12], subj: 'phys', icon: '🪐',
    name: T('萬有引力與軌道', 'Gravity and orbits'),
    intro: T('行星受恆星的萬有引力 F = GMm/r² 拉著，一邊前進一邊「掉」向恆星，形成軌道。調整初始速度，速度剛好時是圓，太慢或稍快是橢圓，超過脫離速度就一去不回。注意克卜勒第二定律：相同時間掃過相同面積！',
      'A planet is pulled by its star with F = GMm/r². It keeps falling toward the star while moving sideways — that is an orbit. With just the right speed the orbit is a circle; slower or a bit faster gives an ellipse; above escape speed it never comes back. Watch Kepler’s second law: equal areas in equal times!'),
    cur: { tw: T('高中 物理 萬有引力與克卜勒定律', 'Senior high physics · gravitation and Kepler’s laws'), us: 'NGSS HS-ESS1-4' },
    model: orbit,
    checks(m, ok) {
      ok(Math.abs(m.period(1, 1) - 1) < 1e-12 && Math.abs(m.period(1, 4) - 8) < 1e-12, 'Kepler 3: 1 AU → 1 yr, 4 AU → 8 yr');
      let s = { x: 1, y: 0, vx: 0, vy: m.vCirc(1, 1) }; const e0 = m.energy(s, 1), l0 = m.angMom(s); let t = 0, crossed = null, prevY = 0;
      for (let i = 0; i < 20000; i++) { s = m.step(s, 1e-4, 1); t += 1e-4; if (prevY < 0 && s.y >= 0 && t > 0.5 && crossed == null) crossed = t; prevY = s.y; }
      ok(Math.abs(crossed - 1) < 1e-3, 'circular orbit at 1 AU takes 1 year');
      ok(Math.abs(m.energy(s, 1) - e0) / Math.abs(e0) < 1e-6 && Math.abs(m.angMom(s) - l0) / l0 < 1e-9, 'energy and angular momentum conserved');
      let e = { x: 1, y: 0, vx: 0, vy: m.vCirc(1, 1) * 1.2 }; const a = m.semiMajor(e, 1); ok(Math.abs(m.period(1, a) - Math.pow(a, 1.5)) < 1e-12 && a > 1, 'faster start → bigger ellipse with a longer period');
      ok(m.energy({ x: 1, y: 0, vx: 0, vy: Math.SQRT2 * m.vCirc(1, 1) }, 1) >= -1e-9, '√2 × circular speed = escape (energy ≥ 0)');
    },
    mount(k) {
      const m = orbit, v = k.canvas(640, 420), { ctx, W, H } = v;
      let M = 1, r0 = 1, f = 1, s, trail = [], t = 0, areaPts = [], wedges = [], wedgeT = 0;
      const reset = () => { s = { x: r0, y: 0, vx: 0, vy: m.vCirc(M, r0) * f }; trail = []; t = 0; wedges = []; wedgeT = 0; areaPts = [[s.x, s.y]]; };
      k.slider({ label: T('起始速度（× 圓周速度）', 'Starting speed (× circular speed)'), min: 0.5, max: 1.5, step: 0.05, value: 1, dp: 2, onInput: (x) => { f = x; reset(); } });
      k.slider({ label: T('起始距離', 'Starting distance'), min: 0.5, max: 2, step: 0.1, value: 1, unit: 'AU', dp: 1, onInput: (x) => { r0 = x; reset(); } });
      k.slider({ label: T('恆星質量', 'Star mass'), min: 0.5, max: 2, step: 0.1, value: 1, unit: T('倍太陽', '× Sun'), dp: 1, onInput: (x) => { M = x; reset(); } });
      k.toggle({ label: T('顯示等時間掃過的面積', 'Show equal-time areas'), value: true, onChange: (x) => (showA = x) });
      let showA = true;
      k.buttons([{ label: T('↺ 重新開始', '↺ Restart'), primary: true, on: reset }]);
      const ro = k.readout();
      reset();
      const sc = 75, cx = 300, cy = 210;
      k.loop((dt) => {
        const c = k.colors(), E = m.energy(s, M), bound = E < 0, a = bound ? m.semiMajor(s, M) : Infinity, Tp = bound ? m.period(M, a) : Infinity;
        const yearsPerSec = 0.35, n = 200, h = (dt * yearsPerSec) / n;
        for (let i = 0; i < n; i++) { s = m.step(s, h, M); t += h; }
        trail.push([s.x, s.y]); if (trail.length > 1500) trail.shift();
        if (bound) { wedgeT += dt * yearsPerSec; areaPts.push([s.x, s.y]); if (wedgeT >= Tp / 12) { wedges.push(areaPts); if (wedges.length > 12) wedges.shift(); areaPts = [[s.x, s.y]]; wedgeT = 0; } }
        ctx.fillStyle = '#0b1226'; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 70; i++) k.circle(ctx, STAR(i, 1) * W, STAR(i, 2) * H, i % 9 ? 0.7 : 1.3, '#fff');
        if (showA) wedges.forEach((wd, i) => { ctx.fillStyle = i % 2 ? 'rgba(80,170,255,0.25)' : 'rgba(255,200,80,0.25)'; ctx.beginPath(); ctx.moveTo(cx, cy); wd.forEach(([x, y]) => ctx.lineTo(cx + x * sc, cy - y * sc)); ctx.closePath(); ctx.fill(); });
        ctx.strokeStyle = 'rgba(160,200,255,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); trail.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * sc, cy - y * sc) : ctx.moveTo(cx + x * sc, cy - y * sc))); ctx.stroke();
        const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 30 * Math.sqrt(M)); glow.addColorStop(0, '#fff6c0'); glow.addColorStop(1, 'rgba(255,190,40,0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 30 * Math.sqrt(M), 0, 7); ctx.fill();
        k.circle(ctx, cx, cy, 10 + 4 * M, '#ffcf3f');
        const px = cx + s.x * sc, py = cy - s.y * sc;
        k.circle(ctx, px, py, 7, '#4aa3f0', '#fff', 1.5);
        k.arrow(ctx, px, py, px + s.vx * 6, py - s.vy * 6, '#2f9e44', 2.5);
        const rr = Math.hypot(s.x, s.y); k.arrow(ctx, px, py, px - (s.x / rr) * 30, py + (s.y / rr) * 30, '#e5484d', 2.5);
        k.text(ctx, k.L(`時間 ${k.fmt(t, 2)} 年`, `time ${k.fmt(t, 2)} yr`), 14, 22, { color: '#cfe3ff', size: 15, bold: true });
        k.text(ctx, k.L('綠：速度　紅：引力方向', 'green: velocity  red: gravity'), 14, H - 14, { color: '#9fb3d9', size: 12 });
        const speedKm = Math.hypot(s.vx, s.vy) * 4.74;
        ro.set(k.L(`距離 <b>${k.fmt(rr, 2)} AU</b>　速率 <b>${k.fmt(speedKm, 1)} km/s</b><br>${bound ? `橢圓軌道：半長軸 a = <b>${k.fmt(a, 2)} AU</b>，週期 T = √(a³/M) = <b>${k.fmt(Tp, 2)} 年</b>` : '<b>超過脫離速度：不會回來了！</b>'}<br><span class="muted">總力學能 ${bound ? '< 0（被束縛）' : '≥ 0（脫離）'}；離恆星近時走得快，遠時走得慢。</span>`,
          `Distance <b>${k.fmt(rr, 2)} AU</b>　speed <b>${k.fmt(speedKm, 1)} km/s</b><br>${bound ? `Ellipse: semi-major axis a = <b>${k.fmt(a, 2)} AU</b>, period T = √(a³/M) = <b>${k.fmt(Tp, 2)} years</b>` : '<b>Above escape speed — it’s never coming back!</b>'}<br><span class="muted">Total energy ${bound ? '< 0 (bound)' : '≥ 0 (escaping)'}; it moves fast near the star and slow far away.</span>`));
      });
    },
    observe: [
      { try: T('起始速度 1.00 × 圓周速度，再改成 1.2。', 'Start at 1.00 × circular speed, then change to 1.2.'),
        ask: T('速度 1.2 倍時軌道變成…', 'At 1.2 times the circular speed the orbit becomes…'),
        options: [T('更大的橢圓，起點是離恆星最近的點', 'a bigger ellipse with the start as the closest point'), T('更小的圓', 'a smaller circle'), T('直接飛走', 'an escape path')],
        why: T('速度稍大時引力不足以讓它維持圓周，行星飛向較遠處又被拉回，形成橢圓；起點成為近日點。要到 √2 ≈ 1.41 倍才會脫離。', 'With a bit more speed gravity can’t hold it in a circle, so it swings out and gets pulled back — an ellipse with the start as the closest point. Only at √2 ≈ 1.41 times does it escape.') },
      { try: T('用 0.7 倍的速度，打開「等時間掃過的面積」。', 'Use 0.7 times the speed with the equal-time areas on.'),
        ask: T('靠近恆星時的扇形和遠離時的扇形…', 'The wedges near the star compared with those far away are…'),
        options: [T('形狀不同但面積相等', 'different shapes but equal areas'), T('近的面積比較大', 'bigger near the star'), T('遠的面積比較大', 'bigger far from the star')],
        why: T('克卜勒第二定律：行星和恆星的連線在相同時間掃過相同面積（角動量守恆）。所以靠近時跑得快，扇形又短又寬；遠時跑得慢，扇形又細又長。', 'Kepler’s second law: the line from star to planet sweeps equal areas in equal times (angular momentum is conserved). Near the star it moves fast — short wide wedges; far away it moves slowly — long thin wedges.') },
      { try: T('速度 1.0，把起始距離從 1 AU 改成 2 AU。', 'At speed 1.0, change the starting distance from 1 AU to 2 AU.'),
        ask: T('軌道半徑變 2 倍，週期大約變成…', 'Doubling the orbit radius makes the period about…'),
        options: [T('2.83 倍', '2.83 times longer'), T('2 倍', '2 times longer'), T('4 倍', '4 times longer')],
        why: T('克卜勒第三定律 T² ∝ a³：T ∝ a^1.5，2^1.5 = 2√2 ≈ 2.83。', 'Kepler’s third law T² ∝ a³ gives T ∝ a^1.5, and 2^1.5 = 2√2 ≈ 2.83.') },
    ],
  },
  {
    id: 'waves', grades: [10, 11], subj: 'phys', icon: '🌊',
    name: T('波動與干涉', 'Waves and interference'),
    intro: T('波速 = 頻率 × 波長（v = fλ）。看行進波怎麼前進，弦上的駐波有哪些固定的頻率，以及兩個波源的波重疊時，哪裡互相加強、哪裡互相抵消（干涉）。',
      'Wave speed = frequency × wavelength (v = fλ). See how a traveling wave moves, which frequencies make standing waves on a string, and where two overlapping waves add up or cancel out (interference).'),
    cur: { tw: T('高中 物理 波動', 'Senior high physics · waves'), us: 'NGSS HS-PS4-1' },
    model: waves,
    checks(m, ok) {
      ok(Math.abs(m.v(440, 0.78) - 343.2) < 1e-9, '440 Hz × 0.78 m = 343 m/s (sound)');
      ok(Math.abs(m.harmonic(3, 120, 0.6) - 3 * m.harmonic(1, 120, 0.6)) < 1e-9 && Math.abs(m.harmonic(1, 120, 0.6) - 100) < 1e-9, 'f_n = n v / 2L');
      ok(m.amp(0, 1) === 2 && Math.abs(m.amp(2, 1) - 2) < 1e-12 && m.amp(0.5, 1) < 1e-12 && m.amp(1.5, 1) < 1e-12, 'path difference mλ → maximum, (m+½)λ → zero');
      const lam = 600e-9, L = 1.5, d = 0.2e-3, y = m.fringe(lam, L, d), exact = L * Math.tan(Math.asin(lam / d));
      ok(Math.abs(y - 4.5e-3) < 1e-12 && Math.abs(y - exact) / exact < 0.01, 'double-slit spacing Δy = λL/d');
    },
    mount(k) {
      const m = waves, v = k.canvas(640, 380), { ctx, W, H } = v;
      let mode = 'two', f = 2, lam = 60, n = 2, dsep = 120, t = 0;
      k.seg({ label: T('模式', 'Mode'), value: 'two', options: [{ v: 'travel', label: T('行進波', 'Traveling wave') }, { v: 'stand', label: T('駐波', 'Standing wave') }, { v: 'two', label: T('雙波源干涉', 'Two-source interference') }], onChange: (x) => { mode = x; vis(); } });
      const sF = k.slider({ label: T('頻率 f', 'Frequency f'), min: 0.5, max: 4, step: 0.5, value: f, unit: 'Hz', dp: 1, onInput: (x) => (f = x) });
      const sL = k.slider({ label: T('波長 λ', 'Wavelength λ'), min: 30, max: 120, step: 5, value: lam, unit: T('像素', 'px'), onInput: (x) => (lam = x) });
      const sN = k.slider({ label: T('第幾諧音 n', 'Harmonic n'), min: 1, max: 6, step: 1, value: n, onInput: (x) => (n = x) });
      const sD = k.slider({ label: T('波源距離 d', 'Source separation d'), min: 40, max: 220, step: 10, value: dsep, unit: T('像素', 'px'), onInput: (x) => (dsep = x) });
      const ro = k.readout();
      const vis = () => { sF.el.style.display = mode === 'stand' ? 'none' : ''; sN.el.style.display = mode === 'stand' ? '' : 'none'; sD.el.style.display = mode === 'two' ? '' : 'none'; };
      vis();
      const GW = 160, GH = 95, off = document.createElement('canvas'); off.width = GW; off.height = GH; const oc = off.getContext('2d'), img = oc.createImageData(GW, GH);
      k.loop((dt) => {
        t += dt; const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        if (mode === 'travel') {
          const speed = m.v(f, lam), A = 60, y0 = 190;
          k.line(ctx, 20, y0, 620, y0, c.line, 1, [4, 4]);
          ctx.strokeStyle = c.acc2; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 20; x <= 620; x += 2) { const y = y0 - A * Math.sin(2 * Math.PI * ((x - 20) / lam - f * t)); x === 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
          const mx = 320; k.circle(ctx, mx, y0 - A * Math.sin(2 * Math.PI * ((mx - 20) / lam - f * t)), 8, c.no);
          const cx0 = 20 + ((((f * t) * lam) % lam) + lam) % lam + lam * 2; k.line(ctx, cx0, y0 - A - 20, cx0 + lam, y0 - A - 20, c.ink, 2); k.text(ctx, 'λ', cx0 + lam / 2, y0 - A - 34, { color: c.ink, size: 16, bold: true, align: 'center' });
          k.text(ctx, k.L('紅點只上下振動，不會跟著波前進', 'The red dot only moves up and down — it doesn’t travel with the wave'), 320, 340, { color: c.muted, size: 14, align: 'center' });
          ro.set(k.L(`v = f × λ = ${k.fmt(f, 1)} Hz × ${lam} px = <b>${k.fmt(speed, 0)} px/s</b><br>週期 T = 1/f = <b>${k.fmt(1 / f, 2)} s</b>`, `v = f × λ = ${k.fmt(f, 1)} Hz × ${lam} px = <b>${k.fmt(speed, 0)} px/s</b><br>Period T = 1/f = <b>${k.fmt(1 / f, 2)} s</b>`));
        } else if (mode === 'stand') {
          const L = 520, x0 = 60, y0 = 190, A = 70, vS = 240, fn = m.harmonic(n, vS, L), w = 2 * Math.PI * Math.min(fn, 3) * 0.6;
          for (const sgn of [1, -1]) { ctx.strokeStyle = c.line; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x <= L; x += 3) { const y = y0 - sgn * A * Math.sin((n * Math.PI * x) / L); x ? ctx.lineTo(x0 + x, y) : ctx.moveTo(x0 + x, y); } ctx.stroke(); }
          ctx.strokeStyle = c.acc2; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= L; x += 3) { const y = y0 - A * Math.sin((n * Math.PI * x) / L) * Math.cos(w * t); x ? ctx.lineTo(x0 + x, y) : ctx.moveTo(x0 + x, y); } ctx.stroke();
          for (let i = 0; i <= n; i++) { k.circle(ctx, x0 + (i * L) / n, y0, 6, c.no); }
          for (let i = 0; i < n; i++) k.text(ctx, k.L('腹', 'A'), x0 + ((i + 0.5) * L) / n, y0 + A + 24, { color: c.acc, size: 13, align: 'center' });
          k.rrect(ctx, x0 - 14, y0 - 60, 14, 120, 3, '#78909c'); k.rrect(ctx, x0 + L, y0 - 60, 14, 120, 3, '#78909c');
          k.text(ctx, k.L(`紅點＝節點（${n + 1} 個）`, `red dots = nodes (${n + 1})`), 320, 330, { color: c.muted, size: 14, align: 'center' });
          ro.set(k.L(`第 ${n} 諧音：λ = 2L/n = <b>${k.fmt((2 * 1.2) / n, 2)} m</b>（弦長 L = 1.2 m）<br>f<sub>n</sub> = n·v ÷ 2L = ${n} × 240 ÷ 2.4 = <b>${k.fmt(m.harmonic(n, 240, 1.2), 0)} Hz</b>（波速 240 m/s）`,
            `Harmonic ${n}: λ = 2L/n = <b>${k.fmt((2 * 1.2) / n, 2)} m</b> (string length L = 1.2 m)<br>f<sub>n</sub> = n·v ÷ 2L = ${n} × 240 ÷ 2.4 = <b>${k.fmt(m.harmonic(n, 240, 1.2), 0)} Hz</b> (wave speed 240 m/s)`));
        } else {
          const s1 = { x: 320 - dsep / 2, y: 0 }, s2 = { x: 320 + dsep / 2, y: 0 }, cell = 4, k2 = (2 * Math.PI) / lam, wt = 2 * Math.PI * f * t;
          for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
            const x = i * cell + 2, y = j * cell + 2, r1 = Math.hypot(x - s1.x, y - s1.y), r2 = Math.hypot(x - s2.x, y - s2.y);
            const a = (Math.sin(k2 * r1 - wt) + Math.sin(k2 * r2 - wt)) / 2;
            const idx = (j * GW + i) * 4, vv = Math.round(128 + 120 * a);
            img.data[idx] = vv * 0.35; img.data[idx + 1] = vv * 0.75; img.data[idx + 2] = Math.min(255, vv + 40); img.data[idx + 3] = 255;
          }
          oc.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, GW * cell, GH * cell);
          // nodal lines: path difference (m + ½)λ
          ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
          for (let mm = -6; mm <= 5; mm++) { const dd = (mm + 0.5) * lam; if (Math.abs(dd) >= dsep) continue; ctx.beginPath(); let st = false; for (let y = 2; y <= 380; y += 4) { const a2 = dd / 2, c2 = dsep / 2, b2 = Math.sqrt(c2 * c2 - a2 * a2); const x = 320 + Math.abs(a2) * Math.sqrt(1 + (y * y) / (b2 * b2)) * Math.sign(dd); st ? ctx.lineTo(x, y) : ctx.moveTo(x, y); st = true; } ctx.stroke(); }
          ctx.setLineDash([]);
          k.circle(ctx, s1.x, 6, 7, '#ffd23f', '#000'); k.circle(ctx, s2.x, 6, 7, '#ffd23f', '#000');
          ro.set(k.L(`兩波源相距 d = ${dsep} px，波長 λ = ${lam} px<br>波程差 = mλ → <b>建設性干涉</b>（亮、振幅最大）<br>波程差 = (m + ½)λ → <b>破壞性干涉</b>（虛線，節線，幾乎不動）`,
            `Sources d = ${dsep} px apart, wavelength λ = ${lam} px<br>Path difference mλ → <b>constructive</b> (big waves)<br>Path difference (m + ½)λ → <b>destructive</b> (dashed nodal lines, almost still)`));
        }
      });
    },
    observe: [
      { try: T('在「行進波」中，固定波長，把頻率加倍。', 'In Traveling wave, keep λ fixed and double the frequency.'),
        ask: T('頻率加倍、波長不變，波速…', 'Doubling f with the same λ makes the speed…'),
        options: [T('加倍', 'double'), T('不變', 'stay the same'), T('減半', 'halve')],
        why: T('v = fλ。在這個模擬裡你直接設定 f 和 λ，所以 v 跟著加倍。（真實的介質中波速由介質決定，頻率加倍時波長會變成一半。）', 'v = fλ. Here you set f and λ directly, so v doubles. (In a real medium the speed is fixed by the medium, so doubling f would halve λ instead.)') },
      { try: T('在「駐波」中，把 n 從 1 調到 4。', 'In Standing wave, change n from 1 to 4.'),
        ask: T('第 4 諧音的頻率是基音的…', 'The 4th harmonic’s frequency is … the fundamental’s'),
        options: [T('4 倍', '4 times'), T('2 倍', '2 times'), T('一樣', 'the same as')],
        why: T('兩端固定的弦只能形成 λ = 2L/n 的駐波，所以 f<sub>n</sub> = n·v/2L = n·f<sub>1</sub>；第 4 諧音是基音的 4 倍，有 5 個節點。', 'A string fixed at both ends only allows λ = 2L/n, so f<sub>n</sub> = n·v/2L = n·f<sub>1</sub>. The 4th harmonic is 4 times the fundamental, with 5 nodes.') },
      { try: T('在「雙波源干涉」中，把波長調小。', 'In Two-source interference, make the wavelength smaller.'),
        ask: T('波長變短時，節線（虛線）…', 'With a shorter wavelength, the nodal lines…'),
        options: [T('變多、靠得更近', 'become more numerous and closer together'), T('變少、分得更開', 'become fewer and farther apart'), T('不變', 'don’t change')],
        why: T('節線在波程差 = (m + ½)λ 的地方，λ 愈小，能放進波源間距 d 的半波長愈多，節線就愈多愈密。雙狹縫的亮紋間距 Δy = λL/d 也是同樣的道理。', 'Nodal lines are where the path difference is (m + ½)λ. A smaller λ fits more half-wavelengths into the source spacing d, so there are more lines, packed closer. The double-slit fringe spacing Δy = λL/d works the same way.') },
    ],
  },
  {
    id: 'half-life', grades: [10, 12], subj: 'phys', icon: '☢️',
    name: T('放射性衰變與半衰期', 'Radioactive decay and half-life'),
    intro: T('每個放射性原子核什麼時候衰變完全是隨機的，但一大群原子核有固定的規律：每經過一個半衰期，剩下的數量就減半。看看隨機的點怎麼排出平滑的指數曲線，也試試用碳-14 推算年代。',
      'Exactly when one radioactive nucleus decays is pure chance, but a large group follows a fixed rule: after every half-life, half are left. Watch random dots trace out a smooth exponential curve, and try dating with carbon-14.'),
    cur: { tw: T('高中 物理 原子核與放射性', 'Senior high physics · nuclei and radioactivity'), us: 'NGSS HS-PS1-8' },
    model: decay,
    checks(m, ok) {
      ok(m.left(1000, 5730, 5730) === 500 && m.left(1000, 3 * 8.02, 8.02) === 125, 'one half-life → ½, three → ⅛');
      ok(Math.abs(m.age(0.25, 5730) - 11460) < 1e-9, '¼ carbon-14 left → 11 460 years');
      ok(Math.abs((1 - m.pDecay(1, 10)) ** 10 - 0.5) < 1e-12, 'step probabilities compound to ½ per half-life');
      let s = 7, N = 20000; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; const p = m.pDecay(1, 5);
      for (let i = 0; i < 10; i++) { let n2 = 0; for (let j = 0; j < N; j++) if (rnd() >= p) n2++; N = n2; }
      ok(Math.abs(N - 5000) < 200, `Monte Carlo after 2 half-lives ≈ 5000 (got ${N})`);
    },
    mount(k) {
      const m = decay, v = k.canvas(640, 380), { ctx, W, H } = v;
      let iso = 'c14', N0 = 400, atoms = [], t = 0, run = true, hist = [];
      const reset = () => { atoms = Array.from({ length: N0 }, () => ({ alive: true, flash: 0 })); t = 0; hist = [[0, N0]]; };
      reset();
      k.seg({ label: T('同位素', 'Isotope'), value: 'c14', options: Object.entries(ISOS).map(([kk, s]) => ({ v: kk, label: T(s.zh, s.en) })), onChange: (x) => { iso = x; reset(); } });
      k.slider({ label: T('原子核數目', 'Number of nuclei'), min: 100, max: 900, step: 100, value: N0, onInput: (x) => { N0 = x; reset(); } });
      const b = k.buttons([{ label: T('⏸ 暫停', '⏸ Pause'), primary: true, on: () => (run = !run) }, { label: T('↺ 重來', '↺ Restart'), on: reset }]);
      const ro = k.readout();
      k.loop((dt) => {
        const c = k.colors(), I = ISOS[iso], hl = I.half;
        b.firstChild.textContent = run ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 繼續', '▶ Resume');
        if (run && t < 5 * hl) { const step = (dt / 2.5) * hl, p = m.pDecay(step, hl); for (const a of atoms) if (a.alive && Math.random() < p) { a.alive = false; a.flash = 1; } t += step; hist.push([t, atoms.filter((a) => a.alive).length]); }
        ctx.clearRect(0, 0, W, H);
        const cols = Math.ceil(Math.sqrt(N0 * 1.2)), cs = Math.min(13, 280 / cols);
        atoms.forEach((a, i) => { const x = 20 + (i % cols) * cs, y = 30 + Math.floor(i / cols) * cs; a.flash = Math.max(0, a.flash - dt * 2); k.circle(ctx, x + cs / 2, y + cs / 2, cs * 0.38, a.alive ? '#f59f00' : a.flash > 0 ? '#fff3bf' : (c.dark ? '#2f3b40' : '#d8e0e3')); });
        const alive = atoms.filter((a) => a.alive).length;
        const mp = k.axes(ctx, { x: 360, y: 30, w: 260, h: 280 }, { xmin: 0, xmax: 5, ymin: 0, ymax: N0, c, xdp: 0, ydp: 0, xlabel: k.L('經過幾個半衰期', 'half-lives'), ylabel: k.L('剩下的原子核', 'nuclei left') });
        const th = []; for (let x = 0; x <= 5; x += 0.05) th.push([x, m.left(N0, x, 1)]);
        k.plotLine(ctx, mp, th, c.muted, 2);
        k.plotLine(ctx, mp, hist.map(([tt, n2]) => [tt / hl, n2]), c.no, 3);
        for (let h = 1; h <= 4; h++) { k.line(ctx, mp.X(h), mp.Y(0), mp.X(h), mp.Y(N0 / 2 ** h), c.line, 1, [3, 3]); }
        const unit = k.L(I.unit[0], I.unit[1]), tShow = hl > 1e6 ? `${k.fmt(t / 1e9, 2)} ${k.L('十億年', 'billion years')}` : `${k.fmt(t, hl > 100 ? 0 : 1)} ${unit}`;
        ro.set(k.L(`${I.zh} 半衰期 <b>${hl > 1e6 ? '44.7 億年' : `${hl} ${I.unit[0]}`}</b>　經過 <b>${tShow}</b>（${k.fmt(t / hl, 2)} 個半衰期）<br>剩下 <b>${alive}</b> / ${N0}（${k.fmt((100 * alive) / N0, 1)}%）；理論 N = N₀(½)<sup>t/T</sup> = <b>${k.fmt(m.left(N0, t, hl), 0)}</b>`,
          `${I.en} half-life <b>${hl > 1e6 ? '4.47 billion years' : `${hl} ${I.unit[1]}`}</b>; elapsed <b>${tShow}</b> (${k.fmt(t / hl, 2)} half-lives)<br>Left <b>${alive}</b> / ${N0} (${k.fmt((100 * alive) / N0, 1)}%); theory N = N₀(½)<sup>t/T</sup> = <b>${k.fmt(m.left(N0, t, hl), 0)}</b>`) +
          `<div class="muted">${k.L('灰線是理論曲線，紅線是實際的隨機衰變。', 'Grey line: theory. Red line: the actual random decays.')}</div>`);
      });
    },
    observe: [
      { try: T('看兩個半衰期後剩下多少。', 'See how many are left after two half-lives.'),
        ask: T('經過 2 個半衰期，大約剩下…', 'After two half-lives, about how much is left?'),
        options: [T('四分之一', 'one quarter'), T('一半', 'one half'), T('全部衰變完', 'none at all')],
        why: T('每個半衰期剩下前一刻的一半：½ × ½ = ¼。不是兩個半衰期就全部衰變完！', 'Each half-life leaves half of what was there: ½ × ½ = ¼. Two half-lives do not use everything up!') },
      { try: T('用 100 個原子核重來幾次，再用 900 個。', 'Restart a few times with 100 nuclei, then with 900.'),
        ask: T('原子核數目少的時候，紅線…', 'With fewer nuclei, the red line…'),
        options: [T('起伏比較大，偏離理論曲線較多', 'is bumpier and strays further from theory'), T('和理論曲線完全重合', 'matches the theory exactly'), T('衰變得比較慢', 'decays more slowly')],
        why: T('衰變是隨機的，數目少時偶然的影響比較明顯；數目愈多，統計結果愈接近理論的指數曲線。', 'Decay is random. With few nuclei, chance shows up more; with many, the result hugs the theoretical exponential curve.') },
      { try: T('選碳-14，假設一塊古木只剩下 25% 的碳-14。', 'Choose carbon-14 and imagine an old piece of wood with 25% of its carbon-14 left.'),
        ask: T('這塊木頭大約多老？', 'About how old is the wood?'),
        options: [T('約 11 460 年', 'about 11 460 years'), T('約 5730 年', 'about 5730 years'), T('約 22 920 年', 'about 22 920 years')],
        why: T('25% = ¼ = (½)²，經過了 2 個半衰期：2 × 5730 = 11 460 年。這就是碳-14 定年法。', '25% = ¼ = (½)², which is 2 half-lives: 2 × 5730 = 11 460 years. That is radiocarbon dating.') },
    ],
  },
];

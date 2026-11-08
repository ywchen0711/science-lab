// Simulations for grades 7–9, life & earth science (國中 生物・地球科學). Format: see SPEC.md.
import { T } from '../util.js';

const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const emo = (k, ctx, e, x, y, size) => k.text(ctx, e, x, y, { size, align: 'center', font: EMOJI });
// small seeded random numbers so pictures are the same every time
const prng = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// ---------------- microscope ----------------
const SLIDES = {
  onion: { zh: '洋蔥表皮', en: 'onion skin', plant: true, chloro: false, nucleus: true },
  cheek: { zh: '口腔皮膜細胞', en: 'cheek cells', plant: false, chloro: false, nucleus: true },
  elodea: { zh: '水蘊草葉片', en: 'Elodea leaf', plant: true, chloro: true, nucleus: true },
  blood: { zh: '人類血液', en: 'human blood', plant: false, chloro: false, nucleus: false },
};
const scope = {
  SLIDES, EYE: 10, FIELD: 18,                  // eyepiece 10×, field number 18 mm
  total: (obj) => obj * 10,
  fov: (obj) => 18 / obj,                      // field of view diameter (mm)
  // the image is upside down and reversed: moving the slide by (dx, dy) moves the image by (−dx, −dy)
  imageShift: (dx, dy) => [-dx, -dy],
  // estimate a cell's size from how much of the field of view it covers
  estimate: (obj, fraction) => (18 / obj) * 1000 * fraction,     // µm
};

// ---------------- Punnett squares ----------------
const TRAITS = {
  color: { zh: '豌豆花色', en: 'pea flower color', A: 'P', dom: ['紫花', 'purple'], rec: ['白花', 'white'], cd: '#8e44ad', cr: '#f4f4f4' },
  shape: { zh: '豌豆種子形狀', en: 'pea seed shape', A: 'R', dom: ['圓形', 'round'], rec: ['皺皮', 'wrinkled'], cd: '#d8c25a', cr: '#b8a24a' },
  height: { zh: '豌豆植株高度', en: 'pea plant height', A: 'T', dom: ['高莖', 'tall'], rec: ['矮莖', 'short'], cd: '#2f9e44', cr: '#94d82d' },
};
const genetics = {
  TRAITS,
  gametes: (g) => [g[0], g[1]],
  // genotype counts in the 2×2 square: { AA, Aa, aa } out of 4
  cross(p1, p2) {
    const o = { AA: 0, Aa: 0, aa: 0 };
    for (const a of genetics.gametes(p1)) for (const b of genetics.gametes(p2)) { const n = (a === 'A') + (b === 'A'); o[n === 2 ? 'AA' : n === 1 ? 'Aa' : 'aa']++; }
    return o;
  },
  pDominant: (p1, p2) => { const c = genetics.cross(p1, p2); return (c.AA + c.Aa) / 4; },
};

// ---------------- predator & prey ----------------
const pop = {
  P: { b: 1.0, K: 500, a: 0.01, e: 0.1, d: 0.3 },
  deriv: ([R, F], P) => [P.b * R * (1 - R / P.K) - P.a * R * F, P.e * P.a * R * F - P.d * F],
  step(s, dt, P) {
    const f = (x) => pop.deriv(x, P), add = (x, y, h) => [x[0] + y[0] * h, x[1] + y[1] * h];
    const k1 = f(s), k2 = f(add(s, k1, dt / 2)), k3 = f(add(s, k2, dt / 2)), k4 = f(add(s, k3, dt));
    return [Math.max(0, s[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])), Math.max(0, s[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]))];
  },
  equilibrium: (P) => { const R = P.d / (P.e * P.a); return [R, (P.b * (1 - R / P.K)) / P.a]; },
};

// ---------------- plates ----------------
const BOUNDS = {
  div: { zh: '張裂型（中洋脊）', en: 'Divergent (mid-ocean ridge)' },
  sub: { zh: '聚合型：海洋板塊隱沒', en: 'Convergent: ocean plate subducts' },
  cc: { zh: '聚合型：大陸碰撞', en: 'Convergent: continents collide' },
  tr: { zh: '錯動型（轉形斷層）', en: 'Transform fault' },
};
const plates = {
  BOUNDS,
  // distance moved: cm/yr × years → km
  km: (cmPerYr, years) => (cmPerYr * years) / 1e5,
  // age of sea floor (million years) at distance x km from a ridge spreading at v cm/yr per side
  floorAge: (xKm, v) => Math.abs(xKm) / (v * 10),
};

// ---------------- earthquakes ----------------
const quake = {
  VP: 6, VS: 3.5,                                // km/s, typical crust
  tP: (d) => d / 6, tS: (d) => d / 3.5,
  // distance from the S − P time: d = Δt ÷ (1/vS − 1/vP) ≈ 8.4 km per second
  dist: (dt) => dt / (1 / 3.5 - 1 / 6),
  // find the epicenter from three stations and their distances (least squares on the circle equations)
  locate(st, d) {
    const [a, b, c] = st, A = [[2 * (b.x - a.x), 2 * (b.y - a.y)], [2 * (c.x - a.x), 2 * (c.y - a.y)]];
    const r1 = d[0] ** 2 - d[1] ** 2 - a.x ** 2 + b.x ** 2 - a.y ** 2 + b.y ** 2, r2 = d[0] ** 2 - d[2] ** 2 - a.x ** 2 + c.x ** 2 - a.y ** 2 + c.y ** 2;
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    return { x: (r1 * A[1][1] - A[0][1] * r2) / det, y: (A[0][0] * r2 - A[1][0] * r1) / det };
  },
};

export default [
  {
    id: 'microscope', grades: [7, 7], subj: 'bio', icon: '🔬',
    name: T('顯微鏡下的細胞', 'Cells under the microscope'),
    intro: T('複式顯微鏡的放大倍率 = 目鏡倍率 × 物鏡倍率。選一片玻片、換物鏡、轉動調節輪對焦，拖拉載玻片看看影像往哪裡移動。比較植物細胞和動物細胞有什麼不同。',
      'A compound microscope magnifies by eyepiece power × objective power. Choose a slide, switch objectives, turn the focus knob, and drag the slide to see which way the image moves. Compare plant cells with animal cells.'),
    cur: { tw: T('國中 生物 細胞與顯微鏡', 'Junior high biology · cells and the microscope'), us: 'NGSS MS-LS1-1' },
    model: scope,
    checks(m, ok) {
      ok(m.total(4) === 40 && m.total(10) === 100 && m.total(40) === 400, 'total magnification = 10 × objective');
      ok(Math.abs(m.fov(40) - 0.45) < 1e-12 && m.fov(4) / m.fov(40) === 10, 'higher power → smaller field of view');
      ok(m.imageShift(5, -3)[0] === -5 && m.imageShift(5, -3)[1] === 3, 'image moves opposite to the slide');
      ok(Math.abs(m.estimate(40, 1 / 6) - 75) < 1e-9, 'a cell 1/6 of a 0.45 mm field is 75 µm');
      ok(m.SLIDES.onion.plant && !m.SLIDES.cheek.plant && m.SLIDES.elodea.chloro && !m.SLIDES.onion.chloro && !m.SLIDES.blood.nucleus, 'plant/animal facts: onion has no chloroplasts, red blood cells have no nucleus');
    },
    mount(k) {
      const m = scope, v = k.canvas(640, 380), { ctx, W, H } = v;
      let slide = 'onion', obj = 10, focus = 30, labels = false, cx = 0, cy = 0;
      const best = { 4: 55, 10: 50, 40: 47 };
      k.seg({ label: T('玻片', 'Slide'), value: 'onion', options: Object.entries(SLIDES).map(([kk, s]) => ({ v: kk, label: T(s.zh, s.en) })), onChange: (x) => { slide = x; cache = null; } });
      k.seg({ label: T('物鏡', 'Objective'), value: 10, options: [4, 10, 40].map((o) => ({ v: o, label: `${o}×` })), onChange: (x) => { obj = x; cache = null; } });
      k.slider({ label: T('對焦（細調節輪）', 'Focus (fine knob)'), min: 0, max: 100, step: 1, value: focus, onInput: (x) => { focus = x; } });
      k.toggle({ label: T('標示構造名稱', 'Label the parts'), value: false, onChange: (x) => (labels = x) });
      const ro = k.readout();
      // build cells in slide coordinates (µm)
      const cellsFor = (kind) => {
        const r = prng(kind.length * 99), o = [];
        if (kind === 'onion' || kind === 'elodea') {
          const cw = kind === 'onion' ? 260 : 90, ch = kind === 'onion' ? 70 : 32;
          for (let row = -40; row < 40; row++) { const off = (row % 2) * cw * 0.5; for (let col = -15; col < 15; col++) o.push({ x: col * cw + off, y: row * ch, w: cw * (0.9 + r() * 0.2), h: ch, n: [r() * 0.6 + 0.2, r() * 0.6 + 0.2], seed: r() }); }
        } else if (kind === 'cheek') {
          for (let i = 0; i < 260; i++) o.push({ x: (r() - 0.5) * 3000, y: (r() - 0.5) * 3000, rad: 25 + r() * 15, rot: r() * 6, seed: r() });
        } else {
          for (let i = 0; i < 9000; i++) o.push({ x: (r() - 0.5) * 2400, y: (r() - 0.5) * 2400, rad: 3.75, wbc: r() < 0.002 });
        }
        return o;
      };
      const CELLS = Object.fromEntries(Object.keys(SLIDES).map((s) => [s, cellsFor(s)]));
      let cache = null;
      const R = 150, VX = 170, VY = 190;
      const off = document.createElement('canvas'); off.width = off.height = 2 * R; const oc = off.getContext('2d');
      const render = () => {
        const s = SLIDES[slide], scale = (2 * R) / (m.fov(obj) * 1000);  // px per µm
        oc.setTransform(1, 0, 0, 1, 0, 0); oc.fillStyle = slide === 'blood' ? '#f7e4e4' : slide === 'cheek' ? '#e8eef8' : slide === 'onion' ? '#f6f1e6' : '#eef7e6'; oc.fillRect(0, 0, 2 * R, 2 * R);
        // rotate 180°: what is to the left on the slide appears on the right
        const P = (x, y) => [R - (x - cx) * scale, R - (y - cy) * scale];
        const lim = R / scale + 300;
        for (const c of CELLS[slide]) {
          if (Math.abs(c.x - cx) > lim || Math.abs(c.y - cy) > lim) continue;
          if (slide === 'onion' || slide === 'elodea') {
            const [x, y] = P(c.x, c.y), w = c.w * scale, h = c.h * scale;
            oc.fillStyle = slide === 'onion' ? 'rgba(235,215,190,0.6)' : 'rgba(190,225,170,0.5)'; oc.strokeStyle = slide === 'onion' ? '#8a6a4a' : '#4a7a3a'; oc.lineWidth = Math.max(1, 3 * scale);
            oc.fillRect(x - w, y - h, w, h); oc.strokeRect(x - w, y - h, w, h);
            if (s.chloro) { const rr = prng(Math.floor(c.seed * 1e6)); for (let i = 0; i < 14; i++) { oc.fillStyle = '#3c9a3c'; oc.beginPath(); oc.ellipse(x - w + 4 * scale + rr() * (w - 8 * scale), y - h + 4 * scale + rr() * (h - 8 * scale), 3 * scale, 2 * scale, 0, 0, 7); oc.fill(); } }
            oc.fillStyle = slide === 'onion' ? '#8a5a8a' : '#556b2f'; oc.beginPath(); oc.ellipse(x - w * c.n[0], y - h * c.n[1], (slide === 'onion' ? 12 : 6) * scale, (slide === 'onion' ? 9 : 5) * scale, 0, 0, 7); oc.fill();
          } else if (slide === 'cheek') {
            const [x, y] = P(c.x, c.y), r0 = c.rad * scale;
            oc.fillStyle = 'rgba(190,200,235,0.55)'; oc.strokeStyle = '#6a78b0'; oc.lineWidth = Math.max(0.8, 1.2 * scale);
            oc.beginPath(); for (let i = 0; i <= 12; i++) { const a = c.rot + (i / 12) * 6.283, rr = r0 * (0.85 + 0.15 * Math.sin(i * 2.7 + c.seed * 9)); i ? oc.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : oc.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } oc.closePath(); oc.fill(); oc.stroke();
            oc.fillStyle = '#4a4f9a'; oc.beginPath(); oc.arc(x, y, 5 * scale, 0, 7); oc.fill();
          } else {
            const [x, y] = P(c.x, c.y), r0 = c.rad * scale * (c.wbc ? 1.8 : 1);
            if (c.wbc) { oc.fillStyle = '#ecd9f2'; oc.beginPath(); oc.arc(x, y, r0, 0, 7); oc.fill(); oc.fillStyle = '#7b3fa0'; for (let i = 0; i < 3; i++) { oc.beginPath(); oc.arc(x + Math.cos(i * 2) * r0 * 0.4, y + Math.sin(i * 2) * r0 * 0.4, r0 * 0.35, 0, 7); oc.fill(); } }
            else { oc.fillStyle = '#d9534f'; oc.beginPath(); oc.arc(x, y, r0, 0, 7); oc.fill(); oc.fillStyle = 'rgba(255,200,200,0.7)'; oc.beginPath(); oc.arc(x, y, r0 * 0.45, 0, 7); oc.fill(); }
          }
        }
        cache = { slide, obj, cx, cy };
      };
      let drag = null;
      k.pointer(v.cv, {
        down(p) { if (Math.hypot(p.x - VX, p.y - VY) < R) drag = { x: p.x, y: p.y }; },
        move(p, d) { if (!drag || !d) return; const scale = (2 * R) / (m.fov(obj) * 1000); const [ix] = [p.x - drag.x]; cx -= ix / scale; cy -= (p.y - drag.y) / scale; drag = { x: p.x, y: p.y }; cache = null; },
        up() { drag = null; },
      });
      k.loop(() => {
        const c = k.colors();
        if (!cache || cache.cx !== cx || cache.cy !== cy || cache.slide !== slide || cache.obj !== obj) render();
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(VX, VY, R + 10, 0, 7); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.arc(VX, VY, R, 0, 7); ctx.clip();
        const blur = Math.abs(focus - best[obj]) / 4;
        if (blur < 0.6) ctx.drawImage(off, VX - R, VY - R);
        else { ctx.globalAlpha = 1; ctx.drawImage(off, VX - R, VY - R); const n = 8; ctx.globalAlpha = 0.22; for (let i = 0; i < n; i++) { const a = (i / n) * 6.283; ctx.drawImage(off, VX - R + Math.cos(a) * blur * 1.6, VY - R + Math.sin(a) * blur * 1.6); } ctx.globalAlpha = 1; ctx.fillStyle = `rgba(240,240,240,${Math.min(0.5, blur / 30)})`; ctx.fillRect(VX - R, VY - R, 2 * R, 2 * R); }
        if (labels && blur < 3) {
          const s = SLIDES[slide], lab = (txt, x, y, tx, ty) => { k.line(ctx, x, y, tx, ty, '#111', 1.5); k.circle(ctx, x, y, 3, '#111'); ctx.font = '700 13px system-ui'; const w = ctx.measureText(txt).width + 8; k.rrect(ctx, tx - (tx < VX ? w : 0), ty - 10, w, 20, 5, 'rgba(255,255,255,0.9)'); k.text(ctx, txt, tx - (tx < VX ? w - 4 : -4), ty, { color: '#111', size: 13, bold: true }); };
          if (slide === 'blood') { lab(k.L('紅血球（沒有細胞核）', 'red blood cell (no nucleus)'), VX, VY, VX + 60, VY - 100); }
          else { lab(k.L('細胞核', 'nucleus'), VX + 10, VY + 6, VX + 90, VY + 100); lab(s.plant ? k.L('細胞壁', 'cell wall') : k.L('細胞膜', 'cell membrane'), VX - 40, VY - 30, VX - 70, VY - 110); lab(k.L('細胞質', 'cytoplasm'), VX - 25, VY + 20, VX - 80, VY + 110); if (s.chloro) lab(k.L('葉綠體', 'chloroplast'), VX + 30, VY - 10, VX + 100, VY - 90); }
        }
        ctx.restore();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(VX, VY, R, 0, 7); ctx.stroke();
        // microscope drawing on the right
        const mx = 470;
        ctx.fillStyle = c.dark ? '#cfd8dc' : '#37474f';
        k.rrect(ctx, mx, 40, 26, 70, 6, ctx.fillStyle); k.rrect(ctx, mx - 10, 110, 46, 30, 6, ctx.fillStyle);
        [4, 10, 40].forEach((o, i) => k.rrect(ctx, mx - 6 + i * 14, 140, 10, 18 + i * 10, 3, o === obj ? c.acc : '#78909c'));
        k.rrect(ctx, mx - 40, 205, 110, 10, 3, '#90a4ae'); k.rrect(ctx, mx - 20, 200, 70, 6, 2, 'rgba(180,220,255,0.9)');
        ctx.fillStyle = c.dark ? '#cfd8dc' : '#37474f'; ctx.fillRect(mx + 60, 90, 18, 220); k.rrect(ctx, mx - 40, 310, 140, 22, 6, ctx.fillStyle);
        k.circle(ctx, mx + 69, 250, 16, '#78909c', c.ink); ctx.save(); ctx.translate(mx + 69, 250); ctx.rotate(focus / 10); k.line(ctx, 0, 0, 14, 0, '#fff', 3); ctx.restore();
        k.text(ctx, k.L('目鏡 10×', 'eyepiece 10×'), mx + 34, 34, { color: c.ink, size: 13 });
        k.text(ctx, k.L(`物鏡 ${obj}×`, `objective ${obj}×`), mx + 40, 175, { color: c.acc, size: 14, bold: true });
        k.text(ctx, k.L(`放大 ${m.total(obj)} 倍`, `${m.total(obj)}× total`), 20, 24, { color: c.ink, size: 18, bold: true });
        k.text(ctx, k.L('👆 拖拉影像移動玻片', '👆 Drag to move the slide'), VX, H - 8, { color: c.muted, size: 13, align: 'center' });
        const s = SLIDES[slide];
        ro.set(k.L(`總放大倍率 = 10 × ${obj} = <b>${m.total(obj)} 倍</b>　視野直徑約 <b>${k.fmt(m.fov(obj), 2)} mm</b><br>${blur < 0.6 ? '✔ 對焦清楚' : '影像模糊，轉動對焦輪'}<br>${s.zh}：${s.plant ? '植物細胞（有細胞壁' + (s.chloro ? '、有葉綠體' : '，表皮細胞沒有葉綠體') + '）' : slide === 'blood' ? '紅血球是沒有細胞核的動物細胞' : '動物細胞（沒有細胞壁，形狀不規則）'}`,
          `Total magnification = 10 × ${obj} = <b>${m.total(obj)}×</b>　field of view ≈ <b>${k.fmt(m.fov(obj), 2)} mm</b><br>${blur < 0.6 ? '✔ In focus' : 'Blurry — turn the focus knob'}<br>${s.en}: ${s.plant ? 'plant cells (cell walls' + (s.chloro ? ', chloroplasts' : '; skin cells have no chloroplasts') + ')' : slide === 'blood' ? 'human red blood cells have no nucleus' : 'animal cells (no cell wall, irregular shape)'}`));
      });
    },
    observe: [
      { try: T('用 10× 物鏡對焦後，把影像往右拖（也就是把玻片往右推）。', 'At 10×, focus, then drag to push the slide to the right.'),
        ask: T('玻片往右移，看到的影像往哪裡移？', 'When the slide moves right, the image moves…'),
        options: [T('往左', 'left'), T('往右', 'right'), T('不會動', 'not at all')],
        why: T('複式顯微鏡的影像上下顛倒、左右相反，所以影像移動的方向和玻片相反。想把左上方的東西移到中央，要把玻片往左上方推。', 'A compound microscope flips the image upside down and left–right, so the image moves opposite to the slide. To bring something at the upper left to the center, push the slide toward the upper left.') },
      { try: T('從 10× 換成 40× 物鏡。', 'Switch from the 10× to the 40× objective.'),
        ask: T('換成高倍率以後，視野…', 'At higher power, the field of view…'),
        options: [T('變小、看到的細胞數變少', 'gets smaller — fewer cells fit'), T('變大、看到更多細胞', 'gets bigger — more cells fit'), T('完全不變', 'does not change')],
        why: T('放大倍率愈高，看到的範圍愈小（視野直徑從 1.8 mm 變成 0.45 mm），細胞看起來比較大，但數目變少，通常也比較暗。', 'Higher magnification shows a smaller area (the field shrinks from 1.8 mm to 0.45 mm across), so cells look bigger but fewer fit — and it is usually dimmer.') },
      { try: T('比較「洋蔥表皮」和「口腔皮膜細胞」。', 'Compare onion skin with cheek cells.'),
        ask: T('洋蔥表皮細胞有、口腔細胞沒有的構造是…', 'Which structure do onion cells have that cheek cells do not?'),
        options: [T('細胞壁', 'A cell wall'), T('細胞核', 'A nucleus'), T('細胞膜', 'A cell membrane')],
        why: T('植物細胞外面有堅硬的細胞壁，所以形狀方方正正；動物細胞只有細胞膜，形狀比較不規則。兩者都有細胞核和細胞膜。', 'Plant cells have a stiff cell wall, which makes them boxy. Animal cells only have a membrane and are more irregular. Both have a nucleus and a membrane.') },
      { try: T('看「水蘊草葉片」，再看「洋蔥表皮」。', 'Look at the Elodea leaf, then the onion skin.'),
        ask: T('為什麼洋蔥表皮細胞看不到葉綠體？', 'Why are there no chloroplasts in onion skin?'),
        options: [T('洋蔥鱗葉長在地下照不到光，不行光合作用', 'Onion bulb scales grow underground in the dark and don’t photosynthesize'), T('所有植物細胞都沒有葉綠體', 'No plant cells have chloroplasts'), T('葉綠體太小，顯微鏡看不到', 'Chloroplasts are too small to see')],
        why: T('葉綠體只存在於需要行光合作用的細胞，例如葉片。洋蔥的鱗葉在地下，細胞裡沒有葉綠體——所以不是所有植物細胞都有葉綠體。', 'Chloroplasts are only in cells that photosynthesize, like leaf cells. Onion bulb scales grow underground and have none — so not every plant cell has chloroplasts.') },
    ],
  },
  {
    id: 'punnett', grades: [7, 9], subj: 'bio', icon: '🫛',
    name: T('孟德爾遺傳與棋盤方格', 'Mendel and Punnett squares'),
    intro: T('孟德爾用豌豆發現遺傳的規律：每個性狀由一對基因決定，親代各給子代一個。選擇性狀和雙親的基因型，用棋盤方格預測子代的比例，再「種」100 株看看實際結果。',
      'Mendel used pea plants to discover how traits are inherited: each trait is set by a pair of genes, one from each parent. Choose a trait and the parents’ genotypes, predict the offspring with a Punnett square, then grow 100 plants and compare.'),
    cur: { tw: T('國中 生物 遺傳', 'Junior high biology · heredity'), us: 'NGSS MS-LS3-2' },
    model: genetics,
    checks(m, ok) {
      const c = m.cross('Aa', 'Aa'); ok(c.AA === 1 && c.Aa === 2 && c.aa === 1, 'Aa × Aa → 1 AA : 2 Aa : 1 aa');
      ok(m.pDominant('Aa', 'Aa') === 0.75, 'Aa × Aa → 3/4 show the dominant trait');
      ok(m.cross('AA', 'aa').Aa === 4, 'AA × aa → all Aa');
      ok(m.cross('Aa', 'aa').Aa === 2 && m.cross('Aa', 'aa').aa === 2, 'Aa × aa → 1 : 1');
      ok(['AA', 'Aa', 'aa'].every((x) => ['AA', 'Aa', 'aa'].every((y) => { const r = m.cross(x, y); return r.AA + r.Aa + r.aa === 4; })), 'four boxes every time');
      ok(m.pDominant('aa', 'aa') === 0, 'two recessive parents only have recessive offspring');
    },
    mount(k) {
      const m = genetics, v = k.canvas(640, 400), { ctx, W, H } = v;
      let tr = 'color', p1 = 'Aa', p2 = 'Aa', grown = [];
      const L = () => TRAITS[tr].A, gt = (g) => g.replace(/A/g, L()).replace(/a/g, L().toLowerCase());
      k.seg({ label: T('性狀', 'Trait'), value: 'color', options: Object.entries(TRAITS).map(([kk, t]) => ({ v: kk, label: T(t.zh, t.en) })), onChange: (x) => { tr = x; grown = []; } });
      const opts = ['AA', 'Aa', 'aa'].map((g) => ({ v: g, label: g }));
      const s1 = k.seg({ label: T('父本基因型', 'Parent 1 genotype'), value: 'Aa', options: opts, onChange: (x) => { p1 = x; grown = []; } });
      const s2 = k.seg({ label: T('母本基因型', 'Parent 2 genotype'), value: 'Aa', options: opts, onChange: (x) => { p2 = x; grown = []; } });
      k.buttons([{ label: T('🌱 種 100 株', '🌱 Grow 100 plants'), primary: true, on: () => { grown = Array.from({ length: 100 }, () => p1[Math.random() < 0.5 ? 0 : 1] + p2[Math.random() < 0.5 ? 0 : 1]); } }]);
      const ro = k.readout();
      const isDom = (g) => g.includes('A');
      k.loop(() => {
        const c = k.colors(), t = TRAITS[tr];
        [s1, s2].forEach((s) => s.el.querySelectorAll('button').forEach((b, i) => (b.textContent = gt(['AA', 'Aa', 'aa'][i]))));
        ctx.clearRect(0, 0, W, H);
        const x0 = 110, y0 = 90, cs = 90;
        const g1 = m.gametes(p1), g2 = m.gametes(p2);
        k.text(ctx, k.L('父本', 'Parent 1') + ` ${gt(p1)}`, x0 + cs, 22, { color: c.ink, size: 17, bold: true, align: 'center' });
        k.text(ctx, k.L('母本', 'Parent 2'), 30, y0 + cs - 12, { color: c.ink, size: 15, bold: true, align: 'center' });
        k.text(ctx, gt(p2), 30, y0 + cs + 10, { color: c.ink, size: 17, bold: true, align: 'center' });
        g1.forEach((a, i) => { k.circle(ctx, x0 + cs / 2 + i * cs, y0 - 28, 18, c.soft, c.ink); k.text(ctx, gt(a), x0 + cs / 2 + i * cs, y0 - 28, { color: c.ink, size: 18, bold: true, align: 'center' }); });
        g2.forEach((b, j) => { k.circle(ctx, x0 - 26, y0 + cs / 2 + j * cs, 18, c.soft, c.ink); k.text(ctx, gt(b), x0 - 26, y0 + cs / 2 + j * cs, { color: c.ink, size: 18, bold: true, align: 'center' }); });
        g1.forEach((a, i) => g2.forEach((b, j) => {
          const geno = [a, b].sort().join(''), dom = isDom(geno), x = x0 + i * cs, y = y0 + j * cs;
          k.rrect(ctx, x, y, cs, cs, 4, c.card, c.ink, 2);
          k.circle(ctx, x + cs / 2, y + cs / 2 - 10, 18, dom ? t.cd : t.cr, c.ink, 1.5);
          k.text(ctx, gt(geno), x + cs / 2, y + cs - 16, { color: c.ink, size: 18, bold: true, align: 'center' });
        }));
        const cr = m.cross(p1, p2), pd = m.pDominant(p1, p2);
        // grown plants
        if (grown.length) {
          const nd = grown.filter(isDom).length;
          grown.forEach((g, i) => k.circle(ctx, 360 + (i % 10) * 26, 70 + Math.floor(i / 10) * 26, 10, isDom(g) ? t.cd : t.cr, c.ink, 1));
          k.text(ctx, k.L(`${t.dom[0]} ${nd} 株、${t.rec[0]} ${100 - nd} 株`, `${t.dom[1]} ${nd}, ${t.rec[1]} ${100 - nd}`), 480, 345, { color: c.ink, size: 16, bold: true, align: 'center' });
          k.text(ctx, k.L(`預期 ${Math.round(pd * 100)} : ${Math.round((1 - pd) * 100)}`, `expected ${Math.round(pd * 100)} : ${Math.round((1 - pd) * 100)}`), 480, 370, { color: c.muted, size: 14, align: 'center' });
        } else k.text(ctx, k.L('按「種 100 株」看實際結果 →', 'Press “Grow 100 plants” →'), 480, 200, { color: c.muted, size: 15, align: 'center' });
        const A = L(), a = A.toLowerCase();
        ro.set(k.L(`基因型比例 ${A}${A} : ${A}${a} : ${a}${a} = <b>${cr.AA} : ${cr.Aa} : ${cr.aa}</b><br>表現型：${t.dom[0]}（顯性）<b>${pd * 4}/4</b>，${t.rec[0]}（隱性）<b>${(1 - pd) * 4}/4</b>`,
          `Genotypes ${A}${A} : ${A}${a} : ${a}${a} = <b>${cr.AA} : ${cr.Aa} : ${cr.aa}</b><br>Phenotypes: ${t.dom[1]} (dominant) <b>${pd * 4}/4</b>, ${t.rec[1]} (recessive) <b>${(1 - pd) * 4}/4</b>`) +
          `<div class="muted">${k.L(`大寫 ${A} 是顯性基因，小寫 ${a} 是隱性基因。`, `Capital ${A} is the dominant allele; lowercase ${a} is recessive.`)}</div>`);
      });
    },
    observe: [
      { try: T('雙親都選雜合（例如 Pp × Pp）。', 'Choose two hybrid parents (for example Pp × Pp).'),
        ask: T('子代中出現隱性性狀（白花）的機率是…', 'The chance an offspring shows the recessive trait (white) is…'),
        options: ['1/4', '1/2', '0'],
        why: T('Pp × Pp 的棋盤方格有 PP、Pp、Pp、pp 四格，只有 pp（1 格）是白花，所以機率 1/4，顯性：隱性 = 3 : 1。', 'The Punnett square for Pp × Pp has PP, Pp, Pp and pp. Only pp (one box) is white, so the chance is 1/4 and dominant : recessive = 3 : 1.') },
      { try: T('選 PP × pp（純種紫花 × 白花）。', 'Choose PP × pp (pure purple × white).'),
        ask: T('第一子代（F1）長什麼樣子？', 'What do the offspring (F1) look like?'),
        options: [T('全部都是紫花', 'All purple'), T('一半紫、一半白', 'Half purple, half white'), T('全部都是白花', 'All white')],
        why: T('每個子代都從父本得到 P、從母本得到 p，全部是 Pp，帶有顯性的 P 所以全部開紫花，隱性的白花「藏」起來了。', 'Every offspring gets P from one parent and p from the other — all Pp. With a dominant P they all have purple flowers; the white trait is hidden.') },
      { try: T('選 Pp × Pp，按好幾次「種 100 株」。', 'Choose Pp × Pp and press “Grow 100 plants” several times.'),
        ask: T('實際種出來的白花數目…', 'The number of white plants you actually get…'),
        options: [T('每次不太一樣，但都接近 25 株', 'varies a bit each time but stays near 25'), T('每次都剛好 25 株', 'is exactly 25 every time'), T('每次都是 0', 'is always 0')],
        why: T('棋盤方格給的是機率。每一株是隨機的，就像丟硬幣，所以實際數目會在 25 附近變動；種得愈多，比例愈接近 3 : 1。', 'A Punnett square gives probabilities. Each plant is random, like a coin toss, so the count wobbles around 25; the more plants you grow, the closer the ratio gets to 3 : 1.') },
    ],
  },
  {
    id: 'ecosystem', grades: [7, 7], subj: 'bio', icon: '🦊',
    name: T('族群的消長：兔子和狐狸', 'Population changes: rabbits and foxes'),
    intro: T('草原上兔子愈多，狐狸的食物愈多，狐狸就增加；狐狸多了吃掉很多兔子，兔子減少，狐狸又會因為食物不夠而減少……調整兔子的出生率、狐狸的捕食能力和死亡率，看看兩個族群如何互相影響。',
      'More rabbits means more food for foxes, so foxes increase; then the foxes eat many rabbits, rabbits drop, and the foxes run short of food and decline… Change the rabbits’ birth rate, how good the foxes are at hunting and how fast foxes die, and watch the two populations push and pull.'),
    cur: { tw: T('國中 生物 生態系與族群', 'Junior high biology · ecosystems and populations'), us: 'NGSS MS-LS2-1' },
    model: pop,
    checks(m, ok) {
      const P = m.P; let s = [200, 20], mn = Infinity, mx = 0, neg = false;
      for (let i = 0; i < 20000; i++) { s = m.step(s, 0.01, P); if (s[0] < 0 || s[1] < 0) neg = true; if (i > 2000) { mn = Math.min(mn, s[0]); mx = Math.max(mx, s[0]); } }
      ok(!neg, 'populations never negative');
      const eq = m.equilibrium(P); ok(Math.abs(eq[0] - 300) < 1e-9 && Math.abs(eq[1] - 40) < 1e-9, 'balance point 300 rabbits, 40 foxes');
      ok(Math.abs(s[0] - eq[0]) < 60, 'populations cycle around the balance point');
      let r = [50, 0]; for (let i = 0; i < 4000; i++) r = m.step(r, 0.01, P); ok(Math.abs(r[0] - P.K) < 5, 'no foxes → rabbits grow to the carrying capacity');
      let f = [0, 50]; for (let i = 0; i < 4000; i++) f = m.step(f, 0.01, P); ok(f[1] < 1, 'no rabbits → foxes die out');
      const d = m.deriv([300, 40], P); ok(Math.abs(d[0]) < 1e-9 && Math.abs(d[1]) < 1e-9, 'no change at equilibrium');
    },
    mount(k) {
      const m = pop, v = k.canvas(640, 380), { ctx, W, H } = v;
      const P = { ...m.P };
      let s = [200, 20], t = 0, hist = [[0, 200, 20]], speed = 1;
      k.slider({ label: T('兔子出生率', 'Rabbit birth rate'), min: 0.4, max: 1.6, step: 0.1, value: P.b, dp: 1, onInput: (x) => (P.b = x) });
      k.slider({ label: T('狐狸捕食能力', 'Fox hunting success'), min: 0.004, max: 0.02, step: 0.001, value: P.a, dp: 3, onInput: (x) => (P.a = x) });
      k.slider({ label: T('狐狸死亡率', 'Fox death rate'), min: 0.1, max: 0.6, step: 0.05, value: P.d, dp: 2, onInput: (x) => (P.d = x) });
      k.buttons([{ label: T('🦊 移走所有狐狸', '🦊 Remove all foxes'), on: () => (s = [s[0], 0]) }, { label: T('🦊 放回 10 隻狐狸', '🦊 Bring back 10 foxes'), on: () => (s = [s[0], s[1] + 10]) }, { label: T('↺ 重來', '↺ Restart'), primary: true, on: () => { s = [200, 20]; t = 0; hist = [[0, 200, 20]]; } }]);
      const ro = k.readout();
      k.loop((dt) => {
        const c = k.colors();
        for (let i = 0; i < 10; i++) { s = m.step(s, (dt * 1.2 * speed) / 10, P); t += (dt * 1.2 * speed) / 10; }
        hist.push([t, s[0], s[1]]); if (hist.length > 1500) hist.shift();
        ctx.clearRect(0, 0, W, H);
        const x0 = Math.max(0, t - 60);
        const mp = k.axes(ctx, { x: 60, y: 30, w: 400, h: 300 }, { xmin: x0, xmax: x0 + 60, ymin: 0, ymax: 600, c, xdp: 0, ydp: 0, xlabel: k.L('時間（年）', 'time (years)'), ylabel: k.L('數量', 'number') });
        const vis = hist.filter((h) => h[0] >= x0);
        k.plotLine(ctx, mp, vis.map((h) => [h[0], h[1]]), '#8d6e63', 3);
        k.plotLine(ctx, mp, vis.map((h) => [h[0], h[2] * 5]), '#e8590c', 3);
        k.line(ctx, 60, mp.Y(P.K), 460, mp.Y(P.K), c.muted, 1, [4, 4]); k.text(ctx, k.L('環境負荷量', 'carrying capacity'), 455, mp.Y(P.K) - 10, { color: c.muted, size: 12, align: 'right' });
        // little field with animals
        k.rrect(ctx, 480, 30, 150, 300, 12, c.dark ? '#2c3a2a' : '#dcefcf');
        const nr = Math.min(60, Math.round(s[0] / 10)), nf = Math.min(30, Math.round(s[1] / 2));
        for (let i = 0; i < nr; i++) emo(k, ctx, '🐇', 495 + ((i * 37) % 125), 50 + ((i * 53) % 260), 16);
        for (let i = 0; i < nf; i++) emo(k, ctx, '🦊', 500 + ((i * 59 + 20) % 120), 55 + ((i * 71 + 30) % 255), 18);
        k.text(ctx, k.L('🐇 兔子', '🐇 rabbits'), 70, 350, { color: '#8d6e63', size: 15, bold: true, font: EMOJI + ',system-ui' });
        k.text(ctx, k.L('🦊 狐狸 ×5', '🦊 foxes ×5'), 200, 350, { color: '#e8590c', size: 15, bold: true, font: EMOJI + ',system-ui' });
        const eq = m.equilibrium(P);
        ro.set(k.L(`第 ${k.fmt(t, 0)} 年：兔子 <b>${Math.round(s[0])}</b> 隻，狐狸 <b>${Math.round(s[1])}</b> 隻<br><span class="muted">平衡點：兔子 ${Math.round(eq[0])}、狐狸 ${Math.max(0, Math.round(eq[1]))}。狐狸的高峰總是落後兔子的高峰。</span>`,
          `Year ${k.fmt(t, 0)}: <b>${Math.round(s[0])}</b> rabbits, <b>${Math.round(s[1])}</b> foxes<br><span class="muted">Balance point: ${Math.round(eq[0])} rabbits, ${Math.max(0, Math.round(eq[1]))} foxes. Fox peaks always come after rabbit peaks.</span>`));
      });
    },
    observe: [
      { try: T('按「重來」，觀察兩條曲線的高峰。', 'Press Restart and watch the peaks of the two curves.'),
        ask: T('狐狸數量的高峰和兔子的高峰比…', 'Compared with the rabbit peak, the fox peak comes…'),
        options: [T('比較晚出現', 'later'), T('比較早出現', 'earlier'), T('同時出現', 'at the same time')],
        why: T('兔子多了以後，狐狸要一段時間吃飽、繁殖，數量才增加，所以狐狸的高峰落後兔子；狐狸多了兔子就被吃得減少。', 'After rabbits increase, it takes foxes time to feed and breed, so fox numbers peak later. Then the many foxes eat the rabbits down.') },
      { try: T('按「移走所有狐狸」。', 'Press “Remove all foxes”.'),
        ask: T('沒有狐狸以後，兔子會…', 'Without foxes, the rabbits…'),
        options: [T('增加到環境負荷量就不再增加', 'increase until they reach the carrying capacity, then level off'), T('無限制地一直增加', 'grow without limit forever'), T('馬上全部死掉', 'all die immediately')],
        why: T('沒有天敵，兔子會增加，但食物和空間有限，數量會停在環境能負荷的最大量（這裡是 500 隻）。', 'With no predators the rabbits increase, but food and space are limited, so they level off at the most the environment can support — the carrying capacity (500 here).') },
      { try: T('把「狐狸捕食能力」調高，觀察平衡點。', 'Turn up the foxes’ hunting success and look at the balance point.'),
        ask: T('狐狸捕食能力變強，平衡時的兔子數量…', 'With better hunters, the balance number of rabbits…'),
        options: [T('變少', 'goes down'), T('變多', 'goes up'), T('不變', 'stays the same')],
        why: T('捕食能力強的狐狸只需要比較少的兔子就能維持族群，所以平衡時兔子數量下降（R* = 死亡率 ÷（效率 × 捕食能力））。', 'Better hunters need fewer rabbits to keep their own numbers up, so the balance number of rabbits drops (R* = death rate ÷ (efficiency × hunting success)).') },
    ],
  },
  {
    id: 'plate-tectonics', grades: [9, 9], subj: 'earth', icon: '🌋',
    name: T('板塊運動', 'Plate tectonics'),
    intro: T('地球表面分成許多板塊，每年移動幾公分。板塊交界有三種：張裂（分開）、聚合（相撞）和錯動（擦身而過），各自形成不同的地形，也常發生地震和火山。選一種交界，加快時間看看幾百萬年的變化。',
      'Earth’s surface is broken into plates that move a few centimeters a year. Plate boundaries come in three kinds — divergent (pulling apart), convergent (colliding) and transform (sliding past) — and each builds different landforms, with earthquakes and volcanoes. Pick a boundary and fast-forward millions of years.'),
    cur: { tw: T('國中 地球科學 板塊構造', 'Junior high earth science · plate tectonics'), us: 'NGSS MS-ESS2-3' },
    model: plates,
    checks(m, ok) {
      ok(Math.abs(m.km(5, 1e6) - 50) < 1e-9, '5 cm/yr for 1 million years = 50 km');
      ok(Math.abs(m.km(8, 1e7) - 800) < 1e-9, 'Taiwan-like 8 cm/yr for 10 Myr = 800 km');
      ok(m.floorAge(100, 2) === 5 && m.floorAge(-100, 2) === 5, 'sea floor ages symmetric about the ridge');
      ok(m.floorAge(200, 2) > m.floorAge(100, 2), 'older rock farther from the ridge');
      ok(Object.keys(m.BOUNDS).length === 4, 'four boundary pictures');
    },
    mount(k) {
      const m = plates, v = k.canvas(640, 380), { ctx, W, H } = v;
      let kind = 'sub', vcm = 5, myr = 0, play = true, quakes = [];
      k.seg({ label: T('交界類型', 'Boundary'), value: 'sub', options: Object.entries(BOUNDS).map(([kk, b]) => ({ v: kk, label: T(b.zh, b.en) })), onChange: (x) => { kind = x; myr = 0; quakes = []; } });
      k.slider({ label: T('板塊速度', 'Plate speed'), min: 1, max: 10, step: 1, value: vcm, unit: T('公分/年', 'cm/yr'), onInput: (x) => (vcm = x) });
      const b = k.buttons([{ label: T('⏸ 暫停', '⏸ Pause'), primary: true, on: () => (play = !play) }, { label: T('↺ 重來', '↺ Restart'), on: () => { myr = 0; quakes = []; } }]);
      const ro = k.readout();
      k.loop((dt) => {
        if (play) myr = Math.min(20, myr + dt * 0.8);
        b.firstChild.textContent = play ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 播放', '▶ Play');
        const c = k.colors(), moved = m.km(vcm, myr * 1e6), px = Math.min(200, moved * 0.25), mid = 320, sea = 140;
        ctx.fillStyle = c.dark ? '#1b2a3a' : '#d8eefc'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#e07a2f'; ctx.fillRect(0, 300, W, 80);            // mantle
        k.text(ctx, k.L('地函（緩慢流動）', 'mantle (slowly flowing)'), 20, 360, { color: '#fff', size: 14, bold: true });
        if (Math.random() < dt * (kind === 'div' ? 1 : 3)) quakes.push({ x: kind === 'div' ? mid + (Math.random() - 0.5) * 30 : kind === 'sub' ? mid + 20 + Math.random() * 160 : kind === 'cc' ? mid + (Math.random() - 0.5) * 80 : mid + (Math.random() - 0.5) * 10, y: kind === 'sub' ? 0 : 160 + Math.random() * 40, t: 0 });
        if (kind === 'div') {
          ctx.fillStyle = '#2f6fb3'; ctx.fillRect(0, sea, W, 60);
          for (let side of [-1, 1]) for (let i = 0; i < 12; i++) { const x = mid + side * (i * 24 + (px % 24)); ctx.fillStyle = i % 2 ? '#5c5f66' : '#40434a'; ctx.fillRect(Math.min(x, x + side * 24), 200, 24, 30); }
          ctx.fillStyle = '#ff6a00'; ctx.beginPath(); ctx.moveTo(mid - 14, 300); ctx.quadraticCurveTo(mid, 180, mid + 14, 300); ctx.fill();
          ctx.fillStyle = '#5c5f66'; ctx.beginPath(); ctx.moveTo(mid - 60, 200); ctx.lineTo(mid, 170); ctx.lineTo(mid + 60, 200); ctx.fill();
          k.arrow(ctx, mid - 60, 250, mid - 160, 250, '#fff', 4); k.arrow(ctx, mid + 60, 250, mid + 160, 250, '#fff', 4);
          k.text(ctx, k.L('中洋脊：岩漿湧出形成新的海洋地殼', 'Ridge: magma rises and makes new sea floor'), mid, 100, { color: c.ink, size: 16, bold: true, align: 'center' });
        } else if (kind === 'sub') {
          ctx.fillStyle = '#2f6fb3'; ctx.fillRect(0, sea, mid, 60);
          ctx.fillStyle = '#40434a'; ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(mid, 200); ctx.quadraticCurveTo(mid + 80, 210, mid + 200, 330); ctx.lineTo(mid + 170, 340); ctx.quadraticCurveTo(mid + 60, 240, mid - 10, 230); ctx.lineTo(0, 230); ctx.fill();
          ctx.fillStyle = '#8d7b5a'; ctx.beginPath(); ctx.moveTo(mid - 5, 200); ctx.lineTo(mid + 30, 130); ctx.lineTo(mid + 130, 120 - Math.min(40, px * 0.2)); ctx.lineTo(mid + 160, 70 - Math.min(30, px * 0.15)); ctx.lineTo(mid + 190, 120); ctx.lineTo(W, 130); ctx.lineTo(W, 300); ctx.lineTo(mid + 200, 300); ctx.quadraticCurveTo(mid + 80, 215, mid - 5, 200); ctx.fill();
          ctx.fillStyle = '#ff6a00'; ctx.beginPath(); ctx.moveTo(mid + 150, 280); ctx.lineTo(mid + 165, 75); ctx.lineTo(mid + 172, 280); ctx.fill(); if (myr > 2) for (let i = 0; i < 5; i++) k.circle(ctx, mid + 160 + Math.sin(myr * 9 + i) * 10, 60 - i * 10, 8 - i, 'rgba(120,120,120,0.6)');
          k.arrow(ctx, 100, 215, 220, 215, '#fff', 4); k.arrow(ctx, 560, 200, 470, 200, '#fff', 4);
          k.text(ctx, k.L('海溝', 'trench'), mid, 225, { color: '#fff', size: 14, bold: true, align: 'center' });
          k.text(ctx, k.L('火山', 'volcano'), mid + 166, 40, { color: c.ink, size: 15, bold: true, align: 'center' });
          k.text(ctx, k.L('重的海洋板塊隱沒到大陸板塊下方', 'The heavy ocean plate dives under the continent'), 20, 30, { color: c.ink, size: 16, bold: true });
        } else if (kind === 'cc') {
          const hgt = Math.min(110, px * 0.6);
          ctx.fillStyle = '#8d7b5a'; ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(mid - 80, 160); ctx.lineTo(mid - 30, 160 - hgt); ctx.lineTo(mid, 150 - hgt * 1.1); ctx.lineTo(mid + 30, 160 - hgt * 0.9); ctx.lineTo(mid + 80, 160); ctx.lineTo(W, 160); ctx.lineTo(W, 300); ctx.lineTo(0, 300); ctx.fill();
          ctx.strokeStyle = '#5d4e36'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(mid - 100, 180 + i * 22); ctx.quadraticCurveTo(mid, 150 - hgt * 0.6 + i * 22, mid + 100, 180 + i * 22); ctx.stroke(); }
          if (hgt > 60) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mid - 15, 150 - hgt * 1.1 + 18); ctx.lineTo(mid, 150 - hgt * 1.1); ctx.lineTo(mid + 15, 150 - hgt * 1.1 + 18); ctx.fill(); }
          k.arrow(ctx, 80, 240, 200, 240, '#fff', 4); k.arrow(ctx, 560, 240, 440, 240, '#fff', 4);
          k.text(ctx, k.L('兩個大陸相撞，地層被擠壓隆起成高山（如喜馬拉雅山、中央山脈）', 'Two continents collide; rock is squeezed up into mountains (Himalayas)'), mid, 24, { color: c.ink, size: 14, bold: true, align: 'center' });
        } else {
          // map view of a transform fault
          ctx.fillStyle = '#b9a77e'; ctx.fillRect(0, 60, W, 240);
          const off = px % 120;
          for (let i = -2; i < 8; i++) { const x1 = i * 120 + off; ctx.fillStyle = '#7da35a'; ctx.fillRect(x1, 70, 60, 110); const x2 = i * 120 - off; ctx.fillStyle = '#93b86c'; ctx.fillRect(x2, 185, 60, 105); }
          k.line(ctx, 0, 182, W, 182, '#b71c1c', 4, [10, 6]);
          k.arrow(ctx, 260, 130, 380, 130, '#fff', 5); k.arrow(ctx, 380, 240, 260, 240, '#fff', 5);
          k.text(ctx, k.L('（從上往下看）兩個板塊水平錯動，沒有新生也沒有消失，但常發生地震', '(view from above) Plates slide past each other — no crust made or destroyed, but many earthquakes'), mid, 30, { color: c.ink, size: 14, bold: true, align: 'center' });
        }
        quakes = quakes.filter((q) => { q.t += dt; const y = kind === 'sub' ? 210 + (q.x - mid - 20) * 0.6 : kind === 'tr' ? 182 : q.y; ctx.globalAlpha = Math.max(0, 1 - q.t); k.circle(ctx, q.x, y, 4 + q.t * 14, null, '#ffeb3b', 3); ctx.globalAlpha = 1; return q.t < 1; });
        k.text(ctx, k.L(`經過 ${k.fmt(myr, 1)} 百萬年　移動 ${k.fmt(moved, 0)} 公里`, `${k.fmt(myr, 1)} million years — moved ${k.fmt(moved, 0)} km`), W - 12, H - 52, { color: '#fff', size: 15, bold: true, align: 'right' });
        const info = { div: ['張裂型：板塊分開，岩漿上湧形成新地殼（中洋脊、東非大裂谷）。地震較淺。', 'Divergent: plates pull apart and magma makes new crust (mid-ocean ridges, East African Rift). Shallow earthquakes.'],
          sub: ['聚合型（隱沒帶）：較重的海洋板塊沉入地函，形成海溝和火山，地震的震源從淺到深排列。', 'Convergent (subduction): the denser ocean plate sinks into the mantle, making a trench and volcanoes; quake depths get deeper inland.'],
          cc: ['聚合型（碰撞）：兩個大陸板塊都不易下沉，互相擠壓形成高山。台灣的中央山脈就是菲律賓海板塊和歐亞板塊擠壓形成的。', 'Convergent (collision): neither continent sinks easily, so they crumple into mountains. Taiwan’s Central Range formed where the Philippine Sea Plate pushes into the Eurasian Plate.'],
          tr: ['錯動型：板塊水平滑過，例如美國的聖安德魯斯斷層。', 'Transform: plates slide sideways past each other, like the San Andreas Fault in California.'] }[kind];
        ro.set(`${k.L(info[0], info[1])}<br>${k.L(`${vcm} 公分/年 × ${k.fmt(myr, 1)} 百萬年 = <b>${k.fmt(moved, 0)} 公里</b>`, `${vcm} cm/yr × ${k.fmt(myr, 1)} million years = <b>${k.fmt(moved, 0)} km</b>`)}`);
      });
    },
    observe: [
      { try: T('選「張裂型」。', 'Choose Divergent.'),
        ask: T('中洋脊的岩石年齡，離中洋脊愈遠…', 'Moving away from a mid-ocean ridge, the sea-floor rock gets…'),
        options: [T('愈老', 'older'), T('愈年輕', 'younger'), T('都一樣老', 'the same age everywhere')],
        why: T('新地殼在中洋脊不斷生成，再被往兩側推開，所以離中洋脊愈遠的岩石愈老，而且兩側對稱。', 'New crust forms at the ridge and is pushed away on both sides, so rock gets older the farther it is from the ridge — symmetrically on each side.') },
      { try: T('選「海洋板塊隱沒」。', 'Choose ocean–continent subduction.'),
        ask: T('為什麼是海洋板塊沉到下面？', 'Why does the ocean plate go underneath?'),
        options: [T('海洋地殼的密度比大陸地殼大', 'Ocean crust is denser than continental crust'), T('海洋板塊移動比較快', 'Ocean plates move faster'), T('海水把它壓下去', 'The weight of the sea pushes it down')],
        why: T('海洋地殼主要是玄武岩，密度比大陸地殼的花岡岩大，所以相撞時海洋板塊會隱沒到下方，形成海溝與火山。', 'Ocean crust (basalt) is denser than continental crust (granite), so when they meet the ocean plate sinks beneath, forming a trench and volcanoes.') },
      { try: T('選「大陸碰撞」，速度 8 公分/年，看 10 百萬年。', 'Choose continental collision at 8 cm/yr and watch 10 million years.'),
        ask: T('每年 8 公分，1000 萬年板塊移動多遠？', 'At 8 cm a year, how far does a plate move in 10 million years?'),
        options: [T('800 公里', '800 km'), T('80 公里', '80 km'), T('8 公里', '8 km')],
        why: T('8 公分 × 10,000,000 年 = 80,000,000 公分 = 800 公里。每年移動很少，但累積幾百萬年就非常可觀。', '8 cm × 10,000,000 years = 80,000,000 cm = 800 km. A tiny yearly movement adds up to a huge distance over millions of years.') },
    ],
  },
  {
    id: 'earthquake', grades: [9, 9], subj: 'earth', icon: '📈',
    name: T('地震波與震央定位', 'Seismic waves and finding the epicenter'),
    intro: T('地震發生時會同時發出 P 波（較快）和 S 波（較慢）。測站離震央愈遠，兩種波抵達的時間差（S − P）愈大。讀出三個測站的時間差，換算距離畫圓，三個圓交會的地方就是震央！',
      'An earthquake sends out P waves (faster) and S waves (slower) at the same time. The farther a station is, the bigger the gap between their arrivals (S − P). Read the gap at three stations, turn it into distances, draw circles — where they meet is the epicenter!'),
    cur: { tw: T('國中 地球科學 地震', 'Junior high earth science · earthquakes'), us: 'NGSS MS-ESS2-2' },
    model: quake,
    checks(m, ok) {
      ok(Math.abs(m.tS(84) - m.tP(84) - 10) < 1e-9 && Math.abs(m.dist(10) - 84) < 1e-9, '84 km away → S − P = 10 s (8.4 km per second of gap)');
      ok(m.tP(100) < m.tS(100), 'P waves arrive first');
      const st = [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 60, y: 180 }], e = { x: 90, y: 70 };
      const d = st.map((s) => Math.hypot(s.x - e.x, s.y - e.y)), f = m.locate(st, d);
      ok(Math.hypot(f.x - e.x, f.y - e.y) < 1e-6, 'three circles locate the epicenter');
      const d2 = st.map((s) => m.dist(m.tS(Math.hypot(s.x - e.x, s.y - e.y)) - m.tP(Math.hypot(s.x - e.x, s.y - e.y))));
      ok(d2.every((x, i) => Math.abs(x - d[i]) < 1e-9), 'distance from S − P matches the true distance');
    },
    mount(k) {
      const m = quake, v = k.canvas(640, 420), { ctx, W, H } = v;
      // map: 1 px = 1 km, stations
      const ST = [{ x: 90, y: 70, zh: '甲站', en: 'Station A' }, { x: 330, y: 50, zh: '乙站', en: 'Station B' }, { x: 170, y: 250, zh: '丙站', en: 'Station C' }];
      let epi = { x: 230, y: 150 }, circles = false, guess = null, t = 0, run = true;
      const newQuake = () => { epi = { x: 80 + Math.random() * 260, y: 50 + Math.random() * 200 }; t = 0; run = true; guess = null; circles = false; tg.set(false); };
      k.buttons([{ label: T('🌋 新的地震', '🌋 New earthquake'), primary: true, on: newQuake }, { label: T('⟲ 重播地震波', '⟲ Replay the waves'), on: () => { t = 0; run = true; } }]);
      const tg = k.toggle({ label: T('畫出距離圓', 'Draw the distance circles'), value: false, onChange: (x) => (circles = x) });
      const ro = k.readout();
      k.pointer(v.cv, { down(p) { if (p.x < 420 && p.y < 300) guess = { x: p.x, y: p.y }; } });
      k.loop((dt) => {
        if (run) { t += dt * 12; if (t > 90) run = false; }
        const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = c.dark ? '#25332a' : '#e9f3e1'; ctx.fillRect(0, 0, 420, 300);
        for (let x = 0; x <= 420; x += 50) k.line(ctx, x, 0, x, 300, c.line, 1); for (let y = 0; y <= 300; y += 50) k.line(ctx, 0, y, 420, y, c.line, 1);
        k.line(ctx, 330, 285, 380, 285, c.ink, 3); k.text(ctx, '50 km', 355, 274, { color: c.ink, size: 12, align: 'center' });
        // waves spreading (clipped to the map)
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 420, 300); ctx.clip();
        if (t > 0 && t < 90) { k.circle(ctx, epi.x, epi.y, t * m.VP, null, 'rgba(47,125,225,0.6)', 2); k.circle(ctx, epi.x, epi.y, t * m.VS, null, 'rgba(229,72,77,0.6)', 2); }
        const d = ST.map((s) => Math.hypot(s.x - epi.x, s.y - epi.y));
        if (circles) ST.forEach((s, i) => k.circle(ctx, s.x, s.y, m.dist(m.tS(d[i]) - m.tP(d[i])), null, c.acc, 2));
        ctx.restore();
        ST.forEach((s) => { ctx.fillStyle = c.ink; ctx.beginPath(); ctx.moveTo(s.x, s.y - 9); ctx.lineTo(s.x - 8, s.y + 6); ctx.lineTo(s.x + 8, s.y + 6); ctx.fill(); k.text(ctx, k.L(s.zh, s.en), s.x, s.y + 18, { color: c.ink, size: 13, bold: true, align: 'center' }); });
        if (guess) { k.text(ctx, '✖', guess.x, guess.y, { color: c.no, size: 20, bold: true, align: 'center' }); }
        if (circles || (guess && !run)) { k.text(ctx, '★', epi.x, epi.y, { color: '#f59f00', size: 26, align: 'center' }); }
        // seismograms
        ST.forEach((s, i) => {
          const y0 = 320 + i * 33, tp = m.tP(d[i]), ts = m.tS(d[i]), X = (tt) => 440 + (tt / 90) * 190;
          k.text(ctx, k.L(s.zh, s.en.replace('Station ', '')), 430, y0, { color: c.ink, size: 12, bold: true, align: 'right' });
          k.line(ctx, 440, y0, 630, y0, c.line, 1);
          ctx.strokeStyle = c.ink; ctx.lineWidth = 1.2; ctx.beginPath();
          for (let tt = 0; tt <= Math.min(t, 90); tt += 0.25) { let a = 0; if (tt > tp) a += 5 * Math.exp(-(tt - tp) / 8) * Math.sin(tt * 9); if (tt > ts) a += 11 * Math.exp(-(tt - ts) / 10) * Math.sin(tt * 5); tt ? ctx.lineTo(X(tt), y0 - a) : ctx.moveTo(X(tt), y0 - a); }
          ctx.stroke();
          if (t > ts) { k.line(ctx, X(tp), y0 - 14, X(tp), y0 + 14, '#2f7de1', 2); k.line(ctx, X(ts), y0 - 14, X(ts), y0 + 14, '#e5484d', 2); }
        });
        k.text(ctx, k.L('地震儀紀錄（0–90 秒）  藍＝P 波  紅＝S 波', 'Seismograms (0–90 s)  blue = P   red = S'), 440, 305, { color: c.muted, size: 12 });
        // legend
        k.text(ctx, k.L('P 波 6 km/s', 'P wave 6 km/s'), 440, 30, { color: '#2f7de1', size: 15, bold: true }); k.text(ctx, k.L('S 波 3.5 km/s', 'S wave 3.5 km/s'), 440, 54, { color: '#e5484d', size: 15, bold: true });
        k.text(ctx, k.L('👆 點地圖猜震央', '👆 Tap the map to guess'), 440, 90, { color: c.ink, size: 14 });
        const rows = ST.map((s, i) => { const dt2 = m.tS(d[i]) - m.tP(d[i]); return k.L(`${s.zh}：S − P = <b>${k.fmt(dt2, 1)} 秒</b> → 距離 ${k.fmt(dt2, 1)} × 8.4 ≈ <b>${k.fmt(m.dist(dt2), 0)} km</b>`, `${s.en}: S − P = <b>${k.fmt(dt2, 1)} s</b> → distance ${k.fmt(dt2, 1)} × 8.4 ≈ <b>${k.fmt(m.dist(dt2), 0)} km</b>`); });
        const err = guess ? Math.hypot(guess.x - epi.x, guess.y - epi.y) : null;
        ro.set(rows.join('<br>') + (err != null && !run ? `<br>${k.L(`你的猜測離震央 <b>${k.fmt(err, 0)} km</b>`, `Your guess is <b>${k.fmt(err, 0)} km</b> from the epicenter`)}` : ''));
      });
    },
    observe: [
      { try: T('看地震儀紀錄，比較三個測站。', 'Look at the seismograms and compare the three stations.'),
        ask: T('哪一種波先抵達測站？', 'Which wave reaches a station first?'),
        options: [T('P 波', 'The P wave'), T('S 波', 'The S wave'), T('同時抵達', 'They arrive together')],
        why: T('P 波（縱波）在地殼中約 6 km/s，比 S 波（橫波）約 3.5 km/s 快，所以總是先到。地震時先感覺上下搖，再左右晃。', 'P waves (about 6 km/s) are faster than S waves (about 3.5 km/s), so they always arrive first — you feel a jolt before the stronger shaking.') },
      { try: T('比較離震央最近和最遠的測站的 S − P 時間差。', 'Compare the S − P gap at the nearest and farthest stations.'),
        ask: T('離震央愈遠，S − P 時間差…', 'The farther from the epicenter, the S − P gap is…'),
        options: [T('愈大', 'bigger'), T('愈小', 'smaller'), T('都一樣', 'the same')],
        why: T('兩種波一起出發，跑得愈遠，快的 P 波領先愈多。每差 1 秒大約代表 8.4 公里，所以可以用時間差算距離。', 'Both waves start together; the farther they travel, the more the faster P wave pulls ahead. Each second of gap is about 8.4 km, so the gap tells the distance.') },
      { try: T('打開「畫出距離圓」。', 'Turn on “Draw the distance circles”.'),
        ask: T('為什麼至少需要三個測站？', 'Why do we need at least three stations?'),
        options: [T('一個測站只知道距離，三個圓才交於一點', 'One station only gives a distance; three circles meet at one point'), T('因為地震有三種波', 'Because there are three kinds of waves'), T('一個測站就夠了', 'One station is enough')],
        why: T('一個測站只能知道震央在某個圓上；兩個圓通常交於兩點；第三個圓才能確定是哪一點。', 'One station tells you the epicenter is somewhere on a circle. Two circles usually cross at two points; the third circle picks the right one.') },
    ],
  },
];

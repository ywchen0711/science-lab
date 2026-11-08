// Simulations for grades 3–4 (國小中年級 自然科學). Format: see SPEC.md.
import { T } from '../util.js';

// scattered star positions in [0, 1)
const STAR = (i, j) => { const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };

const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const emo = (k, ctx, e, x, y, size) => k.text(ctx, e, x, y, { size, align: 'center', font: EMOJI });

// ---------------- circuits ----------------
const GAP = [
  { v: 'wire', zh: '銅線', en: 'copper wire', cond: true },
  { v: 'nail', zh: '鐵釘', en: 'iron nail', cond: true },
  { v: 'foil', zh: '鋁箔', en: 'aluminum foil', cond: true },
  { v: 'straw', zh: '塑膠吸管', en: 'plastic straw', cond: false },
  { v: 'wood', zh: '木筷', en: 'wooden chopstick', cond: false },
  { v: 'rubber', zh: '橡皮筋', en: 'rubber band', cond: false },
  { v: 'glass', zh: '玻璃', en: 'glass', cond: false },
];
const circuits = {
  V1: 1.5, R: 5, GAP,
  // config: 'one' | 'series' | 'parallel'; returns current through each bulb (A), power (W) and brightness vs one bulb on one battery
  solve({ config, cells, closed, gap, bulb2 = true }) {
    const V = cells * this.V1, R = this.R, ok = closed && GAP.find((g) => g.v === gap).cond;
    let I = [0, 0];
    if (ok) {
      if (config === 'one') I = [V / R, 0];
      else if (config === 'series') I = bulb2 ? [V / (2 * R), V / (2 * R)] : [0, 0];
      else I = [V / R, bulb2 ? V / R : 0];
    }
    const P = I.map((i) => i * i * R), P0 = (this.V1 / R) ** 2 * R;
    return { V, I, P, total: I[0] + (config === 'parallel' ? I[1] : 0), bright: P.map((p) => p / P0) };
  },
};

// ---------------- lever ----------------
const lever = {
  torque: (m, d) => m * d,
  // tilt angle (degrees, + = right side down) from the torque difference, limited to ±14°
  tilt: (L, R) => Math.max(-14, Math.min(14, (R - L) * 3)),
  balanced: (mL, dL, mR, dR) => mL * dL === mR * dR,
};

// ---------------- moon phases ----------------
const MONTH = 29.53;
const PHASES = [
  ['新月', 'New moon'], ['眉月', 'Waxing crescent'], ['上弦月', 'First quarter'], ['盈凸月', 'Waxing gibbous'],
  ['滿月', 'Full moon'], ['虧凸月', 'Waning gibbous'], ['下弦月', 'Last quarter'], ['殘月', 'Waning crescent'],
];
const moon = {
  MONTH, PHASES,
  angle: (day) => (2 * Math.PI * (((day % MONTH) + MONTH) % MONTH)) / MONTH,      // angle from the Sun direction (0 = new moon)
  lit: (day) => (1 - Math.cos(moon.angle(day))) / 2,                             // fraction of the face we see lit
  waxing: (day) => (((day % MONTH) + MONTH) % MONTH) < MONTH / 2,
  phase(day) { const a = moon.angle(day) / (2 * Math.PI); return Math.round(a * 8) % 8; },
};

// ---------------- soil ----------------
const SOIL = [
  { id: 'gravel', zh: '礫石', en: 'gravel', d: 4, col: '#8d8d8d', r: 7, n: 18 },
  { id: 'sand', zh: '沙', en: 'sand', d: 0.5, col: '#d9b56b', r: 3.2, n: 70 },
  { id: 'silt', zh: '粉砂', en: 'silt', d: 0.03, col: '#a47d52', r: 1.9, n: 110 },
  { id: 'clay', zh: '黏土', en: 'clay', d: 0.002, col: '#7a5038', r: 1.4, n: 120 },
  { id: 'humus', zh: '腐植質', en: 'humus (bits of dead plants)', d: 1, col: '#3b2a1e', r: 3, n: 14, floats: true },
];
const soil = {
  SOIL,
  // bigger grains sink faster (in real water the speed grows like size², so clay can take days; here the range is squeezed
  // onto a log scale so the whole jar settles in under a minute); humus floats
  speed: (g) => (g.floats ? -1 : 22 * Math.pow(1 + Math.log10(g.d / 0.001), 1.7)),
  // how fast water drains through a cup of each soil (mL per second, toy values in the right order)
  DRAIN: { gravel: 30, sand: 12, clay: 1 },
};

// ---------------- life cycles ----------------
const CYCLES = {
  butterfly: { zh: '紋白蝶', en: 'Cabbage white butterfly', complete: true, stages: [
    { zh: '卵', en: 'egg', days: 5, e: '🥚' }, { zh: '幼蟲', en: 'larva (caterpillar)', days: 15, e: '🐛' },
    { zh: '蛹', en: 'pupa', days: 10, e: 'pupa' }, { zh: '成蟲', en: 'adult', days: 20, e: '🦋' }] },
  frog: { zh: '青蛙', en: 'Frog', complete: null, stages: [
    { zh: '卵', en: 'eggs', days: 7, e: 'frogeggs' }, { zh: '蝌蚪', en: 'tadpole', days: 50, e: 'tadpole' },
    { zh: '幼蛙（還有尾巴）', en: 'froglet (still has a tail)', days: 20, e: 'froglet' }, { zh: '成蛙', en: 'adult frog', days: 60, e: '🐸' }] },
  chicken: { zh: '雞', en: 'Chicken', complete: null, stages: [
    { zh: '蛋（孵化中）', en: 'egg (being incubated)', days: 21, e: '🥚' }, { zh: '小雞', en: 'chick', days: 40, e: '🐥' },
    { zh: '成雞', en: 'adult chicken', days: 100, e: '🐔' }] },
  grasshopper: { zh: '蝗蟲', en: 'Grasshopper', complete: false, stages: [
    { zh: '卵', en: 'egg', days: 30, e: '🥚' }, { zh: '若蟲', en: 'nymph', days: 40, e: 'nymph' }, { zh: '成蟲', en: 'adult', days: 40, e: '🦗' }] },
};
const life = {
  CYCLES,
  total: (c) => c.stages.reduce((s, x) => s + x.days, 0),
  stageAt(c, day) { let d = ((day % life.total(c)) + life.total(c)) % life.total(c); for (let i = 0; i < c.stages.length; i++) { if (d < c.stages[i].days) return i; d -= c.stages[i].days; } return c.stages.length - 1; },
};

export default [
  {
    id: 'circuits', grades: [3, 4], subj: 'phys', icon: '💡',
    name: T('簡單電路', 'Simple circuits'),
    intro: T('用電池、電線、燈泡和開關做成一個「通路」，燈泡才會亮。試試一個燈泡、兩個燈泡「串聯」或「並聯」，打開或關上開關，再把不同的東西接進缺口，看看哪些是導體、哪些是絕緣體。',
      'A bulb lights only when the battery, wires and bulb make a complete loop — a closed circuit. Try one bulb, two bulbs in series or in parallel, open and close the switch, and put different things in the gap to find conductors and insulators.'),
    cur: { tw: T('國小中年級 電路與導體', 'Middle elementary · circuits and conductors'), us: 'NGSS 4-PS3-2' },
    model: circuits,
    checks(m, ok) {
      const base = { cells: 1, closed: true, gap: 'wire' };
      const one = m.solve({ ...base, config: 'one' }), ser = m.solve({ ...base, config: 'series' }), par = m.solve({ ...base, config: 'parallel' });
      ok(Math.abs(one.bright[0] - 1) < 1e-9, 'one bulb on one cell is the reference brightness');
      ok(ser.bright[0] < one.bright[0] && Math.abs(ser.bright[0] - 0.25) < 1e-9, 'series bulbs are dimmer (¼ the power)');
      ok(Math.abs(par.bright[0] - 1) < 1e-9 && Math.abs(par.bright[1] - 1) < 1e-9, 'parallel bulbs are each as bright as one');
      ok(Math.abs(par.total - 2 * one.total) < 1e-9, 'parallel draws twice the current');
      ok(m.solve({ ...base, config: 'series', closed: false }).total === 0, 'open switch → no current');
      ok(m.solve({ ...base, config: 'one', gap: 'straw' }).total === 0 && m.solve({ ...base, config: 'one', gap: 'nail' }).total > 0, 'insulators stop current, iron conducts');
      ok(m.solve({ ...base, config: 'series', bulb2: false }).total === 0 && m.solve({ ...base, config: 'parallel', bulb2: false }).I[0] > 0, 'removing a bulb: series all off, parallel the other stays on');
      ok(m.solve({ ...base, config: 'one', cells: 2 }).bright[0] > one.bright[0], 'two cells in series make the bulb brighter');
      const s = m.solve({ ...base, config: 'series', cells: 2 }); ok(Math.abs(s.I[0] * m.R * 2 - s.V) < 1e-9, 'Ohm: V = I × total R');
    },
    mount(k) {
      const m = circuits, v = k.canvas(640, 400), { ctx, W, H } = v;
      let config = 'one', cells = 1, closed = true, gap = 'wire', bulb2 = true, phase = 0;
      k.seg({ label: T('燈泡怎麼接', 'Bulbs'), value: 'one', options: [{ v: 'one', label: T('一個', 'One') }, { v: 'series', label: T('兩個串聯', 'Two in series') }, { v: 'parallel', label: T('兩個並聯', 'Two in parallel') }], onChange: (x) => (config = x) });
      k.seg({ label: T('電池', 'Batteries'), value: 1, options: [{ v: 1, label: T('1 個（1.5 V）', '1 (1.5 V)') }, { v: 2, label: T('2 個串聯（3 V）', '2 in series (3 V)') }], onChange: (x) => (cells = x) });
      k.toggle({ label: T('開關接通', 'Switch closed (on)'), value: true, onChange: (x) => (closed = x) });
      k.toggle({ label: T('第二個燈泡裝上', 'Second bulb screwed in'), value: true, onChange: (x) => (bulb2 = x) });
      k.seg({ label: T('缺口放什麼？', 'What’s in the gap?'), value: 'wire', options: GAP.map((g) => ({ v: g.v, label: T(g.zh, g.en) })), onChange: (x) => (gap = x) });
      const ro = k.readout();
      const L = 70, R = 570, TOP = 80, BOT = 330, MID = 175, J1 = 200, J2 = 470;
      const poly = (pts, color, w = 4) => { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
      const along = (pts, s) => { let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; } s = ((s % tot) + tot) % tot; for (let i = 0; i < seg.length; i++) { if (s <= seg[i]) { const f = s / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } s -= seg[i]; } return pts[0]; };
      const plen = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
      const bulb = (x, y, b, present = true) => {
        const c = k.colors();
        if (!present) { k.rrect(ctx, x - 12, y - 4, 24, 16, 3, '#9a9a9a', c.ink); k.text(ctx, k.L('（拿掉了）', '(removed)'), x, y - 22, { color: c.muted, size: 14, align: 'center' }); return; }
        if (b > 0) { const g = ctx.createRadialGradient(x, y - 18, 4, x, y - 18, 30 + 40 * Math.sqrt(b)); g.addColorStop(0, `rgba(255,230,90,${Math.min(0.95, 0.35 + b * 0.5)})`); g.addColorStop(1, 'rgba(255,230,90,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 18, 30 + 40 * Math.sqrt(b), 0, Math.PI * 2); ctx.fill(); }
        k.circle(ctx, x, y - 18, 20, b > 0 ? `rgba(255,${235 - 20 * Math.min(1, b)},${120 - 60 * Math.min(1, b)},0.95)` : (c.dark ? '#3a4448' : '#eef3f5'), c.ink, 2);
        ctx.strokeStyle = b > 0 ? '#ff8c00' : c.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 7, y - 4); ctx.lineTo(x - 5, y - 22); ctx.lineTo(x - 2, y - 16); ctx.lineTo(x + 2, y - 22); ctx.lineTo(x + 5, y - 16); ctx.lineTo(x + 7, y - 4); ctx.stroke();
        k.rrect(ctx, x - 12, y - 2, 24, 14, 3, '#9a9a9a', c.ink, 1.5);
      };
      k.loop((dt) => {
        const c = k.colors(), s = m.solve({ config, cells, closed, gap, bulb2 }), g = GAP.find((x) => x.v === gap);
        ctx.clearRect(0, 0, W, H);
        const wire = c.ink;
        // main loop (conventional current: from + at the top of the battery, clockwise)
        const main = [[L, 200], [L, TOP], [R, TOP], [R, 190], [R, 250], [R, BOT], [330, BOT], [L, BOT], [L, 240]];
        poly([[L, 200], [L, TOP], [R, TOP], [R, 185]], wire); poly([[R, 255], [R, BOT], [360, BOT]], wire); poly([[300, BOT], [L, BOT], [L, 240]], wire);
        if (config === 'parallel') poly([[J1, TOP], [J1, MID], [J2, MID], [J2, TOP]], wire);
        // battery stack
        for (let i = 0; i < cells; i++) {
          const y0 = 200 + i * 20 - (cells - 1) * 10;
          k.line(ctx, L - 22, y0 - 6, L + 22, y0 - 6, wire, 4); k.line(ctx, L - 12, y0 + 6, L + 12, y0 + 6, wire, 7);
        }
        k.rrect(ctx, L - 46, 196 - cells * 12, 92, 30 + cells * 20, 8, null, c.line, 1);
        k.text(ctx, '+', L + 30, 180 - (cells - 1) * 10, { color: c.no, size: 20, bold: true }); k.text(ctx, '−', L + 30, 232 + (cells - 1) * 10, { color: c.acc2, size: 22, bold: true });
        k.text(ctx, `${k.fmt(s.V, 1)} V`, L - 40, 265 + (cells - 1) * 10, { color: c.ink, size: 15, bold: true });
        // switch at the bottom
        k.circle(ctx, 300, BOT, 5, wire); k.circle(ctx, 360, BOT, 5, wire);
        if (closed) k.line(ctx, 300, BOT, 360, BOT, wire, 5); else k.line(ctx, 300, BOT, 352, BOT - 30, wire, 5);
        k.text(ctx, k.L(closed ? '開關：接通' : '開關：打開', closed ? 'switch: closed' : 'switch: open'), 330, BOT + 26, { color: c.muted, size: 15, align: 'center' });
        // the test gap on the right
        k.circle(ctx, R, 185, 5, wire); k.circle(ctx, R, 255, 5, wire);
        const gc = { wire: '#c87533', nail: '#7d7f86', foil: '#c9ccd2', straw: '#ff6fa8', wood: '#c8a06a', rubber: '#e2b33c', glass: 'rgba(160,210,230,0.8)' }[gap];
        k.rrect(ctx, R - 7, 182, 14, 76, 5, gc, c.ink, 1);
        k.text(ctx, k.L(g.zh, g.en), R - 14, 220, { color: c.ink, size: 15, align: 'right', bold: true });
        k.text(ctx, g.cond ? k.L('導體', 'conductor') : k.L('絕緣體', 'insulator'), R - 14, 240, { color: g.cond ? c.ok : c.no, size: 14, align: 'right' });
        // bulbs
        if (config === 'one') bulb(335, TOP, s.bright[0]);
        else if (config === 'series') { bulb(265, TOP, s.bright[0]); bulb(405, TOP, s.bright[1], bulb2); }
        else { bulb(335, TOP, s.bright[0]); bulb(335, MID, s.bright[1], bulb2); }
        // moving current dots
        if (s.total > 0) {
          phase += dt * 160 * s.total;
          const dots = (pts, n, ph) => { const len = plen(pts); for (let i = 0; i < n; i++) { const [x, y] = along(pts, ph + (i * len) / n); k.circle(ctx, x, y, 4, '#ffb300'); } };
          if (config === 'parallel') {
            const outer = [[L, 200], [L, TOP], [J1, TOP]], back = [[J2, TOP], [R, TOP], [R, BOT], [L, BOT], [L, 240]];
            dots(outer, 4, phase * 2); dots(back, 18, phase * 2);
            dots([[J1, TOP], [J2, TOP]], 6, phase); if (s.I[1] > 0) dots([[J1, TOP], [J1, MID], [J2, MID], [J2, TOP]], 8, phase);
          } else dots(main, 30, phase);
        }
        const A = (x) => `${k.fmt(x, 2)} A`;
        ro.set(s.total > 0
          ? k.L(`✅ <b>通路</b>：電流 ${A(s.total)}<br>燈泡亮度：${s.bright.slice(0, config === 'one' ? 1 : 2).map((b) => `<b>${b > 0 ? Math.round(b * 100) + '%' : '不亮'}</b>`).join('、')}<span class="muted">（和「一個燈泡、一個電池」比）</span>`,
            `✅ <b>Closed circuit</b>: current ${A(s.total)}<br>Bulb brightness: ${s.bright.slice(0, config === 'one' ? 1 : 2).map((b) => `<b>${b > 0 ? Math.round(b * 100) + '%' : 'off'}</b>`).join(', ')}<span class="muted"> (compared with one bulb on one battery)</span>`)
          : k.L(`❌ <b>斷路</b>：電流沒辦法繞一圈，${!closed ? '開關打開了' : !g.cond ? `${g.zh}是絕緣體` : '燈泡拿掉了'}。`, `❌ <b>Open circuit</b>: the current can’t go all the way around — ${!closed ? 'the switch is open' : !g.cond ? `${g.en} is an insulator` : 'a bulb was removed'}.`));
      });
    },
    observe: [
      { try: T('選「兩個串聯」，和「一個」比較燈泡的亮度。', 'Choose “Two in series” and compare the brightness with “One”.'),
        ask: T('兩個燈泡串聯時，每個燈泡…', 'With two bulbs in series, each bulb is…'),
        options: [T('比一個燈泡時暗', 'dimmer than a single bulb'), T('比一個燈泡時亮', 'brighter than a single bulb'), T('一樣亮', 'just as bright')],
        why: T('串聯時電流要依序通過兩個燈泡，阻礙變大、電流變小，所以每個燈泡都比較暗。', 'In series the current has to pass through both bulbs one after the other. That makes it harder for the current to flow, so less current flows and each bulb is dimmer.') },
      { try: T('選「兩個並聯」，再關掉「第二個燈泡裝上」。', 'Choose “Two in parallel”, then turn off “Second bulb screwed in”.'),
        ask: T('並聯時拿掉一個燈泡，另一個…', 'In parallel, when one bulb is removed, the other one…'),
        options: [T('還是亮著', 'stays lit'), T('也熄滅了', 'goes out too'), T('變得更亮', 'gets much brighter')],
        why: T('並聯的每個燈泡都有自己的路可以走。拿掉一個，另一條路還是通的，所以還會亮——家裡的電燈就是並聯的。', 'In parallel each bulb has its own path. Removing one leaves the other path complete, so it stays lit — that is how the lights in a house are wired.') },
      { try: T('在「兩個串聯」時，關掉「第二個燈泡裝上」。', 'With “Two in series”, turn off “Second bulb screwed in”.'),
        ask: T('串聯時拿掉一個燈泡，另一個…', 'In series, when one bulb is removed, the other one…'),
        options: [T('也熄滅了', 'goes out too'), T('還是亮著', 'stays lit'), T('變得更亮', 'gets brighter')],
        why: T('串聯只有一條路，拿掉一個燈泡，電路就斷了，另一個燈泡也不亮。', 'A series circuit has only one path. Removing a bulb breaks the loop, so the other bulb goes out.') },
      { try: T('把缺口換成鐵釘、鋁箔、塑膠吸管、木筷、橡皮筋和玻璃。', 'Put the iron nail, aluminum foil, plastic straw, chopstick, rubber band and glass in the gap.'),
        ask: T('哪一組東西可以讓燈泡亮？', 'Which things make the bulb light?'),
        options: [T('鐵釘和鋁箔（金屬）', 'The nail and the foil (metals)'), T('塑膠吸管和橡皮筋', 'The straw and the rubber band'), T('木筷和玻璃', 'The chopstick and the glass')],
        why: T('金屬是導體，電流容易通過；塑膠、木頭、橡膠、玻璃是絕緣體，電流幾乎過不去。電線外面包塑膠就是為了安全。', 'Metals are conductors: current passes through them easily. Plastic, wood, rubber and glass are insulators that block the current. That is why wires are covered in plastic — for safety.') },
    ],
  },
  {
    id: 'lever', grades: [3, 4], subj: 'phys', icon: '⚖️',
    name: T('槓桿與平衡', 'Levers and balance'),
    intro: T('翹翹板（槓桿）兩邊要怎麼放重物才會平衡？調整左右兩邊重物的重量和離支點的距離，觀察「重量 × 距離」。',
      'How do you make a seesaw (a lever) balance? Change the weight on each side and how far it is from the pivot, and watch “weight × distance”.'),
    cur: { tw: T('國小中年級 槓桿與平衡', 'Middle elementary · levers and balance'), us: 'NGSS 3-PS2-1' },
    model: lever,
    checks(m, ok) {
      ok(m.balanced(2, 3, 3, 2) && m.balanced(1, 4, 2, 2) && m.balanced(4, 1, 1, 4), 'weight × distance equal → balanced');
      ok(!m.balanced(2, 3, 2, 2) && m.tilt(m.torque(2, 3), m.torque(2, 2)) < 0, 'bigger left turning effect → left side goes down');
      ok(m.tilt(0, 100) === 14 && m.tilt(100, 0) === -14, 'tilt is limited');
      ok(m.tilt(6, 6) === 0, 'equal torque → level');
    },
    mount(k) {
      const m = lever, v = k.canvas(640, 360), { ctx, W, H } = v;
      let mL = 2, dL = 3, mR = 3, dR = 1, ang = 0;
      k.slider({ label: T('左邊重物', 'Left weight'), min: 1, max: 5, step: 1, value: mL, unit: T('個砝碼', 'weights'), onInput: (x) => (mL = x) });
      k.slider({ label: T('左邊距離', 'Left distance'), min: 1, max: 5, step: 1, value: dL, unit: T('格', 'spaces'), onInput: (x) => (dL = x) });
      k.slider({ label: T('右邊重物', 'Right weight'), min: 1, max: 5, step: 1, value: mR, unit: T('個砝碼', 'weights'), onInput: (x) => (mR = x) });
      k.slider({ label: T('右邊距離', 'Right distance'), min: 1, max: 5, step: 1, value: dR, unit: T('格', 'spaces'), onInput: (x) => (dR = x) });
      const ro = k.readout();
      const cx = 320, cy = 200, step = 52;
      k.loop((dt) => {
        const c = k.colors(), tL = m.torque(mL, dL), tR = m.torque(mR, dR), target = (m.tilt(tL, tR) * Math.PI) / 180;
        ang += (target - ang) * Math.min(1, dt * 4);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = c.dark ? '#33402f' : '#e3efd9'; ctx.fillRect(0, 320, W, 40);
        // fulcrum
        ctx.fillStyle = '#7a6a58'; ctx.beginPath(); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx - 40, 320); ctx.lineTo(cx + 40, 320); ctx.fill();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
        k.rrect(ctx, -290, -8, 580, 16, 6, '#c9935a', c.ink, 2);
        for (let i = -5; i <= 5; i++) { if (!i) continue; k.circle(ctx, i * step, 0, 4, c.ink); k.text(ctx, String(Math.abs(i)), i * step, 22, { color: c.ink, size: 15, align: 'center', bold: true }); }
        const stack = (x, n, col) => { for (let j = 0; j < n; j++) { ctx.save(); ctx.translate(x, 0); ctx.rotate(-ang); k.line(ctx, 0, 0, 0, 30, c.ink, 2); k.rrect(ctx, -15, 30 + j * 24, 30, 22, 4, col, c.ink, 1.5); ctx.restore(); } };
        stack(-dL * step, mL, '#3b7be0'); stack(dR * step, mR, '#e5484d');
        ctx.restore();
        const bal = tL === tR;
        k.text(ctx, bal ? k.L('⚖️ 平衡了！', '⚖️ Balanced!') : tL > tR ? k.L('⬅️ 左邊比較重，往下沉', '⬅️ Left side goes down') : k.L('右邊比較重，往下沉 ➡️', 'Right side goes down ➡️'), W / 2, 40, { color: bal ? c.ok : c.ink, size: 24, bold: true, align: 'center' });
        k.text(ctx, `${mL} × ${dL} = ${tL}`, 120, 80, { color: '#3b7be0', size: 22, bold: true, align: 'center' });
        k.text(ctx, `${mR} × ${dR} = ${tR}`, W - 120, 80, { color: '#e5484d', size: 22, bold: true, align: 'center' });
        k.text(ctx, tL === tR ? '=' : tL > tR ? '>' : '<', W / 2, 80, { color: c.ink, size: 26, bold: true, align: 'center' });
        ro.set(k.L(`左邊：${mL} 個 × ${dL} 格 = <b>${tL}</b><br>右邊：${mR} 個 × ${dR} 格 = <b>${tR}</b><br>${bal ? '兩邊相等，所以平衡。' : '兩邊不相等，乘積大的那邊會往下。'}`,
          `Left: ${mL} weights × ${dL} spaces = <b>${tL}</b><br>Right: ${mR} weights × ${dR} spaces = <b>${tR}</b><br>${bal ? 'Equal, so it balances.' : 'Not equal — the side with the bigger product goes down.'}`));
      });
    },
    observe: [
      { try: T('左邊放 2 個砝碼在第 3 格，右邊放 3 個砝碼，移動右邊的距離。', 'Put 2 weights at space 3 on the left and 3 weights on the right. Move the right distance.'),
        ask: T('右邊放在第幾格會平衡？', 'At which space on the right does it balance?'),
        options: [T('第 2 格', 'Space 2'), T('第 3 格', 'Space 3'), T('第 1 格', 'Space 1')],
        why: T('左邊 2 × 3 = 6，右邊 3 × 2 = 6，兩邊相等就平衡。', 'Left: 2 × 3 = 6. Right: 3 × 2 = 6. Equal products balance.') },
      { try: T('兩邊放一樣多的砝碼，把一邊移得離支點更遠。', 'Put the same number of weights on each side, then move one side farther from the pivot.'),
        ask: T('重量一樣時，離支點比較遠的那邊…', 'With equal weights, the side farther from the pivot…'),
        options: [T('會往下沉', 'goes down'), T('會往上翹', 'goes up'), T('還是平衡', 'still balances')],
        why: T('離支點愈遠，同樣的重量轉動的效果愈大，所以那邊會往下沉。這就是為什麼用長的板手比較容易轉動螺絲。', 'The farther from the pivot, the bigger the turning effect of the same weight, so that side goes down. That is why a long wrench turns a bolt more easily.') },
      { try: T('左邊放 4 個砝碼在第 1 格，想辦法用 1 個砝碼讓它平衡。', 'Put 4 weights at space 1 on the left. Balance it using only 1 weight on the right.'),
        ask: T('1 個砝碼要放在第幾格？', 'Where must the single weight go?'),
        options: [T('第 4 格', 'Space 4'), T('第 1 格', 'Space 1'), T('沒辦法平衡', 'It can’t be balanced')],
        why: T('4 × 1 = 4，所以 1 個砝碼要放在 1 × 4 = 4 的位置：第 4 格。用比較輕的力，放在比較遠的地方，就能抬起重物——這就是槓桿省力的原理。', '4 × 1 = 4, so the single weight must be at space 4 (1 × 4 = 4). A small weight far away can balance a heavy one close in — that is how a lever helps you lift.') },
    ],
  },
  {
    id: 'moon-phases', grades: [3, 4], subj: 'earth', icon: '🌓',
    name: T('月亮的盈虧', 'Phases of the Moon'),
    intro: T('月亮自己不會發光，是反射太陽光。月亮繞地球一圈大約 29.5 天，從地球看到它被照亮的部分會慢慢改變，這就是月相。拖動日子或按播放，看看上面（從太空俯視）和右邊（從台灣抬頭看）的樣子。',
      'The Moon doesn’t make its own light — it reflects sunlight. It goes around Earth about every 29.5 days, and the part of the lit side we can see slowly changes: these are the phases. Drag the day or press play, and compare the view from space with the view from Taiwan.'),
    cur: { tw: T('國小中年級 月亮', 'Middle elementary · the Moon'), us: 'NGSS 1-ESS1-1' },
    model: moon,
    checks(m, ok) {
      ok(m.lit(0) < 1e-9 && Math.abs(m.lit(m.MONTH / 2) - 1) < 1e-9, 'new moon dark, full moon fully lit');
      ok(Math.abs(m.lit(m.MONTH / 4) - 0.5) < 1e-9 && Math.abs(m.lit((3 * m.MONTH) / 4) - 0.5) < 1e-9, 'quarters are half lit');
      ok(m.phase(0) === 0 && m.phase(m.MONTH / 4) === 2 && m.phase(m.MONTH / 2) === 4 && m.phase((3 * m.MONTH) / 4) === 6, 'phase names at the right days');
      ok(m.waxing(5) && !m.waxing(20), 'waxing first half, waning second half');
      ok(Math.abs(m.lit(3) - m.lit(m.MONTH - 3)) < 1e-9, 'symmetric waxing/waning');
    },
    mount(k) {
      const m = moon, v = k.canvas(640, 360), { ctx, W, H } = v;
      let day = 3, play = false;
      const sl = k.slider({ label: T('農曆約第幾天', 'Day of the cycle'), min: 0, max: 29.5, step: 0.5, value: day, unit: T('天', 'days'), dp: 1, onInput: (x) => (day = x) });
      const b = k.buttons([{ label: T('▶ 播放', '▶ Play'), primary: true, on: () => (play = !play) }]);
      const ro = k.readout();
      const disc = (x, y, r, d) => {
        const a = m.angle(d), c = k.colors(), dark = c.dark ? '#2b3236' : '#4a5258';
        k.circle(ctx, x, y, r, dark);
        const f = Math.cos(a); // +1 new, −1 full
        const waxing = m.waxing(d);
        ctx.save(); ctx.fillStyle = '#f5f1d6';
        ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !waxing); // lit half: right when waxing (seen from the Northern Hemisphere)
        ctx.ellipse(x, y, r * Math.abs(f), r, 0, Math.PI / 2, -Math.PI / 2, (f > 0) === waxing);
        ctx.fill(); ctx.restore();
        k.circle(ctx, x, y, r, null, c.line, 1.5);
      };
      k.loop((dt) => {
        if (play) { day = (day + dt * 2.5) % m.MONTH; sl.set(+day.toFixed(1)); }
        b.firstChild.textContent = play ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 播放', '▶ Play');
        const c = k.colors();
        ctx.fillStyle = '#0d1630'; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 60; i++) k.circle(ctx, STAR(i, 1) * W, STAR(i, 2) * H, i % 7 ? 0.8 : 1.4, '#ffffff');
        // sunlight from the right
        for (let i = 0; i < 6; i++) k.arrow(ctx, 410, 40 + i * 56, 370, 40 + i * 56, 'rgba(255,214,90,0.6)', 2, 8);
        k.text(ctx, k.L('太陽光 →', 'sunlight →'), 400, 18, { color: '#ffd75a', size: 15, align: 'right' });
        // top view: Earth + orbit
        const ex = 200, ey = 180, R = 125, a = m.angle(day);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(ex, ey, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        k.circle(ctx, ex, ey, 26, '#2f7de1'); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.arc(ex, ey, 26, Math.PI / 2, -Math.PI / 2); ctx.fill();
        k.text(ctx, k.L('地球', 'Earth'), ex, ey + 42, { color: '#cfe3ff', size: 15, align: 'center' });
        const mx = ex + R * Math.cos(a), my = ey - R * Math.sin(a);
        k.circle(ctx, mx, my, 15, '#d9d6c8'); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.arc(mx, my, 15, Math.PI / 2, -Math.PI / 2); ctx.fill();
        k.line(ctx, ex, ey, mx, my, 'rgba(255,255,255,0.35)', 1, [3, 4]);
        k.text(ctx, k.L('月球', 'Moon'), mx, my - 24, { color: '#fff', size: 14, align: 'center' });
        // what we see
        k.rrect(ctx, 440, 50, 180, 250, 14, 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.25)');
        k.text(ctx, k.L('從台灣看到', 'Seen from Taiwan'), 530, 74, { color: '#fff', size: 15, align: 'center' });
        disc(530, 170, 60, day);
        const p = m.PHASES[m.phase(day)];
        k.text(ctx, k.L(p[0], p[1]), 530, 262, { color: '#ffd75a', size: 20, bold: true, align: 'center' });
        void c;
        ro.set(k.L(`第 <b>${k.fmt(day, 1)}</b> 天：<b>${p[0]}</b><br>看到亮的部分約 <b>${Math.round(m.lit(day) * 100)}%</b>，${m.lit(day) < 0.02 ? '幾乎看不到' : m.waxing(day) ? '右邊亮（愈來愈胖）' : '左邊亮（愈來愈瘦）'}`,
          `Day <b>${k.fmt(day, 1)}</b>: <b>${p[1]}</b><br>About <b>${Math.round(m.lit(day) * 100)}%</b> of the face looks lit — ${m.lit(day) < 0.02 ? 'almost invisible' : m.waxing(day) ? 'lit on the right (growing)' : 'lit on the left (shrinking)'}`));
      });
    },
    observe: [
      { try: T('把日子調到第 0 天，看看月球在哪裡。', 'Set the day to 0. Where is the Moon?'),
        ask: T('新月時，月球在…', 'At new moon, the Moon is…'),
        options: [T('地球和太陽中間', 'between Earth and the Sun'), T('地球的背後（遠離太陽那邊）', 'behind Earth, on the side away from the Sun'), T('不見了', 'gone')],
        why: T('新月時月球在地球和太陽之間，被照亮的那一面朝向太陽，背對地球，所以我們幾乎看不到它。', 'At new moon the Moon is between Earth and the Sun. Its lit side faces the Sun, away from us, so we can hardly see it.') },
      { try: T('播放，從新月看到滿月。', 'Press play and watch from new moon to full moon.'),
        ask: T('月亮「變胖」的時候（上弦月前後），亮的是哪一邊？', 'While the Moon is growing (around first quarter), which side is lit?'),
        options: [T('右邊', 'The right side'), T('左邊', 'The left side'), T('上面', 'The top')],
        why: T('在北半球（例如台灣）看，月亮變胖時右邊亮，上弦月是右半邊亮；變瘦時左邊亮，下弦月是左半邊亮。', 'From the Northern Hemisphere (like Taiwan), the growing Moon is lit on the right — the first quarter is a right half. The shrinking Moon is lit on the left — the last quarter is a left half.') },
      { try: T('把日子調到大約第 15 天。', 'Set the day to about 15.'),
        ask: T('滿月時月球在哪裡？', 'Where is the Moon at full moon?'),
        options: [T('地球的另一邊，和太陽相對', 'on the far side of Earth, opposite the Sun'), T('地球和太陽中間', 'between Earth and the Sun'), T('太陽的旁邊', 'next to the Sun')],
        why: T('滿月時太陽、地球、月球大約排成一直線，月球在地球外側，整個被照亮的面都朝向我們。', 'At full moon the Sun, Earth and Moon are roughly in a line with the Moon on the outside, so its whole lit side faces us.') },
      { try: T('從第 0 天播放到第 29.5 天。', 'Play from day 0 to day 29.5.'),
        ask: T('月相變化一輪大約要多久？', 'About how long does one full cycle of phases take?'),
        options: [T('大約一個月（29.5 天）', 'About a month (29.5 days)'), T('一天', 'One day'), T('一年', 'One year')],
        why: T('月球繞地球一圈、月相變化一輪大約 29.5 天，所以農曆一個月是 29 或 30 天。', 'The phases repeat about every 29.5 days, which is why a lunar month has 29 or 30 days.') },
    ],
  },
  {
    id: 'soil-jar', grades: [3, 4], subj: 'earth', icon: '🫙',
    name: T('土壤裡有什麼？', 'What is in soil?'),
    intro: T('把一把土和水裝進瓶子裡，用力搖一搖，再靜靜放著。大小不同的顆粒會沉得快慢不同，一層一層排好。也可以比較水流過礫石、沙和黏土的速度。',
      'Put some soil and water in a jar, shake it hard, and let it sit. Grains of different sizes sink at different speeds and settle into layers. You can also compare how fast water drains through gravel, sand and clay.'),
    cur: { tw: T('國小中年級 岩石與土壤', 'Middle elementary · rocks and soil'), us: 'NGSS 4-ESS2-1' },
    model: soil,
    checks(m, ok) {
      const sp = Object.fromEntries(m.SOIL.map((g) => [g.id, m.speed(g)]));
      ok(sp.gravel > sp.sand && sp.sand > sp.silt && sp.silt > sp.clay && sp.clay > 0, 'bigger grains sink faster');
      ok(sp.humus < 0, 'humus floats');
      ok(m.DRAIN.gravel > m.DRAIN.sand && m.DRAIN.sand > m.DRAIN.clay, 'water drains fastest through gravel, slowest through clay');
      ok(m.SOIL.filter((g) => !g.floats).every((g, i, a) => i === 0 || g.d < a[i - 1].d), 'grain sizes listed from big to small');
    },
    mount(k) {
      const m = soil, v = k.canvas(640, 380), { ctx, W, H } = v;
      let mode = 'jar', grains = [], t = 0, shake = 0, pour = -1, cups = { gravel: 0, sand: 0, clay: 0 };
      const jar = { x: 190, y: 50, w: 200, h: 300 };
      const fill = () => { // every grain gets a resting slot in its layer (bottom-up: gravel, sand, silt, clay)
        grains = []; let floor = jar.y + jar.h - 4, i = 0;
        for (const g of m.SOIL) {
          const per = Math.floor((jar.w - 12) / (g.r * 2.1));
          for (let j = 0; j < g.n; j++, i++) {
            const row = Math.floor(j / per), col = j % per;
            const tx = jar.x + 6 + g.r + col * g.r * 2.1 + (row % 2) * g.r * 0.9;
            const ty = g.floats ? jar.y + 24 + g.r + (j % 2) * 3 : floor - g.r - row * g.r * 2.0;
            grains.push({ g, x: tx, y: jar.y + 40 + ((i * 97.3) % (jar.h - 60)), tx, ty, rest: false });
          }
          if (!g.floats) floor -= Math.ceil(g.n / per) * g.r * 2.0;
        }
      };
      fill();
      const layerY = (id) => { const ps = grains.filter((p) => p.g.id === id); return ps.reduce((s, p) => s + p.ty, 0) / ps.length; };
      k.seg({ label: T('實驗', 'Experiment'), value: 'jar', options: [{ v: 'jar', label: T('搖一搖土壤瓶', 'Shake the soil jar') }, { v: 'drain', label: T('排水比賽', 'Drainage race') }], onChange: (x) => { mode = x; pour = -1; } });
      k.buttons([{ label: T('🫨 搖一搖', '🫨 Shake it'), primary: true, on: () => { fill(); shake = 1; t = 0; } }, { label: T('💧 倒水', '💧 Pour water'), on: () => { pour = 0; cups = { gravel: 0, sand: 0, clay: 0 }; } }]);
      k.slider({ label: T('時間快轉', 'Fast-forward'), min: 1, max: 5, step: 1, value: 2, unit: '×', onInput: (x) => (speed = x) });
      let speed = 2;
      const ro = k.readout();
      k.loop((dt) => {
        const c = k.colors(); dt *= speed; t += dt;
        ctx.clearRect(0, 0, W, H);
        if (mode === 'jar') {
          const wob = shake > 0 ? Math.sin(t * 40) * 6 * shake : 0; shake = Math.max(0, shake - dt * 0.8);
          ctx.save(); ctx.translate(wob, 0);
          ctx.fillStyle = 'rgba(150,120,80,0.10)'; ctx.fillRect(jar.x, jar.y + 20, jar.w, jar.h - 20);
          // cloudy water while clay is still suspended
          const floating = grains.filter((p) => p.g.id === 'clay' && !p.rest).length / m.SOIL.find((g) => g.id === 'clay').n;
          ctx.fillStyle = `rgba(122,80,56,${0.05 + 0.3 * floating})`; ctx.fillRect(jar.x, jar.y + 20, jar.w, jar.h - 20);
          for (const p of grains) {
            if (shake > 0.2) { p.y = jar.y + 30 + Math.abs(Math.sin(t * 7 + p.tx * 0.37 + p.ty * 0.11)) * (jar.h - 40); p.rest = false; }
            else if (!p.rest) {
              const sp = m.speed(p.g);
              if (p.g.floats) { p.y = Math.max(p.ty, p.y - 40 * dt); if (p.y <= p.ty) p.rest = true; }
              else { p.y += sp * dt * 0.6; if (p.y >= p.ty) { p.y = p.ty; p.rest = true; } }
            }
            k.circle(ctx, p.x, p.y, p.g.r, p.g.col);
          }
          ctx.strokeStyle = c.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(jar.x, jar.y); ctx.lineTo(jar.x, jar.y + jar.h); ctx.lineTo(jar.x + jar.w, jar.y + jar.h); ctx.lineTo(jar.x + jar.w, jar.y); ctx.stroke();
          k.rrect(ctx, jar.x - 8, jar.y - 16, jar.w + 16, 18, 4, '#9aa3a8', c.ink);
          ctx.restore();
          // labels for the layers
          const allRest = grains.every((p) => p.rest);
          if (allRest) for (const g of m.SOIL) { const y = layerY(g.id); k.line(ctx, jar.x + jar.w + 6, y, jar.x + jar.w + 30, y, c.muted, 1.5); k.text(ctx, k.L(g.zh, g.en), jar.x + jar.w + 36, y, { color: c.ink, size: 15, bold: true }); }
          ro.set(allRest ? k.L('沉好了！最大顆的<b>礫石</b>在最下面，接著是<b>沙</b>、<b>粉砂</b>，最細的<b>黏土</b>在最上層；輕輕的<b>腐植質</b>浮在水面。', 'Settled! The biggest grains — <b>gravel</b> — are at the bottom, then <b>sand</b>, <b>silt</b>, and the finest <b>clay</b> on top. Light <b>humus</b> floats.')
            : k.L(`顆粒正在下沉…　時間 ${k.fmt(t, 0)} 秒`, `Grains are sinking…  time ${k.fmt(t, 0)} s`));
        } else {
          const kinds = ['gravel', 'sand', 'clay'];
          kinds.forEach((id, i) => {
            const g = m.SOIL.find((s) => s.id === id), x = 110 + i * 210;
            ctx.fillStyle = c.soft; ctx.beginPath(); ctx.moveTo(x - 60, 70); ctx.lineTo(x + 60, 70); ctx.lineTo(x + 15, 170); ctx.lineTo(x - 15, 170); ctx.fill();
            for (let j = 0; j < 40; j++) k.circle(ctx, x - 45 + ((j * 23) % 90) * (1 - ((j * 7) % 40) / 100), 80 + ((j * 37) % 60), g.r + 1, g.col);
            k.rrect(ctx, x - 45, 220, 90, 120, 6, null, c.ink, 2.5);
            if (pour >= 0) { cups[id] = Math.min(200, cups[id] + m.DRAIN[id] * dt); if (cups[id] < 200 && t % 0.4 < 0.25) for (let d = 0; d < 3; d++) k.circle(ctx, x, 185 + ((t * 120 + d * 12) % 35), 3, '#3b8fe0'); }
            const hh = (cups[id] / 200) * 116; ctx.fillStyle = 'rgba(59,143,224,0.55)'; ctx.fillRect(x - 43, 338 - hh, 86, hh);
            k.text(ctx, k.L(g.zh, g.en), x, 50, { color: c.ink, size: 17, bold: true, align: 'center' });
            k.text(ctx, `${k.fmt(cups[id], 0)} mL`, x, 360, { color: c.ink, size: 15, align: 'center' });
          });
          if (pour >= 0) pour += dt;
          ro.set(pour < 0 ? k.L('按「倒水」，每個漏斗倒入一樣多的水。', 'Press “Pour water” to pour the same amount into each funnel.')
            : k.L(`流下來的水：礫石 <b>${k.fmt(cups.gravel, 0)}</b> mL、沙 <b>${k.fmt(cups.sand, 0)}</b> mL、黏土 <b>${k.fmt(cups.clay, 0)}</b> mL`, `Water through: gravel <b>${k.fmt(cups.gravel, 0)}</b> mL, sand <b>${k.fmt(cups.sand, 0)}</b> mL, clay <b>${k.fmt(cups.clay, 0)}</b> mL`));
        }
      });
    },
    observe: [
      { try: T('按「搖一搖」，等顆粒全部沉下來。', 'Press “Shake it” and wait until everything settles.'),
        ask: T('哪一種顆粒沉在最下面？', 'Which grains end up at the very bottom?'),
        options: [T('礫石（最大顆）', 'Gravel (the biggest)'), T('黏土（最細）', 'Clay (the finest)'), T('腐植質', 'Humus')],
        why: T('顆粒愈大愈重，在水裡沉得愈快，所以大顆的礫石最先沉到底，細細的黏土最慢。', 'Bigger grains sink faster in water, so the large gravel reaches the bottom first and the tiny clay is last.') },
      { try: T('搖完以後馬上看瓶子裡的水。', 'Look at the water right after shaking.'),
        ask: T('為什麼水會混濁很久？', 'Why does the water stay cloudy for a long time?'),
        options: [T('很細的黏土顆粒沉得非常慢', 'Very fine clay grains sink very slowly'), T('水被土弄髒就不會再變清', 'Muddy water never clears'), T('礫石還浮在水面', 'The gravel is floating')],
        why: T('黏土顆粒非常小，在水中下沉得很慢，所以水會混濁很久才慢慢變清。', 'Clay grains are so tiny that they sink very slowly, so the water stays cloudy a long time before it clears.') },
      { try: T('換到「排水比賽」，按「倒水」。', 'Switch to “Drainage race” and press “Pour water”.'),
        ask: T('水最快流過哪一種土？', 'Water drains fastest through…'),
        options: [T('礫石', 'gravel'), T('沙', 'sand'), T('黏土', 'clay')],
        why: T('礫石顆粒大，中間的空隙大，水很容易流過；黏土顆粒細又緊密，水很難通過，所以黏土地容易積水。', 'Gravel has big gaps between its grains, so water rushes through. Clay grains are tiny and packed tight, so water gets through very slowly — clay ground gets puddles.') },
    ],
  },
  {
    id: 'life-cycles', grades: [3, 4], subj: 'bio', icon: '🦋',
    name: T('動物的一生', 'Animal life cycles'),
    intro: T('動物從出生、長大到繁殖下一代，會經過不同的階段。選一種動物，按播放看看牠的一生。注意：有的昆蟲會經過「蛹」，有的不會！',
      'Animals go through stages as they are born, grow up and have young. Pick an animal and press play to watch its life cycle. Notice: some insects have a pupa stage and some don’t!'),
    cur: { tw: T('國小中年級 動物的一生', 'Middle elementary · animal life cycles'), us: 'NGSS 3-LS1-1' },
    model: life,
    checks(m, ok) {
      const C = m.CYCLES;
      ok(C.butterfly.stages.map((s) => s.en).join() === 'egg,larva (caterpillar),pupa,adult', 'butterfly: egg → larva → pupa → adult (complete metamorphosis)');
      ok(C.grasshopper.stages.length === 3 && !C.grasshopper.stages.some((s) => /pupa/.test(s.en)), 'grasshopper: no pupa (incomplete metamorphosis)');
      ok(C.frog.stages[1].en === 'tadpole', 'frogs have a tadpole stage');
      ok(m.stageAt(C.butterfly, 0) === 0 && m.stageAt(C.butterfly, 5) === 1 && m.stageAt(C.butterfly, 21) === 2 && m.stageAt(C.butterfly, 31) === 3, 'stage lookup by day');
      ok(m.stageAt(C.chicken, m.total(C.chicken)) === 0, 'the cycle starts again');
      ok(C.chicken.stages[0].days === 21, 'chicken eggs hatch after about 21 days');
    },
    mount(k) {
      const m = life, v = k.canvas(640, 380), { ctx, W, H } = v;
      let id = 'butterfly', day = 0, play = true;
      k.seg({ label: T('動物', 'Animal'), value: 'butterfly', options: Object.entries(m.CYCLES).map(([kk, c]) => ({ v: kk, label: T(c.zh, c.en) })), onChange: (x) => { id = x; day = 0; } });
      const b = k.buttons([{ label: T('⏸ 暫停', '⏸ Pause'), primary: true, on: () => (play = !play) }, { label: T('⏭ 下一個階段', '⏭ Next stage'), on: () => { const c = m.CYCLES[id]; let s = 0; const i = m.stageAt(c, day); for (let j = 0; j <= i; j++) s += c.stages[j].days; day = s % m.total(c); } }]);
      const ro = k.readout();
      const pic = (e, x, y, s) => {
        if (e === 'pupa') { ctx.fillStyle = '#9bbf5a'; ctx.beginPath(); ctx.ellipse(x, y, s * 0.22, s * 0.42, 0, 0, Math.PI * 2); ctx.fill(); k.line(ctx, x, y - s * 0.42, x, y - s * 0.55, '#7a6a58', 2); return; }
        if (e === 'frogeggs') { for (let i = 0; i < 14; i++) { const a = i * 2.4, r = (i % 4) * s * 0.09; k.circle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, s * 0.08, 'rgba(200,220,230,0.8)', '#8aa'); k.circle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, s * 0.03, '#222'); } return; }
        if (e === 'tadpole') { ctx.fillStyle = '#4b5a3a'; ctx.beginPath(); ctx.ellipse(x - s * 0.1, y, s * 0.18, s * 0.14, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.quadraticCurveTo(x + s * 0.3, y - s * 0.12, x + s * 0.42, y); ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.12, x, y + 5); ctx.fill(); return; }
        if (e === 'froglet') { emo(k, ctx, '🐸', x, y, s * 0.6); ctx.strokeStyle = '#4c8a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + s * 0.15, y + s * 0.15); ctx.quadraticCurveTo(x + s * 0.35, y + s * 0.2, x + s * 0.45, y + s * 0.05); ctx.stroke(); return; }
        if (e === 'nymph') { emo(k, ctx, '🦗', x, y, s * 0.55); return; }
        emo(k, ctx, e, x, y, s * 0.8);
      };
      k.loop((dt) => {
        const c = k.colors(), cy = m.CYCLES[id], tot = m.total(cy);
        if (play) day = (day + dt * tot / 12) % tot;
        b.firstChild.textContent = play ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 播放', '▶ Play');
        ctx.clearRect(0, 0, W, H);
        const cx = 200, ccy = 195, R = 130, n = cy.stages.length, cur = m.stageAt(cy, day);
        ctx.strokeStyle = c.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, ccy, R, 0, Math.PI * 2); ctx.stroke();
        let acc = 0;
        cy.stages.forEach((s, i) => {
          const a0 = -Math.PI / 2 + (acc / tot) * Math.PI * 2; acc += s.days;
          const a1 = -Math.PI / 2 + (acc / tot) * Math.PI * 2, am = (a0 + a1) / 2;
          ctx.strokeStyle = i === cur ? c.acc : c.line; ctx.lineWidth = i === cur ? 9 : 3; ctx.beginPath(); ctx.arc(cx, ccy, R, a0 + 0.04, a1 - 0.04); ctx.stroke();
          const x = cx + Math.cos(am) * (R + 0), y = ccy + Math.sin(am) * R;
          k.circle(ctx, x, y, 30, i === cur ? c.card : c.soft, i === cur ? c.acc : c.line, i === cur ? 3 : 1.5);
          pic(s.e, x, y, 62);
          const lx = cx + Math.cos(am) * (R + 52), ly = ccy + Math.sin(am) * (R + 44);
          k.text(ctx, k.L(s.zh, s.en.split(' (')[0]), lx, ly, { color: i === cur ? c.acc : c.ink, size: 15, bold: i === cur, align: 'center' });
          k.arrow(ctx, cx + Math.cos(a1 - 0.12) * R, ccy + Math.sin(a1 - 0.12) * R, cx + Math.cos(a1 - 0.05) * R, ccy + Math.sin(a1 - 0.05) * R, c.muted, 2, 9);
        });
        const ad = -Math.PI / 2 + (day / tot) * Math.PI * 2;
        k.circle(ctx, cx + Math.cos(ad) * R, ccy + Math.sin(ad) * R, 7, c.no, '#fff', 2);
        // big picture
        k.rrect(ctx, 420, 40, 200, 220, 18, c.soft);
        pic(cy.stages[cur].e, 520, 140, 150);
        k.text(ctx, k.L(cy.stages[cur].zh, cy.stages[cur].en), 520, 238, { color: c.ink, size: 18, bold: true, align: 'center' });
        k.text(ctx, cy.complete === true ? k.L('完全變態', 'complete metamorphosis') : cy.complete === false ? k.L('不完全變態', 'incomplete metamorphosis') : '', 520, 290, { color: c.acc, size: 17, bold: true, align: 'center' });
        let into = day; for (let i = 0; i < cur; i++) into -= cy.stages[i].days;
        ro.set(k.L(`${cy.zh}：<b>${cy.stages[cur].zh}</b>（這個階段大約 ${cy.stages[cur].days} 天，已過 ${Math.floor(into)} 天）<br>${cy.stages.map((s) => s.zh).join(' → ')} → …`,
          `${cy.en}: <b>${cy.stages[cur].en}</b> (this stage lasts about ${cy.stages[cur].days} days; day ${Math.floor(into)} of it)<br>${cy.stages.map((s) => s.en.split(' (')[0]).join(' → ')} → …`) +
          `<div class="muted">${k.L('天數是大約的，會隨溫度和種類改變。', 'Day counts are approximate and change with temperature and species.')}</div>`);
      });
    },
    observe: [
      { try: T('選「紋白蝶」，看完一整圈。', 'Choose the cabbage white butterfly and watch a whole cycle.'),
        ask: T('蝴蝶的一生依序是…', 'A butterfly’s life cycle goes…'),
        options: [T('卵 → 幼蟲 → 蛹 → 成蟲', 'egg → larva → pupa → adult'), T('卵 → 蛹 → 幼蟲 → 成蟲', 'egg → pupa → larva → adult'), T('卵 → 若蟲 → 成蟲', 'egg → nymph → adult')],
        why: T('蝴蝶從卵孵出幼蟲（毛毛蟲），幼蟲吃葉子長大後變成蛹，最後從蛹羽化成蝴蝶。有蛹這個階段叫做「完全變態」。', 'A butterfly hatches from an egg as a larva (caterpillar), grows by eating leaves, becomes a pupa, and finally an adult butterfly comes out. Having a pupa stage is called complete metamorphosis.') },
      { try: T('選「蝗蟲」，和蝴蝶比較。', 'Choose the grasshopper and compare it with the butterfly.'),
        ask: T('蝗蟲和蝴蝶有什麼不同？', 'How is the grasshopper different?'),
        options: [T('蝗蟲沒有蛹的階段', 'The grasshopper has no pupa stage'), T('蝗蟲沒有卵的階段', 'The grasshopper has no egg stage'), T('蝗蟲出生就是成蟲', 'The grasshopper is born as an adult')],
        why: T('蝗蟲的若蟲長得很像小小的成蟲，會脫皮長大，沒有蛹的階段，這叫做「不完全變態」。', 'A young grasshopper (nymph) looks like a small adult and grows by molting. There is no pupa stage — this is incomplete metamorphosis.') },
      { try: T('選「青蛙」，看看蝌蚪的變化。', 'Choose the frog and watch the tadpole change.'),
        ask: T('蝌蚪長成青蛙的過程中，會…', 'As a tadpole becomes a frog, it…'),
        options: [T('長出腳，尾巴慢慢消失', 'grows legs and its tail slowly disappears'), T('長出翅膀', 'grows wings'), T('先變成蛹', 'turns into a pupa first')],
        why: T('蝌蚪住在水裡、用鰓呼吸；慢慢長出後腳、前腳，尾巴變短消失，變成可以上岸用肺呼吸的青蛙。', 'A tadpole lives in water and breathes with gills. It grows back legs, then front legs, and its tail shrinks away until it becomes a frog that can live on land and breathe with lungs.') },
    ],
  },
];

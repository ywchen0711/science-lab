// Simulations for grades 1–2 (國小低年級 生活課程). Format: see SPEC.md.
import { T } from '../util.js';

const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const emo = (k, ctx, e, x, y, size) => k.text(ctx, e, x, y, { size, align: 'center', font: EMOJI });

// ---------------- magnets ----------------
const MAG_OBJ = [
  { id: 'clip', e: '📎', zh: '迴紋針', en: 'paper clip', mag: true, mat: T('鐵（鋼）', 'iron (steel)') },
  { id: 'nail', e: '🔩', zh: '鐵螺絲', en: 'iron screw', mag: true, mat: T('鐵', 'iron') },
  { id: 'wood', e: '🪵', zh: '木塊', en: 'wood block', mag: false, mat: T('木頭', 'wood') },
  { id: 'ruler', e: '📏', zh: '塑膠尺', en: 'plastic ruler', mag: false, mat: T('塑膠', 'plastic') },
  { id: 'can', e: '🥫', zh: '鋁罐', en: 'aluminum can', mag: false, mat: T('鋁', 'aluminum') },
  { id: 'eraser', e: '🧽', zh: '橡皮擦', en: 'eraser', mag: false, mat: T('橡膠', 'rubber') },
  { id: 'pin', e: '🧷', zh: '安全別針', en: 'safety pin', mag: true, mat: T('鐵（鋼）', 'iron (steel)') },
  { id: 'copper', e: '🪙', zh: '銅片', en: 'copper disk', mag: false, mat: T('銅', 'copper') },
];
const magnets = {
  OBJ: MAG_OBJ,
  // which poles face each other. Left magnet is [S|N] (its right end is N) unless flipped; right magnet is [S|N] (left end S).
  facing: (leftFlip, rightFlip) => [leftFlip ? 'S' : 'N', rightFlip ? 'N' : 'S'],
  interact: (p1, p2) => (p1 === p2 ? 'repel' : 'attract'),
  // force on the right magnet (+ = pushed right); weaker with distance (gap in toy pixels)
  force(gap, kind) { const f = 4.0e5 / Math.max(gap + 30, 30) ** 2; return kind === 'repel' ? f : -f; },
  sticks: (obj) => obj.mag,
};

// ---------------- floating ----------------
const FLOAT_OBJ = [
  { id: 'apple', e: '🍎', zh: '蘋果', en: 'apple', rho: 0.85 },
  { id: 'wood', e: '🪵', zh: '木塊', en: 'wood', rho: 0.6 },
  { id: 'rock', e: '🪨', zh: '石頭', en: 'rock', rho: 2.6 },
  { id: 'coin', e: '🪙', zh: '硬幣', en: 'coin', rho: 8.5 },
  { id: 'ball', e: '⚽', zh: '充氣球', en: 'ball', rho: 0.08 },
  { id: 'ice', e: '🧊', zh: '冰塊', en: 'ice', rho: 0.92 },
  { id: 'key', e: '🔑', zh: '鑰匙', en: 'key', rho: 8.4 },
  { id: 'duck', e: '🦆', zh: '塑膠小鴨', en: 'toy duck', rho: 0.15 },
  { id: 'egg', e: '🥚', zh: '雞蛋', en: 'egg', rho: 1.08 },
];
const floating = {
  OBJ: FLOAT_OBJ,
  WATER: 1.0, SALTY: 1.2,
  floats: (rho, liquid) => rho < liquid,
  // fraction of the object under the surface (1 = all under)
  under: (rho, liquid) => Math.min(1, rho / liquid),
};

// ---------------- shadows ----------------
const shadows = {
  NOON: { summer: 88, winter: 42 },  // noon Sun height in Taipei (≈ 25° N): June ≈ 88°, December ≈ 42°
  // Sun height (degrees) at clock hour h (simple model: sunrise 6, sunset 18)
  altitude: (h, noonAlt) => (h <= 6 || h >= 18 ? 0 : noonAlt * Math.sin((Math.PI * (h - 6)) / 12)),
  // shadow length of a stick of height H when the Sun is alt degrees high
  length: (H, alt) => (alt <= 0 ? Infinity : H / Math.tan((alt * Math.PI) / 180)),
  // morning Sun in the east → shadow points west (+1); afternoon → east (−1)
  side: (h) => (h < 12 ? 1 : h > 12 ? -1 : 0),
};

// ---------------- water states ----------------
// energy per gram, measured from ice at −20 °C (J/g)
const WD = { cIce: 2.1, cWater: 4.18, cSteam: 2.0, Lf: 334, Lv: 2260, T0: -20 };
const E_MELT0 = WD.cIce * 20, E_MELT1 = E_MELT0 + WD.Lf, E_BOIL0 = E_MELT1 + WD.cWater * 100, E_BOIL1 = E_BOIL0 + WD.Lv;
const water = {
  W: WD, E_MELT0, E_MELT1, E_BOIL0, E_BOIL1,
  // temperature and the fractions of ice / liquid / steam for a given energy
  state(E) {
    if (E <= E_MELT0) return { T: WD.T0 + E / WD.cIce, ice: 1, liq: 0, gas: 0 };
    if (E <= E_MELT1) { const f = (E - E_MELT0) / WD.Lf; return { T: 0, ice: 1 - f, liq: f, gas: 0 }; }
    if (E <= E_BOIL0) return { T: (E - E_MELT1) / WD.cWater, ice: 0, liq: 1, gas: 0 };
    if (E <= E_BOIL1) { const f = (E - E_BOIL0) / WD.Lv; return { T: 100, ice: 0, liq: 1 - f, gas: f }; }
    return { T: 100 + (E - E_BOIL1) / WD.cSteam, ice: 0, liq: 0, gas: 1 };
  },
};

// ---------------- plant needs ----------------
const plants = {
  // day-by-day toy model of a bean seedling → { h (cm), leaves, green 0–1, water 0–1, alive }
  grow(days, { water: wt, light }) {
    let h = 0, leaves = 0, green = 1, moist = 1, food = 1, alive = true;
    for (let d = 1; d <= days; d++) {
      moist = wt ? 1 : Math.max(0, moist - 0.25);
      if (!alive) continue;
      if (moist <= 0) { alive = false; continue; }
      if (d <= 2) continue;                               // sprouts on day 3
      if (light) { h += 1.6 * moist; green = Math.min(1, green + 0.1); food = 1; }
      else { food -= 0.09; h += food > 0 ? 1.4 : 0; green = Math.max(0.1, green - 0.15); if (food <= 0) alive = false; }
      leaves = Math.min(8, Math.floor((h + 2) / 3));
    }
    return { h, leaves, green, water: moist, alive };
  },
};

export default [
  {
    id: 'magnets', grades: [1, 2], subj: 'phys', icon: '🧲',
    name: T('磁鐵的祕密', 'Magnet magic'),
    intro: T('磁鐵有兩個極：N 極和 S 極。拖拉右邊的磁鐵靠近左邊的磁鐵，看看它們會互相「吸」還是互相「推」。再換到「測試物品」，拿磁鐵去碰碰看各種東西。',
      'A magnet has two ends called poles: N and S. Drag the right magnet toward the left one and see whether they pull together or push apart. Then switch to “Test objects” and touch the magnet to different things.'),
    cur: { tw: T('國小低年級 生活課程 磁鐵', 'Lower elementary (Life Curriculum) · magnets'), us: 'NGSS 3-PS2-3' },
    model: magnets,
    checks(m, ok) {
      ok(m.interact('N', 'S') === 'attract' && m.interact('S', 'N') === 'attract', 'opposite poles attract');
      ok(m.interact('N', 'N') === 'repel' && m.interact('S', 'S') === 'repel', 'like poles repel');
      ok(m.interact(...m.facing(false, false)) === 'attract', 'default N facing S attracts');
      ok(m.interact(...m.facing(false, true)) === 'repel' && m.interact(...m.facing(true, false)) === 'repel', 'flipping one magnet makes them repel');
      ok(m.interact(...m.facing(true, true)) === 'attract', 'flipping both attracts again');
      ok(Math.abs(m.force(20, 'attract')) > Math.abs(m.force(120, 'attract')), 'force weaker when farther');
      ok(m.force(50, 'repel') > 0 && m.force(50, 'attract') < 0, 'force directions');
      ok(m.OBJ.filter(m.sticks).every((o) => /iron/.test(o.mat.en)) && m.OBJ.filter((o) => !m.sticks(o)).every((o) => !/iron/.test(o.mat.en)), 'only iron things stick');
    },
    mount(k) {
      const m = magnets, v = k.canvas(640, 340), { ctx, W, H } = v;
      let mode = "two", leftFlip = false, rightFlip = false, rx = 400, vx = 0, drag = null;
      let mag = { x: 320, y: 110 }, objs = [], found = new Set(), touched = new Set();
      const resetObjs = () => { objs = m.OBJ.map((o, i) => ({ ...o, x: 44 + i * 79, y: 270, stuck: false, dx: 0, dy: 0 })); found = new Set(); touched = new Set(); };
      resetObjs();
      k.seg({ label: T('玩法', 'Mode'), value: 'two', options: [{ v: 'two', label: T('兩塊磁鐵', 'Two magnets') }, { v: 'test', label: T('測試物品', 'Test objects') }], onChange: (x) => { mode = x; resetObjs(); } });
      const bRow = k.buttons([
        { label: T('🔄 翻轉右邊磁鐵', '🔄 Flip the right magnet'), primary: true, on: () => { rightFlip = !rightFlip; vx = 0; } },
        { label: T('🔄 翻轉左邊磁鐵', '🔄 Flip the left magnet'), on: () => { leftFlip = !leftFlip; vx = 0; } },
      ]);
      k.buttons([{ label: T('↺ 重來', '↺ Reset'), on: () => { rx = 430; vx = 0; resetObjs(); mag = { x: 320, y: 110 }; } }]);
      const ro = k.readout();
      const barW = 150, barH = 46, ly = 150, lx = 70;
      const drawMagnet = (x, y, flip, w = barW, h = barH) => {
        const red = '#e5484d', blue = '#3b7be0', L = flip ? 'N' : 'S', R = flip ? 'S' : 'N';
        k.rrect(ctx, x, y, w / 2 + 6, h, 6, L === 'N' ? red : blue); k.rrect(ctx, x + w / 2 - 6, y, w / 2 + 6, h, 6, R === 'N' ? red : blue);
        ctx.fillStyle = R === 'N' ? red : blue; ctx.fillRect(x + w / 2, y, 8, h);
        k.text(ctx, L, x + w / 4, y + h / 2, { color: '#fff', size: 24, bold: true, align: 'center' });
        k.text(ctx, R, x + (3 * w) / 4, y + h / 2, { color: '#fff', size: 24, bold: true, align: 'center' });
      };
      k.pointer(v.cv, {
        down(p) {
          if (mode === 'two' && p.x > rx - 10 && p.x < rx + barW + 10 && p.y > ly - 30 && p.y < ly + barH + 30) drag = { dx: p.x - rx };
          if (mode === 'test' && Math.abs(p.x - mag.x) < 95 && Math.abs(p.y - mag.y) < 50) drag = { dx: p.x - mag.x, dy: p.y - mag.y };
        },
        move(p, d) {
          if (!drag || !d) return;
          if (mode === 'two') { rx = Math.max(lx + barW, Math.min(W - barW - 10, p.x - drag.dx)); vx = 0; }
          else { mag.x = Math.max(80, Math.min(W - 80, p.x - drag.dx)); mag.y = Math.max(40, Math.min(H - 60, p.y - drag.dy)); }
        },
        up() { drag = null; },
      });
      k.loop((dt) => {
        const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = c.dark ? '#3a3125' : '#f1e3c8'; ctx.fillRect(0, H - 44, W, 44);
        bRow.style.display = mode === 'two' ? '' : 'none';
        if (mode === 'two') {
          const [p1, p2] = m.facing(leftFlip, rightFlip), kind = m.interact(p1, p2);
          const gap = rx - (lx + barW);
          if (!drag) {
            vx += m.force(gap, kind) * dt * 6; vx *= 0.9; rx += vx * dt;
            if (rx < lx + barW) { rx = lx + barW; vx = 0; }
            if (rx > W - barW - 10) { rx = W - barW - 10; vx = 0; }
          }
          drawMagnet(lx, ly, leftFlip); drawMagnet(rx, ly, rightFlip);
          const col = kind === 'attract' ? c.ok : c.no;
          if (gap < 260 && gap > 2) {
            const s = Math.min(70, 3000 / (gap + 30));
            const d = kind === 'attract' ? -1 : 1;
            k.arrow(ctx, rx + 30, ly - 22, rx + 30 + d * s, ly - 22, col, 4);
            k.arrow(ctx, lx + barW - 30, ly - 22, lx + barW - 30 - d * s, ly - 22, col, 4);
          }
          k.text(ctx, kind === 'attract' ? k.L('相吸！', 'Pull together!') : k.L('相斥！', 'Push apart!'), W / 2, 56, { color: col, size: 30, bold: true, align: 'center' });
          k.text(ctx, `${p1} ↔ ${p2}`, W / 2, 94, { color: c.muted, size: 20, align: 'center' });
          k.text(ctx, k.L('👆 拖拉右邊的磁鐵', '👆 Drag the right magnet'), W / 2, H - 22, { color: c.ink, size: 17, align: 'center' });
          ro.set(k.L(`面對面的是 <b>${p1}</b> 極和 <b>${p2}</b> 極 → ${kind === 'attract' ? '<b>不同極，互相吸引</b>' : '<b>相同極，互相排斥</b>'}`,
            `Facing poles: <b>${p1}</b> and <b>${p2}</b> → ${kind === 'attract' ? '<b>different poles attract</b>' : '<b>same poles repel</b>'}`));
        } else {
          for (const o of objs) {
            const d = Math.hypot(mag.x - o.x, mag.y + 30 - o.y);
            if (d < 95) touched.add(o.id);
            if (!o.stuck && o.mag && d < 95) { o.stuck = true; o.dx = Math.max(-70, Math.min(70, o.x - mag.x)); o.dy = 42; found.add(o.id); }
            if (o.stuck) { o.x += (mag.x + o.dx - o.x) * Math.min(1, dt * 14); o.y += (mag.y + o.dy - o.y) * Math.min(1, dt * 14); }
            emo(k, ctx, o.e, o.x, o.y, 40);
            if (!o.stuck) k.text(ctx, k.L(o.zh, o.en), o.x, o.y + 32, { color: c.ink, size: 13, align: 'center' });
          }
          drawMagnet(mag.x - 80, mag.y - 20, false, 160, 40);
          k.text(ctx, k.L('👆 拖拉磁鐵去碰碰看', '👆 Drag the magnet over the things'), W / 2, 22, { color: c.ink, size: 17, align: 'center' });
          const names = m.OBJ.filter((o) => found.has(o.id)).map((o) => k.L(o.zh, o.en));
          const not = m.OBJ.filter((o) => touched.has(o.id) && !o.mag).map((o) => k.L(o.zh, o.en));
          ro.set(k.L(`🧲 被吸住：<b>${names.join('、') || '還沒有'}</b><br>🚫 不會被吸：<b>${not.join('、') || '—'}</b>`, `🧲 Stuck: <b>${names.join(', ') || 'nothing yet'}</b><br>🚫 Not stuck: <b>${not.join(', ') || '—'}</b>`) +
            `<div class="muted">${k.L('碰過所有東西，想想被吸住的是用什麼做的？', 'Try every object — what are the stuck ones made of?')}</div>`);
        }
      });
    },
    observe: [
      { try: T('把右邊的磁鐵慢慢拖近左邊的磁鐵（N 對 S）。', 'Slowly drag the right magnet toward the left one (N facing S).'),
        ask: T('N 極和 S 極靠近時會怎樣？', 'What happens when N and S come close?'),
        options: [T('互相吸在一起', 'They pull together'), T('互相推開', 'They push apart'), T('什麼都不會發生', 'Nothing happens')],
        why: T('不同的極（N 和 S）會互相吸引。', 'Different poles (N and S) attract each other.') },
      { try: T('按「翻轉右邊磁鐵」，讓 N 極對 N 極，再拖近一點。', 'Press “Flip the right magnet” so N faces N, then drag it close.'),
        ask: T('相同的極靠近時會怎樣？', 'What happens when the same poles meet?'),
        options: [T('互相推開', 'They push apart'), T('互相吸在一起', 'They pull together'), T('變得沒有磁力', 'They stop being magnets')],
        why: T('相同的極（N 和 N、S 和 S）會互相排斥，所以磁鐵被推開。', 'The same poles (N–N or S–S) repel, so the magnet gets pushed away.') },
      { try: T('換到「測試物品」，拿磁鐵碰每一樣東西。', 'Switch to “Test objects” and touch the magnet to every object.'),
        ask: T('被磁鐵吸住的東西有什麼共同點？', 'What do the things that stick have in common?'),
        options: [T('都是用鐵做的', 'They are made of iron'), T('只要是金屬都會被吸（包括鋁和銅）', 'Any metal sticks, including aluminum and copper'), T('都是比較重的東西', 'They are the heaviest things')],
        why: T('磁鐵會吸鐵做的東西（迴紋針、鐵螺絲、別針）。鋁罐和銅片也是金屬，卻不會被吸住；木頭、塑膠、橡膠也不會。', 'Magnets attract things made of iron (paper clips, iron screws, pins). The aluminum can and copper disk are metal too, but they do not stick — and neither do wood, plastic or rubber.') },
      { try: T('在「兩塊磁鐵」裡，把磁鐵放遠一點，再放近一點，看箭頭的大小。', 'In “Two magnets”, put the magnets far apart, then close. Watch the arrows.'),
        ask: T('磁鐵離得愈近，力量會…', 'The closer the magnets are, the force is…'),
        options: [T('愈大', 'stronger'), T('愈小', 'weaker'), T('一樣', 'the same')],
        why: T('磁力在近的時候比較強，離遠了就變弱，所以近的時候箭頭比較長。', 'Magnetic force is stronger up close and weaker far away — that is why the arrows grow when the magnets are near.') },
    ],
  },
  {
    id: 'float-sink', grades: [1, 2], subj: 'phys', icon: '🛁',
    name: T('浮浮沉沉', 'Float or sink?'),
    intro: T('先猜猜看：這個東西放進水裡會浮起來還是沉下去？選好你的猜測，再點一下架子上的東西把它丟進水裡。也可以在水裡加很多鹽，看看雞蛋會怎樣。',
      'Make a guess first: will it float or sink? Choose your guess, then tap an object on the shelf to drop it in the water. You can also stir lots of salt into the water and see what happens to the egg.'),
    cur: { tw: T('國小低年級 生活課程 沉與浮', 'Lower elementary (Life Curriculum) · floating and sinking'), us: 'NGSS 2-PS1-2' },
    model: floating,
    checks(m, ok) {
      const by = (id) => m.OBJ.find((o) => o.id === id).rho;
      ok(m.floats(by('wood'), m.WATER) && m.floats(by('apple'), m.WATER) && m.floats(by('ice'), m.WATER), 'wood, apple, ice float');
      ok(!m.floats(by('rock'), m.WATER) && !m.floats(by('coin'), m.WATER) && !m.floats(by('key'), m.WATER), 'rock, coin, key sink');
      ok(!m.floats(by('egg'), m.WATER) && m.floats(by('egg'), m.SALTY), 'egg sinks in fresh water, floats in very salty water');
      ok(Math.abs(m.under(0.92, 1) - 0.92) < 1e-9, 'ice floats with about 9/10 under water');
      ok(m.under(5, 1) === 1, 'sinking objects are fully under water');
    },
    mount(k) {
      const m = floating, v = k.canvas(640, 380), { ctx, W, H } = v;
      let guess = 'float', salty = false, items = [], score = [0, 0];
      const tank = { x: 250, y: 110, w: 375, h: 250 }, surf = tank.y + 50;
      k.seg({ label: T('我猜它會…', 'My guess:'), value: 'float', options: [{ v: 'float', label: T('⬆️ 浮', '⬆️ Float') }, { v: 'sink', label: T('⬇️ 沉', '⬇️ Sink') }], onChange: (x) => (guess = x) });
      k.toggle({ label: T('在水裡加很多鹽 🧂', 'Stir lots of salt into the water 🧂'), value: false, onChange: (x) => (salty = x) });
      k.buttons([{ label: T('↺ 把東西拿出來', '↺ Take everything out'), on: () => { items = []; score = [0, 0]; } }]);
      const ro = k.readout();
      const shelf = m.OBJ.map((o, i) => ({ o, x: 47 + (i % 3) * 73, y: 140 + Math.floor(i / 3) * 82 }));
      k.pointer(v.cv, {
        down(p) {
          const s = shelf.find((s) => Math.hypot(p.x - s.x, p.y - s.y) < 34);
          if (!s || items.some((it) => it.o.id === s.o.id)) return;
          const fl = m.floats(s.o.rho, salty ? m.SALTY : m.WATER), right = (guess === 'float') === fl;
          score[1]++; if (right) score[0]++;
          const n = items.length;
          items.push({ o: s.o, x: tank.x + 36 + ((n * 61) % (tank.w - 70)), y: tank.y - 40, vy: 0, right });
        },
      });
      k.loop((dt) => {
        const c = k.colors(), liq = salty ? m.SALTY : m.WATER;
        ctx.clearRect(0, 0, W, H);
        k.rrect(ctx, 8, 100, 225, 270, 14, c.soft);
        k.text(ctx, k.L('👆 點一下，丟進水裡', '👆 Tap to drop it in'), 120, 84, { color: c.ink, size: 16, align: 'center' });
        for (const s of shelf) { const used = items.some((it) => it.o.id === s.o.id); ctx.globalAlpha = used ? 0.25 : 1; emo(k, ctx, s.o.e, s.x, s.y, 42); k.text(ctx, k.L(s.o.zh, s.o.en), s.x, s.y + 32, { color: c.ink, size: 13, align: 'center' }); ctx.globalAlpha = 1; }
        ctx.fillStyle = salty ? 'rgba(120,185,235,0.6)' : 'rgba(90,170,240,0.45)'; ctx.fillRect(tank.x, surf, tank.w, tank.y + tank.h - surf);
        k.line(ctx, tank.x, surf, tank.x + tank.w, surf, '#2f7de1', 2);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tank.x, tank.y - 10); ctx.lineTo(tank.x, tank.y + tank.h); ctx.lineTo(tank.x + tank.w, tank.y + tank.h); ctx.lineTo(tank.x + tank.w, tank.y - 10); ctx.stroke();
        if (salty) for (let i = 0; i < 30; i++) k.circle(ctx, tank.x + 10 + ((i * 97) % (tank.w - 20)), surf + 15 + ((i * 53) % (tank.h - 70)), 1.6, '#ffffff');
        const size = 44;
        for (const it of items) {
          const fl = m.floats(it.o.rho, liq);
          const target = fl ? surf - size / 2 + size * m.under(it.o.rho, liq) : tank.y + tank.h - size / 2 - 2;
          const inWater = it.y + size / 2 > surf;
          it.vy += ((target - it.y) * (inWater ? 30 : 0) + (inWater ? 0 : 900)) * dt; if (inWater) it.vy *= 0.9; it.y += it.vy * dt;
          if (it.y > tank.y + tank.h - size / 2 - 2) { it.y = tank.y + tank.h - size / 2 - 2; it.vy = 0; }
          emo(k, ctx, it.o.e, it.x, it.y, size);
          k.text(ctx, it.right ? '✔' : '✘', it.x + 24, it.y - 24, { color: it.right ? c.ok : c.no, size: 20, bold: true });
        }
        k.text(ctx, k.L(salty ? '很鹹的鹽水' : '清水', salty ? 'very salty water' : 'fresh water'), tank.x + tank.w - 10, tank.y + tank.h - 16, { color: '#174f8f', size: 16, align: 'right', bold: true });
        const fl = items.filter((it) => m.floats(it.o.rho, liq)).map((it) => k.L(it.o.zh, it.o.en)), sk = items.filter((it) => !m.floats(it.o.rho, liq)).map((it) => k.L(it.o.zh, it.o.en));
        ro.set(`<div>⬆️ ${k.L('浮', 'Float')}：<b>${fl.join(k.L('、', ', ')) || '—'}</b></div><div>⬇️ ${k.L('沉', 'Sink')}：<b>${sk.join(k.L('、', ', ')) || '—'}</b></div>
          <div class="muted">${k.L(`猜對 ${score[0]} / ${score[1]} 次`, `Guessed right ${score[0]} / ${score[1]} times`)}</div>`);
      });
    },
    observe: [
      { try: T('把木塊和石頭都丟進清水裡。', 'Drop the wood and the rock into fresh water.'),
        ask: T('哪一個浮起來？', 'Which one floats?'),
        options: [T('木塊', 'The wood'), T('石頭', 'The rock'), T('兩個都浮', 'Both float')],
        why: T('木頭比同樣大小的水輕，所以浮起來；石頭比同樣大小的水重，所以沉下去。', 'Wood is lighter than the same amount of water, so it floats. A rock is heavier than the same amount of water, so it sinks.') },
      { try: T('把小小的硬幣和大大的充氣球都丟進水裡。', 'Drop the small coin and the big ball in the water.'),
        ask: T('是不是「小的東西就會浮」？', 'Do small things always float?'),
        options: [T('不是，小硬幣沉下去，大球反而浮起來', 'No — the small coin sinks and the big ball floats'), T('是，小東西都會浮', 'Yes, small things always float'), T('是，大東西都會沉', 'Yes, big things always sink')],
        why: T('浮或沉不是看大小，而是看東西和同樣大小的水比起來，是輕還是重。球裡面都是空氣，所以很輕。', 'Floating does not depend on size. It depends on whether the object is lighter or heavier than the same amount of water. The ball is full of air, so it is very light for its size.') },
      { try: T('把雞蛋丟進清水，再打開「加很多鹽」。', 'Drop the egg in fresh water, then turn on “lots of salt”.'),
        ask: T('加了很多鹽以後，雞蛋…', 'After adding lots of salt, the egg…'),
        options: [T('浮起來了', 'floats up'), T('還是沉在底下', 'stays on the bottom'), T('變小了', 'gets smaller')],
        why: T('很鹹的鹽水比清水「重」，往上托的力量比較大，所以雞蛋在很鹹的水裡會浮起來。', 'Very salty water is heavier than fresh water and pushes up harder, so the egg floats in it.') },
      { try: T('丟一個冰塊進水裡，仔細看它浮在哪裡。', 'Drop the ice in and look closely at how it floats.'),
        ask: T('冰塊浮著的時候…', 'When the ice floats…'),
        options: [T('大部分泡在水面下', 'most of it is under the water'), T('整個在水面上', 'all of it is above the water'), T('沉到底', 'it sinks to the bottom')],
        why: T('冰只比水輕一點點，所以大約十分之九都在水面下，只有一小部分露出來——冰山也是這樣！', 'Ice is only a little lighter than water, so about nine tenths of it stays under the surface. Icebergs float the same way!') },
    ],
  },
  {
    id: 'shadows', grades: [1, 2], subj: 'earth', icon: '🌞',
    name: T('影子與太陽', 'Shadows and the Sun'),
    intro: T('太陽早上從東邊升起，傍晚從西邊落下。拖動時間，看看太陽的位置和小樹影子的長短、方向怎麼變。換成冬天，比比看中午的影子。',
      'The Sun rises in the east in the morning and sets in the west in the evening. Move the time and watch how the Sun moves and how the tree’s shadow changes length and direction. Switch to winter and compare the noon shadow.'),
    cur: { tw: T('國小低年級 生活課程 光與影', 'Lower elementary (Life Curriculum) · light and shadows'), us: 'NGSS 1-ESS1-1' },
    model: shadows,
    checks(m, ok) {
      const s = m.NOON.summer, w = m.NOON.winter;
      ok(m.length(1, m.altitude(12, s)) < m.length(1, m.altitude(9, s)) && m.length(1, m.altitude(12, s)) < m.length(1, m.altitude(16, s)), 'noon shadow is the shortest');
      ok(m.length(1, m.altitude(7, s)) > 2, 'early morning shadow is long');
      ok(m.length(1, m.altitude(12, w)) > m.length(1, m.altitude(12, s)), 'winter noon shadow longer than summer');
      ok(m.side(9) === 1 && m.side(15) === -1, 'morning shadow points west, afternoon east');
      ok(Math.abs(m.length(1, 45) - 1) < 1e-9, 'Sun at 45° → shadow as long as the stick');
    },
    mount(k) {
      const m = shadows, v = k.canvas(640, 360), { ctx, W, H } = v;
      let hr = 9, season = 'summer', play = false;
      const sl = k.slider({ label: T('時間', 'Time'), min: 6.5, max: 17.5, step: 0.25, value: hr, unit: T('點', 'h'), dp: 2, onInput: (x) => (hr = x) });
      k.seg({ label: T('季節', 'Season'), value: 'summer', options: [{ v: 'summer', label: T('☀️ 夏天', '☀️ Summer') }, { v: 'winter', label: T('❄️ 冬天', '❄️ Winter') }], onChange: (x) => (season = x) });
      const b = k.buttons([{ label: T('▶ 讓太陽走', '▶ Run the day'), primary: true, on: () => { play = !play; if (play && hr >= 17.5) sl.set(6.5); } }]);
      const ro = k.readout();
      const gy = 290, tx = 320, treeH = 90;
      k.loop((dt) => {
        if (play) { hr += dt * 1.2; if (hr >= 17.5) { hr = 17.5; play = false; } sl.set(+hr.toFixed(2)); }
        b.firstChild.textContent = play ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 讓太陽走', '▶ Run the day');
        const alt = m.altitude(hr, m.NOON[season]);
        const sky = ctx.createLinearGradient(0, 0, 0, gy), day = Math.min(1, alt / 25);
        sky.addColorStop(0, `rgb(${70 + 80 * day},${120 + 90 * day},${190 + 50 * day})`); sky.addColorStop(1, `rgb(${240 - 30 * day},${200 + 30 * day},${170 + 70 * day})`);
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, gy);
        ctx.fillStyle = season === 'winter' ? '#d9dfd2' : '#7cc46a'; ctx.fillRect(0, gy, W, H - gy);
        const a = (Math.PI * (hr - 6)) / 12, R = 270, sx = tx - R * Math.cos(a), sy = gy - 20 - (alt / 90) * 240;
        ctx.save(); ctx.globalAlpha = 0.35; ctx.setLineDash([4, 6]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
        for (let h = 6; h <= 18.001; h += 0.25) { const aa = (Math.PI * (h - 6)) / 12, y = gy - 20 - (m.altitude(h, m.NOON[season]) / 90) * 240; h === 6 ? ctx.moveTo(tx - R * Math.cos(aa), y) : ctx.lineTo(tx - R * Math.cos(aa), y); }
        ctx.stroke(); ctx.restore();
        for (let i = 0; i < 12; i++) { const an = (i / 12) * Math.PI * 2; k.line(ctx, sx + Math.cos(an) * 27, sy + Math.sin(an) * 27, sx + Math.cos(an) * 38, sy + Math.sin(an) * 38, '#ffb300', 3); }
        k.circle(ctx, sx, sy, 22, '#ffd23f', '#ffb300', 3);
        const len = Math.min(330, m.length(treeH, alt)), dir = sx < tx ? 1 : -1;
        ctx.fillStyle = 'rgba(30,40,40,0.45)'; ctx.beginPath(); ctx.ellipse(tx + (dir * len) / 2, gy + 4, Math.max(6, len / 2), 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a5a35'; ctx.fillRect(tx - 7, gy - treeH + 30, 14, treeH - 30);
        k.circle(ctx, tx, gy - treeH + 22, 30, season === 'winter' ? '#6f8f60' : '#2f9e44');
        k.text(ctx, k.L('東', 'East'), 20, gy + 32, { color: '#20402a', size: 19, bold: true });
        k.text(ctx, k.L('西', 'West'), W - 20, gy + 32, { color: '#20402a', size: 19, bold: true, align: 'right' });
        const hh = Math.floor(hr), mm = Math.round((hr - hh) * 60);
        k.rrect(ctx, 10, 10, 100, 34, 10, 'rgba(255,255,255,0.8)');
        k.text(ctx, `${hh}:${String(mm).padStart(2, '0')}`, 60, 28, { color: '#13202a', size: 21, bold: true, align: 'center' });
        const meters = m.length(1, alt);
        ro.set(k.L(`太陽在<b>${hr < 11.9 ? '東邊' : hr > 12.1 ? '西邊' : '最高的地方'}</b>，影子指向<b>${hr < 11.9 ? '西邊' : hr > 12.1 ? '東邊' : '樹的腳下'}</b>。<br>1 公尺高的棍子，影子大約 <b>${k.fmt(meters, 1)} 公尺</b>。`,
          `The Sun is in the <b>${hr < 11.9 ? 'east' : hr > 12.1 ? 'west' : 'highest part of the sky'}</b>; the shadow points <b>${hr < 11.9 ? 'west' : hr > 12.1 ? 'east' : 'down at the tree’s foot'}</b>.<br>A 1 m stick casts a shadow about <b>${k.fmt(meters, 1)} m</b> long.`));
      });
    },
    observe: [
      { try: T('把時間調到早上 8 點，看影子在樹的哪一邊。', 'Set the time to 8 o’clock in the morning. Which side of the tree is the shadow on?'),
        ask: T('早上的影子指向哪裡？', 'In the morning the shadow points…'),
        options: [T('西邊（和太陽相反的一邊）', 'west — away from the Sun'), T('東邊（和太陽同一邊）', 'east — toward the Sun'), T('沒有影子', 'there is no shadow')],
        why: T('影子總是在物體背對太陽的那一邊。早上太陽在東邊，所以影子指向西邊。', 'A shadow is always on the side away from the light. In the morning the Sun is in the east, so the shadow points west.') },
      { try: T('按「讓太陽走」，看一整天影子的長短。', 'Press “Run the day” and watch the shadow’s length all day.'),
        ask: T('什麼時候影子最短？', 'When is the shadow shortest?'),
        options: [T('中午', 'Around noon'), T('早上', 'Early morning'), T('傍晚', 'Late afternoon')],
        why: T('中午太陽最高，光從上面照下來，影子最短；早上和傍晚太陽低，影子拉得很長。', 'At noon the Sun is highest, shining from above, so the shadow is shortest. When the Sun is low in the morning and evening, shadows stretch out long.') },
      { try: T('時間調到中午 12 點，比較「夏天」和「冬天」。', 'Set the time to 12 noon and compare summer and winter.'),
        ask: T('冬天中午的影子比夏天…', 'At noon in winter the shadow is…'),
        options: [T('長', 'longer than in summer'), T('短', 'shorter than in summer'), T('一樣長', 'the same as in summer')],
        why: T('冬天中午的太陽比夏天低，光斜斜地照過來，所以影子比較長。', 'The winter Sun is lower at noon than the summer Sun. Its light comes in at a slant, so the shadow is longer.') },
    ],
  },
  {
    id: 'water-states', grades: [1, 2], subj: 'chem', icon: '🧊',
    name: T('冰、水、水蒸氣', 'Ice, water and steam'),
    intro: T('水有三種樣子：冰（固體）、水（液體）、水蒸氣（氣體）。用火加熱或放進冷凍庫冷卻，看溫度計和鍋子裡的變化。打開「放大看粒子」，看看水的小粒子在做什麼。',
      'Water comes in three forms: ice (solid), water (liquid) and steam (gas). Heat it on the stove or cool it in the freezer and watch the thermometer and the pot. Turn on “Zoom in on particles” to see what the tiny bits of water are doing.'),
    cur: { tw: T('國小低年級 生活課程 水的三態', 'Lower elementary (Life Curriculum) · states of water'), us: 'NGSS 2-PS1-4' },
    model: water,
    checks(m, ok) {
      ok(m.state(0).T === -20 && m.state(0).ice === 1, 'starts as ice at −20 °C');
      const mid = m.state((m.E_MELT0 + m.E_MELT1) / 2);
      ok(mid.T === 0 && Math.abs(mid.ice - 0.5) < 1e-9, 'melting happens at 0 °C');
      const boil = m.state((m.E_BOIL0 + m.E_BOIL1) / 2);
      ok(boil.T === 100 && boil.gas > 0 && boil.liq > 0, 'boiling happens at 100 °C');
      let last = -999, mono = true; for (let E = 0; E < m.E_BOIL1 + 200; E += 5) { const T2 = m.state(E).T; if (T2 < last - 1e-9) mono = false; last = T2; }
      ok(mono, 'temperature never drops while heating');
      ok(Math.abs(m.E_MELT1 - m.E_MELT0 - 334) < 1e-9 && Math.abs(m.state(m.E_MELT1 + 418).T - 100) < 1e-9, '334 J melts 1 g of ice; 418 J warms 1 g of water by 100 °C');
    },
    mount(k) {
      const m = water, v = k.canvas(640, 380), { ctx, W, H } = v;
      let E = 0, power = 0, parts = false, hist = [], t = 0;
      const sl = k.slider({ label: T('❄️ 冷卻 ← → 加熱 🔥', '❄️ Cool ← → Heat 🔥'), min: -3, max: 3, step: 1, value: 0, onInput: (x) => (power = x) });
      k.buttons([{ label: T('🔥 開大火', '🔥 Full heat'), primary: true, on: () => sl.set(3) }, { label: T('❄️ 冷凍庫', '❄️ Freezer'), on: () => sl.set(-3) }, { label: T('⏹ 停', '⏹ Stop'), on: () => sl.set(0) }]);
      k.toggle({ label: T('🔍 放大看粒子', '🔍 Zoom in on particles'), value: false, onChange: (x) => (parts = x) });
      const ro = k.readout();
      const P = Array.from({ length: 36 }, (_, i) => ({ gx: i % 6, gy: Math.floor(i / 6), x: 450, y: 150, vx: Math.cos(i * 2.4) * 40, vy: Math.sin(i * 2.4) * 40 }));
      k.loop((dt) => {
        t += dt;
        E = Math.max(0, Math.min(m.E_BOIL1 + 60, E + power * 40 * dt));
        const s = m.state(E);
        hist.push([t, s.T]); if (hist.length > 2000) hist.shift();
        const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        const px = 60, py = 170, pw = 180, ph = 120;
        if (power > 0) for (let i = 0; i < 7; i++) { const fx = px + 15 + i * 25, fh = 14 + power * 6 + Math.sin(t * 12 + i) * 5; ctx.fillStyle = i % 2 ? '#ff7a1a' : '#ffc23f'; ctx.beginPath(); ctx.moveTo(fx - 8, py + ph + 24); ctx.quadraticCurveTo(fx, py + ph + 24 - fh * 2, fx + 8, py + ph + 24); ctx.fill(); }
        if (power < 0) { k.rrect(ctx, px - 30, 30, pw + 60, 320, 16, c.dark ? 'rgba(127,182,230,0.12)' : 'rgba(127,182,230,0.18)', '#7fb6e6', 3); emo(k, ctx, '❄️', px - 10, 52, 22); emo(k, ctx, '❄️', px + pw + 10, 52, 22); }
        k.rrect(ctx, px - 10, py + ph + 24, pw + 20, 14, 4, '#555');
        const inner = s.liq + s.ice, liqH = (ph - 20) * inner, wl = liqH * (s.liq / Math.max(1e-6, inner));
        ctx.fillStyle = 'rgba(80,160,235,0.6)'; ctx.fillRect(px, py + ph - wl, pw, wl);
        const iceN = Math.round(s.ice * 10);
        for (let i = 0; i < iceN; i++) k.rrect(ctx, px + 8 + (i % 5) * 34, py + ph - 34 - Math.floor(i / 5) * 30, 30, 28, 5, 'rgba(215,242,255,0.95)', '#8fc3e8', 2);
        if (s.T >= 100 && s.liq > 0) for (let i = 0; i < 10; i++) k.circle(ctx, px + 15 + ((i * 41 + t * 60) % (pw - 30)), py + ph - ((t * 90 + i * 37) % Math.max(10, wl)), 4, null, '#e9f6ff', 2);
        if (s.T >= 100) for (let i = 0; i < 6; i++) { const yy = py - 10 - ((t * 40 + i * 30) % 120); ctx.globalAlpha = Math.max(0, 0.7 - (py - yy) / 180); k.circle(ctx, px + 30 + i * 25 + Math.sin(t * 2 + i) * 10, yy, 14, '#ffffff', '#b9c9d2'); ctx.globalAlpha = 1; }
        ctx.strokeStyle = c.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + ph); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px + pw, py); ctx.stroke();
        // thermometer
        const thx = 290, thy = 50, thh = 250, tmin = -20, tmax = 120, ty = (T) => thy + thh - ((T - tmin) / (tmax - tmin)) * thh;
        k.rrect(ctx, thx - 9, thy - 10, 18, thh + 20, 9, c.card, c.ink, 2); k.circle(ctx, thx, thy + thh + 22, 15, '#e5484d', c.ink, 2);
        ctx.fillStyle = '#e5484d'; ctx.fillRect(thx - 4, ty(Math.min(tmax, s.T)), 8, thy + thh + 12 - ty(Math.min(tmax, s.T)));
        for (const T2 of [-20, 0, 20, 40, 60, 80, 100, 120]) { k.line(ctx, thx + 9, ty(T2), thx + 17, ty(T2), c.ink, 1.5); k.text(ctx, String(T2), thx + 21, ty(T2), { color: T2 === 0 || T2 === 100 ? c.acc : c.muted, size: 14, bold: T2 === 0 || T2 === 100 }); }
        k.text(ctx, '°C', thx, thy - 22, { color: c.ink, size: 15, align: 'center', bold: true });
        const bx = 370, by = 30, bw = 260, bh = 270;
        if (parts) {
          k.rrect(ctx, bx, by, bw, bh, 12, c.soft);
          const speed = 15 + Math.max(0, s.T + 20) * 1.6;
          P.forEach((p, i) => {
            const isIce = i / P.length < s.ice, isGas = i / P.length >= 1 - s.gas - 1e-9 && s.gas > 0;
            if (isIce) { p.x = bx + 70 + p.gx * 22 + Math.sin(t * 20 + i) * 1.5; p.y = by + 125 + p.gy * 22 + Math.cos(t * 23 + i) * 1.5; }
            else {
              const sp = Math.hypot(p.vx, p.vy) || 1; p.vx *= speed / sp; p.vy *= speed / sp;
              p.x += p.vx * dt; p.y += p.vy * dt;
              const top = isGas ? by + 12 : by + 150;
              if (p.x < bx + 12 || p.x > bx + bw - 12) p.vx *= -1; if (p.y < top || p.y > by + bh - 12) p.vy *= -1;
              p.x = Math.max(bx + 12, Math.min(bx + bw - 12, p.x)); p.y = Math.max(top, Math.min(by + bh - 12, p.y));
            }
            k.circle(ctx, p.x, p.y, 8, isIce ? '#a6d8f7' : isGas ? '#e3ecf1' : '#3b8fe0', c.ink, 1);
          });
          k.text(ctx, k.L('水的小粒子', 'Water particles'), bx + bw / 2, by + bh + 18, { color: c.ink, size: 15, align: 'center' });
        } else {
          const mp = k.axes(ctx, { x: bx + 30, y: by + 20, w: bw - 40, h: bh - 40 }, { xmin: Math.max(0, t - 40), xmax: Math.max(40, t), ymin: -20, ymax: 120, c, xdp: 0, ydp: 0, xlabel: k.L('時間（秒）', 'time (s)'), ylabel: k.L('溫度 °C', 'temperature °C') });
          k.plotLine(ctx, mp, hist.filter(([x]) => x >= t - 40), c.no, 3);
        }
        const name = s.T > 100 ? k.L('全部變成水蒸氣（氣體）', 'all steam (gas)') : s.T >= 100 && s.gas > 0 ? k.L('沸騰中：水正在變成水蒸氣', 'boiling: water is turning into steam') : s.ice > 0 && s.liq > 0 ? k.L('冰水混合：冰正在融化（或水正在結冰）', 'ice and water: melting (or freezing)') : s.ice > 0 ? k.L('冰（固體）', 'ice (solid)') : k.L('水（液體）', 'water (liquid)');
        ro.set(`${k.L('溫度', 'Temperature')} <b>${k.fmt(s.T, 0)} °C</b><br>${k.L('現在是', 'Now')}: <b>${name}</b>`);
      });
    },
    observe: [
      { try: T('按「開大火」，看冰融化的時候溫度計停在幾度。', 'Press “Full heat”. While the ice melts, what does the thermometer show?'),
        ask: T('冰在融化時，溫度是…', 'While ice is melting, the temperature is…'),
        options: [T('停在 0 °C', 'stuck at 0 °C'), T('一直往上升', 'going up the whole time'), T('停在 100 °C', 'stuck at 100 °C')],
        why: T('冰在 0 °C 融化。火的熱都用來把冰變成水，所以冰還沒全部融化前，溫度會停在 0 °C。', 'Ice melts at 0 °C. All the heat goes into turning ice into water, so the temperature stays at 0 °C until the ice is gone.') },
      { try: T('繼續加熱，直到鍋子裡的水冒泡泡。', 'Keep heating until the water bubbles.'),
        ask: T('水沸騰時溫度大約是幾度？', 'About what temperature does water boil at?'),
        options: ['100 °C', '50 °C', '0 °C'],
        why: T('在平地，水在大約 100 °C 沸騰，水變成看不見的水蒸氣跑到空氣中，所以鍋子裡的水會變少。', 'At sea level water boils at about 100 °C. It turns into invisible steam that goes into the air, so the water in the pot goes down.') },
      { try: T('打開「放大看粒子」，比較冰、水和水蒸氣的粒子。', 'Turn on “Zoom in on particles” and compare ice, water and steam.'),
        ask: T('水蒸氣的粒子…', 'In steam, the particles…'),
        options: [T('跑得最快，也離得最遠', 'move fastest and are farthest apart'), T('排得整整齊齊不太動', 'sit in neat rows and barely move'), T('完全停住不動', 'stop moving completely')],
        why: T('冰的粒子排好隊只能在原地抖動；水的粒子靠在一起到處滑動；水蒸氣的粒子跑得很快，散得很開。', 'In ice the particles stay in rows and just jiggle. In water they slide around close together. In steam they zoom around far apart.') },
      { try: T('把水放進冷凍庫，一直冷卻。', 'Put the water in the freezer and keep cooling it.'),
        ask: T('水冷到 0 °C 會…', 'When water is cooled to 0 °C it…'),
        options: [T('開始結成冰', 'starts freezing into ice'), T('變成水蒸氣', 'turns into steam'), T('消失不見', 'disappears')],
        why: T('冷卻時水在 0 °C 結冰，冰再加熱又會變回水——水的三態可以互相變來變去。', 'When cooled, water freezes into ice at 0 °C, and heating the ice turns it back into water. Water can change back and forth between its forms.') },
    ],
  },
  {
    id: 'plant-needs', grades: [1, 2], subj: 'bio', icon: '🌱',
    name: T('植物需要什麼？', 'What do plants need?'),
    intro: T('左邊的綠豆什麼都有：水、陽光、空氣和土。右邊的綠豆由你決定：拿走水或陽光，按「過一天」或「播放」，看看兩盆有什麼不一樣。',
      'The bean on the left gets everything: water, sunlight, air and soil. You decide for the bean on the right: take away water or sunlight, then press “Next day” or “Play” and compare the two pots.'),
    cur: { tw: T('國小低年級 生活課程 植物的生長', 'Lower elementary (Life Curriculum) · how plants grow'), us: 'NGSS 2-LS2-1' },
    model: plants,
    checks(m, ok) {
      const full = m.grow(14, { water: true, light: true }), dry = m.grow(14, { water: false, light: true }), dark = m.grow(14, { water: true, light: false });
      ok(full.alive && full.h > 15 && full.green === 1, 'a plant with water and light grows tall and green');
      ok(!dry.alive && dry.h < full.h, 'no water → the plant dries out');
      ok(dark.green < 0.5 && dark.h < full.h, 'no light → pale yellow and weak');
      ok(!m.grow(20, { water: true, light: false }).alive, 'without light the seed’s stored food runs out');
      ok(m.grow(2, { water: true, light: true }).h === 0, 'the bean takes a couple of days to sprout');
    },
    mount(k) {
      const m = plants, v = k.canvas(640, 380), { ctx, W, H } = v;
      let day = 0, wt = true, light = true, play = false, acc = 0;
      k.toggle({ label: T('💧 右邊的豆子有澆水', '💧 Right bean gets water'), value: true, onChange: (x) => { wt = x; } });
      k.toggle({ label: T('☀️ 右邊的豆子有陽光', '☀️ Right bean gets sunlight'), value: true, onChange: (x) => { light = x; } });
      const b = k.buttons([{ label: T('▶ 播放', '▶ Play'), primary: true, on: () => { play = !play; if (day >= 14) day = 0; } }, { label: T('＋1 過一天', '+1 Next day'), on: () => { if (day < 14) day++; } }, { label: T('↺ 重新種', '↺ Plant again'), on: () => { day = 0; play = false; } }]);
      const ro = k.readout();
      const leafCol = (st) => (st.alive ? `rgb(${Math.round(215 - 165 * st.green)},${Math.round(165 + 35 * st.green)},${Math.round(70 - 30 * st.green)})` : '#a08550');
      const drawPlant = (x, st, label, hasLight, hasWater) => {
        const c = k.colors(), gy = 300;
        if (!hasLight) { ctx.fillStyle = 'rgba(30,30,50,0.55)'; ctx.fillRect(x - 135, 40, 270, 270); k.text(ctx, k.L('🌑 黑暗的箱子', '🌑 Dark box'), x, 60, { color: '#fff', size: 16, align: 'center', bold: true }); }
        ctx.fillStyle = '#c0703a'; ctx.beginPath(); ctx.moveTo(x - 55, gy); ctx.lineTo(x + 55, gy); ctx.lineTo(x + 42, gy + 50); ctx.lineTo(x - 42, gy + 50); ctx.fill();
        ctx.fillStyle = hasWater ? '#5a3a22' : '#b39368'; ctx.fillRect(x - 55, gy - 8, 110, 10);
        if (st.h > 0) {
          const hp = Math.min(230, st.h * 9), droop = st.alive ? (1 - st.water) * 0.8 : 1.1;
          ctx.strokeStyle = leafCol(st); ctx.lineWidth = st.green > 0.6 ? 6 : 3; ctx.lineCap = 'round';
          const tx2 = x + Math.sin(droop) * hp * 0.5, ty2 = gy - 6 - Math.cos(droop) * hp;
          ctx.beginPath(); ctx.moveTo(x, gy - 6); ctx.quadraticCurveTo(x, gy - hp * 0.6, tx2, ty2); ctx.stroke();
          for (let i = 0; i < st.leaves; i++) {
            const f = (i + 1) / (st.leaves + 1), lx = x + (tx2 - x) * f * f, ly = gy - 6 - (gy - 6 - ty2) * f, side = i % 2 ? 1 : -1;
            ctx.save(); ctx.translate(lx, ly); ctx.rotate(side * (0.5 + droop * 0.8)); ctx.fillStyle = leafCol(st);
            ctx.beginPath(); ctx.ellipse(side * 17, 0, 18, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          }
        } else k.circle(ctx, x, gy - 6, 8, '#7ea95b');
        k.text(ctx, label, x, gy + 68, { color: c.ink, size: 17, align: 'center', bold: true });
        if (!st.alive) k.text(ctx, k.L('枯死了', 'It died'), x, gy - 34, { color: c.no, size: 19, align: 'center', bold: true });
      };
      k.loop((dt) => {
        if (play) { acc += dt; if (acc > 0.6) { acc = 0; day++; if (day >= 14) { day = 14; play = false; } } }
        b.firstChild.textContent = play ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 播放', '▶ Play');
        const c = k.colors();
        ctx.clearRect(0, 0, W, H);
        emo(k, ctx, '☀️', 34, 30, 34);
        k.text(ctx, k.L(`第 ${day} 天`, `Day ${day}`), W / 2, 22, { color: c.ink, size: 22, bold: true, align: 'center' });
        const a = m.grow(day, { water: true, light: true }), bb = m.grow(day, { water: wt, light });
        drawPlant(165, a, k.L('什麼都有', 'Has everything'), true, true);
        drawPlant(475, bb, k.L('你的豆子', 'Your bean'), light, wt);
        if (!wt) k.text(ctx, k.L('🚫 沒有澆水', '🚫 No water'), 475, 90, { color: c.no, size: 16, align: 'center', bold: true });
        ro.set(k.L(`左邊高 <b>${k.fmt(a.h, 1)} 公分</b>，右邊高 <b>${k.fmt(bb.h, 1)} 公分</b>。<br>右邊的豆子：<b>${!bb.alive ? '枯死了' : bb.h === 0 ? '還沒發芽' : bb.green > 0.7 ? '綠油油' : '黃黃的、很虛弱'}</b>`,
          `Left: <b>${k.fmt(a.h, 1)} cm</b> tall, right: <b>${k.fmt(bb.h, 1)} cm</b> tall.<br>Right bean: <b>${!bb.alive ? 'died' : bb.h === 0 ? 'not sprouted yet' : bb.green > 0.7 ? 'nice and green' : 'yellow and weak'}</b>`));
      });
    },
    observe: [
      { try: T('關掉右邊的「澆水」，播放 14 天。', 'Turn off water for the right bean and play 14 days.'),
        ask: T('沒有水的豆子會怎樣？', 'What happens to the bean with no water?'),
        options: [T('乾掉、枯死', 'It dries up and dies'), T('長得更高', 'It grows taller'), T('和左邊一樣', 'It looks the same as the left one')],
        why: T('植物需要水才能活。沒有水，豆子沒辦法發芽長大，很快就乾枯了。', 'Plants need water to live. Without water the bean cannot grow and soon dries up.') },
      { try: T('把水打開、關掉右邊的「陽光」，再播放。', 'Turn water back on, turn sunlight off for the right bean, and play.'),
        ask: T('放在黑暗箱子裡的豆子，葉子是什麼顏色？', 'What color are the leaves of the bean in the dark box?'),
        options: [T('黃黃白白的', 'Pale yellow'), T('綠油油的', 'Bright green'), T('紅色的', 'Red')],
        why: T('植物要曬太陽才能製造養分、長出綠色的葉子。在黑暗中，豆芽只能用種子裡存的養分，長得又黃又細，養分用完就會死掉。', 'Plants need sunlight to make their food and stay green. In the dark the sprout only uses the food stored in the seed, so it grows pale and thin — and dies when that food runs out.') },
      { try: T('水和陽光都打開，按「重新種」，播放看看。', 'Turn on both water and sunlight, press “Plant again”, and play.'),
        ask: T('兩盆豆子都有水和陽光時…', 'When both beans get water and sunlight…'),
        options: [T('兩盆長得一樣好', 'Both grow equally well'), T('右邊的會枯死', 'The right one dies'), T('兩盆都不會發芽', 'Neither one sprouts')],
        why: T('植物生長需要水、陽光、空氣和土壤裡的養分。兩盆條件一樣，長得也就一樣——這就是「公平的比較」。', 'Plants need water, sunlight, air and nutrients from the soil. When both pots get the same things, they grow the same — that is a fair test.') },
    ],
  },
];

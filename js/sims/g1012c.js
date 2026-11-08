// Simulations for grades 10–12, chemistry & biology (高中 化學・生物). Format: see SPEC.md.
import { T } from '../util.js';

// ---------------- natural selection ----------------
const sel = {
  // dark allele D is dominant (as in the peppered moth). p = frequency of D. Fitness by look: wDark, wLight.
  hw: (p) => ({ DD: p * p, Dd: 2 * p * (1 - p), dd: (1 - p) ** 2 }),
  next(p, wDark, wLight) {
    const g = sel.hw(p), wbar = (g.DD + g.Dd) * wDark + g.dd * wLight;
    return (g.DD * wDark + 0.5 * g.Dd * wDark) / wbar;
  },
  // one generation with a finite population (random sampling of 2N alleles)
  nextSample(p, wDark, wLight, N, rnd) {
    const pe = sel.next(p, wDark, wLight); let c = 0;
    for (let i = 0; i < 2 * N; i++) if (rnd() < pe) c++;
    return c / (2 * N);
  },
  darkShare: (p) => 1 - (1 - p) ** 2,
};

// ---------------- titration ----------------
const Kw = 1e-14;
const titr = {
  Ka: 1.8e-5,
  // exact pH from the charge balance  [H⁺] + [Na⁺] = [OH⁻] + [A⁻]
  pH(kind, Ca, Va, Cb, Vb) {
    const V = Va + Vb, CA = (Ca * Va) / V, Na = (Cb * Vb) / V, Ka = titr.Ka;
    const f = (h) => h + Na - Kw / h - (kind === 'strong' ? CA : (CA * Ka) / (Ka + h));
    let lo = 1e-15, hi = 10;
    for (let i = 0; i < 200; i++) { const mid = Math.sqrt(lo * hi); if (f(mid) > 0) hi = mid; else lo = mid; }
    return -Math.log10(Math.sqrt(lo * hi));
  },
  veq: (Ca, Va, Cb) => (Ca * Va) / Cb,
};
const INDS = {
  phenol: { zh: '酚酞（8.2–10）', en: 'phenolphthalein (8.2–10)', col: (p) => (p < 8.2 ? 'rgba(235,240,245,0.5)' : p < 10 ? '#f48fcf' : '#d6249f') },
  mo: { zh: '甲基橙（3.1–4.4）', en: 'methyl orange (3.1–4.4)', col: (p) => (p < 3.1 ? '#e53935' : p < 4.4 ? '#fb8c00' : '#fdd835') },
  btb: { zh: '溴瑞香草酚藍（6.0–7.6）', en: 'bromothymol blue (6.0–7.6)', col: (p) => (p < 6 ? '#f2d43a' : p < 7.6 ? '#4caf50' : '#2f6fd6') },
};

// ---------------- equilibrium N2O4 ⇌ 2 NO2 ----------------
const RG = 8.314;
const eq = {
  dH: 57200,                          // J/mol, forward reaction is endothermic
  K298: 4.6e-3,                       // Kc in mol/L at 298 K
  K: (Tk) => eq.K298 * Math.exp((-eq.dH / RG) * (1 / Tk - 1 / 298)),
  // reverse rate constant (toy units so the animation takes seconds); a catalyst lowers both activation energies equally
  kr: (Tk, cat) => 20 * (cat ? 6 : 1) * Math.exp((-(cat ? 18000 : 30000) / RG) * (1 / Tk - 1 / 298)),
  step([A, B], Tk, cat, dt) {        // A = [N2O4], B = [NO2]
    const kr = eq.kr(Tk, cat), kf = eq.K(Tk) * kr;
    const n = 20, h = dt / n;
    for (let i = 0; i < n; i++) { const r = kf * A - kr * B * B; A = Math.max(0, A - r * h); B = Math.max(0, B + 2 * r * h); }
    return [A, B];
  },
  Q: ([A, B]) => (B * B) / A,
  settle(s, Tk, cat = false, t = 400) { for (let i = 0; i < t * 10; i++) s = eq.step(s, Tk, cat, 0.1); return s; },
};

// ---------------- DNA → protein ----------------
const BASES = 'UCAG';
const AA = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const CODON = {};
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k2 = 0; k2 < 4; k2++) CODON[BASES[i] + BASES[j] + BASES[k2]] = AA[i * 16 + j * 4 + k2];
const AANAME = { F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', C: 'Cys', W: 'Trp', P: 'Pro', H: 'His', Q: 'Gln', R: 'Arg', I: 'Ile', M: 'Met', T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp', E: 'Glu', G: 'Gly', '*': 'Stop' };
const AACOL = { F: '#7e57c2', L: '#5c6bc0', S: '#26a69a', Y: '#8d6e63', C: '#fdd835', W: '#6d4c41', P: '#ef6c00', H: '#29b6f6', Q: '#66bb6a', R: '#1e88e5', I: '#3949ab', M: '#43a047', T: '#00897b', N: '#9ccc65', K: '#1565c0', V: '#5e35b1', A: '#78909c', D: '#e53935', E: '#d81b60', G: '#9e9e9e', '*': '#212121' };
const dna = {
  CODON, AANAME,
  comp: (b) => ({ A: 'T', T: 'A', G: 'C', C: 'G' })[b],
  template: (coding) => [...coding].map(dna.comp).join(''),           // written 3'→5' under the coding strand
  mrna: (coding) => coding.replace(/T/g, 'U'),
  translate(mrna) {
    const start = mrna.indexOf('AUG'); if (start < 0) return [];
    const out = [];
    for (let i = start; i + 3 <= mrna.length; i += 3) { const a = CODON[mrna.slice(i, i + 3)]; out.push(a); if (a === '*') break; }
    return out;
  },
  classify(a, b) {
    if (a.length === b.length && a.every((x, i) => x === b[i])) return 'silent';
    const i = a.findIndex((x, j) => x !== b[j]);
    if (b[i] === '*' && a[i] !== '*') return 'nonsense';
    return a.length === b.length && a.filter((x, j) => x !== b[j]).length === 1 ? 'missense' : 'changed';
  },
};
const SEQS = [
  { zh: '範例基因', en: 'Example gene', s: 'ATGGAATTCCGTAAAGGCTGGTAA' },
  { zh: 'β-血紅素開頭（鐮刀型貧血位置）', en: 'β-globin start (sickle-cell site)', s: 'ATGGTGCACCTGACTCCTGAGGAGAAG' },
  { zh: '短基因', en: 'Short gene', s: 'ATGTGTCAGAGCCTTTGA' },
];

export default [
  {
    id: 'natural-selection', grades: [10, 12], subj: 'bio', icon: '🦋',
    name: T('天擇：樺尺蛾', 'Natural selection: the peppered moth'),
    intro: T('英國工業革命時，煤煙把樹幹燻黑，原本少見的黑色樺尺蛾變得很常見。黑色由顯性基因 D 決定。鳥比較容易吃掉和樹皮顏色不同的蛾。選擇樹皮顏色和天擇強度，一代一代看基因頻率怎麼改變。',
      'During Britain’s industrial revolution soot blackened tree trunks, and the once-rare black peppered moth became common. Black wings come from a dominant allele D. Birds more easily eat moths that stand out against the bark. Pick the bark color and the strength of selection and watch the allele frequency change generation by generation.'),
    cur: { tw: T('高中 生物 演化與天擇', 'Senior high biology · evolution and natural selection'), us: 'NGSS HS-LS4-4' },
    model: sel,
    checks(m, ok) {
      ok(Math.abs(m.next(0.3, 1, 1) - 0.3) < 1e-12, 'no selection → allele frequency unchanged (Hardy–Weinberg)');
      const g = m.hw(0.3); ok(Math.abs(g.DD + g.Dd + g.dd - 1) < 1e-12 && Math.abs(g.Dd - 0.42) < 1e-12, 'HW genotype frequencies p², 2pq, q²');
      let p = 0.01, up = true; for (let i = 0; i < 100; i++) { const n = m.next(p, 1, 0.7); if (n < p) up = false; p = n; } ok(up && p > 0.9, 'dark favored → D rises toward 1');
      p = 0.9; for (let i = 0; i < 200; i++) p = m.next(p, 0.7, 1); ok(p < 0.3 && p > 0, 'light favored → D falls (slowly, recessive light hides in Dd)');
      let s = 9; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      let sum = 0; for (let r = 0; r < 300; r++) sum += m.nextSample(0.4, 1, 1, 200, rnd); ok(Math.abs(sum / 300 - 0.4) < 0.01, 'random drift averages out');
      let q = 0.5, inside = true; for (let i = 0; i < 300; i++) { q = m.nextSample(q, 1, 0.5, 50, rnd); if (q < 0 || q > 1) inside = false; } ok(inside, 'frequency stays in [0, 1]');
    },
    mount(k) {
      const m = sel, v = k.canvas(640, 380), { ctx, W, H } = v;
      let bark = 'sooty', s = 0.3, p = 0.05, gen = 0, hist = [[0, 0.05]], run = true, acc = 0, N = 120, mut = false, moths = [], eaten = [];
      const spawn = () => { moths = Array.from({ length: 60 }, (_, i) => { const r1 = Math.random(), r2 = Math.random(); const dark = Math.random() < m.darkShare(p); return { x: 30 + (i % 10) * 28 + r1 * 10, y: 30 + Math.floor(i / 10) * 50 + r2 * 20, dark, a: r1 * 6 }; }); };
      spawn();
      k.seg({ label: T('樹皮', 'Tree bark'), value: 'sooty', options: [{ v: 'clean', label: T('🌳 乾淨（淺色地衣）', '🌳 Clean (pale lichen)') }, { v: 'sooty', label: T('🏭 被煤煙燻黑', '🏭 Blackened by soot') }], onChange: (x) => (bark = x) });
      k.slider({ label: T('天擇強度（醒目的蛾多被吃掉的比例）', 'Selection strength (extra share of conspicuous moths eaten)'), min: 0, max: 0.6, step: 0.05, value: s, dp: 2, onInput: (x) => (s = x) });
      k.toggle({ label: T('偶爾突變（d ↔ D）', 'Occasional mutation (d ↔ D)'), value: false, onChange: (x) => (mut = x) });
      const b = k.buttons([{ label: T('⏸ 暫停', '⏸ Pause'), primary: true, on: () => (run = !run) }, { label: T('↺ 重來（黑色很少）', '↺ Restart (few black)'), on: () => { p = 0.05; gen = 0; hist = [[0, 0.05]]; spawn(); } }]);
      const ro = k.readout();
      let seed = 12345; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      k.loop((dt) => {
        const c = k.colors();
        b.firstChild.textContent = run ? k.L('⏸ 暫停', '⏸ Pause') : k.L('▶ 繼續', '▶ Resume');
        const wDark = bark === 'sooty' ? 1 : 1 - s, wLight = bark === 'sooty' ? 1 - s : 1;
        if (run) { acc += dt; if (acc > 0.35 && gen < 200) { acc = 0; p = m.nextSample(p, wDark, wLight, N, rnd); if (mut) p = Math.min(1, Math.max(0, p + 0.002 * (1 - p) - 0.002 * p)); gen++; hist.push([gen, p]); if (gen % 3 === 0) { eaten = moths.filter((mo) => (mo.dark ? bark === 'clean' : bark === 'sooty') && Math.random() < s).map((mo) => ({ ...mo, t: 1 })); spawn(); } } }
        ctx.clearRect(0, 0, W, H);
        // bark
        ctx.fillStyle = bark === 'sooty' ? '#3b3632' : '#cfc8b8'; ctx.fillRect(10, 10, 300, 360);
        for (let i = 0; i < 40; i++) { ctx.strokeStyle = bark === 'sooty' ? 'rgba(80,72,64,0.8)' : 'rgba(160,160,140,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10 + ((i * 53) % 300), 10); ctx.bezierCurveTo(20 + ((i * 97) % 280), 120, ((i * 31) % 300), 250, 10 + ((i * 71) % 300), 370); ctx.stroke(); }
        if (bark === 'clean') for (let i = 0; i < 25; i++) k.circle(ctx, 20 + ((i * 113) % 280), 20 + ((i * 59) % 340), 6 + (i % 4) * 2, 'rgba(190,210,170,0.7)');
        const moth = (mo, alpha = 1) => { ctx.save(); ctx.globalAlpha = alpha; ctx.translate(mo.x, mo.y); ctx.rotate(mo.a * 0.3 - 0.9); ctx.fillStyle = mo.dark ? '#1e1e1e' : '#e9e4d6'; ctx.beginPath(); ctx.ellipse(-7, 0, 9, 6, -0.3, 0, 7); ctx.ellipse(7, 0, 9, 6, 0.3, 0, 7); ctx.fill(); ctx.fillStyle = mo.dark ? '#000' : '#8d8676'; for (let j = 0; j < 4; j++) ctx.fillRect(-10 + j * 6, -2 + (j % 2) * 2, 2, 2); ctx.restore(); };
        moths.forEach((mo) => moth(mo));
        eaten = eaten.filter((e) => { e.t -= dt; moth(e, Math.max(0, e.t)); k.text(ctx, '✖', e.x, e.y, { color: '#e5484d', size: 18, bold: true, align: 'center' }); return e.t > 0; });
        k.text(ctx, '🐦', 285, 30, { size: 26, align: 'center', font: '"Segoe UI Emoji", sans-serif' });
        const mp = k.axes(ctx, { x: 360, y: 30, w: 260, h: 280 }, { xmin: 0, xmax: Math.max(50, gen), ymin: 0, ymax: 1, c, xdp: 0, ydp: 1, xlabel: k.L('世代', 'generation'), ylabel: k.L('頻率', 'frequency') });
        k.plotLine(ctx, mp, hist.map(([g2, q]) => [g2, m.darkShare(q)]), '#444', 3);
        k.plotLine(ctx, mp, hist, c.acc, 2.5);
        k.text(ctx, k.L('— 黑色蛾的比例', '— share of black moths'), 370, 345, { color: c.ink, size: 13 });
        k.text(ctx, k.L('— 基因 D 的頻率', '— frequency of allele D'), 500, 345, { color: c.acc, size: 13 });
        ro.set(k.L(`第 <b>${gen}</b> 代：D 的頻率 p = <b>${k.fmt(p, 3)}</b>，黑色蛾 <b>${k.fmt(m.darkShare(p) * 100, 1)}%</b><br>適應度：黑色 ${k.fmt(wDark, 2)}、淺色 ${k.fmt(wLight, 2)}<br><span class="muted">族群 ${N} 隻；每代基因頻率由存活者隨機交配決定。</span>`,
          `Generation <b>${gen}</b>: frequency of D p = <b>${k.fmt(p, 3)}</b>, black moths <b>${k.fmt(m.darkShare(p) * 100, 1)}%</b><br>Fitness: black ${k.fmt(wDark, 2)}, pale ${k.fmt(wLight, 2)}<br><span class="muted">Population ${N}; each generation comes from survivors mating at random.</span>`));
      });
    },
    observe: [
      { try: T('選「被煤煙燻黑」，天擇強度 0.3，重來後播放。', 'Choose soot-blackened bark, selection 0.3, restart and play.'),
        ask: T('黑色蛾的比例怎麼變？', 'What happens to the share of black moths?'),
        options: [T('逐漸增加到接近 100%', 'It rises toward 100%'), T('一直維持 5%', 'It stays at 5%'), T('立刻變成 100%', 'It jumps to 100% at once')],
        why: T('在黑樹皮上淺色蛾很醒目，比較容易被鳥吃掉；黑色蛾存活並繁殖較多，D 基因的頻率一代代上升。天擇作用在「表現型」上，改變的是族群的基因頻率。', 'On black bark the pale moths stand out and get eaten more. Black moths survive and breed more, so the D allele rises generation by generation. Selection acts on phenotypes and changes the population’s allele frequencies.') },
      { try: T('把天擇強度調到 0，播放一段時間。', 'Set selection to 0 and play for a while.'),
        ask: T('沒有天擇時，基因頻率…', 'With no selection, the allele frequency…'),
        options: [T('只會隨機小幅變動（遺傳漂變）', 'only wanders a little at random (genetic drift)'), T('一定會上升', 'always rises'), T('一定會下降到 0', 'always drops to 0')],
        why: T('沒有天擇時，平均來說頻率不變（哈溫平衡），但族群有限，偶然的因素會讓它小幅漂動，族群愈小漂得愈多。', 'Without selection the frequency stays the same on average (Hardy–Weinberg), but in a finite population chance makes it drift a little — more in small populations.') },
      { try: T('等黑色蛾很多以後，換成「乾淨」的樹皮。', 'Once black moths dominate, switch to clean bark.'),
        ask: T('換成淺色樹皮後，淺色蛾（dd）變多的速度…', 'On pale bark, the pale moths (dd) come back…'),
        options: [T('一開始很慢，因為隱性基因藏在 Dd 中不受天擇', 'slowly at first — the recessive allele hides in Dd moths, out of selection’s reach'), T('立刻全部變回淺色', 'all at once'), T('永遠不會回來', 'never')],
        why: T('淺色是隱性性狀，d 很少時大多藏在黑色的 Dd 個體裡，鳥看不出來，所以一開始增加得很慢，之後才加快。這就是英國淨化空氣後淺色蛾慢慢回來的原因。', 'Pale is recessive. When d is rare it mostly sits in black Dd moths that birds can’t tell apart, so pale moths increase slowly at first and then faster. That is how pale moths gradually returned after Britain cleaned its air.') },
    ],
  },
  {
    id: 'titration', grades: [11, 12], subj: 'chem', icon: '⚗️',
    name: T('酸鹼滴定', 'Acid–base titration'),
    intro: T('用已知濃度的氫氧化鈉溶液慢慢滴入酸中，同時記錄 pH，就得到滴定曲線。當量點時酸和鹼的莫耳數相等：C<sub>a</sub>V<sub>a</sub> = C<sub>b</sub>V<sub>b</sub>。比較強酸（鹽酸）和弱酸（醋酸）的曲線，並選擇合適的指示劑。',
      'Drip sodium hydroxide of known concentration into an acid while recording the pH, and you get a titration curve. At the equivalence point moles of acid = moles of base: C<sub>a</sub>V<sub>a</sub> = C<sub>b</sub>V<sub>b</sub>. Compare a strong acid (HCl) with a weak one (acetic acid) and pick a suitable indicator.'),
    cur: { tw: T('高中 化學 酸鹼滴定', 'Senior high chemistry · acid–base titration') },
    model: titr,
    checks(m, ok) {
      ok(Math.abs(m.pH('strong', 0.1, 25, 0.1, 0) - 1) < 1e-3, '0.1 M HCl: pH 1.00');
      ok(Math.abs(m.pH('strong', 0.1, 25, 0.1, 25) - 7) < 1e-3, 'strong acid + strong base at equivalence: pH 7.00');
      ok(Math.abs(m.pH('weak', 0.1, 25, 0.1, 0) - 2.87) < 0.01, '0.1 M acetic acid: pH ≈ 2.87');
      ok(Math.abs(m.pH('weak', 0.1, 25, 0.1, 12.5) - 4.74) < 0.01, 'half-equivalence: pH = pKa = 4.74');
      const pe = m.pH('weak', 0.1, 25, 0.1, 25); ok(pe > 8.6 && pe < 8.8, `weak acid equivalence pH ≈ 8.72 (got ${pe.toFixed(2)})`);
      let mono = true, last = 0; for (let vb = 0; vb <= 50; vb += 0.25) { const p = m.pH('weak', 0.1, 25, 0.1, vb); if (p < last - 1e-9) mono = false; last = p; } ok(mono, 'pH increases with added base');
      ok(Math.abs(m.veq(0.12, 20, 0.08) - 30) < 1e-12, 'Veq = CaVa / Cb');
    },
    mount(k) {
      const m = titr, v = k.canvas(640, 400), { ctx, W, H } = v;
      let kind = 'strong', Ca = 0.1, Va = 25, Cb = 0.1, Vb = 0, ind = 'phenol', drop = 0;
      k.seg({ label: T('酸', 'Acid'), value: 'strong', options: [{ v: 'strong', label: T('鹽酸 HCl（強酸）', 'HCl (strong)') }, { v: 'weak', label: T('醋酸 CH₃COOH（弱酸）', 'CH₃COOH (weak)') }], onChange: (x) => (kind = x) });
      k.slider({ label: T('酸的濃度 C<sub>a</sub>', 'Acid concentration C<sub>a</sub>'), min: 0.05, max: 0.2, step: 0.01, value: Ca, unit: 'M', dp: 2, onInput: (x) => (Ca = x) });
      k.slider({ label: T('酸的體積 V<sub>a</sub>', 'Acid volume V<sub>a</sub>'), min: 10, max: 40, step: 5, value: Va, unit: 'mL', onInput: (x) => (Va = x) });
      const sB = k.slider({ label: T('滴入 NaOH（0.1 M）', 'NaOH added (0.1 M)'), min: 0, max: 80, step: 0.1, value: 0, unit: 'mL', dp: 1, onInput: (x) => { Vb = x; drop = 0.6; } });
      k.seg({ label: T('指示劑', 'Indicator'), value: 'phenol', options: Object.entries(INDS).map(([kk, x]) => ({ v: kk, label: T(x.zh, x.en) })), onChange: (x) => (ind = x) });
      k.buttons([{ label: T('💧 +1 滴（0.05 mL）', '💧 +1 drop (0.05 mL)'), on: () => sB.set(Math.min(80, +(Vb + 0.05).toFixed(2))) }, { label: '+1 mL', primary: true, on: () => sB.set(Math.min(80, +(Vb + 1).toFixed(2))) }, { label: T('↺ 重來', '↺ Refill'), on: () => sB.set(0) }]);
      const ro = k.readout();
      k.loop((dt) => {
        const c = k.colors(), p = m.pH(kind, Ca, Va, Cb, Vb), veq = m.veq(Ca, Va, Cb);
        drop = Math.max(0, drop - dt);
        ctx.clearRect(0, 0, W, H);
        // burette
        const bx = 90; k.rrect(ctx, bx - 9, 10, 18, 170, 4, 'rgba(200,225,250,0.6)', c.ink, 2);
        const lv = 10 + (Vb / 80) * 160; ctx.fillStyle = 'rgba(160,200,255,0.7)'; ctx.fillRect(bx - 7, lv, 14, 178 - lv);
        for (let i = 0; i <= 8; i++) k.line(ctx, bx + 9, 14 + i * 20, bx + 15, 14 + i * 20, c.ink, 1);
        k.line(ctx, bx, 180, bx, 200, c.ink, 3); k.rrect(ctx, bx - 14, 186, 28, 8, 3, '#607d8b');
        if (drop > 0) k.circle(ctx, bx, 210 + (0.6 - drop) * 120, 4, '#9ec5ff');
        // flask
        const fx = bx, fy = 290;
        ctx.fillStyle = INDS[ind].col(p); ctx.beginPath(); ctx.moveTo(fx - 18, fy - 40); ctx.lineTo(fx - 60, fy + 50); ctx.lineTo(fx + 60, fy + 50); ctx.lineTo(fx + 18, fy - 40); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx - 14, fy - 80); ctx.lineTo(fx - 14, fy - 45); ctx.lineTo(fx - 64, fy + 54); ctx.lineTo(fx + 64, fy + 54); ctx.lineTo(fx + 14, fy - 45); ctx.lineTo(fx + 14, fy - 80); ctx.stroke();
        k.text(ctx, `pH ${k.fmt(p, 2)}`, fx, fy + 80, { color: c.ink, size: 20, bold: true, align: 'center' });
        // curve
        const xmax = Math.max(veq * 2, 10), mp = k.axes(ctx, { x: 230, y: 20, w: 390, h: 320 }, { xmin: 0, xmax, ymin: 0, ymax: 14, c, xdp: 0, ydp: 0, xlabel: 'V NaOH (mL)', ylabel: 'pH' });
        const lo = { phenol: [8.2, 10], mo: [3.1, 4.4], btb: [6, 7.6] }[ind];
        ctx.fillStyle = 'rgba(244,143,207,0.18)'; if (ind === 'mo') ctx.fillStyle = 'rgba(251,140,0,0.18)'; if (ind === 'btb') ctx.fillStyle = 'rgba(76,175,80,0.18)';
        ctx.fillRect(mp.X(0), mp.Y(lo[1]), mp.X(xmax) - mp.X(0), mp.Y(lo[0]) - mp.Y(lo[1]));
        const pts = []; for (let x = 0; x <= xmax; x += xmax / 300) pts.push([x, m.pH(kind, Ca, Va, Cb, x)]);
        k.plotLine(ctx, mp, pts, c.muted, 2);
        const done = pts.filter(([x]) => x <= Vb); done.push([Vb, p]); k.plotLine(ctx, mp, done, c.no, 3.5);
        k.line(ctx, mp.X(veq), mp.Y(0), mp.X(veq), mp.Y(14), c.acc2, 1.5, [5, 4]);
        k.text(ctx, k.L(`當量點 ${k.fmt(veq, 1)} mL`, `equivalence ${k.fmt(veq, 1)} mL`), mp.X(veq) + 6, mp.Y(1.2), { color: c.acc2, size: 13, bold: true });
        if (kind === 'weak') { k.circle(ctx, mp.X(veq / 2), mp.Y(m.pH(kind, Ca, Va, Cb, veq / 2)), 5, c.acc); k.text(ctx, 'pH = pKa', mp.X(veq / 2) + 8, mp.Y(m.pH(kind, Ca, Va, Cb, veq / 2)) + 14, { color: c.acc, size: 13, bold: true }); }
        const nA = Ca * Va, nB = 0.1 * Vb;
        ro.set(k.L(`酸 ${k.fmt(nA, 2)} mmol，已加鹼 ${k.fmt(nB, 2)} mmol　當量點 V = C<sub>a</sub>V<sub>a</sub> ÷ C<sub>b</sub> = ${Ca} × ${Va} ÷ 0.1 = <b>${k.fmt(veq, 1)} mL</b><br>現在 pH = <b>${k.fmt(p, 2)}</b>${kind === 'weak' ? `　當量點 pH ≈ ${k.fmt(m.pH(kind, Ca, Va, Cb, veq), 2)}（弱酸的鹽水解成鹼性）` : ''}`,
          `Acid ${k.fmt(nA, 2)} mmol, base added ${k.fmt(nB, 2)} mmol　equivalence V = C<sub>a</sub>V<sub>a</sub> ÷ C<sub>b</sub> = ${Ca} × ${Va} ÷ 0.1 = <b>${k.fmt(veq, 1)} mL</b><br>pH now <b>${k.fmt(p, 2)}</b>${kind === 'weak' ? `　equivalence pH ≈ ${k.fmt(m.pH(kind, Ca, Va, Cb, veq), 2)} (the acetate ion makes it basic)` : ''}`));
      });
    },
    observe: [
      { try: T('用鹽酸，慢慢加到當量點附近，再按「+1 滴」。', 'With HCl, add up to near the equivalence point, then press “+1 drop”.'),
        ask: T('在當量點附近，一滴鹼讓 pH…', 'Near equivalence, one drop of base makes the pH…'),
        options: [T('一下子跳好幾個單位', 'jump by several units'), T('只變 0.01', 'change by only 0.01'), T('下降', 'go down')],
        why: T('當量點附近溶液中幾乎沒有多餘的酸或鹼，一滴（0.005 mmol）就讓 [H⁺] 改變好幾個數量級，所以曲線幾乎垂直，指示劑就是利用這個突然的變化。', 'Near equivalence there is almost no extra acid or base left, so one drop (0.005 mmol) changes [H⁺] by several powers of ten — the curve is nearly vertical, and indicators rely on that sudden jump.') },
      { try: T('換成醋酸（弱酸），比較曲線的起點和當量點。', 'Switch to acetic acid (weak) and compare the start and the equivalence point.'),
        ask: T('弱酸滴定的當量點 pH…', 'For the weak acid, the pH at equivalence is…'),
        options: [T('大於 7', 'above 7'), T('等於 7', 'exactly 7'), T('小於 7', 'below 7')],
        why: T('中和後生成醋酸鈉，醋酸根離子會水解：CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻，所以溶液呈弱鹼性（約 pH 8.7）。', 'Neutralization makes sodium acetate, and acetate reacts with water (CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻), so the solution is slightly basic (about pH 8.7).') },
      { try: T('用醋酸，分別選酚酞和甲基橙，看顏色在哪裡改變。', 'With acetic acid, try phenolphthalein and methyl orange and see where each changes color.'),
        ask: T('醋酸滴定適合用哪一個指示劑？', 'Which indicator suits the acetic acid titration?'),
        options: [T('酚酞', 'Phenolphthalein'), T('甲基橙', 'Methyl orange'), T('兩個都很適合', 'Both work equally well')],
        why: T('指示劑的變色範圍要落在曲線陡升的區段裡。弱酸當量點 pH ≈ 8.7，酚酞（8.2–10）剛好；甲基橙（3.1–4.4）會在當量點前很早就變色。', 'An indicator’s color-change range must sit on the steep part of the curve. The weak-acid equivalence point is about pH 8.7, which suits phenolphthalein (8.2–10); methyl orange (3.1–4.4) changes far too early.') },
      { try: T('用醋酸，把 NaOH 加到當量點的一半。', 'With acetic acid, add NaOH to half the equivalence volume.'),
        ask: T('半當量點時 pH 等於…', 'At half-equivalence the pH equals…'),
        options: [T('醋酸的 pKa（約 4.74）', 'the pKa of acetic acid (about 4.74)'), T('7', '7'), T('起始 pH 的一半', 'half the starting pH')],
        why: T('一半的醋酸被中和時，[CH₃COOH] = [CH₃COO⁻]，代入 Ka = [H⁺][A⁻]/[HA] 得 [H⁺] = Ka，所以 pH = pKa = −log(1.8×10⁻⁵) ≈ 4.74。', 'When half is neutralized, [CH₃COOH] = [CH₃COO⁻]; then Ka = [H⁺][A⁻]/[HA] gives [H⁺] = Ka, so pH = pKa = −log(1.8×10⁻⁵) ≈ 4.74.') },
    ],
  },
  {
    id: 'equilibrium', grades: [11, 12], subj: 'chem', icon: '⚖️',
    name: T('反應速率與化學平衡', 'Reaction rates and equilibrium'),
    intro: T('無色的四氧化二氮 N₂O₄ 會分解成紅棕色的二氧化氮 NO₂，同時 NO₂ 也會結合回 N₂O₄：N₂O₄ ⇌ 2NO₂（正反應吸熱）。當正逆反應速率相等就達到平衡。加熱、加入物質、壓縮或加催化劑，看看平衡怎麼移動（勒沙特列原理）。',
      'Colorless dinitrogen tetroxide N₂O₄ breaks into red-brown nitrogen dioxide NO₂, while NO₂ also joins back into N₂O₄: N₂O₄ ⇌ 2NO₂ (the forward reaction absorbs heat). When the forward and reverse rates are equal, it is at equilibrium. Heat it, add substances, squeeze it or add a catalyst and watch the equilibrium shift (Le Chatelier’s principle).'),
    cur: { tw: T('高中 化學 反應速率與化學平衡', 'Senior high chemistry · reaction rates and equilibrium'), us: 'NGSS HS-PS1-6' },
    model: eq,
    checks(m, ok) {
      const s = m.settle([0.05, 0], 298); ok(Math.abs(m.Q(s) / m.K(298) - 1) < 1e-3, 'reaches Q = K');
      ok(Math.abs(m.K(298) - 4.6e-3) < 1e-12 && m.K(350) > m.K(298), 'endothermic: K grows with temperature');
      const sc = m.settle([0.05, 0], 298, true); ok(Math.abs(sc[1] - s[1]) < 1e-4, 'a catalyst does not change the equilibrium');
      let a = [0.05, 0], b = [0.05, 0]; for (let i = 0; i < 50; i++) { a = m.step(a, 298, false, 0.1); b = m.step(b, 298, true, 0.1); } ok(Math.abs(m.Q(b) / m.K(298) - 1) < Math.abs(m.Q(a) / m.K(298) - 1), 'a catalyst gets there faster');
      const add = m.settle([s[0] + 0.02, s[1]], 298); ok(add[1] > s[1], 'adding N₂O₄ makes more NO₂');
      const hot = m.settle(s.slice(), 340); ok(hot[1] > s[1], 'heating shifts toward NO₂ (endothermic direction)');
      const sq = m.settle([s[0] * 2, s[1] * 2], 298); ok(sq[0] / (sq[0] + sq[1] / 2) > s[0] / (s[0] + s[1] / 2), 'squeezing shifts toward fewer gas molecules (N₂O₄)');
      const tot = (x) => 2 * x[0] + x[1]; ok(Math.abs(tot(s) - 0.1) < 1e-9, 'nitrogen atoms are conserved');
    },
    mount(k) {
      const m = eq, v = k.canvas(640, 380), { ctx, W, H } = v;
      let Tk = 298, cat = false, s = [0.05, 0], t = 0, hist = [[0, 0.05, 0]], vol = 1, parts = [];
      for (let i = 0; i < 80; i++) parts.push({ x: Math.random(), y: Math.random(), vx: Math.random() - 0.5, vy: Math.random() - 0.5 });
      k.slider({ label: T('溫度', 'Temperature'), min: 273, max: 373, step: 5, value: Tk, unit: 'K', onInput: (x) => (Tk = x) });
      k.toggle({ label: T('加入催化劑', 'Add a catalyst'), value: false, onChange: (x) => (cat = x) });
      k.buttons([{ label: T('＋ N₂O₄', '+ N₂O₄'), on: () => (s = [s[0] + 0.02, s[1]]) }, { label: T('＋ NO₂', '+ NO₂'), on: () => (s = [s[0], s[1] + 0.02]) }, { label: T('🗜️ 體積減半', '🗜️ Halve the volume'), on: () => { if (vol > 0.3) { s = [s[0] * 2, s[1] * 2]; vol /= 2; } } }, { label: T('↺ 重來', '↺ Restart'), primary: true, on: () => { s = [0.05, 0]; t = 0; hist = [[0, 0.05, 0]]; vol = 1; } }]);
      const ro = k.readout();
      k.loop((dt) => {
        const c = k.colors();
        s = m.step(s, Tk, cat, dt); t += dt; hist.push([t, s[0], s[1]]); if (hist.length > 1500) hist.shift();
        ctx.clearRect(0, 0, W, H);
        // gas box: brown tint ∝ [NO2]
        const bw = 220 * Math.sqrt(vol) + 20, bh = 220 * Math.sqrt(vol) + 20, bx = 20 + (240 - bw) / 2, by = 40 + (240 - bh) / 2;
        ctx.fillStyle = `rgba(150,70,20,${Math.min(0.85, s[1] * 22)})`; ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
        const tot = s[0] * 2 + s[1], nA = Math.round((80 * s[0] * 2) / tot / 2), sp = Math.sqrt(Tk / 298) * 0.25;
        parts.forEach((p, i) => { p.x += p.vx * sp * dt; p.y += p.vy * sp * dt; if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1; p.x = Math.min(1, Math.max(0, p.x)); p.y = Math.min(1, Math.max(0, p.y));
          const x = bx + 10 + p.x * (bw - 20), y = by + 10 + p.y * (bh - 20);
          if (i < nA) { k.circle(ctx, x - 5, y, 5, '#e0e0e0', '#555', 1); k.circle(ctx, x + 5, y, 5, '#e0e0e0', '#555', 1); } else if (i < nA + (80 - 2 * nA)) k.circle(ctx, x, y, 5, '#b4501e', '#5a250d', 1); });
        k.text(ctx, k.L('⚪⚪ N₂O₄（無色）  🟤 NO₂（紅棕色）', '⚪⚪ N₂O₄ (colorless)  🟤 NO₂ (red-brown)'), 140, 310, { color: c.ink, size: 13, align: 'center', font: '"Segoe UI Emoji", system-ui' });
        k.text(ctx, `${Tk} K${cat ? k.L('　＋催化劑', '  + catalyst') : ''}`, 140, 334, { color: c.ink, size: 15, bold: true, align: 'center' });
        const x0 = Math.max(0, t - 30), ymax = Math.max(0.1, ...hist.map((h) => Math.max(h[1], h[2]))) * 1.1;
        const mp = k.axes(ctx, { x: 330, y: 30, w: 290, h: 280 }, { xmin: x0, xmax: x0 + 30, ymin: 0, ymax, c, xdp: 0, ydp: 2, xlabel: 't', ylabel: k.L('濃度 (M)', 'concentration (M)') });
        const vis = hist.filter((h) => h[0] >= x0);
        k.plotLine(ctx, mp, vis.map((h) => [h[0], h[1]]), '#78909c', 3); k.plotLine(ctx, mp, vis.map((h) => [h[0], h[2]]), '#b4501e', 3);
        const Q = m.Q(s), K = m.K(Tk), dir = Q < K * 0.98 ? k.L('Q < K → 向右（生成 NO₂）', 'Q < K → shifts right (more NO₂)') : Q > K * 1.02 ? k.L('Q > K → 向左（生成 N₂O₄）', 'Q > K → shifts left (more N₂O₄)') : k.L('Q ≈ K → 平衡', 'Q ≈ K → at equilibrium');
        ro.set(`[N₂O₄] = <b>${k.fmt(s[0], 4)}</b> M　[NO₂] = <b>${k.fmt(s[1], 4)}</b> M<br>Q = [NO₂]²/[N₂O₄] = <b>${Q < 1e-4 ? Q.toExponential(2) : k.fmt(Q, 4)}</b>　K<sub>c</sub>(${Tk} K) = <b>${K < 1e-3 ? K.toExponential(2) : k.fmt(K, 4)}</b><br>${dir}<div class="muted">${k.L('速率為模擬單位；K 值依據 298 K 的 Kc ≈ 4.6×10⁻³ 和 ΔH = +57 kJ/mol 推算。', 'Rates are in simulation units; K comes from Kc ≈ 4.6×10⁻³ at 298 K and ΔH = +57 kJ/mol.')}</div>`);
      });
    },
    observe: [
      { try: T('按「重來」，看 N₂O₄ 和 NO₂ 的濃度曲線。', 'Press Restart and watch the two concentration curves.'),
        ask: T('達到平衡以後，反應…', 'Once equilibrium is reached, the reactions…'),
        options: [T('還在進行，只是正逆反應速率相等', 'keep going, but the forward and reverse rates are equal'), T('完全停止了', 'have stopped completely'), T('只剩正反應', 'only go forward')],
        why: T('化學平衡是「動態平衡」：分子仍不斷分解和結合，只是兩個方向的速率一樣快，所以濃度不再改變。', 'Chemical equilibrium is dynamic: molecules keep splitting and joining, but at equal rates, so the concentrations stop changing.') },
      { try: T('達到平衡後，把溫度從 298 K 加到 350 K。', 'At equilibrium, raise the temperature from 298 K to 350 K.'),
        ask: T('加熱後氣體顏色…', 'After heating, the gas color…'),
        options: [T('變深（NO₂ 變多）', 'gets darker (more NO₂)'), T('變淡', 'gets paler'), T('不變', 'stays the same')],
        why: T('正反應吸熱。依勒沙特列原理，升溫時平衡往吸熱方向（向右）移動，生成更多紅棕色的 NO₂，K 值也變大。', 'The forward reaction absorbs heat. By Le Chatelier’s principle, heating shifts the equilibrium in the heat-absorbing direction (right), making more brown NO₂ — and K increases.') },
      { try: T('平衡後按「體積減半」。', 'At equilibrium, press “Halve the volume”.'),
        ask: T('壓縮後平衡往哪邊移動？', 'Which way does squeezing shift the equilibrium?'),
        options: [T('向左，往氣體分子數少的 N₂O₄', 'left, toward N₂O₄ — fewer gas molecules'), T('向右，往 NO₂', 'right, toward NO₂'), T('不會移動', 'it doesn’t shift')],
        why: T('體積減半讓所有濃度加倍，Q = [NO₂]²/[N₂O₄] 變成 2 倍 > K，所以反應向左進行，減少氣體分子數來降低壓力。', 'Halving the volume doubles every concentration, so Q = [NO₂]²/[N₂O₄] doubles and becomes bigger than K. The reaction runs left, making fewer gas molecules to ease the pressure.') },
      { try: T('重來，打開「加入催化劑」，和不加比較。', 'Restart with the catalyst on and compare with no catalyst.'),
        ask: T('催化劑對平衡的影響是…', 'What does the catalyst do?'),
        options: [T('更快達到平衡，但平衡濃度不變', 'reaches equilibrium faster, but the equilibrium amounts are the same'), T('讓 NO₂ 變多', 'makes more NO₂'), T('讓 K 值變大', 'makes K bigger')],
        why: T('催化劑同時降低正、逆反應的活化能，兩個方向都加快同樣的倍數，所以只縮短達到平衡的時間，不改變 K 和平衡組成。', 'A catalyst lowers the activation energy of both directions equally, speeding both by the same factor. It only shortens the time to reach equilibrium — K and the equilibrium mixture stay the same.') },
    ],
  },
  {
    id: 'dna-protein', grades: [10, 12], subj: 'bio', icon: '🧬',
    name: T('從 DNA 到蛋白質', 'From DNA to protein'),
    intro: T('基因的資訊從 DNA 轉錄成 mRNA，再由核糖體每三個鹼基（一個密碼子）轉譯成一個胺基酸。點一下編碼股上的鹼基可以換成別的鹼基，或插入、刪除鹼基，看看突變對蛋白質有什麼影響。',
      'A gene’s information is transcribed from DNA into mRNA, then a ribosome translates it three bases (one codon) at a time into amino acids. Tap a base on the coding strand to change it, or insert or delete a base, and see what the mutation does to the protein.'),
    cur: { tw: T('高中 生物 遺傳物質與基因表現', 'Senior high biology · DNA and gene expression'), us: 'NGSS HS-LS1-1' },
    model: dna,
    checks(m, ok) {
      ok(Object.keys(m.CODON).length === 64 && Object.values(m.CODON).filter((x) => x === '*').length === 3, '64 codons, 3 stop codons');
      ok(m.CODON.AUG === 'M' && m.CODON.UUU === 'F' && m.CODON.UGG === 'W' && m.CODON.UAA === '*' && m.CODON.UAG === '*' && m.CODON.UGA === '*' && m.CODON.GAG === 'E' && m.CODON.GUG === 'V', 'codon table spot checks');
      ok(new Set(Object.values(m.CODON)).size === 21, '20 amino acids + stop');
      ok(m.mrna('ATGGCC') === 'AUGGCC' && m.template('ATGC') === 'TACG', 'transcription and base pairing');
      ok(m.translate('AUGGCCUUUUAAGGG').join('') === 'MAF*', 'translation starts at AUG and stops at a stop codon');
      const a = m.translate(m.mrna('ATGGTGCACCTGACTCCTGAGGAGAAG')), b = m.translate(m.mrna('ATGGTGCACCTGACTCCTGTGGAGAAG'));
      ok(a[6] === 'E' && b[6] === 'V' && m.classify(a, b) === 'missense', 'sickle-cell: GAG→GTG makes Glu→Val (missense)');
      ok(m.classify(m.translate('AUGGCC'), m.translate('AUGGCA')) === 'silent' && m.classify(m.translate('AUGAAAUGG'), m.translate('AUGAAAUGA')) === 'nonsense', 'silent and nonsense mutations');
    },
    mount(k) {
      const m = dna, v = k.canvas(640, 360), { ctx, W, H } = v;
      let si = 0, orig = SEQS[0].s, cur = orig, selI = 7, step = 0, t = 0, play = true;
      k.seg({ label: T('基因', 'Gene'), value: 0, options: SEQS.map((s, i) => ({ v: i, label: T(s.zh, s.en) })), onChange: (x) => { si = x; orig = cur = SEQS[x].s; selI = 7; step = 0; } });
      k.buttons([{ label: T('🔁 換鹼基', '🔁 Change base'), primary: true, on: () => { const b = cur[selI], nb = { A: 'C', C: 'G', G: 'T', T: 'A' }[b]; cur = cur.slice(0, selI) + nb + cur.slice(selI + 1); } }, { label: T('➕ 插入 A', '➕ Insert A'), on: () => { cur = cur.slice(0, selI) + 'A' + cur.slice(selI); } }, { label: T('➖ 刪除', '➖ Delete'), on: () => { if (cur.length > 6) cur = cur.slice(0, selI) + cur.slice(selI + 1); selI = Math.min(selI, cur.length - 1); } }, { label: T('↺ 還原', '↺ Undo all'), on: () => (cur = orig) }]);
      const ro = k.readout();
      const cw = 22, x0 = 14;
      k.pointer(v.cv, { down(p) { if (p.y > 40 && p.y < 110) { const i = Math.floor((p.x - x0) / cw); if (i >= 0 && i < cur.length) selI = i; } } });
      const BC = { A: '#e5484d', T: '#f59f00', U: '#f59f00', G: '#2f9e44', C: '#3b7be0' };
      k.loop((dt) => {
        t += dt; const c = k.colors();
        const mr = m.mrna(cur), prot = m.translate(mr), protO = m.translate(m.mrna(orig));
        ctx.clearRect(0, 0, W, H);
        const n = Math.min(cur.length, 28);
        k.text(ctx, k.L("編碼股 5'→3'", "coding strand 5'→3'"), x0, 30, { color: c.muted, size: 13 });
        k.text(ctx, k.L("模板股 3'→5'", "template strand 3'→5'"), x0, 132, { color: c.muted, size: 13 });
        for (let i = 0; i < n; i++) {
          const x = x0 + i * cw, b = cur[i], tb = m.comp(b), changed = i >= orig.length || orig[i] !== b;
          if (i === selI) k.rrect(ctx, x - 2, 42, cw, 68, 4, null, c.acc, 2.5);
          k.rrect(ctx, x, 46, cw - 4, 24, 4, BC[b], changed ? c.ink : null, 2); k.text(ctx, b, x + (cw - 4) / 2, 58, { color: '#fff', size: 15, bold: true, align: 'center' });
          k.line(ctx, x + (cw - 4) / 2, 70, x + (cw - 4) / 2, 84, c.line, 2);
          k.rrect(ctx, x, 84, cw - 4, 24, 4, BC[tb]); k.text(ctx, tb, x + (cw - 4) / 2, 96, { color: '#fff', size: 15, bold: true, align: 'center' });
        }
        // mRNA with codon brackets
        k.text(ctx, k.L("mRNA 5'→3'（和編碼股相同，T 換成 U）", "mRNA 5'→3' (same as the coding strand, with U for T)"), x0, 160, { color: c.muted, size: 13 });
        const start = mr.indexOf('AUG');
        for (let i = 0; i < n; i++) { const x = x0 + i * cw, b = mr[i]; k.rrect(ctx, x, 172, cw - 4, 24, 12, BC[b]); k.text(ctx, b, x + (cw - 4) / 2, 184, { color: '#fff', size: 15, bold: true, align: 'center' }); }
        if (start >= 0) for (let j = 0; j < prot.length; j++) { const i = start + j * 3; if (i + 3 > n) break; k.line(ctx, x0 + i * cw, 202, x0 + (i + 3) * cw - 4, 202, c.ink, 2); k.line(ctx, x0 + i * cw, 198, x0 + i * cw, 204, c.ink, 2); }
        // ribosome moving
        if (play) { step += dt * 1.2; if (step > prot.length + 2) step = 0; }
        const shown = Math.min(prot.length, Math.floor(step));
        if (start >= 0 && shown < prot.length) { const rx = x0 + (start + shown * 3) * cw - 6; ctx.fillStyle = 'rgba(120,144,156,0.35)'; ctx.beginPath(); ctx.ellipse(rx + 1.5 * cw, 184, 1.9 * cw, 26, 0, 0, 7); ctx.fill(); }
        // amino-acid chains
        const chain = (p, y, label, other) => {
          k.text(ctx, label, x0, y - 22, { color: c.muted, size: 13 });
          p.slice(0, y === 250 ? shown : p.length).forEach((a, j) => { const x = x0 + 28 + j * 50, diff = other && other[j] !== a; k.circle(ctx, x, y, 18, AACOL[a], diff ? c.no : null, 3); k.text(ctx, AANAME[a], x, y, { color: '#fff', size: 11, bold: true, align: 'center' }); if (j) k.line(ctx, x - 32, y, x - 18, y, c.ink, 2); });
        };
        chain(prot, 250, k.L('多肽鏈（突變後）', 'polypeptide (after your changes)'), protO);
        chain(protO, 320, k.L('原本的多肽鏈', 'original polypeptide'), null);
        const kind = cur === orig ? null : m.classify(protO, prot), ins = cur.length !== orig.length;
        const kz = { silent: '同義突變（胺基酸沒變）', missense: '錯義突變（一個胺基酸改變）', nonsense: '無意義突變（提早出現終止密碼子）', changed: ins ? '移碼突變（插入或刪除讓後面全部錯位）' : '多處改變' }[kind], ke = { silent: 'silent mutation (same amino acids)', missense: 'missense mutation (one amino acid changed)', nonsense: 'nonsense mutation (an early stop codon)', changed: ins ? 'frameshift (an insertion or deletion shifts every codon after it)' : 'several changes' }[kind];
        const sel2 = start >= 0 && selI >= start ? Math.floor((selI - start) / 3) : -1, cod = sel2 >= 0 ? mr.slice(start + sel2 * 3, start + sel2 * 3 + 3) : '';
        ro.set(k.L(`選取第 ${selI + 1} 個鹼基${cod.length === 3 ? `（密碼子 ${cod} → ${AANAME[m.CODON[cod]]}）` : ''}<br>${kind ? `<b>${kz}</b>` : '點編碼股上的鹼基來選取，再用右邊的按鈕突變。'}${si === 1 ? '<br><span class="muted">把第 20 個鹼基 A 換成 T（GAG → GTG），就是鐮刀型貧血症的突變：Glu → Val。</span>' : ''}`,
          `Base ${selI + 1} selected${cod.length === 3 ? ` (codon ${cod} → ${AANAME[m.CODON[cod]]})` : ''}<br>${kind ? `<b>${ke}</b>` : 'Tap a base on the coding strand, then use the buttons to mutate it.'}${si === 1 ? '<br><span class="muted">Change base 20 from A to T (GAG → GTG): the sickle-cell mutation, Glu → Val.</span>' : ''}`));
      });
    },
    observe: [
      { try: T('選「範例基因」，點第 18 個鹼基（GGC 的 C），按「換鹼基」把它換成 G、T、A 試試。', 'Choose the example gene, tap base 18 (the C of GGC) and change it to G, T and A.'),
        ask: T('GGC 的第三個鹼基改變時，胺基酸…', 'Changing the third base of GGC changes the amino acid…'),
        options: [T('都還是甘胺酸（Gly）：同義突變', 'not at all — it stays glycine (Gly): a silent mutation'), T('每次都變成不同的胺基酸', 'every time'), T('變成終止密碼子', 'into a stop codon')],
        why: T('遺傳密碼有「簡併性」：GGU、GGC、GGA、GGG 都代表甘胺酸，所以第三個鹼基的改變常常不影響蛋白質。', 'The genetic code is redundant: GGU, GGC, GGA and GGG all mean glycine, so changes in the third base often leave the protein unchanged.') },
      { try: T('選「β-血紅素開頭」，點第 20 個鹼基（A），換成 T。', 'Choose the β-globin start, tap base 20 (A) and change it to T.'),
        ask: T('這個突變讓蛋白質…', 'This mutation makes the protein…'),
        options: [T('一個胺基酸由麩胺酸變成纈胺酸（錯義突變）', 'swap one glutamic acid for valine (missense)'), T('完全不變', 'stay exactly the same'), T('在這裡就終止', 'stop right there')],
        why: T('GAG（Glu）變成 GTG，mRNA 為 GUG（Val）。只改一個胺基酸，卻讓血紅素容易聚集，紅血球變成鐮刀狀，這就是鐮刀型貧血症。', 'GAG (Glu) becomes GTG, so the mRNA reads GUG (Val). One amino acid changes, yet the hemoglobin clumps and red blood cells turn sickle-shaped — sickle-cell disease.') },
      { try: T('選「範例基因」，選第 5 個鹼基，按「插入 A」。', 'Choose the example gene, select base 5 and press “Insert A”.'),
        ask: T('插入一個鹼基以後…', 'After inserting one base…'),
        options: [T('後面的密碼子全部錯位，胺基酸幾乎全變了', 'every codon after it shifts and nearly all the following amino acids change'), T('只改變一個胺基酸', 'only one amino acid changes'), T('蛋白質完全不變', 'the protein is unchanged')],
        why: T('密碼子是三個三個讀的。插入或刪除一個鹼基會讓之後的讀碼框架整個移位（移碼突變），通常讓蛋白質完全失去功能。', 'Codons are read three at a time. Inserting or deleting one base shifts the reading frame for everything after it (a frameshift), which usually wrecks the protein.') },
    ],
  },
];

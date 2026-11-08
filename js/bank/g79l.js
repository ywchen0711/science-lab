// Practice units for grades 7–9, life & earth science (國中 生物・地球科學). Format: see SPEC.md.
import { T, ansNum, ansQty, ansChoice, pickItem, num, rnd } from '../util.js';

const TWB = (zh, en) => T(`國中 生物 ${zh}`, `Junior high biology · ${en}`);
const TWE = (zh, en) => T(`國中 地球科學 ${zh}`, `Junior high earth science · ${en}`);
const FR = { 0: ['0', '0'], 0.25: ['1/4', '1/4'], 0.5: ['1/2', '1/2'], 0.75: ['3/4', '3/4'], 1: ['1（全部）', '1 (all)'] };

function punnettSVG(p1, p2, A) {
  const g = (x) => x.replace(/A/g, A).replace(/a/g, A.toLowerCase());
  let s = `<svg class="fig" viewBox="0 0 170 150" width="170" height="150"><text x="95" y="16" font-size="15" text-anchor="middle" class="f-txt">${g(p1)}</text><text x="12" y="92" font-size="15" text-anchor="middle" class="f-txt" transform="rotate(-90 12 92)">${g(p2)}</text>`;
  for (let i = 0; i < 2; i++) { s += `<text x="${70 + i * 50}" y="36" font-size="15" text-anchor="middle" class="f-acctxt">${g(p1[i])}</text><text x="34" y="${70 + i * 50}" font-size="15" text-anchor="middle" class="f-acctxt">${g(p2[i])}</text>`;
    for (let j = 0; j < 2; j++) s += `<rect x="${45 + i * 50}" y="${45 + j * 50}" width="50" height="50" class="f-soft"/><text x="${70 + i * 50}" y="${75 + j * 50}" font-size="15" text-anchor="middle" class="f-txt">?</text>`; }
  return s + '</svg>';
}

export default [
  {
    id: 'g7-cells', grades: [7, 7], subj: 'bio', sim: 'microscope',
    name: T('細胞的構造與功能', 'Cell structures and their jobs'),
    cur: { tw: TWB('細胞', 'cells'), us: 'NGSS MS-LS1-2' },
    bank: [
      { q: T('細胞中控制遺傳和生命活動的構造是…', 'Which part controls a cell’s activities and holds its genetic information?'), options: [T('細胞核', 'The nucleus'), T('細胞壁', 'The cell wall'), T('液胞', 'The vacuole')], why: [T('細胞核含有遺傳物質 DNA，是細胞的控制中心。', 'The nucleus holds the DNA and controls the cell.')] },
      { q: T('植物細胞有、動物細胞沒有的構造是…', 'Which structure do plant cells have but animal cells do not?'), options: [T('細胞壁', 'A cell wall'), T('細胞膜', 'A cell membrane'), T('細胞核', 'A nucleus'), T('粒線體', 'Mitochondria')], why: [T('植物細胞有細胞壁（還有葉綠體、大液胞），動物細胞沒有；兩者都有細胞膜、細胞核、粒線體。', 'Plant cells have a cell wall (plus chloroplasts and a large vacuole); animal cells don’t. Both have a membrane, nucleus and mitochondria.')] },
      { q: T('進行光合作用的胞器是…', 'Which organelle carries out photosynthesis?'), options: [T('葉綠體', 'The chloroplast'), T('粒線體', 'The mitochondrion'), T('細胞核', 'The nucleus')], why: [T('葉綠體含葉綠素，利用光能把二氧化碳和水製成葡萄糖。', 'Chloroplasts contain chlorophyll and use light to make glucose from carbon dioxide and water.')] },
      { q: T('細胞進行呼吸作用、產生能量的主要胞器是…', 'Which organelle releases energy by cellular respiration?'), options: [T('粒線體', 'The mitochondrion'), T('葉綠體', 'The chloroplast'), T('細胞壁', 'The cell wall')], why: [T('粒線體分解養分釋放能量，動植物細胞都有。', 'Mitochondria break down food to release energy; both plant and animal cells have them.')] },
      { q: T('控制物質進出細胞的構造是…', 'Which structure controls what enters and leaves the cell?'), options: [T('細胞膜', 'The cell membrane'), T('細胞壁', 'The cell wall'), T('細胞核', 'The nucleus')], why: [T('細胞膜具有選擇性，決定哪些物質可以進出。', 'The cell membrane is selective — it decides what can pass in and out.')] },
      { q: T('下列哪一個是單細胞生物？', 'Which of these is a single-celled organism?'), options: [T('草履蟲', 'Paramecium'), T('蚯蚓', 'Earthworm'), T('蕨類', 'Fern')], why: [T('草履蟲整個身體只有一個細胞，卻能完成攝食、運動、繁殖等生命活動。', 'A paramecium is one cell that still feeds, moves and reproduces.')] },
      { q: T('生物體的組成層次由小到大，正確的是…', 'Which order of organization, smallest to largest, is right?'), options: [T('細胞 → 組織 → 器官 → 器官系統 → 個體', 'cell → tissue → organ → organ system → organism'), T('組織 → 細胞 → 器官 → 個體', 'tissue → cell → organ → organism'), T('器官 → 組織 → 細胞 → 個體', 'organ → tissue → cell → organism')], why: [T('相似的細胞組成組織，組織組成器官，器官合作成為器官系統，系統組成個體。', 'Similar cells make tissues, tissues make organs, organs work together as systems, and systems make the organism.')] },
      { q: T('把紅血球放進清水中，紅血球會…', 'Red blood cells placed in pure water will…'), options: [T('吸水脹大甚至破裂', 'swell up and may burst'), T('失水皺縮', 'shrink and shrivel'), T('不變', 'stay the same')], why: [T('清水的水分濃度比細胞內高，水經由滲透作用進入細胞；動物細胞沒有細胞壁，可能會脹破。', 'Water is more concentrated outside, so it moves in by osmosis; with no cell wall the cells can burst.')] },
      { q: T('植物細胞中，有一個大的、儲存水分和物質的構造是…', 'In a plant cell, which large structure stores water and other substances?'), options: [T('液胞', 'The vacuole'), T('細胞核', 'The nucleus'), T('葉綠體', 'The chloroplast')], why: [T('成熟植物細胞通常有一個大液胞，儲存水分並讓細胞保持飽滿。', 'Mature plant cells usually have one big vacuole that stores water and keeps the cell firm.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g7-microscope', grades: [7, 7], subj: 'bio', sim: 'microscope',
    name: T('顯微鏡的使用與倍率', 'Using a microscope'),
    cur: { tw: TWB('顯微鏡的使用', 'the microscope'), us: 'NGSS MS-LS1-1' },
    verify: (v) => (v.ask === 'mag' ? v.e * v.o : v.ask === 'cells' ? v.n * (v.o1 / v.o2) ** 2 : v.ask === 'line' ? v.n * (v.o1 / v.o2) : (v.fov * 1000) / v.n),
    gen(r) {
      const ask = r.pick(['mag', 'cells', 'line', 'size', 'move']);
      if (ask === 'mag') { const e = r.pick([5, 10, 15]), o = r.pick([4, 10, 40, 100]);
        return { q: T(`顯微鏡的目鏡是 ${e}×、物鏡是 ${o}×，總放大倍率是多少倍？`, `A microscope has a ${e}× eyepiece and a ${o}× objective. What is the total magnification?`), ans: ansNum(e * o), vars: { e, o, ask },
          sol: [T('總放大倍率 = 目鏡倍率 × 物鏡倍率。', 'Total magnification = eyepiece × objective.'), T(`${e} × ${o} = ${e * o} 倍。`, `${e} × ${o} = ${e * o}×.`)] }; }
      if (ask === 'cells' || ask === 'line') { const o1 = 10, o2 = 40, n = ask === 'cells' ? r.pick([32, 48, 64, 80, 96, 160]) : r.pick([8, 12, 16, 20, 24]);
        const res = ask === 'cells' ? n / 16 : n / 4;
        return { q: ask === 'cells' ? T(`用 10× 物鏡看到整個視野中均勻布滿 ${n} 個細胞，換成 40× 物鏡（目鏡不變），視野中大約可以看到幾個細胞？`, `With the 10× objective, ${n} cells evenly fill the field of view. Switching to 40× (same eyepiece), about how many cells will fill the field?`)
          : T(`用 10× 物鏡時，視野直徑上排了一列 ${n} 個細胞。換成 40× 物鏡（目鏡不變），這一列大約可以看到幾個細胞？`, `With the 10× objective, a row of ${n} cells stretches across the field. Switching to 40× (same eyepiece), about how many cells fit across?`),
          ans: ansNum(res), vars: { n, o1, o2, ask },
          sol: [T('放大倍率變成 4 倍，視野的直徑變成原來的 1/4。', 'Magnification goes up 4 times, so the field’s diameter shrinks to 1/4.'), ask === 'cells' ? T(`視野面積變成 (1/4)² = 1/16，所以細胞數 ${n} ÷ 16 = ${res} 個。`, `The field’s area becomes (1/4)² = 1/16, so ${n} ÷ 16 = ${res} cells.`) : T(`一列的長度變成 1/4，所以 ${n} ÷ 4 = ${res} 個。`, `A row across shrinks to 1/4, so ${n} ÷ 4 = ${res} cells.`)],
          hint: ask === 'cells' ? T('面積是直徑的平方關係。', 'Area depends on the diameter squared.') : null };
      }
      if (ask === 'size') { const fov = r.pick([0.4, 0.5, 1.6, 2, 4]), n = r.pick([2, 4, 5, 8, 10, 20]);
        return { q: T(`顯微鏡視野的直徑是 ${num(fov)} 毫米（mm），剛好可以排下 ${n} 個細胞。每個細胞大約長幾微米（µm）？（1 mm = 1000 µm）`, `The field of view is ${num(fov)} mm across and exactly ${n} cells fit across it. About how long is each cell in micrometers (µm)? (1 mm = 1000 µm)`), ans: ansQty((fov * 1000) / n, 1, 'µm'), vars: { fov, n, ask },
          sol: [T(`視野直徑 = ${num(fov)} mm = ${num(fov * 1000)} µm。`, `Field diameter = ${num(fov)} mm = ${num(fov * 1000)} µm.`), T(`每個細胞 ≈ ${num(fov * 1000)} ÷ ${n} = ${num((fov * 1000) / n)} µm。`, `Each cell ≈ ${num(fov * 1000)} ÷ ${n} = ${num((fov * 1000) / n)} µm.`)] }; }
      const D = [['左上方', 'upper left'], ['右上方', 'upper right'], ['左下方', 'lower left'], ['右下方', 'lower right']], i = r.int(0, 3);
      return { q: T(`在複式顯微鏡下，要觀察的細胞在視野的${D[i][0]}。要把它移到視野中央，玻片應該往哪個方向移動？`, `Under a compound microscope, the cell you want is at the ${D[i][1]} of the field. Which way should you move the slide to bring it to the center?`),
        ans: ansChoice([T(D[i][0], D[i][1]), ...D.filter((_, j) => j !== i).map((d) => T(d[0], d[1]))]),
        sol: [T('複式顯微鏡的影像上下顛倒、左右相反，玻片移動的方向和影像移動的方向相反。', 'The image is flipped both ways, so the image moves opposite to the slide.'), T(`影像要往${D[3 - i][0]}移（往中央），玻片就要往${D[i][0]}移——口訣：「影像在哪，就往哪推」。`, `To move the image toward the center (to the ${D[3 - i][1]}), push the slide toward the ${D[i][1]} — “push the slide toward where the image is.”`)] };
    },
  },
  {
    id: 'g8-heredity', grades: [7, 9], subj: 'bio', sim: 'punnett',
    name: T('遺傳與棋盤方格', 'Heredity and Punnett squares'),
    cur: { tw: TWB('遺傳', 'heredity'), us: 'NGSS MS-LS3-2' },
    verify: (v) => v.p,
    gen(r) {
      const T3 = [['花色', 'flower color', 'P', ['紫花', 'purple'], ['白花', 'white']], ['種子形狀', 'seed shape', 'R', ['圓形', 'round'], ['皺皮', 'wrinkled']], ['植株高度', 'plant height', 'T', ['高莖', 'tall'], ['矮莖', 'short']], ['種子顏色', 'seed color', 'Y', ['黃色', 'yellow'], ['綠色', 'green']]];
      const [tz, te, A, dom, rec] = r.pick(T3), G = ['AA', 'Aa', 'aa'];
      const p1 = r.pick(G), p2 = r.pick(G), g = (x) => x.replace(/A/g, A).replace(/a/g, A.toLowerCase());
      const kids = []; for (const a of p1) for (const b of p2) kids.push([a, b].sort().join(''));
      const want = r.pick(['dom', 'rec', 'het', 'count']);
      const pd = kids.filter((k) => k.includes('A')).length / 4, ph = kids.filter((k) => k === 'Aa').length / 4;
      const sq = T(`棋盤方格：${g(p1)} × ${g(p2)} → ${kids.map(g).join('、')}。`, `Punnett square: ${g(p1)} × ${g(p2)} → ${kids.map(g).join(', ')}.`);
      const fr = (x) => ansChoice([T(FR[x][0], FR[x][1]), ...[0, 0.25, 0.5, 0.75, 1].filter((y) => y !== x).slice(0, 3).map((y) => T(FR[y][0], FR[y][1]))]);
      const pre = T(`豌豆的${tz}由一對基因控制，${dom[0]}（${A}）對${rec[0]}（${A.toLowerCase()}）為顯性。`, `In peas, ${te} is controlled by one gene pair; ${dom[1]} (${A}) is dominant over ${rec[1]} (${A.toLowerCase()}).`);
      if (want === 'dom') return { q: T(`${pre.zh}${g(p1)} 和 ${g(p2)} 雜交，子代表現${dom[0]}的機率是多少？`, `${pre.en} If ${g(p1)} is crossed with ${g(p2)}, what is the probability that an offspring is ${dom[1]}?`), fig: punnettSVG(p1, p2, A), ans: fr(pd), vars: { p: pd },
        sol: [T('每個親代把一對基因中的一個傳給子代，用棋盤方格列出四種組合。', 'Each parent passes on one of its two alleles; a Punnett square lists the four combinations.'), sq, T(`只要有一個 ${A} 就表現${dom[0]}：${pd * 4} / 4 = ${FR[pd][0]}。`, `Any offspring with at least one ${A} is ${dom[1]}: ${pd * 4} out of 4 = ${FR[pd][1]}.`)] };
      if (want === 'rec') return { q: T(`${pre.zh}${g(p1)} 和 ${g(p2)} 雜交，子代表現${rec[0]}的機率是多少？`, `${pre.en} If ${g(p1)} is crossed with ${g(p2)}, what is the probability that an offspring is ${rec[1]}?`), fig: punnettSVG(p1, p2, A), ans: fr(1 - pd), vars: { p: 1 - pd },
        sol: [T(`隱性性狀要兩個都是 ${A.toLowerCase()}（${g('aa')}）才會表現。`, `The recessive trait shows only with two recessive alleles (${g('aa')}).`), sq, T(`${g('aa')} 有 ${(1 - pd) * 4} 格：機率 ${FR[1 - pd][0]}。`, `${g('aa')} fills ${(1 - pd) * 4} box(es): probability ${FR[1 - pd][1]}.`)] };
      if (want === 'het') return { q: T(`${pre.zh}${g(p1)} 和 ${g(p2)} 雜交，子代基因型是 ${g('Aa')}（異型合子）的機率是多少？`, `${pre.en} If ${g(p1)} is crossed with ${g(p2)}, what is the probability that an offspring is ${g('Aa')} (heterozygous)?`), fig: punnettSVG(p1, p2, A), ans: fr(ph), vars: { p: ph },
        sol: [sq, T(`${g('Aa')} 有 ${ph * 4} 格：機率 ${FR[ph][0]}。`, `${g('Aa')} fills ${ph * 4} box(es): probability ${FR[ph][1]}.`)] };
      const N = r.pick([100, 200, 400, 800]);
      return { q: T(`${pre.zh}${g(p1)} 和 ${g(p2)} 雜交，得到 ${N} 株子代，理論上大約有幾株是${rec[0]}？`, `${pre.en} Crossing ${g(p1)} with ${g(p2)} gives ${N} offspring. In theory, about how many are ${rec[1]}?`), ans: ansNum(N * (1 - pd)), vars: { p: N * (1 - pd) },
        sol: [sq, T(`${rec[0]}（${g('aa')}）的機率是 ${FR[1 - pd][0]}。`, `The chance of ${rec[1]} (${g('aa')}) is ${FR[1 - pd][1]}.`), T(`${N} × ${1 - pd} = ${N * (1 - pd)} 株（實際數目會在這附近變動）。`, `${N} × ${1 - pd} = ${N * (1 - pd)} plants (the real count will vary around this).`)] };
    },
  },
  {
    id: 'g7-ecosystem', grades: [7, 7], subj: 'bio', sim: 'ecosystem',
    name: T('生態系與能量流動', 'Ecosystems and energy flow'),
    cur: { tw: TWB('生態系', 'ecosystems'), us: 'NGSS MS-LS2-3' },
    mixed: true,
    verify: (v) => v.E * 0.1 ** v.k,
    bank: [
      { q: T('生態系中能把動植物遺體分解成無機物、歸還給環境的是…', 'In an ecosystem, which organisms break down dead things and return the nutrients to the environment?'), options: [T('分解者（細菌、真菌）', 'Decomposers (bacteria and fungi)'), T('生產者', 'Producers'), T('消費者', 'Consumers')], why: [T('分解者把有機物分解成無機物，讓養分重新被植物利用，物質才能循環。', 'Decomposers turn dead matter back into simple nutrients that plants can reuse, so matter cycles.')] },
      { q: T('能量在生態系中如何流動？', 'How does energy move through an ecosystem?'), options: [T('單向流動，每一層都有大量能量以熱的形式散失', 'One way only, with lots lost as heat at each level'), T('不斷循環、不會減少', 'It cycles round and round without loss'), T('從消費者流向生產者', 'From consumers back to producers')], why: [T('能量從太陽 → 生產者 → 消費者單向流動，不會循環；物質（如碳、氮）才會循環。', 'Energy flows one way — Sun → producers → consumers — and doesn’t cycle; matter (carbon, nitrogen) does.')] },
      { q: T('為什麼食物鏈通常不會超過 4～5 層？', 'Why do food chains rarely have more than 4–5 levels?'), options: [T('每往上一層能量大約只剩 10%，太高層能量不夠', 'Only about 10% of the energy passes up each level, so there isn’t enough at the top'), T('動物不想吃太多種東西', 'Animals don’t want to eat many kinds of food'), T('因為太陽不夠亮', 'Because the Sun is not bright enough')], why: [T('大部分能量用在呼吸、活動並散失成熱，能傳到下一層的很少。', 'Most energy is used for living and lost as heat, so little passes up.')] },
      { q: T('一個池塘裡所有的吳郭魚合起來，叫做一個…', 'All the tilapia in one pond together form a…'), options: [T('族群', 'population'), T('群集（群落）', 'community'), T('生態系', 'ecosystem')], why: [T('同一時間、同一區域內同種生物的全部個體叫族群；所有族群合起來是群集；再加上非生物環境是生態系。', 'All individuals of one species in one area is a population; all populations together are a community; add the nonliving surroundings and it is an ecosystem.')] },
      { q: T('外來種（例如福壽螺）進入台灣的農田，常常造成什麼問題？', 'What problem do invasive species (such as the golden apple snail in Taiwan) often cause?'), options: [T('缺少天敵而大量繁殖，破壞本土生態和農作物', 'With no natural enemies they multiply and damage native wildlife and crops'), T('增加本土物種的數量', 'They increase native species'), T('完全沒有影響', 'They have no effect')], why: [T('外來種在新環境中常沒有天敵，族群快速擴張，和本土物種競爭或直接危害作物。', 'Invasive species often have no predators in their new home, so they spread fast, outcompete natives or harm crops.')] },
      { q: T('兔子和鹿都吃草，牠們之間的關係是…', 'Rabbits and deer both eat grass. Their relationship is…'), options: [T('競爭', 'competition'), T('捕食', 'predation'), T('寄生', 'parasitism')], why: [T('不同生物利用相同的有限資源，叫做競爭。', 'When different organisms use the same limited resource, they compete.')] },
    ],
    gen(r) {
      if (r.chance(0.45)) return pickItem(r, this.bank);
      const E = r.pick([10000, 20000, 50000, 100000]), k = r.int(2, 3), names = [['草', 'grass'], ['蝗蟲', 'grasshoppers'], ['青蛙', 'frogs'], ['蛇', 'snakes']];
      return { q: T(`食物鏈：草 → 蝗蟲 → 青蛙 → 蛇。草固定了 ${num(E)} 千焦（kJ）的能量，若每一層只有 10% 的能量傳給下一層，${names[k][0]}大約得到多少千焦？`, `Food chain: grass → grasshoppers → frogs → snakes. The grass captures ${num(E)} kJ. If only 10% passes to each next level, about how much energy reaches the ${names[k][1]}, in kJ?`),
        ans: ansQty(E * 0.1 ** k, 0, 'kJ'), vars: { E, k },
        sol: [T('每往上一層，能量大約只剩 10%（乘以 0.1）。', 'Each step up keeps about 10% (multiply by 0.1).'), T(`${names[k][0]}在第 ${k + 1} 層，往上了 ${k} 層：${num(E)} × 0.1${k > 1 ? `^${k}` : ''} = ${num(rnd(E * 0.1 ** k, 3))} kJ。`, `The ${names[k][1]} are ${k} steps up: ${num(E)} × 0.1${k > 1 ? `^${k}` : ''} = ${num(rnd(E * 0.1 ** k, 3))} kJ.`)] };
    },
  },
  {
    id: 'g7-body', grades: [7, 7], subj: 'bio',
    name: T('人體的器官系統', 'Human body systems'),
    cur: { tw: TWB('人體的構造與功能', 'the human body'), us: 'NGSS MS-LS1-3' },
    bank: [
      { q: T('食物中的養分主要在哪裡被消化和吸收？', 'Where are most nutrients from food digested and absorbed?'), options: [T('小腸', 'The small intestine'), T('大腸', 'The large intestine'), T('食道', 'The esophagus')], why: [T('小腸很長、內壁有很多絨毛，表面積大，是消化和吸收養分的主要地方。', 'The small intestine is long and lined with villi, giving a huge surface for digesting and absorbing nutrients.')] },
      { q: T('血液中負責運送氧氣的是…', 'Which part of blood carries oxygen?'), options: [T('紅血球', 'Red blood cells'), T('白血球', 'White blood cells'), T('血小板', 'Platelets')], why: [T('紅血球含有血紅素，可以和氧結合，把氧送到全身。', 'Red blood cells contain hemoglobin, which picks up oxygen and carries it around the body.')] },
      { q: T('肺泡的主要功能是…', 'What do the alveoli in the lungs do?'), options: [T('進行氧氣和二氧化碳的氣體交換', 'Exchange oxygen and carbon dioxide'), T('製造血球', 'Make blood cells'), T('消化食物', 'Digest food')], why: [T('肺泡壁很薄，外面包著微血管，氧氣進入血液、二氧化碳離開血液。', 'Alveoli have thin walls wrapped in capillaries: oxygen enters the blood and carbon dioxide leaves.')] },
      { q: T('從心臟把血液送到全身的血管叫…', 'Blood vessels carrying blood away from the heart are called…'), options: [T('動脈', 'arteries'), T('靜脈', 'veins'), T('微血管', 'capillaries')], why: [T('動脈把血從心臟送出去，靜脈把血送回心臟，微血管連接兩者並進行物質交換。', 'Arteries carry blood away from the heart, veins bring it back, and capillaries link them and exchange materials.')] },
      { q: T('過濾血液中的廢物、形成尿液的器官是…', 'Which organ filters wastes from the blood and makes urine?'), options: [T('腎臟', 'The kidneys'), T('肝臟', 'The liver'), T('胃', 'The stomach')], why: [T('腎臟過濾血液，把尿素等廢物和多餘水分形成尿液排出。', 'The kidneys filter the blood and remove wastes like urea, with extra water, as urine.')] },
      { q: T('手碰到很燙的東西會馬上縮回，這種不經大腦思考的反應是…', 'Touching something hot, your hand jerks back before you think. This is a…'), options: [T('反射', 'reflex'), T('學習行為', 'learned behavior'), T('荷爾蒙作用', 'hormone response')], why: [T('反射由脊髓等中樞直接處理，速度很快，可以保護身體。', 'A reflex is handled directly by the spinal cord, so it is very fast and protects the body.')] },
      { q: T('負責調節血糖、讓血糖降低的激素是…', 'Which hormone lowers blood sugar?'), options: [T('胰島素', 'Insulin'), T('腎上腺素', 'Adrenaline'), T('生長激素', 'Growth hormone')], why: [T('胰臟分泌胰島素，促使細胞吸收葡萄糖、肝臟儲存肝糖，使血糖下降。', 'The pancreas releases insulin, which helps cells take up glucose and the liver store it, lowering blood sugar.')] },
      { q: T('胃液中幫助消化蛋白質的酵素作用最好的環境是…', 'The protein-digesting enzyme in stomach juice works best in…'), options: [T('酸性', 'acidic conditions'), T('鹼性', 'basic conditions'), T('任何環境都一樣', 'any conditions equally')], why: [T('胃液含鹽酸，胃蛋白酶在酸性環境下活性最好。', 'Stomach juice contains hydrochloric acid, and pepsin works best in acid.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g9-earthquakes', grades: [9, 9], subj: 'earth', sim: 'earthquake',
    name: T('地震與板塊', 'Earthquakes and plates'),
    cur: { tw: TWE('地震與板塊運動', 'earthquakes and plate motion'), us: 'NGSS MS-ESS2-3' },
    mixed: true,
    verify: (v) => v.dt / (1 / v.vs - 1 / v.vp),
    bank: [
      { q: T('台灣位在哪兩個板塊的交界附近？', 'Taiwan lies near the boundary of which two plates?'), options: [T('菲律賓海板塊和歐亞板塊', 'The Philippine Sea Plate and the Eurasian Plate'), T('太平洋板塊和北美板塊', 'The Pacific and North American Plates'), T('非洲板塊和南美板塊', 'The African and South American Plates')], why: [T('菲律賓海板塊和歐亞板塊在台灣附近聚合碰撞，所以台灣多地震，也形成了中央山脈。', 'The Philippine Sea Plate and the Eurasian Plate converge at Taiwan, causing frequent earthquakes and building the Central Range.')] },
      { q: T('地震的「規模」和「震度」有什麼不同？', 'How is earthquake magnitude different from intensity?'), options: [T('規模表示釋放的能量，一次地震只有一個；震度表示各地搖晃程度，各地不同', 'Magnitude is the energy released (one value per quake); intensity is how strongly each place shakes (varies by place)'), T('兩個完全一樣', 'They are exactly the same'), T('震度是能量，規模是各地搖晃程度', 'Intensity is the energy; magnitude is the local shaking')], why: [T('規模描述地震本身的大小；震度描述某地感受到的搖晃，離震央愈遠通常震度愈小。', 'Magnitude describes the earthquake itself; intensity describes the shaking at a place, usually weaker farther from the epicenter.')] },
      { q: T('中洋脊是哪一種板塊交界？', 'A mid-ocean ridge is which kind of plate boundary?'), options: [T('張裂型', 'Divergent'), T('聚合型', 'Convergent'), T('錯動型', 'Transform')], why: [T('中洋脊是板塊分開的地方，岩漿上湧形成新的海洋地殼。', 'At a ridge the plates move apart and rising magma makes new ocean crust.')] },
      { q: T('喜馬拉雅山是怎麼形成的？', 'How were the Himalayas formed?'), options: [T('印度板塊和歐亞板塊兩塊大陸碰撞擠壓', 'The Indian and Eurasian continental plates collided'), T('火山爆發堆積', 'Volcanic eruptions piled up'), T('中洋脊張裂', 'A ridge pulled apart')], why: [T('兩個大陸板塊相撞，地殼被擠壓隆起成高山。', 'Two continents crashed together and squeezed the crust up into mountains.')] },
      { q: T('地震發生時，在室內最好的做法是…', 'During an earthquake indoors, the best thing to do is…'), options: [T('趴下、掩護、穩住，躲在堅固桌下', 'Drop, cover and hold on under a sturdy table'), T('立刻搭電梯下樓', 'Take the elevator down right away'), T('站在窗戶旁邊看', 'Stand by the window and watch')], why: [T('「趴下、掩護、穩住」可以保護頭頸，避免被掉落物打到；不要搭電梯。', 'Drop, cover and hold on protects your head and neck from falling objects; never use elevators.')] },
    ],
    gen(r) {
      if (r.chance(0.4)) return pickItem(r, this.bank);
      const [vp, vs, k] = r.pick([[6, 3, 6], [6, 4, 12], [8, 4, 8], [7.5, 5, 15]]), dt = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]);
      return { q: T(`某地震測站收到 P 波後 ${dt} 秒才收到 S 波。若 P 波速度 ${vp} km/s、S 波速度 ${vs} km/s，測站離震源大約多少公里？`, `A station records the S wave ${dt} s after the P wave. If P waves travel ${vp} km/s and S waves ${vs} km/s, about how far is the station from the earthquake, in km?`),
        ans: ansQty(dt * k, 0, 'km'), vars: { dt, vp, vs },
        sol: [T('設距離為 d：S 波比 P 波晚到的時間 = d/v<sub>S</sub> − d/v<sub>P</sub>。', 'Let the distance be d: the S − P gap = d/v<sub>S</sub> − d/v<sub>P</sub>.'), T(`1/${vs} − 1/${vp} = 1/${k}，所以每差 1 秒代表 ${k} 公里。`, `1/${vs} − 1/${vp} = 1/${k}, so each second of gap means ${k} km.`), T(`d = ${dt} × ${k} = ${dt * k} km。`, `d = ${dt} × ${k} = ${dt * k} km.`)] };
    },
  },
  {
    id: 'g9-weather', grades: [9, 9], subj: 'earth',
    name: T('天氣與氣候', 'Weather and climate'),
    cur: { tw: TWE('天氣與氣候變化', 'weather and climate'), us: 'NGSS MS-ESS2-5' },
    bank: [
      { q: T('冷鋒通過一個地方以後，天氣通常會…', 'After a cold front passes, the weather usually becomes…'), options: [T('氣溫下降、天氣轉晴', 'cooler and clearer'), T('氣溫上升、連續下雨很多天', 'warmer with many days of rain'), T('沒有變化', 'unchanged')], why: [T('冷鋒過境時冷空氣推擠暖空氣上升，常有短暫陣雨，通過後氣溫下降、天氣轉晴。', 'A cold front pushes warm air up, often with brief showers; afterward it turns cooler and clearer.')] },
      { q: T('台灣每年 5～6 月的「梅雨」，主要是什麼造成的？', 'What mainly causes Taiwan’s May–June “plum rain” season?'), options: [T('滯留鋒面在台灣附近徘徊', 'A stationary front lingering near Taiwan'), T('颱風', 'Typhoons'), T('冬季季風', 'The winter monsoon')], why: [T('冷暖氣團勢力相當，鋒面滯留在台灣附近，帶來連續的降雨。', 'Cold and warm air masses are evenly matched, so a front stalls near Taiwan and brings days of rain.')] },
      { q: T('颱風是在哪裡形成的？', 'Where do typhoons form?'), options: [T('溫暖的熱帶海洋上', 'Over warm tropical oceans'), T('寒冷的極地', 'Over cold polar regions'), T('沙漠上空', 'Over deserts')], why: [T('颱風需要溫暖的海水（約 26.5 °C 以上）提供大量水氣和能量。', 'Typhoons need warm sea water (about 26.5 °C or more) to supply moisture and energy.')] },
      { q: T('北半球颱風的風是怎麼繞著中心吹的？', 'In the Northern Hemisphere, how do a typhoon’s winds circle its center?'), options: [T('逆時針方向', 'Counterclockwise'), T('順時針方向', 'Clockwise'), T('直直吹向中心', 'Straight into the center')], why: [T('北半球低氣壓的風向中心逆時針旋轉吹入（科氏力的影響）。', 'Northern Hemisphere low-pressure winds spiral in counterclockwise (because of the Coriolis effect).')] },
      { q: T('「天氣」和「氣候」的差別是…', 'The difference between weather and climate is…'), options: [T('天氣是短時間的大氣狀況；氣候是長期（數十年）的平均狀況', 'Weather is the short-term state of the air; climate is the long-term (decades) average'), T('兩者完全一樣', 'They mean the same'), T('氣候是今天的狀況', 'Climate is today’s conditions')], why: [T('天氣變化很快；氣候是一個地區長期統計的平均特徵。', 'Weather changes quickly; climate is the long-term average pattern of a region.')] },
      { q: T('溫室氣體增加會造成全球暖化，主要是因為溫室氣體…', 'More greenhouse gases warm the planet mainly because they…'), options: [T('吸收地表放出的紅外線，讓熱留在大氣中', 'absorb infrared radiation from the ground and keep heat in the atmosphere'), T('讓陽光變得更亮', 'make sunlight brighter'), T('讓地球更靠近太陽', 'move Earth closer to the Sun')], why: [T('二氧化碳、甲烷等吸收並再放出紅外線，使熱不易散失到太空。', 'Carbon dioxide, methane and others absorb and re-emit infrared, so heat escapes to space less easily.')] },
      { q: T('台灣冬天吹的季風主要是什麼方向？', 'What direction does Taiwan’s winter monsoon mostly blow from?'), options: [T('東北風', 'Northeast'), T('西南風', 'Southwest'), T('正南風', 'Due south')], why: [T('冬季從大陸吹來東北季風，帶給北部和東北部濕冷的天氣；夏季吹西南季風。', 'In winter the northeast monsoon blows from the continent, bringing cold, damp weather to the north and northeast; in summer the monsoon comes from the southwest.')] },
      { q: T('高氣壓籠罩時，天氣通常…', 'Under high pressure the weather is usually…'), options: [T('晴朗穩定', 'fair and settled'), T('多雲下雨', 'cloudy and rainy'), T('颳颱風', 'stormy with typhoons')], why: [T('高氣壓的空氣下沉，不容易形成雲，所以天氣晴朗。', 'Air sinks in a high, which makes clouds hard to form, so the weather is fair.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g9-earth-moon', grades: [9, 9], subj: 'earth',
    name: T('地球、月球與太陽', 'Earth, Moon and Sun'),
    cur: { tw: TWE('晝夜、四季、月相、潮汐與日月食', 'day, seasons, phases, tides and eclipses'), us: 'NGSS MS-ESS1-1' },
    bank: [
      { q: T('潮汐主要是由什麼造成的？', 'What mainly causes the tides?'), options: [T('月球（和太陽）的引力', 'The pull of gravity from the Moon (and the Sun)'), T('風吹海面', 'Wind blowing on the sea'), T('地震', 'Earthquakes')], why: [T('月球引力在地球兩側造成海水隆起，地球自轉時各地就會漲潮、退潮。', 'The Moon’s gravity raises bulges of water on both sides of Earth; as Earth spins, places pass through high and low tide.')] },
      { q: T('一般每天大約會有幾次滿潮？', 'About how many high tides are there each day at most places?'), options: [T('2 次', 'Two'), T('1 次', 'One'), T('4 次', 'Four')], why: [T('地球兩側各有一個海水隆起，所以大多數地方一天約有兩次滿潮、兩次乾潮。', 'There is a bulge on each side of Earth, so most places get about two high and two low tides a day.')] },
      { q: T('大潮（潮差最大）發生在什麼時候？', 'When do spring tides (the biggest tidal range) happen?'), options: [T('新月和滿月', 'At new moon and full moon'), T('上弦月和下弦月', 'At the first and last quarter'), T('只有在冬天', 'Only in winter')], why: [T('新月和滿月時太陽、地球、月球排成一直線，引力合在一起，潮差最大。', 'At new and full moon the Sun, Earth and Moon line up, so their pulls add and the tidal range is largest.')] },
      { q: T('月食發生時，三個天體的位置是…', 'During a lunar eclipse the three bodies are arranged…'), options: [T('太陽 — 地球 — 月球（地球在中間）', 'Sun — Earth — Moon (Earth in the middle)'), T('太陽 — 月球 — 地球（月球在中間）', 'Sun — Moon — Earth (Moon in the middle)'), T('排成直角', 'at a right angle')], why: [T('月食是月球進入地球的影子，所以地球在太陽和月球中間，只會發生在滿月。', 'A lunar eclipse is the Moon passing into Earth’s shadow, so Earth is in the middle — it only happens at full moon.')] },
      { q: T('日食只可能發生在哪一種月相？', 'A solar eclipse can only happen at…'), options: [T('新月', 'new moon'), T('滿月', 'full moon'), T('上弦月', 'first quarter')], why: [T('日食是月球擋住太陽，月球在太陽和地球之間，就是新月的位置。', 'A solar eclipse is the Moon blocking the Sun, with the Moon between Sun and Earth — the new-moon position.')] },
      { q: T('為什麼不是每個月都有日食和月食？', 'Why don’t eclipses happen every month?'), options: [T('月球軌道和地球公轉軌道有大約 5° 的傾斜', 'The Moon’s orbit is tilted about 5° to Earth’s orbit'), T('月球每個月大小不同', 'The Moon changes size each month'), T('太陽有時候不發光', 'The Sun sometimes stops shining')], why: [T('因為軌道傾斜，大部分新月、滿月時三者沒有剛好排成直線。', 'Because of the tilt, at most new and full moons the three don’t line up exactly.')] },
      { q: T('我們總是只看到月球的同一面，是因為…', 'We always see the same side of the Moon because…'), options: [T('月球自轉一圈和繞地球公轉一圈的時間相同', 'the Moon spins once in the same time it takes to orbit Earth'), T('月球不會自轉', 'the Moon does not spin'), T('月球背面是透明的', 'the far side is transparent')], why: [T('月球的自轉週期等於公轉週期（約 27.3 天），所以同一面一直朝向地球。', 'The Moon’s spin period equals its orbital period (about 27.3 days), so one face always points at Earth.')] },
      { q: T('北極星在天空中幾乎不動，是因為…', 'Polaris barely moves in the sky because…'), options: [T('它幾乎就在地球自轉軸的延長線上', 'it lies almost exactly along Earth’s spin axis'), T('它是離地球最近的星', 'it is the closest star'), T('它是最亮的星', 'it is the brightest star')], why: [T('地球自轉時，天空看起來繞著自轉軸轉，靠近軸線的北極星幾乎不動。', 'As Earth spins, the sky seems to turn around the spin axis, and Polaris sits almost on that axis.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g9-rocks', grades: [9, 9], subj: 'earth', sim: 'plate-tectonics',
    name: T('岩石與地表的變化', 'Rocks and the changing surface'),
    cur: { tw: TWE('岩石與礦物、地表的變動', 'rocks, minerals and surface processes'), us: 'NGSS MS-ESS2-1' },
    bank: [
      { q: T('岩漿冷卻凝固形成的岩石叫…', 'Rock formed when magma cools and hardens is…'), options: [T('火成岩', 'igneous rock'), T('沉積岩', 'sedimentary rock'), T('變質岩', 'metamorphic rock')], why: [T('火成岩由岩漿冷凝形成，例如玄武岩、花岡岩。', 'Igneous rock forms from cooled magma — basalt and granite, for example.')] },
      { q: T('沉積物一層層堆積、被壓緊膠結而成的岩石是…', 'Rock made from layers of sediment pressed and cemented together is…'), options: [T('沉積岩', 'sedimentary rock'), T('火成岩', 'igneous rock'), T('變質岩', 'metamorphic rock')], why: [T('沉積岩常有層理，也常含有化石，例如砂岩、頁岩、石灰岩。', 'Sedimentary rocks often show layers and fossils — sandstone, shale, limestone.')] },
      { q: T('哪一種岩石最可能找到化石？', 'In which kind of rock are fossils most likely?'), options: [T('沉積岩', 'Sedimentary rock'), T('火成岩', 'Igneous rock'), T('都找得到，機會一樣', 'All equally')], why: [T('生物遺骸被沉積物掩埋後保存下來，所以化石多在沉積岩中；岩漿的高溫會摧毀生物遺骸。', 'Remains buried in sediment get preserved, so fossils are found in sedimentary rock; magma’s heat would destroy them.')] },
      { q: T('岩石在高溫高壓下，沒有熔化但礦物和組織改變，形成…', 'Rock changed by heat and pressure without melting becomes…'), options: [T('變質岩', 'metamorphic rock'), T('火成岩', 'igneous rock'), T('沉積岩', 'sedimentary rock')], why: [T('例如石灰岩變成大理岩、頁岩變成板岩。', 'For example limestone becomes marble and shale becomes slate.')] },
      { q: T('台灣東部太魯閣峽谷深而陡，主要是由什麼作用形成的？', 'Taroko Gorge in eastern Taiwan is deep and steep mainly because of…'), options: [T('河流侵蝕，加上地殼抬升', 'river erosion plus the land being pushed up'), T('火山爆發', 'volcanic eruptions'), T('風的堆積', 'wind deposits')], why: [T('立霧溪不斷向下侵蝕，同時地殼持續抬升，切出深峽谷。', 'The Liwu River keeps cutting down while the crust keeps rising, carving a deep gorge.')] },
      { q: T('河流出海口常形成三角洲，是因為…', 'Deltas form at river mouths because…'), options: [T('水流變慢，攜帶的沉積物堆積下來', 'the water slows down and drops its sediment'), T('海浪把沙推到河裡', 'waves push sand up the river'), T('火山在河口噴發', 'volcanoes erupt there')], why: [T('河水進入海洋後流速變慢，搬運力減弱，泥沙就沉積下來。', 'Entering the sea, the river slows and can no longer carry its load, so the sediment settles.')] },
      { q: T('地層通常的「疊置原理」是…', 'The law of superposition says that, normally…'), options: [T('下面的地層比上面的老', 'lower layers are older than upper ones'), T('上面的地層比下面的老', 'upper layers are older'), T('所有地層一樣老', 'all layers are the same age')], why: [T('沉積物一層層往上堆，沒有翻轉的話，愈下面愈早形成。', 'Sediment piles up layer on layer, so unless the rocks were overturned, lower means older.')] },
      { q: T('玄武岩和花岡岩都是火成岩，花岡岩的礦物顆粒比較大，是因為…', 'Granite and basalt are both igneous, but granite has bigger crystals because…'), options: [T('它在地底深處慢慢冷卻', 'it cooled slowly deep underground'), T('它在地表很快冷卻', 'it cooled quickly at the surface'), T('它含有化石', 'it contains fossils')], why: [T('岩漿冷卻得愈慢，礦物晶體有時間長得愈大。玄武岩在地表快速冷卻，顆粒細小。', 'The slower magma cools, the more time crystals have to grow. Basalt cools fast at the surface, so its grains are tiny.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g7-photosynthesis', grades: [7, 7], subj: 'bio',
    name: T('光合作用與呼吸作用', 'Photosynthesis and respiration'),
    cur: { tw: TWB('植物的營養與呼吸', 'plant nutrition and respiration'), us: 'NGSS MS-LS1-6' },
    bank: [
      { q: T('光合作用的原料是什麼？', 'What are the raw materials of photosynthesis?'), options: [T('二氧化碳和水', 'Carbon dioxide and water'), T('氧氣和葡萄糖', 'Oxygen and glucose'), T('氮氣和氧氣', 'Nitrogen and oxygen')], why: [T('6CO₂ + 6H₂O →（光、葉綠素）C₆H₁₂O₆ + 6O₂。', '6CO₂ + 6H₂O → (light, chlorophyll) C₆H₁₂O₆ + 6O₂.')] },
      { q: T('光合作用產生的氣體是…', 'Which gas does photosynthesis give off?'), options: [T('氧氣', 'Oxygen'), T('二氧化碳', 'Carbon dioxide'), T('氫氣', 'Hydrogen')], why: [T('光合作用把水分解，釋放出氧氣。', 'Photosynthesis splits water and releases oxygen.')] },
      { q: T('植物什麼時候進行呼吸作用？', 'When do plants carry out respiration?'), options: [T('白天和晚上都會', 'Day and night'), T('只有晚上', 'Only at night'), T('只有白天', 'Only in the daytime')], why: [T('呼吸作用是所有活細胞隨時都在進行的；光合作用才需要光。', 'All living cells respire all the time; only photosynthesis needs light.')] },
      { q: T('用碘液檢驗葉片，變成藍黑色表示葉片中有…', 'Iodine turns a leaf blue-black. This shows the leaf contains…'), options: [T('澱粉', 'starch'), T('蛋白質', 'protein'), T('脂肪', 'fat')], why: [T('碘液遇到澱粉變藍黑色，可證明葉片行光合作用製造了澱粉。', 'Iodine turns blue-black with starch, showing the leaf made starch by photosynthesis.')] },
      { q: T('葉片上讓氣體進出的小孔叫…', 'The tiny openings on leaves that let gases in and out are called…'), options: [T('氣孔', 'stomata'), T('葉脈', 'veins'), T('根毛', 'root hairs')], why: [T('氣孔多在葉的下表皮，由保衛細胞控制開關，也是水分蒸散的通道。', 'Stomata, mostly on the underside of the leaf, are opened and closed by guard cells and also let water vapor out.')] },
      { q: T('把一半葉片用黑紙包住照光一天，再用碘液檢驗，包住的部分…', 'Half a leaf is covered with black paper and left in light for a day. Tested with iodine, the covered half…'), options: [T('不會變藍黑色', 'does not turn blue-black'), T('變得更藍黑', 'turns darker blue-black'), T('變成紅色', 'turns red')], why: [T('沒有光就不能行光合作用、不會製造澱粉，所以不變色。這證明光合作用需要光。', 'With no light there is no photosynthesis and no starch, so it does not turn blue-black — showing light is needed.')] },
      { q: T('細胞呼吸作用的產物是…', 'What does cellular respiration produce?'), options: [T('二氧化碳、水和能量', 'Carbon dioxide, water and energy'), T('氧氣和葡萄糖', 'Oxygen and glucose'), T('澱粉和氧氣', 'Starch and oxygen')], why: [T('C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量。', 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy.')] },
      { q: T('植物從根吸收的水，主要經由什麼構造往上運送到葉？', 'Water absorbed by the roots travels up to the leaves mainly through…'), options: [T('木質部', 'xylem'), T('韌皮部', 'phloem'), T('表皮', 'the epidermis')], why: [T('木質部運送水分和礦物質往上；韌皮部運送葉製造的養分。', 'Xylem carries water and minerals upward; phloem carries the food made in the leaves.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g7-reproduction', grades: [7, 7], subj: 'bio',
    name: T('生殖與生長', 'Reproduction and growth'),
    cur: { tw: TWB('生殖', 'reproduction'), us: 'NGSS MS-LS1-4' },
    bank: [
      { q: T('有性生殖和無性生殖最大的差別是…', 'The main difference between sexual and asexual reproduction is…'), options: [T('有性生殖需要精子和卵結合，子代的遺傳組合有變化', 'sexual reproduction joins a sperm and an egg, so offspring get new gene combinations'), T('無性生殖的子代比較多樣', 'asexual offspring are more varied'), T('兩者完全相同', 'there is no difference')], why: [T('無性生殖的子代和親代的遺傳物質幾乎相同；有性生殖混合了雙親的基因，子代較多樣。', 'Asexual offspring are nearly identical to the parent; sexual reproduction mixes two parents’ genes, so offspring vary.')] },
      { q: T('馬鈴薯用「塊莖」長出新植株，屬於…', 'Growing new plants from potato tubers is…'), options: [T('營養器官繁殖（無性生殖）', 'vegetative propagation (asexual)'), T('有性生殖', 'sexual reproduction'), T('孢子繁殖', 'spore reproduction')], why: [T('用根、莖、葉等營養器官長出新個體，是無性生殖。', 'Making new plants from roots, stems or leaves is asexual reproduction.')] },
      { q: T('花朵中產生花粉的構造是…', 'Which part of a flower makes pollen?'), options: [T('雄蕊的花藥', 'The anther of the stamen'), T('雌蕊的柱頭', 'The stigma of the pistil'), T('花瓣', 'The petals')], why: [T('雄蕊的花藥產生花粉，花粉傳到雌蕊柱頭上叫做授粉。', 'The anther makes pollen; pollen landing on the stigma is pollination.')] },
      { q: T('受精後，雌蕊的子房會發育成…', 'After fertilization, the ovary of the flower develops into…'), options: [T('果實', 'the fruit'), T('種子', 'the seeds'), T('葉子', 'the leaves')], why: [T('子房發育成果實，子房內的胚珠發育成種子。', 'The ovary becomes the fruit, and the ovules inside become the seeds.')] },
      { q: T('讓生物生長、修補，產生和原來染色體數相同之細胞的分裂是…', 'Which cell division is used for growth and repair and keeps the chromosome number the same?'), options: [T('細胞分裂（有絲分裂）', 'Mitosis'), T('減數分裂', 'Meiosis'), T('受精作用', 'Fertilization')], why: [T('一般的細胞分裂讓生物生長、修補，子細胞和母細胞染色體數相同；減數分裂產生染色體數減半的生殖細胞。', 'Mitosis is for growth and repair and keeps the number; meiosis makes sex cells with half the number.')] },
      { q: T('人類的體細胞有 46 條染色體，精子或卵有幾條？', 'Human body cells have 46 chromosomes. How many does a sperm or egg have?'), options: ['23', '46', '92'], why: [T('生殖細胞經減數分裂，染色體減半為 23 條；精卵結合後恢復 46 條。', 'Sex cells are made by meiosis, which halves the number to 23; fertilization restores 46.')] },
      { q: T('青蛙的受精方式是…', 'How are frog eggs fertilized?'), options: [T('體外受精，在水中', 'Outside the body, in water'), T('體內受精', 'Inside the female’s body'), T('不需要受精', 'They aren’t fertilized')], why: [T('雌蛙在水中產卵，雄蛙同時排精，在水中完成受精。', 'The female lays eggs in water and the male releases sperm over them — external fertilization.')] },
      { q: T('複製羊「桃莉」的誕生屬於…', 'The cloned sheep “Dolly” came from…'), options: [T('無性生殖（複製）', 'asexual reproduction (cloning)'), T('一般的有性生殖', 'ordinary sexual reproduction'), T('孢子繁殖', 'spores')], why: [T('桃莉的遺傳物質來自一隻母羊的體細胞核，沒有精卵結合，屬於無性生殖。', 'Dolly’s DNA came from one sheep’s body-cell nucleus, with no sperm–egg union — asexual reproduction.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g7-classification', grades: [7, 7], subj: 'bio',
    name: T('生物的分類', 'Classifying living things'),
    cur: { tw: TWB('生物的分類', 'classification'), us: 'NGSS MS-LS4-2' },
    gen(r) {
      const G = [['哺乳類', 'mammals', ['海豚', 'dolphin'], ['鴨嘴獸', 'platypus'], ['蝙蝠', 'bat'], ['穿山甲', 'pangolin']], ['鳥類', 'birds', ['企鵝', 'penguin'], ['鴕鳥', 'ostrich'], ['台灣藍鵲', 'Taiwan blue magpie']], ['爬蟲類', 'reptiles', ['龜殼花', 'Taiwan habu (a snake)'], ['鱷魚', 'crocodile'], ['海龜', 'sea turtle']],
        ['兩生類', 'amphibians', ['青蛙', 'frog'], ['山椒魚', 'salamander']], ['魚類', 'fish', ['鯊魚', 'shark'], ['海馬', 'seahorse'], ['鮭魚', 'salmon']], ['昆蟲', 'insects', ['蜜蜂', 'bee'], ['螢火蟲', 'firefly'], ['獨角仙', 'rhinoceros beetle']], ['蛛形類', 'arachnids', ['蜘蛛', 'spider'], ['蠍子', 'scorpion']]];
      const i = r.int(0, G.length - 1), g = G[i], [az, ae] = r.pick(g.slice(2)), others = r.sample(G.filter((_, j) => j !== i), 3);
      const notes = { 海豚: ['雖然住在海裡，但用肺呼吸、胎生哺乳。', 'it lives in the sea but breathes air with lungs and nurses its young.'], 鴨嘴獸: ['雖然會生蛋，但有毛、用乳汁哺育幼兒。', 'it lays eggs but has fur and feeds its young milk.'], 蝙蝠: ['會飛但沒有羽毛，有毛、哺乳。', 'it flies but has fur, not feathers, and nurses its young.'], 企鵝: ['不會飛，但有羽毛、會生蛋。', 'it can’t fly but has feathers and lays eggs.'], 鯊魚: ['用鰓呼吸、有鰭。', 'it breathes with gills and has fins.'], 海馬: ['樣子奇特，但用鰓呼吸、有鰭，是魚。', 'it looks odd but breathes with gills and has fins.'], 蜘蛛: ['有 8 隻腳、身體分兩部分，不是昆蟲。', 'it has 8 legs and two body parts, so it is not an insect.'], 蠍子: ['有 8 隻腳，和蜘蛛同屬蛛形類。', 'it has 8 legs, like spiders.'] };
      const n = notes[az];
      return { q: T(`「${az}」屬於哪一類？`, `Which group does the ${ae} belong to?`), ans: ansChoice([T(g[0], g[1]), ...others.map((o) => T(o[0], o[1]))]),
        sol: [T('分類要看身體的構造特徵（毛、羽毛、鱗片、呼吸方式、腳的數目），不是看住在哪裡或會不會飛。', 'Group animals by body features (fur, feathers, scales, how they breathe, number of legs), not by where they live or whether they fly.'), T(`${az}是${g[0]}${n ? '：' + n[0] : '。'}`, `The ${ae} is one of the ${g[1]}${n ? ': ' + n[1] : '.'}`)] };
    },
  },
];

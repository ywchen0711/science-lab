// Practice units for grades 5–6. Format: see SPEC.md.
import { T, NAMES, ansNum, ansChoice, pickItem } from '../util.js';

const TW = (zh, en) => T(`國小高年級 ${zh}`, `Upper elementary · ${en}`);

export default [
  {
    id: 'g56-dissolve-mass',
    grades: [5, 6],
    subj: 'chem',
    name: T('溶解前後的重量', 'Mass before and after dissolving'),
    cur: { tw: T('國小高年級 水溶液', 'Upper elementary · solutions'), us: 'NGSS 5-PS1-2' },
    sim: 'dissolving',
    // independent check used by the test: mass is conserved
    verify: ({ t, w, s, cup }) => (t === 0 ? w + s : t === 1 ? (w + s) - w : cup + w + s),
    gen(r) {
      const [zh, en] = r.pick(NAMES);
      const [sz, se] = r.pick([['糖', 'sugar'], ['鹽', 'salt'], ['小蘇打', 'baking soda']]);
      const w = r.int(4, 30) * 10, s = r.int(2, 25), cup = r.int(5, 20) * 10;
      const t = r.int(0, 2);
      if (t === 0) return {
        q: T(`${zh}在 ${w} 公克的水裡加入 ${s} 公克的${sz}，攪拌到完全溶解。溶液的重量是多少公克？`, `${en} stirs ${s} g of ${se} into ${w} g of water until it all dissolves. What is the mass of the solution, in grams?`),
        ans: ansNum(w + s), vars: { t, w, s, cup },
        sol: [
          T(`${sz}溶解後看不見了，但它並沒有消失，只是分散成很小很小的粒子，混在水裡。`, `The ${se} seems to disappear, but it is still there — it has broken into tiny particles spread through the water.`),
          T(`所以溶液的重量 = 水的重量 + ${sz}的重量。`, `So mass of solution = mass of water + mass of ${se}.`),
          T(`${w} + ${s} = ${w + s} 公克。`, `${w} + ${s} = ${w + s} g.`),
        ],
        hint: T('溶解的東西還在不在水裡？', 'Is the dissolved stuff still in the water?'),
      };
      if (t === 1) return {
        q: T(`一杯溶液共 ${w + s} 公克，是把一些${sz}溶在 ${w} 公克的水裡做成的。溶了多少公克的${sz}？`, `A cup of solution has a mass of ${w + s} g. It was made by dissolving some ${se} in ${w} g of water. How many grams of ${se} were dissolved?`),
        ans: ansNum(s), vars: { t, w, s, cup },
        sol: [
          T(`溶液的重量 = 水 + 溶質（被溶解的東西）。`, `Mass of solution = water + solute (the thing that dissolved).`),
          T(`${sz}的重量 = ${w + s} − ${w} = ${s} 公克。`, `Mass of ${se} = ${w + s} − ${w} = ${s} g.`),
        ],
      };
      return {
        q: T(`把裝了 ${w} 公克水的杯子（杯子重 ${cup} 公克）和 ${s} 公克的${sz}一起放在秤上，秤出 ${cup + w + s} 公克。把${sz}倒進水裡溶解後，再把杯子放回秤上（${sz}的包裝紙拿走了）。秤會顯示多少公克？`,
          `A cup (${cup} g) holding ${w} g of water is on a scale together with ${s} g of ${se}: the scale reads ${cup + w + s} g. The ${se} is poured in and dissolves, and the cup goes back on the scale. What does the scale read now, in grams?`),
        ans: ansNum(cup + w + s), vars: { t, w, s, cup },
        sol: [
          T(`溶解時沒有任何東西跑出杯子，也沒有東西加進來。`, `Nothing leaves the cup and nothing is added while it dissolves.`),
          T(`物質的總重量不會因為溶解而改變（質量守恆）。`, `Dissolving does not change the total mass (mass is conserved).`),
          T(`所以秤還是顯示 ${cup + w + s} 公克。`, `So the scale still reads ${cup + w + s} g.`),
        ],
      };
    },
  },
  {
    id: 'g56-pendulum-ideas',
    grades: [5, 6],
    subj: 'phys',
    name: T('擺的週期', 'What changes a pendulum’s period?'),
    cur: { tw: T('國小高年級 擺的規律', 'Upper elementary · pendulums'), us: 'NGSS 3-PS2-2' },
    sim: 'pendulum',
    bank: [
      { q: T('兩個擺的繩長一樣，一個擺錘 50 公克，另一個 200 公克，從同樣角度放手。哪一個擺得比較快？', 'Two pendulums have the same string length. One bob is 50 g, the other 200 g. Both are released from the same angle. Which swings faster?'),
        options: [T('一樣快', 'They swing at the same rate'), T('200 公克的比較快', 'The 200 g one'), T('50 公克的比較快', 'The 50 g one')],
        why: [T('擺的週期只和繩長（以及重力）有關，和擺錘的重量無關。', 'A pendulum’s period depends on the string length (and gravity), not on the mass of the bob.'), T('所以兩個擺擺動的快慢一樣。', 'So both swing at the same rate.')] },
      { q: T('想讓擺鐘走快一點（週期變短），應該怎麼做？', 'A pendulum clock runs slow. How do you make its pendulum swing faster?'),
        options: [T('把擺的長度縮短', 'Make the pendulum shorter'), T('把擺的長度加長', 'Make the pendulum longer'), T('換一個比較重的擺錘', 'Use a heavier bob'), T('讓它擺得更大', 'Make it swing wider')],
        why: [T('擺長愈短，週期愈短，擺得愈快。', 'A shorter pendulum has a shorter period, so it swings faster.'), T('重量和擺幅（不太大時）都幾乎不影響週期。', 'The mass and the size of the swing (if not huge) hardly change the period.')] },
      { q: T('做擺的實驗時，為什麼要測量擺 10 次的時間，再除以 10？', 'In a pendulum experiment, why do we time 10 swings and divide by 10?'),
        options: [T('讓按碼錶的誤差變小，結果比較準', 'It makes stopwatch errors smaller, so the result is more accurate'), T('因為擺第一次比較慢', 'Because the first swing is slower'), T('讓擺錘變重', 'To make the bob heavier')],
        why: [T('人按碼錶總會早一點或晚一點按。', 'People always press the stopwatch a little early or late.'), T('量 10 次的總時間，同樣的按錶誤差被平均分給 10 次，每一次的誤差就只剩十分之一。', 'Timing 10 swings spreads that same error over 10 swings, so each swing’s error is only a tenth as big.')] },
      { q: T('甲擺長 25 公分，乙擺長 100 公分。哪一個擺的週期比較長？', 'Pendulum A is 25 cm long, pendulum B is 100 cm long. Which has the longer period?'),
        options: [T('乙（100 公分）', 'B (100 cm)'), T('甲（25 公分）', 'A (25 cm)'), T('一樣長', 'They are equal')],
        why: [T('擺長愈長，週期愈長。', 'The longer the pendulum, the longer the period.'), T('乙的長度是甲的 4 倍，週期是甲的 2 倍。', 'B is 4 times as long as A, so its period is 2 times as long.')] },
      { q: T('同一個擺，把擺錘拉得比較高再放手（擺幅比較大），每擺一次的時間會…', 'The same pendulum is released from higher up (a wider swing). The time for each swing…'),
        options: [T('幾乎不變', 'hardly changes'), T('變成兩倍', 'doubles'), T('變成一半', 'halves')],
        why: [T('擺幅不太大時，擺的週期幾乎和擺幅無關，這叫「擺的等時性」。', 'For swings that are not too wide, the period hardly depends on the size of the swing — pendulums keep nearly equal time.')] },
      { q: T('做「擺長會不會影響週期」的實驗時，哪一件事應該保持不變？', 'Testing whether length affects the period, what should stay the same?'),
        options: [T('擺錘的重量和放手的角度', 'The mass of the bob and the release angle'), T('擺的長度', 'The length of the pendulum'), T('什麼都可以一起改', 'Everything can change together')],
        why: [T('公平的實驗只改變要研究的一件事（擺長），其他條件都要相同。', 'A fair test changes only the thing being studied (the length) and keeps everything else the same.')] },
      { q: T('擺的週期是指什麼？', 'What is the period of a pendulum?'),
        options: [T('來回擺動一次（去再回來）所花的時間', 'The time for one full swing — there and back'), T('擺錘的重量', 'The weight of the bob'), T('繩子的長度', 'The length of the string')],
        why: [T('週期是完成一次完整來回擺動所需的時間。', 'The period is the time for one complete back-and-forth swing.')] },
      { q: T('老爺鐘冬天走得太快（擺得太快），要怎麼調整？', 'A grandfather clock runs fast. How should you adjust its pendulum?'),
        options: [T('把擺錘往下移，讓擺長變長', 'Move the bob down to make the pendulum longer'), T('把擺錘往上移，讓擺長變短', 'Move the bob up to make it shorter'), T('換一個更重的擺錘', 'Use a heavier bob')],
        why: [T('擺長愈長，週期愈長、擺得愈慢，鐘就會變慢。', 'A longer pendulum has a longer period and swings more slowly, so the clock slows down.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g5-solubility', grades: [5, 6], subj: 'chem', sim: 'dissolving',
    name: T('溶解量算一算', 'How much can dissolve?'),
    cur: { tw: TW('水溶液', 'solutions'), us: 'NGSS 5-PS1-2' },
    verify: ({ S, w, add, ask }) => (ask === 'max' ? (S * w) / 100 : ask === 'left' ? add - (S * w) / 100 : (add * 100) / S),
    gen(r) {
      const [sz, se, S] = r.pick([['食鹽', 'salt', 36], ['砂糖', 'sugar', 200], ['小蘇打', 'baking soda', 10], ['明礬', 'alum', 12]]);
      const ask = r.pick(['max', 'left', 'water']);
      const w = r.pick([50, 100, 150, 200, 250, 300]), max = (S * w) / 100;
      const pre = T(`假設在 20 °C 時，100 公克的水最多能溶解 ${S} 公克${sz}。`, `Suppose that at 20 °C, 100 g of water can dissolve at most ${S} g of ${se}.`);
      if (ask === 'max') return { q: T(`${pre.zh}那麼 ${w} 公克的水最多能溶解幾公克${sz}？`, `${pre.en} How many grams of ${se} can ${w} g of water dissolve at most?`), ans: ansNum(max), vars: { S, w, ask },
        sol: [T('水量變成幾倍，能溶解的量也變成幾倍。', 'Dissolving amount grows in proportion to the amount of water.'), T(`${w} 公克是 100 公克的 ${w / 100} 倍，所以 ${S} × ${w / 100} = ${max} 公克。`, `${w} g is ${w / 100} times 100 g, so ${S} × ${w / 100} = ${max} g.`)] };
      if (ask === 'left') {
        const add = max + r.int(1, 6) * (S >= 36 ? 5 : 2);
        return { q: T(`${pre.zh}在 ${w} 公克的水中加入 ${add} 公克${sz}，充分攪拌後，杯底會剩下幾公克沒有溶解？`, `${pre.en} ${add} g of ${se} is stirred into ${w} g of water. How many grams stay undissolved on the bottom?`), ans: ansNum(add - max), vars: { S, w, add, ask },
          sol: [T(`${w} 公克水最多溶解 ${S} × ${w} ÷ 100 = ${max} 公克。`, `${w} g of water dissolves at most ${S} × ${w} ÷ 100 = ${max} g.`), T(`沒溶解的 = ${add} − ${max} = ${add - max} 公克，這時溶液已經「飽和」。`, `Undissolved = ${add} − ${max} = ${add - max} g; the solution is saturated.`)] };
      }
      const add = S * r.pick([0.5, 1, 1.5, 2, 3]);
      return { q: T(`${pre.zh}要把 ${add} 公克${sz}全部溶解，最少需要幾公克的水？`, `${pre.en} What is the least amount of water (in grams) that can dissolve all of ${add} g of ${se}?`), ans: ansNum((add * 100) / S), vars: { S, add, ask },
        sol: [T(`每 100 公克水溶 ${S} 公克，${add} 公克是 ${S} 的 ${add / S} 倍。`, `Each 100 g of water dissolves ${S} g; ${add} g is ${add / S} times ${S}.`), T(`需要水 100 × ${add / S} = ${(add * 100) / S} 公克。`, `Water needed: 100 × ${add / S} = ${(add * 100) / S} g.`)] };
    },
  },
  {
    id: 'g6-concentration', grades: [6, 6], subj: 'chem', sim: 'dissolving',
    name: T('溶液的濃度（重量百分濃度）', 'Concentration (percent by mass)'),
    cur: { tw: TW('水溶液的濃度', 'concentration'), us: 'NGSS 5-PS1-2' },
    verify: ({ s, w, ask }) => (ask === 'p' ? (100 * s) / (s + w) : ask === 's' ? s : w),
    gen(r) {
      const p = r.pick([5, 10, 20, 25, 40]), tot = r.pick([100, 200, 300, 400, 500]), s = (tot * p) / 100, w = tot - s;
      const [sz, se] = r.pick([['糖', 'sugar'], ['鹽', 'salt']]);
      const [nz, ne] = r.pick(NAMES), ask = r.pick(['p', 's', 'w']);
      if (ask === 'p') return { q: T(`${nz}把 ${s} 公克${sz}溶在 ${w} 公克水中。這杯${sz}水的濃度是百分之幾？`, `${ne} dissolves ${s} g of ${se} in ${w} g of water. What is the concentration, in percent?`), ans: ansNum(p), vars: { s, w, ask },
        sol: [T('濃度（%）= 溶質重 ÷ 溶液重 × 100%，溶液重 = 溶質 + 水。', 'Concentration (%) = mass of solute ÷ mass of solution × 100%, where solution = solute + water.'), T(`溶液重 = ${s} + ${w} = ${tot} 公克。`, `Solution = ${s} + ${w} = ${tot} g.`), T(`${s} ÷ ${tot} × 100% = ${p}%。`, `${s} ÷ ${tot} × 100% = ${p}%.`)], hint: T('別忘了溶液的重量要把糖或鹽也算進去！', 'Remember the solution’s mass includes the sugar or salt too!') };
      if (ask === 's') return { q: T(`要配 ${tot} 公克、濃度 ${p}% 的${sz}水，需要幾公克${sz}？`, `To make ${tot} g of ${p}% ${se} water, how many grams of ${se} do you need?`), ans: ansNum(s), vars: { s, w, ask },
        sol: [T('溶質重 = 溶液重 × 濃度。', 'Mass of solute = mass of solution × concentration.'), T(`${tot} × ${p}% = ${tot} × ${p / 100} = ${s} 公克。`, `${tot} × ${p}% = ${tot} × ${p / 100} = ${s} g.`)] };
      return { q: T(`要配 ${tot} 公克、濃度 ${p}% 的${sz}水，需要幾公克的水？`, `To make ${tot} g of ${p}% ${se} water, how many grams of water do you need?`), ans: ansNum(w), vars: { s, w, ask },
        sol: [T(`${sz}的重量 = ${tot} × ${p}% = ${s} 公克。`, `Mass of ${se} = ${tot} × ${p}% = ${s} g.`), T(`水 = 溶液 − ${sz} = ${tot} − ${s} = ${w} 公克。`, `Water = solution − ${se} = ${tot} − ${s} = ${w} g.`)] };
    },
  },
  {
    id: 'g5-light', grades: [5, 6], subj: 'phys', sim: 'light',
    name: T('光的反射與折射', 'Reflection and refraction'),
    cur: { tw: TW('光', 'light'), us: 'NGSS 4-PS4-2' },
    mixed: true,
    bank: [
      { q: T('插在水杯裡的筷子看起來像折斷了，是因為光的…', 'A chopstick in a glass of water looks bent because light…'), options: [T('折射', 'refracts (bends)'), T('反射', 'reflects'), T('被水吸光', 'is absorbed by the water')], why: [T('光從水進入空氣時偏折（折射），所以水中的部分看起來位置不同。', 'Light bends (refracts) as it leaves the water, so the part underwater looks shifted.')] },
      { q: T('我們能看見不會發光的書本，是因為…', 'We can see a book (which gives off no light) because…'), options: [T('光照到書本反射進我們的眼睛', 'light bounces off it into our eyes'), T('眼睛會發光照亮書本', 'our eyes shine light on it'), T('書本自己發光', 'the book glows')], why: [T('光照到物體反射，反射光進入眼睛，我們才看得見。', 'Light bounces off the object and into our eyes — that is how we see it.')] },
      { q: T('光在空氣中前進的路徑是…', 'In air, light travels…'), options: [T('直線', 'in straight lines'), T('彎彎曲曲', 'in wavy curves'), T('繞著物體轉', 'around objects')], why: [T('光沿直線前進，所以擋住光會形成影子。', 'Light travels in straight lines, which is why blocking it makes a shadow.')] },
      { q: T('從水面上看游泳池底，池底看起來比實際…', 'Looking into a swimming pool from above, the bottom looks…'), options: [T('比較淺', 'shallower than it really is'), T('比較深', 'deeper than it really is'), T('一樣深', 'exactly as deep')], why: [T('光從水射入空氣時偏折，讓池底看起來比較淺，所以下水要小心。', 'Light bending as it leaves the water makes the bottom look shallower — be careful when jumping in!')] },
      { q: T('放大鏡（凸透鏡）可以把陽光聚在一點，是利用光的…', 'A magnifying glass focuses sunlight to a point using…'), options: [T('折射', 'refraction'), T('反射', 'reflection'), T('影子', 'shadows')], why: [T('凸透鏡讓光穿過時偏折、會聚到焦點。', 'A convex lens bends the light passing through it so the rays meet at a focus.')] },
      { q: T('白光穿過三稜鏡會分成彩色，這說明白光…', 'White light through a prism splits into colors. This shows white light…'), options: [T('由多種色光組成', 'is made of many colors'), T('被三稜鏡染色了', 'was dyed by the prism'), T('變成了熱', 'turned into heat')], why: [T('不同顏色的光偏折程度不同，所以被分開，就像彩虹一樣。', 'Each color bends by a different amount, so they spread apart — just like a rainbow.')] },
    ],
    gen(r) {
      if (r.chance(0.4)) return pickItem(r, this.bank);
      const i = r.int(10, 80);
      if (r.chance(0.5)) return { q: T(`光照到平面鏡，入射角是 ${i}°，反射角是幾度？`, `Light hits a flat mirror with an angle of incidence of ${i}°. What is the angle of reflection, in degrees?`), ans: ansNum(i),
        sol: [T('反射定律：入射角 = 反射角（都是光線和法線的夾角）。', 'Law of reflection: angle of incidence = angle of reflection (both measured from the normal).'), T(`所以反射角是 ${i}°。`, `So the angle of reflection is ${i}°.`)] };
      const g = 90 - i;
      return { q: T(`一道光和鏡面的夾角是 ${g}°。反射角是幾度？`, `A ray makes an angle of ${g}° with the mirror’s surface. What is the angle of reflection, in degrees?`), ans: ansNum(i),
        sol: [T('入射角是光線和「法線」（垂直鏡面的線）的夾角，不是和鏡面的夾角。', 'The angle of incidence is measured from the normal (the line perpendicular to the mirror), not from the mirror.'), T(`入射角 = 90° − ${g}° = ${i}°。`, `Angle of incidence = 90° − ${g}° = ${i}°.`), T(`反射角 = 入射角 = ${i}°。`, `Angle of reflection = angle of incidence = ${i}°.`)], hint: T('先畫出法線。', 'Draw the normal first.') };
    },
  },
  {
    id: 'g5-food-chain', grades: [5, 6], subj: 'bio', sim: 'food-web',
    name: T('食物鏈', 'Food chains'),
    cur: { tw: TW('生物與環境', 'living things and the environment'), us: 'NGSS 5-LS2-1' },
    gen(r) {
      const CH = [[['稻子', 'rice plant'], ['蝗蟲', 'grasshopper'], ['青蛙', 'frog'], ['蛇', 'snake'], ['老鷹', 'eagle']], [['青草', 'grass'], ['兔子', 'rabbit'], ['狐狸', 'fox']], [['藻類', 'algae'], ['小魚', 'small fish'], ['大魚', 'big fish'], ['海鳥', 'seabird']],
        [['樹葉', 'leaves'], ['毛毛蟲', 'caterpillar'], ['麻雀', 'sparrow'], ['貓頭鷹', 'owl']], [['水草', 'water plants'], ['蝌蚪', 'tadpole'], ['水蠆（蜻蜓幼蟲）', 'dragonfly nymph'], ['魚', 'fish']]];
      const ch = r.pick(CH), arrow = (l) => ch.map((x) => x[l]).join(' → '), t = r.int(0, 3);
      const intro = T(`食物鏈：${arrow(0)}`, `Food chain: ${arrow(1)}`);
      if (t === 0) return { q: T(`${intro.zh}。其中哪一個是生產者？`, `${intro.en}. Which one is the producer?`), ans: ansChoice([T(ch[0][0], ch[0][1]), ...ch.slice(1, 4).map((x) => T(x[0], x[1]))]),
        sol: [T('生產者是能自己製造養分的綠色植物（或藻類），通常在食物鏈的第一個。', 'The producer is the green plant (or alga) that makes its own food, usually first in the chain.'), T(`這條食物鏈的生產者是${ch[0][0]}。`, `Here the producer is the ${ch[0][1]}.`)] };
      if (t === 1) { const i = r.int(1, ch.length - 1), w = ch.filter((_, j) => j !== i - 1).slice(0, 3);
        return { q: T(`${intro.zh}。${ch[i][0]}吃的是什麼？`, `${intro.en}. What does the ${ch[i][1]} eat?`), ans: ansChoice([T(ch[i - 1][0], ch[i - 1][1]), ...w.map((x) => T(x[0], x[1]))]),
          sol: [T('箭頭從「被吃的」指向「吃牠的」。', 'Arrows point from the food to the eater.'), T(`指向${ch[i][0]}的是${ch[i - 1][0]}，所以${ch[i][0]}吃${ch[i - 1][0]}。`, `The arrow into the ${ch[i][1]} comes from the ${ch[i - 1][1]}, so it eats the ${ch[i - 1][1]}.`)] }; }
      if (t === 2 && ch.length >= 3) { const i = r.int(1, ch.length - 2);
        return { q: T(`${intro.zh}。如果${ch[i + 1][0]}全部消失，${ch[i][0]}的數量一開始會怎樣？`, `${intro.en}. If all the ${ch[i + 1][1]} disappeared, what would happen to the ${ch[i][1]} at first?`),
          ans: ansChoice([T('增加', 'It would increase'), T('減少', 'It would decrease'), T('不會改變', 'It would not change')]),
          sol: [T(`${ch[i + 1][0]}是吃${ch[i][0]}的天敵。`, `The ${ch[i + 1][1]} eats the ${ch[i][1]}.`), T(`天敵消失，被吃的變少，所以${ch[i][0]}一開始會增加（之後可能因為食物不夠又減少）。`, `With its predator gone, fewer are eaten, so the ${ch[i][1]} would increase at first (later it might drop again when food runs short).`)] }; }
      const top = ch[ch.length - 1];
      return { q: T(`${intro.zh}。哪一個位在這條食物鏈的最高層（沒有天敵）？`, `${intro.en}. Which one is at the top of this chain (nothing here eats it)?`), ans: ansChoice([T(top[0], top[1]), ...ch.slice(0, Math.min(3, ch.length - 1)).map((x) => T(x[0], x[1]))]),
        sol: [T('食物鏈最後一個，是沒有被這條鏈中其他生物吃掉的最高級消費者。', 'The last one in the chain is the top consumer — nothing else in the chain eats it.'), T(`答案是${top[0]}。`, `It is the ${top[1]}.`)] };
    },
  },
  {
    id: 'g5-solar-system', grades: [5, 6], subj: 'earth', sim: 'seasons',
    name: T('太陽系', 'The solar system'),
    cur: { tw: TW('太陽系與星空', 'the solar system and the sky'), us: 'NGSS 5-ESS1-1' },
    gen(r) {
      const P = [['水星', 'Mercury', 4879], ['金星', 'Venus', 12104], ['地球', 'Earth', 12756], ['火星', 'Mars', 6792], ['木星', 'Jupiter', 142984], ['土星', 'Saturn', 120536], ['天王星', 'Uranus', 51118], ['海王星', 'Neptune', 49528]];
      const t = r.int(0, 3);
      if (t === 0) { const i = r.int(0, 7), w = r.sample(P.filter((_, j) => j !== i), 3);
        return { q: T(`從太陽往外數，第 ${i + 1} 顆行星是哪一顆？`, `Counting outward from the Sun, which is planet number ${i + 1}?`), ans: ansChoice([T(P[i][0], P[i][1]), ...w.map((x) => T(x[0], x[1]))]),
          sol: [T('行星順序：水、金、地、火、木、土、天王、海王。', 'In order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.'), T(`第 ${i + 1} 顆是${P[i][0]}。`, `Number ${i + 1} is ${P[i][1]}.`)] }; }
      if (t === 1) { const s = r.sample(P, 4), big = s.reduce((a, b) => (b[2] > a[2] ? b : a));
        return { q: T(`下面哪一顆行星最大？`, `Which of these planets is the largest?`), ans: ansChoice([T(big[0], big[1]), ...s.filter((x) => x !== big).map((x) => T(x[0], x[1]))]),
          sol: [T(`直徑（公里）：${s.map((x) => `${x[0]} ${x[2].toLocaleString('en-US')}`).join('、')}。`, `Diameters (km): ${s.map((x) => `${x[1]} ${x[2].toLocaleString('en-US')}`).join(', ')}.`), T(`最大的是${big[0]}。木星是太陽系最大的行星。`, `The largest is ${big[1]}. Jupiter is the biggest planet of all.`)] }; }
      return pickItem(r, [
        { q: T('太陽系中，會自己發光的是哪一個？', 'Which object in the solar system makes its own light?'), options: [T('太陽', 'The Sun'), T('月球', 'The Moon'), T('木星', 'Jupiter'), T('金星', 'Venus')], why: [T('太陽是恆星，會自己發光；行星和衛星只是反射太陽光。', 'The Sun is a star that makes its own light; planets and moons only reflect sunlight.')] },
        { q: T('地球繞太陽一圈大約需要多久？', 'How long does Earth take to go around the Sun?'), options: [T('一年（約 365 天）', 'One year (about 365 days)'), T('一天', 'One day'), T('一個月', 'One month')], why: [T('地球公轉一圈約 365.25 天，就是一年；自轉一圈是一天。', 'One trip around the Sun takes about 365.25 days — a year. One spin is a day.')] },
        { q: T('白天和黑夜是怎麼產生的？', 'What causes day and night?'), options: [T('地球自轉', 'Earth spinning on its axis'), T('地球繞太陽公轉', 'Earth orbiting the Sun'), T('太陽繞地球轉', 'The Sun going around Earth')], why: [T('地球每天自轉一圈，面向太陽的一面是白天，背向的一面是黑夜。', 'Earth spins once a day; the side facing the Sun has day and the other side has night.')] },
        { q: T('哪一顆行星有很明顯的大光環？', 'Which planet has big, bright rings?'), options: [T('土星', 'Saturn'), T('火星', 'Mars'), T('水星', 'Mercury')], why: [T('土星的環由冰和岩石碎片組成，用小望遠鏡就看得到。', 'Saturn’s rings are made of ice and rock pieces; a small telescope shows them.')] },
        { q: T('「紅色星球」是指哪一顆行星？', 'Which planet is called the “Red Planet”?'), options: [T('火星', 'Mars'), T('金星', 'Venus'), T('海王星', 'Neptune')], why: [T('火星表面的岩石含有氧化鐵（鐵鏽），看起來紅紅的。', 'Mars’s rocks contain iron oxide (rust), which makes it look red.')] },
        { q: T('太陽系中離太陽最近的行星是哪一顆？', 'Which planet is closest to the Sun?'), options: [T('水星', 'Mercury'), T('金星', 'Venus'), T('地球', 'Earth')], why: [T('水星最靠近太陽，繞一圈只要 88 天。', 'Mercury is closest and goes around the Sun in only 88 days.')] },
      ]);
    },
  },
  {
    id: 'g5-seasons-sky', grades: [5, 6], subj: 'earth', sim: 'seasons',
    name: T('四季與太陽的位置', 'Seasons and the Sun’s path'),
    cur: { tw: TW('太陽與四季', 'the Sun and the seasons'), us: 'NGSS 5-ESS1-2' },
    bank: [
      { q: T('地球有四季，主要是因為…', 'Earth has seasons mainly because…'), options: [T('地軸傾斜，一年中陽光照射的角度和白天長短會改變', 'its axis is tilted, so the Sun’s angle and day length change through the year'), T('地球離太陽有時近有時遠', 'Earth is sometimes nearer, sometimes farther from the Sun'), T('太陽的亮度一年會改變', 'the Sun’s brightness changes during the year')], why: [T('地軸傾斜約 23.5°，讓一年中正午太陽高度和晝長改變。地球其實在 1 月最靠近太陽。', 'Earth’s axis tilts about 23.5°, changing the noon Sun height and day length. Earth is actually closest to the Sun in January.')] },
      { q: T('在台灣，一年中白天最長的一天是哪一個節氣？', 'In Taiwan, which day of the year has the longest daylight?'), options: [T('夏至（約 6 月 21 日）', 'The June solstice (about June 21)'), T('冬至（約 12 月 22 日）', 'The December solstice (about Dec 22)'), T('春分（約 3 月 21 日）', 'The March equinox (about March 21)')], why: [T('夏至時太陽直射北回歸線附近，北半球白天最長。', 'At the June solstice the Sun is overhead near the Tropic of Cancer, giving the Northern Hemisphere its longest day.')] },
      { q: T('春分和秋分這兩天，白天和黑夜的長度…', 'On the March and September equinoxes, day and night are…'), options: [T('大約一樣長', 'about equally long'), T('白天比較長', 'longer in the day'), T('黑夜比較長', 'longer at night')], why: [T('春分、秋分時太陽直射赤道，全世界晝夜大約等長，各約 12 小時。', 'At the equinoxes the Sun is overhead at the equator, so everywhere has about 12 hours each of day and night.')] },
      { q: T('台灣夏天中午的太陽，比冬天中午的太陽…', 'In Taiwan, the noon Sun in summer is … than in winter.'), options: [T('高', 'higher'), T('低', 'lower'), T('一樣高', 'just as high')], why: [T('夏天正午太陽高度高，陽光比較直射，所以比較熱。', 'The summer noon Sun is higher, so sunlight hits more directly and it is hotter.')] },
      { q: T('當台灣是夏天的時候，澳洲是什麼季節？', 'When it is summer in Taiwan, what season is it in Australia?'), options: [T('冬天', 'Winter'), T('夏天', 'Summer'), T('春天', 'Spring')], why: [T('澳洲在南半球，季節和北半球相反。', 'Australia is in the Southern Hemisphere, where the seasons are reversed.')] },
      { q: T('太陽一天中在天空的位置改變，主要是因為…', 'The Sun seems to move across the sky each day mainly because…'), options: [T('地球自轉', 'Earth spins'), T('太陽繞著地球跑', 'the Sun circles Earth'), T('雲在移動', 'clouds are moving')], why: [T('地球由西向東自轉，所以看起來太陽東升西落。', 'Earth spins from west to east, so the Sun appears to rise in the east and set in the west.')] },
      { q: T('陽光直射時比斜射時溫度高，是因為…', 'Direct sunlight heats more than slanted sunlight because…'), options: [T('同樣的陽光集中照在比較小的面積上', 'the same sunlight is concentrated on a smaller area'), T('直射的陽光比較靠近', 'direct sunlight comes from closer'), T('斜射的光是冷的', 'slanted light is cold')], why: [T('斜射時同樣的光分散到比較大的地面，每一塊地面分到的能量比較少。', 'Slanted light spreads the same energy over more ground, so each patch gets less.')] },
      { q: T('北極在夏至前後會出現什麼現象？', 'What happens at the North Pole around the June solstice?'), options: [T('永晝：太陽整天不下山', 'Midnight sun: the Sun never sets'), T('永夜：一整天都黑', 'Polar night: dark all day'), T('一天有兩次日出', 'Two sunrises a day')], why: [T('夏至時北極傾向太陽，整天都照得到陽光，叫做永晝。', 'In June the North Pole tilts toward the Sun and stays in sunlight all day — the midnight sun.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g5-water-cycle', grades: [5, 6], subj: 'earth', sim: 'water-cycle',
    name: T('水循環與天氣', 'The water cycle and weather'),
    cur: { tw: TW('水的循環與天氣', 'the water cycle and weather'), us: 'NGSS 5-ESS2-1' },
    bank: [
      { q: T('水循環的動力主要來自…', 'What mainly powers the water cycle?'), options: [T('太陽', 'The Sun'), T('月亮', 'The Moon'), T('風車', 'Windmills')], why: [T('太陽的熱讓水蒸發，驅動整個水循環（重力讓雨落下、河流流動）。', 'The Sun’s heat evaporates water and drives the cycle (gravity brings rain down and makes rivers flow).')] },
      { q: T('雲是由什麼組成的？', 'What are clouds made of?'), options: [T('很多小水滴或小冰晶', 'Countless tiny water droplets or ice crystals'), T('水蒸氣（看不見的氣體）', 'Water vapor (invisible gas)'), T('煙', 'Smoke')], why: [T('水蒸氣上升冷卻凝結成小水滴或冰晶，大量聚集就是雲。水蒸氣本身是看不見的。', 'Rising vapor cools and condenses into droplets or ice crystals; together they form clouds. Vapor itself is invisible.')] },
      { q: T('高山上的空氣通常比平地…', 'Air on high mountains is usually … than in the lowlands.'), options: [T('冷', 'colder'), T('熱', 'warmer'), T('一樣溫度', 'the same temperature')], why: [T('每升高 1 公里，氣溫大約下降 6.5 °C，所以高山比較冷。', 'Air cools about 6.5 °C per km of height, so mountains are colder.')] },
      { q: T('下過雨後，雨水最後可能到哪裡？', 'After it rains, where can the rainwater end up?'), options: [T('以上都有可能', 'Any of these'), T('流進河流再回到海洋', 'Into rivers and back to the sea'), T('滲入地下成為地下水', 'Into the ground as groundwater'), T('再蒸發回到空氣中', 'Back into the air by evaporation')], why: [T('雨水可能流成河、滲入地下或再次蒸發，水在海洋、天空和陸地之間不斷循環。', 'Rainwater can run off into rivers, soak into the ground or evaporate again — water keeps cycling between sea, sky and land.')] },
      { q: T('清晨草葉上的露水是怎麼形成的？', 'How does morning dew form on grass?'), options: [T('空氣中的水蒸氣遇冷凝結', 'Water vapor in the air condenses on cool grass'), T('草自己流汗', 'The grass sweats'), T('昨晚下雨留下來的', 'It is left over from rain')], why: [T('夜晚草葉變冷，附近空氣中的水蒸氣在上面凝結成水滴。', 'At night the grass cools, and water vapor in the air condenses on it as drops.')] },
      { q: T('台灣夏天的午後雷陣雨，是因為…', 'Taiwan’s summer afternoon thunderstorms happen because…'), options: [T('地面被曬熱，濕熱空氣快速上升冷卻成雲', 'the ground heats up and warm, moist air rises fast, cools and forms clouds'), T('海水在下午變冷', 'the sea cools in the afternoon'), T('月亮把雲吸過來', 'the Moon pulls clouds in')], why: [T('白天陽光強，地面附近的濕熱空氣上升，冷卻凝結成厚厚的積雨雲，下午就下起大雨。', 'Strong sun heats moist air near the ground; it rises, cools and builds tall storm clouds that pour rain in the afternoon.')] },
      { q: T('衣服在下列哪種天氣最容易晾乾？', 'In which weather do clothes dry fastest?'), options: [T('晴天、有風、空氣乾燥', 'Sunny, breezy and dry'), T('陰天、無風、潮濕', 'Cloudy, still and humid'), T('下雨天', 'Rainy')], why: [T('溫度高、風大、空氣乾燥時，水蒸發得最快。', 'Water evaporates fastest when it is warm, windy and the air is dry.')] },
      { q: T('天氣預報中的「相對溼度 90%」表示…', 'A forecast of “90% relative humidity” means…'), options: [T('空氣中的水蒸氣很多，接近飽和', 'the air holds lots of water vapor, close to full'), T('有 90% 的機會下雨', 'there is a 90% chance of rain'), T('90% 的天空被雲遮住', '90% of the sky is cloudy')], why: [T('相對溼度表示空氣中的水蒸氣有多接近它能容納的最大量，愈高愈潮濕。', 'Relative humidity tells how close the air is to holding as much water vapor as it can; higher means muggier.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g6-acid-base', grades: [5, 6], subj: 'chem',
    name: T('酸性、中性、鹼性', 'Acidic, neutral or basic?'),
    cur: { tw: TW('水溶液的酸鹼性', 'acids and bases'), us: 'NGSS 5-PS1-3' },
    gen(r) {
      const S = [['檸檬汁', 'lemon juice', 'a'], ['白醋', 'white vinegar', 'a'], ['汽水', 'soda pop', 'a'], ['柳橙汁', 'orange juice', 'a'], ['食鹽水', 'salt water', 'n'], ['糖水', 'sugar water', 'n'], ['純水', 'pure water', 'n'],
        ['小蘇打水', 'baking soda water', 'b'], ['肥皂水', 'soapy water', 'b'], ['石灰水', 'limewater', 'b'], ['洗衣粉溶液', 'laundry detergent water', 'b']];
      const [zh, en, k] = r.pick(S), name = { a: ['酸性', 'acidic'], n: ['中性', 'neutral'], b: ['鹼性', 'basic'] };
      const t = r.int(0, 1);
      if (t === 0) return { q: T(`${zh}是酸性、中性還是鹼性？`, `Is ${en} acidic, neutral or basic?`), ans: ansChoice([T(name[k][0], name[k][1]), ...['a', 'n', 'b'].filter((x) => x !== k).map((x) => T(name[x][0], name[x][1]))]),
        sol: [T('酸性：檸檬汁、醋、汽水、果汁。中性：純水、食鹽水、糖水。鹼性：小蘇打水、肥皂水、石灰水、洗衣粉。', 'Acidic: lemon juice, vinegar, soda, fruit juice. Neutral: pure water, salt water, sugar water. Basic: baking soda, soap, limewater, detergent.'), T(`${zh}是${name[k][0]}。`, `${en[0].toUpperCase() + en.slice(1)} is ${name[k][1]}.`)] };
      const res = { a: [T('藍色石蕊試紙變紅色', 'Blue litmus turns red'), T('紅色石蕊試紙變藍色', 'Red litmus turns blue'), T('兩種試紙都不變色', 'Neither paper changes')],
        b: [T('紅色石蕊試紙變藍色', 'Red litmus turns blue'), T('藍色石蕊試紙變紅色', 'Blue litmus turns red'), T('兩種試紙都不變色', 'Neither paper changes')],
        n: [T('兩種試紙都不變色', 'Neither paper changes'), T('藍色石蕊試紙變紅色', 'Blue litmus turns red'), T('紅色石蕊試紙變藍色', 'Red litmus turns blue')] }[k];
      return { q: T(`把紅色和藍色石蕊試紙分別沾${zh}，會看到什麼？`, `Red and blue litmus paper are dipped in ${en}. What do you see?`), ans: ansChoice(res),
        sol: [T('酸性使藍色石蕊試紙變紅；鹼性使紅色石蕊試紙變藍；中性兩種都不變。', 'Acids turn blue litmus red; bases turn red litmus blue; neutral solutions change neither.'), T(`${zh}是${name[k][0]}，所以${res[0].zh}。`, `${en[0].toUpperCase() + en.slice(1)} is ${name[k][1]}, so: ${res[0].en.toLowerCase()}.`)] };
    },
  },
  {
    id: 'g6-combustion', grades: [5, 6], subj: 'chem',
    name: T('燃燒與滅火', 'Burning and putting out fires'),
    cur: { tw: TW('燃燒與滅火', 'combustion and fire safety'), us: 'NGSS 5-PS1-4' },
    bank: [
      { q: T('燃燒需要哪三個條件？', 'What three things does burning need?'), options: [T('可燃物、氧氣（助燃物）、達到燃點的溫度', 'Fuel, oxygen and enough heat (the ignition temperature)'), T('水、空氣、陽光', 'Water, air and sunlight'), T('木頭、二氧化碳、冰', 'Wood, carbon dioxide and ice')], why: [T('這三個條件叫「燃燒三要素」，缺一個就無法燃燒。', 'These are the fire triangle; take away any one and the fire goes out.')] },
      { q: T('用杯子蓋住燃燒的蠟燭，火很快熄滅，是因為…', 'A cup placed over a burning candle puts it out because…'), options: [T('杯子裡的氧氣用完了', 'the oxygen inside runs out'), T('杯子太冷', 'the cup is too cold'), T('蠟燭被壓扁了', 'the candle is squashed')], why: [T('蓋住後沒有新鮮空氣進來，氧氣用完就無法燃燒（隔絕助燃物）。', 'Covering it stops fresh air from coming in; when the oxygen is used up, it can’t burn.')] },
      { q: T('森林火災時開出一條「防火巷」（砍掉一排樹），是利用哪一種滅火方法？', 'Clearing a firebreak (a strip without trees) to stop a forest fire works by…'), options: [T('移除可燃物', 'removing the fuel'), T('隔絕氧氣', 'cutting off the oxygen'), T('降低溫度', 'cooling it down')], why: [T('沒有可以燒的東西，火就無法延燒過去。', 'With nothing to burn, the fire can’t spread across.')] },
      { q: T('用水澆熄營火，主要是…', 'Pouring water on a campfire mainly…'), options: [T('降低溫度到燃點以下', 'cools it below its ignition temperature'), T('增加氧氣', 'adds oxygen'), T('增加可燃物', 'adds fuel')], why: [T('水吸收大量的熱，讓溫度降到燃點以下。', 'Water soaks up lots of heat, cooling the fuel below the temperature it needs to burn.')] },
      { q: T('油鍋起火時應該怎麼做？', 'A pan of cooking oil catches fire. What should you do?'), options: [T('關火並蓋上鍋蓋', 'Turn off the heat and cover the pan with a lid'), T('馬上澆水', 'Pour water on it'), T('用扇子搧', 'Fan it')], why: [T('油比水輕，澆水會讓熱油濺出、火勢擴大。蓋上鍋蓋可以隔絕氧氣。', 'Water makes the hot oil spatter and spreads the fire. A lid cuts off the oxygen.')] },
      { q: T('蠟燭燃燒後產生的氣體中，哪一種會讓澄清石灰水變混濁？', 'A burning candle gives off a gas that turns clear limewater cloudy. Which gas?'), options: [T('二氧化碳', 'Carbon dioxide'), T('氧氣', 'Oxygen'), T('氮氣', 'Nitrogen')], why: [T('二氧化碳會讓澄清石灰水變混濁，可以用來檢驗燃燒產生了二氧化碳。', 'Carbon dioxide turns limewater milky, so it shows that burning produced CO₂.')] },
      { q: T('把正在燃燒的線香放進裝滿氧氣的瓶子裡，會怎樣？', 'A glowing incense stick is put into a jar full of oxygen. What happens?'), options: [T('燒得更旺，甚至起火', 'It glows brighter or bursts into flame'), T('立刻熄滅', 'It goes out at once'), T('沒有改變', 'Nothing changes')], why: [T('氧氣可以幫助燃燒（助燃），氧氣愈多燒得愈旺。', 'Oxygen helps things burn, so more oxygen makes it burn more fiercely.')] },
      { q: T('下面哪一個最容易點燃？', 'Which of these catches fire most easily?'), options: [T('細碎的木屑', 'Fine wood shavings'), T('一整根大木頭', 'A whole thick log'), T('三者一樣容易', 'They are all equally easy')], why: [T('細碎的木屑和空氣接觸的面積大，容易達到燃點，燒得比較快。', 'Fine shavings have lots of surface touching the air, so they heat up and catch fire quickly.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g6-speed', grades: [6, 6], subj: 'phys',
    name: T('速率', 'Speed'),
    cur: { tw: TW('運動與速率', 'motion and speed'), us: 'NGSS 3-PS2-2' },
    verify: ({ d, t, ask }) => (ask === 'v' ? d / t : ask === 'd' ? d : t),
    gen(r) {
      const [zh, en] = r.pick(NAMES), ask = r.pick(['v', 'd', 't']);
      const kind = r.pick([['跑步', 'runs', 'm', 's', [2, 3, 4, 5, 6, 8]], ['騎腳踏車', 'rides a bike', 'm', 's', [4, 5, 6, 8, 10]], ['坐火車', 'rides a train', 'km', 'h', [60, 80, 90, 120, 150]], ['開車', 'drives', 'km', 'h', [40, 50, 60, 80, 100]]]);
      const v = r.pick(kind[4]), t = kind[3] === 's' ? r.pick([10, 20, 25, 30, 40, 50, 60, 100]) : r.pick([2, 3, 4, 5]), d = v * t;
      const U = { m: ['公尺', 'm'], km: ['公里', 'km'], s: ['秒', 's'], h: ['小時', 'h'] }, du = U[kind[2]], tu = U[kind[3]], vu = [`${du[0]}/${tu[0]}`, `${du[1]}/${tu[1]}`];
      if (ask === 'v') return { q: T(`${zh}${kind[0]}，${t} ${tu[0]}走了 ${d} ${du[0]}。平均速率是每${tu[0]}幾${du[0]}？`, `${en} ${kind[1]} ${d} ${du[1]} in ${t} ${tu[1]}. What is the average speed in ${vu[1]}?`), ans: ansNum(v), vars: { d, t, ask },
        sol: [T('速率 = 距離 ÷ 時間。', 'Speed = distance ÷ time.'), T(`${d} ÷ ${t} = ${v}（${vu[0]}）。`, `${d} ÷ ${t} = ${v} ${vu[1]}.`)] };
      if (ask === 'd') return { q: T(`${zh}${kind[0]}，平均速率每${tu[0]} ${v} ${du[0]}，${t} ${tu[0]}可以走多遠（${du[0]}）？`, `${en} ${kind[1]} at an average of ${v} ${vu[1]}. How far (in ${du[1]}) does that take them in ${t} ${tu[1]}?`), ans: ansNum(d), vars: { d, t, ask },
        sol: [T('距離 = 速率 × 時間。', 'Distance = speed × time.'), T(`${v} × ${t} = ${d}（${du[0]}）。`, `${v} × ${t} = ${d} ${du[1]}.`)] };
      return { q: T(`${zh}${kind[0]}，平均速率每${tu[0]} ${v} ${du[0]}，走 ${d} ${du[0]}要幾${tu[0]}？`, `${en} ${kind[1]} at an average of ${v} ${vu[1]}. How many ${tu[1] === 'h' ? 'hours' : 'seconds'} does ${d} ${du[1]} take?`), ans: ansNum(t), vars: { d, t, ask },
        sol: [T('時間 = 距離 ÷ 速率。', 'Time = distance ÷ speed.'), T(`${d} ÷ ${v} = ${t}（${tu[0]}）。`, `${d} ÷ ${v} = ${t} ${tu[1]}.`)] };
    },
  },
  {
    id: 'g6-machines', grades: [5, 6], subj: 'phys',
    name: T('簡單機械', 'Simple machines'),
    cur: { tw: TW('簡單機械（槓桿、滑輪、輪軸、齒輪）', 'simple machines'), us: 'NGSS 3-PS2-1' },
    bank: [
      { q: T('旗竿頂端的「定滑輪」有什麼作用？', 'What does the fixed pulley at the top of a flagpole do?'), options: [T('改變施力方向（往下拉旗子往上升）', 'Changes the direction of the force (pull down, flag goes up)'), T('讓你省一半的力', 'Halves the force you need'), T('讓旗子變輕', 'Makes the flag lighter')], why: [T('定滑輪不省力，但可以改變施力的方向，比較方便。', 'A fixed pulley doesn’t reduce the force, but it changes its direction, which is handy.')] },
      { q: T('「動滑輪」（跟著重物一起移動的滑輪）可以…', 'A movable pulley (one that moves with the load) can…'), options: [T('省力，大約只要一半的力', 'save force — about half the force is needed'), T('改變方向但不省力', 'change direction but not save force'), T('讓重物變重', 'make the load heavier')], why: [T('動滑輪由兩段繩子一起拉住重物，每段只要出一半的力（但要拉兩倍長的繩子）。', 'Two rope segments share the load, so each needs only half the force — but you pull twice as much rope.')] },
      { q: T('用螺絲起子轉螺絲，起子的握把粗、尖端細，這是哪一種簡單機械？', 'A screwdriver has a thick handle and a thin tip. Which simple machine is it?'), options: [T('輪軸', 'A wheel and axle'), T('滑輪', 'A pulley'), T('斜面', 'A ramp')], why: [T('握把是「輪」、尖端是「軸」，在大的輪上施力可以省力。', 'The handle is the wheel and the tip is the axle; turning the big wheel takes less force.')] },
      { q: T('腳踏車踩踏板的大齒輪帶動後輪的小齒輪，大齒輪轉一圈，小齒輪會…', 'On a bike, the big front gear drives a small rear gear. For one turn of the big gear, the small gear…'), options: [T('轉好幾圈', 'turns several times'), T('只轉一圈', 'turns once'), T('轉半圈', 'turns half a turn')], why: [T('鏈條帶動相同數目的齒，大齒輪齒數多，小齒輪要轉好幾圈，所以騎得快。', 'The chain moves the same number of teeth on each gear. The big gear has more teeth, so the small gear spins several times — the bike goes fast.')] },
      { q: T('把重物推上卡車，用比較長、比較平緩的斜板會…', 'Pushing a heavy box onto a truck, a longer, gentler ramp…'), options: [T('比較省力，但要推比較長的距離', 'takes less force but a longer distance'), T('比較費力', 'takes more force'), T('完全不用力', 'takes no force at all')], why: [T('斜面愈平緩愈省力，但移動的距離變長，做的功不會變少。', 'A gentler slope needs less force, but you push farther — you don’t do less work.')] },
      { q: T('剪刀、開瓶器、翹翹板，屬於哪一種簡單機械？', 'Scissors, a bottle opener and a seesaw are all…'), options: [T('槓桿', 'levers'), T('滑輪', 'pulleys'), T('齒輪', 'gears')], why: [T('它們都有支點、施力點和抗力點，是槓桿。', 'Each has a pivot, an effort point and a load point — they are levers.')] },
      { q: T('用槓桿抬重物，想要省力，支點應該靠近…', 'To lift a heavy load with a lever using little force, the pivot should be close to…'), options: [T('重物', 'the load'), T('施力的手', 'your hands'), T('槓桿的正中間', 'the exact middle')], why: [T('支點靠近重物，施力臂長、抗力臂短，就能省力。', 'With the pivot near the load, your effort arm is long and the load arm short, so you need less force.')] },
      { q: T('水龍頭的把手、門把、方向盤，都是利用…', 'A tap handle, a doorknob and a steering wheel all use…'), options: [T('輪軸', 'a wheel and axle'), T('斜面', 'a ramp'), T('動滑輪', 'a movable pulley')], why: [T('在大圈（輪）上施力，帶動小圈（軸）轉動，比較省力。', 'Turning the big circle (wheel) turns the small one (axle) with less force.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
];

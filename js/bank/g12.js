// Practice units for grades 1–2 (國小低年級 生活課程). Format: see SPEC.md.
import { T, ansChoice, ansNum, pickItem } from '../util.js';

const TW = (zh, en) => T(`國小低年級 生活課程 ${zh}`, `Lower elementary (Life Curriculum) · ${en}`);
const big = (e) => `<span style="font-size:2.6rem;line-height:1.2">${e}</span>`;

// ---- pictures ----
function magnetsSVG(a, b) {
  // two bar magnets: left shows [x|a], right shows [b|y] — the facing ends are a and b
  const col = (p) => (p === 'N' ? '#e5484d' : '#3b7be0'), other = (p) => (p === 'N' ? 'S' : 'N');
  const bar = (x, l, r) => `<rect x="${x}" y="20" width="60" height="40" rx="6" fill="${col(l)}"/><rect x="${x + 60}" y="20" width="60" height="40" rx="6" fill="${col(r)}"/>
    <text x="${x + 30}" y="47" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">${l}</text><text x="${x + 90}" y="47" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">${r}</text>`;
  return `<svg class="fig" viewBox="0 0 330 80" width="330" height="80">${bar(10, other(a), a)}${bar(200, b, other(b))}<text x="165" y="47" font-size="20" text-anchor="middle" class="f-txt">? ?</text></svg>`;
}
function thermoSVG(t) {
  const y = (v) => 200 - v * 4;   // 0–45 °C
  let ticks = '';
  for (let v = 0; v <= 44; v += 2) ticks += `<line x1="50" x2="${v % 10 ? 58 : 64}" y1="${y(v)}" y2="${y(v)}" class="f-line" stroke-width="1.5"/>${v % 10 ? '' : `<text x="70" y="${y(v) + 5}" font-size="14" class="f-txt">${v}</text>`}`;
  return `<svg class="fig" viewBox="0 0 120 250" width="110" height="230"><rect x="35" y="10" width="16" height="200" rx="8" class="f-soft"/><circle cx="43" cy="222" r="16" fill="#e5484d" class="f-line" stroke-width="1.5"/>
    <rect x="39" y="${y(t)}" width="8" height="${222 - y(t)}" fill="#e5484d"/>${ticks}<text x="95" y="30" font-size="14" class="f-txt">°C</text></svg>`;
}

// ---- data ----
const MAG = [['迴紋針', 'paper clip', true], ['鐵釘', 'iron nail', true], ['鐵製螺絲', 'iron screw', true], ['安全別針', 'safety pin', true], ['鐵罐', 'steel can', true],
  ['木筷', 'wooden chopstick', false], ['塑膠尺', 'plastic ruler', false], ['橡皮擦', 'eraser', false], ['鋁箔紙', 'aluminum foil', false], ['玻璃杯', 'glass cup', false], ['紙張', 'sheet of paper', false], ['銅線', 'copper wire', false], ['布', 'piece of cloth', false]];
const FLOAT = [['木塊', 'wooden block', '🪵', true], ['蘋果', 'apple', '🍎', true], ['乒乓球', 'ping-pong ball', '🏓', true], ['塑膠小鴨', 'rubber duck', '🦆', true], ['樹葉', 'leaf', '🍃', true], ['冰塊', 'ice cube', '🧊', true],
  ['石頭', 'rock', '🪨', false], ['硬幣', 'coin', '🪙', false], ['鐵釘', 'iron nail', '🔩', false], ['玻璃彈珠', 'glass marble', '🔮', false], ['鑰匙', 'key', '🔑', false], ['湯匙（金屬）', 'metal spoon', '🥄', false]];
const LIVING = [['小狗', 'dog', '🐕', true], ['大樹', 'tree', '🌳', true], ['蝴蝶', 'butterfly', '🦋', true], ['小草', 'grass', '🌱', true], ['魚', 'fish', '🐟', true], ['蘑菇', 'mushroom', '🍄', true], ['小鳥', 'bird', '🐦', true], ['花', 'flower', '🌷', true],
  ['石頭', 'rock', '🪨', false], ['玩具車', 'toy car', '🚗', false], ['雲', 'cloud', '☁️', false], ['書本', 'book', '📕', false], ['椅子', 'chair', '🪑', false], ['鉛筆', 'pencil', '✏️', false], ['機器人玩具', 'toy robot', '🤖', false]];
const SENSES = [['眼睛（視覺）', 'eyes (sight)', '👀'], ['耳朵（聽覺）', 'ears (hearing)', '👂'], ['鼻子（嗅覺）', 'nose (smell)', '👃'], ['舌頭（味覺）', 'tongue (taste)', '👅'], ['皮膚（觸覺）', 'skin (touch)', '✋']];
const SENSE_Q = [[0, '看彩虹有幾種顏色', 'see the colors of a rainbow'], [0, '分辨紅綠燈', 'tell red and green traffic lights apart'], [1, '聽見鳥叫聲', 'hear a bird singing'], [1, '知道有人在敲門', 'know someone is knocking on the door'],
  [2, '聞到花香', 'smell a flower'], [2, '發現麵包烤焦了的味道', 'notice the smell of burnt toast'], [3, '嚐出檸檬是酸的', 'taste that a lemon is sour'], [3, '知道湯太鹹', 'notice the soup is too salty'], [4, '摸出毛毯很柔軟', 'feel that a blanket is soft'], [4, '感覺水很燙', 'feel that the water is hot']];
const ANIMALS = [['雞', 'chicken', '🐔', 0, 2], ['鴨子', 'duck', '🦆', 0, 2], ['麻雀', 'sparrow', '🐦', 0, 2], ['狗', 'dog', '🐕', 1, 4], ['貓', 'cat', '🐈', 1, 4], ['兔子', 'rabbit', '🐇', 1, 4], ['牛', 'cow', '🐄', 1, 4],
  ['魚', 'fish', '🐟', 2, 0], ['蛇', 'snake', '🐍', 2, 0], ['蜥蜴', 'lizard', '🦎', 2, 4], ['烏龜', 'turtle', '🐢', 3, 4], ['蝸牛', 'snail', '🐌', 3, 0]];
const COVER = [['羽毛', 'feathers'], ['毛', 'fur (hair)'], ['鱗片', 'scales'], ['硬殼', 'a hard shell']];

const yn = (yes, zhY, enY, zhN, enN) => ansChoice(yes ? [T(zhY, enY), T(zhN, enN)] : [T(zhN, enN), T(zhY, enY)]);

export default [
  {
    id: 'g1-magnet-sticks', grades: [1, 2], subj: 'phys', sim: 'magnets',
    name: T('什麼會被磁鐵吸住？', 'What sticks to a magnet?'),
    cur: { tw: TW('磁鐵', 'magnets'), us: 'NGSS 3-PS2-3' },
    gen(r) {
      if (r.chance(0.5)) {
        const [zh, en, mag] = r.pick(MAG);
        return { q: T(`磁鐵靠近「${zh}」，會把它吸起來嗎？`, `Will a magnet pick up a ${en}?`),
          ans: yn(mag, '會', 'Yes', '不會', 'No'),
          sol: [T('磁鐵會吸住用「鐵」做的東西。', 'Magnets attract things made of iron.'),
            mag ? T(`${zh}是鐵做的，所以會被吸住。`, `A ${en} is made of iron, so it sticks.`) : T(`${zh}不是鐵做的，所以不會被吸住。`, `A ${en} is not made of iron, so it does not stick.`)] };
      }
      const yes = r.pick(MAG.filter((x) => x[2])), no = r.sample(MAG.filter((x) => !x[2]), 3);
      return { q: T('哪一個東西會被磁鐵吸住？', 'Which one will a magnet pick up?'),
        ans: ansChoice([T(yes[0], yes[1]), ...no.map((x) => T(x[0], x[1]))]),
        sol: [T('磁鐵只吸鐵做的東西。', 'Magnets only attract things made of iron.'), T(`${yes[0]}是鐵做的；${no.map((x) => x[0]).join('、')}都不是。`, `The ${yes[1]} is iron; the ${no.map((x) => x[1]).join(', ')} are not.`)],
        hint: T('想一想：哪一個是鐵做的？', 'Think: which one is made of iron?') };
    },
  },
  {
    id: 'g1-magnet-poles', grades: [1, 2], subj: 'phys', sim: 'magnets',
    name: T('磁鐵相吸還是相斥？', 'Pull or push? Magnet poles'),
    cur: { tw: TW('磁鐵', 'magnets'), us: 'NGSS 3-PS2-3' },
    gen(r) {
      const a = r.pick(['N', 'S']), b = r.pick(['N', 'S']), same = a === b;
      const t = r.int(0, 3);
      if (t === 2) {
        const kind = r.pick(['attract', 'repel']), ans = kind === 'attract' ? (a === 'N' ? 'S' : 'N') : a;
        return { q: T(`兩塊磁鐵靠近時互相${kind === 'attract' ? '吸住' : '推開'}了。左邊磁鐵靠近的那一端是 ${a} 極，右邊磁鐵靠近的那一端是什麼極？`, `Two magnets ${kind === 'attract' ? 'pull together' : 'push apart'}. The left magnet’s near end is ${a}. What is the right magnet’s near end?`),
          ans: ansChoice([T(`${ans} 極`, ans), T(`${ans === 'N' ? 'S' : 'N'} 極`, ans === 'N' ? 'S' : 'N')]),
          sol: [T('相同的極互相推開，不同的極互相吸引。', 'Same poles push apart; different poles pull together.'), T(`${kind === 'attract' ? '吸住表示兩端不同' : '推開表示兩端相同'}，所以是 ${ans} 極。`, `${kind === 'attract' ? 'Pulling means the ends are different' : 'Pushing means the ends are the same'}, so it is ${ans}.`)] };
      }
      if (t === 3) return pickItem(r, [
        { q: T('把一根長條磁鐵折成兩半，每一半會…', 'A bar magnet is broken in half. Each half…'), options: [T('都各有 N 極和 S 極', 'has its own N and S pole'), T('一半只有 N 極、一半只有 S 極', 'has only N or only S'), T('不再有磁力', 'is no longer a magnet')], why: [T('磁鐵折斷後，每一段都會變成有 N、S 兩極的小磁鐵。', 'Every piece of a broken magnet becomes a smaller magnet with both an N and an S pole.')] },
        { q: T('長條磁鐵哪裡吸住的迴紋針最多？', 'Where does a bar magnet hold the most paper clips?'), options: [T('兩端（磁極）', 'At the two ends (the poles)'), T('正中間', 'In the middle'), T('到處都一樣', 'The same everywhere')], why: [T('磁鐵的磁力在兩端（磁極）最強，中間最弱。', 'A magnet is strongest at its ends (the poles) and weakest in the middle.')] },
        { q: T('指北針的指針其實是什麼？', 'What is a compass needle really?'), options: [T('一根小磁鐵', 'A tiny magnet'), T('一根普通的塑膠針', 'An ordinary plastic needle'), T('一根木頭', 'A piece of wood')], why: [T('指北針的指針是小磁鐵，它的 N 極會指向北方。', 'A compass needle is a small magnet whose N pole points north.')] },
        { q: T('磁鐵隔著一張紙，還能吸住迴紋針嗎？', 'Can a magnet pick up a paper clip through a sheet of paper?'), options: [T('可以', 'Yes'), T('不行', 'No')], why: [T('磁力可以穿過紙、布、塑膠板這些薄的東西。', 'Magnetic force passes through thin things like paper, cloth and plastic.')] },
      ]);
      if (t === 0) return { q: T(`兩塊磁鐵的 ${a} 極和 ${b} 極互相靠近，會怎樣？`, `The ${a} pole of one magnet comes near the ${b} pole of another. What happens?`), fig: magnetsSVG(a, b),
        ans: ansChoice(same ? [T('互相推開（相斥）', 'They push apart (repel)'), T('互相吸住（相吸）', 'They pull together (attract)'), T('什麼事都沒有', 'Nothing happens')] : [T('互相吸住（相吸）', 'They pull together (attract)'), T('互相推開（相斥）', 'They push apart (repel)'), T('什麼事都沒有', 'Nothing happens')]),
        sol: [T('相同的極互相推開，不同的極互相吸引。', 'Same poles push apart; different poles pull together.'), T(`${a} 和 ${b} 是${same ? '相同' : '不同'}的極，所以${same ? '相斥' : '相吸'}。`, `${a} and ${b} are ${same ? 'the same' : 'different'}, so they ${same ? 'repel' : 'attract'}.`)] };
      return { q: T(`一塊磁鐵的 ${a} 極要「吸住」另一塊磁鐵，要用哪一極靠近？`, `To make another magnet stick to the ${a} pole, which pole should face it?`),
        ans: ansChoice([T(`${a === 'N' ? 'S' : 'N'} 極`, `the ${a === 'N' ? 'S' : 'N'} pole`), T(`${a} 極`, `the ${a} pole`)]),
        sol: [T('不同的極才會互相吸引。', 'Only different poles attract.'), T(`和 ${a} 不同的是 ${a === 'N' ? 'S' : 'N'} 極。`, `The pole different from ${a} is ${a === 'N' ? 'S' : 'N'}.`)] };
    },
  },
  {
    id: 'g1-float-sink', grades: [1, 2], subj: 'phys', sim: 'float-sink',
    name: T('浮起來還是沉下去？', 'Float or sink?'),
    cur: { tw: TW('沉與浮', 'floating and sinking'), us: 'NGSS 2-PS1-2' },
    gen(r) {
      if (r.chance(0.6)) {
        const [zh, en, e, fl] = r.pick(FLOAT);
        return { q: T(`把${zh}放進一盆水裡，它會浮起來還是沉下去？`, `If you put a ${en} in a tub of water, will it float or sink?`), fig: big(e),
          ans: yn(fl, '浮起來', 'Float', '沉下去', 'Sink'),
          sol: [T('和同樣大小的水比，比水輕的會浮，比水重的會沉。', 'Things lighter than the same amount of water float; heavier ones sink.'), T(`${zh}${fl ? '比較輕，會浮起來' : '比較重，會沉下去'}。`, `A ${en} is ${fl ? 'lighter, so it floats' : 'heavier, so it sinks'}.`)] };
      }
      const y = r.pick(FLOAT.filter((x) => x[3])), n = r.sample(FLOAT.filter((x) => !x[3]), 3);
      return { q: T('哪一個會浮在水面上？', 'Which one will float on water?'),
        ans: ansChoice([T(`${y[2]} ${y[0]}`, `${y[2]} ${y[1]}`), ...n.map((x) => T(`${x[2]} ${x[0]}`, `${x[2]} ${x[1]}`))]),
        sol: [T(`${y[0]}比同樣大小的水輕，所以會浮。`, `A ${y[1]} is lighter than the same amount of water, so it floats.`), T(`${n.map((x) => x[0]).join('、')}都會沉下去。`, `The ${n.map((x) => x[1]).join(', ')} all sink.`)] };
    },
  },
  {
    id: 'g1-living', grades: [1, 2], subj: 'bio',
    name: T('有生命還是沒有生命？', 'Living or not living?'),
    cur: { tw: TW('認識生物', 'living things'), us: 'NGSS K-LS1-1' },
    gen(r) {
      if (r.chance(0.6)) {
        const [zh, en, e, liv] = r.pick(LIVING);
        return { q: T(`${zh}是生物（有生命）嗎？`, `Is a ${en} a living thing?`), fig: big(e),
          ans: yn(liv, '是生物', 'Yes, it is living', '不是生物', 'No, it is not living'),
          sol: [T('生物會長大、需要食物或養分、會繁殖下一代。', 'Living things grow, need food or nutrients, and make more of their own kind.'),
            liv ? T(`${zh}會長大、需要養分，是生物。`, `A ${en} grows and needs nutrients, so it is living.`) : T(`${zh}不會自己長大，也不需要吃東西，不是生物。`, `A ${en} does not grow or need food, so it is not living.`)] };
      }
      const y = r.pick(LIVING.filter((x) => x[3])), n = r.sample(LIVING.filter((x) => !x[3]), 3);
      return { q: T('哪一個是生物？', 'Which one is a living thing?'),
        ans: ansChoice([T(`${y[2]} ${y[0]}`, `${y[2]} ${y[1]}`), ...n.map((x) => T(`${x[2]} ${x[0]}`, `${x[2]} ${x[1]}`))]),
        sol: [T('生物會長大、需要養分，也會生出下一代。', 'Living things grow, need nutrients and reproduce.'), T(`${y[0]}是生物；其他的都不會長大。`, `The ${y[1]} is living; the others do not grow.`)] };
    },
  },
  {
    id: 'g1-senses', grades: [1, 1], subj: 'bio',
    name: T('五種感官', 'The five senses'),
    cur: { tw: TW('身體與感官', 'the body and senses'), us: 'NGSS 1-LS1-1' },
    gen(r) {
      const [i, zh, en] = r.pick(SENSE_Q), s = SENSES[i], others = r.sample(SENSES.filter((_, j) => j !== i), 3);
      return { q: T(`我們用身體的哪一個部位來「${zh}」？`, `Which body part do we use to ${en}?`),
        ans: ansChoice([T(`${s[2]} ${s[0]}`, `${s[2]} ${s[1]}`), ...others.map((o) => T(`${o[2]} ${o[0]}`, `${o[2]} ${o[1]}`))]),
        sol: [T('眼睛看、耳朵聽、鼻子聞、舌頭嚐、皮膚摸。', 'Eyes see, ears hear, the nose smells, the tongue tastes and the skin feels.'), T(`「${zh}」要用${s[0]}。`, `To ${en}, we use our ${s[1]}.`)] };
    },
  },
  {
    id: 'g2-animal-cover', grades: [1, 2], subj: 'bio',
    name: T('動物的身體', 'Animal bodies'),
    cur: { tw: TW('認識動物', 'animals'), us: 'NGSS 1-LS1-1' },
    gen(r) {
      const [zh, en, e, cov, legs] = r.pick(ANIMALS);
      if (r.chance(0.5)) {
        const wrong = r.sample([0, 1, 2, 3].filter((x) => x !== cov), 3);
        return { q: T(`${zh}的身體外面覆蓋著什麼？`, `What covers a ${en}’s body?`), fig: big(e),
          ans: ansChoice([T(COVER[cov][0], COVER[cov][1]), ...wrong.map((w) => T(COVER[w][0], COVER[w][1]))]),
          sol: [T('鳥有羽毛，哺乳動物有毛，魚和蛇、蜥蜴有鱗片，烏龜和蝸牛有硬殼。', 'Birds have feathers, mammals have fur, fish, snakes and lizards have scales, and turtles and snails have hard shells.'), T(`${zh}的身體覆蓋著${COVER[cov][0]}。`, `A ${en} is covered with ${COVER[cov][1]}.`)] };
      }
      return { q: T(`${zh}有幾隻腳？`, `How many legs does a ${en} have?`), fig: big(e), ans: ansNum(legs),
        sol: [T(`${zh}有 ${legs} 隻腳。`, `A ${en} has ${legs} legs.`), T(legs === 0 ? '牠沒有腳，用身體移動或游泳。' : legs === 2 ? '鳥類都是兩隻腳，另外有一對翅膀。' : '很多在陸地上走的動物有四隻腳。', legs === 0 ? 'It has no legs; it moves with its body or swims.' : legs === 2 ? 'Birds have two legs and a pair of wings.' : 'Many animals that walk on land have four legs.')] };
    },
  },
  {
    id: 'g2-thermometer', grades: [2, 2], subj: 'earth',
    name: T('看溫度計', 'Reading a thermometer'),
    cur: { tw: TW('天氣與溫度', 'weather and temperature'), us: 'NGSS K-ESS2-1' },
    gen(r) {
      const t = r.int(0, 22) * 2, t2 = Math.min(44, t + r.int(1, 5) * 2);
      if (r.chance(0.7)) return { q: T('溫度計上顯示幾度？（單位：°C）', 'What temperature does the thermometer show? (°C)'), fig: thermoSVG(t), ans: ansNum(t),
        sol: [T('每一小格是 2 度，數字每 10 度標一次。', 'Each small mark is 2 degrees; numbers are every 10 degrees.'), T(`紅色液柱頂端在 ${t} 的位置，所以是 ${t} °C。`, `The top of the red liquid is at ${t}, so it is ${t} °C.`)] };
      return { q: T(`早上溫度計顯示 ${t} °C，中午變成 ${t2} °C。溫度升高了幾度？`, `In the morning the thermometer showed ${t} °C. At noon it showed ${t2} °C. How many degrees warmer did it get?`), ans: ansNum(t2 - t),
        sol: [T('升高了多少 = 後來的溫度 − 原來的溫度。', 'How much warmer = later temperature − earlier temperature.'), T(`${t2} − ${t} = ${t2 - t}，升高了 ${t2 - t} 度。`, `${t2} − ${t} = ${t2 - t}, so ${t2 - t} degrees warmer.`)] };
    },
  },
  {
    id: 'g2-water-states', grades: [1, 2], subj: 'chem', sim: 'water-states',
    name: T('水的三種樣子', 'Water’s three forms'),
    cur: { tw: TW('水的三態', 'states of water'), us: 'NGSS 2-PS1-4' },
    bank: [
      { q: T('冰塊放在太陽下，過一陣子會變成什麼？', 'An ice cube is left in the sun. What does it turn into?'), options: [T('水', 'Water'), T('石頭', 'Stone'), T('更大的冰塊', 'A bigger ice cube')], why: [T('冰遇熱會融化變成水。', 'Ice melts into water when it gets warm.')] },
      { q: T('水放進冷凍庫會變成什麼？', 'What happens to water in the freezer?'), options: [T('結成冰', 'It freezes into ice'), T('變成水蒸氣', 'It turns into steam'), T('消失不見', 'It disappears')], why: [T('水冷到 0 °C 會結冰。', 'Water freezes into ice when it gets cold enough (0 °C).')] },
      { q: T('媽媽煮湯，鍋子上冒出白白的「煙」，那是什麼？', 'White “smoke” rises from a pot of hot soup. What is it?'), options: [T('水蒸氣遇冷變成的小水滴', 'Tiny water droplets from cooling steam'), T('燒焦的煙', 'Smoke from burning'), T('空氣變白了', 'The air turning white')], why: [T('熱水變成看不見的水蒸氣，碰到冷空氣又變回很小的水滴，看起來白白的。', 'Hot water becomes invisible steam; when it meets cooler air it turns back into tiny droplets that look white.')] },
      { q: T('下雨後地上的水窪，太陽出來後慢慢不見了。水跑到哪裡去了？', 'After the rain, puddles slowly disappear in the sun. Where does the water go?'), options: [T('變成水蒸氣跑到空氣中', 'It turns into water vapor in the air'), T('被太陽吃掉了', 'The sun eats it'), T('全部變成冰', 'It all turns to ice')], why: [T('太陽讓水「蒸發」，變成看不見的水蒸氣飄到空氣中。', 'The sun makes the water evaporate into invisible water vapor in the air.')] },
      { q: T('冰、水、水蒸氣，哪一個可以倒進杯子、形狀跟著杯子改變？', 'Ice, water or steam — which one can be poured and takes the shape of its cup?'), options: [T('水', 'Water'), T('冰', 'Ice'), T('都不行', 'None of them')], why: [T('水是液體，會流動，形狀跟著容器改變；冰是固體，有固定的形狀。', 'Water is a liquid: it flows and takes the shape of its container. Ice is a solid with its own shape.')] },
      { q: T('冰涼的飲料杯外面出現小水珠，水珠是從哪裡來的？', 'Droplets appear on the outside of a cold drink. Where do they come from?'), options: [T('空氣中的水蒸氣遇冷變成的', 'Water vapor in the air cooled on the cup'), T('杯子裡的飲料漏出來', 'The drink leaked through the cup'), T('杯子自己長出來的', 'The cup made them')], why: [T('空氣中有看不見的水蒸氣，碰到冰冷的杯子就凝結成小水珠。', 'The air holds invisible water vapor. When it touches the cold cup it condenses into droplets.')] },
      { q: T('水在大約幾度會沸騰（滾開）？', 'At about what temperature does water boil?'), options: ['100 °C', '0 °C', '50 °C'], why: [T('在平地，水大約在 100 °C 沸騰。', 'At sea level water boils at about 100 °C.')] },
      { q: T('冰融化成水以後，再放回冷凍庫，會怎樣？', 'Melted ice goes back in the freezer. What happens?'), options: [T('又會結成冰', 'It freezes into ice again'), T('永遠是水', 'It stays water forever'), T('變成沙子', 'It turns to sand')], why: [T('水的變化可以來回：冰熱了變水，水冷了又變冰。', 'These changes go both ways: warm ice becomes water, cold water becomes ice.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g2-plant-needs', grades: [1, 2], subj: 'bio', sim: 'plant-needs',
    name: T('植物需要什麼？', 'What plants need'),
    cur: { tw: TW('植物的生長', 'how plants grow'), us: 'NGSS 2-LS2-1' },
    bank: [
      { q: T('種綠豆時，哪一樣東西「不是」綠豆長大一定需要的？', 'Which of these does a bean plant NOT need to grow?'), options: [T('音樂', 'Music'), T('水', 'Water'), T('陽光', 'Sunlight'), T('空氣', 'Air')], why: [T('植物需要水、陽光、空氣和土壤中的養分，不需要音樂。', 'Plants need water, sunlight, air and nutrients from the soil — not music.')] },
      { q: T('一盆花好幾天沒澆水，葉子會怎樣？', 'A potted plant gets no water for many days. What happens to its leaves?'), options: [T('垂下來、枯萎', 'They droop and wilt'), T('長得更綠', 'They get greener'), T('開更多花', 'It grows more flowers')], why: [T('缺水時植物會枯萎，太久沒水就會死掉。', 'Without water a plant wilts, and if it goes too long it dies.')] },
      { q: T('把植物放在黑暗的櫃子裡很多天，葉子會變成什麼顏色？', 'A plant is kept in a dark cupboard for many days. What color do its leaves turn?'), options: [T('黃色', 'Yellow'), T('更綠', 'Greener'), T('藍色', 'Blue')], why: [T('植物需要陽光才能製造養分、保持綠色；沒有光會變黃、變虛弱。', 'Plants need sunlight to make food and stay green. In the dark they turn yellow and weak.')] },
      { q: T('植物用身體的哪個部位從土壤吸水？', 'Which part of a plant takes in water from the soil?'), options: [T('根', 'The roots'), T('花', 'The flowers'), T('葉子', 'The leaves')], why: [T('根長在土裡，吸收水和養分，也幫植物站穩。', 'Roots grow in the soil, take in water and nutrients and hold the plant in place.')] },
      { q: T('窗邊的植物常常往窗戶的方向彎，為什麼？', 'A plant by the window bends toward the window. Why?'), options: [T('因為它朝著陽光生長', 'It grows toward the light'), T('因為它想看外面', 'It wants to look outside'), T('因為窗戶有風', 'The window is windy')], why: [T('植物會朝著有光的方向生長，才能得到更多陽光。', 'Plants grow toward light so they can get more sunlight.')] },
      { q: T('小明想知道「陽光」對植物有沒有影響，兩盆植物應該怎麼放？', 'Max wants to test whether sunlight matters to plants. How should he set up two plants?'), options: [T('一盆曬太陽、一盆放暗處，其他都一樣', 'One in the sun, one in the dark, everything else the same'), T('一盆曬太陽多澆水，一盆放暗處不澆水', 'One in the sun with lots of water, one in the dark with none'), T('兩盆都放在暗處', 'Both in the dark')], why: [T('公平的實驗只改變一件事（陽光），其他條件都一樣，才知道差別是陽光造成的。', 'A fair test changes only one thing (sunlight) and keeps everything else the same, so any difference comes from the sunlight.')] },
      { q: T('種子發芽後，最先長出來的通常是什麼？', 'When a seed sprouts, what usually comes out first?'), options: [T('根', 'A root'), T('花', 'A flower'), T('果實', 'A fruit')], why: [T('種子發芽時通常先長出根，往下抓住土壤吸水，再長出莖和葉。', 'A sprouting seed usually sends out a root first to grab the soil and get water, then a shoot with leaves.')] },
      { q: T('植物的葉子有什麼用處？', 'What do a plant’s leaves do?'), options: [T('利用陽光製造養分', 'Use sunlight to make food'), T('從土裡吸水', 'Take water from the soil'), T('讓植物站穩', 'Hold the plant up in the ground')], why: [T('葉子會利用陽光、水和空氣製造植物需要的養分。', 'Leaves use sunlight, water and air to make the food the plant needs.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g1-shadows', grades: [1, 2], subj: 'earth', sim: 'shadows',
    name: T('影子和太陽', 'Shadows and the Sun'),
    cur: { tw: TW('光與影', 'light and shadows'), us: 'NGSS 1-ESS1-1' },
    bank: [
      { q: T('早上太陽在東邊，你的影子會在你的哪一邊？', 'In the morning the Sun is in the east. Which side of you is your shadow on?'), options: [T('西邊', 'The west side'), T('東邊', 'The east side'), T('沒有影子', 'There is no shadow')], why: [T('影子在背對光源的那一邊。太陽在東邊，影子就在西邊。', 'A shadow falls on the side away from the light. The Sun is in the east, so the shadow is to the west.')] },
      { q: T('一天之中，什麼時候影子最短？', 'When during the day is your shadow shortest?'), options: [T('中午', 'Around noon'), T('早上', 'Early morning'), T('傍晚', 'Late afternoon')], why: [T('中午太陽最高，影子最短；早上和傍晚太陽低，影子長。', 'At noon the Sun is highest, so shadows are shortest. When the Sun is low, shadows are long.')] },
      { q: T('傍晚太陽在西邊，影子會在哪一邊？', 'In the evening the Sun is in the west. Where is the shadow?'), options: [T('東邊', 'The east side'), T('西邊', 'The west side'), T('正下方', 'Right underneath')], why: [T('影子在和太陽相反的方向，太陽在西邊，影子就在東邊。', 'The shadow points away from the Sun: Sun in the west, shadow to the east.')] },
      { q: T('要產生影子，需要什麼？', 'What do you need to make a shadow?'), options: [T('光，和擋住光的東西', 'Light and something that blocks it'), T('只要有水', 'Just water'), T('一片漆黑', 'Total darkness')], why: [T('光照到東西被擋住，後面照不到光的地方就是影子。', 'When something blocks light, the dark area behind it is the shadow.')] },
      { q: T('手電筒愈靠近玩具，牆上玩具的影子會…', 'Moving a flashlight closer to a toy makes its shadow on the wall…'), options: [T('變大', 'bigger'), T('變小', 'smaller'), T('消失', 'disappear')], why: [T('光源愈靠近物體，被擋住的光範圍愈大，影子就愈大。', 'The closer the light is to the toy, the more light it blocks, so the shadow gets bigger.')] },
      { q: T('太陽每天從哪一邊升起？', 'Which direction does the Sun rise in every day?'), options: [T('東邊', 'The east'), T('西邊', 'The west'), T('北邊', 'The north')], why: [T('太陽從東邊升起，從西邊落下。', 'The Sun rises in the east and sets in the west.')] },
      { q: T('陰天沒有太陽時，在外面看得到清楚的影子嗎？', 'On a cloudy day with no sunshine, can you see a sharp shadow outside?'), options: [T('看不清楚，因為沒有直射的陽光', 'No — there is no direct sunlight'), T('看得到，比晴天更清楚', 'Yes, even sharper than on a sunny day'), T('影子會變成彩色', 'Shadows turn colorful')], why: [T('雲把陽光散開了，光從四面八方來，影子就變得很淡或看不見。', 'Clouds scatter the sunlight so light comes from everywhere, and shadows become faint or vanish.')] },
      { q: T('冬天中午的影子比夏天中午的影子…', 'Compared with summer, the noon shadow in winter is…'), options: [T('比較長', 'longer'), T('比較短', 'shorter'), T('一樣長', 'the same')], why: [T('冬天太陽比較低，光斜斜地照，影子就比較長。', 'The winter Sun is lower in the sky, so its light slants and shadows are longer.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g2-weather', grades: [1, 2], subj: 'earth',
    name: T('天氣與季節', 'Weather and seasons'),
    cur: { tw: TW('天氣與季節', 'weather and seasons'), us: 'NGSS K-ESS2-1' },
    bank: [
      { q: T('天氣預報說明天會下大雨，出門要帶什麼？', 'The forecast says heavy rain tomorrow. What should you take?'), options: [T('☂️ 雨傘或雨衣', '☂️ An umbrella or raincoat'), T('🕶️ 太陽眼鏡', '🕶️ Sunglasses'), T('🧤 只要手套', '🧤 Just gloves')], why: [T('下雨要用雨傘或雨衣保持乾燥。', 'An umbrella or raincoat keeps you dry in the rain.')] },
      { q: T('台灣的夏天通常天氣怎麼樣？', 'What is summer usually like in Taiwan?'), options: [T('又熱又常有午後雷陣雨', 'Hot, often with afternoon thunderstorms'), T('很冷而且常下雪', 'Very cold with lots of snow'), T('每天都很涼爽', 'Cool every day')], why: [T('台灣夏天氣溫高，下午常有雷陣雨，也可能有颱風。', 'Taiwan’s summers are hot, with frequent afternoon thunderstorms and sometimes typhoons.')] },
      { q: T('哪一個符號表示「晴天」？', 'Which symbol means a sunny day?'), options: ['☀️', '🌧️', '❄️', '🌩️'], why: [T('太陽的符號代表晴天；雨滴是雨天；雪花是下雪；閃電是雷雨。', 'The sun means sunny; rain drops mean rain; a snowflake means snow; lightning means thunderstorms.')] },
      { q: T('風很大的時候，可以看到什麼現象？', 'What can you see when it is very windy?'), options: [T('樹枝搖來搖去、旗子飄動', 'Branches sway and flags flap'), T('地上結冰', 'The ground freezes'), T('太陽變大', 'The Sun gets bigger')], why: [T('風是流動的空氣，會吹動樹枝和旗子。', 'Wind is moving air, which pushes branches and flags.')] },
      { q: T('一年有哪四個季節？', 'What are the four seasons of the year?'), options: [T('春、夏、秋、冬', 'Spring, summer, autumn, winter'), T('早、午、晚、夜', 'Morning, noon, evening, night'), T('晴、雨、風、雪', 'Sunny, rainy, windy, snowy')], why: [T('一年分成春、夏、秋、冬四個季節。', 'A year has four seasons: spring, summer, autumn and winter.')] },
      { q: T('冬天出門最適合穿什麼？', 'What is best to wear outside in winter?'), options: [T('外套和長褲', 'A coat and long pants'), T('短袖和短褲', 'A T-shirt and shorts'), T('泳衣', 'A swimsuit')], why: [T('冬天氣溫低，要穿保暖的外套。', 'Winter is cold, so wear a warm coat.')] },
      { q: T('天空出現又黑又厚的雲，接下來最可能…', 'Thick dark clouds fill the sky. What will most likely happen next?'), options: [T('下雨', 'It will rain'), T('出大太陽', 'It will get very sunny'), T('天空變綠色', 'The sky will turn green')], why: [T('又黑又厚的雲裡有很多水滴，常常會下雨。', 'Thick dark clouds hold lots of water and often bring rain.')] },
      { q: T('雨停了，太陽出來時，天空有時會出現什麼？', 'When the rain stops and the Sun comes out, what can sometimes appear?'), options: [T('🌈 彩虹', '🌈 A rainbow'), T('⭐ 星星', '⭐ Stars'), T('🌙 滿月', '🌙 A full moon')], why: [T('陽光照到空氣中的小水滴，會分出顏色，形成彩虹。', 'Sunlight shining through tiny drops of water in the air splits into colors — a rainbow.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g1-push-pull', grades: [1, 2], subj: 'phys',
    name: T('推和拉', 'Pushes and pulls'),
    cur: { tw: TW('力與運動（玩具）', 'forces and motion with toys'), us: 'NGSS K-PS2-1' },
    bank: [
      { q: T('用比較大的力推玩具車，玩具車會…', 'If you push a toy car harder, it will…'), options: [T('跑得比較遠', 'go farther'), T('跑得比較近', 'go a shorter distance'), T('不會動', 'not move')], why: [T('推的力量愈大，玩具車跑得愈快、愈遠。', 'A bigger push makes the car go faster and farther.')] },
      { q: T('打開抽屜是用「推」還是「拉」？', 'Is opening a drawer a push or a pull?'), options: [T('拉', 'A pull'), T('推', 'A push'), T('都不是', 'Neither')], why: [T('把東西往自己的方向移動是「拉」。', 'Moving something toward yourself is a pull.')] },
      { q: T('踢足球是用「推」還是「拉」？', 'Is kicking a ball a push or a pull?'), options: [T('推', 'A push'), T('拉', 'A pull'), T('都不是', 'Neither')], why: [T('把東西從自己身邊往外送是「推」。', 'Moving something away from yourself is a push.')] },
      { q: T('玩具車在哪裡滑得最遠？', 'Where will a toy car roll the farthest?'), options: [T('光滑的木頭地板', 'A smooth wooden floor'), T('厚厚的地毯', 'A thick carpet'), T('草地', 'Grass')], why: [T('地面愈粗糙，阻止車子前進的摩擦力愈大，車子愈快停下來；光滑的地板摩擦最小。', 'Rough ground has more friction slowing the car; a smooth floor has the least, so the car goes farthest.')] },
      { q: T('滾動的球碰到牆壁，會怎樣？', 'A rolling ball hits a wall. What happens?'), options: [T('改變方向彈回來', 'It changes direction and bounces back'), T('穿過牆壁', 'It goes through the wall'), T('越滾越快', 'It speeds up')], why: [T('牆壁推了球一下，讓球改變運動方向。', 'The wall pushes on the ball and changes its direction.')] },
      { q: T('要讓靜止的盪鞦韆動起來，可以怎麼做？', 'How can you make a still swing start moving?'), options: [T('推它或拉它', 'Push it or pull it'), T('對它說話', 'Talk to it'), T('看著它', 'Look at it')], why: [T('東西要開始動，需要有推或拉的力量。', 'Something starts moving only when a push or pull acts on it.')] },
      { q: T('小美和阿傑拔河，誰會贏？', 'Mia and Jay play tug-of-war. Who wins?'), options: [T('拉的力量比較大的人', 'Whoever pulls harder'), T('個子比較高的人', 'Whoever is taller'), T('比較晚開始的人', 'Whoever starts later')], why: [T('兩邊都在拉，力量比較大的那一邊會把繩子拉過去。', 'Both sides pull; the side with the bigger pull moves the rope its way.')] },
      { q: T('斜坡愈陡，放在上面的玩具車滑下來會…', 'The steeper the ramp, a toy car rolling down it goes…'), options: [T('愈快', 'faster'), T('愈慢', 'slower'), T('一樣快', 'the same speed')], why: [T('斜坡愈陡，車子往下滑得愈快。', 'A steeper ramp makes the car roll down faster.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g2-sky', grades: [1, 2], subj: 'earth',
    name: T('天空：太陽、月亮和星星', 'The sky: Sun, Moon and stars'),
    cur: { tw: TW('天空的變化', 'the sky'), us: 'NGSS 1-ESS1-1' },
    bank: [
      { q: T('白天天空中最亮的是什麼？', 'What is the brightest thing in the daytime sky?'), options: [T('太陽', 'The Sun'), T('月亮', 'The Moon'), T('星星', 'The stars')], why: [T('白天太陽很亮，把星星的光都蓋過去了。', 'In the daytime the Sun is so bright that it hides the stars.')] },
      { q: T('白天看不到星星，是因為…', 'We can’t see stars in the daytime because…'), options: [T('太陽太亮，把星光蓋住了', 'the Sun is so bright it hides their light'), T('星星白天都跑走了', 'the stars go away during the day'), T('星星白天在睡覺', 'the stars are asleep')], why: [T('星星一直都在，只是白天陽光太亮看不到。', 'The stars are always there; daylight is just too bright to see them.')] },
      { q: T('月亮的形狀每天看起來…', 'From night to night, the Moon’s shape looks…'), options: [T('會慢慢改變', 'slowly different'), T('永遠都是圓的', 'always round'), T('永遠都是彎彎的', 'always a thin curve')], why: [T('月亮看起來的形狀大約一個月變化一輪，從彎月到滿月再變回去。', 'The Moon’s shape changes in a cycle of about a month, from a thin curve to full and back.')] },
      { q: T('太陽下山以後，天空會怎樣？', 'After the Sun sets, what happens to the sky?'), options: [T('慢慢變暗，晚上來了', 'It slowly gets dark — night comes'), T('變得更亮', 'It gets brighter'), T('變成紅色一整晚', 'It stays red all night')], why: [T('太陽下山後，我們這邊照不到陽光，就變成晚上。', 'After sunset our side of Earth gets no sunlight, so it is night.')] },
      { q: T('太陽升起和落下的方向是…', 'The Sun rises and sets in…'), options: [T('東邊升起，西邊落下', 'the east and the west'), T('西邊升起，東邊落下', 'the west and the east'), T('北邊升起，南邊落下', 'the north and the south')], why: [T('每天太陽都從東邊升起，從西邊落下。', 'Every day the Sun rises in the east and sets in the west.')] },
      { q: T('晚上看到的星星，大部分其實是什麼？', 'Most stars you see at night are actually…'), options: [T('很遠很遠、會發光的太陽', 'faraway suns that make their own light'), T('天空中的小燈泡', 'little light bulbs in the sky'), T('地上的燈反射', 'reflections of street lights')], why: [T('星星是像太陽一樣會自己發光的天體，只是非常遙遠，看起來很小。', 'Stars are suns that shine with their own light, but they are so far away that they look tiny.')] },
      { q: T('月亮自己會發光嗎？', 'Does the Moon make its own light?'), options: [T('不會，它反射太陽光', 'No — it reflects sunlight'), T('會，它像燈泡一樣', 'Yes, like a light bulb'), T('只有滿月時會', 'Only at full moon')], why: [T('月亮本身不發光，我們看到的是它反射的太陽光。', 'The Moon doesn’t shine by itself; we see sunlight bouncing off it.')] },
      { q: T('有時候白天也可以看到月亮嗎？', 'Can you sometimes see the Moon in the daytime?'), options: [T('可以', 'Yes'), T('不行，月亮只在晚上出現', 'No, the Moon only comes out at night')], why: [T('月亮常常白天也在天空中，只是比較淡，仔細找就看得到。', 'The Moon is often in the sky during the day — it just looks pale. Look carefully and you can find it.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
];

// Practice units for grades 3–4 (國小中年級 自然科學). Format: see SPEC.md.
import { T, NAMES, ansChoice, ansNum, pickItem } from '../util.js';

const TW = (zh, en) => T(`國小中年級 ${zh}`, `Middle elementary · ${en}`);

// ---- circuit pictures ----
// kind: 'closed' | 'open' | 'gap' | 'same' (both wires on +) | 'short' | 'mat' (something in the gap: label, conductor?)
function circuitSVG(kind, label) {
  const w = 'class="f-line" stroke-width="3" fill="none"';
  let s = `<svg class="fig" viewBox="0 0 300 190" width="300" height="190">`;
  // battery (left)
  s += `<rect x="20" y="70" width="34" height="70" rx="5" class="f-soft"/><rect x="30" y="62" width="14" height="8" class="f-dot"/><text x="37" y="96" font-size="18" text-anchor="middle" class="f-txt">+</text><text x="37" y="132" font-size="20" text-anchor="middle" class="f-txt">−</text>`;
  // bulb (top middle)
  s += `<circle cx="150" cy="40" r="20" fill="none" class="f-line" stroke-width="2"/><rect x="140" y="58" width="20" height="14" class="f-soft"/>`;
  if (kind === 'same') {
    s += `<path d="M37 62 V30 H130" ${w}/><path d="M160 66 H220 V160 H90 V50 H50 V62" ${w}/>`;
  } else {
    s += `<path d="M37 62 V30 H130" ${w}/><path d="M160 66 H250 V100" ${w}/>`;
    if (kind === 'gap') s += `<path d="M250 140 V170 H37 V140" ${w}/>`;
    else if (kind === 'open') s += `<path d="M250 100 L270 128" ${w}/><circle cx="250" cy="100" r="4" class="f-dot"/><circle cx="250" cy="140" r="4" class="f-dot"/><path d="M250 140 V170 H37 V140" ${w}/>`;
    else if (kind === 'mat') s += `<rect x="240" y="100" width="20" height="40" rx="4" class="f-accfill"/><path d="M250 140 V170 H37 V140" ${w}/><text x="236" y="125" font-size="13" text-anchor="end" class="f-txt">${label}</text>`;
    else s += `<path d="M250 100 V170 H37 V140" ${w}/>`;
    if (kind === 'short') s += `<path d="M37 62 V50 H8 V160 H37" class="f-acc" stroke-width="3" fill="none"/>`;
  }
  return s + '</svg>';
}
const MATS = [['鐵釘', 'iron nail', true], ['銅線', 'copper wire', true], ['鋁箔', 'aluminum foil', true], ['迴紋針', 'paper clip', true], ['10 元硬幣', 'metal coin', true],
  ['塑膠吸管', 'plastic straw', false], ['木筷', 'wooden chopstick', false], ['橡皮擦', 'eraser', false], ['玻璃珠', 'glass bead', false], ['紙條', 'strip of paper', false], ['棉線', 'cotton string', false]];
const PHASES = [['新月', 'new moon'], ['眉月', 'waxing crescent'], ['上弦月', 'first quarter'], ['盈凸月', 'waxing gibbous'], ['滿月', 'full moon'], ['虧凸月', 'waning gibbous'], ['下弦月', 'last quarter'], ['殘月', 'waning crescent']];
const CYCLES = [
  { zh: '蝴蝶', en: 'butterfly', st: [['卵', 'egg'], ['幼蟲', 'larva'], ['蛹', 'pupa'], ['成蟲', 'adult']], full: true },
  { zh: '獨角仙', en: 'rhinoceros beetle', st: [['卵', 'egg'], ['幼蟲', 'larva'], ['蛹', 'pupa'], ['成蟲', 'adult']], full: true },
  { zh: '蚊子', en: 'mosquito', st: [['卵', 'egg'], ['孑孓（幼蟲）', 'larva (wriggler)'], ['蛹', 'pupa'], ['成蟲', 'adult']], full: true },
  { zh: '蝗蟲', en: 'grasshopper', st: [['卵', 'egg'], ['若蟲', 'nymph'], ['成蟲', 'adult']], full: false },
  { zh: '螳螂', en: 'praying mantis', st: [['卵', 'egg'], ['若蟲', 'nymph'], ['成蟲', 'adult']], full: false },
  { zh: '蟑螂', en: 'cockroach', st: [['卵', 'egg'], ['若蟲', 'nymph'], ['成蟲', 'adult']], full: false },
  { zh: '青蛙', en: 'frog', st: [['卵', 'egg'], ['蝌蚪', 'tadpole'], ['幼蛙', 'froglet'], ['成蛙', 'adult frog']], full: null },
];
const GROUPS = [['哺乳類', 'mammal', '身上有毛，用乳汁餵小孩', 'has fur and feeds its babies milk'], ['鳥類', 'bird', '有羽毛和翅膀，生蛋', 'has feathers and wings and lays eggs'], ['魚類', 'fish', '用鰓呼吸，有鰭，住在水裡', 'breathes with gills and has fins'],
  ['爬蟲類', 'reptile', '皮膚有乾燥的鱗片，在陸地生蛋', 'has dry scaly skin and lays eggs on land'], ['兩生類', 'amphibian', '小時候住在水裡，長大可上岸，皮膚濕濕的', 'lives in water when young and on land as an adult, with moist skin'], ['昆蟲', 'insect', '身體分頭、胸、腹三部分，有六隻腳', 'has three body parts and six legs']];
const ANIMALS = [['貓', 'cat', 0], ['海豚', 'dolphin', 0], ['蝙蝠', 'bat', 0], ['鯨魚', 'whale', 0], ['老鷹', 'eagle', 1], ['企鵝', 'penguin', 1], ['鴕鳥', 'ostrich', 1], ['鯊魚', 'shark', 2], ['吳郭魚', 'tilapia', 2],
  ['烏龜', 'turtle', 3], ['蛇', 'snake', 3], ['鱷魚', 'crocodile', 3], ['青蛙', 'frog', 4], ['山椒魚', 'salamander', 4], ['螞蟻', 'ant', 5], ['蜜蜂', 'bee', 5], ['獨角仙', 'rhinoceros beetle', 5]];

export default [
  {
    id: 'g3-circuit-light', grades: [3, 4], subj: 'phys', sim: 'circuits',
    name: T('燈泡會亮嗎？', 'Will the bulb light?'),
    cur: { tw: TW('電路', 'circuits'), us: 'NGSS 4-PS3-2' },
    gen(r) {
      const kind = r.pick(['closed', 'open', 'gap', 'same', 'short', 'mat', 'mat', 'mat']);
      const mat = r.pick(MATS);
      const lights = kind === 'closed' || (kind === 'mat' && mat[2]);
      const why = {
        closed: T('電池的正極、燈泡、負極連成一圈完整的「通路」，電流可以流過，燈泡會亮。', 'The battery’s + end, the bulb and the − end form a complete loop (a closed circuit), so current flows and the bulb lights.'),
        open: T('開關打開了，電路斷了一個缺口，電流無法流通（斷路），燈泡不亮。', 'The switch is open, leaving a gap. Current can’t flow (open circuit), so the bulb stays dark.'),
        gap: T('電線沒有接好，留下缺口，是斷路，燈泡不亮。', 'A wire isn’t connected, leaving a gap — an open circuit — so the bulb stays dark.'),
        same: T('兩條電線都接在電池的同一極，電流沒有從正極流到負極的路，燈泡不亮。', 'Both wires go to the same battery end, so there is no path from + to −. The bulb stays dark.'),
        short: T('紅色的電線直接把電池的正負極連起來（短路），電流幾乎都走這條捷徑，燈泡不亮，電池還會發燙，很危險！', 'The red wire joins the battery’s ends directly (a short circuit). Almost all the current takes this shortcut, so the bulb stays dark — and the battery gets dangerously hot!'),
        mat: mat[2] ? T(`${mat[0]}是金屬，是導體，電流可以通過，形成通路，燈泡會亮。`, `A ${mat[1]} is metal — a conductor — so current passes and the bulb lights.`) : T(`${mat[0]}是絕緣體，電流過不去，是斷路，燈泡不亮。`, `A ${mat[1]} is an insulator, so current can’t pass and the bulb stays dark.`),
      }[kind];
      return { q: kind === 'mat' ? T(`缺口處放了「${mat[0]}」。燈泡會亮嗎？`, `A ${mat[1]} is placed in the gap. Will the bulb light?`) : T('這樣接，燈泡會亮嗎？', 'Will the bulb light when it is connected like this?'),
        fig: circuitSVG(kind, ''),
        ans: ansChoice(lights ? [T('會亮', 'Yes, it lights'), T('不會亮', 'No, it stays dark')] : [T('不會亮', 'No, it stays dark'), T('會亮', 'Yes, it lights')]),
        sol: [T('燈泡要亮，電流必須從電池正極出發，經過燈泡，再回到負極，繞成一圈。', 'For a bulb to light, current must leave the battery’s + end, go through the bulb, and come back to the − end in a complete loop.'), why],
        hint: T('用手指沿著電線走一圈，能從 + 經過燈泡回到 − 嗎？', 'Trace the wires with your finger: can you go from + through the bulb back to −?') };
    },
  },
  {
    id: 'g3-conductors', grades: [3, 4], subj: 'phys', sim: 'circuits',
    name: T('導體和絕緣體', 'Conductors and insulators'),
    cur: { tw: TW('電路與導體', 'circuits and conductors'), us: 'NGSS 4-PS3-2' },
    gen(r) {
      if (r.chance(0.5)) {
        const m = r.pick(MATS);
        return { q: T(`「${m[0]}」是導體還是絕緣體？`, `Is a ${m[1]} a conductor or an insulator?`),
          ans: ansChoice(m[2] ? [T('導體（電可以通過）', 'Conductor (lets current through)'), T('絕緣體（電不能通過）', 'Insulator (blocks current)')] : [T('絕緣體（電不能通過）', 'Insulator (blocks current)'), T('導體（電可以通過）', 'Conductor (lets current through)')]),
          sol: [T('金屬通常是導體；塑膠、木頭、橡膠、玻璃、紙通常是絕緣體。', 'Metals are usually conductors; plastic, wood, rubber, glass and paper are usually insulators.'), T(`${m[0]}${m[2] ? '是金屬，所以是導體' : '不是金屬，所以是絕緣體'}。`, `A ${m[1]} ${m[2] ? 'is metal, so it is a conductor' : 'is not metal, so it is an insulator'}.`)] };
      }
      const y = r.pick(MATS.filter((x) => x[2])), n = r.sample(MATS.filter((x) => !x[2]), 3), want = r.chance(0.5);
      if (want) return { q: T('放進電路的缺口裡，哪一個能讓燈泡亮？', 'Which one, placed in the gap of a circuit, makes the bulb light?'), ans: ansChoice([T(y[0], y[1]), ...n.map((x) => T(x[0], x[1]))]),
        sol: [T('只有導體能讓電流通過、接通電路。', 'Only a conductor lets the current through and completes the circuit.'), T(`${y[0]}是金屬導體；其他都是絕緣體。`, `The ${y[1]} is a metal conductor; the others are insulators.`)] };
      const ys = r.sample(MATS.filter((x) => x[2]), 3), nn = r.pick(MATS.filter((x) => !x[2]));
      return { q: T('電線外面要包一層東西保護我們不觸電，應該用哪一種材料？', 'Wires are covered with a material that protects us from shocks. Which would work?'), ans: ansChoice([T(nn[0], nn[1]), ...ys.map((x) => T(x[0], x[1]))]),
        sol: [T('包電線要用電流過不去的「絕緣體」。', 'Wire covering must be an insulator that current can’t pass through.'), T(`${nn[0]}是絕緣體；其他都是導電的金屬。`, `The ${nn[1]} is an insulator; the others are metals that conduct.`)] };
    },
  },
  {
    id: 'g3-series-parallel', grades: [4, 4], subj: 'phys', sim: 'circuits',
    name: T('串聯和並聯', 'Series and parallel'),
    cur: { tw: TW('電池與燈泡的串聯和並聯', 'series and parallel circuits'), us: 'NGSS 4-PS3-2' },
    bank: [
      { q: T('兩個燈泡串聯在一個電池上，和只有一個燈泡比，每個燈泡會…', 'Two bulbs in series on one battery, compared with a single bulb, are each…'), options: [T('比較暗', 'dimmer'), T('比較亮', 'brighter'), T('一樣亮', 'just as bright')], why: [T('串聯時電流要依序通過兩個燈泡，阻礙變大、電流變小，所以比較暗。', 'In series the current must pass through both bulbs, so less current flows and each is dimmer.')] },
      { q: T('兩個燈泡並聯在一個電池上，每個燈泡的亮度…', 'Two bulbs in parallel on one battery are each…'), options: [T('和只有一個燈泡時差不多亮', 'about as bright as a single bulb'), T('比較暗', 'dimmer'), T('完全不亮', 'not lit')], why: [T('並聯時每個燈泡都直接接在電池兩端，各有一條路，所以和單獨一個一樣亮（但電池比較快沒電）。', 'In parallel each bulb is connected straight across the battery on its own path, so each is as bright as one alone (but the battery runs down faster).')] },
      { q: T('串聯電路中拿掉一個燈泡，另一個燈泡會…', 'In a series circuit, one bulb is removed. The other bulb…'), options: [T('熄滅', 'goes out'), T('更亮', 'gets brighter'), T('不受影響', 'is not affected')], why: [T('串聯只有一條路，拿掉一個就斷路了。', 'A series circuit has only one path, so removing a bulb breaks it.')] },
      { q: T('並聯電路中拿掉一個燈泡，另一個燈泡會…', 'In a parallel circuit, one bulb is removed. The other bulb…'), options: [T('繼續亮', 'stays lit'), T('熄滅', 'goes out'), T('閃個不停', 'flickers nonstop')], why: [T('並聯的每個燈泡有自己的路，一條斷了另一條還是通的。', 'Each parallel bulb has its own path, so the other path still works.')] },
      { q: T('家裡的電燈和電器大多是怎麼接的？', 'How are the lights and appliances in a house mostly connected?'), options: [T('並聯', 'In parallel'), T('串聯', 'In series'), T('沒有接在一起', 'Not connected at all')], why: [T('家裡用並聯，每個電器可以單獨開關，一個壞了其他照樣能用。', 'Homes use parallel wiring, so each device can be switched on its own and one broken device doesn’t turn off the rest.')] },
      { q: T('兩個電池「串聯」接一個燈泡，和一個電池比，燈泡會…', 'Two batteries in series lighting one bulb, compared with one battery, make it…'), options: [T('比較亮', 'brighter'), T('比較暗', 'dimmer'), T('一樣亮', 'the same')], why: [T('電池串聯電壓加起來（1.5 V + 1.5 V = 3 V），推動更大的電流，燈泡更亮。', 'Batteries in series add their voltages (1.5 V + 1.5 V = 3 V), pushing more current, so the bulb is brighter.')] },
      { q: T('兩個電池「並聯」接一個燈泡，和一個電池比，燈泡會…', 'Two batteries in parallel lighting one bulb, compared with one battery, make it…'), options: [T('差不多一樣亮，但可以亮比較久', 'about equally bright, but it lasts longer'), T('亮兩倍', 'twice as bright'), T('完全不亮', 'not lit at all')], why: [T('電池並聯電壓還是 1.5 V，亮度差不多，但兩個電池一起分擔，可以用比較久。', 'Batteries in parallel still give 1.5 V, so the brightness is about the same, but sharing the work makes them last longer.')] },
      { q: T('聖誕燈串中有一顆燈泡燒壞，整串都不亮了。這串燈是怎麼接的？', 'One bulb in a string of holiday lights burns out and the whole string goes dark. How are they wired?'), options: [T('串聯', 'In series'), T('並聯', 'In parallel')], why: [T('串聯只有一條路，一顆斷了整串都斷電。', 'In series there is only one path, so one broken bulb cuts off the whole string.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g3-lever', grades: [3, 4], subj: 'phys', sim: 'lever',
    name: T('槓桿平衡算一算', 'Balancing a lever'),
    cur: { tw: TW('槓桿', 'levers'), us: 'NGSS 3-PS2-1' },
    verify: ({ m1, d1, m2, d2, ask }) => (ask === 'd2' ? (m1 * d1) / m2 : (m1 * d1) / d2),
    gen(r) {
      let m1, d1, m2, d2;
      do { m1 = r.int(1, 6); d1 = r.int(1, 6); m2 = r.int(1, 6); d2 = (m1 * d1) / m2; } while (!Number.isInteger(d2) || d2 > 6 || d2 < 1 || (m1 === m2 && d1 === d2));
      const ask = r.pick(['d2', 'm2']);
      const [zh, en] = r.pick(NAMES);
      const story = r.chance(0.4);
      if (ask === 'd2') return {
        q: story ? T(`${zh}用槓桿玩平衡：左邊第 ${d1} 格掛 ${m1} 個砝碼，右邊要掛 ${m2} 個砝碼。右邊要掛在第幾格才會平衡？`, `${en} balances a lever: ${m1} weights hang at space ${d1} on the left. ${m2} weights go on the right. At which space must they hang to balance?`)
          : T(`槓桿左邊：${m1} 個砝碼掛在第 ${d1} 格。右邊有 ${m2} 個砝碼，要掛在第幾格才平衡？`, `Left side: ${m1} weights at space ${d1}. The right side has ${m2} weights. At which space do they balance?`),
        ans: ansNum(d2), vars: { m1, d1, m2, d2, ask },
        sol: [T('槓桿平衡：左邊「重量 × 距離」= 右邊「重量 × 距離」。', 'A lever balances when weight × distance is the same on both sides.'), T(`左邊：${m1} × ${d1} = ${m1 * d1}。`, `Left: ${m1} × ${d1} = ${m1 * d1}.`), T(`右邊：${m2} × ? = ${m1 * d1}，所以 ? = ${m1 * d1} ÷ ${m2} = ${d2}。`, `Right: ${m2} × ? = ${m1 * d1}, so ? = ${m1 * d1} ÷ ${m2} = ${d2}.`), T(`答案：第 ${d2} 格。`, `Answer: space ${d2}.`)],
        hint: T('先算左邊的「重量 × 距離」。', 'Work out weight × distance on the left first.') };
      return {
        q: T(`槓桿左邊：${m1} 個砝碼掛在第 ${d1} 格。右邊第 ${d2} 格要掛幾個砝碼才平衡？`, `Left side: ${m1} weights at space ${d1}. How many weights must hang at space ${d2} on the right to balance?`),
        ans: ansNum(m2), vars: { m1, d1, m2, d2, ask },
        sol: [T('平衡時：左邊的「重量 × 距離」= 右邊的「重量 × 距離」。', 'Balanced means weight × distance is equal on both sides.'), T(`左邊：${m1} × ${d1} = ${m1 * d1}。`, `Left: ${m1} × ${d1} = ${m1 * d1}.`), T(`右邊：? × ${d2} = ${m1 * d1}，? = ${m1 * d1} ÷ ${d2} = ${m2}。`, `Right: ? × ${d2} = ${m1 * d1}, so ? = ${m1 * d1} ÷ ${d2} = ${m2}.`)] };
    },
  },
  {
    id: 'g4-moon', grades: [3, 4], subj: 'earth', sim: 'moon-phases',
    name: T('月亮的盈虧', 'Moon phases'),
    cur: { tw: TW('月亮', 'the Moon'), us: 'NGSS 1-ESS1-1' },
    mixed: true,
    bank: [
      { q: T('月亮為什麼看起來會發亮？', 'Why does the Moon look bright?'), options: [T('它反射太陽光', 'It reflects sunlight'), T('它自己會發光', 'It makes its own light'), T('地球的燈光照亮它', 'City lights shine on it')], why: [T('月亮本身不會發光，我們看到的是它反射的太陽光。', 'The Moon makes no light of its own; we see sunlight bouncing off it.')] },
      { q: T('月相變化一輪（例如從滿月到下一次滿月）大約需要多久？', 'About how long is one full cycle of phases (full moon to full moon)?'), options: [T('大約 29.5 天', 'About 29.5 days'), T('1 天', '1 day'), T('7 天', '7 days'), T('365 天', '365 days')], why: [T('月球繞地球一圈、月相變化一輪大約 29.5 天，差不多一個月。', 'One cycle takes about 29.5 days — roughly a month.')] },
      { q: T('農曆十五左右，常看到哪一種月相？', 'Around the 15th day of the lunar month, which phase do we usually see?'), options: [T('滿月', 'Full moon'), T('新月', 'New moon'), T('上弦月', 'First quarter')], why: [T('農曆初一左右是新月，十五左右是滿月（中秋節就在八月十五）。', 'The lunar month starts near new moon, so the 15th is around full moon (the Mid-Autumn Festival is on the 15th).')] },
      { q: T('在台灣看上弦月，亮的是哪一半？', 'Seen from Taiwan, which half of the first-quarter moon is lit?'), options: [T('右半邊', 'The right half'), T('左半邊', 'The left half'), T('上半部', 'The top half')], why: [T('在北半球，月亮變胖的時候右邊亮，上弦月是右半邊亮。', 'In the Northern Hemisphere the growing Moon is lit on the right, so the first quarter is a right half.')] },
      { q: T('新月的時候為什麼幾乎看不到月亮？', 'Why can we hardly see the Moon at new moon?'), options: [T('月亮被照亮的那一面背對地球', 'Its lit side faces away from Earth'), T('月亮那天不見了', 'The Moon disappears that day'), T('被雲擋住了', 'Clouds block it')], why: [T('新月時月球在地球和太陽中間，照亮的一面朝向太陽，背對我們。', 'At new moon the Moon is between Earth and the Sun, so its lit side faces the Sun, away from us.')] },
      { q: T('月亮每天升起的時間大約…', 'Each day the Moon rises about…'), options: [T('比前一天晚 50 分鐘左右', '50 minutes later than the day before'), T('和前一天完全一樣', 'at exactly the same time'), T('比前一天早 3 小時', '3 hours earlier')], why: [T('月球自己也繞著地球轉，所以每天大約晚 50 分鐘才升起。', 'The Moon moves along its orbit, so it rises about 50 minutes later each day.')] },
      { q: T('滿月通常在什麼時候升起？', 'When does a full moon usually rise?'), options: [T('傍晚太陽下山的時候', 'Around sunset'), T('中午', 'At noon'), T('早上日出的時候', 'At sunrise')], why: [T('滿月和太陽在地球的兩邊，太陽西下時滿月從東方升起，整夜都看得到。', 'A full moon is opposite the Sun, so it rises in the east as the Sun sets and is up all night.')] },
      { q: T('月亮和太陽一樣，從哪一邊升起？', 'Like the Sun, the Moon rises in the…'), options: [T('東邊', 'east'), T('西邊', 'west'), T('北邊', 'north')], why: [T('地球自轉讓太陽、月亮和星星都從東邊升起、西邊落下。', 'Earth’s spin makes the Sun, Moon and stars all rise in the east and set in the west.')] },
    ],
    gen(r) {
      if (r.chance(0.5)) return pickItem(r, this.bank);
      const i = r.int(0, 7), j = (i + 1) % 8, others = r.sample([0, 1, 2, 3, 4, 5, 6, 7].filter((x) => x !== j), 3);
      return { q: T(`月相的順序中，「${PHASES[i][0]}」之後是哪一個？`, `In the order of phases, which comes after the ${PHASES[i][1]}?`),
        ans: ansChoice([T(PHASES[j][0], PHASES[j][1]), ...others.map((o) => T(PHASES[o][0], PHASES[o][1]))]),
        sol: [T('月相的順序：新月 → 眉月 → 上弦月 → 盈凸月 → 滿月 → 虧凸月 → 下弦月 → 殘月 → 新月。', 'The order: new moon → waxing crescent → first quarter → waxing gibbous → full moon → waning gibbous → last quarter → waning crescent → new moon.'), T(`所以${PHASES[i][0]}之後是${PHASES[j][0]}。`, `So after the ${PHASES[i][1]} comes the ${PHASES[j][1]}.`)] };
    },
  },
  {
    id: 'g3-life-cycles', grades: [3, 4], subj: 'bio', sim: 'life-cycles',
    name: T('動物的一生', 'Animal life cycles'),
    cur: { tw: TW('動物的一生', 'animal life cycles'), us: 'NGSS 3-LS1-1' },
    gen(r) {
      const c = r.pick(CYCLES), t = r.int(0, 2);
      if (t === 0) {
        const i = r.int(0, c.st.length - 2), right = c.st[i + 1], pool = [...new Set([...c.st.map((s) => s[0]), '蛹', '若蟲', '蝌蚪'])].filter((x) => x !== right[0] && x !== c.st[i][0]);
        const wr = r.sample(pool, 2).map((z) => { const all = [...c.st, ['蛹', 'pupa'], ['若蟲', 'nymph'], ['蝌蚪', 'tadpole']]; const f = all.find((s) => s[0] === z); return T(f[0], f[1]); });
        return { q: T(`${c.zh}的一生中，「${c.st[i][0]}」的下一個階段是什麼？`, `In a ${c.en}’s life cycle, what stage comes after the ${c.st[i][1]}?`), ans: ansChoice([T(right[0], right[1]), ...wr]),
          sol: [T(`${c.zh}的一生：${c.st.map((s) => s[0]).join(' → ')}。`, `A ${c.en}’s life cycle: ${c.st.map((s) => s[1]).join(' → ')}.`), T(`所以${c.st[i][0]}之後是${right[0]}。`, `So after the ${c.st[i][1]} comes the ${right[1]}.`)] };
      }
      if (t === 1 && c.full !== null) {
        return { q: T(`${c.zh}的一生有沒有「蛹」的階段？`, `Does a ${c.en} have a pupa stage?`), ans: ansChoice(c.full ? [T('有，是完全變態', 'Yes — complete metamorphosis'), T('沒有，是不完全變態', 'No — incomplete metamorphosis')] : [T('沒有，是不完全變態', 'No — incomplete metamorphosis'), T('有，是完全變態', 'Yes — complete metamorphosis')]),
          sol: [T('昆蟲經過卵 → 幼蟲 → 蛹 → 成蟲叫完全變態；卵 → 若蟲 → 成蟲（沒有蛹）叫不完全變態。', 'Insects that go egg → larva → pupa → adult have complete metamorphosis; egg → nymph → adult (no pupa) is incomplete metamorphosis.'), T(`${c.zh}：${c.st.map((s) => s[0]).join(' → ')}。`, `${c.en}: ${c.st.map((s) => s[1]).join(' → ')}.`)] };
      }
      const full = CYCLES.filter((x) => x.full), part = CYCLES.filter((x) => x.full === false), pickFull = r.chance(0.5);
      const right = r.pick(pickFull ? full : part), wrong = r.sample(pickFull ? part : full, 2);
      return { q: pickFull ? T('下面哪一種昆蟲會經過「蛹」的階段？', 'Which of these insects has a pupa stage?') : T('下面哪一種昆蟲「沒有」蛹的階段？', 'Which of these insects has NO pupa stage?'),
        ans: ansChoice([T(right.zh, right.en), ...wrong.map((w) => T(w.zh, w.en))]),
        sol: [T('完全變態：卵 → 幼蟲 → 蛹 → 成蟲（例如蝴蝶、獨角仙、蚊子）。不完全變態：卵 → 若蟲 → 成蟲（例如蝗蟲、螳螂、蟑螂）。', 'Complete metamorphosis: egg → larva → pupa → adult (butterflies, beetles, mosquitoes). Incomplete: egg → nymph → adult (grasshoppers, mantises, cockroaches).'), T(`答案是${right.zh}。`, `The answer is the ${right.en}.`)] };
    },
  },
  {
    id: 'g3-animal-groups', grades: [3, 4], subj: 'bio',
    name: T('動物的分類', 'Groups of animals'),
    cur: { tw: TW('動物的特徵與分類', 'animal features and groups'), us: 'NGSS 3-LS4-2' },
    gen(r) {
      const [zh, en, gi] = r.pick(ANIMALS), g = GROUPS[gi], wrong = r.sample(GROUPS.filter((_, i) => i !== gi), 3);
      if (r.chance(0.7)) return { q: T(`${zh}屬於哪一類動物？`, `Which group of animals does a ${en} belong to?`), ans: ansChoice([T(g[0], g[1]), ...wrong.map((w) => T(w[0], w[1]))]),
        sol: [T(`${g[0]}的特徵：${g[2]}。`, `A ${g[1]} ${g[3]}.`), T(`${zh}有這些特徵，所以是${g[0]}。${gi === 0 && ['海豚', '鯨魚', '蝙蝠'].includes(zh) ? '（雖然' + (zh === '蝙蝠' ? '會飛' : '住在海裡') + '，但牠用乳汁餵小孩，是哺乳類。）' : ''}`, `A ${en} has these features, so it is a ${g[1]}.${gi === 0 && ['dolphin', 'whale', 'bat'].includes(en) ? ` (Even though it ${en === 'bat' ? 'flies' : 'lives in the sea'}, it feeds its babies milk, so it is a mammal.)` : ''}`)] };
      const legs = [['蜘蛛', 'spider', 8, false], ['螞蟻', 'ant', 6, true], ['蜈蚣', 'centipede', 30, false], ['蜜蜂', 'bee', 6, true], ['蝸牛', 'snail', 0, false], ['瓢蟲', 'ladybug', 6, true]];
      const [lz, le, n, ins] = r.pick(legs);
      return { q: T(`${lz}是昆蟲嗎？`, `Is a ${le} an insect?`), ans: ansChoice(ins ? [T('是', 'Yes'), T('不是', 'No')] : [T('不是', 'No'), T('是', 'Yes')]),
        sol: [T('昆蟲的身體分成頭、胸、腹三部分，有六隻腳。', 'Insects have three body parts (head, thorax, abdomen) and six legs.'), T(ins ? `${lz}有 6 隻腳、身體分三部分，是昆蟲。` : `${lz}${n === 0 ? '沒有腳' : `有 ${n === 30 ? '很多' : n} 隻腳`}，不是昆蟲。${lz === '蜘蛛' ? '（蜘蛛有 8 隻腳，身體只分兩部分。）' : ''}`, ins ? `A ${le} has 6 legs and 3 body parts, so it is an insect.` : `A ${le} has ${n === 0 ? 'no legs' : n === 30 ? 'many legs' : n + ' legs'}, so it is not an insect.${le === 'spider' ? ' (Spiders have 8 legs and only two body parts.)' : ''}`)] };
    },
  },
  {
    id: 'g4-rocks-soil', grades: [3, 4], subj: 'earth', sim: 'soil-jar',
    name: T('岩石與土壤', 'Rocks and soil'),
    cur: { tw: TW('岩石、礦物與土壤', 'rocks, minerals and soil'), us: 'NGSS 4-ESS2-1' },
    bank: [
      { q: T('土壤和水裝進瓶子搖一搖再靜置，最下層通常是什麼？', 'Soil and water are shaken in a jar and left to settle. What is usually at the bottom?'), options: [T('大顆的礫石', 'Big gravel'), T('細細的黏土', 'Fine clay'), T('腐植質', 'Humus')], why: [T('大顆粒比較重，在水中沉得最快，所以沉在最下面。', 'Big grains sink fastest in water, so they end up at the bottom.')] },
      { q: T('土壤中哪一種成分最能讓水快速流過？', 'Which kind of soil lets water drain through fastest?'), options: [T('砂質（顆粒大）', 'Sandy soil (big grains)'), T('黏土（顆粒細）', 'Clay (tiny grains)'), T('都一樣', 'They are all the same')], why: [T('顆粒大，空隙就大，水容易流過；黏土顆粒細又緊密，排水很慢。', 'Big grains leave big gaps for water; tiny packed clay grains drain slowly.')] },
      { q: T('土壤裡黑黑的、由枯葉和動物遺體分解成的東西叫什麼？', 'What is the dark material in soil made from rotted leaves and dead animals?'), options: [T('腐植質', 'Humus'), T('礫石', 'Gravel'), T('沙', 'Sand')], why: [T('腐植質是生物遺體被分解後的物質，含有豐富養分。', 'Humus is decayed plant and animal matter, rich in nutrients.')] },
      { q: T('大岩石經過很久很久變成小石頭和沙，主要是因為什麼？', 'Over a very long time big rocks break into pebbles and sand mainly because of…'), options: [T('風化作用（風吹、日曬、雨淋、冷熱變化）', 'weathering — wind, sun, rain and heating and cooling'), T('有人把它敲碎', 'people smashing them'), T('岩石會自己長小', 'rocks shrinking by themselves')], why: [T('風、雨、冷熱變化和植物根部，會慢慢讓岩石碎裂，叫做風化。', 'Wind, rain, heating and cooling and plant roots slowly crack rocks apart — weathering.')] },
      { q: T('種植大部分的植物，最適合的是哪一種土？', 'Which soil is best for growing most plants?'), options: [T('含有腐植質、鬆軟的土', 'Loose soil with plenty of humus'), T('全部都是石頭', 'Nothing but stones'), T('又硬又黏的黏土', 'Hard sticky clay')], why: [T('鬆軟的土透氣又能保水，腐植質提供養分，植物長得好。', 'Loose soil holds air and water, and humus provides nutrients, so plants grow well.')] },
      { q: T('用放大鏡看花崗岩，會看到裡面有好幾種顏色的顆粒，這些顆粒是什麼？', 'Under a magnifier, granite shows grains of several colors. What are the grains?'), options: [T('不同的礦物', 'Different minerals'), T('彩色的沙糖', 'Colored sugar'), T('小昆蟲', 'Tiny insects')], why: [T('岩石是由一種或多種礦物組成的，花崗岩含有石英、長石、雲母等礦物。', 'Rocks are made of one or more minerals; granite contains quartz, feldspar, mica and more.')] },
      { q: T('河邊的石頭為什麼常常圓圓滑滑的？', 'Why are stones in a river often smooth and round?'), options: [T('被水沖著互相碰撞磨圓了', 'Water tumbles them together and wears off the corners'), T('它們一開始就是圓的', 'They started out round'), T('有人把它們磨圓', 'People polished them')], why: [T('河水搬運石頭，石頭互相碰撞摩擦，稜角慢慢被磨掉。', 'The river carries stones that knock and rub against each other, slowly wearing away their edges.')] },
      { q: T('下大雨時，沒有植物覆蓋的山坡比較容易發生什麼事？', 'In heavy rain, what is more likely on a hillside with no plants?'), options: [T('土石被沖走（土壤流失）', 'Soil gets washed away (erosion)'), T('長出更多樹', 'More trees grow'), T('什麼都不會發生', 'Nothing happens')], why: [T('植物的根能抓住土壤；沒有植物時雨水容易把土沖走，甚至造成土石流。', 'Plant roots hold soil in place. Without them rain washes the soil away and can even cause mudslides.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g4-plant-parts', grades: [3, 4], subj: 'bio',
    name: T('植物的構造', 'Parts of a plant'),
    cur: { tw: TW('植物的身體', 'plant structures'), us: 'NGSS 4-LS1-1' },
    bank: [
      { q: T('植物的哪一個部位負責吸收水分和養分？', 'Which part of a plant takes in water and nutrients?'), options: [T('根', 'Root'), T('葉', 'Leaf'), T('花', 'Flower')], why: [T('根從土壤中吸收水和養分，也固定植物。', 'Roots absorb water and nutrients from the soil and anchor the plant.')] },
      { q: T('莖的主要功能是什麼？', 'What does the stem mainly do?'), options: [T('支撐植物並運送水分和養分', 'Holds the plant up and carries water and food'), T('製造種子', 'Makes seeds'), T('吸收陽光', 'Soaks up sunlight')], why: [T('莖撐起葉和花，裡面的管子把水往上送、把養分往下送。', 'The stem holds up the leaves and flowers; tubes inside carry water up and food down.')] },
      { q: T('葉子主要的工作是什麼？', 'What is a leaf’s main job?'), options: [T('行光合作用製造養分', 'Making food by photosynthesis'), T('吸收土壤中的水', 'Taking in soil water'), T('長出果實', 'Growing fruit')], why: [T('葉子利用陽光、水和二氧化碳製造養分。', 'Leaves use sunlight, water and carbon dioxide to make food.')] },
      { q: T('花的主要功能是什麼？', 'What does a flower mainly do?'), options: [T('繁殖：授粉後結出果實和種子', 'Reproduction: after pollination it makes fruit and seeds'), T('吸水', 'Absorb water'), T('支撐植物', 'Support the plant')], why: [T('花是植物的繁殖器官，授粉後可以發育成果實和種子。', 'Flowers are reproductive parts; after pollination they become fruits and seeds.')] },
      { q: T('我們吃的紅蘿蔔，是植物的哪一部分？', 'Which plant part is the carrot we eat?'), options: [T('根', 'Root'), T('莖', 'Stem'), T('果實', 'Fruit')], why: [T('紅蘿蔔是儲存養分的根。', 'A carrot is a root that stores food.')] },
      { q: T('我們吃的馬鈴薯，是植物的哪一部分？', 'Which plant part is a potato?'), options: [T('莖（塊莖）', 'Stem (a tuber)'), T('根', 'Root'), T('葉', 'Leaf')], why: [T('馬鈴薯是長在地下的莖，上面的「芽眼」可以長出新芽。', 'A potato is an underground stem; its “eyes” can sprout new shoots.')] },
      { q: T('把白色康乃馨插在加了紅色色素的水裡，花瓣變紅了。這說明什麼？', 'A white carnation in red-dyed water turns red. What does this show?'), options: [T('水會經過莖運送到花', 'Water travels up the stem to the flower'), T('花會自己變色', 'Flowers change color on their own'), T('色素是從空氣中來的', 'The dye came from the air')], why: [T('莖裡的管子把水（連同色素）往上運送到花瓣。', 'Tubes in the stem carry the water — and the dye — up to the petals.')] },
      { q: T('蜜蜂在花朵間飛來飛去，對植物有什麼幫助？', 'How do bees flying from flower to flower help plants?'), options: [T('幫忙傳播花粉（授粉）', 'They carry pollen (pollination)'), T('幫忙澆水', 'They water the plants'), T('把葉子吃掉', 'They eat the leaves')], why: [T('蜜蜂身上沾了花粉，帶到另一朵花上，幫助植物授粉、結果。', 'Pollen sticks to bees and gets carried to other flowers, helping the plant make fruit and seeds.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g4-matter', grades: [3, 4], subj: 'chem',
    name: T('物質的三態變化', 'Solids, liquids and gases'),
    cur: { tw: TW('水的三態與物質', 'states of matter'), us: 'NGSS 2-PS1-1' },
    bank: [
      { q: T('下面哪一個是「氣體」？', 'Which one is a gas?'), options: [T('水蒸氣', 'Water vapor'), T('冰塊', 'An ice cube'), T('牛奶', 'Milk')], why: [T('氣體沒有固定形狀和體積，會充滿整個容器，例如水蒸氣、空氣。', 'A gas has no fixed shape or volume and fills its container — like water vapor or air.')] },
      { q: T('液體有什麼特性？', 'What is true of a liquid?'), options: [T('體積固定，形狀隨容器改變', 'Its volume is fixed but its shape follows the container'), T('形狀和體積都固定', 'Its shape and volume are both fixed'), T('會充滿整個房間', 'It spreads out to fill the room')], why: [T('液體會流動，倒進不同容器形狀會變，但體積不變。', 'A liquid flows: its shape changes with the container but its volume stays the same.')] },
      { q: T('濕衣服晾乾，是水的哪一種變化？', 'Wet clothes drying is which change?'), options: [T('蒸發（液體變氣體）', 'Evaporation (liquid → gas)'), T('凝結（氣體變液體）', 'Condensation (gas → liquid)'), T('凝固（液體變固體）', 'Freezing (liquid → solid)')], why: [T('衣服裡的水變成水蒸氣跑到空氣中，叫做蒸發。', 'The water in the clothes turns into vapor in the air — evaporation.')] },
      { q: T('冬天對著冰冷的鏡子哈氣，鏡子起霧，這是什麼變化？', 'Breathing on a cold mirror fogs it up. What change is this?'), options: [T('凝結：水蒸氣變成小水滴', 'Condensation: vapor becomes droplets'), T('蒸發', 'Evaporation'), T('融化', 'Melting')], why: [T('呼出的水蒸氣碰到冷的鏡子，凝結成很多小水滴。', 'The water vapor in your breath condenses into tiny droplets on the cold mirror.')] },
      { q: T('天氣愈熱、風愈大，衣服會…', 'The hotter and windier it is, the clothes dry…'), options: [T('乾得愈快', 'faster'), T('乾得愈慢', 'slower'), T('永遠不會乾', 'never')], why: [T('溫度高、通風好，水蒸發得比較快。', 'Heat and moving air make water evaporate faster.')] },
      { q: T('巧克力放在手心會融化，這是什麼變化？', 'Chocolate melts in your hand. What change is this?'), options: [T('固體變成液體', 'Solid → liquid'), T('液體變成氣體', 'Liquid → gas'), T('氣體變成液體', 'Gas → liquid')], why: [T('手的熱讓固體巧克力融化成液體。', 'The warmth of your hand melts the solid chocolate into a liquid.')] },
      { q: T('冰塊變成水，它的重量會…', 'When an ice cube melts into water, its mass…'), options: [T('不變', 'stays the same'), T('變輕', 'goes down'), T('變重', 'goes up')], why: [T('融化只是改變狀態，水的量沒有增加也沒有減少。', 'Melting only changes the state; no water is added or lost.')] },
      { q: T('裝滿水的玻璃瓶放進冷凍庫，瓶子可能會破裂，因為…', 'A full glass bottle of water may crack in the freezer because…'), options: [T('水結冰時體積會變大', 'water expands when it freezes'), T('冰比水重很多', 'ice is much heavier'), T('冷凍庫有風', 'the freezer is windy')], why: [T('水結成冰時體積大約增加十分之一，把瓶子撐破。', 'Water expands by about a tenth when it freezes, which can burst the bottle.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g4-sound', grades: [3, 4], subj: 'phys',
    name: T('聲音', 'Sound'),
    cur: { tw: TW('聲音的產生與傳播', 'making and hearing sound'), us: 'NGSS 1-PS4-1' },
    bank: [
      { q: T('聲音是怎麼產生的？', 'How is sound made?'), options: [T('物體振動', 'Something vibrates'), T('物體發光', 'Something glows'), T('物體變冷', 'Something cools down')], why: [T('所有聲音都來自振動，例如琴弦、鼓面、喉嚨的聲帶。', 'All sound comes from vibrations — a string, a drumhead, your vocal cords.')] },
      { q: T('吉他的弦拉得愈緊，彈出來的聲音…', 'The tighter a guitar string, the sound is…'), options: [T('愈高', 'higher'), T('愈低', 'lower'), T('愈小聲', 'quieter')], why: [T('弦愈緊振動愈快，音調愈高。', 'A tighter string vibrates faster, giving a higher pitch.')] },
      { q: T('弦愈短，彈出來的音…', 'A shorter string plays a note that is…'), options: [T('比較高', 'higher'), T('比較低', 'lower'), T('一樣', 'the same')], why: [T('短的弦振動得比較快，音調比較高。', 'A shorter string vibrates faster, so the note is higher.')] },
      { q: T('用力敲鼓和輕輕敲鼓，差別是…', 'Hitting a drum hard instead of gently makes the sound…'), options: [T('用力敲比較大聲', 'louder'), T('用力敲音調比較高', 'higher'), T('沒有差別', 'no different')], why: [T('用力敲讓鼓面振動幅度變大，聲音比較大聲（音量變大）。', 'Hitting harder makes the drumhead vibrate with a bigger swing, so it is louder.')] },
      { q: T('在太空中（沒有空氣）大聲喊叫，別人聽得到嗎？', 'If you shout in outer space (no air), can someone hear you?'), options: [T('聽不到，聲音需要物質才能傳播', 'No — sound needs matter to travel through'), T('聽得到，聲音可以在真空中傳播', 'Yes — sound travels through empty space'), T('聲音會變更大', 'It would be even louder')], why: [T('聲音要靠空氣、水或固體等物質傳遞，真空中沒有東西可以振動。', 'Sound travels through air, water or solids; in a vacuum there is nothing to carry the vibration.')] },
      { q: T('杯子裡裝不同高度的水，用筷子敲，水愈多的杯子聲音…', 'Glasses hold different amounts of water. Tapped with a chopstick, the glass with more water sounds…'), options: [T('比較低', 'lower'), T('比較高', 'higher'), T('一樣', 'the same')], why: [T('水愈多，杯子振動得愈慢，敲出來的音愈低。', 'More water makes the glass vibrate more slowly, so the note is lower.')] },
      { q: T('打雷時為什麼先看到閃電、後聽到雷聲？', 'Why do you see lightning before you hear the thunder?'), options: [T('光跑得比聲音快很多', 'Light travels much faster than sound'), T('雷聲比較晚發出', 'The thunder is made later'), T('耳朵比眼睛慢', 'Ears are slower than eyes')], why: [T('閃電和雷聲同時產生，但光速遠快於聲速（聲音每秒約 340 公尺），所以雷聲晚到。', 'Lightning and thunder happen together, but light is far faster than sound (about 340 m per second), so the thunder arrives later.')] },
      { q: T('用兩個紙杯和一條拉緊的線做成「傳聲筒」，聲音是靠什麼傳過去的？', 'In a string telephone made of two cups and a tight string, what carries the sound?'), options: [T('線的振動', 'Vibrations along the string'), T('電', 'Electricity'), T('光', 'Light')], why: [T('說話讓杯底振動，振動沿著拉緊的線傳到另一個杯子。', 'Talking makes the cup vibrate, and the vibration travels along the tight string to the other cup.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g4-temperature-data', grades: [3, 4], subj: 'earth',
    name: T('氣溫紀錄表', 'Reading temperature records'),
    cur: { tw: TW('天氣觀測', 'observing the weather'), us: 'NGSS 3-ESS2-1' },
    verify: ({ hi, lo, ask, idx }) => (ask === 'range' ? hi[idx] - lo[idx] : ask === 'max' ? Math.max(...hi) : Math.max(...hi) - Math.min(...hi)),
    gen(r) {
      const days = [['星期一', 'Mon'], ['星期二', 'Tue'], ['星期三', 'Wed'], ['星期四', 'Thu'], ['星期五', 'Fri']];
      const base = r.int(14, 26), hi = days.map(() => base + r.int(2, 9)), lo = hi.map((h) => h - r.int(4, 10));
      const tab = (l, h, w) => `<table class="dtab"><tr><th></th>${days.map((d) => `<th>${d[l]}</th>`).join('')}</tr><tr><th>${h}</th>${hi.map((x) => `<td>${x}</td>`).join('')}</tr><tr><th>${w}</th>${lo.map((x) => `<td>${x}</td>`).join('')}</tr></table>`;
      const tz = tab(0, '最高', '最低'), te = tab(1, 'High', 'Low');
      const ask = r.pick(['range', 'max', 'spread']), idx = r.int(0, 4);
      const vars = { hi, lo, ask, idx };
      if (ask === 'range') return { q: T(`看下表（°C）。${days[idx][0]}一天裡最高和最低氣溫差幾度？${tz}`, `Look at the table (°C). On ${days[idx][1]}, how many degrees apart were the highest and lowest temperatures?${te}`), ans: ansNum(hi[idx] - lo[idx]), vars,
        sol: [T('溫差 = 最高氣溫 − 最低氣溫。', 'Difference = high − low.'), T(`${hi[idx]} − ${lo[idx]} = ${hi[idx] - lo[idx]}（°C）。`, `${hi[idx]} − ${lo[idx]} = ${hi[idx] - lo[idx]} (°C).`)] };
      if (ask === 'max') return { q: T(`看下表（°C）。這五天中最高的氣溫是幾度？${tz}`, `Look at the table (°C). What was the highest temperature in these five days?${te}`), ans: ansNum(Math.max(...hi)), vars,
        sol: [T('比較「最高」那一列的每一個數字。', 'Compare every number in the “High” row.'), T(`最大的是 ${Math.max(...hi)} °C。`, `The biggest is ${Math.max(...hi)} °C.`)] };
      return { q: T(`看下表（°C）。五天的「最高氣溫」中，最熱的一天比最涼的一天高幾度？${tz}`, `Look at the table (°C). Among the daily highs, how many degrees warmer was the warmest day than the coolest?${te}`), ans: ansNum(Math.max(...hi) - Math.min(...hi)), vars,
        sol: [T(`「最高」那一列：最大 ${Math.max(...hi)}、最小 ${Math.min(...hi)}。`, `In the High row the largest is ${Math.max(...hi)} and the smallest is ${Math.min(...hi)}.`), T(`${Math.max(...hi)} − ${Math.min(...hi)} = ${Math.max(...hi) - Math.min(...hi)}（°C）。`, `${Math.max(...hi)} − ${Math.min(...hi)} = ${Math.max(...hi) - Math.min(...hi)} (°C).`)] };
    },
  },
  {
    id: 'g3-magnets-more', grades: [3, 3], subj: 'phys',
    name: T('磁鐵與指北針', 'Magnets and compasses'),
    cur: { tw: TW('磁鐵的性質', 'properties of magnets'), us: 'NGSS 3-PS2-3' },
    bank: [
      { q: T('指北針的紅色（N）指針會指向哪裡？', 'Where does the red (N) end of a compass needle point?'), options: [T('北方', 'North'), T('南方', 'South'), T('東方', 'East')], why: [T('地球像一塊大磁鐵，指北針的 N 極會指向北方。', 'Earth acts like a giant magnet, and a compass needle’s N end points north.')] },
      { q: T('把磁鐵靠近指北針，指針會…', 'Bring a magnet near a compass. The needle…'), options: [T('轉動，被磁鐵影響', 'turns because the magnet affects it'), T('完全不動', 'doesn’t move at all'), T('開始發光', 'starts glowing')], why: [T('指針是小磁鐵，會受到附近磁鐵的吸引或排斥而轉動。', 'The needle is a tiny magnet, so a nearby magnet pulls or pushes it around.')] },
      { q: T('用磁鐵的同一極，朝同一方向摩擦鐵釘很多次，鐵釘會…', 'Stroking an iron nail many times in one direction with one pole of a magnet makes the nail…'), options: [T('暫時變成磁鐵', 'become a magnet for a while'), T('變成銅', 'turn into copper'), T('變得更重', 'get heavier')], why: [T('鐵釘被磁化，暫時有磁性，可以吸起小迴紋針。', 'The nail is magnetized and becomes a temporary magnet that can pick up small clips.')] },
      { q: T('一塊磁鐵的磁力，哪裡最強？', 'Where is a magnet’s pull strongest?'), options: [T('兩端的磁極', 'At the poles (the ends)'), T('正中間', 'In the middle'), T('到處一樣強', 'Equally strong everywhere')], why: [T('磁鐵兩端（磁極）吸力最強。', 'A magnet pulls hardest at its poles.')] },
      { q: T('磁鐵可以隔著什麼東西吸住迴紋針？', 'A magnet can still pull a paper clip through…'), options: [T('一張紙或薄木板', 'a sheet of paper or thin wood'), T('完全不能隔著任何東西', 'nothing at all — it must touch'), T('只能隔著鐵板', 'only an iron plate')], why: [T('磁力可以穿過紙、布、塑膠、薄木板等不會被磁化的東西。', 'Magnetic force passes through paper, cloth, plastic and thin wood.')] },
      { q: T('冰箱磁鐵可以貼在冰箱門上，是因為冰箱門是…', 'A fridge magnet sticks to the fridge door because the door is made of…'), options: [T('鐵（鋼）做的', 'iron (steel)'), T('塑膠做的', 'plastic'), T('玻璃做的', 'glass')], why: [T('磁鐵會吸住含鐵的材料，冰箱門外殼是鋼板。', 'Magnets attract iron-containing materials, and the fridge door is steel.')] },
      { q: T('把一塊磁鐵用線吊起來，讓它自由轉動，停下來時它的 N 極會指向…', 'A bar magnet hanging freely on a string comes to rest with its N pole pointing…'), options: [T('北方', 'north'), T('南方', 'south'), T('隨便哪裡', 'anywhere')], why: [T('自由轉動的磁鐵就像指北針，N 極指向北方。', 'A freely turning magnet behaves like a compass: its N pole points north.')] },
      { q: T('兩塊磁鐵的 S 極互相靠近，會怎樣？', 'Two magnets’ S poles are brought together. What happens?'), options: [T('互相排斥', 'They repel'), T('互相吸引', 'They attract'), T('沒有反應', 'Nothing')], why: [T('同極相斥，異極相吸。', 'Like poles repel; unlike poles attract.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
];

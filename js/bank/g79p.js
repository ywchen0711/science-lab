// Practice units for grades 7–9, physics & chemistry (國中 理化). Format: see SPEC.md.
import { T, NAMES, ansNum, ansQty, ansChoice, pickItem, rnd, num } from '../util.js';

const TW = (zh, en) => T(`國中 理化 ${zh}`, `Junior high physical science · ${en}`);
const U = (zh, en) => T(zh, en);
const sub = (f) => f.replace(/(\d+)/g, '<sub>$1</sub>');
const MATS = [['木塊', 'wood block', 0.6], ['冰塊', 'block of ice', 0.9], ['塑膠塊', 'plastic block', 1.2], ['玻璃', 'piece of glass', 2.5], ['鋁塊', 'aluminum block', 2.7], ['鐵塊', 'iron block', 7.9], ['銅塊', 'copper block', 8.9], ['鉛塊', 'lead block', 11.3]];

export default [
  {
    id: 'g8-density', grades: [8, 8], subj: 'phys', sim: 'density-buoyancy',
    name: T('密度', 'Density'),
    cur: { tw: TW('物質的密度', 'density'), us: 'NGSS MS-PS1-2' },
    verify: ({ m, V, ask, rho }) => (ask === 'rho' ? m / V : ask === 'm' ? rho * V : ask === 'V' ? m / rho : rho * 1000),
    gen(r) {
      const [zh, en, rho] = r.pick(MATS), V = r.pick([10, 20, 25, 40, 50, 80, 100, 120, 150, 200]), m = rnd(rho * V, 1);
      const ask = r.pick(['rho', 'rho', 'm', 'V', 'conv', 'float']);
      if (ask === 'rho') return { q: T(`一個${zh}的質量是 ${num(m)} 公克，體積是 ${V} 立方公分。它的密度是多少 g/cm³？`, `A ${en} has a mass of ${num(m)} g and a volume of ${V} cm³. What is its density in g/cm³?`), ans: ansQty(rho, 2, 'g/cm³'), vars: { m, V, ask },
        sol: [T('密度 = 質量 ÷ 體積（D = M / V）。', 'Density = mass ÷ volume (D = M / V).'), T(`${num(m)} g ÷ ${V} cm³ = ${num(rho)} g/cm³。`, `${num(m)} g ÷ ${V} cm³ = ${num(rho)} g/cm³.`), T(`${num(rho)} ${rho < 1 ? '< 1，比水小，放進水中會浮' : '> 1，比水大，放進水中會沉'}。`, `${num(rho)} is ${rho < 1 ? 'less than 1, so it floats in water' : 'more than 1, so it sinks in water'}.`)] };
      if (ask === 'm') return { q: T(`${zh}的密度是 ${num(rho)} g/cm³，體積 ${V} cm³ 的${zh}質量是多少公克？`, `A ${en} has density ${num(rho)} g/cm³. What is the mass of ${V} cm³ of it, in grams?`), ans: ansQty(m, 1, U('公克', 'g')), vars: { rho, V, ask },
        sol: [T('質量 = 密度 × 體積。', 'Mass = density × volume.'), T(`${num(rho)} × ${V} = ${num(m)} g。`, `${num(rho)} × ${V} = ${num(m)} g.`)] };
      if (ask === 'V') return { q: T(`一個${zh}的質量是 ${num(m)} 公克，密度 ${num(rho)} g/cm³。它的體積是多少 cm³？`, `A ${en} has a mass of ${num(m)} g and a density of ${num(rho)} g/cm³. What is its volume in cm³?`), ans: ansQty(V, 1, 'cm³'), vars: { m, rho, ask },
        sol: [T('體積 = 質量 ÷ 密度。', 'Volume = mass ÷ density.'), T(`${num(m)} ÷ ${num(rho)} = ${V} cm³。`, `${num(m)} ÷ ${num(rho)} = ${V} cm³.`)] };
      if (ask === 'conv') return { q: T(`${zh}的密度是 ${num(rho)} g/cm³，等於多少 kg/m³？`, `The density of a ${en} is ${num(rho)} g/cm³. What is that in kg/m³?`), ans: ansQty(rho * 1000, 0, 'kg/m³'), vars: { rho, ask },
        sol: [T('1 g/cm³ = 1000 kg/m³（1 立方公尺 = 1,000,000 立方公分，1 公斤 = 1000 公克）。', '1 g/cm³ = 1000 kg/m³ (1 m³ = 1,000,000 cm³ and 1 kg = 1000 g).'), T(`${num(rho)} × 1000 = ${num(rho * 1000)} kg/m³。`, `${num(rho)} × 1000 = ${num(rho * 1000)} kg/m³.`)] };
      const fl = rho < 1;
      return { q: T(`一塊物體質量 ${num(m)} 公克、體積 ${V} 立方公分，放進水（密度 1 g/cm³）中會…`, `An object has a mass of ${num(m)} g and a volume of ${V} cm³. In water (density 1 g/cm³) it will…`),
        ans: ansChoice(fl ? [T('浮起來', 'float'), T('沉下去', 'sink')] : [T('沉下去', 'sink'), T('浮起來', 'float')]), vars: { m, V, ask },
        sol: [T(`密度 = ${num(m)} ÷ ${V} = ${num(rho)} g/cm³。`, `Density = ${num(m)} ÷ ${V} = ${num(rho)} g/cm³.`), T(fl ? '比水的密度小，所以會浮。' : '比水的密度大，所以會沉。', fl ? 'That is less than water, so it floats.' : 'That is more than water, so it sinks.')] };
    },
  },
  {
    id: 'g8-motion', grades: [8, 8], subj: 'phys', sim: 'motion-graphs',
    name: T('速率、速度與加速度', 'Speed, velocity and acceleration'),
    cur: { tw: TW('直線運動', 'motion in a straight line'), us: 'NGSS MS-PS2-2' },
    verify: (v) => (v.ask === 'avg' ? (v.d1 + v.d2) / (v.t1 + v.t2) : v.ask === 'a' ? (v.v1 - v.v0) / v.t : v.ask === 'v' ? v.v0 + v.a * v.t : 0.5 * v.a * v.t * v.t),
    gen(r) {
      const [zh, en] = r.pick(NAMES), ask = r.pick(['avg', 'a', 'v', 'd']);
      if (ask === 'avg') {
        const v1 = r.pick([2, 3, 4, 5]), v2 = r.pick([1, 2, 6, 8].filter((x) => x !== v1)), t1 = r.pick([10, 20, 30]), t2 = r.pick([10, 20, 30, 40]), d1 = v1 * t1, d2 = v2 * t2, avg = (d1 + d2) / (t1 + t2);
        return { q: T(`${zh}先以 ${v1} m/s 走了 ${t1} 秒，接著以 ${v2} m/s 走了 ${t2} 秒。全程的平均速率是多少 m/s？（四捨五入到小數第二位）`, `${en} moves at ${v1} m/s for ${t1} s, then at ${v2} m/s for ${t2} s. What is the average speed for the whole trip, in m/s? (Round to 2 decimal places.)`),
          ans: ansQty(avg, 2, 'm/s'), vars: { d1, d2, t1, t2, ask },
          sol: [T('平均速率 = 總路程 ÷ 總時間（不是兩個速率的平均）。', 'Average speed = total distance ÷ total time (not the average of the two speeds).'), T(`總路程 = ${v1}×${t1} + ${v2}×${t2} = ${d1} + ${d2} = ${d1 + d2} m；總時間 = ${t1 + t2} s。`, `Total distance = ${v1}×${t1} + ${v2}×${t2} = ${d1} + ${d2} = ${d1 + d2} m; total time = ${t1 + t2} s.`), T(`${d1 + d2} ÷ ${t1 + t2} ≈ ${num(rnd(avg, 2))} m/s。`, `${d1 + d2} ÷ ${t1 + t2} ≈ ${num(rnd(avg, 2))} m/s.`)],
          hint: T('先算總路程和總時間。', 'Find the total distance and total time first.') };
      }
      const a = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), t = r.pick([2, 3, 4, 5, 6, 8, 10]), v0 = r.pick([0, 0, 2, 4, 5, 10]), v1 = v0 + a * t;
      const thing = r.pick([['一輛汽車', 'A car'], ['一台機車', 'A scooter'], ['一列火車', 'A train'], ['一顆球滾下斜坡', 'A ball rolling down a ramp']]);
      if (ask === 'a') return { q: T(`${thing[0]}在 ${t} 秒內，速度從 ${v0} m/s 均勻增加到 ${num(v1)} m/s。加速度是多少 m/s²？`, `${thing[1]} speeds up steadily from ${v0} m/s to ${num(v1)} m/s in ${t} s. What is its acceleration in m/s²?`), ans: ansQty(a, 2, 'm/s²'), vars: { v0, v1, t, ask },
        sol: [T('加速度 = 速度的變化 ÷ 時間，a = (v − v₀) ÷ t。', 'Acceleration = change in velocity ÷ time, a = (v − v₀) ÷ t.'), T(`(${num(v1)} − ${v0}) ÷ ${t} = ${num(v1 - v0)} ÷ ${t} = ${num(a)} m/s²。`, `(${num(v1)} − ${v0}) ÷ ${t} = ${num(v1 - v0)} ÷ ${t} = ${num(a)} m/s².`)] };
      if (ask === 'v') return { q: T(`${thing[0]}初速度 ${v0} m/s，以 ${num(a)} m/s² 的加速度加速 ${t} 秒後，速度是多少 m/s？`, `${thing[1]} starts at ${v0} m/s and accelerates at ${num(a)} m/s² for ${t} s. What is its velocity then, in m/s?`), ans: ansQty(v1, 2, 'm/s'), vars: { v0, a, t, ask },
        sol: [T('v = v₀ + at。', 'v = v₀ + at.'), T(`${v0} + ${num(a)} × ${t} = ${num(v1)} m/s。`, `${v0} + ${num(a)} × ${t} = ${num(v1)} m/s.`)] };
      return { q: T(`${thing[0]}從靜止開始，以 ${num(a)} m/s² 等加速度運動 ${t} 秒。這段時間走了幾公尺？`, `${thing[1]} starts from rest and accelerates at ${num(a)} m/s² for ${t} s. How far does it go, in meters?`), ans: ansQty(0.5 * a * t * t, 2, U('公尺', 'm')), vars: { a, t, ask },
        sol: [T('從靜止開始的等加速度運動：位移 = ½at²（也就是 v–t 圖下三角形的面積）。', 'From rest with constant acceleration: distance = ½at² (the triangle under the v–t graph).'), T(`½ × ${num(a)} × ${t}² = ½ × ${num(a)} × ${t * t} = ${num(0.5 * a * t * t)} m。`, `½ × ${num(a)} × ${t}² = ½ × ${num(a)} × ${t * t} = ${num(0.5 * a * t * t)} m.`)] };
    },
  },
  {
    id: 'g8-force', grades: [8, 9], subj: 'phys', sim: 'newton-cart',
    name: T('牛頓第二運動定律 F = ma', 'Newton’s second law F = ma'),
    cur: { tw: TW('力與運動', 'force and motion'), us: 'NGSS MS-PS2-2' },
    verify: (v) => (v.ask === 'F' ? v.m * v.a : v.ask === 'a' ? v.F / v.m : v.ask === 'm' ? v.F / v.a : (v.F1 - v.F2) / v.m),
    gen(r) {
      const ask = r.pick(['F', 'a', 'm', 'net']), m = r.pick([2, 4, 5, 8, 10, 20, 50, 1000, 1200]), a = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), F = m * a;
      const obj = m >= 1000 ? ['一輛汽車', 'a car'] : m >= 20 ? ['一台推車', 'a loaded cart'] : ['一個箱子', 'a box'];
      if (ask === 'F') return { q: T(`要讓質量 ${m} 公斤的${obj[0]}產生 ${num(a)} m/s² 的加速度，合力需要多少牛頓？`, `What net force, in newtons, gives ${obj[1]} of mass ${m} kg an acceleration of ${num(a)} m/s²?`), ans: ansQty(F, 1, U('牛頓', 'N')), vars: { m, a, ask },
        sol: [T('牛頓第二運動定律：F = ma。', 'Newton’s second law: F = ma.'), T(`F = ${m} kg × ${num(a)} m/s² = ${num(F)} N（牛頓）。`, `F = ${m} kg × ${num(a)} m/s² = ${num(F)} N.`)] };
      if (ask === 'a') return { q: T(`對質量 ${m} 公斤的${obj[0]}施加 ${num(F)} 牛頓的合力，加速度是多少 m/s²？`, `A net force of ${num(F)} N acts on ${obj[1]} of mass ${m} kg. What is the acceleration in m/s²?`), ans: ansQty(a, 2, 'm/s²'), vars: { F, m, ask },
        sol: [T('a = F ÷ m。', 'a = F ÷ m.'), T(`${num(F)} ÷ ${m} = ${num(a)} m/s²。`, `${num(F)} ÷ ${m} = ${num(a)} m/s².`)] };
      if (ask === 'm') return { q: T(`一個物體受 ${num(F)} 牛頓的合力，產生 ${num(a)} m/s² 的加速度。它的質量是多少公斤？`, `A net force of ${num(F)} N gives an object an acceleration of ${num(a)} m/s². What is its mass in kg?`), ans: ansQty(m, 1, U('公斤', 'kg')), vars: { F, a, ask },
        sol: [T('m = F ÷ a。', 'm = F ÷ a.'), T(`${num(F)} ÷ ${num(a)} = ${m} kg。`, `${num(F)} ÷ ${num(a)} = ${m} kg.`)] };
      const mm = r.pick([2, 4, 5, 10]), F2 = r.pick([5, 10, 15, 20]), aa = r.pick([1, 2, 3]), F1 = F2 + mm * aa;
      return { q: T(`${mm} 公斤的箱子在地上，有人用 ${F1} 牛頓的力向右推，摩擦力 ${F2} 牛頓向左。箱子的加速度是多少 m/s²？`, `A ${mm} kg box is pushed right with ${F1} N while friction pulls left with ${F2} N. What is its acceleration in m/s²?`), ans: ansQty(aa, 2, 'm/s²'), vars: { F1, F2, m: mm, ask },
        sol: [T('先求合力：方向相反的力要相減。', 'Find the net force first: forces in opposite directions subtract.'), T(`合力 = ${F1} − ${F2} = ${F1 - F2} N（向右）。`, `Net force = ${F1} − ${F2} = ${F1 - F2} N (to the right).`), T(`a = ${F1 - F2} ÷ ${mm} = ${aa} m/s²（向右）。`, `a = ${F1 - F2} ÷ ${mm} = ${aa} m/s² (to the right).`)] };
    },
  },
  {
    id: 'g8-buoyancy', grades: [8, 9], subj: 'phys', sim: 'density-buoyancy',
    name: T('浮力與阿基米德原理', 'Buoyancy and Archimedes’ principle'),
    cur: { tw: TW('浮力', 'buoyancy'), us: 'NGSS MS-PS2-2' },
    verify: (v) => (v.ask === 'B' ? v.W - v.Wl : v.ask === 'V' ? (v.W - v.Wl) / 1 : v.ask === 'rho' ? v.W / (v.W - v.Wl) : v.W - v.V * v.rl),
    gen(r) {
      const V = r.pick([20, 25, 40, 50, 80, 100, 125, 200]), rho = r.pick([2.5, 2.7, 4, 5, 7.9, 8, 8.9]), W = rnd(rho * V, 1), Wl = rnd(W - V, 1), ask = r.pick(['B', 'V', 'rho', 'liquid']);
      const pre = T(`一塊金屬掛在彈簧秤下，在空氣中讀數 ${num(W)} gw，完全浸入水中時讀數 ${num(Wl)} gw。`, `A metal block hangs from a spring scale. It reads ${num(W)} gw in air and ${num(Wl)} gw fully under water.`);
      if (ask === 'B') return { q: T(`${pre.zh}它在水中受到的浮力是多少 gw？`, `${pre.en} What buoyant force does the water exert, in gw?`), ans: ansQty(W - Wl, 1, 'gw'), vars: { W, Wl, ask },
        sol: [T('浮力 = 空氣中的重量 − 液體中的視重。', 'Buoyancy = weight in air − apparent weight in the liquid.'), T(`${num(W)} − ${num(Wl)} = ${num(V)} gw。`, `${num(W)} − ${num(Wl)} = ${num(V)} gw.`)] };
      if (ask === 'V') return { q: T(`${pre.zh}這塊金屬的體積是多少 cm³？（水的密度 1 g/cm³）`, `${pre.en} What is the block’s volume in cm³? (Water: 1 g/cm³)`), ans: ansQty(V, 1, 'cm³'), vars: { W, Wl, ask },
        sol: [T(`浮力 = ${num(W)} − ${num(Wl)} = ${num(V)} gw。`, `Buoyancy = ${num(W)} − ${num(Wl)} = ${num(V)} gw.`), T('阿基米德原理：浮力 = 排開液體的重量 = 液體密度 × 排開的體積。', 'Archimedes: buoyancy = weight of liquid pushed aside = liquid density × displaced volume.'), T(`完全浸入，排開的體積就是物體體積：${num(V)} ÷ 1 = ${num(V)} cm³。`, `Fully under, the displaced volume is the block’s volume: ${num(V)} ÷ 1 = ${num(V)} cm³.`)] };
      if (ask === 'rho') return { q: T(`${pre.zh}這塊金屬的密度是多少 g/cm³？（水的密度 1 g/cm³）`, `${pre.en} What is the block’s density in g/cm³? (Water: 1 g/cm³)`), ans: ansQty(rho, 2, 'g/cm³'), vars: { W, Wl, ask },
        sol: [T(`浮力 = ${num(W)} − ${num(Wl)} = ${num(V)} gw，所以體積 = ${num(V)} cm³。`, `Buoyancy = ${num(W)} − ${num(Wl)} = ${num(V)} gw, so the volume is ${num(V)} cm³.`), T(`質量 = ${num(W)} g，密度 = ${num(W)} ÷ ${num(V)} = ${num(rho)} g/cm³。`, `Mass = ${num(W)} g, so density = ${num(W)} ÷ ${num(V)} = ${num(rho)} g/cm³.`)] };
      const [lz, le, rl] = r.pick([['酒精', 'alcohol', 0.8], ['鹽水', 'salt water', 1.2], ['油', 'oil', 0.9]]);
      return { q: T(`一塊體積 ${V} cm³、在空氣中重 ${num(W)} gw 的金屬，完全浸入密度 ${rl} g/cm³ 的${lz}中，彈簧秤讀數是多少 gw？`, `A metal block of volume ${V} cm³ weighs ${num(W)} gw in air. Fully under ${le} (density ${rl} g/cm³), what does the spring scale read, in gw?`),
        ans: ansQty(W - V * rl, 1, 'gw'), vars: { W, V, rl, ask },
        sol: [T(`浮力 = 液體密度 × 排開體積 = ${rl} × ${V} = ${num(rnd(V * rl, 2))} gw。`, `Buoyancy = liquid density × displaced volume = ${rl} × ${V} = ${num(rnd(V * rl, 2))} gw.`), T(`讀數 = ${num(W)} − ${num(rnd(V * rl, 2))} = ${num(rnd(W - V * rl, 2))} gw。`, `Reading = ${num(W)} − ${num(rnd(V * rl, 2))} = ${num(rnd(W - V * rl, 2))} gw.`)] };
    },
  },
  {
    id: 'g8-pressure', grades: [8, 9], subj: 'phys',
    name: T('壓力', 'Pressure'),
    cur: { tw: TW('壓力', 'pressure'), us: 'NGSS MS-PS2-2' },
    verify: (v) => (v.ask === 'P' ? v.F / v.A : v.ask === 'F' ? v.P * v.A : v.ask === 'cm' ? v.F / (v.Acm / 10000) : v.h * 1000 * 9.8),
    gen(r) {
      const ask = r.pick(['P', 'F', 'cm', 'water']);
      if (ask === 'P') { const F = r.pick([100, 200, 300, 500, 600, 800, 1000, 1200]), A = r.pick([0.01, 0.02, 0.04, 0.05, 0.1, 0.2, 0.5]);
        return { q: T(`${F} 牛頓的力垂直作用在 ${num(A)} 平方公尺的面積上，壓力是多少帕（Pa）？`, `A force of ${F} N pushes straight down on an area of ${num(A)} m². What is the pressure in pascals (Pa)?`), ans: ansQty(F / A, 0, 'Pa'), vars: { F, A, ask },
          sol: [T('壓力 = 垂直力 ÷ 受力面積，P = F / A；1 Pa = 1 N/m²。', 'Pressure = perpendicular force ÷ area, P = F / A; 1 Pa = 1 N/m².'), T(`${F} ÷ ${num(A)} = ${num(F / A)} Pa。`, `${F} ÷ ${num(A)} = ${num(F / A)} Pa.`)] }; }
      if (ask === 'F') { const P = r.pick([1000, 2000, 5000, 10000, 20000]), A = r.pick([0.02, 0.05, 0.1, 0.25, 0.5]);
        return { q: T(`壓力 ${P} Pa 作用在 ${num(A)} m² 的面積上，總力是多少牛頓？`, `A pressure of ${P} Pa acts on ${num(A)} m². What is the total force in newtons?`), ans: ansQty(P * A, 1, U('牛頓', 'N')), vars: { P, A, ask },
          sol: [T('F = P × A。', 'F = P × A.'), T(`${P} × ${num(A)} = ${num(P * A)} N。`, `${P} × ${num(A)} = ${num(P * A)} N.`)] }; }
      if (ask === 'cm') { const [zh, en] = r.pick(NAMES), F = r.pick([400, 500, 600]), Acm = r.pick([200, 250, 400, 500]), one = r.chance(0.5);
        const Ause = one ? Acm / 2 : Acm;
        return { q: T(`${zh}重 ${F} 牛頓，兩隻鞋底和地面接觸的總面積是 ${Acm} 平方公分。${one ? '他用一隻腳站立時' : '他雙腳站立時'}，對地面的壓力是多少 Pa？`, `${en} weighs ${F} N. Both shoe soles together touch the ground over ${Acm} cm². Standing on ${one ? 'one foot' : 'both feet'}, what pressure does ${en} put on the ground, in Pa?`),
          ans: ansQty(F / (Ause / 10000), 0, 'Pa'), vars: { F, Acm: Ause, ask },
          sol: [T(`${one ? `一隻腳的面積 = ${Acm} ÷ 2 = ${Ause} cm²。` : `面積 = ${Acm} cm²。`}`, `${one ? `One foot: ${Acm} ÷ 2 = ${Ause} cm².` : `Area = ${Acm} cm².`}`), T(`換成平方公尺：${Ause} cm² = ${num(Ause / 10000)} m²（1 m² = 10000 cm²）。`, `In square meters: ${Ause} cm² = ${num(Ause / 10000)} m² (1 m² = 10 000 cm²).`), T(`P = ${F} ÷ ${num(Ause / 10000)} = ${num(F / (Ause / 10000))} Pa。`, `P = ${F} ÷ ${num(Ause / 10000)} = ${num(F / (Ause / 10000))} Pa.`)], hint: T('記得把 cm² 換成 m²。', 'Remember to convert cm² to m².') }; }
      const h = r.pick([2, 3, 5, 10, 20]);
      return { q: T(`水深 ${h} 公尺處，水本身造成的壓力是多少 Pa？（水的密度 1000 kg/m³，g = 9.8 m/s²）`, `How much pressure does the water itself cause ${h} m below the surface, in Pa? (Water 1000 kg/m³, g = 9.8 m/s²)`), ans: ansQty(1000 * 9.8 * h, 0, 'Pa'), vars: { h, ask },
        sol: [T('液體壓力 P = ρgh，只和深度、液體密度有關。', 'Liquid pressure P = ρgh depends only on depth and the liquid’s density.'), T(`1000 × 9.8 × ${h} = ${num(9800 * h)} Pa。`, `1000 × 9.8 × ${h} = ${num(9800 * h)} Pa.`)] };
    },
  },
  {
    id: 'g8-heat', grades: [8, 8], subj: 'phys', sim: 'heat-temperature',
    name: T('熱量與比熱', 'Heat and specific heat'),
    cur: { tw: TW('溫度與熱', 'temperature and heat'), us: 'NGSS MS-PS3-4' },
    verify: (v) => (v.ask === 'Q' ? v.m * v.c * v.dT : v.ask === 'mix' ? (v.m1 * v.T1 + v.m2 * v.T2) / (v.m1 + v.m2) : v.ask === 'c' ? v.Q / (v.m * v.dT) : v.Q / (v.m * v.c)),
    gen(r) {
      const ask = r.pick(['Q', 'mix', 'mix', 'c', 'dT']);
      if (ask === 'Q') { const m = r.pick([50, 100, 200, 250, 500]), dT = r.pick([5, 10, 20, 25, 40]);
        return { q: T(`把 ${m} 公克的水從 20 °C 加熱到 ${20 + dT} °C，需要多少卡的熱量？（水的比熱 1 cal/(g·°C)）`, `How many calories are needed to heat ${m} g of water from 20 °C to ${20 + dT} °C? (Water: 1 cal/(g·°C))`), ans: ansQty(m * dT, 0, U('卡', 'cal')), vars: { m, c: 1, dT, ask },
          sol: [T('熱量 H = m × s × ΔT（質量 × 比熱 × 溫度變化）。', 'Heat H = m × s × ΔT (mass × specific heat × temperature change).'), T(`ΔT = ${20 + dT} − 20 = ${dT} °C。`, `ΔT = ${20 + dT} − 20 = ${dT} °C.`), T(`H = ${m} × 1 × ${dT} = ${m * dT} 卡（約 ${num(rnd(m * dT * 4.18, 0))} 焦耳）。`, `H = ${m} × 1 × ${dT} = ${m * dT} cal (about ${num(rnd(m * dT * 4.18, 0))} J).`)] }; }
      if (ask === 'mix') { const m1 = r.pick([100, 200, 300]), m2 = r.pick([100, 200, 300, 400]), T1 = r.pick([60, 70, 80, 90]), T2 = r.pick([10, 15, 20, 25]), Tf = (m1 * T1 + m2 * T2) / (m1 + m2);
        return { q: T(`${m1} 公克 ${T1} °C 的熱水和 ${m2} 公克 ${T2} °C 的冷水混合，假設沒有熱量散失，最後溫度是多少 °C？（四捨五入到小數第一位）`, `${m1} g of water at ${T1} °C is mixed with ${m2} g at ${T2} °C. With no heat lost, what is the final temperature in °C? (Round to 1 decimal place.)`), ans: ansQty(Tf, 1, '°C'), vars: { m1, m2, T1, T2, ask },
          sol: [T('熱水放出的熱 = 冷水吸收的熱：m₁(T₁ − T) = m₂(T − T₂)。', 'Heat lost by hot water = heat gained by cold water: m₁(T₁ − T) = m₂(T − T₂).'), T(`T = (m₁T₁ + m₂T₂) ÷ (m₁ + m₂) = (${m1}×${T1} + ${m2}×${T2}) ÷ ${m1 + m2}。`, `T = (m₁T₁ + m₂T₂) ÷ (m₁ + m₂) = (${m1}×${T1} + ${m2}×${T2}) ÷ ${m1 + m2}.`), T(`= ${m1 * T1 + m2 * T2} ÷ ${m1 + m2} ≈ ${num(rnd(Tf, 1))} °C。`, `= ${m1 * T1 + m2 * T2} ÷ ${m1 + m2} ≈ ${num(rnd(Tf, 1))} °C.`)] }; }
      const [zh, en, c] = r.pick([['鋁', 'aluminum', 0.22], ['鐵', 'iron', 0.11], ['銅', 'copper', 0.09], ['沙拉油', 'cooking oil', 0.5]]), m = r.pick([100, 200, 500]), dT = r.pick([10, 20, 30, 50]), Q = rnd(m * c * dT, 2);
      if (ask === 'c') return { q: T(`${m} 公克的${zh}吸收 ${num(Q)} 卡的熱量後，溫度上升 ${dT} °C。${zh}的比熱是多少 cal/(g·°C)？`, `${m} g of ${en} absorbs ${num(Q)} cal and warms by ${dT} °C. What is its specific heat in cal/(g·°C)?`), ans: ansQty(c, 2, 'cal/(g·°C)'), vars: { Q, m, dT, ask },
        sol: [T('s = H ÷ (m × ΔT)。', 's = H ÷ (m × ΔT).'), T(`${num(Q)} ÷ (${m} × ${dT}) = ${num(c)} cal/(g·°C)。`, `${num(Q)} ÷ (${m} × ${dT}) = ${num(c)} cal/(g·°C).`), T(`比水的 1 小很多，所以${zh}很容易熱也很容易冷。`, `That is much less than water’s 1, so ${en} heats up and cools down easily.`)] };
      return { q: T(`${m} 公克的${zh}（比熱 ${c} cal/(g·°C)）吸收 ${num(Q)} 卡的熱量，溫度上升幾 °C？`, `${m} g of ${en} (specific heat ${c} cal/(g·°C)) absorbs ${num(Q)} cal. How many °C does it warm up?`), ans: ansQty(dT, 1, '°C'), vars: { Q, m, c, ask },
        sol: [T('ΔT = H ÷ (m × s)。', 'ΔT = H ÷ (m × s).'), T(`${num(Q)} ÷ (${m} × ${c}) = ${dT} °C。`, `${num(Q)} ÷ (${m} × ${c}) = ${dT} °C.`)] };
    },
  },
  {
    id: 'g8-acids-bases', grades: [8, 9], subj: 'chem', sim: 'ph-indicator',
    name: T('酸、鹼與 pH', 'Acids, bases and pH'),
    cur: { tw: TW('酸鹼鹽', 'acids, bases and salts'), us: 'NGSS MS-PS1-2' },
    bank: [
      { q: T('常溫下（25 °C），pH 值小於 7 的水溶液是…', 'At room temperature (25 °C), a solution with pH below 7 is…'), options: [T('酸性', 'acidic'), T('鹼性', 'basic'), T('中性', 'neutral')], why: [T('25 °C 時 pH < 7 為酸性、= 7 為中性、> 7 為鹼性。', 'At 25 °C, pH < 7 is acidic, 7 is neutral and > 7 is basic.')] },
      { q: T('pH = 2 的溶液和 pH = 4 的溶液比較，[H⁺] 是幾倍？', 'Compared with a pH 4 solution, a pH 2 solution has how many times the [H⁺]?'), options: [T('100 倍', '100 times'), T('2 倍', '2 times'), T('一半', 'half')], why: [T('pH 每小 1，[H⁺] 變成 10 倍；差 2 就是 10 × 10 = 100 倍。', 'Each step down in pH is 10 times more H⁺; two steps is 10 × 10 = 100 times.')] },
      { q: T('酚酞指示劑在下列哪一種溶液中會變成粉紅色？', 'In which solution does phenolphthalein turn pink?'), options: [T('氫氧化鈉溶液', 'Sodium hydroxide solution'), T('鹽酸', 'Hydrochloric acid'), T('純水', 'Pure water')], why: [T('酚酞在鹼性溶液中呈粉紅色，在酸性和中性中無色。', 'Phenolphthalein is pink in bases and colorless in acids and neutral solutions.')] },
      { q: T('鹽酸和氫氧化鈉恰好完全中和，生成什麼？', 'Hydrochloric acid exactly neutralizes sodium hydroxide. What forms?'), options: [T('氯化鈉（食鹽）和水', 'Sodium chloride (table salt) and water'), T('氫氣和氧氣', 'Hydrogen and oxygen'), T('二氧化碳', 'Carbon dioxide')], why: [T('HCl + NaOH → NaCl + H₂O，酸鹼中和生成鹽和水。', 'HCl + NaOH → NaCl + H₂O: an acid and a base make a salt and water.')] },
      { q: T('把鎂帶放進稀鹽酸，會產生什麼氣體？', 'Magnesium ribbon dropped into dilute hydrochloric acid gives off which gas?'), options: [T('氫氣', 'Hydrogen'), T('氧氣', 'Oxygen'), T('二氧化碳', 'Carbon dioxide')], why: [T('Mg + 2HCl → MgCl₂ + H₂，活性金屬和酸反應產生氫氣。', 'Mg + 2HCl → MgCl₂ + H₂: reactive metals and acids give hydrogen gas.')] },
      { q: T('稀釋濃硫酸時，正確的做法是…', 'The safe way to dilute concentrated sulfuric acid is to…'), options: [T('把酸慢慢倒入水中並攪拌', 'pour the acid slowly into water while stirring'), T('把水倒入濃硫酸中', 'pour water into the acid'), T('直接用手攪拌', 'stir it with your hand')], why: [T('濃硫酸溶於水會放出大量熱，水倒進酸裡會劇烈沸騰噴濺，所以要「酸入水」。', 'Mixing releases lots of heat; water poured into the acid can boil and spit, so always add acid to water.')] },
      { q: T('被蜜蜂（酸性的蟻酸類物質）叮到，可以塗哪一種東西減輕疼痛？', 'For an acidic insect sting, what might help neutralize it?'), options: [T('弱鹼性的小蘇打水或肥皂水', 'Weakly basic baking soda or soapy water'), T('醋', 'Vinegar'), T('檸檬汁', 'Lemon juice')], why: [T('用弱鹼中和酸性物質，可以減輕刺痛（但嚴重時要就醫）。', 'A weak base neutralizes the acid and can ease the sting (see a doctor if it is serious).')] },
      { q: T('溶液導電，是因為裡面有…', 'A solution conducts electricity because it contains…'), options: [T('可以移動的離子', 'ions that can move'), T('很多水分子', 'lots of water molecules'), T('糖分子', 'sugar molecules')], why: [T('電解質溶於水會解離成帶電的離子，離子移動形成電流。糖水沒有離子，不導電。', 'Electrolytes split into charged ions in water, and moving ions carry the current. Sugar water has no ions and does not conduct.')] },
      { q: T('下列哪一種是強鹼？', 'Which of these is a strong base?'), options: [T('氫氧化鈉 NaOH', 'Sodium hydroxide NaOH'), T('醋酸 CH₃COOH', 'Acetic acid CH₃COOH'), T('氯化鈉 NaCl', 'Sodium chloride NaCl')], why: [T('NaOH 在水中完全解離出 OH⁻，是強鹼；醋酸是弱酸；氯化鈉是鹽。', 'NaOH fully releases OH⁻ in water — a strong base. Acetic acid is a weak acid; NaCl is a salt.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g8-equations', grades: [8, 8], subj: 'chem', sim: 'balance-equations',
    name: T('化學反應式的係數', 'Balancing equations'),
    cur: { tw: TW('化學反應與質量守恆', 'chemical reactions and conservation of mass'), us: 'NGSS MS-PS1-5' },
    gen(r) {
      const EQ = [[['H2', 'O2'], ['H2O'], [2, 1, 2]], [['N2', 'H2'], ['NH3'], [1, 3, 2]], [['Na', 'Cl2'], ['NaCl'], [2, 1, 2]], [['Cu', 'O2'], ['CuO'], [2, 1, 2]], [['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2]], [['Mg', 'HCl'], ['MgCl2', 'H2'], [1, 2, 1, 1]],
        [['H2O2'], ['H2O', 'O2'], [2, 2, 1]], [['Fe', 'O2'], ['Fe2O3'], [4, 3, 2]], [['Al', 'O2'], ['Al2O3'], [4, 3, 2]], [['C2H5OH', 'O2'], ['CO2', 'H2O'], [1, 3, 2, 3]], [['C3H8', 'O2'], ['CO2', 'H2O'], [1, 5, 3, 4]], [['CaCO3', 'HCl'], ['CaCl2', 'H2O', 'CO2'], [1, 2, 1, 1, 1]]];
      const [L, R, a] = r.pick(EQ);
      const show = (co) => `${L.map((f, i) => `${co[i] === 1 ? '' : co[i]}${sub(f)}`).join(' + ')} → ${R.map((f, i) => `${co[L.length + i] === 1 ? '' : co[L.length + i]}${sub(f)}`).join(' + ')}`;
      if (r.chance(0.6)) {
        const wrong = new Set(); let g = 0;
        while (wrong.size < 3 && g++ < 200) { const w = a.map((x) => Math.max(1, x + r.pick([-1, 0, 0, 1]))); if (w.join() !== a.join() && !(a.every((x, i) => w[i] % x === 0 && w[i] / x === w[0] / a[0]))) wrong.add(w.join()); }
        return { q: T('下列哪一個化學反應式已經平衡了？', 'Which equation is balanced?'), ans: ansChoice([show(a), ...[...wrong].map((w) => show(w.split(',').map(Number)))]),
          sol: [T('平衡時，箭頭兩邊每一種原子的數目都要相等（原子不會憑空出現或消失）。', 'Balanced means each kind of atom has the same count on both sides — atoms are never created or destroyed.'), T(`正確答案：${show(a)}。可以逐一數每種原子驗算。`, `The balanced one is ${show(a)} — count each kind of atom to check.`)] };
      }
      const i = r.int(0, a.length - 1), f = [...L, ...R][i];
      const co = a.map((x, j) => (j === i ? '?' : x));
      return { q: T(`平衡反應式：${L.map((x, j) => `${co[j] === 1 ? '' : co[j]}${sub(x)}`).join(' + ')} → ${R.map((x, j) => `${co[L.length + j] === 1 ? '' : co[L.length + j]}${sub(x)}`).join(' + ')}。問號（${sub(f)} 前面）應該填多少？`, `Balance: ${L.map((x, j) => `${co[j] === 1 ? '' : co[j]}${sub(x)}`).join(' + ')} → ${R.map((x, j) => `${co[L.length + j] === 1 ? '' : co[L.length + j]}${sub(x)}`).join(' + ')}. What number goes in place of the “?” (in front of ${sub(f)})?`),
        ans: ansNum(a[i]),
        sol: [T('數一數箭頭兩邊每一種原子。', 'Count each kind of atom on both sides.'), T(`平衡後的反應式是 ${show(a)}，所以 ${sub(f)} 前面是 ${a[i]}。`, `The balanced equation is ${show(a)}, so the number in front of ${sub(f)} is ${a[i]}.`)] };
    },
  },
  {
    id: 'g9-ohm', grades: [9, 9], subj: 'phys',
    name: T('歐姆定律與電路', 'Ohm’s law and circuits'),
    cur: { tw: TW('電流、電壓與電阻', 'current, voltage and resistance'), us: 'NGSS MS-PS2-3' },
    verify: (v) => (v.ask === 'I' ? v.V / v.R : v.ask === 'V' ? v.I * v.R : v.ask === 'R' ? v.V / v.I : v.ask === 'ser' ? v.V / (v.R1 + v.R2) : v.V / v.R1 + v.V / v.R2),
    gen(r) {
      const ask = r.pick(['I', 'V', 'R', 'ser', 'par']);
      const R = r.pick([2, 3, 4, 5, 6, 10, 12, 15, 20, 30]), I = r.pick([0.1, 0.2, 0.25, 0.5, 1, 1.5, 2]), V = rnd(I * R, 3);
      if (ask === 'I') return { q: T(`${num(V)} 伏特的電壓加在 ${R} 歐姆的電阻兩端，通過的電流是多少安培？`, `${num(V)} V is applied across a ${R} Ω resistor. What current flows, in amperes?`), ans: ansQty(I, 3, U('安培', 'A')), vars: { V, R, ask },
        sol: [T('歐姆定律：V = IR，所以 I = V ÷ R。', 'Ohm’s law: V = IR, so I = V ÷ R.'), T(`${num(V)} ÷ ${R} = ${num(I)} A。`, `${num(V)} ÷ ${R} = ${num(I)} A.`)] };
      if (ask === 'V') return { q: T(`${num(I)} 安培的電流通過 ${R} 歐姆的電阻，電阻兩端的電壓是多少伏特？`, `A current of ${num(I)} A flows through a ${R} Ω resistor. What is the voltage across it, in volts?`), ans: ansQty(V, 3, U('伏特', 'V')), vars: { I, R, ask },
        sol: [T('V = I × R。', 'V = I × R.'), T(`${num(I)} × ${R} = ${num(V)} V。`, `${num(I)} × ${R} = ${num(V)} V.`)] };
      if (ask === 'R') return { q: T(`一個電器接上 ${num(V)} 伏特的電壓時，電流是 ${num(I)} 安培。它的電阻是多少歐姆？`, `A device draws ${num(I)} A at ${num(V)} V. What is its resistance in ohms?`), ans: ansQty(R, 2, U('歐姆', 'Ω')), vars: { V, I, ask },
        sol: [T('R = V ÷ I。', 'R = V ÷ I.'), T(`${num(V)} ÷ ${num(I)} = ${R} Ω。`, `${num(V)} ÷ ${num(I)} = ${R} Ω.`)] };
      const R1 = r.pick([2, 3, 4, 6, 10]), R2 = r.pick([2, 3, 4, 6, 12]), Vb = r.pick([3, 6, 9, 12]);
      if (ask === 'ser') return { q: T(`${R1} Ω 和 ${R2} Ω 的電阻串聯，接在 ${Vb} V 的電池上。電路中的電流是多少安培？（四捨五入到小數第二位）`, `Resistors of ${R1} Ω and ${R2} Ω in series are connected to a ${Vb} V battery. What current flows, in amperes? (Round to 2 decimal places.)`), ans: ansQty(Vb / (R1 + R2), 2, U('安培', 'A')), vars: { V: Vb, R1, R2, ask },
        sol: [T('串聯的總電阻 = R₁ + R₂。', 'In series, total resistance = R₁ + R₂.'), T(`${R1} + ${R2} = ${R1 + R2} Ω。`, `${R1} + ${R2} = ${R1 + R2} Ω.`), T(`I = ${Vb} ÷ ${R1 + R2} ≈ ${num(rnd(Vb / (R1 + R2), 2))} A。`, `I = ${Vb} ÷ ${R1 + R2} ≈ ${num(rnd(Vb / (R1 + R2), 2))} A.`)] };
      return { q: T(`${R1} Ω 和 ${R2} Ω 的電阻並聯，接在 ${Vb} V 的電池上。電池流出的總電流是多少安培？（四捨五入到小數第二位）`, `Resistors of ${R1} Ω and ${R2} Ω in parallel are connected to a ${Vb} V battery. What total current leaves the battery, in amperes? (Round to 2 decimal places.)`), ans: ansQty(Vb / R1 + Vb / R2, 2, U('安培', 'A')), vars: { V: Vb, R1, R2, ask },
        sol: [T('並聯時每個電阻兩端的電壓都等於電池電壓。', 'In parallel, each resistor has the full battery voltage across it.'), T(`I₁ = ${Vb} ÷ ${R1} = ${num(rnd(Vb / R1, 3))} A，I₂ = ${Vb} ÷ ${R2} = ${num(rnd(Vb / R2, 3))} A。`, `I₁ = ${Vb} ÷ ${R1} = ${num(rnd(Vb / R1, 3))} A, I₂ = ${Vb} ÷ ${R2} = ${num(rnd(Vb / R2, 3))} A.`), T(`總電流 = I₁ + I₂ ≈ ${num(rnd(Vb / R1 + Vb / R2, 2))} A。`, `Total = I₁ + I₂ ≈ ${num(rnd(Vb / R1 + Vb / R2, 2))} A.`)] };
    },
  },
  {
    id: 'g9-work-power', grades: [9, 9], subj: 'phys',
    name: T('功與功率', 'Work and power'),
    cur: { tw: TW('功與能', 'work and energy'), us: 'NGSS MS-PS3-1' },
    verify: (v) => (v.ask === 'W' ? v.F * v.d : v.ask === 'P' ? (v.F * v.d) / v.t : v.ask === 'lift' ? v.m * 9.8 * v.h : 0.5 * v.m * v.v * v.v),
    gen(r) {
      const ask = r.pick(['W', 'P', 'lift', 'KE']);
      if (ask === 'W') { const F = r.pick([10, 20, 25, 50, 100, 150]), d = r.pick([2, 3, 4, 5, 10, 20]);
        return { q: T(`用 ${F} 牛頓的水平力推箱子，沿著力的方向移動 ${d} 公尺。推力做了多少焦耳的功？`, `A ${F} N horizontal push moves a box ${d} m in the direction of the push. How much work is done, in joules?`), ans: ansQty(F * d, 1, U('焦耳', 'J')), vars: { F, d, ask },
          sol: [T('功 W = 力 × 沿力方向的位移。', 'Work W = force × distance moved along the force.'), T(`${F} × ${d} = ${F * d} J（焦耳）。`, `${F} × ${d} = ${F * d} J.`)] }; }
      if (ask === 'P') { const F = r.pick([50, 100, 200, 300]), d = r.pick([2, 4, 5, 10]), t = r.pick([2, 4, 5, 10, 20]);
        return { q: T(`一台機器用 ${F} 牛頓的力，在 ${t} 秒內把物體沿力的方向移動 ${d} 公尺。機器的平均功率是多少瓦特？`, `A machine pushes with ${F} N and moves an object ${d} m along the force in ${t} s. What is its average power in watts?`), ans: ansQty((F * d) / t, 1, U('瓦特', 'W')), vars: { F, d, t, ask },
          sol: [T(`功 = ${F} × ${d} = ${F * d} J。`, `Work = ${F} × ${d} = ${F * d} J.`), T(`功率 P = W ÷ t = ${F * d} ÷ ${t} = ${num((F * d) / t)} W。`, `Power P = W ÷ t = ${F * d} ÷ ${t} = ${num((F * d) / t)} W.`)] }; }
      if (ask === 'lift') { const m = r.pick([2, 5, 10, 20, 50]), h = r.pick([1, 1.5, 2, 3, 5]);
        return { q: T(`把 ${m} 公斤的物體等速度舉高 ${num(h)} 公尺，至少要做多少焦耳的功？（g = 9.8 m/s²）`, `How much work, in joules, does it take to lift a ${m} kg object ${num(h)} m at a steady speed? (g = 9.8 m/s²)`), ans: ansQty(m * 9.8 * h, 1, U('焦耳', 'J')), vars: { m, h, ask },
          sol: [T(`等速舉起時，施力 = 重量 = mg = ${m} × 9.8 = ${num(m * 9.8)} N。`, `Lifting at a steady speed takes a force equal to the weight: mg = ${m} × 9.8 = ${num(m * 9.8)} N.`), T(`W = ${num(m * 9.8)} × ${num(h)} = ${num(rnd(m * 9.8 * h, 2))} J，物體增加的位能也是這麼多。`, `W = ${num(m * 9.8)} × ${num(h)} = ${num(rnd(m * 9.8 * h, 2))} J — the gain in potential energy.`)] }; }
      const m = r.pick([1, 2, 4, 5, 10, 50]), v = r.pick([2, 3, 4, 5, 10]);
      return { q: T(`質量 ${m} 公斤的物體以 ${v} m/s 運動，它的動能是多少焦耳？`, `An object of mass ${m} kg moves at ${v} m/s. What is its kinetic energy in joules?`), ans: ansQty(0.5 * m * v * v, 1, U('焦耳', 'J')), vars: { m, v, ask },
        sol: [T('動能 E<sub>k</sub> = ½mv²。', 'Kinetic energy E<sub>k</sub> = ½mv².'), T(`½ × ${m} × ${v}² = ½ × ${m} × ${v * v} = ${num(0.5 * m * v * v)} J。`, `½ × ${m} × ${v}² = ½ × ${m} × ${v * v} = ${num(0.5 * m * v * v)} J.`)] };
    },
  },
  {
    id: 'g8-moles', grades: [8, 9], subj: 'chem',
    name: T('原子量、分子量與莫耳', 'Atomic mass, molecular mass and the mole'),
    cur: { tw: TW('原子量與莫耳', 'atomic mass and the mole'), us: 'NGSS MS-PS1-1' },
    verify: (v) => (v.ask === 'M' ? v.M : v.ask === 'n' ? v.m / v.M : v.ask === 'm' ? v.n * v.M : v.n * 6),
    gen(r) {
      const MOL = [['H2O', '水', 'water', 18, '2×1 + 16'], ['CO2', '二氧化碳', 'carbon dioxide', 44, '12 + 2×16'], ['O2', '氧氣', 'oxygen', 32, '2×16'], ['CH4', '甲烷', 'methane', 16, '12 + 4×1'], ['NH3', '氨', 'ammonia', 17, '14 + 3×1'], ['NaCl', '氯化鈉', 'sodium chloride', 58.5, '23 + 35.5'], ['CaCO3', '碳酸鈣', 'calcium carbonate', 100, '40 + 12 + 3×16'], ['C6H12O6', '葡萄糖', 'glucose', 180, '6×12 + 12×1 + 6×16'], ['H2', '氫氣', 'hydrogen', 2, '2×1']];
      const [f, zh, en, M, how] = r.pick(MOL), ask = r.pick(['M', 'n', 'm', 'N']), AM = 'H = 1, C = 12, N = 14, O = 16, Na = 23, Cl = 35.5, Ca = 40';
      if (ask === 'M') return { q: T(`${zh}（${sub(f)}）的分子量是多少？（原子量：${AM}）`, `What is the molecular (formula) mass of ${en}, ${sub(f)}? (Atomic masses: ${AM})`), ans: ansQty(M, 1), vars: { M, ask },
        sol: [T('分子量 = 化學式中所有原子的原子量加起來。', 'Molecular mass = add up the atomic masses of all atoms in the formula.'), T(`${sub(f)}：${how} = ${M}。`, `${sub(f)}: ${how} = ${M}.`)] };
      const n = r.pick([0.5, 1, 2, 3, 4, 5, 0.25, 0.1]), m = rnd(n * M, 3);
      if (ask === 'n') return { q: T(`${num(m)} 公克的${zh}（${sub(f)}，分子量 ${M}）是多少莫耳？`, `How many moles is ${num(m)} g of ${en} (${sub(f)}, molar mass ${M} g/mol)?`), ans: ansQty(n, 2, U('莫耳', 'mol')), vars: { m, M, ask },
        sol: [T('莫耳數 = 質量 ÷ 分子量（莫耳質量）。', 'Moles = mass ÷ molar mass.'), T(`${num(m)} ÷ ${M} = ${num(n)} mol。`, `${num(m)} ÷ ${M} = ${num(n)} mol.`)] };
      if (ask === 'm') return { q: T(`${num(n)} 莫耳的${zh}（${sub(f)}，分子量 ${M}）是多少公克？`, `What is the mass, in grams, of ${num(n)} mol of ${en} (${sub(f)}, molar mass ${M} g/mol)?`), ans: ansQty(m, 2, U('公克', 'g')), vars: { n, M, ask },
        sol: [T('質量 = 莫耳數 × 分子量。', 'Mass = moles × molar mass.'), T(`${num(n)} × ${M} = ${num(m)} g。`, `${num(n)} × ${M} = ${num(m)} g.`)] };
      return { q: T(`${num(n)} 莫耳的${zh}含有多少個分子？（1 莫耳 = 6 × 10²³ 個；答案寫成 a × 10^23 中的 a，例如 12）`, `How many molecules are in ${num(n)} mol of ${en}? (1 mol = 6 × 10²³. Give a in a × 10^23, e.g. 12.)`), ans: ansQty(n * 6, 2), vars: { n, ask },
        sol: [T('分子數 = 莫耳數 × 6 × 10²³。', 'Number of molecules = moles × 6 × 10²³.'), T(`${num(n)} × 6 × 10²³ = ${num(rnd(n * 6, 3))} × 10²³ 個。`, `${num(n)} × 6 × 10²³ = ${num(rnd(n * 6, 3))} × 10²³ molecules.`)] };
    },
  },
];

// Practice units for grades 10–12, physics (高中 物理). Format: see SPEC.md.
import { T, ansQty, ansChoice, pickItem, num, rnd, sci } from '../util.js';

const TW = (zh, en) => T(`高中 物理 ${zh}`, `Senior high physics · ${en}`);
const U = (zh, en) => T(zh, en);
const D2R = Math.PI / 180;
const g = 9.8;

export default [
  {
    id: 'g10-kinematics', grades: [10, 10], subj: 'phys', sim: 'motion-graphs',
    name: T('等加速度運動', 'Motion with constant acceleration'),
    cur: { tw: TW('直線運動', 'motion in a line'), us: 'NGSS HS-PS2-1' },
    verify: (v) => (v.ask === 'v' ? v.v0 + v.a * v.t : v.ask === 'x' ? v.v0 * v.t + 0.5 * v.a * v.t * v.t : v.ask === 'stop' ? (v.v0 * v.v0) / (2 * v.a) : Math.sqrt(2 * v.h / g)),
    gen(r) {
      const ask = r.pick(['v', 'x', 'stop', 'drop']);
      if (ask === 'v' || ask === 'x') { const v0 = r.pick([0, 2, 4, 5, 10, 15]), a = r.pick([0.5, 1.2, 2, 2.5, 3, 4]), t = r.pick([2, 3, 4, 5, 6, 8]);
        if (ask === 'v') return { q: T(`物體初速 ${v0} m/s，以 ${num(a)} m/s² 等加速度運動 ${t} s 後，速度是多少 m/s？`, `An object starts at ${v0} m/s and accelerates uniformly at ${num(a)} m/s² for ${t} s. What is its speed then, in m/s?`), ans: ansQty(v0 + a * t, 2, 'm/s'), vars: { v0, a, t, ask },
          sol: [T('v = v₀ + at。', 'v = v₀ + at.'), T(`v = ${v0} + ${num(a)} × ${t} = ${num(v0 + a * t)} m/s。`, `v = ${v0} + ${num(a)} × ${t} = ${num(v0 + a * t)} m/s.`)] };
        const x = v0 * t + 0.5 * a * t * t;
        return { q: T(`物體初速 ${v0} m/s，以 ${num(a)} m/s² 等加速度運動，${t} s 內的位移是多少公尺？`, `An object starts at ${v0} m/s with constant acceleration ${num(a)} m/s². How far does it travel in ${t} s, in meters?`), ans: ansQty(x, 2, 'm'), vars: { v0, a, t, ask },
          sol: [T('x = v₀t + ½at²。', 'x = v₀t + ½at².'), T(`x = ${v0}×${t} + ½×${num(a)}×${t}² = ${num(v0 * t)} + ${num(0.5 * a * t * t)} = ${num(x)} m。`, `x = ${v0}×${t} + ½×${num(a)}×${t}² = ${num(v0 * t)} + ${num(0.5 * a * t * t)} = ${num(x)} m.`)] }; }
      if (ask === 'stop') { const v0 = r.pick([10, 15, 20, 25, 30]), a = r.pick([2, 4, 5, 6, 8]);
        return { q: T(`汽車以 ${v0} m/s 行駛，煞車後以 ${a} m/s² 等減速度停下。煞車距離是多少公尺？（四捨五入到小數第一位）`, `A car moving at ${v0} m/s brakes with a constant deceleration of ${a} m/s². What is the braking distance in meters? (Round to 1 decimal place.)`), ans: ansQty((v0 * v0) / (2 * a), 1, 'm'), vars: { v0, a, ask },
          sol: [T('不知道時間時，用 v² = v₀² + 2ax，停下時 v = 0、a 為負值。', 'With no time given, use v² = v₀² + 2ax; at the stop v = 0 and a is negative.'), T(`0 = ${v0}² − 2×${a}×x → x = ${v0 * v0} ÷ ${2 * a} = ${num(rnd((v0 * v0) / (2 * a), 2))} m。`, `0 = ${v0}² − 2×${a}×x → x = ${v0 * v0} ÷ ${2 * a} = ${num(rnd((v0 * v0) / (2 * a), 2))} m.`), T('注意：速度變 2 倍，煞車距離變 4 倍！', 'Note: double the speed and the braking distance quadruples!')] }; }
      const h = r.pick([5, 10, 20, 45, 80, 4.9, 19.6]);
      return { q: T(`一顆石頭從 ${num(h)} 公尺高處由靜止自由落下（忽略空氣阻力，g = 9.8 m/s²），落地需要幾秒？（四捨五入到小數第二位）`, `A stone is dropped from rest from ${num(h)} m (no air resistance, g = 9.8 m/s²). How long does it take to land, in seconds? (Round to 2 decimal places.)`), ans: ansQty(Math.sqrt((2 * h) / g), 2, 's'), vars: { h, ask },
        sol: [T('自由落體：h = ½gt²，所以 t = √(2h/g)。', 'Free fall: h = ½gt², so t = √(2h/g).'), T(`t = √(2 × ${num(h)} ÷ 9.8) = √${num(rnd((2 * h) / g, 4))} ≈ ${num(rnd(Math.sqrt((2 * h) / g), 2))} s。`, `t = √(2 × ${num(h)} ÷ 9.8) = √${num(rnd((2 * h) / g, 4))} ≈ ${num(rnd(Math.sqrt((2 * h) / g), 2))} s.`)] };
    },
  },
  {
    id: 'g10-projectile', grades: [10, 11], subj: 'phys', sim: 'projectile',
    name: T('拋體運動', 'Projectiles'),
    cur: { tw: TW('平面運動', 'motion in a plane'), us: 'NGSS HS-PS2-1' },
    verify: (v) => (v.ask === 'R' ? (v.v * v.v * Math.sin(2 * v.th * D2R)) / g : v.ask === 'H' ? (v.v * Math.sin(v.th * D2R)) ** 2 / (2 * g) : v.ask === 'T' ? (2 * v.v * Math.sin(v.th * D2R)) / g : v.u * Math.sqrt((2 * v.h) / g)),
    gen(r) {
      const ask = r.pick(['R', 'H', 'T', 'horiz']);
      if (ask === 'horiz') { const u = r.pick([2, 3, 5, 8, 10, 15]), h = r.pick([4.9, 19.6, 44.1, 78.4, 10, 20]);
        const t = Math.sqrt((2 * h) / g);
        return { q: T(`一顆球從 ${num(h)} 公尺高的平台以 ${u} m/s 水平拋出（g = 9.8 m/s²），落地點離平台的水平距離是多少公尺？（四捨五入到小數第二位）`, `A ball is thrown horizontally at ${u} m/s from a ${num(h)} m high ledge (g = 9.8 m/s²). How far from the ledge does it land, in meters? (Round to 2 decimal places.)`),
          ans: ansQty(u * t, 2, 'm'), vars: { u, h, ask },
          sol: [T('水平拋射：水平方向等速、鉛直方向自由落體，兩者時間相同。', 'Horizontal launch: constant horizontal speed, free fall vertically, same time for both.'), T(`落地時間 t = √(2h/g) = √(2×${num(h)}÷9.8) ≈ ${num(rnd(t, 3))} s。`, `Fall time t = √(2h/g) = √(2×${num(h)}÷9.8) ≈ ${num(rnd(t, 3))} s.`), T(`水平距離 = ${u} × ${num(rnd(t, 3))} ≈ ${num(rnd(u * t, 2))} m。`, `Horizontal distance = ${u} × ${num(rnd(t, 3))} ≈ ${num(rnd(u * t, 2))} m.`)] }; }
      const v = r.pick([10, 14, 20, 25, 30]), th = r.pick([30, 37, 45, 53, 60]), vy = v * Math.sin(th * D2R), vx = v * Math.cos(th * D2R);
      const pre = T(`在水平地面上以 ${v} m/s、仰角 ${th}° 斜向拋出一顆球（忽略空氣阻力，g = 9.8 m/s²）。`, `A ball is launched from level ground at ${v} m/s at ${th}° above horizontal (no air resistance, g = 9.8 m/s²).`);
      const comp = T(`分量：vₓ = ${v}cos${th}° ≈ ${num(rnd(vx, 3))} m/s，v<sub>y</sub> = ${v}sin${th}° ≈ ${num(rnd(vy, 3))} m/s。`, `Components: vₓ = ${v}cos${th}° ≈ ${num(rnd(vx, 3))} m/s, v<sub>y</sub> = ${v}sin${th}° ≈ ${num(rnd(vy, 3))} m/s.`);
      if (ask === 'R') return { q: T(`${pre.zh}水平射程是多少公尺？（四捨五入到小數第一位）`, `${pre.en} What is its range in meters? (Round to 1 decimal place.)`), ans: ansQty((v * v * Math.sin(2 * th * D2R)) / g, 1, 'm'), vars: { v, th, ask },
        sol: [comp, T(`飛行時間 T = 2v<sub>y</sub>/g ≈ ${num(rnd((2 * vy) / g, 3))} s。`, `Flight time T = 2v<sub>y</sub>/g ≈ ${num(rnd((2 * vy) / g, 3))} s.`), T(`射程 R = vₓ T = v²sin2θ/g = ${v}² × sin${2 * th}° ÷ 9.8 ≈ ${num(rnd((v * v * Math.sin(2 * th * D2R)) / g, 2))} m。`, `Range R = vₓT = v²sin2θ/g = ${v}² × sin${2 * th}° ÷ 9.8 ≈ ${num(rnd((v * v * Math.sin(2 * th * D2R)) / g, 2))} m.`)] };
      if (ask === 'H') return { q: T(`${pre.zh}最大高度是多少公尺？（四捨五入到小數第一位）`, `${pre.en} What is its maximum height in meters? (Round to 1 decimal place.)`), ans: ansQty((vy * vy) / (2 * g), 1, 'm'), vars: { v, th, ask },
        sol: [comp, T('最高點時 v<sub>y</sub> = 0：H = v<sub>y</sub>² / 2g。', 'At the top v<sub>y</sub> = 0, so H = v<sub>y</sub>² / 2g.'), T(`H = ${num(rnd(vy, 3))}² ÷ 19.6 ≈ ${num(rnd((vy * vy) / (2 * g), 2))} m。`, `H = ${num(rnd(vy, 3))}² ÷ 19.6 ≈ ${num(rnd((vy * vy) / (2 * g), 2))} m.`)] };
      return { q: T(`${pre.zh}球在空中飛行多久？（四捨五入到小數第二位）`, `${pre.en} How long is it in the air, in seconds? (Round to 2 decimal places.)`), ans: ansQty((2 * vy) / g, 2, 's'), vars: { v, th, ask },
        sol: [comp, T('上升時間 = v<sub>y</sub>/g，上升和下降時間相同，全程 T = 2v<sub>y</sub>/g。', 'Time up = v<sub>y</sub>/g; up and down take equal time, so T = 2v<sub>y</sub>/g.'), T(`T = 2 × ${num(rnd(vy, 3))} ÷ 9.8 ≈ ${num(rnd((2 * vy) / g, 2))} s。`, `T = 2 × ${num(rnd(vy, 3))} ÷ 9.8 ≈ ${num(rnd((2 * vy) / g, 2))} s.`)] };
    },
  },
  {
    id: 'g10-newton', grades: [10, 10], subj: 'phys', sim: 'newton-cart',
    name: T('牛頓定律：摩擦與斜面', 'Newton’s laws: friction and inclines'),
    cur: { tw: TW('牛頓運動定律', 'Newton’s laws'), us: 'NGSS HS-PS2-1' },
    verify: (v) => (v.ask === 'fric' ? (v.F - v.mu * v.m * g) / v.m : v.ask === 'incline' ? g * Math.sin(v.th * D2R) : v.ask === 'inclineMu' ? g * (Math.sin(v.th * D2R) - v.mu * Math.cos(v.th * D2R)) : v.F / (v.m1 + v.m2)),
    gen(r) {
      const ask = r.pick(['fric', 'incline', 'inclineMu', 'two']);
      if (ask === 'fric') { const m = r.pick([2, 4, 5, 10]), mu = r.pick([0.1, 0.2, 0.25, 0.3]), F = rnd(mu * m * g + m * r.pick([0.5, 1, 1.5, 2, 3]), 1);
        return { q: T(`質量 ${m} kg 的木箱放在水平地面上，動摩擦係數 ${mu}。用 ${num(F)} N 的水平力拉動它，加速度是多少 m/s²？（g = 9.8 m/s²，四捨五入到小數第二位）`, `A ${m} kg crate on level ground has a kinetic friction coefficient of ${mu}. It is pulled with a horizontal force of ${num(F)} N. What is its acceleration in m/s²? (g = 9.8 m/s², round to 2 decimal places.)`),
          ans: ansQty((F - mu * m * g) / m, 2, 'm/s²'), vars: { m, mu, F, ask },
          sol: [T(`正向力 N = mg = ${m} × 9.8 = ${num(m * g)} N；摩擦力 f = μN = ${mu} × ${num(m * g)} = ${num(rnd(mu * m * g, 3))} N。`, `Normal force N = mg = ${m} × 9.8 = ${num(m * g)} N; friction f = μN = ${mu} × ${num(m * g)} = ${num(rnd(mu * m * g, 3))} N.`), T(`合力 = ${num(F)} − ${num(rnd(mu * m * g, 3))} = ${num(rnd(F - mu * m * g, 3))} N。`, `Net force = ${num(F)} − ${num(rnd(mu * m * g, 3))} = ${num(rnd(F - mu * m * g, 3))} N.`), T(`a = F<sub>合</sub>/m ≈ ${num(rnd((F - mu * m * g) / m, 2))} m/s²。`, `a = F<sub>net</sub>/m ≈ ${num(rnd((F - mu * m * g) / m, 2))} m/s².`)] }; }
      if (ask === 'incline' || ask === 'inclineMu') { const th = r.pick([20, 30, 37, 45]), mu = ask === 'incline' ? 0 : r.pick([0.1, 0.2, 0.3]);
        const a = g * (Math.sin(th * D2R) - mu * Math.cos(th * D2R));
        return { q: T(`木塊在傾角 ${th}° 的斜面上由靜止滑下${mu ? `，動摩擦係數 ${mu}` : '，斜面光滑無摩擦'}。沿斜面的加速度是多少 m/s²？（g = 9.8 m/s²，四捨五入到小數第二位）`, `A block slides from rest down a ${th}° incline${mu ? ` with kinetic friction coefficient ${mu}` : ' with no friction'}. What is its acceleration along the incline in m/s²? (g = 9.8 m/s², round to 2 decimal places.)`),
          ans: ansQty(a, 2, 'm/s²'), vars: { th, mu, ask },
          sol: [T('把重力分解：沿斜面分量 mg sinθ，垂直斜面分量 mg cosθ（等於正向力）。', 'Split gravity: mg sinθ along the slope and mg cosθ into the slope (equal to the normal force).'), mu ? T(`摩擦力 = μmg cosθ，所以 a = g(sinθ − μcosθ) = 9.8 × (sin${th}° − ${mu}cos${th}°)。`, `Friction = μmg cosθ, so a = g(sinθ − μcosθ) = 9.8 × (sin${th}° − ${mu}cos${th}°).`) : T(`沒有摩擦：a = g sinθ = 9.8 × sin${th}°。`, `No friction: a = g sinθ = 9.8 × sin${th}°.`), T(`a ≈ ${num(rnd(a, 2))} m/s²（和質量無關）。`, `a ≈ ${num(rnd(a, 2))} m/s² (independent of the mass).`)] }; }
      const m1 = r.pick([1, 2, 3, 4]), m2 = r.pick([2, 3, 5, 6]), F = r.pick([12, 18, 20, 24, 30]);
      return { q: T(`光滑水平面上，質量 ${m1} kg 和 ${m2} kg 的兩木塊靠在一起，用 ${F} N 的水平力推 ${m1} kg 的木塊。兩木塊的加速度是多少 m/s²？（四捨五入到小數第二位）`, `On a frictionless floor, blocks of ${m1} kg and ${m2} kg sit side by side. A ${F} N horizontal push acts on the ${m1} kg block. What is their acceleration in m/s²? (Round to 2 decimal places.)`),
        ans: ansQty(F / (m1 + m2), 2, 'm/s²'), vars: { F, m1, m2, ask },
        sol: [T('兩木塊一起運動，可以把它們當成一個系統，總質量 m₁ + m₂。', 'They move together, so treat them as one system of mass m₁ + m₂.'), T(`a = F ÷ (m₁ + m₂) = ${F} ÷ ${m1 + m2} ≈ ${num(rnd(F / (m1 + m2), 3))} m/s²。`, `a = F ÷ (m₁ + m₂) = ${F} ÷ ${m1 + m2} ≈ ${num(rnd(F / (m1 + m2), 3))} m/s².`), T(`（兩木塊之間的作用力 = m₂a ≈ ${num(rnd((m2 * F) / (m1 + m2), 2))} N，這是牛頓第三定律的一對作用力與反作用力。）`, `(The force between the blocks is m₂a ≈ ${num(rnd((m2 * F) / (m1 + m2), 2))} N — an action–reaction pair, Newton’s third law.)`)] };
    },
  },
  {
    id: 'g10-energy', grades: [10, 11], subj: 'phys',
    name: T('功與能量守恆', 'Work and conservation of energy'),
    cur: { tw: TW('能量', 'energy'), us: 'NGSS HS-PS3-1' },
    verify: (v) => (v.ask === 'drop' ? Math.sqrt(2 * g * v.h) : v.ask === 'up' ? (v.v * v.v) / (2 * g) : v.ask === 'spring' ? 0.5 * v.k * v.x * v.x : v.ask === 'slide' ? Math.sqrt(2 * g * v.h - (2 * v.W) / v.m) : v.P),
    gen(r) {
      const ask = r.pick(['drop', 'up', 'spring', 'slide', 'power']);
      if (ask === 'drop') { const h = r.pick([1.25, 5, 10, 20, 45, 80]);
        return { q: T(`物體從 ${num(h)} m 高處由靜止落下，忽略空氣阻力，落地前瞬間的速率是多少 m/s？（g = 9.8 m/s²，四捨五入到小數第二位）`, `An object falls from rest from ${num(h)} m with no air resistance. How fast is it moving just before it lands, in m/s? (g = 9.8 m/s², round to 2 decimal places.)`), ans: ansQty(Math.sqrt(2 * g * h), 2, 'm/s'), vars: { h, ask },
          sol: [T('力學能守恆：位能 mgh 全部變成動能 ½mv²（質量可以消去）。', 'Mechanical energy is conserved: mgh becomes ½mv² (the mass cancels).'), T(`v = √(2gh) = √(2 × 9.8 × ${num(h)}) ≈ ${num(rnd(Math.sqrt(2 * g * h), 2))} m/s。`, `v = √(2gh) = √(2 × 9.8 × ${num(h)}) ≈ ${num(rnd(Math.sqrt(2 * g * h), 2))} m/s.`)] }; }
      if (ask === 'up') { const v = r.pick([5, 7, 10, 14, 20]);
        return { q: T(`以 ${v} m/s 的速度把球鉛直上拋，忽略空氣阻力，球最高可以上升幾公尺？（g = 9.8 m/s²，四捨五入到小數第二位）`, `A ball is thrown straight up at ${v} m/s with no air resistance. How high does it rise, in meters? (g = 9.8 m/s², round to 2 decimal places.)`), ans: ansQty((v * v) / (2 * g), 2, 'm'), vars: { v, ask },
          sol: [T('½mv² = mgh → h = v²/2g。', '½mv² = mgh → h = v²/2g.'), T(`h = ${v}² ÷ 19.6 ≈ ${num(rnd((v * v) / (2 * g), 2))} m。`, `h = ${v}² ÷ 19.6 ≈ ${num(rnd((v * v) / (2 * g), 2))} m.`)] }; }
      if (ask === 'spring') { const k = r.pick([100, 200, 400, 500, 800]), x = r.pick([0.05, 0.1, 0.2, 0.25]);
        return { q: T(`彈力常數 ${k} N/m 的彈簧被壓縮 ${num(x)} m，儲存的彈性位能是多少焦耳？`, `A spring with constant ${k} N/m is compressed ${num(x)} m. How much elastic potential energy does it store, in joules?`), ans: ansQty(0.5 * k * x * x, 3, 'J'), vars: { k, x, ask },
          sol: [T('彈性位能 U = ½kx²。', 'Elastic potential energy U = ½kx².'), T(`½ × ${k} × ${num(x)}² = ${num(rnd(0.5 * k * x * x, 4))} J。`, `½ × ${k} × ${num(x)}² = ${num(rnd(0.5 * k * x * x, 4))} J.`)] }; }
      if (ask === 'slide') { const m = r.pick([1, 2, 5]), h = r.pick([2, 5, 10]), frac = r.pick([0.2, 0.25, 0.5]), W = rnd(m * g * h * frac, 2);
        return { q: T(`${m} kg 的物體從 ${h} m 高的粗糙斜面頂端由靜止滑下，摩擦力共做了 −${num(W)} J 的功。到達底部時速率是多少 m/s？（g = 9.8 m/s²，四捨五入到小數第二位）`, `A ${m} kg object slides from rest down a rough slope ${h} m high. Friction does −${num(W)} J of work. How fast is it at the bottom, in m/s? (g = 9.8 m/s², round to 2 decimal places.)`),
          ans: ansQty(Math.sqrt(2 * g * h - (2 * W) / m), 2, 'm/s'), vars: { m, h, W, ask },
          sol: [T('功能定理：動能 = 原來的位能 − 摩擦損失的能量。', 'Work–energy: kinetic energy = starting potential energy − energy lost to friction.'), T(`位能 mgh = ${m} × 9.8 × ${h} = ${num(m * g * h)} J；剩下 ${num(m * g * h)} − ${num(W)} = ${num(rnd(m * g * h - W, 2))} J。`, `PE = mgh = ${m} × 9.8 × ${h} = ${num(m * g * h)} J; left over: ${num(m * g * h)} − ${num(W)} = ${num(rnd(m * g * h - W, 2))} J.`), T(`½ × ${m} × v² = ${num(rnd(m * g * h - W, 2))} → v ≈ ${num(rnd(Math.sqrt(2 * g * h - (2 * W) / m), 2))} m/s。`, `½ × ${m} × v² = ${num(rnd(m * g * h - W, 2))} → v ≈ ${num(rnd(Math.sqrt(2 * g * h - (2 * W) / m), 2))} m/s.`)] }; }
      const m = r.pick([50, 60, 70]), h = r.pick([3, 6, 9, 12]), t = r.pick([5, 6, 10, 12, 15]), P = (m * g * h) / t;
      return { q: T(`體重 ${m} kg 的人在 ${t} 秒內爬上 ${h} m 高的樓梯，他對抗重力做功的平均功率是多少瓦特？（g = 9.8 m/s²，四捨五入到整數）`, `A ${m} kg person climbs stairs ${h} m high in ${t} s. What is the average power used against gravity, in watts? (g = 9.8 m/s², round to the nearest whole number.)`),
        ans: ansQty(P, 0, 'W'), vars: { P, ask },
        sol: [T(`功 = mgh = ${m} × 9.8 × ${h} = ${num(m * g * h)} J。`, `Work = mgh = ${m} × 9.8 × ${h} = ${num(m * g * h)} J.`), T(`功率 = W ÷ t = ${num(m * g * h)} ÷ ${t} ≈ ${num(Math.round(P))} W。`, `Power = W ÷ t = ${num(m * g * h)} ÷ ${t} ≈ ${num(Math.round(P))} W.`)] };
    },
  },
  {
    id: 'g11-momentum', grades: [11, 12], subj: 'phys',
    name: T('動量與碰撞', 'Momentum and collisions'),
    cur: { tw: TW('動量與衝量', 'momentum and impulse'), us: 'NGSS HS-PS2-2' },
    verify: (v) => (v.ask === 'stick' ? (v.m1 * v.u1 + v.m2 * v.u2) / (v.m1 + v.m2) : v.ask === 'elastic' ? ((v.m1 - v.m2) * v.u1) / (v.m1 + v.m2) : v.ask === 'impulse' ? v.F * v.t : v.m * Math.abs(v.v2 - v.v1)),
    gen(r) {
      const ask = r.pick(['stick', 'elastic', 'impulse', 'dp']);
      if (ask === 'stick') { const m1 = r.pick([1, 2, 3, 4, 1000, 1500]), m2 = r.pick([1, 2, 3, 5, 1000, 2000].filter((x) => (m1 >= 1000) === (x >= 1000))), u1 = r.pick([2, 4, 6, 10, 15, 20]), u2 = r.pick([0, 0, -2, 2]);
        const vf = (m1 * u1 + m2 * u2) / (m1 + m2);
        return { q: T(`質量 ${m1} kg、速度 ${u1} m/s 的物體，和質量 ${m2} kg、速度 ${u2} m/s 的物體（同一直線，向右為正）碰撞後黏在一起。碰撞後的速度是多少 m/s？（四捨五入到小數第二位）`, `A ${m1} kg object moving at ${u1} m/s collides with a ${m2} kg object moving at ${u2} m/s (same line, right is positive), and they stick together. What is their velocity afterward, in m/s? (Round to 2 decimal places.)`),
          ans: ansQty(vf, 2, 'm/s'), vars: { m1, m2, u1, u2, ask },
          sol: [T('碰撞時系統的總動量守恆：m₁u₁ + m₂u₂ = (m₁ + m₂)v。', 'Total momentum is conserved: m₁u₁ + m₂u₂ = (m₁ + m₂)v.'), T(`${m1}×${u1} + ${m2}×(${u2}) = ${m1 * u1 + m2 * u2} kg·m/s。`, `${m1}×${u1} + ${m2}×(${u2}) = ${m1 * u1 + m2 * u2} kg·m/s.`), T(`v = ${m1 * u1 + m2 * u2} ÷ ${m1 + m2} ≈ ${num(rnd(vf, 2))} m/s。（完全非彈性碰撞，動能會損失）`, `v = ${m1 * u1 + m2 * u2} ÷ ${m1 + m2} ≈ ${num(rnd(vf, 2))} m/s. (Perfectly inelastic — kinetic energy is lost.)`)] }; }
      if (ask === 'elastic') { const m1 = r.pick([1, 2, 3, 4]), m2 = r.pick([1, 2, 3, 5, 6].filter((x) => x !== m1)), u1 = r.pick([3, 4, 6, 8]);
        const v1 = ((m1 - m2) * u1) / (m1 + m2), v2 = (2 * m1 * u1) / (m1 + m2);
        return { q: T(`光滑平面上，質量 ${m1} kg、速度 ${u1} m/s 的球和靜止的 ${m2} kg 球發生一維彈性碰撞。碰撞後 ${m1} kg 球的速度是多少 m/s？（向原運動方向為正，四捨五入到小數第二位）`, `On a frictionless surface a ${m1} kg ball at ${u1} m/s hits a ${m2} kg ball at rest in a 1-D elastic collision. What is the ${m1} kg ball’s velocity afterward, in m/s? (Original direction positive; round to 2 decimal places.)`),
          ans: ansQty(v1, 2, 'm/s'), vars: { m1, m2, u1, ask },
          sol: [T('彈性碰撞：動量守恆，動能也守恆。對靜止目標的公式：v₁ = (m₁ − m₂)u₁/(m₁ + m₂)，v₂ = 2m₁u₁/(m₁ + m₂)。', 'Elastic: momentum and kinetic energy are both conserved. For a target at rest: v₁ = (m₁ − m₂)u₁/(m₁ + m₂), v₂ = 2m₁u₁/(m₁ + m₂).'), T(`v₁ = (${m1} − ${m2}) × ${u1} ÷ ${m1 + m2} ≈ ${num(rnd(v1, 2))} m/s${v1 < 0 ? '（負號表示反彈）' : ''}。`, `v₁ = (${m1} − ${m2}) × ${u1} ÷ ${m1 + m2} ≈ ${num(rnd(v1, 2))} m/s${v1 < 0 ? ' (negative: it bounces back)' : ''}.`), T(`驗算：v₂ ≈ ${num(rnd(v2, 2))} m/s，${m1}×${u1} = ${m1}×${num(rnd(v1, 3))} + ${m2}×${num(rnd(v2, 3))}。`, `Check: v₂ ≈ ${num(rnd(v2, 2))} m/s and ${m1}×${u1} = ${m1}×${num(rnd(v1, 3))} + ${m2}×${num(rnd(v2, 3))}.`)] }; }
      if (ask === 'impulse') { const F = r.pick([50, 100, 200, 500, 1000]), t = r.pick([0.01, 0.02, 0.05, 0.1, 0.2]);
        return { q: T(`球棒以平均 ${F} N 的力擊球，作用時間 ${num(t)} s，球受到的衝量是多少 N·s？`, `A bat hits a ball with an average force of ${F} N for ${num(t)} s. What impulse does the ball receive, in N·s?`), ans: ansQty(F * t, 3, 'N·s'), vars: { F, t, ask },
          sol: [T('衝量 J = F × Δt，等於動量的變化。', 'Impulse J = F × Δt, equal to the change in momentum.'), T(`${F} × ${num(t)} = ${num(rnd(F * t, 4))} N·s。`, `${F} × ${num(t)} = ${num(rnd(F * t, 4))} N·s.`)] }; }
      const m = r.pick([0.15, 0.2, 0.5, 2]), v1 = r.pick([10, 20, 30]), v2 = -r.pick([5, 10, 20]);
      return { q: T(`${num(m)} kg 的球以 ${v1} m/s 撞牆，以 ${-v2} m/s 反彈。球的動量變化量大小是多少 kg·m/s？`, `A ${num(m)} kg ball hits a wall at ${v1} m/s and bounces back at ${-v2} m/s. What is the size of its change in momentum, in kg·m/s?`),
        ans: ansQty(m * (v1 - v2), 3, 'kg·m/s'), vars: { m, v1, v2, ask },
        sol: [T('動量是向量，反彈時速度方向相反要用負號。', 'Momentum is a vector: the rebound velocity is negative.'), T(`Δp = m(v₂ − v₁) = ${num(m)} × (${num(v2)} − ${v1}) = ${num(rnd(m * (v2 - v1), 3))} kg·m/s，大小 ${num(rnd(m * (v1 - v2), 3))}。`, `Δp = m(v₂ − v₁) = ${num(m)} × (${num(v2)} − ${v1}) = ${num(rnd(m * (v2 - v1), 3))} kg·m/s; size ${num(rnd(m * (v1 - v2), 3))}.`), T('常見錯誤：直接把速率相減（只得到差值）。', 'Common mistake: subtracting the speeds instead of the velocities.')] };
    },
  },
  {
    id: 'g11-gravity', grades: [11, 12], subj: 'phys', sim: 'orbits',
    name: T('萬有引力與衛星', 'Gravitation and satellites'),
    cur: { tw: TW('萬有引力', 'gravitation'), us: 'NGSS HS-PS2-4' },
    verify: (v) => (v.ask === 'g' ? 9.8 / (1 + v.k) ** 2 : v.ask === 'kepler' ? v.T1 * Math.pow(v.a2 / v.a1, 1.5) : v.ask === 'v' ? Math.sqrt((6.67e-11 * 5.97e24) / (6.37e6 + v.h * 1000)) : ((F) => F / 10 ** Math.floor(Math.log10(F)))((6.67e-11 * v.m1 * v.m2) / (v.r * v.r))),
    gen(r) {
      const ask = r.pick(['g', 'kepler', 'v', 'F']);
      if (ask === 'g') { const k = r.pick([1, 2, 3, 0.5]);
        return { q: T(`地表的重力加速度約 9.8 m/s²。在離地面高度等於 ${num(k)} 倍地球半徑的地方，重力加速度是多少 m/s²？（四捨五入到小數第二位）`, `Gravity at Earth’s surface is about 9.8 m/s². What is it at a height of ${num(k)} Earth radii above the surface, in m/s²? (Round to 2 decimal places.)`), ans: ansQty(9.8 / (1 + k) ** 2, 2, 'm/s²'), vars: { k, ask },
          sol: [T('g ∝ 1/r²，r 是到地心的距離（不是到地面）。', 'g ∝ 1/r², where r is the distance from Earth’s center (not from the surface).'), T(`r = R + ${num(k)}R = ${num(1 + k)}R，所以 g = 9.8 ÷ ${num(1 + k)}² ≈ ${num(rnd(9.8 / (1 + k) ** 2, 3))} m/s²。`, `r = R + ${num(k)}R = ${num(1 + k)}R, so g = 9.8 ÷ ${num(1 + k)}² ≈ ${num(rnd(9.8 / (1 + k) ** 2, 3))} m/s².`)] }; }
      if (ask === 'kepler') { const a2 = r.pick([4, 9, 16, 1.5]), a1 = 1, T1 = 1;
        return { q: T(`某行星繞太陽的軌道半長軸是地球的 ${num(a2)} 倍，它的公轉週期是幾年？（四捨五入到小數第二位）`, `A planet’s orbit has a semi-major axis ${num(a2)} times Earth’s. What is its orbital period in years? (Round to 2 decimal places.)`), ans: ansQty(Math.pow(a2, 1.5), 2, U('年', 'yr')), vars: { a1, a2, T1, ask },
          sol: [T('克卜勒第三定律：T² ∝ a³，所以 T₂/T₁ = (a₂/a₁)^(3/2)。', 'Kepler’s third law: T² ∝ a³, so T₂/T₁ = (a₂/a₁)^(3/2).'), T(`T = 1 × ${num(a2)}^1.5 ≈ ${num(rnd(Math.pow(a2, 1.5), 3))} 年。`, `T = 1 × ${num(a2)}^1.5 ≈ ${num(rnd(Math.pow(a2, 1.5), 3))} years.`)] }; }
      if (ask === 'v') { const h = r.pick([400, 800, 2000, 35786]);
        const R = 6.37e6 + h * 1000, v = Math.sqrt((6.67e-11 * 5.97e24) / R);
        return { q: T(`人造衛星在離地面 ${num(h)} km 的高度做等速圓周運動，軌道速率約是多少 m/s？（G = 6.67×10⁻¹¹ N·m²/kg²，地球質量 5.97×10²⁴ kg，半徑 6.37×10⁶ m；四捨五入到整數）`, `A satellite circles ${num(h)} km above Earth’s surface. About how fast does it move, in m/s? (G = 6.67×10⁻¹¹ N·m²/kg², Earth’s mass 5.97×10²⁴ kg, radius 6.37×10⁶ m; round to the nearest whole number.)`),
          ans: ansQty(v, 0, 'm/s'), vars: { h, ask },
          sol: [T('萬有引力提供向心力：GMm/r² = mv²/r → v = √(GM/r)。', 'Gravity provides the centripetal force: GMm/r² = mv²/r → v = √(GM/r).'), T(`r = 6.37×10⁶ + ${sci(h * 1000)} = ${sci(R, 4)} m。`, `r = 6.37×10⁶ + ${sci(h * 1000)} = ${sci(R, 4)} m.`), T(`v = √(6.67×10⁻¹¹ × 5.97×10²⁴ ÷ ${sci(R, 4)}) ≈ ${num(Math.round(v))} m/s。`, `v = √(6.67×10⁻¹¹ × 5.97×10²⁴ ÷ ${sci(R, 4)}) ≈ ${num(Math.round(v))} m/s.`)] }; }
      const m1 = r.pick([50, 60, 1000]), m2 = r.pick([50, 70, 2000]), rr = r.pick([1, 2, 5]);
      const F = (6.67e-11 * m1 * m2) / (rr * rr), e = Math.floor(Math.log10(F)), mant = F / 10 ** e;
      return { q: T(`質量 ${m1} kg 和 ${m2} kg 的兩物體相距 ${rr} m，彼此的萬有引力是 a × 10<sup>${num(e)}</sup> N，a 是多少？（G = 6.67×10⁻¹¹ N·m²/kg²，四捨五入到小數第二位）`, `Two objects of ${m1} kg and ${m2} kg are ${rr} m apart. Their gravitational force is a × 10<sup>${num(e)}</sup> N. What is a? (G = 6.67×10⁻¹¹ N·m²/kg²; round to 2 decimal places.)`),
        ans: ansQty(mant, 2), vars: { m1, m2, r: rr, ask: 'Fm' },
        sol: [T('F = Gm₁m₂/r²。', 'F = Gm₁m₂/r².'), T(`F = 6.67×10⁻¹¹ × ${m1} × ${m2} ÷ ${rr * rr} ≈ ${sci(F, 3)} N。`, `F = 6.67×10⁻¹¹ × ${m1} × ${m2} ÷ ${rr * rr} ≈ ${sci(F, 3)} N.`), T('日常物體之間的萬有引力非常小，所以我們感覺不到。', 'Gravity between everyday objects is tiny, which is why we don’t notice it.')] };
    },
  },
  {
    id: 'g11-circuits', grades: [10, 12], subj: 'phys', sim: 'circuits-ohm',
    name: T('直流電路', 'DC circuits'),
    cur: { tw: TW('電流與電路', 'current and circuits'), us: 'NGSS HS-PS3-1' },
    verify: (v) => (v.ask === 'eq' ? v.R1 + (v.R2 * v.R3) / (v.R2 + v.R3) : v.ask === 'P' ? (v.V * v.V) / v.R : v.ask === 'emf' ? v.E / (v.R + v.r) : v.ask === 'kwh' ? (v.P * v.h) / 1000 : v.E / (v.R1 + (v.R2 * v.R3) / (v.R2 + v.R3))),
    gen(r) {
      const ask = r.pick(['eq', 'P', 'emf', 'kwh', 'I']);
      const R1 = r.pick([2, 4, 5, 6, 10]), R2 = r.pick([3, 4, 6, 12]), R3 = r.pick([4, 6, 12]);
      const Req = R1 + (R2 * R3) / (R2 + R3);
      if (ask === 'eq') return { q: T(`R₁ = ${R1} Ω 和「R₂ = ${R2} Ω 與 R₃ = ${R3} Ω 的並聯組合」串聯，總電阻是多少 Ω？（四捨五入到小數第二位）`, `R₁ = ${R1} Ω is in series with the parallel pair R₂ = ${R2} Ω and R₃ = ${R3} Ω. What is the total resistance in ohms? (Round to 2 decimal places.)`), ans: ansQty(Req, 2, 'Ω'), vars: { R1, R2, R3, ask },
        sol: [T(`並聯部分：R₂R₃/(R₂ + R₃) = ${R2}×${R3} ÷ ${R2 + R3} ≈ ${num(rnd((R2 * R3) / (R2 + R3), 3))} Ω。`, `Parallel part: R₂R₃/(R₂ + R₃) = ${R2}×${R3} ÷ ${R2 + R3} ≈ ${num(rnd((R2 * R3) / (R2 + R3), 3))} Ω.`), T(`再和 R₁ 串聯：${R1} + ${num(rnd((R2 * R3) / (R2 + R3), 3))} ≈ ${num(rnd(Req, 2))} Ω。`, `Add R₁ in series: ${R1} + ${num(rnd((R2 * R3) / (R2 + R3), 3))} ≈ ${num(rnd(Req, 2))} Ω.`)] };
      if (ask === 'I') { const E = r.pick([6, 9, 12, 24]);
        return { q: T(`電動勢 ${E} V（內電阻不計）的電池接在 R₁ = ${R1} Ω 與「R₂ = ${R2} Ω ∥ R₃ = ${R3} Ω」串聯的電路上，電池輸出的電流是多少 A？（四捨五入到小數第二位）`, `A ${E} V battery (no internal resistance) drives R₁ = ${R1} Ω in series with (R₂ = ${R2} Ω ∥ R₃ = ${R3} Ω). What current does the battery supply, in A? (Round to 2 decimal places.)`), ans: ansQty(E / Req, 2, 'A'), vars: { E, R1, R2, R3, ask },
          sol: [T(`總電阻 = ${R1} + ${R2}×${R3}/(${R2}+${R3}) ≈ ${num(rnd(Req, 3))} Ω。`, `Total resistance = ${R1} + ${R2}×${R3}/(${R2}+${R3}) ≈ ${num(rnd(Req, 3))} Ω.`), T(`I = ε/R = ${E} ÷ ${num(rnd(Req, 3))} ≈ ${num(rnd(E / Req, 2))} A。`, `I = ε/R = ${E} ÷ ${num(rnd(Req, 3))} ≈ ${num(rnd(E / Req, 2))} A.`)] }; }
      if (ask === 'P') { const V = r.pick([110, 220]), R = r.pick([22, 44, 55, 110, 242, 484]);
        return { q: T(`電熱器的電阻是 ${R} Ω，接在 ${V} V 的電源上，消耗的電功率是多少瓦特？（四捨五入到小數第一位）`, `A heater with resistance ${R} Ω runs on ${V} V. What power does it use, in watts? (Round to 1 decimal place.)`), ans: ansQty((V * V) / R, 1, 'W'), vars: { V, R, ask },
          sol: [T('P = IV = V²/R。', 'P = IV = V²/R.'), T(`P = ${V}² ÷ ${R} = ${V * V} ÷ ${R} ≈ ${num(rnd((V * V) / R, 2))} W。`, `P = ${V}² ÷ ${R} = ${V * V} ÷ ${R} ≈ ${num(rnd((V * V) / R, 2))} W.`)] }; }
      if (ask === 'emf') { const E = r.pick([1.5, 3, 4.5, 6, 9, 12]), rr = r.pick([0.5, 1, 1.5, 2]), R = r.pick([2, 4, 5, 10]);
        return { q: T(`電動勢 ${num(E)} V、內電阻 ${num(rr)} Ω 的電池接上 ${R} Ω 的電阻，電路中的電流是多少 A？（四捨五入到小數第三位）`, `A battery of EMF ${num(E)} V and internal resistance ${num(rr)} Ω is connected to a ${R} Ω resistor. What current flows, in A? (Round to 3 decimal places.)`), ans: ansQty(E / (R + rr), 3, 'A'), vars: { E, R, r: rr, ask },
          sol: [T('I = ε/(R + r)，內電阻也要算進去。', 'I = ε/(R + r) — include the internal resistance.'), T(`I = ${num(E)} ÷ (${R} + ${num(rr)}) ≈ ${num(rnd(E / (R + rr), 3))} A，端電壓 = ε − Ir ≈ ${num(rnd(E - (E / (R + rr)) * rr, 3))} V。`, `I = ${num(E)} ÷ (${R} + ${num(rr)}) ≈ ${num(rnd(E / (R + rr), 3))} A; terminal voltage = ε − Ir ≈ ${num(rnd(E - (E / (R + rr)) * rr, 3))} V.`)] }; }
      const P = r.pick([800, 1000, 1200, 1500, 2000]), h = r.pick([0.5, 1, 2, 3, 5]);
      return { q: T(`${P} W 的電器使用 ${num(h)} 小時，消耗多少度電（kWh）？`, `An appliance rated ${P} W runs for ${num(h)} hours. How much energy does it use, in kWh (units of electricity)?`), ans: ansQty((P * h) / 1000, 2, 'kWh'), vars: { P, h, ask },
        sol: [T('1 度 = 1 kWh = 1000 W × 1 h（= 3.6×10⁶ J）。', '1 unit = 1 kWh = 1000 W × 1 h (= 3.6×10⁶ J).'), T(`${P} W = ${num(P / 1000)} kW，× ${num(h)} h = ${num((P * h) / 1000)} kWh。`, `${P} W = ${num(P / 1000)} kW, × ${num(h)} h = ${num((P * h) / 1000)} kWh.`)] };
    },
  },
  {
    id: 'g11-waves', grades: [10, 12], subj: 'phys', sim: 'waves',
    name: T('波動', 'Waves'),
    cur: { tw: TW('波動', 'waves'), us: 'NGSS HS-PS4-1' },
    verify: (v) => (v.ask === 'v' ? v.f * v.lam : v.ask === 'lam' ? v.vs / v.f : v.ask === 'harm' ? (v.n * v.vs) / (2 * v.L) : (v.lam * 1e-9 * v.L) / (v.d * 1e-3) * 1000),
    gen(r) {
      const ask = r.pick(['v', 'lam', 'harm', 'slit']);
      if (ask === 'v') { const f = r.pick([2, 5, 10, 50, 256, 440]), lam = r.pick([0.5, 0.78, 1.2, 1.5, 2, 3]);
        return { q: T(`一列波的頻率 ${f} Hz、波長 ${num(lam)} m，波速是多少 m/s？`, `A wave has frequency ${f} Hz and wavelength ${num(lam)} m. What is its speed in m/s?`), ans: ansQty(f * lam, 2, 'm/s'), vars: { f, lam, ask },
          sol: [T('v = fλ。', 'v = fλ.'), T(`${f} × ${num(lam)} = ${num(rnd(f * lam, 3))} m/s。`, `${f} × ${num(lam)} = ${num(rnd(f * lam, 3))} m/s.`)] }; }
      if (ask === 'lam') { const [nz, ne, vs] = r.pick([['聲音（空氣中）', 'sound in air', 340], ['聲音（水中）', 'sound in water', 1500]]), f = r.pick([170, 340, 500, 1000, 2000]);
        return { q: T(`${nz}的速率約 ${vs} m/s，頻率 ${f} Hz 的聲波波長是多少公尺？（四捨五入到小數第三位）`, `The speed of ${ne} is about ${vs} m/s. What is the wavelength of a ${f} Hz sound wave, in meters? (Round to 3 decimal places.)`), ans: ansQty(vs / f, 3, 'm'), vars: { vs, f, ask },
          sol: [T('λ = v/f。', 'λ = v/f.'), T(`${vs} ÷ ${f} ≈ ${num(rnd(vs / f, 4))} m。`, `${vs} ÷ ${f} ≈ ${num(rnd(vs / f, 4))} m.`)] }; }
      if (ask === 'harm') { const L = r.pick([0.5, 0.6, 0.8, 1, 1.2]), vs = r.pick([120, 200, 240, 300, 400]), n = r.int(1, 4);
        return { q: T(`長 ${num(L)} m、兩端固定的弦上波速為 ${vs} m/s，第 ${n} 諧音（${n === 1 ? '基音' : `第 ${n} 個駐波模式`}）的頻率是多少 Hz？`, `A string ${num(L)} m long, fixed at both ends, carries waves at ${vs} m/s. What is the frequency of harmonic ${n}${n === 1 ? ' (the fundamental)' : ''}, in Hz?`), ans: ansQty((n * vs) / (2 * L), 1, 'Hz'), vars: { L, vs, n, ask },
          sol: [T('兩端固定的駐波：L = nλ/2，所以 λ = 2L/n、f = nv/2L。', 'Standing waves with both ends fixed: L = nλ/2, so λ = 2L/n and f = nv/2L.'), T(`f = ${n} × ${vs} ÷ (2 × ${num(L)}) = ${num(rnd((n * vs) / (2 * L), 2))} Hz。`, `f = ${n} × ${vs} ÷ (2 × ${num(L)}) = ${num(rnd((n * vs) / (2 * L), 2))} Hz.`)] }; }
      const lam = r.pick([450, 500, 550, 600, 650, 700]), L = r.pick([1, 1.5, 2]), d = r.pick([0.1, 0.2, 0.25, 0.5]);
      const dy = ((lam * 1e-9 * L) / (d * 1e-3)) * 1000;
      return { q: T(`波長 ${lam} nm 的光通過間距 ${num(d)} mm 的雙狹縫，在 ${num(L)} m 外的屏幕上形成干涉條紋。相鄰亮紋的間距是多少毫米？（四捨五入到小數第二位）`, `Light of wavelength ${lam} nm passes through two slits ${num(d)} mm apart onto a screen ${num(L)} m away. What is the spacing between neighboring bright fringes, in mm? (Round to 2 decimal places.)`),
        ans: ansQty(dy, 2, 'mm'), vars: { lam, L, d, ask },
        sol: [T('雙狹縫干涉（小角度）：Δy = λL/d。', 'Double slit (small angles): Δy = λL/d.'), T(`Δy = ${lam}×10⁻⁹ m × ${num(L)} m ÷ ${num(d)}×10⁻³ m = ${sci(dy / 1000, 3)} m。`, `Δy = ${lam}×10⁻⁹ m × ${num(L)} m ÷ ${num(d)}×10⁻³ m = ${sci(dy / 1000, 3)} m.`), T(`= ${num(rnd(dy, 3))} mm。`, `= ${num(rnd(dy, 3))} mm.`)] };
    },
  },
  {
    id: 'g12-half-life', grades: [10, 12], subj: 'phys', sim: 'half-life',
    name: T('半衰期', 'Half-life'),
    cur: { tw: TW('原子核與放射性', 'nuclei and radioactivity'), us: 'NGSS HS-PS1-8' },
    verify: (v) => (v.ask === 'left' ? v.N0 * 0.5 ** v.n : v.ask === 'time' ? v.n * v.h : v.ask === 'half' ? v.t / v.n : v.N0 * 0.5 ** (v.t / v.h)),
    gen(r) {
      const ask = r.pick(['left', 'time', 'half', 'frac']);
      const iso = r.pick([['碘-131', 'iodine-131', 8, '天', 'days'], ['碳-14', 'carbon-14', 5730, '年', 'years'], ['鈷-60', 'cobalt-60', 5.27, '年', 'years'], ['鍶-90', 'strontium-90', 28.8, '年', 'years'], ['氡-222', 'radon-222', 3.8, '天', 'days']]);
      const [z, e, h, uz, ue] = iso, n = r.int(1, 5), N0 = r.pick([80, 160, 320, 640, 1000, 1600]);
      if (ask === 'left') return { q: T(`${z}的半衰期約 ${num(h)} ${uz}。${N0} 毫克的${z}經過 ${num(rnd(n * h, 2))} ${uz}後，還剩多少毫克？`, `The half-life of ${e} is about ${num(h)} ${ue}. How many milligrams of a ${N0} mg sample are left after ${num(rnd(n * h, 2))} ${ue}?`), ans: ansQty(N0 * 0.5 ** n, 2, 'mg'), vars: { N0, n, ask },
        sol: [T(`經過的時間 ÷ 半衰期 = ${num(rnd(n * h, 2))} ÷ ${num(h)} = ${n} 個半衰期。`, `Time ÷ half-life = ${num(rnd(n * h, 2))} ÷ ${num(h)} = ${n} half-lives.`), T(`剩下 ${N0} × (½)<sup>${n}</sup> = ${N0} ÷ ${2 ** n} = ${num(N0 / 2 ** n)} mg。`, `Left: ${N0} × (½)<sup>${n}</sup> = ${N0} ÷ ${2 ** n} = ${num(N0 / 2 ** n)} mg.`)] };
      if (ask === 'time') return { q: T(`${z}的半衰期約 ${num(h)} ${uz}。要讓它的放射性衰減到原來的 1/${2 ** n}，需要多少${uz}？`, `The half-life of ${e} is about ${num(h)} ${ue}. How many ${ue} until its activity drops to 1/${2 ** n} of the original?`), ans: ansQty(n * h, 2, T(uz, ue)), vars: { n, h, ask },
        sol: [T(`1/${2 ** n} = (½)<sup>${n}</sup>，要經過 ${n} 個半衰期。`, `1/${2 ** n} = (½)<sup>${n}</sup>, which takes ${n} half-lives.`), T(`${n} × ${num(h)} = ${num(rnd(n * h, 2))} ${uz}。`, `${n} × ${num(h)} = ${num(rnd(n * h, 2))} ${ue}.`)] };
      if (ask === 'half') { const t = r.pick([12, 24, 30, 60, 90]), nn = r.pick([2, 3]);
        return { q: T(`某放射性樣品經過 ${t} 天後，只剩下原來的 1/${2 ** nn}。它的半衰期是幾天？`, `A radioactive sample drops to 1/${2 ** nn} of its original amount in ${t} days. What is its half-life in days?`), ans: ansQty(t / nn, 2, T('天', 'days')), vars: { t, n: nn, ask },
          sol: [T(`1/${2 ** nn} = (½)<sup>${nn}</sup>，表示經過了 ${nn} 個半衰期。`, `1/${2 ** nn} = (½)<sup>${nn}</sup>, so ${nn} half-lives have passed.`), T(`半衰期 = ${t} ÷ ${nn} = ${num(rnd(t / nn, 3))} 天。`, `Half-life = ${t} ÷ ${nn} = ${num(rnd(t / nn, 3))} days.`)] }; }
      const t = rnd(r.pick([0.5, 1.5, 2.5]) * h, 3);
      return { q: T(`${z}的半衰期約 ${num(h)} ${uz}。${N0} 個原子核經過 ${num(t)} ${uz}後，理論上約剩多少個？（四捨五入到整數）`, `The half-life of ${e} is about ${num(h)} ${ue}. In theory, about how many of ${N0} nuclei remain after ${num(t)} ${ue}? (Round to the nearest whole number.)`),
        ans: ansQty(N0 * 0.5 ** (t / h), 0), vars: { N0, t, h, ask: 'frac' },
        sol: [T('N = N₀ (½)<sup>t/T½</sup>，指數不必是整數。', 'N = N₀ (½)<sup>t/T½</sup> — the exponent doesn’t have to be a whole number.'), T(`t/T½ = ${num(t)} ÷ ${num(h)} = ${num(rnd(t / h, 3))}。`, `t/T½ = ${num(t)} ÷ ${num(h)} = ${num(rnd(t / h, 3))}.`), T(`N = ${N0} × 0.5<sup>${num(rnd(t / h, 3))}</sup> ≈ ${num(Math.round(N0 * 0.5 ** (t / h)))}。`, `N = ${N0} × 0.5<sup>${num(rnd(t / h, 3))}</sup> ≈ ${num(Math.round(N0 * 0.5 ** (t / h)))}.`)] };
    },
  },
  {
    id: 'g11-gas-law', grades: [10, 11], subj: 'chem', sim: 'ideal-gas',
    name: T('氣體定律', 'Gas laws'),
    cur: { tw: T('高中 化學 氣體', 'Senior high chemistry · gases'), us: 'NGSS HS-PS3-2' },
    verify: (v) => (v.ask === 'boyle' ? (v.P1 * v.V1) / v.V2 : v.ask === 'charles' ? (v.V1 * v.T2) / v.T1 : v.ask === 'nrt' ? (v.n * 0.082 * v.T) / v.V : (v.P * v.V) / (0.082 * v.T)),
    gen(r) {
      const ask = r.pick(['boyle', 'charles', 'nrt', 'n']);
      if (ask === 'boyle') { const P1 = r.pick([1, 1.5, 2, 3]), V1 = r.pick([2, 4, 6, 10, 12]), V2 = r.pick([1, 2, 3, 5, 8].filter((x) => x !== V1));
        return { q: T(`定溫下，一定量的氣體壓力 ${num(P1)} atm、體積 ${V1} L。體積變成 ${V2} L 時，壓力是多少 atm？（四捨五入到小數第二位）`, `At constant temperature, a gas at ${num(P1)} atm occupies ${V1} L. What is its pressure when the volume becomes ${V2} L, in atm? (Round to 2 decimal places.)`), ans: ansQty((P1 * V1) / V2, 2, 'atm'), vars: { P1, V1, V2, ask },
          sol: [T('波以耳定律：P₁V₁ = P₂V₂（定溫、定量）。', 'Boyle’s law: P₁V₁ = P₂V₂ (fixed T and amount).'), T(`P₂ = ${num(P1)} × ${V1} ÷ ${V2} ≈ ${num(rnd((P1 * V1) / V2, 3))} atm。`, `P₂ = ${num(P1)} × ${V1} ÷ ${V2} ≈ ${num(rnd((P1 * V1) / V2, 3))} atm.`)] }; }
      if (ask === 'charles') { const V1 = r.pick([1, 2, 3, 5]), t1 = r.pick([0, 27, 127]), t2 = r.pick([27, 127, 227, 327].filter((x) => x !== t1)), T1 = t1 + 273, T2 = t2 + 273;
        return { q: T(`定壓下，${t1} °C 時體積 ${V1} L 的氣體，加熱到 ${t2} °C 時體積是多少 L？（四捨五入到小數第二位）`, `At constant pressure, a gas occupies ${V1} L at ${t1} °C. What is its volume at ${t2} °C, in liters? (Round to 2 decimal places.)`), ans: ansQty((V1 * T2) / T1, 2, 'L'), vars: { V1, T1, T2, ask },
          sol: [T('查理定律：V/T = 定值，溫度一定要用絕對溫度 K（°C + 273）。', 'Charles’s law: V/T is constant — temperatures must be in kelvins (°C + 273).'), T(`T₁ = ${T1} K，T₂ = ${T2} K。`, `T₁ = ${T1} K, T₂ = ${T2} K.`), T(`V₂ = ${V1} × ${T2} ÷ ${T1} ≈ ${num(rnd((V1 * T2) / T1, 3))} L。`, `V₂ = ${V1} × ${T2} ÷ ${T1} ≈ ${num(rnd((V1 * T2) / T1, 3))} L.`)], hint: T('攝氏溫度不能直接代入！', 'Don’t plug in °C directly!') }; }
      const n = r.pick([0.5, 1, 2, 3]), Tk = r.pick([273, 300, 400, 500]), V = r.pick([5, 10, 20, 22.4, 24.6]);
      if (ask === 'nrt') return { q: T(`${num(n)} mol 理想氣體在 ${Tk} K、${num(V)} L 的容器中，壓力是多少 atm？（R = 0.082 atm·L/(mol·K)，四捨五入到小數第二位）`, `${num(n)} mol of an ideal gas is at ${Tk} K in a ${num(V)} L container. What is the pressure in atm? (R = 0.082 atm·L/(mol·K); round to 2 decimal places.)`), ans: ansQty((n * 0.082 * Tk) / V, 2, 'atm'), vars: { n, T: Tk, V, ask },
        sol: [T('PV = nRT → P = nRT/V。', 'PV = nRT → P = nRT/V.'), T(`P = ${num(n)} × 0.082 × ${Tk} ÷ ${num(V)} ≈ ${num(rnd((n * 0.082 * Tk) / V, 3))} atm。`, `P = ${num(n)} × 0.082 × ${Tk} ÷ ${num(V)} ≈ ${num(rnd((n * 0.082 * Tk) / V, 3))} atm.`)] };
      const P = rnd((n * 0.082 * Tk) / V, 2);
      return { q: T(`某理想氣體在 ${Tk} K、${num(P)} atm 下體積為 ${num(V)} L，它有多少莫耳？（R = 0.082 atm·L/(mol·K)，四捨五入到小數第二位）`, `An ideal gas at ${Tk} K and ${num(P)} atm occupies ${num(V)} L. How many moles is it? (R = 0.082 atm·L/(mol·K); round to 2 decimal places.)`), ans: ansQty((P * V) / (0.082 * Tk), 2, 'mol'), vars: { P, V, T: Tk, ask },
        sol: [T('n = PV/RT。', 'n = PV/RT.'), T(`n = ${num(P)} × ${num(V)} ÷ (0.082 × ${Tk}) ≈ ${num(rnd((P * V) / (0.082 * Tk), 3))} mol。`, `n = ${num(P)} × ${num(V)} ÷ (0.082 × ${Tk}) ≈ ${num(rnd((P * V) / (0.082 * Tk), 3))} mol.`)] };
    },
  },
];

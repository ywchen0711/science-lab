// Practice units for grades 10–12, chemistry, biology and earth science (高中 化學・生物・地科). Format: see SPEC.md.
import { T, ansQty, ansChoice, pickItem, num, rnd, sci, NAMES } from '../util.js';

const TWC = (zh, en) => T(`高中 化學 ${zh}`, `Senior high chemistry · ${en}`);
const TWB = (zh, en) => T(`高中 生物 ${zh}`, `Senior high biology · ${en}`);
const sub = (f) => f.replace(/(\d+)/g, '<sub>$1</sub>');
const AM = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 63.5, Zn: 65 };
const AMtext = (els) => els.map((e) => `${e} = ${AM[e]}`).join(', ');
function parse(f) { const o = {}; const re = /([A-Z][a-z]?)(\d*)|\(([^)]*)\)(\d*)/g; let m; while ((m = re.exec(f))) { if (m[1]) o[m[1]] = (o[m[1]] || 0) + +(m[2] || 1); else { const inner = parse(m[3]); for (const [e, n] of Object.entries(inner)) o[e] = (o[e] || 0) + n * +(m[4] || 1); } } return o; }
const molar = (f) => rnd(Object.entries(parse(f)).reduce((s, [e, n]) => s + AM[e] * n, 0), 2);
const howM = (f) => Object.entries(parse(f)).map(([e, n]) => (n > 1 ? `${n}×${AM[e]}` : `${AM[e]}`)).join(' + ');

// codon table (standard genetic code)
const B = 'UCAG', AAS = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG', COD = {};
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) COD[B[i] + B[j] + B[k]] = AAS[i * 16 + j * 4 + k];
const NAME3 = { F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', C: 'Cys', W: 'Trp', P: 'Pro', H: 'His', Q: 'Gln', R: 'Arg', I: 'Ile', M: 'Met', T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp', E: 'Glu', G: 'Gly', '*': 'Stop' };

export default [
  {
    id: 'g10-moles', grades: [10, 10], subj: 'chem',
    name: T('莫耳與亞佛加厥數', 'Moles and Avogadro’s number'),
    cur: { tw: TWC('原子量、分子量與莫耳', 'atomic mass, molar mass and the mole'), us: 'NGSS HS-PS1-7' },
    verify: (v) => (v.ask === 'M' ? v.M : v.ask === 'n' ? v.m / v.M : v.ask === 'm' ? v.n * v.M : v.n * 6.02),
    gen(r) {
      const F = ['H2O', 'CO2', 'NH3', 'CH4', 'NaCl', 'CaCO3', 'C6H12O6', 'H2SO4', 'NaOH', 'MgO', 'Al2O3', 'Ca(OH)2', 'CuSO4', 'Fe2O3', 'C2H5OH'];
      const f = r.pick(F), M = molar(f), els = Object.keys(parse(f)), ask = r.pick(['M', 'n', 'm', 'N']);
      const given = T(`（原子量：${AMtext(els)}）`, ` (Atomic masses: ${AMtext(els)})`);
      if (ask === 'M') return { q: T(`${sub(f)} 的莫耳質量是多少 g/mol？${given.zh}`, `What is the molar mass of ${sub(f)} in g/mol?${given.en}`), ans: ansQty(M, 1, 'g/mol'), vars: { M, ask },
        sol: [T('莫耳質量 = 化學式中各原子的原子量總和（單位 g/mol）。', 'Molar mass = sum of the atomic masses in the formula (g/mol).'), T(`${sub(f)}：${howM(f)} = ${num(M)} g/mol。`, `${sub(f)}: ${howM(f)} = ${num(M)} g/mol.`)] };
      const n = r.pick([0.1, 0.2, 0.25, 0.5, 1.5, 2, 3]), m = rnd(n * M, 3);
      if (ask === 'n') return { q: T(`${num(m)} g 的 ${sub(f)} 是多少莫耳？${given.zh}`, `How many moles are in ${num(m)} g of ${sub(f)}?${given.en}`), ans: ansQty(n, 3, 'mol'), vars: { m, M, ask },
        sol: [T(`莫耳質量 = ${howM(f)} = ${num(M)} g/mol。`, `Molar mass = ${howM(f)} = ${num(M)} g/mol.`), T(`n = m / M = ${num(m)} ÷ ${num(M)} = ${num(n)} mol。`, `n = m / M = ${num(m)} ÷ ${num(M)} = ${num(n)} mol.`)] };
      if (ask === 'm') return { q: T(`${num(n)} mol 的 ${sub(f)} 質量是多少公克？${given.zh}`, `What is the mass of ${num(n)} mol of ${sub(f)}, in grams?${given.en}`), ans: ansQty(m, 2, 'g'), vars: { n, M, ask },
        sol: [T(`莫耳質量 = ${howM(f)} = ${num(M)} g/mol。`, `Molar mass = ${howM(f)} = ${num(M)} g/mol.`), T(`m = n × M = ${num(n)} × ${num(M)} = ${num(m)} g。`, `m = n × M = ${num(n)} × ${num(M)} = ${num(m)} g.`)] };
      return { q: T(`${num(n)} mol 的 ${sub(f)} 含有多少個分子（或化學式單位）？答案寫成 a × 10²³ 中的 a。（亞佛加厥數 6.02 × 10²³）`, `How many molecules (or formula units) are in ${num(n)} mol of ${sub(f)}? Give a in a × 10²³. (Avogadro’s number 6.02 × 10²³)`), ans: ansQty(n * 6.02, 3), vars: { n, ask },
        sol: [T('粒子數 = n × 6.02 × 10²³。', 'Number of particles = n × 6.02 × 10²³.'), T(`${num(n)} × 6.02 × 10²³ = ${num(rnd(n * 6.02, 4))} × 10²³。`, `${num(n)} × 6.02 × 10²³ = ${num(rnd(n * 6.02, 4))} × 10²³.`)] };
    },
  },
  {
    id: 'g10-stoichiometry', grades: [10, 11], subj: 'chem', sim: 'balance-equations',
    name: T('化學計量與限量試劑', 'Stoichiometry and limiting reagents'),
    cur: { tw: TWC('化學反應與化學計量', 'reactions and stoichiometry'), us: 'NGSS HS-PS1-7' },
    verify: (v) => (v.ask === 'mass' ? ((v.m / v.Ma) * v.cb / v.ca) * v.Mb : Math.min(v.nA / v.ca, v.nB / v.cb) * v.cp),
    gen(r) {
      const R = [
        { eq: '2H₂ + O₂ → 2H₂O', sp: [['H2', 2], ['O2', 1], ['H2O', 2]] },
        { eq: 'CH₄ + 2O₂ → CO₂ + 2H₂O', sp: [['CH4', 1], ['O2', 2], ['CO2', 1], ['H2O', 2]] },
        { eq: 'CaCO₃ → CaO + CO₂', sp: [['CaCO3', 1], ['CaO', 1], ['CO2', 1]] },
        { eq: '2Mg + O₂ → 2MgO', sp: [['Mg', 2], ['O2', 1], ['MgO', 2]] },
        { eq: 'N₂ + 3H₂ → 2NH₃', sp: [['N2', 1], ['H2', 3], ['NH3', 2]] },
        { eq: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O', sp: [['C3H8', 1], ['O2', 5], ['CO2', 3], ['H2O', 4]] },
        { eq: '4Fe + 3O₂ → 2Fe₂O₃', sp: [['Fe', 4], ['O2', 3], ['Fe2O3', 2]] },
      ];
      const rx = r.pick(R), ask = r.pick(['mass', 'mass', 'limit']);
      if (ask === 'mass') {
        const [a, b] = r.sample(rx.sp, 2), Ma = molar(a[0]), Mb = molar(b[0]), n = r.pick([0.5, 1, 2, 3, 0.25]) * a[1], m = rnd(n * Ma, 3), mb = (n * b[1] / a[1]) * Mb;
        const els = [...new Set([...Object.keys(parse(a[0])), ...Object.keys(parse(b[0]))])];
        return { q: T(`依反應式 ${rx.eq}，${num(m)} g 的 ${sub(a[0])} 完全反應時，對應的 ${sub(b[0])} 是多少公克？（原子量：${AMtext(els)}；四捨五入到小數第一位）`, `For ${rx.eq}, when ${num(m)} g of ${sub(a[0])} reacts completely, how many grams of ${sub(b[0])} correspond to it? (Atomic masses: ${AMtext(els)}; round to 1 decimal place.)`),
          ans: ansQty(mb, 1, 'g'), vars: { m, Ma, Mb, ca: a[1], cb: b[1], ask },
          sol: [T(`先換成莫耳：${sub(a[0])} 的莫耳質量 ${num(Ma)}，n = ${num(m)} ÷ ${num(Ma)} = ${num(rnd(n, 4))} mol。`, `Convert to moles: ${sub(a[0])} has molar mass ${num(Ma)}, so n = ${num(m)} ÷ ${num(Ma)} = ${num(rnd(n, 4))} mol.`), T(`係數比 ${sub(a[0])} : ${sub(b[0])} = ${a[1]} : ${b[1]}，所以 ${sub(b[0])} 是 ${num(rnd(n, 4))} × ${b[1]}/${a[1]} = ${num(rnd((n * b[1]) / a[1], 4))} mol。`, `Mole ratio ${sub(a[0])} : ${sub(b[0])} = ${a[1]} : ${b[1]}, so ${sub(b[0])} = ${num(rnd(n, 4))} × ${b[1]}/${a[1]} = ${num(rnd((n * b[1]) / a[1], 4))} mol.`), T(`質量 = ${num(rnd((n * b[1]) / a[1], 4))} × ${num(Mb)} ≈ ${num(rnd(mb, 2))} g。`, `Mass = ${num(rnd((n * b[1]) / a[1], 4))} × ${num(Mb)} ≈ ${num(rnd(mb, 2))} g.`)] };
      }
      const reac = rx.sp.filter((x, i) => i < (rx.eq.split('→')[0].split('+').length)), prod = rx.sp[reac.length];
      if (reac.length < 2) return this.gen(r);
      const [A, Bq] = reac, nA = r.pick([1, 2, 3, 4]), nB = r.pick([1, 2, 3, 4, 5, 6]);
      const lim = nA / A[1] < nB / Bq[1] ? A : Bq, nP = Math.min(nA / A[1], nB / Bq[1]) * prod[1];
      return { q: T(`依反應式 ${rx.eq}，把 ${nA} mol ${sub(A[0])} 和 ${nB} mol ${sub(Bq[0])} 混合充分反應，最多可生成多少莫耳的 ${sub(prod[0])}？（四捨五入到小數第二位）`, `For ${rx.eq}, ${nA} mol of ${sub(A[0])} and ${nB} mol of ${sub(Bq[0])} react as fully as possible. At most how many moles of ${sub(prod[0])} form? (Round to 2 decimal places.)`),
        ans: ansQty(nP, 2, 'mol'), vars: { nA, nB, ca: A[1], cb: Bq[1], cp: prod[1], ask },
        sol: [T(`把每種反應物的莫耳數除以係數：${sub(A[0])} ${nA} ÷ ${A[1]} = ${num(rnd(nA / A[1], 3))}；${sub(Bq[0])} ${nB} ÷ ${Bq[1]} = ${num(rnd(nB / Bq[1], 3))}。`, `Divide each reactant’s moles by its coefficient: ${sub(A[0])} ${nA} ÷ ${A[1]} = ${num(rnd(nA / A[1], 3))}; ${sub(Bq[0])} ${nB} ÷ ${Bq[1]} = ${num(rnd(nB / Bq[1], 3))}.`),
          T(`比較小的是 ${sub(lim[0])}，它是限量試劑，會先用完。`, `The smaller one is ${sub(lim[0])}: it is the limiting reagent and runs out first.`), T(`生成 ${sub(prod[0])} = ${num(rnd(Math.min(nA / A[1], nB / Bq[1]), 4))} × ${prod[1]} = ${num(rnd(nP, 3))} mol。`, `${sub(prod[0])} formed = ${num(rnd(Math.min(nA / A[1], nB / Bq[1]), 4))} × ${prod[1]} = ${num(rnd(nP, 3))} mol.`)] };
    },
  },
  {
    id: 'g10-molarity', grades: [10, 11], subj: 'chem',
    name: T('體積莫耳濃度與稀釋', 'Molarity and dilution'),
    cur: { tw: TWC('溶液與濃度', 'solutions and concentration'), us: 'NGSS HS-PS1-7' },
    verify: (v) => (v.ask === 'M' ? v.m / v.Mm / (v.V / 1000) : v.ask === 'mass' ? v.C * (v.V / 1000) * v.Mm : (v.C1 * v.V1) / v.V2),
    gen(r) {
      const ask = r.pick(['M', 'mass', 'dil']);
      const [f, zh, en] = r.pick([['NaCl', '氯化鈉', 'sodium chloride'], ['NaOH', '氫氧化鈉', 'sodium hydroxide'], ['C6H12O6', '葡萄糖', 'glucose'], ['KCl', '氯化鉀', 'potassium chloride'], ['CuSO4', '硫酸銅', 'copper(II) sulfate']]), Mm = molar(f);
      const els = Object.keys(parse(f));
      if (ask === 'M') { const n = r.pick([0.05, 0.1, 0.2, 0.25, 0.5]), V = r.pick([100, 200, 250, 500, 1000]), m = rnd(n * Mm, 3);
        return { q: T(`把 ${num(m)} g ${zh}（${sub(f)}）溶於水配成 ${V} mL 溶液，體積莫耳濃度是多少 M？（原子量：${AMtext(els)}；四捨五入到小數第三位）`, `${num(m)} g of ${en} (${sub(f)}) is dissolved to make ${V} mL of solution. What is its molarity in M? (Atomic masses: ${AMtext(els)}; round to 3 decimal places.)`),
          ans: ansQty(n / (V / 1000), 3, 'M'), vars: { m, Mm, V, ask },
          sol: [T(`n = ${num(m)} ÷ ${num(Mm)} = ${num(n)} mol。`, `n = ${num(m)} ÷ ${num(Mm)} = ${num(n)} mol.`), T(`體積換成公升：${V} mL = ${num(V / 1000)} L。`, `Volume in liters: ${V} mL = ${num(V / 1000)} L.`), T(`C = n / V = ${num(n)} ÷ ${num(V / 1000)} = ${num(rnd(n / (V / 1000), 4))} M（mol/L）。`, `C = n / V = ${num(n)} ÷ ${num(V / 1000)} = ${num(rnd(n / (V / 1000), 4))} M (mol/L).`)] }; }
      if (ask === 'mass') { const C = r.pick([0.1, 0.2, 0.5, 1, 2]), V = r.pick([100, 250, 500, 1000]);
        return { q: T(`要配製 ${V} mL、${num(C)} M 的${zh}（${sub(f)}）溶液，需要多少公克${zh}？（原子量：${AMtext(els)}；四捨五入到小數第二位）`, `How many grams of ${en} (${sub(f)}) are needed to make ${V} mL of ${num(C)} M solution? (Atomic masses: ${AMtext(els)}; round to 2 decimal places.)`),
          ans: ansQty(C * (V / 1000) * Mm, 2, 'g'), vars: { C, V, Mm, ask },
          sol: [T(`n = C × V = ${num(C)} × ${num(V / 1000)} = ${num(rnd(C * (V / 1000), 4))} mol。`, `n = C × V = ${num(C)} × ${num(V / 1000)} = ${num(rnd(C * (V / 1000), 4))} mol.`), T(`m = n × M = ${num(rnd(C * (V / 1000), 4))} × ${num(Mm)} ≈ ${num(rnd(C * (V / 1000) * Mm, 3))} g。`, `m = n × M = ${num(rnd(C * (V / 1000), 4))} × ${num(Mm)} ≈ ${num(rnd(C * (V / 1000) * Mm, 3))} g.`)] }; }
      const C1 = r.pick([1, 2, 6, 12]), V1 = r.pick([10, 20, 25, 50]), V2 = r.pick([100, 200, 250, 500]);
      return { q: T(`取 ${V1} mL、${C1} M 的鹽酸，加水稀釋成 ${V2} mL，稀釋後的濃度是多少 M？（四捨五入到小數第三位）`, `${V1} mL of ${C1} M hydrochloric acid is diluted with water to ${V2} mL. What is the new concentration in M? (Round to 3 decimal places.)`),
        ans: ansQty((C1 * V1) / V2, 3, 'M'), vars: { C1, V1, V2, ask },
        sol: [T('稀釋時溶質的莫耳數不變：C₁V₁ = C₂V₂。', 'Dilution keeps the moles of solute the same: C₁V₁ = C₂V₂.'), T(`C₂ = ${C1} × ${V1} ÷ ${V2} = ${num(rnd((C1 * V1) / V2, 4))} M。`, `C₂ = ${C1} × ${V1} ÷ ${V2} = ${num(rnd((C1 * V1) / V2, 4))} M.`)] };
    },
  },
  {
    id: 'g11-ph', grades: [11, 11], subj: 'chem', sim: 'titration',
    name: T('pH 值計算', 'Calculating pH'),
    cur: { tw: TWC('酸鹼反應', 'acid–base reactions'), us: 'NGSS HS-PS1-6' },
    verify: (v) => (v.ask === 'acid' ? -Math.log10(v.c * v.k) : v.ask === 'base' ? 14 + Math.log10(v.c * v.k) : v.ask === 'Hm' ? ((H) => H / 10 ** Math.floor(Math.log10(H)))(10 ** -v.p) : v.p0 + Math.log10(v.fold)),
    gen(r) {
      const ask = r.pick(['acid', 'base', 'H', 'dil']);
      const c = r.pick([0.1, 0.01, 0.001, 0.05, 0.02, 0.005, 0.2]);
      if (ask === 'acid') { const [f, zh, en, k] = r.pick([['HCl', '鹽酸', 'hydrochloric acid', 1], ['HNO3', '硝酸', 'nitric acid', 1], ['H2SO4', '硫酸', 'sulfuric acid', 2]]);
        const H = c * k;
        return { q: T(`25 °C 時，${num(c)} M ${zh}（${sub(f)}）的 pH 是多少？（${k === 2 ? '視為完全解離出 2 個 H⁺；' : ''}四捨五入到小數第二位）`, `At 25 °C, what is the pH of ${num(c)} M ${en} (${sub(f)})? (${k === 2 ? 'Treat it as releasing 2 H⁺ completely; ' : ''}round to 2 decimal places.)`), ans: ansQty(-Math.log10(H), 2), vars: { c, k, ask },
          sol: [T(`強酸完全解離：[H⁺] = ${k === 2 ? `2 × ${num(c)} = ` : ''}${num(H)} M。`, `A strong acid ionizes completely: [H⁺] = ${k === 2 ? `2 × ${num(c)} = ` : ''}${num(H)} M.`), T(`pH = −log[H⁺] = −log(${num(H)}) ≈ ${num(rnd(-Math.log10(H), 2))}。`, `pH = −log[H⁺] = −log(${num(H)}) ≈ ${num(rnd(-Math.log10(H), 2))}.`)] }; }
      if (ask === 'base') { const [f, zh, en, k] = r.pick([['NaOH', '氫氧化鈉', 'sodium hydroxide', 1], ['KOH', '氫氧化鉀', 'potassium hydroxide', 1], ['Ca(OH)2', '氫氧化鈣', 'calcium hydroxide', 2]]);
        const OH = c * k;
        return { q: T(`25 °C 時，${num(c)} M ${zh}（${sub(f)}）溶液的 pH 是多少？（視為完全解離；四捨五入到小數第二位）`, `At 25 °C, what is the pH of ${num(c)} M ${en} (${sub(f)})? (Treat it as fully dissociated; round to 2 decimal places.)`), ans: ansQty(14 + Math.log10(OH), 2), vars: { c, k, ask },
          sol: [T(`[OH⁻] = ${k === 2 ? `2 × ${num(c)} = ` : ''}${num(OH)} M，pOH = −log(${num(OH)}) ≈ ${num(rnd(-Math.log10(OH), 3))}。`, `[OH⁻] = ${k === 2 ? `2 × ${num(c)} = ` : ''}${num(OH)} M, pOH = −log(${num(OH)}) ≈ ${num(rnd(-Math.log10(OH), 3))}.`), T(`25 °C 時 pH + pOH = 14，所以 pH ≈ ${num(rnd(14 + Math.log10(OH), 2))}。`, `At 25 °C pH + pOH = 14, so pH ≈ ${num(rnd(14 + Math.log10(OH), 2))}.`)] }; }
      if (ask === 'H') { const p = r.pick([2, 3, 4, 5, 9, 11, 2.5, 3.5]);
        const H = 10 ** -p, e = Math.floor(Math.log10(H)), a = H / 10 ** e;
        return { q: T(`某溶液 pH = ${num(p)}，[H⁺] 是 a × 10<sup>${num(e)}</sup> M，a 是多少？（四捨五入到小數第二位）`, `A solution has pH ${num(p)}. Its [H⁺] is a × 10<sup>${num(e)}</sup> M. What is a? (Round to 2 decimal places.)`), ans: ansQty(a, 2), vars: { p, ask: 'Hm' },
          sol: [T('[H⁺] = 10<sup>−pH</sup>。', '[H⁺] = 10<sup>−pH</sup>.'), T(`[H⁺] = 10<sup>−${num(p)}</sup> ≈ ${sci(H, 3)} M。`, `[H⁺] = 10<sup>−${num(p)}</sup> ≈ ${sci(H, 3)} M.`)] }; }
      const p0 = r.pick([1, 2, 3]), fold = r.pick([10, 100]);
      return { q: T(`pH = ${p0} 的強酸溶液加水稀釋 ${fold} 倍，pH 變成多少？`, `A strong acid solution at pH ${p0} is diluted ${fold} times with water. What is the new pH?`), ans: ansQty(p0 + Math.log10(fold), 2), vars: { p0, fold, ask: 'dil2' },
        sol: [T(`稀釋 ${fold} 倍，[H⁺] 變成原來的 1/${fold}。`, `Diluting ${fold} times makes [H⁺] 1/${fold} as big.`), T(`每稀釋 10 倍 pH 增加 1，所以 pH = ${p0} + ${Math.log10(fold)} = ${p0 + Math.log10(fold)}。（酸再怎麼稀釋 pH 也不會超過 7。）`, `Each tenfold dilution raises pH by 1, so pH = ${p0} + ${Math.log10(fold)} = ${p0 + Math.log10(fold)}. (Diluting an acid never takes its pH past 7.)`)] };
    },
  },
  {
    id: 'g11-titration', grades: [11, 12], subj: 'chem', sim: 'titration',
    name: T('酸鹼滴定計算', 'Titration calculations'),
    cur: { tw: TWC('酸鹼滴定', 'acid–base titration'), us: 'NGSS HS-PS1-7' },
    verify: (v) => (v.ask === 'Vb' ? (v.Ca * v.Va * v.na) / (v.Cb * v.nb) : (v.Cb * v.Vb * v.nb) / (v.Va * v.na)),
    gen(r) {
      const [af, az, ae, na] = r.pick([['HCl', '鹽酸', 'hydrochloric acid', 1], ['CH3COOH', '醋酸', 'acetic acid', 1], ['H2SO4', '硫酸', 'sulfuric acid', 2]]);
      const [bf, bz, be, nb] = r.pick([['NaOH', '氫氧化鈉', 'sodium hydroxide', 1], ['KOH', '氫氧化鉀', 'potassium hydroxide', 1]]);
      const ask = r.pick(['Vb', 'Ca']);
      const Ca = r.pick([0.05, 0.1, 0.12, 0.2, 0.25]), Va = r.pick([10, 20, 25, 50]), Cb = r.pick([0.1, 0.2, 0.25, 0.5]);
      const Vb = (Ca * Va * na) / (Cb * nb);
      if (ask === 'Vb') return { q: T(`用 ${num(Cb)} M ${bz}滴定 ${Va} mL、${num(Ca)} M 的${az}（${sub(af)}），達到當量點需要多少 mL？（四捨五入到小數第二位）`, `${Va} mL of ${num(Ca)} M ${ae} (${sub(af)}) is titrated with ${num(Cb)} M ${be}. How many mL are needed to reach the equivalence point? (Round to 2 decimal places.)`),
        ans: ansQty(Vb, 2, 'mL'), vars: { Ca, Va, Cb, na, nb, ask },
        sol: [T(`當量點：酸提供的 H⁺ 莫耳數 = 鹼提供的 OH⁻ 莫耳數。${sub(af)} 每個分子可提供 ${na} 個 H⁺。`, `At equivalence, moles of H⁺ from the acid = moles of OH⁻ from the base. Each ${sub(af)} gives ${na} H⁺.`), T(`${num(Ca)} × ${Va} × ${na} = ${num(Cb)} × V<sub>b</sub> × ${nb}。`, `${num(Ca)} × ${Va} × ${na} = ${num(Cb)} × V<sub>b</sub> × ${nb}.`), T(`V<sub>b</sub> = ${num(rnd(Ca * Va * na, 4))} ÷ ${num(Cb * nb)} ≈ ${num(rnd(Vb, 2))} mL。`, `V<sub>b</sub> = ${num(rnd(Ca * Va * na, 4))} ÷ ${num(Cb * nb)} ≈ ${num(rnd(Vb, 2))} mL.`)] };
      const VbU = rnd(Vb, 2);
      return { q: T(`${Va} mL 未知濃度的${az}（${sub(af)}），用 ${num(Cb)} M ${bz}滴定，到當量點用去 ${num(VbU)} mL。${az}的濃度是多少 M？（四捨五入到小數第三位）`, `${Va} mL of ${ae} (${sub(af)}) of unknown concentration needs ${num(VbU)} mL of ${num(Cb)} M ${be} to reach equivalence. What is the acid’s concentration in M? (Round to 3 decimal places.)`),
        ans: ansQty((Cb * VbU * nb) / (Va * na), 3, 'M'), vars: { Cb, Vb: VbU, nb, Va, na, ask },
        sol: [T(`n(OH⁻) = ${num(Cb)} × ${num(VbU)} = ${num(rnd(Cb * VbU, 4))} mmol。`, `n(OH⁻) = ${num(Cb)} × ${num(VbU)} = ${num(rnd(Cb * VbU, 4))} mmol.`), T(`${sub(af)} 提供 ${na} 個 H⁺，所以 n(${sub(af)}) = ${num(rnd(Cb * VbU, 4))} ÷ ${na} = ${num(rnd((Cb * VbU) / na, 4))} mmol。`, `${sub(af)} gives ${na} H⁺, so n(${sub(af)}) = ${num(rnd(Cb * VbU, 4))} ÷ ${na} = ${num(rnd((Cb * VbU) / na, 4))} mmol.`), T(`C = ${num(rnd((Cb * VbU) / na, 4))} ÷ ${Va} ≈ ${num(rnd((Cb * VbU * nb) / (Va * na), 3))} M。`, `C = ${num(rnd((Cb * VbU) / na, 4))} ÷ ${Va} ≈ ${num(rnd((Cb * VbU * nb) / (Va * na), 3))} M.`)] };
    },
  },
  {
    id: 'g11-equilibrium', grades: [11, 12], subj: 'chem', sim: 'equilibrium',
    name: T('化學平衡與勒沙特列原理', 'Equilibrium and Le Chatelier’s principle'),
    cur: { tw: TWC('化學平衡', 'chemical equilibrium'), us: 'NGSS HS-PS1-6' },
    mixed: true,
    verify: (v) => (v.k === 'HI' ? (v.c * v.c) / (v.a * v.b) : (v.c * v.c) / v.a),
    bank: [
      { q: T('對於 N₂(g) + 3H₂(g) ⇌ 2NH₃(g)（放熱），要提高 NH₃ 的平衡產量，可以…', 'For N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (exothermic), to increase the equilibrium yield of NH₃ you could…'), options: [T('增加壓力', 'increase the pressure'), T('升高溫度', 'raise the temperature'), T('加入催化劑', 'add a catalyst')], why: [T('加壓使平衡往氣體分子數少的一邊（右邊，4 → 2）移動；正反應放熱，升溫反而向左；催化劑不改變平衡。', 'Higher pressure favors fewer gas molecules (right side, 4 → 2). The forward reaction is exothermic, so heating shifts it left; a catalyst doesn’t move equilibrium.')] },
      { q: T('對放熱的正反應來說，升高溫度時平衡常數 K…', 'For an exothermic forward reaction, raising the temperature makes K…'), options: [T('變小', 'smaller'), T('變大', 'larger'), T('不變', 'unchanged')], why: [T('升溫使平衡往吸熱方向（逆反應）移動，K 值變小。只有溫度能改變 K。', 'Heating shifts toward the endothermic (reverse) direction, so K decreases. Only temperature changes K.')] },
      { q: T('加入催化劑對化學平衡的影響是…', 'Adding a catalyst to a reaction at equilibrium…'), options: [T('正逆反應速率同時加快，平衡位置不變', 'speeds up both directions equally; the equilibrium position stays the same'), T('平衡向右移動', 'shifts the equilibrium right'), T('K 值變大', 'increases K')], why: [T('催化劑同等降低正、逆反應的活化能，只縮短達到平衡的時間。', 'A catalyst lowers both activation energies equally, so it only shortens the time to reach equilibrium.')] },
      { q: T('Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺（血紅色），加入更多 SCN⁻ 後溶液顏色會…', 'For Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ (blood red), adding more SCN⁻ makes the color…'), options: [T('變深（更紅）', 'deeper red'), T('變淡', 'paler'), T('不變', 'unchanged')], why: [T('增加反應物濃度，平衡向右移動，生成更多紅色的 FeSCN²⁺。', 'More reactant shifts the equilibrium right, making more red FeSCN²⁺.')] },
      { q: T('H₂(g) + I₂(g) ⇌ 2HI(g) 在平衡時壓縮體積，平衡會…', 'For H₂(g) + I₂(g) ⇌ 2HI(g) at equilibrium, compressing the volume…'), options: [T('不移動（兩邊氣體分子數相同）', 'does not shift it (equal gas molecules on each side)'), T('向右移動', 'shifts it right'), T('向左移動', 'shifts it left')], why: [T('兩邊都是 2 個氣體分子，壓力改變不影響平衡位置（但顏色會因濃度增加而變深）。', 'Both sides have 2 gas molecules, so pressure doesn’t shift it (the color still darkens because everything is more concentrated).')] },
      { q: T('反應速率隨溫度升高而加快，主要是因為…', 'Reactions speed up at higher temperature mainly because…'), options: [T('能量超過活化能的有效碰撞比例大增', 'a much larger fraction of collisions have energy above the activation energy'), T('活化能變小', 'the activation energy gets smaller'), T('分子變大', 'molecules get bigger')], why: [T('溫度升高，分子動能分布右移，能越過活化能的分子比例大幅增加。', 'Higher temperature shifts the energy distribution so many more collisions clear the activation energy.')] },
    ],
    gen(r) {
      if (r.chance(0.5)) return pickItem(r, this.bank);
      if (r.chance(0.5)) { const a = r.pick([0.1, 0.2, 0.4, 0.5]), b = r.pick([0.1, 0.2, 0.25, 0.5]), c = r.pick([0.4, 0.8, 1, 1.2, 1.5]);
        return { q: T(`H₂(g) + I₂(g) ⇌ 2HI(g) 達平衡時，[H₂] = ${num(a)} M、[I₂] = ${num(b)} M、[HI] = ${num(c)} M。平衡常數 K<sub>c</sub> 是多少？（四捨五入到小數第二位）`, `For H₂(g) + I₂(g) ⇌ 2HI(g) at equilibrium, [H₂] = ${num(a)} M, [I₂] = ${num(b)} M and [HI] = ${num(c)} M. What is K<sub>c</sub>? (Round to 2 decimal places.)`),
          ans: ansQty((c * c) / (a * b), 2), vars: { a, b, c, k: 'HI' },
          sol: [T('K<sub>c</sub> = [產物]^係數 ÷ [反應物]^係數 = [HI]² / ([H₂][I₂])。', 'K<sub>c</sub> = [products]^coefficients ÷ [reactants]^coefficients = [HI]² / ([H₂][I₂]).'), T(`= ${num(c)}² ÷ (${num(a)} × ${num(b)}) = ${num(rnd(c * c, 4))} ÷ ${num(rnd(a * b, 4))} ≈ ${num(rnd((c * c) / (a * b), 3))}。`, `= ${num(c)}² ÷ (${num(a)} × ${num(b)}) = ${num(rnd(c * c, 4))} ÷ ${num(rnd(a * b, 4))} ≈ ${num(rnd((c * c) / (a * b), 3))}.`)] }; }
      const a = r.pick([0.02, 0.04, 0.05, 0.1]), c = r.pick([0.01, 0.02, 0.03, 0.05]);
      return { q: T(`N₂O₄(g) ⇌ 2NO₂(g) 達平衡時，[N₂O₄] = ${num(a)} M、[NO₂] = ${num(c)} M。K<sub>c</sub> 是多少？（四捨五入到小數第四位）`, `For N₂O₄(g) ⇌ 2NO₂(g) at equilibrium, [N₂O₄] = ${num(a)} M and [NO₂] = ${num(c)} M. What is K<sub>c</sub>? (Round to 4 decimal places.)`),
        ans: ansQty((c * c) / a, 4), vars: { a, c, k: 'NO2' },
        sol: [T('K<sub>c</sub> = [NO₂]² / [N₂O₄]（係數 2 變成次方）。', 'K<sub>c</sub> = [NO₂]² / [N₂O₄] (the coefficient 2 becomes a power).'), T(`= ${num(c)}² ÷ ${num(a)} = ${num(rnd(c * c, 6))} ÷ ${num(a)} = ${num(rnd((c * c) / a, 5))}。`, `= ${num(c)}² ÷ ${num(a)} = ${num(rnd(c * c, 6))} ÷ ${num(a)} = ${num(rnd((c * c) / a, 5))}.`)] };
    },
  },
  {
    id: 'g10-dna', grades: [10, 12], subj: 'bio', sim: 'dna-protein',
    name: T('DNA、RNA 與蛋白質合成', 'DNA, RNA and protein synthesis'),
    cur: { tw: TWB('遺傳物質與基因表現', 'genetic material and gene expression'), us: 'NGSS HS-LS1-1' },
    gen(r) {
      const bases = 'ATGC', comp = { A: 'T', T: 'A', G: 'C', C: 'G' };
      const ask = r.pick(['comp', 'mrna', 'aa', 'count']);
      const randSeq = (n) => Array.from({ length: n }, () => r.pick([...bases])).join('');
      if (ask === 'comp') { const s = randSeq(8), c = [...s].map((b) => comp[b]).join('');
        const w1 = [...s].map((b) => ({ A: 'U', T: 'A', G: 'C', C: 'G' })[b]).join(''), w2 = s.split('').reverse().join(''), w3 = [...s].map((b) => ({ A: 'G', G: 'A', T: 'C', C: 'T' })[b]).join('');
        return { q: T(`DNA 一股的序列是 5'-${s}-3'，和它配對的另一股（由 3' 寫到 5'）是？`, `One DNA strand reads 5'-${s}-3'. What is the paired strand, written 3' to 5'?`),
          ans: ansChoice([`3'-${c}-5'`, ...[...new Set([w1, w2, w3])].filter((x) => x !== c).map((x) => `3'-${x}-5'`)]),
          sol: [T('DNA 鹼基配對：A 配 T、G 配 C；兩股方向相反。', 'DNA pairs A with T and G with C; the strands run in opposite directions.'), T(`逐一配對 ${s} → ${c}。`, `Pair each base: ${s} → ${c}.`)] }; }
      if (ask === 'mrna') { const s = randSeq(9), m = [...s].map((b) => ({ A: 'U', T: 'A', G: 'C', C: 'G' })[b]).join('');
        const w1 = s.replace(/T/g, 'U'), w2 = [...s].map((b) => comp[b]).join(''), w3 = m.split('').reverse().join('');
        return { q: T(`以 DNA 模板股 3'-${s}-5' 轉錄，得到的 mRNA（由 5' 寫到 3'）是？`, `Transcribing the DNA template strand 3'-${s}-5', what mRNA is made (written 5' to 3')?`),
          ans: ansChoice([`5'-${m}-3'`, ...[...new Set([w1, w2, w3])].filter((x) => x !== m).map((x) => `5'-${x}-3'`)]),
          sol: [T('轉錄時 RNA 和模板股互補：A→U、T→A、G→C、C→G（RNA 用 U 代替 T）。', 'In transcription RNA pairs with the template: A→U, T→A, G→C, C→G (RNA uses U instead of T).'), T(`${s} → ${m}。`, `${s} → ${m}.`)] }; }
      if (ask === 'aa') {
        const pool = Object.keys(COD).filter((c) => COD[c] !== '*' && c !== 'AUG');
        const cods = ['AUG', r.pick(pool), r.pick(pool), r.pick(['UAA', 'UAG', 'UGA'])], mr = cods.join('');
        const right = cods.slice(0, 3).map((c) => NAME3[COD[c]]).join('-');
        const shift = mr.slice(1) + 'A', wrong1 = [0, 3, 6].map((i) => NAME3[COD[shift.slice(i, i + 3)]]).join('-');
        const decoys = r.sample(pool.filter((c) => !cods.includes(c)), 3);
        const table = [...new Set([...cods, ...decoys])].sort().map((c) => `${c} = ${NAME3[COD[c]]}`).join('，');
        const wrong2 = [cods[0], decoys[0], cods[2]].map((c) => NAME3[COD[c]]).join('-'), wrong3 = cods.slice(0, 4).map((c) => NAME3[COD[c]]).join('-').replace('-Stop', '-Stop');
        const opts = [...new Set([right, wrong1, wrong2, cods.slice(1, 3).map((c) => NAME3[COD[c]]).join('-'), wrong3])].slice(0, 4);
        return { q: T(`mRNA 序列 5'-${mr}-3' 會轉譯出哪一段胺基酸？（參考：${table}）`, `Which amino-acid chain is translated from the mRNA 5'-${mr}-3'? (Use: ${table.replace(/，/g, ', ')})`),
          ans: ansChoice(opts),
          sol: [T('從起始密碼子 AUG 開始，每三個鹼基讀一個密碼子，遇到終止密碼子停止。', 'Start at the start codon AUG, read three bases per codon, and stop at the stop codon.'), T(`${cods.join(' | ')} → ${cods.map((c) => NAME3[COD[c]]).join(' - ')}，所以是 ${right}（終止密碼子不對應胺基酸）。`, `${cods.join(' | ')} → ${cods.map((c) => NAME3[COD[c]]).join(' - ')}, so ${right} (stop codons add no amino acid).`)] };
      }
      const n = r.pick([60, 90, 150, 300, 450]);
      return { q: T(`一段 mRNA 的編碼區（從起始密碼子到終止密碼子，含終止密碼子）共有 ${n} 個核苷酸，轉譯出的多肽鏈有幾個胺基酸？`, `An mRNA coding region (from the start codon through the stop codon, inclusive) has ${n} nucleotides. How many amino acids are in the polypeptide?`),
        ans: ansQty(n / 3 - 1, 0), sol: [T('三個核苷酸組成一個密碼子。', 'Three nucleotides make one codon.'), T(`${n} ÷ 3 = ${n / 3} 個密碼子；最後一個是終止密碼子，不對應胺基酸。`, `${n} ÷ 3 = ${n / 3} codons; the last is the stop codon, which adds no amino acid.`), T(`胺基酸數 = ${n / 3} − 1 = ${n / 3 - 1}。`, `Amino acids = ${n / 3} − 1 = ${n / 3 - 1}.`)] };
    },
  },
  {
    id: 'g11-genetics', grades: [10, 12], subj: 'bio', sim: 'punnett',
    name: T('遺傳學：雙性狀、性聯遺傳與族群', 'Genetics: dihybrids, sex-linkage and populations'),
    cur: { tw: TWB('遺傳', 'heredity'), us: 'NGSS HS-LS3-3' },
    verify: (v) => (v.ask === 'hw2pq' ? 2 * Math.sqrt(v.q2) * (1 - Math.sqrt(v.q2)) : v.ask === 'hwq' ? Math.sqrt(v.q2) : v.x),
    gen(r) {
      const ask = r.pick(['di', 'di', 'test', 'xlink', 'hwq', 'hw2pq']);
      const FR = (n, d) => { const g = (a, b) => (b ? g(b, a % b) : a), k = g(n, d); return `${n / k}/${d / k}`; };
      const choice = (right, pool) => ansChoice([right, ...pool.filter((x) => x !== right).slice(0, 3)]);
      if (ask === 'di') { const which = r.pick([['兩個顯性', 'both dominant traits', 9], ['第一個顯性、第二個隱性', 'the first dominant and the second recessive', 3], ['兩個隱性', 'both recessive traits', 1]]);
        return { q: T(`豌豆的種子顏色（黃 Y 對綠 y 為顯性）和形狀（圓 R 對皺 r 為顯性）位於不同染色體上。YyRr × YyRr，子代表現${which[0]}性狀的機率是多少？`, `In peas, seed color (yellow Y over green y) and shape (round R over wrinkled r) are on different chromosomes. For YyRr × YyRr, what is the probability an offspring shows ${which[1]}?`),
          ans: choice(FR(which[2], 16), ['9/16', '3/16', '1/16', '1/4', '3/4', '1/2']),
          sol: [T('兩對基因獨立分配，可以分開算再相乘。', 'The two genes assort independently, so work them out separately and multiply.'), T('每一對 Aa × Aa：顯性 3/4、隱性 1/4。', 'Each Aa × Aa gives dominant 3/4 and recessive 1/4.'), T(`${which[2] === 9 ? '3/4 × 3/4 = 9/16' : which[2] === 3 ? '3/4 × 1/4 = 3/16' : '1/4 × 1/4 = 1/16'}（9 : 3 : 3 : 1）。`, `${which[2] === 9 ? '3/4 × 3/4 = 9/16' : which[2] === 3 ? '3/4 × 1/4 = 3/16' : '1/4 × 1/4 = 1/16'} (the 9 : 3 : 3 : 1 ratio).`)] }; }
      if (ask === 'test') return { q: T('基因型 AaBb（兩對基因獨立分配）和 aabb 試交，子代表現型的比例是？', 'An AaBb individual (genes assort independently) is test-crossed with aabb. What is the phenotype ratio of the offspring?'),
        ans: ansChoice(['1 : 1 : 1 : 1', '9 : 3 : 3 : 1', '3 : 1', '1 : 2 : 1']),
        sol: [T('AaBb 產生 AB、Ab、aB、ab 四種配子，各 1/4；aabb 只產生 ab。', 'AaBb makes four gametes — AB, Ab, aB, ab — each 1/4; aabb only makes ab.'), T('所以子代 AaBb、Aabb、aaBb、aabb 各 1/4，表現型 1 : 1 : 1 : 1。', 'So the offspring AaBb, Aabb, aaBb and aabb each appear 1/4 of the time: 1 : 1 : 1 : 1.')] };
      if (ask === 'xlink') { const q = r.pick([['兒子是色盲', 'a son is color-blind', '1/2'], ['所有子女中出現色盲', 'any child is color-blind', '1/4'], ['女兒是色盲', 'a daughter is color-blind', '0']]);
        return { q: T(`紅綠色盲是 X 染色體上的隱性遺傳。母親是攜帶者（XᴮXᵇ），父親正常（XᴮY）。${q[0]}的機率是多少？`, `Red–green color blindness is X-linked recessive. The mother is a carrier (XᴮXᵇ) and the father is unaffected (XᴮY). What is the probability that ${q[1]}?`),
          ans: choice(q[2], ['1/2', '1/4', '0', '1', '3/4']),
          sol: [T('兒子的 X 來自母親（Y 來自父親）；女兒從父親得到 Xᴮ。', 'A son gets his X from his mother (and Y from his father); a daughter always gets Xᴮ from this father.'), T('兒子：XᴮY 或 XᵇY 各 1/2 → 兒子色盲 1/2。女兒：XᴮXᴮ 或 XᴮXᵇ，都不會色盲。', 'Sons: XᴮY or XᵇY, 1/2 each → 1/2 of sons are color-blind. Daughters: XᴮXᴮ or XᴮXᵇ — none are color-blind.'), T('所有子女中：女兒 1/2 × 0 + 兒子 1/2 × 1/2 = 1/4。', 'Among all children: 1/2 × 0 + 1/2 × 1/2 = 1/4.')] }; }
      const q = r.pick([0.1, 0.2, 0.3, 0.4, 0.05]), q2 = rnd(q * q, 4);
      if (ask === 'hwq') return { q: T(`某族群處於哈溫平衡，隱性表現型（aa）占 ${num(rnd(q2 * 100, 2))}%。隱性基因 a 的頻率 q 是多少？（四捨五入到小數第二位）`, `A population is in Hardy–Weinberg equilibrium and ${num(rnd(q2 * 100, 2))}% show the recessive phenotype (aa). What is the frequency q of allele a? (Round to 2 decimal places.)`),
        ans: ansQty(q, 2), vars: { q2, ask },
        sol: [T('哈溫平衡：aa 的頻率 = q²。', 'Hardy–Weinberg: frequency of aa = q².'), T(`q² = ${num(q2)}，q = √${num(q2)} = ${num(q)}。`, `q² = ${num(q2)}, so q = √${num(q2)} = ${num(q)}.`)] };
      return { q: T(`某族群處於哈溫平衡，隱性表現型（aa）占 ${num(rnd(q2 * 100, 2))}%。帶有 a 但表現正常的攜帶者（Aa）占族群的比例是多少？（以小數表示，四捨五入到小數第二位）`, `A population is in Hardy–Weinberg equilibrium and ${num(rnd(q2 * 100, 2))}% are aa. What fraction of the population are carriers (Aa)? (Give a decimal, rounded to 2 places.)`),
        ans: ansQty(2 * q * (1 - q), 2), vars: { q2, ask },
        sol: [T(`q = √${num(q2)} = ${num(q)}，p = 1 − q = ${num(rnd(1 - q, 2))}。`, `q = √${num(q2)} = ${num(q)}, p = 1 − q = ${num(rnd(1 - q, 2))}.`), T(`攜帶者 Aa = 2pq = 2 × ${num(rnd(1 - q, 2))} × ${num(q)} = ${num(rnd(2 * q * (1 - q), 4))}。`, `Carriers Aa = 2pq = 2 × ${num(rnd(1 - q, 2))} × ${num(q)} = ${num(rnd(2 * q * (1 - q), 4))}.`)] };
    },
  },
  {
    id: 'g10-evolution', grades: [10, 12], subj: 'bio', sim: 'natural-selection',
    name: T('演化與天擇', 'Evolution and natural selection'),
    cur: { tw: TWB('演化', 'evolution'), us: 'NGSS HS-LS4-4' },
    bank: [
      { q: T('天擇作用的直接對象是…', 'Natural selection acts directly on…'), options: [T('個體的表現型', 'individuals’ phenotypes'), T('單一個基因', 'single genes'), T('整個物種的意願', 'what the species wants')], why: [T('環境「篩選」的是看得到的特徵（表現型），結果使族群的基因頻率改變。', 'The environment selects visible traits (phenotypes), and the result is a change in the population’s allele frequencies.')] },
      { q: T('細菌在使用抗生素後出現抗藥性，最好的解釋是…', 'Bacteria become antibiotic-resistant mainly because…'), options: [T('原本就有少數抗藥的個體存活並大量繁殖', 'a few already-resistant bacteria survived and multiplied'), T('細菌為了活下去而主動改變基因', 'the bacteria changed their genes on purpose to survive'), T('抗生素把細菌變強壯了', 'the antibiotic made each bacterium stronger')], why: [T('變異是隨機產生的；抗生素殺死不抗藥的細菌，剩下的抗藥細菌繁殖，抗藥基因頻率上升。', 'Variation arises randomly; the antibiotic kills the non-resistant bacteria and the resistant ones multiply, so resistance becomes common.')] },
      { q: T('長頸鹿的脖子變長，用達爾文的天擇說解釋是…', 'In Darwin’s view, giraffes have long necks because…'), options: [T('脖子較長的個體較能吃到高處的葉子，存活繁殖較多', 'longer-necked individuals reached more leaves and left more offspring'), T('長頸鹿一直伸長脖子，所以下一代脖子變長', 'giraffes kept stretching their necks and passed that on'), T('長頸鹿想要長脖子', 'giraffes wanted long necks')], why: [T('「用進廢退、獲得性遺傳」是拉馬克的說法；天擇說認為族群中本來就有變異，有利的變異被保留。', 'Stretching and passing it on is Lamarck’s idea. Darwin: variation already exists, and helpful variations are kept by selection.')] },
      { q: T('鳥的翅膀和昆蟲的翅膀功能相同但構造來源不同，這叫做…', 'Bird wings and insect wings do the same job but have different origins. They are…'), options: [T('同功器官', 'analogous structures'), T('同源器官', 'homologous structures'), T('退化器官', 'vestigial structures')], why: [T('功能相似但來源不同是同功器官（例如鳥翅和昆蟲翅）；同源器官是來源相同、功能可能不同（例如人的手和鯨的鰭）。', 'Similar function, different origin = analogous (bird vs insect wings). Homologous structures share an origin but may differ in function (human arm, whale flipper).')] },
      { q: T('下列哪一個是演化的證據？', 'Which of these is evidence for evolution?'), options: [T('以上皆是', 'All of these'), T('化石紀錄', 'The fossil record'), T('同源器官', 'Homologous structures'), T('DNA 序列的相似程度', 'Similarities in DNA sequences')], why: [T('化石、比較解剖學（同源器官）、胚胎發育和分子生物學（DNA、蛋白質序列）都是演化的證據。', 'Fossils, comparative anatomy (homologous structures), embryos and molecular evidence (DNA and protein sequences) all support evolution.')] },
      { q: T('兩個族群因為地理隔離太久，即使再相遇也無法交配產生有生殖能力的後代，這表示…', 'Two populations separated by geography for a long time can no longer produce fertile offspring together. This means…'), options: [T('形成了新的物種', 'new species have formed'), T('它們是同一物種', 'they are still one species'), T('它們的基因完全相同', 'their genes are identical')], why: [T('生殖隔離是新物種形成的關鍵，地理隔離常是它的起點。', 'Reproductive isolation marks new species, and geographic isolation often starts it.')] },
      { q: T('族群中基因頻率隨機改變，在小族群特別明顯，這叫做…', 'Random changes in allele frequency, strongest in small populations, are called…'), options: [T('遺傳漂變', 'genetic drift'), T('天擇', 'natural selection'), T('基因流動', 'gene flow')], why: [T('遺傳漂變是機會造成的，和適應無關；族群愈小，影響愈大。', 'Genetic drift is change by chance, not adaptation; the smaller the population, the bigger the effect.')] },
      { q: T('突變對演化的意義是…', 'Why do mutations matter for evolution?'), options: [T('提供新的遺傳變異，是天擇的原料', 'They supply new genetic variation for selection to act on'), T('一定對生物有害', 'They are always harmful'), T('會讓生物自動適應環境', 'They automatically adapt organisms to the environment')], why: [T('突變大多中性或有害，少數有利；它們是新變異的來源，天擇再決定哪些被保留。', 'Most mutations are neutral or harmful and a few help; they are the source of new variation, and selection decides what stays.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
  {
    id: 'g10-earth-space', grades: [10, 12], subj: 'earth',
    name: T('高中地球科學：地球與宇宙', 'Senior high earth & space science'),
    cur: { tw: T('高中 地球科學 地球與宇宙', 'Senior high earth science · Earth and the universe'), us: 'NGSS HS-ESS1-1' },
    bank: [
      { q: T('太陽的能量來自…', 'Where does the Sun’s energy come from?'), options: [T('核心的氫核融合成氦', 'Hydrogen fusing into helium in its core'), T('燃燒煤炭', 'Burning coal'), T('核分裂', 'Nuclear fission')], why: [T('太陽核心高溫高壓，氫原子核融合成氦，損失的質量轉變成能量（E = mc²）。', 'In the hot, dense core, hydrogen nuclei fuse into helium and the lost mass becomes energy (E = mc²).')] },
      { q: T('遙遠星系的光譜大多出現「紅移」，表示…', 'Light from distant galaxies is mostly red-shifted. This shows that…'), options: [T('星系正在遠離我們，宇宙在膨脹', 'galaxies are moving away — the universe is expanding'), T('星系正在靠近我們', 'galaxies are coming toward us'), T('星系的溫度很低', 'galaxies are cold')], why: [T('哈伯發現愈遠的星系退行速度愈快（哈伯定律），是宇宙膨脹和大霹靂理論的重要證據。', 'Hubble found that farther galaxies recede faster (Hubble’s law) — key evidence for the expanding universe and the Big Bang.')] },
      { q: T('恆星表面溫度愈高，顏色愈偏向…', 'The hotter a star’s surface, the more its color leans toward…'), options: [T('藍白色', 'blue-white'), T('紅色', 'red'), T('黃色', 'yellow')], why: [T('溫度愈高，輻射最強的波長愈短（韋恩定律），所以高溫恆星偏藍、低溫恆星偏紅。', 'Hotter objects emit most strongly at shorter wavelengths (Wien’s law), so hot stars look blue and cool stars red.')] },
      { q: T('地球內部分層中，唯一是液態的是…', 'Which layer inside Earth is liquid?'), options: [T('外核', 'The outer core'), T('內核', 'The inner core'), T('地殼', 'The crust')], why: [T('S 波無法通過液體，S 波在外核消失，證明外核是液態；內核因壓力極大而是固態。', 'S waves can’t pass through liquid and vanish at the outer core, showing it is liquid; the inner core is solid under huge pressure.')] },
      { q: T('聖嬰現象發生時，東太平洋赤道附近的海水溫度…', 'During El Niño, sea temperatures in the eastern equatorial Pacific are…'), options: [T('異常偏高', 'unusually warm'), T('異常偏低', 'unusually cold'), T('沒有變化', 'unchanged')], why: [T('聖嬰時東太平洋湧升流減弱，海溫偏高，影響全球天氣；反聖嬰則偏低。', 'In El Niño, upwelling in the eastern Pacific weakens and the water warms, affecting weather worldwide; La Niña is the cold opposite.')] },
      { q: T('大氣中二氧化碳濃度的長期增加，主要來自…', 'The long-term rise of carbon dioxide in the air comes mainly from…'), options: [T('燃燒化石燃料和砍伐森林', 'burning fossil fuels and cutting forests'), T('火山爆發變多', 'more volcanic eruptions'), T('海洋蒸發', 'ocean evaporation')], why: [T('工業革命以來人類燃燒煤、石油、天然氣，二氧化碳濃度從約 280 ppm 增加到超過 420 ppm。', 'Since the industrial revolution, burning coal, oil and gas has raised CO₂ from about 280 ppm to over 420 ppm.')] },
      { q: T('相對年代中，「切穿其他岩層的岩脈比被切穿的岩層年輕」，這是…', '“A dike that cuts across rock layers is younger than the layers it cuts.” This is the principle of…'), options: [T('截切定律', 'cross-cutting relationships'), T('疊置定律', 'superposition'), T('化石層序', 'faunal succession')], why: [T('被切穿的岩層必須先存在，所以切穿它的岩脈或斷層比較年輕。', 'The layers had to exist before something could cut through them, so the cutting feature is younger.')] },
      { q: T('光年是什麼單位？', 'What does a light-year measure?'), options: [T('距離：光一年走的距離', 'Distance — how far light travels in a year'), T('時間：一年', 'Time — one year'), T('亮度', 'Brightness')], why: [T('1 光年 ≈ 9.46 × 10¹² 公里，是光在真空中一年行進的距離。', '1 light-year ≈ 9.46 × 10¹² km, the distance light travels in a year.')] },
    ],
    gen(r) { return pickItem(r, this.bank); },
  },
];

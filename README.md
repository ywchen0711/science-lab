# 自然科學實驗室 Science Lab

**Play:** https://ywchen0711.github.io/science-lab/

Interactive science for grades 1–12 in Traditional Chinese and English, following Taiwan's 108 curriculum (自然科學領域)
and the US NGSS. 一到十二年級的互動自然科學模擬實驗與練習，中英雙語。

- **38 simulations** (canvas, vanilla JS) with sliders, buttons and drag interactions: magnets, floating and sinking,
  shadows, states of water, plant needs, circuits, levers, moon phases, soil, life cycles, pendulum, light
  reflection/refraction, food webs, seasons, water cycle, dissolving, density and buoyancy, motion graphs, Newton's cart,
  heat, pH indicators, equation balancing, electromagnets, microscope, Punnett squares, predator–prey, plate tectonics,
  earthquakes, projectiles, DC circuits, ideal gas, orbits, waves and interference, half-life, natural selection,
  titration, equilibrium, DNA → protein.
- Every simulation has a short bilingual intro and 3–4 guided **“Try this → what did you notice?”** questions with
  explanations. Every simulation's physics/chemistry lives in a `model` that is checked headlessly by the tests.
- **82 practice units** with generated questions (random values for density, speed, F = ma, Ohm's law, v = fλ, moles,
  stoichiometry, pH, half-life, gas laws …) and reviewed concept banks. Every answer has a step-by-step explanation;
  two tries, then the explanation. Typed answers accept units (`12 m/s`) and scientific notation (`3e8`, `3×10^8`).
- Grade pages, a 10-question mixed quiz per grade, printable worksheets with an answer key.
- Progress in localStorage (`sl-` keys) and the shared Learning Hub log (`kl:sciencelab`).

## Files
```
index.html, style.css
js/app.js            pages: home, grade, all simulations, simulation, practice, quiz, worksheet
js/kit.js            simulation kit: canvas, sliders, segments, toggles, readouts, animation loop, drawing helpers
js/util.js           random numbers, bilingual text, answer builders (ansQty for quantities with units)
js/check.js          typed-answer checker (fractions, units, scientific notation)
js/learnlog.js       shared progress log for the Learning Hub
js/sims/g*.js        simulations by grade band (g12, g34, g56, g79p, g79l, g1012p, g1012c)
js/bank/g*.js        practice units by grade band
SPEC.md              how to write a simulation or a unit
test/run.mjs         node test/run.mjs — runs every sim's model checks and draws 300 questions per unit
.probe/              browser probe (mounts every sim, moves every control) and screenshot tools
```

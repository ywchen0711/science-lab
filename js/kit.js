// The simulation kit. The app calls sim.mount(k) with a kit bound to one sim page; the sim builds its picture and
// controls with these helpers. Everything created here is cleaned up by k.destroy() when the page changes.
//
//   const v = k.canvas(640, 360)          → { cv, ctx, W, H }  a canvas with a fixed logical size (scales to the page)
//   k.slider({ label, min, max, step, value, unit, dp, onInput }) → { value, set(v), el }
//   k.seg({ label, options: [{ v, label }], value, onChange }) → { value, set(v) }   segmented buttons (pick one)
//   k.toggle({ label, value, onChange }) → { value, set(v) }                          an on/off switch
//   k.buttons([{ label, on, primary }]) → row element
//   k.readout() → { set(html) }                                                        a box for live numbers
//   k.loop((dt, t) => …)  → { stop(), start(), running }                               animation (dt in seconds, ≤ 0.05)
//   k.pointer(cv, { down(p), move(p, isDown), up(p) })   p = {x, y} in logical canvas units; works with mouse + touch
//   k.colors() → theme colors (ink, muted, line, soft, card, bg, acc, acc2, ok, no) — call each frame (dark mode)
//   k.L(zh, en), k.X(T), k.lang, k.fmt(x, dp) (real minus sign), k.on(target, event, fn), k.onDestroy(fn)
//   k.done()  call when the child completes a meaningful run (optional; the app also logs when questions are done)
// Canvas drawing helpers (plain functions, also on k): arrow, text, circle, rrect, line, axes, plotLine.
import { tx } from './util.js';

export const fmt = (x, dp = 2) => {
  if (!Number.isFinite(x)) return '—';
  const s = (+x.toFixed(dp)).toString();
  return s.startsWith('-') ? '−' + s.slice(1) : s;
};

export function kit(root, lang, hooks = {}) {
  const offs = [], loops = [];
  let dead = false;
  const L = (zh, en) => (lang === 'zh' ? zh : en);
  const X = (x) => tx(x, lang);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const stage = el('div', 'stage'), panel = el('div', 'panel');
  root.append(stage, panel);
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); };
  const lab = (x) => (x == null ? '' : typeof x === 'string' ? x : X(x));

  const k = {
    lang, L, X, fmt, root, stage, panel, el, on,
    onDestroy: (fn) => offs.push(fn),
    done: (score) => hooks.done?.(score),
    canvas(W, H, where = stage) {
      const cv = el('canvas', 'simcv');
      cv.style.aspectRatio = `${W} / ${H}`;
      where.append(cv);
      const ctx = cv.getContext('2d');
      const fit = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2), cssW = cv.clientWidth || W;
        const s = (cssW / W) * dpr;
        cv.width = Math.round(W * s); cv.height = Math.round(H * s);
        ctx.setTransform(s, 0, 0, s, 0, 0);
        v.redraw?.();
      };
      const v = { cv, ctx, W, H, redraw: null };
      fit();
      if (window.ResizeObserver) { const ro = new ResizeObserver(fit); ro.observe(cv); offs.push(() => ro.disconnect()); }
      return v;
    },
    pointer(cv, h) {
      let down = false;
      const pos = (e) => { const r = cv.getBoundingClientRect(), W = +cv.style.aspectRatio.split('/')[0]; const s = W / r.width; return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s }; };
      on(cv, 'pointerdown', (e) => { down = true; cv.setPointerCapture?.(e.pointerId); h.down?.(pos(e), e); e.preventDefault(); });
      on(cv, 'pointermove', (e) => h.move?.(pos(e), down, e));
      on(cv, 'pointerup', (e) => { down = false; h.up?.(pos(e), e); });
      on(cv, 'pointercancel', () => { down = false; });
      cv.style.touchAction = h.scroll ? 'pan-y' : 'none';
    },
    slider({ label, min, max, step = 1, value, unit = '', dp, onInput }, where = panel) {
      const w = el('label', 'ctl sl');
      const d = dp ?? Math.max(0, (String(step).split('.')[1] || '').length);
      w.innerHTML = `<span class="cl">${lab(label)}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output></output>`;
      const inp = w.querySelector('input'), out = w.querySelector('output');
      const show = () => (out.innerHTML = `${fmt(+inp.value, d)}${unit ? ' ' + lab(unit) : ''}`);
      on(inp, 'input', () => { show(); onInput?.(+inp.value); });
      show(); where.append(w);
      return { el: w, get value() { return +inp.value; }, set(x) { inp.value = x; show(); onInput?.(+inp.value); } };
    },
    seg({ label, options, value, onChange }, where = panel) {
      const w = el('div', 'ctl seg');
      w.innerHTML = (label ? `<span class="cl">${lab(label)}</span>` : '') + `<span class="segs">${options.map((o, i) => `<button type="button" data-i="${i}">${lab(o.label)}</button>`).join('')}</span>`;
      let cur = value;
      const btns = [...w.querySelectorAll('button')];
      const paint = () => btns.forEach((b, i) => b.classList.toggle('on', options[i].v === cur));
      btns.forEach((b, i) => on(b, 'click', () => { cur = options[i].v; paint(); onChange?.(cur); }));
      paint(); where.append(w);
      return { el: w, get value() { return cur; }, set(x) { cur = x; paint(); onChange?.(cur); } };
    },
    toggle({ label, value = false, onChange }, where = panel) {
      const w = el('label', 'ctl tg');
      w.innerHTML = `<input type="checkbox" ${value ? 'checked' : ''}><span class="sw"></span><span class="cl">${lab(label)}</span>`;
      const inp = w.querySelector('input');
      on(inp, 'change', () => onChange?.(inp.checked));
      where.append(w);
      return { el: w, get value() { return inp.checked; }, set(x) { inp.checked = !!x; onChange?.(inp.checked); } };
    },
    buttons(list, where = panel) {
      const w = el('div', 'ctl btns');
      for (const b of list) {
        const e = el('button', 'btn' + (b.primary ? '' : ' ghost'), lab(b.label)); e.type = 'button';
        on(e, 'click', () => b.on?.(e)); w.append(e); b.el = e;
      }
      where.append(w);
      return w;
    },
    readout(where = panel) {
      const w = el('div', 'readout'); where.append(w);
      return { el: w, set(html) { w.innerHTML = html; } };
    },
    note(html, where = panel) { const w = el('p', 'snote', html); where.append(w); return w; },
    loop(fn) {
      let id = 0, last = 0;
      const lp = {
        running: false,
        start() { if (lp.running || dead) return; lp.running = true; last = 0; id = requestAnimationFrame(tick); },
        stop() { lp.running = false; cancelAnimationFrame(id); },
      };
      const tick = (now) => {
        if (!lp.running || dead) return;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now;
        try { fn(dt, now / 1000); } catch (e) { lp.stop(); hooks.error?.(e); throw e; }
        id = requestAnimationFrame(tick);
      };
      loops.push(lp); lp.start();
      return lp;
    },
    colors() {
      const cs = getComputedStyle(document.documentElement), g = (n) => cs.getPropertyValue('--' + n).trim();
      return { ink: g('ink'), muted: g('muted'), line: g('line'), soft: g('soft'), card: g('card'), bg: g('bg'), acc: g('acc'), acc2: g('acc2'), ok: g('ok'), no: g('no'), dark: g('dark') === '1' };
    },
    destroy() { dead = true; loops.forEach((l) => l.stop()); offs.forEach((f) => { try { f(); } catch {} }); },
    arrow, text, circle, rrect, line, axes, plotLine,
  };
  return k;
}

// ---- canvas drawing helpers ----
export function line(ctx, x1, y1, x2, y2, color, w = 2, dash) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
export function arrow(ctx, x1, y1, x2, y2, color, w = 3, head = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return;
  const h = Math.min(head, len * 0.6);
  ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * h * 0.8, y2 - Math.sin(a) * h * 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45));
  ctx.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
// text(ctx, 'hi', x, y, { color, size, align, base, bold, font })
export function text(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.fillStyle = o.color || '#000';
  ctx.font = `${o.bold ? '700 ' : ''}${o.size || 14}px ${o.font || 'system-ui, "Microsoft JhengHei", "PingFang TC", sans-serif'}`;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
  ctx.fillText(s, x, y); ctx.restore();
}
export function circle(ctx, x, y, r, fill, stroke, w = 1.5) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
}
export function rrect(ctx, x, y, w, h, r, fill, stroke, lw = 1.5) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
// axes(ctx, box, opts) draws a graph frame and returns { X(x), Y(y) } mapping data → canvas.
//   box = { x, y, w, h } on the canvas; opts = { xmin, xmax, ymin, ymax, xlabel, ylabel, xticks, yticks, c (colors), dp }
export function axes(ctx, box, o) {
  const c = o.c || {}, ink = c.ink || '#222', grid = c.line || '#ddd', muted = c.muted || '#666';
  const X = (x) => box.x + ((x - o.xmin) / (o.xmax - o.xmin)) * box.w;
  const Y = (y) => box.y + box.h - ((y - o.ymin) / (o.ymax - o.ymin)) * box.h;
  const ticks = (a, b, n) => { const st = niceStep((b - a) / (n || 5)); const o2 = []; for (let v = Math.ceil(a / st - 1e-9) * st; v <= b + 1e-9; v += st) o2.push(+v.toFixed(10)); return o2; };
  ctx.save(); ctx.lineWidth = 1;
  for (const v of ticks(o.xmin, o.xmax, o.xticks)) { line(ctx, X(v), box.y, X(v), box.y + box.h, grid, 1); text(ctx, fmt(v, o.xdp ?? 2), X(v), box.y + box.h + 13, { color: muted, size: 13, align: 'center' }); }
  for (const v of ticks(o.ymin, o.ymax, o.yticks)) { line(ctx, box.x, Y(v), box.x + box.w, Y(v), grid, 1); text(ctx, fmt(v, o.ydp ?? 2), box.x - 5, Y(v), { color: muted, size: 13, align: 'right' }); }
  const y0 = o.ymin <= 0 && o.ymax >= 0 ? Y(0) : box.y + box.h, x0 = o.xmin <= 0 && o.xmax >= 0 ? X(0) : box.x;
  line(ctx, box.x, y0, box.x + box.w, y0, ink, 1.5); line(ctx, x0, box.y, x0, box.y + box.h, ink, 1.5);
  if (o.xlabel) text(ctx, o.xlabel, box.x + box.w, box.y + box.h + 30, { color: ink, size: 14, align: 'right' });
  if (o.ylabel) text(ctx, o.ylabel, box.x, box.y - 12, { color: ink, size: 14, align: 'left' });
  ctx.restore();
  return { X, Y };
}
export function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(raw || 1)), m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}
// plotLine(ctx, map, pts [[x,y]…], color, width)
export function plotLine(ctx, map, pts, color, w = 2.5) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(map.X(x), map.Y(y)) : ctx.moveTo(map.X(x), map.Y(y))));
  ctx.stroke(); ctx.restore();
}

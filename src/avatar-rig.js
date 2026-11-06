/* Avatar de cansancio animado: un "esqueleto" cuyas articulaciones se interpolan de forma continua
 * entre poses clave (1 sofá · 2 sentada · 3 de pie · 5 trotando · 7,5 inclinada · 10 manos en rodillas).
 * Antes de tocar la barra espera con los brazos cruzados; al soltar reacciona (suspira o se derrumba). */
import { FATIGUE_LABELS } from './art.js';

const NS = 'http://www.w3.org/2000/svg';
// Orden de los puntos de cada pose: cabeza, cuello, pelvis, codo1, mano1, codo2, mano2, rodilla1, tobillo1, punta1, rodilla2, tobillo2, punta2
const P = (h, n, p, a1, a2, l1, l2) => [h, n, p, ...a1, ...a2, ...l1, ...l2].flat();
const WAIT = P([60, 22], [60, 35], [60, 69], [[49, 50], [69, 47]], [[71, 50], [51, 47]], [[56, 90], [55, 109], [49, 110]], [[64, 90], [65, 109], [71, 110]]);
const KEYS = [
  [1, P([36, 44], [44, 58], [66, 76], [[26, 52], [28, 40]], [[56, 67], [66, 66]], [[82, 64], [100, 60], [104, 55]], [[84, 70], [101, 68], [105, 63]])],
  [2, P([47, 26], [48, 40], [50, 72], [[36, 54], [29, 63]], [[58, 58], [66, 68]], [[68, 73], [70, 104], [77, 107]], [[71, 76], [75, 105], [82, 108]])],
  [3, P([60, 22], [60, 35], [60, 69], [[50, 55], [48, 68]], [[70, 55], [72, 68]], [[55, 90], [54, 109], [48, 110]], [[65, 90], [66, 109], [72, 110]])],
  [5, P([60, 22], [60, 35], [60, 69], [[47, 51], [53, 61]], [[73, 49], [78, 40]], [[50, 88], [44, 107], [38, 108]], [[70, 86], [76, 106], [82, 107]])],
  [7.5, P([68, 25], [65, 37], [58, 69], [[65, 59], [67, 75]], [[72, 58], [74, 72]], [[54, 90], [52, 109], [46, 110]], [[64, 90], [66, 109], [72, 110]])],
  [10, P([86, 48], [74, 50], [47, 68], [[72, 71], [64, 86]], [[80, 73], [70, 88]], [[62, 88], [57, 109], [51, 110]], [[69, 90], [67, 109], [73, 110]])],
];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const mixArr = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
/* Valor continuo a partir de una tabla [[v, valor], ...] */
const table = (rows, v) => {
  if (v <= rows[0][0]) return rows[0][1];
  for (let i = 1; i < rows.length; i++) if (v <= rows[i][0]) {
    const [v0, a] = rows[i - 1], [v1, b] = rows[i], t = sstep(0, 1, (v - v0) / (v1 - v0));
    return Array.isArray(a) ? mixArr(a, b, t) : mix(a, b, t);
  }
  return rows[rows.length - 1][1];
};

export function createAvatar(box) {
  box.innerHTML = `<svg class="av av-rig" viewBox="0 0 120 120" overflow="visible">
    <g data-k="sofa"><rect x="10" y="50" width="22" height="52" rx="10" fill="var(--av-sofa-2)"/><rect x="10" y="76" width="100" height="26" rx="10" fill="var(--av-sofa)"/>
      <rect x="94" y="60" width="18" height="42" rx="9" fill="var(--av-sofa-2)"/><rect x="18" y="101" width="6" height="9" rx="2" fill="var(--av-line)"/><rect x="96" y="101" width="6" height="9" rx="2" fill="var(--av-line)"/></g>
    <g fill="none" stroke="var(--av-line)" stroke-linecap="round" stroke-linejoin="round">
      <path data-k="leg1" stroke-width="7"/><path data-k="leg2" stroke-width="7"/><path data-k="foot1" stroke-width="6"/><path data-k="foot2" stroke-width="6"/>
      <path data-k="torso" stroke-width="12"/><path data-k="arm1" stroke-width="7"/><path data-k="arm2" stroke-width="7"/></g>
    <circle data-k="head" r="10" fill="var(--av-head)" stroke="var(--av-line)" stroke-width="3.5"/>
    <ellipse data-k="eye1" rx="1.7" fill="var(--av-line)"/><ellipse data-k="eye2" rx="1.7" fill="var(--av-line)"/>
    <path data-k="brows" fill="none" stroke="var(--av-line)" stroke-width="1.6" stroke-linecap="round"/>
    <path data-k="mouth" fill="none" stroke="var(--av-line)" stroke-width="1.9" stroke-linecap="round"/>
    <ellipse data-k="open" fill="var(--av-line)"/><ellipse data-k="tongue" fill="#E86F7C"/>
    <g data-k="zz" fill="var(--av-line)" font-family="var(--display)" font-weight="900"><text font-size="11">z</text><text font-size="14">z</text></g>
    <g data-k="drops" fill="var(--av-sweat)">${[0, 1, 2].map(() => '<path d="M0 -4c3 3.8 3 6.8 0 7.5c-3-.7-3-3.7 0-7.5z"/>').join('')}</g>
    <g data-k="puff" fill="var(--av-sweat)"><circle r="2.6"/><circle r="1.8"/></g>
    <g data-k="dots" fill="var(--av-line)"><circle r="1.8"/><circle r="1.8"/><circle r="1.8"/></g>
  </svg>`;
  const svg = box.firstElementChild, el = {};
  svg.querySelectorAll('[data-k]').forEach((n) => (el[n.dataset.k] = n));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Estado: valores mostrados (suavizados) y objetivos
  let v = 3, w = 1, vT = 3, wT = 1, drag = false, releasedAt = -9, raf = 0, last = 0;

  function draw(t) {
    const base = table(KEYS, v), pose = mixArr(base, WAIT, w), pt = (i) => [pose[2 * i], pose[2 * i + 1]];
    let [h, n, p, e1, h1, e2, h2, k1, a1, t1, k2, a2, t2] = Array.from({ length: 13 }, (_, i) => pt(i));
    const fat = 1 - w; // cuánto manda la pose de cansancio
    const spent = sstep(8.5, 10, v) * fat;

    if (!reduce) {
      // Respiración: lenta y suave descansando, rápida y marcada agotada
      const period = mix(3.6, .5, sstep(1, 10, v)), amp = mix(.5, 1.7, sstep(4, 10, v));
      const b = Math.sin((t / 1000) * 2 * Math.PI / period) * amp;
      h = [h[0], h[1] + b]; n = [n[0], n[1] + b * .7]; e1 = [e1[0], e1[1] + b * .5]; e2 = [e2[0], e2[1] + b * .5];
      h1 = [h1[0], h1[1] + b * .3 * (1 - spent)]; h2 = [h2[0], h2[1] + b * .3 * (1 - spent)];
      // Esperando: golpecitos con el pie
      const tap = Math.max(0, Math.sin((t / 1000) * 2 * Math.PI / .7)) * 2.6 * w;
      t2 = [t2[0], t2[1] - tap];
      // Reacción al soltar: suspiro (poco cansancio) o derrumbe (mucho)
      const d = (t - releasedAt) / 900;
      if (d >= 0 && d < 1) {
        const k = Math.sin(Math.PI * d) * (1 - d * .3), dip = v >= 6 ? 4.5 : v <= 4 ? 2.2 : 1.4;
        h = [h[0] + (v >= 6 ? 1.5 * k : 0), h[1] + dip * k]; n = [n[0], n[1] + dip * .6 * k];
      }
    }
    const sh = (dx) => { const dx0 = p[0] - n[0], dy0 = p[1] - n[1], L = Math.hypot(dx0, dy0) || 1; return [n[0] + dx0 / L * 4 + dx, n[1] + dy0 / L * 4]; };
    const path = (...q) => 'M' + q.map((x) => x[0].toFixed(1) + ' ' + x[1].toFixed(1)).join('L');
    el.leg1.setAttribute('d', path([p[0] - 2, p[1]], k1, a1)); el.leg2.setAttribute('d', path([p[0] + 2, p[1]], k2, a2));
    el.foot1.setAttribute('d', path(a1, t1)); el.foot2.setAttribute('d', path(a2, t2));
    el.torso.setAttribute('d', path(n, p));
    el.arm1.setAttribute('d', path(sh(-1.5), e1, h1)); el.arm2.setAttribute('d', path(sh(1.5), e2, h2));
    el.head.setAttribute('cx', h[0]); el.head.setAttribute('cy', h[1]);

    // Cara
    const blink = !reduce && (t % 3800) < 130 ? .15 : 1;
    let eyeRy = mix(.35, 1.7, Math.max(sstep(1.2, 2, v), w)) * blink;
    const d = (t - releasedAt) / 900;
    if (!reduce && v <= 4 && d >= 0 && d < 1) eyeRy *= 1 - .8 * Math.sin(Math.PI * d); // cierra los ojos al suspirar
    [[el.eye1, -3.5], [el.eye2, 3.5]].forEach(([e, dx]) => { e.setAttribute('cx', h[0] + dx); e.setAttribute('cy', h[1] - 1.5); e.setAttribute('ry', Math.max(.3, eyeRy)); });
    const curve = mix(table([[1, 4.5], [3, 4.5], [4, 2], [5, 0], [10, 0]], v), -.6, w);
    const open = sstep(6, 7.5, v) * fat, wide = sstep(8.5, 10, v);
    el.mouth.setAttribute('d', `M${h[0] - 4} ${h[1] + 4}Q${h[0] + w * 1.5} ${h[1] + 4 + curve} ${h[0] + 4} ${h[1] + 4 - w * .8}`);
    el.mouth.setAttribute('opacity', 1 - open);
    el.open.setAttribute('cx', h[0]); el.open.setAttribute('cy', h[1] + 4.6); el.open.setAttribute('rx', mix(2.4, 3.8, wide)); el.open.setAttribute('ry', 2.8 * open + .01);
    const tg = sstep(9.3, 10, v) * fat;
    el.tongue.setAttribute('cx', h[0]); el.tongue.setAttribute('cy', h[1] + 6.4); el.tongue.setAttribute('rx', 1.8); el.tongue.setAttribute('ry', 1.8 * tg + .01); el.tongue.setAttribute('opacity', tg);
    el.brows.setAttribute('d', `M${h[0] - 2} ${h[1] - 7}l-4 1.8M${h[0] + 2} ${h[1] - 7}l4 1.8`);
    el.brows.setAttribute('opacity', sstep(6, 7, v) * fat);

    // Decorado
    const sofa = (1 - sstep(2.2, 3, v)) * fat;
    el.sofa.setAttribute('opacity', sofa); el.sofa.setAttribute('transform', `translate(0 ${((1 - sofa) * 10).toFixed(1)})`);
    el.zz.setAttribute('opacity', (1 - sstep(1.3, 1.8, v)) * fat);
    [...el.zz.children].forEach((z, i) => { const s = reduce ? 0 : ((t / 2400 + i * .3) % 1); z.setAttribute('x', h[0] + 12 + i * 8 + s * 4); z.setAttribute('y', h[1] - 12 - i * 10 - s * 6); z.setAttribute('opacity', reduce ? 1 : Math.sin(Math.PI * s)); });
    const dropOn = [sstep(5.5, 6, v), sstep(7.5, 8, v), sstep(9.5, 10, v)], dropAt = [[14, -10], [-12, -14], [15, -1]];
    [...el.drops.children].forEach((g, i) => {
      const s = reduce ? .3 : ((t / 1400 + i * .45) % 1);
      g.setAttribute('transform', `translate(${h[0] + dropAt[i][0]} ${h[1] + dropAt[i][1] + s * 9})`);
      g.setAttribute('opacity', dropOn[i] * fat * (1 - s * .8));
    });
    const pf = sstep(9.5, 10, v) * fat;
    [...el.puff.children].forEach((c, i) => { const s = reduce ? .5 : ((t / 1100 + i * .3) % 1); c.setAttribute('cx', h[0] + 16 + i * 6 + s * 5); c.setAttribute('cy', h[1] + 10 - i * 4 - s * 3); c.setAttribute('opacity', pf * (1 - s)); });
    [...el.dots.children].forEach((c, i) => { const s = reduce ? 1 : (Math.sin(t / 260 - i * .9) + 1) / 2; c.setAttribute('cx', h[0] + 13 + i * 5); c.setAttribute('cy', h[1] - 15 - s * 1.5); c.setAttribute('opacity', w * (.35 + .65 * s)); });
  }

  function frame(t) {
    raf = 0;
    if (!box.offsetParent) return; // pantalla oculta: se para hasta la próxima llamada
    const dt = Math.min(64, t - (last || t)); last = t;
    // Persigue el objetivo con suavidad: muy pegado mientras se arrastra, más pausado al soltar
    const fv = 1 - Math.exp(-dt / (drag ? 70 : 220)), fw = 1 - Math.exp(-dt / 230);
    v += (vT - v) * fv; w += (wT - w) * fw;
    draw(t);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (reduce) { v = vT; w = wT; draw(performance.now()); return; } if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

  return {
    /* Valor continuo 1-10 (o null = esperando) mientras se arrastra */
    set(val, dragging = false) {
      drag = dragging;
      if (val == null) { wT = 1; } else { vT = clamp(val, 1, 10); wT = 0; }
      kick();
    },
    /* Al soltar la barra: se coloca en su nivel y reacciona */
    release(val) { drag = false; vT = clamp(val, 1, 10); wT = 0; releasedAt = performance.now() + 120; kick(); },
    /* Nueva reseña: vuelve a esperar sin animación */
    reset() { v = vT = 3; w = wT = 1; drag = false; releasedAt = -9; draw(performance.now()); kick(); },
    label: (val) => FATIGUE_LABELS[Math.round(val) - 1],
  };
}

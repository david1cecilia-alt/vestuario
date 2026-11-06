/* Ilustraciones de Vestuario: avatar de cansancio (1-10) y escenas de jugadora por deporte.
 * Todo es SVG dibujado aquí (sin imágenes externas). Los colores salen de variables CSS
 * para que funcionen en tema claro y oscuro. */

/* ---------- Escala de cansancio: color neutro, sin "bueno" ni "malo" ---------- */
export function fatigueColor(r) {
  r = Math.max(0, Math.min(1, r));
  const st = ['f1', 'f2', 'f3', 'f4'];
  const seg = Math.min(2, Math.floor(r * 3)), t = Math.round((r * 3 - seg) * 100);
  return `color-mix(in srgb, var(--${st[seg + 1]}) ${t}%, var(--${st[seg]}))`;
}

export const FATIGUE_LABELS = ['Nada de cansancio', 'Muy poco', 'Poco', 'Algo', 'Moderado', 'Bastante', 'Mucho', 'Muchísimo', 'Casi al límite', 'Agotamiento total'];

/* ---------- Avatar sin género ---------- */
const L = 'var(--av-line)', H = 'var(--av-head)';
const limb = (d, w = 7) => `<path d="${d}" fill="none" stroke="${L}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const head = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="${H}" stroke="${L}" stroke-width="3.5"/>`;
const eyes = (x, y, kind) => kind === 'closed'
  ? `<path d="M${x - 6} ${y - 1}q2.5 2.5 5 0M${x + 1} ${y - 1}q2.5 2.5 5 0" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>`
  : `<circle cx="${x - 3.5}" cy="${y - 1.5}" r="1.7" fill="${L}"/><circle cx="${x + 3.5}" cy="${y - 1.5}" r="1.7" fill="${L}"/>`;
const brows = (x, y) => `<path d="M${x - 2} ${y - 7}l-4 1.8M${x + 2} ${y - 7}l4 1.8" stroke="${L}" stroke-width="1.6" stroke-linecap="round"/>`;
const mouth = (x, y, kind) => ({
  smile: `<path d="M${x - 4.5} ${y + 3}q4.5 4.5 9 0" fill="none" stroke="${L}" stroke-width="1.9" stroke-linecap="round"/>`,
  soft: `<path d="M${x - 3.5} ${y + 4}q3.5 2 7 0" fill="none" stroke="${L}" stroke-width="1.9" stroke-linecap="round"/>`,
  flat: `<path d="M${x - 3.5} ${y + 4.5}h7" stroke="${L}" stroke-width="1.9" stroke-linecap="round"/>`,
  o: `<ellipse cx="${x}" cy="${y + 4.5}" rx="2.4" ry="2.8" fill="${L}"/>`,
  pant: `<path d="M${x - 4} ${y + 2.5}h8v2.5a4 4 0 0 1-8 0z" fill="${L}"/>`,
  tongue: `<path d="M${x - 4} ${y + 2.5}h8v2.5a4 4 0 0 1-8 0z" fill="${L}"/><path d="M${x - 1.8} ${y + 5}h3.6v2.4a1.8 1.8 0 0 1-3.6 0z" fill="#E86F7C"/>`,
}[kind]);
const drop = (x, y, i) => `<path class="av-drop" style="--i:${i}" d="M${x} ${y - 4}c3 3.8 3 6.8 0 7.5c-3-.7-3-3.7 0-7.5z" fill="var(--av-sweat)"/>`;
const foot = (x, y, dir = 1) => limb(`M${x} ${y}h${6 * dir}`, 6);

const POSES = {
  // 1-2: tumbada en el sofá, brazo detrás de la cabeza
  sofa: (lv) => `
    <rect x="10" y="50" width="22" height="52" rx="10" fill="var(--av-sofa-2)"/>
    <rect x="10" y="76" width="100" height="26" rx="10" fill="var(--av-sofa)"/>
    <rect x="94" y="60" width="18" height="42" rx="9" fill="var(--av-sofa-2)"/>
    <rect x="18" y="101" width="6" height="9" rx="2" fill="${L}"/><rect x="96" y="101" width="6" height="9" rx="2" fill="${L}"/>
    ${limb('M44 58L26 52L28 40')}
    ${limb('M44 58L66 76', 12)}
    ${limb('M64 76L82 64L100 60')}${limb('M66 78L84 70L101 68')}
    ${limb('M46 60L56 67L66 66')}
    ${head(36, 44)}${eyes(36, 44, lv === 1 ? 'closed' : 'open')}${mouth(36, 44, 'smile')}
    ${lv === 1 ? '<g class="av-zz" fill="var(--av-line)" font-family="var(--display)" font-weight="900"><text x="48" y="30" font-size="11">z</text><text x="56" y="20" font-size="14">z</text></g>' : ''}`,
  // 3-4: de pie, tranquila
  relaxed: (lv) => `
    ${limb('M58 69L55 90L54 109')}${limb('M62 69L65 90L66 109')}${foot(54, 110, -1)}${foot(66, 110)}
    ${limb('M60 35V69', 12)}
    ${limb('M58 39L50 55L48 68')}${limb('M62 39L70 55L72 68')}
    ${head(60, 22)}${eyes(60, 22, 'open')}${mouth(60, 22, lv === 3 ? 'smile' : 'soft')}`,
  // 5-6: trotando, esfuerzo
  effort: (lv) => `
    ${limb('M58 69L50 88L44 107')}${limb('M62 69L70 86L76 106')}${foot(44, 108, -1)}${foot(76, 107)}
    ${limb('M60 35V69', 12)}
    ${limb('M58 39L47 51L53 61')}${limb('M62 39L73 49L78 40')}
    ${head(60, 22)}${eyes(60, 22, 'open')}${mouth(60, 22, 'flat')}
    ${lv === 6 ? drop(76, 14, 0) : ''}`,
  // 7-8: inclinada, cansada
  tired: (lv) => `
    ${limb('M56 69L54 90L52 109')}${limb('M60 69L64 90L66 109')}${foot(52, 110, -1)}${foot(66, 110)}
    ${limb('M58 69L65 37', 12)}
    ${limb('M64 41L65 59L67 75')}${limb('M66 41L72 58L74 72')}
    ${head(68, 25)}${brows(68, 25)}${eyes(68, 25, 'open')}${mouth(68, 25, 'o')}
    ${drop(84, 20, 0)}${lv === 8 ? drop(50, 18, 1) : ''}`,
  // 9-10: agotada, manos en las rodillas
  spent: (lv) => `
    ${limb('M46 67L62 88L57 109')}${limb('M48 69L69 90L67 109')}${foot(57, 110, -1)}${foot(67, 110)}
    ${limb('M47 67L74 50', 12)}
    ${limb('M72 52L72 71L64 86')}${limb('M74 54L80 73L70 88')}
    ${head(86, 48)}${brows(86, 48)}${eyes(86, 48, 'open')}${mouth(86, 48, lv === 10 ? 'tongue' : 'pant')}
    ${drop(94, 34, 0)}${drop(76, 32, 1)}${lv === 10 ? drop(100, 46, 2) : ''}
    ${lv === 10 ? '<g class="av-puff" fill="var(--av-sweat)"><circle cx="104" cy="58" r="2.6"/><circle cx="110" cy="54" r="1.8"/></g>' : ''}`,
};
const poseFor = (lv) => (lv <= 2 ? 'sofa' : lv <= 4 ? 'relaxed' : lv <= 6 ? 'effort' : lv <= 8 ? 'tired' : 'spent');

export function avatarSVG(level) {
  const lv = Math.max(1, Math.min(10, Math.round(level || 3))), pose = poseFor(lv);
  return `<svg class="av av-${pose}" viewBox="0 0 120 120" role="img" aria-label="${FATIGUE_LABELS[lv - 1]}">${POSES[pose](lv)}</svg>`;
}

/* ---------- Escena de jugadora (cuando no hay cuestionarios) ---------- */
const SKIN = '#C98F64', HAIR = '#2B1D16', SHORTS = '#16202B';
const st = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const shoe = (x, y, r = 0) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#F4F6F9" stroke="${SHORTS}" stroke-width="2" transform="rotate(${r} ${x} ${y})"/>`;
const handball = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#F4F7FB" stroke="#0F2A4D" stroke-width="2"/>
  <path d="M0 ${-r * .45}l${r * .43} ${r * .31}-${r * .16} ${r * .5}h-${r * .54}l-${r * .16}-${r * .5}z" fill="#1F6FD1"/>
  <path d="M${-r * .9} ${-r * .3}q${r * .4} ${-r * .55} ${r * .9} ${-r * .62}M${r * .95} ${r * .1}q${-r * .2} ${r * .55} ${-r * .55} ${r * .8}" fill="none" stroke="#F2C230" stroke-width="${r * .32}" stroke-linecap="round"/></g>`;
const basketball = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#E8702A" stroke="#4A1F07" stroke-width="2"/>
  <path d="M${-r} 0h${2 * r}M0 ${-r}v${2 * r}M${-r * .7} ${-r * .7}c${r * .55} ${r * .45} ${r * .55} ${r * .95} 0 ${r * 1.4}M${r * .7} ${-r * .7}c${-r * .55} ${r * .45} ${-r * .55} ${r * .95} 0 ${r * 1.4}" fill="none" stroke="#4A1F07" stroke-width="1.8"/></g>`;

/* Pelo con coleta que se mueve con el salto */
const hair = (hx, hy, sway) => `<g>${sway}<path d="M${hx - 13} ${hy - 4}q-22-5-26 13q13-6 24-2z" fill="${HAIR}"/></g>`;

export function sportScene(sport, animate = true) {
  const D = '3.2s', T = 'dur="' + D + '" repeatCount="indefinite"';
  const A = (s) => (animate ? s : '');
  // Salto: agachada → arriba → aguanta → cae
  const jump = A(`<animateTransform attributeName="transform" type="translate" ${T} values="0 34;0 34;0 0;0 0;0 34;0 34" keyTimes="0;.1;.32;.5;.72;1" calcMode="spline" keySplines="0 0 1 1;.2 .7 .4 1;0 0 1 1;.6 0 .8 .4;0 0 1 1"/>`);
  const shadow = (cx) => `<ellipse cx="${cx}" cy="284" rx="44" ry="6" fill="#000" opacity=".22">${A(`<animate attributeName="rx" ${T} values="44;44;24;24;44;44" keyTimes="0;.1;.32;.5;.72;1"/><animate attributeName="opacity" ${T} values=".26;.26;.1;.1;.26;.26" keyTimes="0;.1;.32;.5;.72;1"/>`)}</ellipse>`;
  const sway = (x, y) => A(`<animateTransform attributeName="transform" type="rotate" ${T} values="0 ${x} ${y};-14 ${x} ${y};8 ${x} ${y};-4 ${x} ${y};0 ${x} ${y}" keyTimes="0;.32;.5;.72;1"/>`);
  const handOpacity = A(`<animate attributeName="opacity" ${T} values="1;0;1" keyTimes="0;.42;.9" calcMode="discrete"/>`);
  const flight = (path, ball) => animate ? `<g opacity="0">${ball}<animate attributeName="opacity" ${T} values="0;1;0" keyTimes="0;.42;.8" calcMode="discrete"/>
    <animateMotion ${T} path="${path}" keyPoints="0;0;1;1" keyTimes="0;.42;.72;1" calcMode="linear"/></g>` : '';

  if (sport === 'hand') {
    return `<svg class="scene" viewBox="0 0 400 300" role="img" aria-label="Jugadora de balonmano saltando para lanzar a portería">
      <g stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"><path d="M0 284H400"/><path d="M40 284H300" stroke-dasharray="14 12"/></g>
      <text x="60" y="298" fill="#fff" fill-opacity=".7" font-family="var(--body)" font-weight="800" font-size="11">9 m</text>
      <g class="goal">
        <g stroke="#fff" stroke-opacity=".38" stroke-width="1.5">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${330 + i * 10} 158V280"/>`).join('')}${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<path d="M326 ${166 + i * 10}H392"/>`).join('')}
          ${A(`<animateTransform attributeName="transform" type="translate" ${T} values="0 0;0 0;7 2;0 0;0 0" keyTimes="0;.7;.74;.84;1"/>`)}</g>
        <rect x="318" y="150" width="8" height="134" fill="#fff"/><rect x="318" y="150" width="78" height="8" fill="#fff"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="318" y="${166 + i * 20}" width="8" height="10" fill="#E5484D"/>`).join('')}
        ${[0, 1, 2, 3].map((i) => `<rect x="${334 + i * 16}" y="150" width="8" height="8" fill="#E5484D"/>`).join('')}
      </g>
      ${shadow(170)}
      <g class="player">${jump}
        ${st('M168 178L150 214L132 244', SKIN, 11)}${shoe(130, 249, 20)}${st('M168 178L160 197', SHORTS, 22)}
        ${st('M176 178L206 184L200 224', SKIN, 11)}${shoe(204, 229, -10)}${st('M176 178L192 182', SHORTS, 22)}
        <path d="M158 120Q181 110 200 121L191 184Q172 191 154 182Z" fill="#F2C230"/>
        <text x="176" y="164" text-anchor="middle" fill="#0F3F80" font-family="var(--display)" font-weight="900" font-size="24">7</text>
        ${st('M194 124L218 137L236 129', SKIN, 10)}${st('M194 124L203 129', '#F2C230', 14)}
        ${st('M183 116L185 106', SKIN, 10)}
        ${hair(186, 92, sway(172, 90))}
        <circle cx="186" cy="94" r="15" fill="${SKIN}"/>
        <path d="M171 89q1-17 17-16q15 1 14 15q-6-8-15-8q-10 1-16 9z" fill="${HAIR}"/>
        <path d="M172 84q15-8 30-1" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="195" cy="95" r="1.9" fill="${HAIR}"/>
        <g>${A(`<animateTransform attributeName="transform" type="rotate" ${T} values="-10 172 120;-10 172 120;-30 172 120;30 172 120;80 172 120;80 172 120;-10 172 120" keyTimes="0;.15;.34;.42;.5;.72;1"/>`)}
          ${st('M172 120L150 98L156 68', SKIN, 10)}${st('M172 120L164 112', '#F2C230', 14)}
          <g>${handball(156, 55, 11)}${handOpacity}</g>
        </g>
      </g>
      ${flight('M191 55Q300 10 356 226', handball(0, 0, 11))}
    </svg>`;
  }
  return `<svg class="scene" viewBox="0 0 400 300" role="img" aria-label="Jugadora de baloncesto lanzando un triple">
    <g stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"><path d="M0 284H400"/><path d="M118 284H226" stroke-width="5" stroke-opacity=".7"/></g>
    <text x="122" y="298" fill="#fff" fill-opacity=".75" font-family="var(--body)" font-weight="800" font-size="11">6,75 m</text>
    <rect x="370" y="60" width="7" height="224" rx="3" fill="#5B6878"/>
    <rect x="356" y="56" width="10" height="62" rx="2" fill="#fff" stroke="#16202B" stroke-width="2"/>
    <g class="net">${A(`<animateTransform attributeName="transform" type="translate" ${T} values="0 0;0 0;0 5;0 0;0 0" keyTimes="0;.7;.74;.82;1"/>`)}
      <path d="M314 106L322 134H346L354 106M318 106L330 134M326 106L334 134M338 106L330 134M346 106L338 134M350 106L326 134" fill="none" stroke="#fff" stroke-width="1.6" stroke-opacity=".9"/></g>
    <path d="M312 104H357" stroke="#E8702A" stroke-width="5" stroke-linecap="round"/>
    ${shadow(174)}
    <g class="player">${jump}
      ${st('M170 186L166 222L170 252', SKIN, 11)}${shoe(171, 257, 70)}${st('M170 186L168 204', SHORTS, 22)}
      ${st('M178 186L186 224L182 254', SKIN, 11)}${shoe(184, 259, 75)}${st('M178 186L182 205', SHORTS, 22)}
      <path d="M156 124Q174 116 192 124L188 191Q172 197 158 191Z" fill="#1F6FD1"/>
      <text x="174" y="168" text-anchor="middle" fill="#fff" font-family="var(--display)" font-weight="900" font-size="24">11</text>
      ${st('M161 127L149 97L171 68', SKIN, 10)}${st('M162 127L161 117', '#1F6FD1', 14)}
      ${st('M175 120L176 112', SKIN, 10)}
      ${hair(175, 98, sway(161, 96))}
      <circle cx="175" cy="100" r="15" fill="${SKIN}"/>
      <path d="M160 95q1-17 17-16q15 1 14 15q-6-8-15-8q-10 1-16 9z" fill="${HAIR}"/>
      <path d="M161 90q15-8 30-1" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="184" cy="101" r="1.9" fill="${HAIR}"/>
      ${st('M188 127L202 98L189 68', SKIN, 10)}${st('M187 127L189 117', '#1F6FD1', 14)}
      <g>${basketball(181, 54, 13)}${handOpacity}</g>
    </g>
    ${flight('M181 54Q262 -70 334 96', basketball(0, 0, 13))}
  </svg>`;
}

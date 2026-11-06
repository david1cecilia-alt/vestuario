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
const SKIN = '#C98F64', SKIN_D = '#AE744C', HAIR = '#2B1D16', HAIR_L = '#4B3326';
const st = (d, c, w, extra = '', cap = 'round') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"${extra}/>`;
const P2 = (p) => p.map((q) => q.join(' ')).join(' L');
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/* Zapatilla en coordenadas locales, girada según la pierna */
const sneaker = ([x, y], rot, trim) => `<g transform="translate(${x} ${y}) rotate(${rot})">
  <path d="M-6 -5C1 -7 8 -5 13 -1C15.5 1 15 4.5 12 5H-7C-9.5 5 -10 1 -8.5 -2Z" fill="#F7F8FA" stroke="#16202B" stroke-width="2" stroke-linejoin="round"/>
  <path d="M-8.5 2.6H14" stroke="${trim}" stroke-width="2.6"/><path d="M-1 -5.2L2 -1.2M3 -5.4L6 -1.6" stroke="#16202B" stroke-width="1.2" stroke-linecap="round"/></g>`;

/* Pierna: muslo con pantalón, rodilla, espinilla con calcetín y zapatilla */
function leg({ hip, knee, ankle, near, shorts, shortsLen = .55, stripe = '#fff', sock = '#fff', sockTrim, shoeRot }) {
  const skin = near ? SKIN : SKIN_D, sockTop = lerp(ankle, knee, .38);
  const shortEnd = lerp(hip, knee, shortsLen);
  return `${st(`M${P2([hip, knee, ankle])}`, skin, 12)}
    ${st(`M${P2([sockTop, ankle])}`, sock, 12.5)}${st(`M${P2([lerp(ankle, knee, .26), lerp(ankle, knee, .31)])}`, sockTrim, 12.6, '', 'butt')}
    ${sneaker(ankle, shoeRot, sockTrim)}
    ${st(`M${P2([hip, lerp(hip, shortEnd, .4)])}`, shorts, 23)}${st(`M${P2([lerp(hip, shortEnd, .35), shortEnd])}`, shorts, 23, '', 'butt')}${st(`M${P2([lerp(hip, shortEnd, .05), shortEnd])}`, stripe, 2.2, ' opacity=".9"')}`;
}
/* Brazo: manga, antebrazo y mano */
function arm({ sh, el, ha, near, sleeve, trim, sleeveLen = .45 }) {
  const skin = near ? SKIN : SKIN_D;
  const sEnd = lerp(sh, el, sleeveLen);
  return `${st(`M${P2([sh, el, ha])}`, skin, 10.5)}<circle cx="${ha[0]}" cy="${ha[1]}" r="6" fill="${skin}"/>
    ${sleeve ? `${st(`M${P2([sh, lerp(sh, el, .12)])}`, sleeve, 15)}${st(`M${P2([lerp(sh, el, .1), sEnd])}`, sleeve, 15, '', 'butt')}${st(`M${P2([lerp(sh, el, sleeveLen - .07), sEnd])}`, trim, 15.2, '', 'butt')}` : ''}`;
}
/* Cabeza de perfil mirando a la derecha: pelo que cubre el cráneo, coleta, cinta y cara */
function playerHead([x, y], { tilt = 0, band = '#fff', tie = '#E5484D', sway = '' } = {}) {
  return `<g transform="translate(${x} ${y}) rotate(${tilt})">
    <g>${sway}<path d="M-10 -10C-22 -15 -33 -6 -32 9C-29 2 -24 -1 -16 0C-21 4 -23 10 -21 16C-17 8 -13 3 -9.5 -1Z" fill="${HAIR}"/>
      <path d="M-14 -9C-22 -9 -28 -3 -29 4" fill="none" stroke="${HAIR_L}" stroke-width="1.6" stroke-linecap="round"/></g>
    <path d="M-12 -4C-13 -16 -2 -21 7 -18C13 -16 15 -10 14 -4C15 -1 15.5 2 14.5 4.5L16.6 8.2C16.7 9 16.1 9.5 15 9.7L14 10.2C14 12.2 13.5 13.6 12.6 14.6C11 16.6 8 17.6 4.5 17.6C-1 17.6 -6 14.6 -9 10C-11.5 6.5 -12.3 1.5 -12 -4Z" fill="${SKIN}"/>
    <ellipse cx="-2.5" cy="2.5" rx="3.2" ry="4.2" fill="${SKIN_D}"/>
    <path d="M15.2 -5C15.5 -17 4.5 -22.5 -4 -21.5C-12.5 -20 -16 -12 -14.5 -3C-14 3 -12.4 7.5 -9.6 10C-9.4 4.5 -7.6 0.5 -4.6 -2.2C-0.6 -5.6 6.5 -7.2 11 -6.6C12.6 -6.4 14 -5.9 15.2 -5Z" fill="${HAIR}"/>
    <path d="M-9 -15C-3 -19 5 -19 10 -16" fill="none" stroke="${HAIR_L}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M-12.5 -8.5C-4 -15 6 -15.5 15 -8.2" fill="none" stroke="${band}" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="-13.4" cy="-6" rx="3" ry="4" fill="${tie}" transform="rotate(-20 -13.4 -6)"/>
    <ellipse cx="9.2" cy="1.6" rx="1.7" ry="2.2" fill="#1B120D"/><circle cx="9.7" cy="0.9" r=".6" fill="#fff"/>
    <path d="M6.4 -2.7Q9.6 -4 12.3 -2.8" stroke="${HAIR}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M10.4 12.6Q12.4 13.2 13.6 12.1" stroke="#7A3E2A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="4.5" cy="8.5" r="2.8" fill="#E88A7A" opacity=".35"/>
  </g>`;
}

const handball = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#F4F7FB" stroke="#0F2A4D" stroke-width="2"/>
  <path d="M0 ${-r * .45}l${r * .43} ${r * .31}-${r * .16} ${r * .5}h-${r * .54}l-${r * .16}-${r * .5}z" fill="#1F6FD1"/>
  <path d="M${-r * .9} ${-r * .3}q${r * .4} ${-r * .55} ${r * .9} ${-r * .62}M${r * .95} ${r * .1}q${-r * .2} ${r * .55} ${-r * .55} ${r * .8}" fill="none" stroke="#F2C230" stroke-width="${r * .32}" stroke-linecap="round"/></g>`;
const basketball = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#E8702A" stroke="#4A1F07" stroke-width="2"/>
  <path d="M${-r} 0h${2 * r}M0 ${-r}v${2 * r}M${-r * .7} ${-r * .7}c${r * .55} ${r * .45} ${r * .55} ${r * .95} 0 ${r * 1.4}M${r * .7} ${-r * .7}c${-r * .55} ${r * .45} ${-r * .55} ${r * .95} 0 ${r * 1.4}" fill="none" stroke="#4A1F07" stroke-width="1.8"/>
  <ellipse cx="${-r * .35}" cy="${-r * .45}" rx="${r * .3}" ry="${r * .16}" fill="#fff" opacity=".25" transform="rotate(-30 ${-r * .35} ${-r * .45})"/></g>`;

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
        ${arm({ sh: [194, 125], el: [216, 137], ha: [234, 131], near: false, sleeve: '#E0B12A', trim: '#0F3F80' })}
        ${leg({ hip: [168, 180], knee: [150, 214], ankle: [134, 242], near: false, shorts: '#0F2A4D', sockTrim: '#F2C230', shoeRot: 30 })}
        ${st('M183 119L187 107', SKIN_D, 11)}
        <path d="M160 123Q181 112 203 122L197 152Q194 170 195 184Q174 193 154 184Q158 168 157 152Z" fill="#F2C230"/>
        <path d="M199 124L195 182" stroke="#0F3F80" stroke-width="3.2" opacity=".85"/>
        <path d="M177 117Q185 127 193 117" fill="none" stroke="#0F3F80" stroke-width="3.2" stroke-linecap="round"/>
        <text x="177" y="166" text-anchor="middle" fill="#0F3F80" font-family="var(--display)" font-weight="900" font-size="25">7</text>
        ${leg({ hip: [177, 181], knee: [205, 187], ankle: [199, 225], near: true, shorts: '#16304F', sockTrim: '#F2C230', shoeRot: -8 })}
        <g>${A(`<animateTransform attributeName="transform" type="rotate" ${T} values="-10 174 122;-10 174 122;-30 174 122;30 174 122;55 174 122;55 174 122;-10 174 122" keyTimes="0;.15;.34;.42;.5;.72;1"/>`)}
          ${arm({ sh: [174, 122], el: [152, 100], ha: [157, 72], near: true, sleeve: '#F2C230', trim: '#0F3F80' })}
          <g>${handball(157, 58, 11)}${handOpacity}</g>
        </g>
        ${playerHead([190, 96], { band: '#FFFFFF', tie: '#1F6FD1', sway: sway(-12, -6) })}
      </g>
      ${flight('M192 58Q300 10 356 226', handball(0, 0, 11))}
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
      ${leg({ hip: [170, 188], knee: [166, 226], ankle: [170, 254], near: false, shorts: '#1A5BB0', shortsLen: .78, sockTrim: '#E8702A', shoeRot: 72 })}
      ${arm({ sh: [162, 129], el: [148, 99], ha: [169, 69], near: false })}
      ${st('M175 121L177 111', SKIN_D, 11)}
      <path d="M158 127Q164 123 168 121Q176 127 184 121Q188 123 193 127L190 191Q174 199 159 192Z" fill="#1F6FD1"/>
      <path d="M168 121Q176 133 184 121" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M158 128L161 190M193 128L190 190" stroke="#fff" stroke-width="2.6" opacity=".9"/>
      <text x="175.5" y="169" text-anchor="middle" fill="#fff" font-family="var(--display)" font-weight="900" font-size="24">11</text>
      ${leg({ hip: [179, 188], knee: [187, 228], ankle: [183, 257], near: true, shorts: '#2068C4', shortsLen: .78, sockTrim: '#E8702A', shoeRot: 78 })}
      ${playerHead([178, 100], { tilt: -10, band: '#E8702A', tie: '#FFFFFF', sway: sway(-12, -6) })}
      ${arm({ sh: [190, 129], el: [205, 99], ha: [190, 69], near: true })}
      <g>${basketball(180, 54, 13)}${handOpacity}</g>
    </g>
    ${flight('M180 54Q262 -70 334 96', basketball(0, 0, 13))}
  </svg>`;
}

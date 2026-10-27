'use strict';
// タウンの たてもの（SVG）。どの たてものも おなじ ルールで かく:
// ・せんは ココアいろ（BL）で ふとさ 2.2
// ・ひかりは ひだりうえから。みぎがわと ひさしの したに うすい かげ（BSH）、ひだりうえに しろい ハイライト（BHI）
// ・やねと ひさしには あつみ（したがわの こい いろの おび）
// ・まど＝わく＋ガラス＋ななめの ひかり、ドア＝ドアわく＋ガラス＋とって＋ふみいし
// ・じめんに やわらかい かげと うえきで「たっている」かんじを だす

const BL = '#7b5a4f';
const BLS = `stroke="${BL}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
const BLT = `stroke="${BL}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"`;
const BSH = 'rgba(123, 90, 79, .13)';
const BHI = 'rgba(255, 255, 255, .75)';

const bGround = (cx, cy, rx, ry = 7) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(96, 140, 70, .22)"/><ellipse cx="${cx}" cy="${cy - 1}" rx="${rx * .82}" ry="${ry * .55}" fill="rgba(96, 140, 70, .14)"/>`;

// しかくい まど（わく・ガラス・じゅうじ・ひかり・まどだい）
function bWindow(x, y, w, h, o = {}) {
  const frame = o.frame || '#fffaf3', glass = o.glass || '#cfeeff', r = o.r ?? 5;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${frame}" ${BLS}/>
    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="${Math.max(1, r - 2)}" fill="${glass}" ${BLT}/>`;
  if (o.inner) s += o.inner;
  s += `<path d="M${x + 7} ${y + h * .62} L${x + w * .5} ${y + 7} M${x + 9} ${y + h - 8} L${x + w * .66} ${y + 8}" stroke="${BHI}" stroke-width="2.6" stroke-linecap="round"/>`;
  if (o.cross !== false) s += `<path d="M${x + w / 2} ${y + 4} v${h - 8} M${x + 4} ${y + h / 2} h${w - 8}" stroke="${frame}" stroke-width="3"/><path d="M${x + w / 2} ${y + 4} v${h - 8} M${x + 4} ${y + h / 2} h${w - 8}" ${BLT} fill="none" opacity=".5"/>`;
  if (o.sill !== false) s += `<rect x="${x - 3}" y="${y + h - 2}" width="${w + 6}" height="6" rx="2.5" fill="${o.sillc || frame}" ${BLS}/>`;
  return s;
}
// まるい まど
function bRound(cx, cy, r, o = {}) {
  const frame = o.frame || '#fffaf3', glass = o.glass || '#cfeeff';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${frame}" ${BLS}/><circle cx="${cx}" cy="${cy}" r="${r - 3.5}" fill="${glass}" ${BLT}/>
    ${o.inner || `<path d="M${cx - r + 3.5} ${cy} h${2 * r - 7} M${cx} ${cy - r + 3.5} v${2 * r - 7}" stroke="${frame}" stroke-width="2.6"/>`}
    <path d="M${cx - r * .55} ${cy + r * .1} A${r * .6} ${r * .6} 0 0 1 ${cx - r * .05} ${cy - r * .55}" stroke="${BHI}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
}
// アーチの ドア（ドアわく・アーチの ガラス・パネル・とって・ふみいし）。o.mark で パネルに しるし
function bDoor(x, y, w, h, c, cd, o = {}) {
  const r = w / 2, b = y + h, py = y + r + 13, ph = h - r - 18;
  return `<path d="M${x - 4} ${b} v-${h - r} a${r + 4} ${r + 4} 0 0 1 ${w + 8} 0 v${h - r}z" fill="${o.casing || '#fffaf3'}" ${BLS}/>
    <path d="M${x} ${b} v-${h - r} a${r} ${r} 0 0 1 ${w} 0 v${h - r}z" fill="${c}" ${BLS}/>
    <path d="M${x + w * .62} ${b - 1} V${y + r}" stroke="${cd}" stroke-width="${w * .3}" opacity=".18"/>
    ${o.glass !== false ? `<path d="M${x + 5} ${y + r + 7} v-1 a${r - 5} ${r - 5} 0 0 1 ${w - 10} 0 v1z" fill="#d6f1ff" ${BLT}/><path d="M${x + 8} ${y + r + 2} q2 -5 6 -7" stroke="${BHI}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : ''}
    ${ph > 6 ? `<rect x="${x + 5}" y="${py}" width="${w - 10}" height="${ph}" rx="3" fill="none" stroke="${cd}" stroke-width="1.6" opacity=".75"/>` : ''}
    ${o.mark ? o.mark(x + w / 2, py + ph / 2) : ''}
    <circle cx="${x + w - 6}" cy="${y + r + (h - r) * .42}" r="2.5" fill="#ffd45c" ${BLT}/>
    <rect x="${x - 8}" y="${b - 1}" width="${w + 16}" height="6" rx="3" fill="#efe3d0" ${BLS}/>`;
}
const bHeart = (cx, cy, s, fill = '#fff') => `<path d="M${cx} ${cy + s * .9} C${cx - s * 1.6} ${cy - s * .1} ${cx - s * .7} ${cy - s * 1.3} ${cx} ${cy - s * .4} C${cx + s * .7} ${cy - s * 1.3} ${cx + s * 1.6} ${cy - s * .1} ${cx} ${cy + s * .9}Z" fill="${fill}" ${BLT}/>`;
// うえきばち
function bPot(x, y, c = '#8fd47c', fl) {
  return `<g transform="translate(${x} ${y})"><circle cx="-5" cy="-14" r="7" fill="${c}" ${BLS}/><circle cx="5" cy="-15" r="8" fill="${c}" ${BLS}/><circle cx="0" cy="-20" r="7" fill="${c}" ${BLS}/>
    <path d="M-3 -21 q2 -3 5 -2" stroke="${BHI}" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${fl ? fl.map(([fx, fy, fc]) => `<circle cx="${fx}" cy="${fy}" r="2.6" fill="${fc}" ${BLT}/>`).join('') : ''}
    <path d="M-9 -9 h18 l-2.5 10 h-13z" fill="#f2a98c" ${BLS}/><rect x="-10.5" y="-11" width="21" height="4.5" rx="2" fill="#f7bea6" ${BLS}/></g>`;
}
// ストライプの ひさし（うえが せまく したが ひろい だいけい＋したの なみなみ）
function bAwning(xt, wt, xb, wb, yt, yb, n, cols, depth = 6) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = xt + wt / n * i, b = xt + wt / n * (i + 1), c = xb + wb / n * (i + 1), d = xb + wb / n * i, sw = wb / n;
    s += `<path d="M${a} ${yt} L${b} ${yt} L${c} ${yb} a${sw / 2} ${depth} 0 0 1 -${sw} 0Z" fill="${cols[i % cols.length]}" ${BLS}/>`;
  }
  // まえの あつみ（したの なみの かげ）と うえの ハイライト
  s += `<path d="M${xt + 3} ${yt + 3} H${xt + wt - 3}" stroke="${BHI}" stroke-width="2" stroke-linecap="round"/>`;
  return s;
}
const bShadeRect = (x, y, w, h, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${BSH}"/>`;

/* ---------- ゆめいろパティスリー（きじゅん） ---------- */
function patisserieSVG() {
  const stripes = Array.from({ length: 11 }, (_, i) => `<rect x="${26 + i * 11.5}" y="112" width="5" height="40" fill="#fff2f6"/>`).join('');
  const dollops = [40, 56, 72, 98, 114, 130].map(x => `<g transform="translate(${x} 46)"><path d="M-6 3 q0 -7 6 -8 q6 1 6 8z" fill="#fffdf8" ${BLT}/><path d="M-3 0 q3 -3 6 0" stroke="#f1dfd0" stroke-width="1.4" fill="none"/></g>`).join('');
  return `<svg viewBox="0 0 170 170">
    ${bGround(85, 163, 76)}
    <!-- 1かい -->
    <rect x="18" y="98" width="134" height="60" rx="5" fill="#ffd9e6" ${BLS}/>
    ${stripes}
    ${bShadeRect(136, 99, 15, 58, 3)}
    <rect x="15" y="150" width="140" height="10" rx="3" fill="#f7bccf" ${BLS}/>
    <path d="M18 154 h134" stroke="rgba(123,90,79,.18)" stroke-width="2"/>
    <!-- ショーウインドウ（ケーキが ならぶ） -->
    ${bWindow(25, 116, 40, 30, { cross: false, frame: '#fffaf3', sillc: '#ffc4d6', inner: `
      <path d="M33 140 h24" stroke="${BL}" stroke-width="1.5"/>
      <path d="M35 140 v-7 l8 -3 v10z" fill="#fff6e8" ${BLT}/><path d="M35 133 l8 -3" stroke="#ff8fb3" stroke-width="2.2"/><circle cx="40" cy="129" r="2" fill="#ff5a6e" ${BLT}/>
      <path d="M47 140 l1 -6 h8 l1 6z" fill="#f7c27e" ${BLT}/><path d="M47.5 134 q4.5 -7 9 0z" fill="#ffc6da" ${BLT}/><circle cx="52" cy="128.5" r="1.6" fill="#ff5a6e"/>` })}
    ${bWindow(105, 116, 40, 30, { cross: false, frame: '#fffaf3', sillc: '#ffc4d6', inner: `
      <path d="M113 140 h24" stroke="${BL}" stroke-width="1.5"/>
      <rect x="115" y="131" width="20" height="9" rx="2" fill="#fff6e8" ${BLT}/><path d="M115 134 h20" stroke="#ff8fb3" stroke-width="2"/>
      <path d="M115 131 q2.5 -4 5 0 q2.5 -4 5 0 q2.5 -4 5 0 q2.5 -4 5 0" fill="#fffdf8" ${BLT}/><circle cx="125" cy="127" r="2.2" fill="#ff5a6e" ${BLT}/>` })}
    ${bDoor(72, 110, 26, 44, '#ff9fbf', '#e0628f', { mark: (x, y) => bHeart(x, y, 4) })}
    <!-- ぬのの ひさし -->
    ${bShadeRect(19, 103, 132, 7)}
    ${bAwning(24, 122, 13, 144, 90, 104, 8, ['#ff8fb3', '#fff7fa'], 6)}
    <rect x="20" y="86" width="130" height="6" rx="3" fill="#f06f9b" ${BLS}/>
    <!-- 2かい: スポンジケーキ -->
    <rect x="32" y="52" width="106" height="36" rx="6" fill="#ffe8bf" ${BLS}/>
    <rect x="33" y="70" width="104" height="5" fill="#ff9fb8"/><path d="M33 70 h104 M33 75 h104" stroke="${BL}" stroke-width="1.2" opacity=".5"/>
    ${bShadeRect(124, 53, 13, 34, 3)}
    ${bRound(58, 66, 10)}${bRound(112, 66, 10)}
    <!-- クリームの たれ -->
    <path d="M30 48 h110 v6 q-4 9 -8 0 q-5 12 -10 0 q-4 7 -8 0 q-6 13 -12 0 q-4 7 -8 0 q-5 10 -10 0 q-4 6 -8 0 q-5 12 -10 0 q-4 7 -8 0 q-5 10 -10 0 q-4 7 -8 0 q-3 6 -8 0z" fill="#fffdf8" ${BLS}/>
    <ellipse cx="85" cy="47" rx="56" ry="7" fill="#fffaf3" ${BLS}/>
    ${dollops}
    <!-- いちご -->
    <path d="M85 8 C64 8 60 28 69 39 C75 46 81 48 85 50 C89 48 95 46 101 39 C110 28 106 8 85 8Z" fill="#ff6177" ${BLS}/>
    <path d="M96 13 C104 20 104 32 97 40 C93 44 89 46 86 48 C92 42 98 32 96 13Z" fill="rgba(160, 30, 60, .18)"/>
    <ellipse cx="74" cy="22" rx="4" ry="7" fill="${BHI}" transform="rotate(20 74 22)"/>
    <g fill="#ffe680" ${BLT} stroke-width="1">${[[80, 22], [92, 21], [86, 32], [77, 37], [95, 36], [86, 42]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.4"/>`).join('')}</g>
    <path d="M72 11 Q78 1 85 9 Q92 0 99 10 Q93 16 85 13 Q77 17 72 11Z" fill="#7fcf6d" ${BLS}/><path d="M85 9 v-5" ${BLS}/>
    <!-- うえき -->
    ${bPot(14, 160, '#8fd47c', [[-4, -18, '#ff9fbf'], [5, -22, '#fff'], [2, -12, '#ffd45c']])}
    ${bPot(156, 160, '#8fd47c', [[-3, -20, '#fff'], [5, -14, '#ff9fbf']])}
  </svg>`;
}

const bBalloon = (x, y, c, cd, len) => `<g transform="translate(${x} ${y})"><path d="M0 9 q-3 ${len / 2} 1 ${len}" stroke="${BL}" stroke-width="1.2" fill="none"/>
  <ellipse cx="0" cy="-2" rx="8.5" ry="10.5" fill="${c}" ${BLS}/><path d="M-1 8 l1 2.5 l1.5 -2.5z" fill="${cd}" ${BLT}/><ellipse cx="-3" cy="-6" rx="2.2" ry="3.4" fill="${BHI}"/></g>`;
const bApple = (x, y, r = 4.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff6b7d" ${BLT}/><path d="M${x} ${y - r} q1 -3 3 -3" stroke="${BL}" stroke-width="1.2" fill="#7fcf6d"/><circle cx="${x - r * .35}" cy="${y - r * .3}" r="${r * .3}" fill="${BHI}"/>`;
const bFlower = (x, y, c, r = 2.6) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.sin(a * Math.PI / 180) * r).toFixed(1)}" cy="${(-Math.cos(a * Math.PI / 180) * r).toFixed(1)}" r="${r * .8}" fill="${c}" stroke="${BL}" stroke-width="1"/>`).join('')}<circle r="${r * .55}" fill="#fff3a0" stroke="${BL}" stroke-width="1"/></g>`;
const bBush = (x, y, s = 1, c = '#8fd47c') => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-8" cy="-7" r="8" fill="${c}" ${BLS}/><circle cx="8" cy="-7" r="8" fill="${c}" ${BLS}/><circle cx="0" cy="-12" r="9" fill="${c}" ${BLS}/><path d="M-12 -2 h24" stroke="${c}" stroke-width="6"/><path d="M-4 -15 q3 -3 6 -2" stroke="${BHI}" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;

/* ---------- おかいもの（プレゼントばこの おみせ） ---------- */
function shopSVG() {
  const dots = [[28, 140], [146, 92], [140, 132], [62, 142], [24, 82], [148, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#ffe08a"/>`).join('');
  return `<svg viewBox="0 0 170 170">
    ${bGround(85, 163, 76)}
    ${bBalloon(150, 24, '#ff9fbf', '#e57ea6', 26)}${bBalloon(22, 30, '#b79cf2', '#8a6ad6', 20)}
    <rect x="16" y="64" width="138" height="94" rx="5" fill="#fff3c4" ${BLS}/>
    ${dots}
    ${bShadeRect(140, 65, 13, 92, 3)}
    <rect x="13" y="150" width="144" height="10" rx="3" fill="#f6d38a" ${BLS}/>
    <!-- リボン（たて） -->
    <rect x="76" y="50" width="18" height="102" fill="#8fdcc8" ${BLS}/><rect x="86" y="51" width="7" height="100" fill="rgba(30, 110, 90, .14)"/>
    <!-- ふた -->
    <rect x="10" y="46" width="150" height="20" rx="6" fill="#ffd264" ${BLS}/>
    <rect x="11" y="60" width="148" height="5" rx="2" fill="rgba(170, 100, 20, .16)"/>
    <path d="M17 50 H153" stroke="${BHI}" stroke-width="2" stroke-linecap="round"/>
    <rect x="76" y="46" width="18" height="20" fill="#8fdcc8" ${BLS}/>
    <!-- リボンの ちょうちょ -->
    <path d="M85 46 C70 22 48 30 58 43 C63 49 77 48 85 46Z" fill="#8fdcc8" ${BLS}/><path d="M85 46 C100 22 122 30 112 43 C107 49 93 48 85 46Z" fill="#8fdcc8" ${BLS}/>
    <path d="M80 44 C72 34 62 34 63 40" stroke="rgba(30,110,90,.25)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M90 44 C98 34 108 34 107 40" stroke="rgba(30,110,90,.25)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M80 47 l-8 14 l6 -1 l2 5 z M90 47 l8 14 l-6 -1 l-2 5z" fill="#7fd0bc" ${BLS}/>
    <ellipse cx="85" cy="45" rx="7" ry="6" fill="#a5e6d6" ${BLS}/><ellipse cx="83" cy="43" rx="2.2" ry="1.6" fill="${BHI}"/>
    <!-- ひさし -->
    ${bShadeRect(17, 82, 136, 7)}
    ${bAwning(22, 126, 13, 144, 68, 82, 8, ['#ff9fbf', '#fff8fb'], 6)}
    <!-- まど（くだもの） -->
    ${bWindow(24, 98, 44, 32, { cross: false, sillc: '#ffe9a8', inner: `<path d="M30 124 h32" stroke="${BL}" stroke-width="1.4"/>
      ${bApple(35, 119)}${bApple(44, 120)}${bApple(39.5, 113)}
      <rect x="50" y="113" width="11" height="10" rx="1.5" fill="#ffb3cc" ${BLT}/><path d="M55.5 113 v10 M50 118 h11" stroke="#fff" stroke-width="1.8"/>` })}
    ${bDoor(110, 108, 28, 46, '#7cc6ff', '#3d8fd0')}
    <!-- くだものの はこ -->
    <g transform="translate(40 156)"><rect x="-18" y="-14" width="36" height="14" rx="2" fill="#e2b483" ${BLS}/><path d="M-18 -7 h36 M-6 -14 v14 M6 -14 v14" stroke="${BL}" stroke-width="1.2" opacity=".6"/>
      ${bApple(-11, -17, 4)}${bApple(-3, -18, 4)}${bApple(5, -17, 4)}${bApple(13, -18, 4)}</g>
  </svg>`;
}

/* ---------- おうち ---------- */
function homeSVG() {
  const rows = [0, 1, 2, 3].map(r => {
    const y = 47 + r * 11, half = (y + 4 - 36) / 56 * 69 - 2, n = 2 + r * 2, x = 85 - half, w = half * 2, st = w / n;
    return Array.from({ length: n }, (_, i) => `<path d="M${x + i * st} ${y} h${st} v3 a${st / 2} 6 0 0 1 -${st} 0z" fill="${(i + r) % 2 ? '#c9b2f7' : '#b896f0'}" ${BLT}/>`).join('');
  }).join('');
  return `<svg viewBox="0 0 170 170">
    ${bGround(85, 163, 72)}
    <!-- えんとつ -->
    <g fill="#fff" opacity=".95"><circle cx="123" cy="19" r="5.5"/><circle cx="129" cy="13" r="4.5"/><circle cx="134" cy="7" r="3.5"/></g>
    <rect x="112" y="30" width="18" height="32" fill="#f4b9c8" ${BLS}/><path d="M112 40 h18 M112 50 h18 M121 30 v10 M117 40 v10 M125 50 v10" stroke="${BL}" stroke-width="1.1" opacity=".45"/>
    <rect x="109" y="25" width="24" height="7" rx="2.5" fill="#f8cbd6" ${BLS}/>
    <!-- かべ -->
    <rect x="28" y="86" width="114" height="72" rx="5" fill="#fff8ec" ${BLS}/>
    <path d="M30 104 h110 M30 122 h110 M30 140 h110" stroke="rgba(123,90,79,.10)" stroke-width="2"/>
    ${bShadeRect(127, 87, 14, 70, 3)}
    <rect x="25" y="150" width="120" height="10" rx="3" fill="#e9dcf5" ${BLS}/>
    <!-- やね -->
    <path d="M16 92 L78 36 Q85 30 92 36 L154 92Z" fill="#c3a6f4" ${BLS}/>
    ${rows}
    <path d="M70 47 L82 37" stroke="${BHI}" stroke-width="2.4" stroke-linecap="round"/>
    ${bShadeRect(29, 94, 112, 7)}
    <rect x="12" y="86" width="146" height="9" rx="4.5" fill="#9f80dd" ${BLS}/><path d="M18 89 H152" stroke="rgba(255,255,255,.45)" stroke-width="1.8" stroke-linecap="round"/>
    ${bRound(85, 64, 10, { inner: bHeart(85, 64, 4, '#ff9fbf') })}
    <!-- まど＋よろいど＋はなだん -->
    <rect x="30" y="104" width="8" height="26" rx="2" fill="#cdb6f8" ${BLS}/><rect x="74" y="104" width="8" height="26" rx="2" fill="#cdb6f8" ${BLS}/>
    <path d="M32 110 h4 M32 116 h4 M32 122 h4 M76 110 h4 M76 116 h4 M76 122 h4" stroke="${BL}" stroke-width="1.1" opacity=".5"/>
    ${bWindow(40, 104, 32, 26, { sill: false, glass: '#fff1a8' })}
    <rect x="36" y="131" width="40" height="8" rx="2.5" fill="#d9a77d" ${BLS}/>
    ${bFlower(42, 129, '#ff9fbf')}${bFlower(51, 128, '#ffd45c')}${bFlower(60, 129, '#ff9fbf')}${bFlower(69, 128, '#b79cf2')}
    <!-- ドア -->
    ${bDoor(98, 112, 28, 44, '#b08cf0', '#7d5fd0', { mark: (x, y) => bHeart(x, y, 4, '#ffd6e6') })}
    <g transform="translate(134 114)"><path d="M0 0 v-5" ${BLT}/><rect x="-4" y="0" width="8" height="10" rx="2" fill="#fff3a0" ${BLT}/><path d="M-5 0 h10" ${BLS}/></g>
    <!-- ポスト -->
    <g transform="translate(156 160)"><rect x="-1.5" y="-18" width="3" height="18" fill="#c99a6b" ${BLT}/><rect x="-8" y="-28" width="16" height="12" rx="5" fill="#ff9fbf" ${BLS}/><path d="M8 -26 v-6 h4 v3 h-4" fill="#ffd45c" ${BLT}/></g>
    ${bBush(20, 160, .9)}
  </svg>`;
}

/* ---------- バイト＆おしゃべり（カフェ） ---------- */
function workSVG() {
  return `<svg viewBox="0 0 170 170">
    ${bGround(85, 163, 76)}
    <!-- やねの うえの コーヒーカップ -->
    <g transform="translate(85 36)">
      <path d="M-6 -12 q-4 -5 0 -10 q4 -5 0 -10 M4 -12 q-4 -5 0 -10 q4 -5 0 -9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="10" rx="24" ry="5" fill="#fffaf3" ${BLS}/>
      <path d="M-17 -8 h34 v6 a17 15 0 0 1 -34 0z" fill="#fffaf3" ${BLS}/>
      <path d="M9 -7 h7 v5 a14 13 0 0 1 -9 12" fill="rgba(123,90,79,.12)"/>
      <path d="M17 -4 a7 7 0 0 1 0 12" stroke="${BL}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M17 -4 a7 7 0 0 1 0 12" stroke="#fffaf3" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-8" rx="17" ry="3.6" fill="#d8a77c" ${BLS}/><path d="M-4 -8.6 q2 -2.4 4 0 q2 -2.4 4 0 l-4 3z" fill="#fff6ea"/>
      <path d="M-10 2 q3 -2 6 0" stroke="#7cc6ff" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <!-- かべ -->
    <rect x="20" y="62" width="130" height="96" rx="5" fill="#e3f6ef" ${BLS}/>
    <g fill="rgba(255,255,255,.7)">${[[30, 140], [50, 92], [138, 96], [128, 140], [30, 92]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="5" rx="2"/>`).join('')}</g>
    ${bShadeRect(136, 63, 13, 94, 3)}
    <rect x="17" y="150" width="136" height="10" rx="3" fill="#c7e9de" ${BLS}/>
    <!-- やね -->
    <rect x="12" y="46" width="146" height="18" rx="6" fill="#7cc6ff" ${BLS}/>
    <rect x="13" y="58" width="144" height="5" rx="2" fill="rgba(30, 80, 140, .16)"/>
    <path d="M18 50 H152" stroke="${BHI}" stroke-width="2" stroke-linecap="round"/>
    ${bShadeRect(21, 78, 128, 7)}
    ${bAwning(26, 118, 16, 138, 64, 78, 7, ['#6fbdf2', '#fbfeff'], 6)}
    <!-- まど（ふきだし） -->
    ${bWindow(28, 94, 50, 34, { cross: false, sillc: '#c7e9de', inner: `
      <path d="M38 102 h30 a5 5 0 0 1 5 5 v6 a5 5 0 0 1 -5 5 h-17 l-6 5 v-5 h-7 a5 5 0 0 1 -5 -5 v-6 a5 5 0 0 1 5 -5z" fill="#fff" ${BLT}/>
      <circle cx="46" cy="110" r="1.9" fill="#ff8fb8"/><circle cx="53" cy="110" r="1.9" fill="#ff8fb8"/><circle cx="60" cy="110" r="1.9" fill="#ff8fb8"/>` })}
    ${bDoor(104, 106, 30, 50, '#9bd3f5', '#4a95d1')}
    <!-- こくばんの かんばん -->
    <g transform="translate(40 158)"><path d="M-14 0 l5 -30 M14 0 l-5 -30" stroke="${BL}" stroke-width="5" stroke-linecap="round"/><path d="M-14 0 l5 -30 M14 0 l-5 -30" stroke="#d9a77d" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="-17" y="-32" width="34" height="22" rx="3" fill="#d9a77d" ${BLS}/><rect x="-14" y="-29" width="28" height="16" rx="2" fill="#5f8a74"/>
      <text x="0" y="-17.5" font-size="9.5" font-weight="bold" fill="#fff" text-anchor="middle" font-family="sans-serif">Hello!</text></g>
    ${bPot(152, 160, '#8fd47c', [[-3, -19, '#fff'], [4, -13, '#7cc6ff']])}
  </svg>`;
}

/* ---------- かんじの としょかん ---------- */
function librarySVG() {
  const col = (x) => `<g transform="translate(${x} 0)"><rect x="-7" y="72" width="14" height="5" rx="1.5" fill="#fffaf3" ${BLS}/><rect x="-4.5" y="77" width="9" height="48" fill="#fffaf3" ${BLS}/><rect x="0" y="78" width="4" height="46" fill="${BSH}"/><path d="M-1.5 80 v42" stroke="rgba(123,90,79,.25)" stroke-width="1"/><rect x="-7" y="124" width="14" height="5" rx="1.5" fill="#fffaf3" ${BLS}/></g>`;
  const books = (x, y) => ['#ff9fbf', '#ffd45c', '#8fdcc8', '#b79cf2', '#7cc6ff'].map((c, i) => `<rect x="${x + i * 3.4}" y="${y - (i % 2 ? 9 : 11)}" width="3" height="${i % 2 ? 9 : 11}" fill="${c}" stroke="${BL}" stroke-width=".8"/>`).join('');
  const archWin = (x) => `<path d="M${x} 118 v-22 a10 10 0 0 1 20 0 v22z" fill="#fffaf3" ${BLS}/><path d="M${x + 3.5} 115 v-19 a6.5 6.5 0 0 1 13 0 v19z" fill="#d6e6ff" ${BLT}/>
    <path d="M${x + 3.5} 106 h13" stroke="#fffaf3" stroke-width="2.4"/>${books(x + 4, 115)}<path d="M${x + 6} 101 q1 -5 5 -7" stroke="${BHI}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="${x - 2}" y="117" width="24" height="5" rx="2" fill="#e3e9ff" ${BLS}/>`;
  return `<svg viewBox="0 0 170 150">
    ${bGround(85, 145, 76, 6)}
    <rect x="20" y="66" width="130" height="68" rx="4" fill="#e9eeff" ${BLS}/>
    ${bShadeRect(134, 67, 15, 66, 3)}
    <!-- やね（さんかく） -->
    <path d="M12 70 L85 24 L158 70Z" fill="#9db4f0" ${BLS}/>
    <path d="M32 64 L85 33 L138 64Z" fill="#b8c9f7" ${BLT}/>
    <path d="M26 64 L80 30" stroke="${BHI}" stroke-width="2.2" stroke-linecap="round"/>
    ${bShadeRect(21, 75, 128, 6)}
    <rect x="8" y="66" width="154" height="9" rx="4" fill="#7f98e0" ${BLS}/><path d="M14 69 H156" stroke="rgba(255,255,255,.45)" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="85" cy="51" r="11" fill="#fff8e6" ${BLS}/><circle cx="85" cy="51" r="8" fill="none" stroke="#e8b84a" stroke-width="1.6"/>
    <text x="85" y="55.5" font-size="12" font-weight="bold" fill="#5a76c9" text-anchor="middle" font-family="'Hiragino Mincho ProN','Yu Mincho',serif">漢</text>
    ${archWin(31)}${archWin(119)}
    ${col(26)}${col(58)}${col(112)}${col(144)}
    ${bDoor(72, 90, 26, 40, '#ffd36b', '#d9a400')}
    <!-- かいだん -->
    <rect x="50" y="129" width="70" height="6" rx="2" fill="#f1edfa" ${BLS}/><rect x="42" y="134" width="86" height="7" rx="2" fill="#e6e0f5" ${BLS}/>
    ${bBush(15, 141, .8)}${bBush(155, 141, .8)}
  </svg>`;
}

/* ---------- ひだまり こうえん ---------- */
function parkSVG() {
  const pickets = Array.from({ length: 12 }, (_, i) => { const x = 18 + i * 12.2, y = 62 + Math.abs(i - 5.5) * 4.6; return `<path d="M${x - 3} ${y + 16} v-12 l3 -4 l3 4 v12z" fill="#fffdf8" ${BLT}/>`; }).join('');
  return `<svg viewBox="0 0 170 150">
    ${bGround(85, 139, 80, 9)}
    <path d="M6 134 Q6 52 85 48 Q164 52 164 134Z" fill="#a8e08f" ${BLS}/>
    <path d="M16 112 Q20 62 85 58" stroke="rgba(255,255,255,.4)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M8 124 Q85 136 162 124 L164 134 H6Z" fill="rgba(70,130,50,.14)"/>
    <path d="M15 74 Q85 52 155 74" fill="none" stroke="${BL}" stroke-width="5.4" stroke-linecap="round"/><path d="M15 74 Q85 52 155 74" fill="none" stroke="#fffdf8" stroke-width="3" stroke-linecap="round"/>
    ${pickets}
    <!-- き -->
    <g transform="translate(28 70)"><rect x="-3" y="14" width="7" height="44" rx="2" fill="#c99a6b" ${BLS}/><circle cx="0" cy="8" r="19" fill="#8fd47c" ${BLS}/><path d="M6 -8 a17 17 0 0 1 10 22 a19 19 0 0 1 -14 11" fill="rgba(60,120,50,.15)"/><circle cx="-7" cy="1" r="5" fill="#bfeaa9"/>${bApple(6, 12, 3)}${bApple(-6, 16, 3)}</g>
    <!-- ブランコ -->
    <g transform="translate(58 70)"><path d="M-2 56 L8 4 L18 56 M24 56 L34 4 L44 56" stroke="${BL}" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M-2 56 L8 4 L18 56 M24 56 L34 4 L44 56" stroke="#d9a77d" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M5 4 H37" stroke="${BL}" stroke-width="6" stroke-linecap="round"/><path d="M5 4 H37" stroke="#e8b98e" stroke-width="3" stroke-linecap="round"/>
      <path d="M15 6 V36 M27 6 V36" stroke="${BL}" stroke-width="1.4"/><rect x="11" y="35" width="20" height="5" rx="2.5" fill="#ff9fbf" ${BLT}/></g>
    <!-- すべりだい -->
    <g transform="translate(108 62)"><path d="M0 64 V16 M14 64 V16" stroke="${BL}" stroke-width="5.4" stroke-linecap="round"/><path d="M0 64 V16 M14 64 V16" stroke="#ff9fbf" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M0 28 h14 M0 40 h14 M0 52 h14" ${BLS}/>
      <path d="M16 12 C30 14 34 42 54 62 L44 66 C28 46 26 24 14 20Z" fill="#ffd45c" ${BLS}/><path d="M20 16 C30 20 33 40 48 58" stroke="${BHI}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="-4" y="9" width="22" height="8" rx="3" fill="#ff8fb8" ${BLS}/></g>
    <!-- すなば -->
    <g transform="translate(86 124)"><ellipse cx="0" cy="0" rx="24" ry="8" fill="#e2b483" ${BLS}/><ellipse cx="0" cy="-1" rx="19" ry="5.5" fill="#f8e3b4" ${BLT}/>
      <path d="M-6 -2 l2 -6 h7 l2 6z" fill="#7cc6ff" ${BLT}/><path d="M-4 -8 q3.5 -4 7 0" stroke="${BL}" stroke-width="1.2" fill="none"/><path d="M8 -3 l7 -5" stroke="${BL}" stroke-width="2.4" stroke-linecap="round"/></g>
    ${bFlower(18, 126, '#ff9fbf', 3)}${bFlower(150, 124, '#ffd45c', 3)}${bFlower(142, 106, '#b79cf2', 2.6)}${bFlower(40, 130, '#fff', 2.8)}${bFlower(56, 128, '#ff9fbf', 2.4)}
  </svg>`;
}

function buildingSVG(id) {
  return ({ patisserie: patisserieSVG, shop: shopSVG, park: parkSVG, home: homeSVG, work: workSVG, library: librarySVG }[id] || patisserieSVG)();
}

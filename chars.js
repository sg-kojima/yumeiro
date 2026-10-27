// オリジナルキャラクター（SVGで描画）。あとで画像差し替えできるよう、描画はここに集める。
const CHARS = {
  coco:  { name: 'ココ',   kind: 'くま',   color: '#fffaf3', inner: '#ffd6e0', flower: ['#ff9fc1', '#ffe680'], desc: 'まっしろ まんまるの くま。のんびりやさん。' },
  luna:  { name: 'ルナ',   kind: 'ねこ',   color: '#ece6fb', inner: '#ffd6e6', flower: ['#ffd45c', '#ff9d3b'], tip: '#b9a3e3', desc: 'ラベンダーいろの ねこ。しましまの しっぽが じまん。' },
  berry: { name: 'ベリー', kind: 'うさぎ', color: '#ffe9ee', inner: '#ffc2d2', flower: ['#8fd0ff', '#fff6b0'], desc: 'ピンクの ながみみ うさぎ。ぴょんぴょん げんき。' },
};

function eyesSVG(mood) {
  const L = 45, R = 75, Y = 62;
  if (mood === 'happy') {
    return `<path d="M${L-6} ${Y+2} Q${L} ${Y-6} ${L+6} ${Y+2}" class="ln"/><path d="M${R-6} ${Y+2} Q${R} ${Y-6} ${R+6} ${Y+2}" class="ln"/>`;
  }
  if (mood === 'sleepy') {
    return `<path d="M${L-6} ${Y} Q${L} ${Y+4} ${L+6} ${Y}" class="ln"/><path d="M${R-6} ${Y} Q${R} ${Y+4} ${R+6} ${Y}" class="ln"/>
      <text x="96" y="30" font-size="14" fill="#7a83c9" font-weight="bold">z</text><text x="104" y="18" font-size="10" fill="#7a83c9" font-weight="bold">z</text>`;
  }
  const eye = (x) => `<circle cx="${x}" cy="${Y}" r="5" fill="#3b2a2a"/><circle cx="${x+1.6}" cy="${Y-1.8}" r="1.7" fill="#fff"/>`;
  if (mood === 'sad') {
    return eye(L) + eye(R) +
      `<path d="M${L-7} ${Y-8} L${L+4} ${Y-12}" class="ln"/><path d="M${R+7} ${Y-8} L${R-4} ${Y-12}" class="ln"/>
       <path d="M${R+5} ${Y+5} q2 6 0 8 q-3 -2 0 -8z" fill="#8fd0ff"/>`;
  }
  return eye(L) + eye(R);
}

function mouthSVG(mood, y) {
  if (mood === 'happy') return `<path d="M53 ${y} Q60 ${y+10} 67 ${y} Z" fill="#e2586b" stroke="#3b2a2a" stroke-width="1.8" stroke-linejoin="round"/>`;
  if (mood === 'sad') return `<path d="M54 ${y+4} Q60 ${y-2} 66 ${y+4}" class="ln"/>`;
  if (mood === 'sleepy') return `<ellipse cx="60" cy="${y+2}" rx="2.6" ry="3" fill="#3b2a2a"/>`;
  return `<path d="M54 ${y} Q57 ${y+4} 60 ${y} Q63 ${y+4} 66 ${y}" class="ln"/>`;
}

function cheeks() {
  return `<ellipse cx="36" cy="74" rx="7" ry="4.5" fill="#ff8fab" opacity=".55"/><ellipse cx="84" cy="74" rx="7" ry="4.5" fill="#ff8fab" opacity=".55"/>`;
}

const WEAR_SVG = {
  hat: `<ellipse cx="60" cy="30" rx="40" ry="9" fill="#f4d58d" stroke="#c9a24f" stroke-width="2"/><path d="M38 30 Q40 6 60 6 Q80 6 82 30Z" fill="#f4d58d" stroke="#c9a24f" stroke-width="2"/><rect x="39" y="22" width="42" height="6" fill="#ff8fab"/>`,
  bow: `<g transform="translate(60 22)"><path d="M0 0 L-20 -10 L-20 10Z" fill="#ff6fa0" stroke="#d94a7d" stroke-width="2" stroke-linejoin="round"/><path d="M0 0 L20 -10 L20 10Z" fill="#ff6fa0" stroke="#d94a7d" stroke-width="2" stroke-linejoin="round"/><circle r="5" fill="#ff9ec0" stroke="#d94a7d" stroke-width="2"/></g>`,
  muffler: `<path d="M30 100 Q60 112 90 100 L90 110 Q60 122 30 110Z" fill="#7cc6ff" stroke="#4a95d1" stroke-width="2"/><rect x="74" y="106" width="11" height="22" rx="3" fill="#7cc6ff" stroke="#4a95d1" stroke-width="2"/>`,
  crown: `<path d="M38 28 L42 8 L52 20 L60 4 L68 20 L78 8 L82 28Z" fill="#ffd54a" stroke="#d9a400" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="20" r="3" fill="#ff6fa0"/>`,
  glasses: `<g fill="none" stroke="#6a4cc9" stroke-width="3"><circle cx="45" cy="62" r="10"/><circle cx="75" cy="62" r="10"/><path d="M55 61 L65 61"/></g>`,
  flower: `<g transform="translate(30 32)"><circle cx="0" cy="-7" r="6" fill="#fff4a8"/><circle cx="7" cy="0" r="6" fill="#fff4a8"/><circle cx="0" cy="7" r="6" fill="#fff4a8"/><circle cx="-7" cy="0" r="6" fill="#fff4a8"/><circle r="4.5" fill="#ff9d3b"/></g>`,
  apron: `<path d="M44 102 L76 102 L80 128 L40 128Z" fill="#fff" stroke="#f08db0" stroke-width="2"/><path d="M48 112 h24" stroke="#f08db0" stroke-width="2"/>`,
};

// せいちょうの すがた（0〜4）。うしろ＝オーラ・はね、まえ＝リボン・キラキラ・ティアラ
const STAGE_SCALE = [0.82, 0.9, 1, 1, 1];
function stageBack(st) {
  let s = '';
  if (st >= 4) s += `<defs><radialGradient id="aura"><stop offset="0" stop-color="#fff6b0" stop-opacity=".9"/><stop offset=".6" stop-color="#ffd0f0" stop-opacity=".5"/><stop offset="1" stop-color="#c9b6ff" stop-opacity="0"/></radialGradient></defs><circle cx="60" cy="70" r="64" fill="url(#aura)" class="aura"/>`;
  if (st >= 3) s += `<g class="wings" opacity=".92"><path d="M40 92 C8 70 2 40 14 34 C30 30 40 60 46 84Z" fill="#e8f6ff" stroke="#9fd0f0" stroke-width="2"/><path d="M42 100 C14 104 8 120 18 124 C30 126 40 112 46 102Z" fill="#fde8f6" stroke="#f0a8cc" stroke-width="2"/>
    <path d="M80 92 C112 70 118 40 106 34 C90 30 80 60 74 84Z" fill="#e8f6ff" stroke="#9fd0f0" stroke-width="2"/><path d="M78 100 C106 104 112 120 102 124 C90 126 80 112 74 102Z" fill="#fde8f6" stroke="#f0a8cc" stroke-width="2"/></g>`;
  return s;
}
function stageFront(st, wear) {
  let s = '';
  if (st >= 1 && !wear.includes('muffler')) s += `<g transform="translate(60 98)"><path d="M0 0 L-11 -6 L-11 6Z" fill="#ff8fb8" stroke="#d65a8a" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 0 L11 -6 L11 6Z" fill="#ff8fb8" stroke="#d65a8a" stroke-width="1.6" stroke-linejoin="round"/><circle r="3" fill="#ffb3cc" stroke="#d65a8a" stroke-width="1.4"/></g>`;
  if (st >= 2) s += `<g fill="#fff3a0" stroke="#ffc94a" stroke-width="1.2" class="twinkle">${[[14, 40, 6], [106, 52, 5], [100, 14, 4]].map(([x, y, r]) => `<path d="M${x} ${y - r * 2}c${r * .4} ${r * 1.5} ${r * .6} ${r * 1.6} ${r * 2} ${r * 2}c-${r * 1.4} ${r * .4}-${r * 1.6} ${r * .6}-${r * 2} ${r * 2}c-${r * .4}-${r * 1.4}-${r * .6}-${r * 1.6}-${r * 2}-${r * 2}c${r * 1.4}-${r * .4} ${r * 1.6}-${r * .6} ${r * 2}-${r * 2}z"/>`).join('')}</g>`;
  if (st >= 4 && !wear.includes('crown') && !wear.includes('hat')) s += `<g transform="translate(60 22)"><path d="M-16 6 L-14 -6 L-7 1 L0 -10 L7 1 L14 -6 L16 6Z" fill="#ffe680" stroke="#e0a400" stroke-width="1.8" stroke-linejoin="round"/><circle cx="0" cy="-2" r="2.6" fill="#7cc6ff"/><circle cx="-9" cy="2" r="1.8" fill="#ff8fb8"/><circle cx="9" cy="2" r="1.8" fill="#ff8fb8"/></g>`;
  return s;
}
const autoStage = (id, stage) => (stage !== undefined ? stage : (typeof S !== 'undefined' && S.partner === id && typeof petLevel === 'function' ? petLevel() : 0));

// 差し替え画像（charset.js で せってい）。あれば SVG の かわりに 画像を つかう
const CHAR_IMAGES_ALL = window.CHAR_IMAGES || {};
const CHAR_IMAGES = {};
// おうちのひとの せってい「キャラの え」: image（差し替え画像）/ original（うごく オリジナル）
function applyCharset() {
  Object.keys(CHAR_IMAGES).forEach(k => delete CHAR_IMAGES[k]);
  const mode = typeof S !== 'undefined' && S.settings && S.settings.charset;
  if (mode !== 'original') Object.assign(CHAR_IMAGES, CHAR_IMAGES_ALL);
}
applyCharset();
function charImage(id, mood, wear, st) {
  const set = CHAR_IMAGES[id];
  const src = set[mood] || set.normal;
  const moodCls = set[mood] ? '' : `mood-${mood}`;
  const over = wear.length ? `<svg class="wearover" viewBox="0 0 120 132">${wear.map(w => WEAR_SVG[w] || '').join('')}</svg>` : '';
  const back = st ? `<svg class="stageback" viewBox="0 0 120 132">${stageBack(st)}</svg>` : '';
  const front = st ? `<svg class="wearover" viewBox="0 0 120 132">${stageFront(st, wear)}</svg>` : '';
  return `<div class="charimg ${moodCls}" style="--sc:${STAGE_SCALE[st] || 1}">${back}<img src="${src}" alt="" draggable="false">${over}${front}${mood === 'sleepy' ? '<span class="zzz">💤</span>' : ''}${mood === 'sad' ? '<span class="tear">💧</span>' : ''}</div>`;
}

// id: coco/luna/berry, mood: normal/happy/sad/sleepy, wear: ['hat', ...]
function charSVG(id, mood = 'normal', wear = [], stage) {
  const st = autoStage(id, stage);
  if (CHAR_IMAGES[id]) return charImage(id, mood, wear, st);
  const c = CHARS[id], LC = '#4a3b3b';
  const L = `stroke="${LC}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const flower = (x, y, r) => `<g class="c-flower" transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.sin(a * Math.PI / 180) * r).toFixed(1)}" cy="${(-Math.cos(a * Math.PI / 180) * r).toFixed(1)}" r="${r * .78}" fill="${c.flower[0]}" stroke="${LC}" stroke-width="1.8"/>`).join('')}<circle r="${r * .6}" fill="${c.flower[1]}" stroke="${LC}" stroke-width="1.6"/></g>`;
  let ears = '', extra = '';
  if (id === 'coco') {
    ears = `<g class="c-ears"><circle cx="38" cy="50" r="10" fill="${c.color}" ${L}/><circle cx="38" cy="51" r="4.5" fill="${c.inner}"/><circle cx="82" cy="50" r="10" fill="${c.color}" ${L}/><circle cx="82" cy="51" r="4.5" fill="${c.inner}"/></g>`;
  } else if (id === 'luna') {
    ears = `<g class="c-ears"><path d="M30 62 L34 36 L52 48Z" fill="${c.color}" ${L}/><path d="M35 54 L36 42 L46 49Z" fill="${c.inner}"/><path d="M90 62 L86 36 L68 48Z" fill="${c.color}" ${L}/><path d="M85 54 L84 42 L74 49Z" fill="${c.inner}"/></g>`;
    extra = `<g class="c-tail"><path d="M96 112 q20 -6 16 -26 q-2 -6 -7 -3 q3 14 -11 20" fill="${c.color}" ${L}/><path d="M105 83 q4 -2 7 3 q2 6 0 10 q-4 -4 -7 -13z" fill="${c.tip}"/></g>`;
  } else {
    ears = `<g class="c-ears"><g class="c-ear l"><path d="M44 52 C34 30 34 10 42 8 C50 6 54 28 54 50Z" fill="${c.color}" ${L}/><path d="M45 44 C40 30 40 18 43 16 C47 16 49 30 50 44Z" fill="${c.inner}"/></g><g class="c-ear r"><path d="M76 52 C86 30 86 10 78 8 C70 6 66 28 66 50Z" fill="${c.color}" ${L}/><path d="M75 44 C80 30 80 18 77 16 C73 16 71 30 70 44Z" fill="${c.inner}"/></g></g>`;
  }
  const flw = ''; void flower;
  const eyeY = 84;
  let eyes;
  if (mood === 'happy') eyes = `<path d="M44 ${eyeY + 2} q5 -7 10 0 M66 ${eyeY + 2} q5 -7 10 0" fill="none" ${L}/>`;
  else if (mood === 'sleepy') eyes = `<path d="M44 ${eyeY} q5 4 10 0 M66 ${eyeY} q5 4 10 0" fill="none" ${L}/><text x="96" y="52" font-size="14" fill="#7a83c9" font-weight="bold">z</text><text x="104" y="40" font-size="10" fill="#7a83c9" font-weight="bold">z</text>`;
  else {
    eyes = `<g class="c-blink"><ellipse cx="49" cy="${eyeY}" rx="3.6" ry="4.6" fill="${LC}"/><ellipse cx="71" cy="${eyeY}" rx="3.6" ry="4.6" fill="${LC}"/><circle cx="50.2" cy="${eyeY - 1.8}" r="1.4" fill="#fff"/><circle cx="72.2" cy="${eyeY - 1.8}" r="1.4" fill="#fff"/></g>`;
    if (mood === 'sad') eyes += `<path d="M42 76 l9 -3 M78 76 l-9 -3" fill="none" ${L} stroke-width="2"/><path d="M76 89 q2 6 0 8 q-3 -2 0 -8z" fill="#8fd0ff"/>`;
  }
  const mouth = mood === 'happy' ? `<path d="M55 92 q5 7 10 0z" fill="#ff8a9a" ${L} stroke-width="2"/>` : mood === 'sad' ? `<path d="M56 95 q4 -4 8 0" fill="none" ${L}/>` : mood === 'sleepy' ? `<ellipse cx="60" cy="94" rx="2.4" ry="2.8" fill="${LC}"/>` : `<path d="M56 92 q2 3 4 0 q2 3 4 0" fill="none" ${L} stroke-width="2"/>`;
  const up = mood === 'happy';
  // きせかえは あたまの いちに あわせて ずらす
  const shift = { hat: 20, bow: 22, crown: 22, flower: 18, glasses: 22 };
  const front = wear.filter(w => w !== 'muffler' && w !== 'apron').map(w => `<g transform="translate(0 ${shift[w] || 0})">${WEAR_SVG[w] || ''}</g>`).join('');
  const neck = wear.filter(w => w === 'muffler' || w === 'apron').map(w => WEAR_SVG[w]).join('');
  return `<svg class="charsvg mochi" viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg" aria-label="${c.name}">
    ${stageBack(st)}
    <ellipse cx="60" cy="128" rx="32" ry="4" fill="rgba(0,0,0,.08)"/>
    <g transform="translate(60 128) scale(${STAGE_SCALE[st] || 1}) translate(-60 -128)">
    <g class="c-body">
      ${extra}${ears}
      <g class="c-foot l"><ellipse cx="46" cy="124" rx="9" ry="5" fill="${c.color}" ${L}/></g><g class="c-foot r"><ellipse cx="74" cy="124" rx="9" ry="5" fill="${c.color}" ${L}/></g>
      <path d="M60 46 C88 46 100 66 100 92 C100 116 84 124 60 124 C36 124 20 116 20 92 C20 66 32 46 60 46Z" fill="${c.color}" ${L}/>
      ${flw}
      ${neck}
      <g class="c-arm l ${up ? 'up' : ''}"><ellipse cx="22" cy="100" rx="6" ry="9" fill="${c.color}" ${L} transform="rotate(${up ? 40 : 20} 22 100)"/></g>
      <g class="c-arm r ${up ? 'up' : ''}"><ellipse cx="98" cy="100" rx="6" ry="9" fill="${c.color}" ${L} transform="rotate(${up ? -40 : -20} 98 100)"/></g>
      <ellipse cx="40" cy="92" rx="7" ry="4" fill="#ffaabb" opacity=".6"/><ellipse cx="80" cy="92" rx="7" ry="4" fill="#ffaabb" opacity=".6"/>
      ${eyes}${mouth}
      ${front}
      <g transform="translate(0 14)">${stageFront(st, wear)}</g>
    </g>
    </g>
  </svg>`;
}

// ケーキ: {topping:'🍓', cream:'#fff', size:12}
function cakeSVG(cake) {
  const w = 40 + Math.min(cake.size || 12, 20) * 3;
  const x = (140 - w) / 2;
  const tops = Array.from({ length: 5 }, (_, i) => `<text x="${x + 6 + i * (w - 12) / 4}" y="34" font-size="16" text-anchor="middle">${cake.topping}</text>`).join('');
  return `<svg class="cakesvg" viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="70" cy="90" rx="${w / 2 + 14}" ry="8" fill="#fff" stroke="#e7d3df" stroke-width="2"/>
    <rect x="${x}" y="40" width="${w}" height="46" rx="8" fill="#f6d79b" stroke="#d8ad62" stroke-width="2"/>
    <rect x="${x}" y="58" width="${w}" height="7" fill="${cake.cream}"/>
    <path d="M${x} 46 q0 -10 10 -10 h${w - 20} q10 0 10 10 v6 ${Array.from({ length: 6 }, () => `q-${w / 12} 8 -${w / 6} 0`).join(' ')}Z" fill="${cake.cream}" stroke="rgba(0,0,0,.08)" stroke-width="1.5"/>
    ${tops}
  </svg>`;
}

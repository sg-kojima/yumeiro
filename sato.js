'use strict';
// さくらの さと: むすめさんが かんがえた あたらしい フィールド（2026-11）。
// ねこの さくら・こむぎ／かいてんずし（いけす）／カカオと さとうきびの はたけ／クッキング／木の はたけ（かんじ）／
// ねこの おんせん／バーベキュー／たけのこ＆きのこの さと。
// はたけで とった ざいりょうで おかしを つくると、おうちで パートナーが たべられる。

const SL = 'stroke="#5b4040" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';

/* ---------- データ ---------- */
const SATO_CATS = {
  sakura: { name: 'さくら', body: '#fffaf6', ear: '#ffc0d6', patch: null, line: '#5b4040' },
  komugi: { name: 'こむぎ', body: '#f8d29c', ear: '#ffb9a6', patch: '#e2a560', line: '#5b4040' },
};
const GOODS = {
  cacao:    { name: 'カカオまめ', unit: 'つぶ' },
  sugar:    { name: 'さとう',     unit: 'ふくろ' },
  ichigo:   { name: 'いちご',     unit: 'こ' },
  takenoko: { name: 'たけのこ',   unit: 'こ' },
  kinoko:   { name: 'きのこ',     unit: 'こ' },
};
const CROPS = {
  cacao:  { name: 'カカオ',     secs: 150, yield: 4, good: 'cacao' },
  sugar:  { name: 'さとうきび', secs: 100, yield: 3, good: 'sugar' },
  ichigo: { name: 'いちご',     secs: 60,  yield: 3, good: 'ichigo' },
};
const RECIPES = [
  { id: 'ichigocookie', name: 'いちごクッキー', need: { ichigo: 2, sugar: 1 }, make: 2 },
  { id: 'gum',          name: 'ガム',           need: { sugar: 2 },            make: 3 },
  { id: 'chocolate',    name: 'チョコレート',   need: { cacao: 3, sugar: 1 },  make: 2 },
];

function satoState() {
  if (!S.sato) {
    // はじめは すぐ とれる はたけを 3つ よういしておく
    const old = Date.now() - 999999;
    S.sato = { inv: { sugar: 1 }, plots: [{ c: 'cacao', at: old, w: 0 }, { c: 'sugar', at: old, w: 0 }, { c: 'ichigo', at: old, w: 0 }, null, null, null], forest: 0, visits: 0 };
  }
  return S.sato;
}
const have = (k) => satoState().inv[k] || 0;
function addGood(k, n) { const v = satoState().inv; v[k] = Math.max(0, (v[k] || 0) + n); save(); }
function satoReward(yen, xp) {
  S.money += yen;
  save();
  addXP(xp);
  return yen;
}

/* ---------- え（SVG） ---------- */
// ねこ: 0 0 120 120。mood: normal / happy / bath（くびから うえだけ）
function catSVG(id, mood = 'normal') {
  const c = SATO_CATS[id], L = `stroke="${c.line}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const head = `
    <path d="M30 40 L28 14 L52 30 Z" fill="${c.body}" ${L}/><path d="M33 35 L32 21 L45 30 Z" fill="${c.ear}"/>
    <path d="M90 40 L92 14 L68 30 Z" fill="${c.body}" ${L}/><path d="M87 35 L88 21 L75 30 Z" fill="${c.ear}"/>
    <ellipse cx="60" cy="52" rx="36" ry="30" fill="${c.body}" ${L}/>
    ${c.patch ? `<path d="M50 24 q4 8 0 14 M60 22 v14 M70 24 q-4 8 0 14" stroke="${c.patch}" stroke-width="4" stroke-linecap="round" fill="none"/>` : ''}
    ${mood === 'happy' || mood === 'bath' ? `<path d="M40 52 q6 -7 12 0 M68 52 q6 -7 12 0" stroke="#5b4040" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="46" cy="51" rx="4.2" ry="5.2" fill="#5b4040"/><ellipse cx="74" cy="51" rx="4.2" ry="5.2" fill="#5b4040"/><circle cx="47.5" cy="49" r="1.5" fill="#fff"/><circle cx="75.5" cy="49" r="1.5" fill="#fff"/>`}
    <ellipse cx="36" cy="62" rx="6" ry="3.5" fill="#ffaac6" opacity=".7"/><ellipse cx="84" cy="62" rx="6" ry="3.5" fill="#ffaac6" opacity=".7"/>
    <path d="M57 58 h6 l-3 3 z" fill="#ff8fa8" stroke="#5b4040" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M60 61 q-3 5 -7 3 M60 61 q3 5 7 3" stroke="#5b4040" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M24 56 l-14 -3 M24 61 l-14 2 M96 56 l14 -3 M96 61 l14 2" stroke="#5b4040" stroke-width="1.6" stroke-linecap="round"/>
    ${id === 'sakura' ? `<g transform="translate(84 26)">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-6" rx="4.6" ry="6.4" fill="#ffb3cc" stroke="#5b4040" stroke-width="1.5" transform="rotate(${a})"/>`).join('')}<circle r="3" fill="#fff3a6" stroke="#5b4040" stroke-width="1.2"/></g>` : ''}`;
  if (mood === 'bath') return `<svg class="charsvg" viewBox="0 6 120 80">${head}</svg>`;
  return `<svg class="charsvg" viewBox="0 0 120 124">
    <ellipse cx="60" cy="118" rx="30" ry="5" fill="rgba(0,0,0,.1)"/>
    <path d="M86 104 q26 -2 20 -30 q-2 -8 -8 -4" fill="none" stroke="${c.line}" stroke-width="12" stroke-linecap="round"/>
    <path d="M86 104 q26 -2 20 -30 q-2 -8 -8 -4" fill="none" stroke="${c.patch || c.body}" stroke-width="7" stroke-linecap="round"/>
    <path d="M34 112 C28 86 40 72 60 72 C80 72 92 86 86 112 Z" fill="${c.body}" ${L}/>
    <ellipse cx="60" cy="96" rx="14" ry="12" fill="#fff" opacity=".7"/>
    <path d="M44 112 v-10 M76 112 v-10" stroke="${c.line}" stroke-width="2" stroke-linecap="round"/>
    ${head}</svg>`;
}

const SUSHI = [
  { id: 'sake',   name: 'サケ',   price: 100, plate: '#ffe27a', rim: '#e8b923', neta: '#ff9a6b', line: '#fff' },
  { id: 'maguro', name: 'まぐろ', price: 120, plate: '#a8dcff', rim: '#4ea5e0', neta: '#e8475f' },
  { id: 'ikura',  name: 'いくら', price: 150, plate: '#ffc0d6', rim: '#ec7aa5', gunkan: '#ff6a3d' },
  { id: 'uni',    name: 'うに',   price: 200, plate: '#d9c7ff', rim: '#9a76e6', gunkan: '#ffbf3a' },
];
const sushiOf = (id) => SUSHI.find(s => s.id === id);
function sushiSVG(id, priced = false) {
  const s = sushiOf(id);
  let top;
  if (s.gunkan) {
    const dots = s.id === 'ikura'
      ? [[22, 17], [29, 15], [36, 17], [25, 21], [33, 21], [40, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${s.gunkan}" stroke="#c43c1c" stroke-width="1"/><circle cx="${x - 1}" cy="${y - 1}" r="1" fill="#fff"/>`).join('')
      : [[20, 19], [26, 15], [33, 15], [40, 18], [30, 20]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.6" fill="${s.gunkan}" stroke="#d48b10" stroke-width="1"/>`).join('');
    top = `<rect x="14" y="17" width="32" height="14" rx="4" fill="#3e4a3a" ${SL}/><path d="M17 22 h26" stroke="#5f7055" stroke-width="1.6"/>${dots}`;
  } else {
    top = `<ellipse cx="30" cy="25" rx="16" ry="6.5" fill="#fff" ${SL}/>
      <path d="M12 21 q18 -12 36 0 q2 4 -4 5 q-14 3 -28 0 q-6 -1 -4 -5z" fill="${s.neta}" ${SL}/>
      ${s.line ? '<path d="M20 18 l4 5 M28 16 l4 6 M36 17 l4 5" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/>' : '<ellipse cx="22" cy="18" rx="4" ry="1.6" fill="#fff" opacity=".5"/>'}`;
  }
  return `<svg viewBox="0 0 60 ${priced ? 50 : 40}"><ellipse cx="30" cy="31" rx="27" ry="8" fill="${s.plate}" ${SL}/><ellipse cx="30" cy="30" rx="18" ry="4.5" fill="none" stroke="${s.rim}" stroke-width="2"/>${top}
    ${priced ? `<text x="30" y="49" font-size="10" font-weight="bold" text-anchor="middle" fill="#7b5a4f">${s.price}円</text>` : ''}</svg>`;
}

function goodSVG(k) {
  return `<svg viewBox="0 0 48 48">${{
    cacao: `<path d="M24 5c10 3 13 14 13 21s-5 17-13 17-13-10-13-17 3-18 13-21z" fill="#d98a3e" ${SL}/><path d="M24 7v34M17 10c-2 9-2 22 1 30M31 10c2 9 2 22-1 30" stroke="#a65a1f" stroke-width="1.8" fill="none"/>${ihi(18, 16, 2.4, 4)}`,
    sugar: `<path d="M12 16h24l3 26H9z" fill="#fff" ${SL}/><path d="M12 16l3-8h18l3 8" fill="#f3efe6" ${SL}/><rect x="15" y="24" width="18" height="10" rx="3" fill="#ffc0d6"/><text x="24" y="32" font-size="8" font-weight="bold" text-anchor="middle" fill="#c4507e">さとう</text>`,
    ichigo: ICONS.strawberry,
    takenoko: `<path d="M24 4c-8 10-15 22-15 30 0 6 7 9 15 9s15-3 15-9C39 26 32 14 24 4z" fill="#c9935b" ${SL}/><path d="M24 4c-4 9-6 18-6 27M24 4c4 9 6 18 6 27M10 30c8-3 20-3 28 0" stroke="#9a6534" stroke-width="1.8" fill="none"/><path d="M14 38c6 3 14 3 20 0" stroke="#f7e6c4" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    kinoko: `<rect x="18" y="24" width="12" height="18" rx="5" fill="#fff5e6" ${SL}/><path d="M6 26C6 12 15 6 24 6s18 6 18 20z" fill="#ff7a6e" ${SL}/><circle cx="16" cy="17" r="3.2" fill="#fff"/><circle cx="28" cy="13" r="2.6" fill="#fff"/><circle cx="33" cy="21" r="2.4" fill="#fff"/>`,
  }[k]}</svg>`;
}
const goodIc = (k) => `<span class="ic">${goodSVG(k)}</span>`;

// あたらしい おかしの アイコン
ICONS.ichigocookie = `<circle cx="24" cy="25" r="17" fill="#ffc6d8" ${IL}/><circle cx="24" cy="25" r="11" fill="#ffe1ea"/><path d="M24 33c-6-3-8-8-6-11 2-2 10-2 12 0 2 3 0 8-6 11z" fill="#ff5a6e" stroke="#5b4040" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 21c2 0 3-1 4-3 1 2 2 3 4 3" stroke="#6cc17a" stroke-width="2" fill="none" stroke-linecap="round"/>${ihi(15, 18, 3, 2.2)}`;
ICONS.gum = `<rect x="7" y="15" width="34" height="20" rx="4" fill="#9fe3cf" ${IL}/><rect x="7" y="22" width="34" height="6" fill="#fff"/><path d="M14 22v6M20 22v6M26 22v6M32 22v6" stroke="#6cc7ad" stroke-width="1.6"/><circle cx="36" cy="11" r="7" fill="#ffb3cc" ${IL}/>${ihi(34, 9, 2, 1.5)}`;
ICONS.chocolate = ICONS.choco;
ICONS.sakura = `${[0, 72, 144, 216, 288].map(a => `<path d="M24 24 C17 17 18 8 24 6 C30 8 31 17 24 24Z" fill="#ffb3cc" ${IL} transform="rotate(${a} 24 24)"/>`).join('')}<circle cx="24" cy="24" r="4" fill="#fff3a6" ${IL}/>`;
const icHTML = (name) => `<span class="ic">${iconSVG(name)}</span>`;
RECIPES.forEach(r => {
  if (!ITEMS.find(i => i.id === r.id)) ITEMS.push({ id: r.id, cat: 'food', name: r.name, icon: icHTML(r.id), price: 0, hidden: true });
});
Object.assign(FOOD_POWER, { ichigocookie: 25, gum: 10, chocolate: 25 });

// タウンの いりぐち（さくらの もんと みち）
function satoGateSVG() {
  const petals = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-5" rx="4" ry="5.4" fill="#ffc0d6" stroke="#7b5a4f" stroke-width="1.2" transform="rotate(${a})"/>`).join('')}<circle r="2.4" fill="#fff3a6"/></g>`;
  return `<svg viewBox="0 0 200 170">
    <ellipse cx="100" cy="162" rx="84" ry="7" fill="rgba(60,110,60,.16)"/>
    <path d="M70 162 L84 118 H116 L130 162 Z" fill="#f4e2c0" stroke="#7b5a4f" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M100 124 v8 M98 142 v8 M101 154 v4" stroke="#e2c99a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="40" cy="70" r="34" fill="#ffd0e0" stroke="#7b5a4f" stroke-width="2.2"/><circle cx="160" cy="70" r="34" fill="#ffd0e0" stroke="#7b5a4f" stroke-width="2.2"/>
    <circle cx="24" cy="58" r="12" fill="#ffe6ef"/><circle cx="146" cy="56" r="12" fill="#ffe6ef"/>
    <rect x="34" y="96" width="12" height="62" rx="4" fill="#c99a6b" stroke="#7b5a4f" stroke-width="2.2"/><rect x="154" y="96" width="12" height="62" rx="4" fill="#c99a6b" stroke="#7b5a4f" stroke-width="2.2"/>
    <path d="M30 58 Q100 22 170 58" fill="none" stroke="#7b5a4f" stroke-width="15" stroke-linecap="round"/>
    <path d="M30 58 Q100 22 170 58" fill="none" stroke="#f6a8c4" stroke-width="10" stroke-linecap="round"/>
    <path d="M40 54 Q100 26 160 54" fill="none" stroke="#ffd9e6" stroke-width="2.5" stroke-linecap="round"/>
    ${petals(30, 58, 1.4)}${petals(170, 58, 1.4)}${petals(64, 42, 1)}${petals(136, 42, 1)}${petals(100, 34, 1.2)}${petals(20, 86, .9)}${petals(176, 92, .9)}${petals(54, 76, .8)}
    <g transform="translate(150 108)">${catSVG('sakura').replace('<svg class="charsvg" viewBox="0 0 120 124">', '<g transform="scale(.42)">').replace('</svg>', '</g>')}</g>
  </svg>`;
}

/* ---------- がめん: さくらの さと（マップ） ---------- */
const SATO_SPOTS = {
  sushi:  { name: 'さくらの かいてんずし', land: [17, 46], port: [27, 44] },
  cook:   { name: 'クッキング',           land: [41, 34], port: [27, 23] },
  kanji:  { name: '木の はたけ',           land: [64, 36], port: [74, 44] },
  kinoko: { name: 'たけのこ＆きのこの さと', land: [87, 42], port: [74, 23] },
  onsen:  { name: 'ねこの おんせん',       land: [30, 80], port: [74, 66] },
  farm:   { name: 'カカオと さとうきびの はたけ', land: [60, 80], port: [27, 66] },
  bbq:    { name: 'バーベキュー',          land: [86, 86], port: [56, 90] },
};

function spotSVG(id) {
  const L = SL;
  switch (id) {
    case 'sushi': return `<svg viewBox="0 0 120 90">
      <rect x="14" y="10" width="92" height="56" rx="8" fill="#fff6e6" ${L}/><path d="M10 14 h100 l-6 14 H16 Z" fill="#7cc6ff" ${L}/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${22 + i * 16}" y="28" width="12" height="16" rx="2" fill="${i % 2 ? '#fff' : '#ff8fb8'}" ${L}/>`).join('')}
      <text x="60" y="24" font-size="10" font-weight="bold" text-anchor="middle" fill="#fff">すし</text>
      <ellipse cx="60" cy="70" rx="48" ry="16" fill="#e7eef6" ${L}/><ellipse cx="60" cy="70" rx="32" ry="8" fill="#fff" ${L}/>
      ${[[22, 70], [42, 82], [78, 82], [98, 70], [60, 58]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.2" fill="${['#ffe27a', '#a8dcff', '#ffc0d6', '#d9c7ff', '#ffe27a'][i]}" stroke="#5b4040" stroke-width="1.6"/><ellipse cx="${x}" cy="${y - 2}" rx="4" ry="2" fill="${['#ff9a6b', '#e8475f', '#ff6a3d', '#ffbf3a', '#ff9a6b'][i]}"/>`).join('')}
    </svg>`;
    case 'cook': return `<svg viewBox="0 0 120 90">
      <rect x="84" y="4" width="12" height="22" rx="2" fill="#d98a6a" ${L}/><path d="M90 0 q-6 -6 0 -10" stroke="#ddd" stroke-width="3" fill="none"/>
      <path d="M12 34 L60 8 L108 34 Z" fill="#ff9fbf" ${L}/><rect x="18" y="32" width="84" height="52" rx="4" fill="#fffaf0" ${L}/>
      <rect x="28" y="44" width="36" height="30" rx="4" fill="#bdbdc8" ${L}/><rect x="33" y="50" width="26" height="16" rx="3" fill="#ffb35c" stroke="#5b4040" stroke-width="1.6"/>
      <path d="M38 58 h16" stroke="#ff7a3a" stroke-width="2"/><circle cx="34" cy="70" r="1.6" fill="#5b4040"/><circle cx="58" cy="70" r="1.6" fill="#5b4040"/>
      <rect x="70" y="44" width="24" height="40" rx="3" fill="#ffd2a6" ${L}/><circle cx="90" cy="64" r="1.8" fill="#5b4040"/>
      <rect x="22" y="22" width="76" height="12" rx="6" fill="#fff" ${L}/><text x="60" y="31" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#d4558a">クッキング</text>
    </svg>`;
    case 'kanji': return `<svg viewBox="0 0 120 90">
      <path d="M8 46 Q60 30 112 46 L106 84 Q60 92 14 84 Z" fill="#c99a6b" ${L}/><path d="M14 56 Q60 46 106 56 M12 70 Q60 62 108 70" stroke="#a87a4e" stroke-width="2" fill="none"/>
      ${[[26, 50], [46, 46], [66, 46], [86, 50], [36, 66], [60, 64], [84, 66]].map(([x, y], i) => `<text x="${x}" y="${y}" font-size="${i < 4 ? 16 : 18}" font-weight="bold" text-anchor="middle" fill="${i < 4 ? '#fff6dc' : '#ffffff'}">${['木', '木', '木', '木', '林', '森', '林'][i]}</text>`).join('')}
      <circle cx="98" cy="24" r="14" fill="#8fd47c" ${L}/><rect x="95" y="34" width="6" height="14" rx="2" fill="#c99a6b" ${L}/><circle cx="92" cy="20" r="4" fill="#b5e8a3"/>
    </svg>`;
    case 'kinoko': return `<svg viewBox="0 0 120 90">
      <path d="M4 86 L46 14 Q52 6 58 14 L72 36 L84 26 Q88 22 92 26 L116 86 Z" fill="#9fd88a" ${L}/>
      <path d="M38 28 L46 14 Q52 6 58 14 L64 24 Q54 30 46 24 Z" fill="#fff" stroke="#5b4040" stroke-width="1.8" stroke-linejoin="round"/>
      <g transform="translate(22 50) scale(.62)">${goodSVG('takenoko').replace(/<\/?svg[^>]*>/g, '')}</g>
      <g transform="translate(70 52) scale(.6)">${goodSVG('kinoko').replace(/<\/?svg[^>]*>/g, '')}</g>
      <g transform="translate(46 60) scale(.42)">${goodSVG('takenoko').replace(/<\/?svg[^>]*>/g, '')}</g>
      <g transform="translate(92 66) scale(.4)">${goodSVG('kinoko').replace(/<\/?svg[^>]*>/g, '')}</g>
      <path d="M66 18 l3 3 l3 -3 l-3 -3z M28 40 l2 2 l2 -2 l-2 -2z" fill="#ffd45c"/>
    </svg>`;
    case 'onsen': return `<svg viewBox="0 0 120 90">
      <path d="M40 18 q-8 -8 0 -16 M60 16 q-8 -8 0 -16 M80 18 q-8 -8 0 -16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" class="steam"/>
      <ellipse cx="60" cy="58" rx="54" ry="26" fill="#b3a6a0" ${L}/>
      ${[[14, 50], [24, 72], [46, 82], [74, 82], [96, 72], [106, 50], [84, 36], [60, 32], [36, 36]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6.5" fill="#d8ccc4" stroke="#5b4040" stroke-width="1.8"/>`).join('')}
      <ellipse cx="60" cy="58" rx="40" ry="17" fill="#9fe0f0" stroke="#5b4040" stroke-width="1.8"/><path d="M34 56 q8 -4 16 0 M66 62 q8 -4 16 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g transform="translate(36 34) scale(.32)">${catSVG('sakura', 'bath').replace(/<\/?svg[^>]*>/g, '')}</g>
      <g transform="translate(64 38) scale(.28)">${catSVG('komugi', 'bath').replace(/<\/?svg[^>]*>/g, '')}</g>
      <rect x="58" y="62" width="0" height="0"/>
    </svg>`;
    case 'farm': return `<svg viewBox="0 0 120 90">
      <path d="M6 50 Q60 38 114 50 L110 86 H10 Z" fill="#c99a6b" ${L}/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M${66 + i * 9} 80 V${40 + (i % 2) * 6}" stroke="#4f9e3a" stroke-width="5" stroke-linecap="round"/><path d="M${66 + i * 9} 80 V${40 + (i % 2) * 6}" stroke="#86d66c" stroke-width="2.5" stroke-linecap="round"/><path d="M${63 + i * 9} ${58 + (i % 2) * 4} h6 M${63 + i * 9} ${68} h6" stroke="#3f7a2f" stroke-width="1.5"/><path d="M${66 + i * 9} ${42 + (i % 2) * 6} q8 -8 10 0 M${66 + i * 9} ${44 + (i % 2) * 6} q-8 -8 -10 0" stroke="#6cb85a" stroke-width="2.4" fill="none"/>`).join('')}
      <rect x="25" y="40" width="7" height="40" rx="2" fill="#a8784e" ${L}/><circle cx="28" cy="30" r="20" fill="#6cb85a" ${L}/><circle cx="20" cy="24" r="6" fill="#8fd47c"/>
      <ellipse cx="22" cy="50" rx="4.5" ry="7" fill="#e89a4a" stroke="#5b4040" stroke-width="1.6"/><ellipse cx="36" cy="54" rx="4.5" ry="7" fill="#d9792e" stroke="#5b4040" stroke-width="1.6"/><ellipse cx="30" cy="62" rx="4" ry="6" fill="#ffb84d" stroke="#5b4040" stroke-width="1.6"/>
    </svg>`;
    case 'bbq': return `<svg viewBox="0 0 120 90">
      <path d="M50 10 q-6 -6 0 -10 M66 12 q-6 -6 0 -10" stroke="#ddd" stroke-width="3" fill="none" stroke-linecap="round" class="steam"/>
      <path d="M30 56 l-12 30 M90 56 l12 30 M60 60 v26" stroke="#5b4040" stroke-width="4" stroke-linecap="round"/>
      <rect x="16" y="30" width="88" height="30" rx="6" fill="#6b6f7a" ${L}/><rect x="20" y="26" width="80" height="10" rx="3" fill="#ff7a3a" opacity=".8"/>
      <path d="M22 28 h76 M22 33 h76 ${[0, 1, 2, 3, 4, 5, 6].map(i => `M${28 + i * 11} 24 v12`).join(' ')}" stroke="#3d3d44" stroke-width="2"/>
      <ellipse cx="38" cy="24" rx="9" ry="5" fill="#ffd45c" stroke="#5b4040" stroke-width="1.6"/><path d="M33 24 h10" stroke="#e6b422" stroke-width="1.4"/>
      <ellipse cx="60" cy="24" rx="7" ry="5" fill="#6cc17a" stroke="#5b4040" stroke-width="1.6"/>
      <ellipse cx="80" cy="24" rx="8" ry="5" fill="#d99064" stroke="#5b4040" stroke-width="1.6"/>
    </svg>`;
  }
  return '';
}

function satoMapBG(m) {
  const W = m === 'land' ? 160 : 100, H = m === 'land' ? 100 : 150;
  const trees = (m === 'land' ? [[6, 30], [26, 26], [52, 22], [76, 24], [100, 22], [120, 26], [150, 28], [8, 66], [150, 64], [46, 58], [104, 60]] : [[8, 30], [50, 28], [92, 30], [6, 76], [94, 78], [50, 52], [50, 74], [8, 112], [92, 112]]);
  const petal = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffc0d6" stroke="#e98fb0" stroke-width=".4"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .4}" fill="#ffe6ef"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="sato-bg">
    <defs><linearGradient id="stsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9f2"/><stop offset="1" stop-color="#fff8ef"/></linearGradient>
      <linearGradient id="stgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8ecb4"/><stop offset="1" stop-color="#a9dc93"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#stsky)"/>
    <path d="M0 ${H * .22} Q${W * .2} ${H * .12} ${W * .42} ${H * .2} T${W} ${H * .16} V${H} H0Z" fill="#dff2d0"/>
    <path d="M0 ${H * .27} Q${W * .3} ${H * .2} ${W * .6} ${H * .26} T${W} ${H * .24} V${H} H0Z" fill="url(#stgr)"/>
    <path d="M${W * .04} ${H * .99} C${W * .3} ${H * .7} ${W * .2} ${H * .5} ${W * .5} ${H * .52} S${W * .8} ${H * .42} ${W * .98} ${H * .34}" fill="none" stroke="#f6e7c8" stroke-width="${m === 'land' ? 6 : 7}" stroke-linecap="round"/>
    <path d="M${W * .04} ${H * .99} C${W * .3} ${H * .7} ${W * .2} ${H * .5} ${W * .5} ${H * .52} S${W * .8} ${H * .42} ${W * .98} ${H * .34}" fill="none" stroke="#fffaf0" stroke-width="1" stroke-dasharray="2 4" stroke-linecap="round"/>
    ${trees.map(([x, y], i) => `<rect x="${x - .8}" y="${y}" width="1.6" height="5" fill="#b98a62"/>${petal(x, y - 1, 4.2)}${petal(x - 3, y + 1.5, 2.6)}${petal(x + 3, y + 1.2, 2.8)}`).join('')}
    ${Array.from({ length: 26 }, (_, i) => `<ellipse cx="${(i * 37) % W}" cy="${H * .3 + ((i * 53) % (H * .68))}" rx="1" ry=".6" fill="#ffd0e0" transform="rotate(${i * 40} ${(i * 37) % W} ${H * .3 + ((i * 53) % (H * .68))})"/>`).join('')}
  </svg>`;
}

function screenSato(msg) {
  setArea('sato');
  const st = satoState();
  st.visits = (st.visits || 0) + 1;
  save();
  const goods = Object.keys(GOODS).filter(k => have(k) > 0);
  $('#app').innerHTML = `
    <div class="screen sato">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>さくらの さと</h2>
        ${walletHTML()}
      </header>
      <div class="st-bag">${goods.length ? goods.map(k => `<span class="st-good">${goodIc(k)}<small>${GOODS[k].name}</small><b>${have(k)}</b></span>`).join('') : '<span class="muted">はたけや さとで ざいりょうを あつめよう</span>'}</div>
      <div class="sato-map" id="smap">
        <div class="st-petals">${Array.from({ length: 10 }, (_, i) => `<i style="left:${i * 10 + 3}%;animation-delay:${-i * 1.3}s;animation-duration:${9 + (i % 4) * 2}s"></i>`).join('')}</div>
        <div id="sbg"></div>
        <div id="sspots"></div>
        <div class="st-cat" id="cat-sakura">${catSVG('sakura')}<div class="wbubble"></div></div>
        <div class="st-cat komugi" id="cat-komugi">${catSVG('komugi')}<div class="wbubble"></div></div>
        <div class="st-me bounce">${charSVG(S.partner, petMood(), S.wear)}</div>
      </div>
    </div>`;
  const map = $('#smap');
  const say = (el, t) => { const b = el.querySelector('.wbubble'); b.textContent = t; b.classList.add('show'); clearTimeout(b._tm); b._tm = setTimeout(() => b.classList.remove('show'), 2600); };
  function layout() {
    const m = matchMedia('(orientation: portrait)').matches || innerWidth < 640 ? 'port' : 'land';
    map.dataset.m = m;
    $('#sbg').innerHTML = satoMapBG(m);
    $('#sspots').innerHTML = Object.entries(SATO_SPOTS).map(([id, p]) => `
      <button class="st-spot s-${id}" data-spot="${id}" style="left:${p[m][0]}%;top:${p[m][1]}%">${spotSVG(id)}<span class="st-name">${p.name}</span></button>`).join('');
    $$('.st-spot').forEach(b => b.onclick = () => openSpot(b.dataset.spot, b));
    const cs = { land: { sakura: [30, 54], komugi: [76, 62], me: [45, 47] }, port: { sakura: [14, 91], komugi: [50, 26], me: [86, 91] } }[m];
    const put = (el, [x, y]) => { el.style.left = x + '%'; el.style.top = y + '%'; };
    put($('#cat-sakura'), cs.sakura); put($('#cat-komugi'), cs.komugi); put($('.st-me'), cs.me);
  }
  function openSpot(id, b) {
    sfx('ok');
    b.classList.add('enter');
    setTimeout(() => ({ sushi: screenSushi, cook: screenCooking, kanji: startKanjiForest, kinoko: startKinokoGame, onsen: screenOnsen, farm: screenFarm, bbq: startBBQ })[id](), 300);
  }
  layout();
  const onR = () => { if (!document.body.contains(map)) { removeEventListener('resize', onR); return; } layout(); };
  addEventListener('resize', onR);
  $('#back').onclick = () => screenField();
  $('#cat-sakura').onclick = () => { sfx('tap'); say($('#cat-sakura'), pick(['さくらだにゃ! かいてんずしに きてね', 'おすし だいすき にゃ〜', 'おんせん ぽかぽか だにゃ'])); };
  $('#cat-komugi').onclick = () => { sfx('tap'); say($('#cat-komugi'), pick(['こむぎだにゃ。はたけで カカオが とれるよ', 'チョコレート つくりたいにゃ!', 'たけのこ さがし しよう!'])); };
  say($('#cat-sakura'), msg || (st.visits === 1 ? 'さくらの さとへ ようこそ にゃ!' : pick(['きょうは なにする にゃ?', 'いらっしゃい にゃ〜'])));
}

// ゲームの がめんの わく
function satoFrame(title, cls = '') {
  setArea('sato');
  $('#app').innerHTML = `
    <div class="screen sato ${cls}">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="さとへ">↩️</button>
        <h2>${title}</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior st-scene" id="scene"></section>
        <section class="panel" id="q"></section>
      </div>
    </div>`;
  $('#back').onclick = () => screenSato();
}
function satoDone(title, lines, yen, again) {
  sfx('fanfare');
  $('#q').innerHTML = `<div class="qcard done"><div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
    <h3>${title}</h3>${lines}${yen ? `<p>おこづかい <b>${yen}円</b></p>` : ''}
    <div class="row"><button class="btn ok" id="again">もう いっかい</button><button class="btn sub" id="toSato">さとへ</button></div></div>`;
  sparkle($('.reveal'), 20);
  bumpWallet();
  $('#again').onclick = again;
  $('#toSato').onclick = () => screenSato('たのしかったにゃ!');
}

/* ---------- かいてんずし ---------- */
function tankSVG() {
  return `<svg viewBox="0 0 160 90" class="su-tanksvg"><rect x="4" y="8" width="152" height="78" rx="8" fill="#bfe9ff" stroke="#5b4040" stroke-width="2.4"/>
    <rect x="4" y="8" width="152" height="14" rx="6" fill="#e6f7ff" stroke="#5b4040" stroke-width="2.4"/>
    <path d="M10 80 q10 -16 4 -30 M26 82 q-6 -12 2 -24 M142 80 q8 -14 0 -26" stroke="#5fbf7a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M8 84 h144" stroke="#e8d3a6" stroke-width="6"/>
    <g class="su-fish f1"><path d="M0 0 c8 -8 22 -8 28 0 c-6 8 -20 8 -28 0z" fill="#e8475f" stroke="#5b4040" stroke-width="1.8"/><path d="M28 0 l8 -6 v12z" fill="#e8475f" stroke="#5b4040" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="-1" r="1.6" fill="#5b4040"/></g>
    <g class="su-fish f2"><path d="M0 0 c8 -8 22 -8 28 0 c-6 8 -20 8 -28 0z" fill="#ff9a6b" stroke="#5b4040" stroke-width="1.8"/><path d="M28 0 l8 -6 v12z" fill="#ff9a6b" stroke="#5b4040" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="-1" r="1.6" fill="#5b4040"/></g>
    <circle cx="120" cy="40" r="3" fill="#fff" opacity=".8" class="su-bub"/><circle cx="60" cy="52" r="2.4" fill="#fff" opacity=".8" class="su-bub b2"/>
    <text x="80" y="19" font-size="9" font-weight="bold" text-anchor="middle" fill="#2f86c6">いけす</text></svg>`;
}

const SUSHI_ROUNDS = 3;
function screenSushi() {
  setArea('sato');
  const others = Object.keys(CHARS).filter(id => id !== S.partner);
  $('#app').innerHTML = `
    <div class="screen sato sushi">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="さとへ">↩️</button>
        <h2>さくらの かいてんずし</h2>
        ${walletHTML()}
      </header>
      <section class="su-shop">
        <div class="su-wall">
          <div class="su-tank">${tankSVG()}</div>
          <div class="su-menu">${SUSHI.map(s => `<span class="su-mi">${sushiSVG(s.id)}<b>${s.name}</b><small>${s.price}円</small></span>`).join('')}</div>
          <div class="su-chef">${catSVG('sakura', 'happy')}</div>
        </div>
        <div class="su-belt" id="belt"><div class="su-track"></div></div>
      </section>
      <section class="su-panel" id="q"></section>
    </div>`;
  $('#back').onclick = () => { stop(); screenSato(); };
  const belt = $('#belt');
  const g = { round: 0, score: 0, order: null, plates: [], running: true, last: 0, spawnGap: 0, picking: false };
  function stop() { g.running = false; }

  function newOrder() {
    const kinds = shuffle(SUSHI).slice(0, g.round === 0 ? 1 : rnd(1, 2));
    let left = g.round === 0 ? 2 : 4;
    const items = kinds.map((s, i) => { const n = i === kinds.length - 1 ? rnd(1, Math.min(3, left)) : rnd(1, Math.min(2, left - 1)); left -= n; return { id: s.id, n, got: 0 }; });
    const who = pick([...others, 'komugi']);
    g.order = { items, who };
    g.picking = true;
    drawOrder();
    const txt = items.map(it => `${sushiOf(it.id).name}を ${it.n}さら`).join('と ');
    speak(`${txt} ください`);
  }
  const whoSVG = (w) => (w === 'komugi' ? catSVG('komugi', 'happy') : charSVG(w, 'happy'));
  const whoName = (w) => (w === 'komugi' ? 'こむぎ' : nameOf(w));
  function drawOrder() {
    const o = g.order;
    $('#q').innerHTML = `<div class="qcard su-order">
      <div class="su-guest"><div class="su-gc">${whoSVG(o.who)}</div>
        <div class="bubble">${o.items.map(it => `<b>${sushiOf(it.id).name}</b>を ${it.n}さら`).join('と ')} ください!</div></div>
      <div class="su-need">${o.items.map(it => `<div class="su-row"><span class="su-ri">${sushiSVG(it.id)}</span><span class="su-cnt">${Array.from({ length: it.n }, (_, i) => `<i class="${i < it.got ? 'on' : ''}"></i>`).join('')}</span></div>`).join('')}</div>
      <p class="muted center">まわってくる おすしを タップして とろう（${g.round + 1} / ${SUSHI_ROUNDS}ばんめ）</p></div>`;
  }
  function spawn() {
    const need = g.order && g.picking ? g.order.items.filter(it => it.got < it.n) : [];
    const onBelt = (id) => g.plates.filter(p => p.k === id).length;
    let k;
    const want = need.filter(it => onBelt(it.id) < 2);
    if (want.length && Math.random() < 0.55) k = pick(want).id; else k = pick(SUSHI).id;
    const el = document.createElement('button');
    el.className = 'su-plate';
    el.innerHTML = sushiSVG(k);
    const p = { k, x: -80, el };
    el.onclick = () => takePlate(p);
    belt.appendChild(el);
    g.plates.push(p);
  }
  function takePlate(p) {
    if (!g.picking || p.taken) return;
    const it = g.order.items.find(i => i.id === p.k && i.got < i.n);
    if (!it) {
      sfx('ng');
      p.el.classList.remove('nope'); void p.el.offsetWidth; p.el.classList.add('nope');
      toast(g.order.items.some(i => i.id === p.k) ? 'それは もう とったよ' : `それは ${sushiOf(p.k).name}だよ`);
      return;
    }
    p.taken = true;
    it.got++;
    sfx('coin');
    p.el.classList.add('took');
    setTimeout(() => { p.el.remove(); }, 380);
    g.plates = g.plates.filter(q => q !== p);
    drawOrder();
    if (g.order.items.every(i => i.got >= i.n)) { g.picking = false; setTimeout(askBill, 500); }
  }
  function askBill() {
    const o = g.order;
    const total = o.items.reduce((s, it) => s + sushiOf(it.id).price * it.n, 0);
    const parts = o.items.map(it => ({ s: sushiOf(it.id), n: it.n, sub: sushiOf(it.id).price * it.n }));
    askQuestion($('#q'), {
      kind: 'keypad', cat: 'total', title: 'おかいけい',
      text: `${whoName(o.who)}の おさらは ぜんぶで いくら?`,
      visual: `<div class="su-bill">${parts.map(p => Array.from({ length: p.n }, () => `<span class="su-bp">${sushiSVG(p.s.id, true)}</span>`).join('')).join('')}</div>`,
      answer: total, suffix: '円',
      hints: [parts.map(p => `${p.s.name} ${p.s.price}円が ${p.n}さらで ${p.sub}円`).join('、'), parts.length > 1 ? `${parts.map(p => p.sub).join(' ＋ ')} を けいさん しよう` : `${parts[0].s.price}円を ${parts[0].n}かい たそう`],
      reveal: `${total}円`,
    }, (first) => {
      if (first) g.score++;
      g.round++;
      if (g.round >= SUSHI_ROUNDS) {
        stop();
        const yen = satoReward(10 + g.score * 5, 2 + g.score);
        satoDone('ごちそうさま!', `<p class="pay">${g.score} / ${SUSHI_ROUNDS} かい いっかいで せいかい!</p>`, yen, screenSushi);
      } else newOrder();
    });
  }
  function frame(t) {
    if (!g.running || !document.body.contains(belt)) return;
    const dt = g.last ? Math.min(50, t - g.last) : 16;
    g.last = t;
    const w = belt.clientWidth, v = Math.max(55, w / 14);
    g.plates.forEach(p => { p.x += v * dt / 1000; p.el.style.transform = `translateX(${p.x}px)`; });
    g.plates = g.plates.filter(p => { if (p.x > w + 10) { p.el.remove(); return false; } return true; });
    const first = g.plates.reduce((mn, p) => Math.min(mn, p.x), Infinity);
    if (first > 40) spawn();
    requestAnimationFrame(frame);
  }
  // さいしょから おさらを ならべておく
  for (let i = 0; i < 8; i++) { spawn(); g.plates[g.plates.length - 1].x = belt.clientWidth - i * 120 - 60; }
  newOrder();
  requestAnimationFrame(frame);
}

/* ---------- はたけ（カカオ・さとうきび・いちご） ---------- */
function plotStage(p) {
  if (!p) return -1;
  const f = (Date.now() - p.at + (p.w || 0) * 1000) / (CROPS[p.c].secs * 1000);
  return f >= 1 ? 3 : f >= 0.55 ? 2 : f >= 0.15 ? 1 : 0;
}
function plotLeft(p) { return Math.max(0, Math.ceil(CROPS[p.c].secs - (Date.now() - p.at) / 1000 - (p.w || 0))); }
function cropSVG(c, stage) {
  const soil = `<ellipse cx="50" cy="86" rx="40" ry="10" fill="#a8784e"/>`;
  if (stage === 0) return `<svg viewBox="0 0 100 100">${soil}<ellipse cx="50" cy="82" rx="6" ry="4" fill="#7a5236"/><path d="M50 80 q-2 -8 -6 -10 M50 80 q2 -8 6 -10" stroke="#6cc17a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  if (stage === 1) return `<svg viewBox="0 0 100 100">${soil}<path d="M50 84 V56" stroke="#4f9e3a" stroke-width="4" stroke-linecap="round"/><path d="M50 62 q-16 -10 -20 2 q12 6 20 -2 M50 58 q16 -12 20 0 q-12 6 -20 0" fill="#86d66c" ${SL}/></svg>`;
  const big = stage === 3;
  if (c === 'sugar') {
    return `<svg viewBox="0 0 100 100">${soil}${[30, 44, 58, 72].map((x, i) => `<path d="M${x} 86 V${big ? 14 + (i % 2) * 8 : 40 + (i % 2) * 6}" stroke="#4f9e3a" stroke-width="7" stroke-linecap="round"/><path d="M${x} 86 V${big ? 14 + (i % 2) * 8 : 40 + (i % 2) * 6}" stroke="${big ? '#b6e38f' : '#86d66c'}" stroke-width="4" stroke-linecap="round"/>${[0, 1, 2, 3].map(j => `<path d="M${x - 3} ${78 - j * (big ? 16 : 10)} h6" stroke="#3f7a2f" stroke-width="1.6"/>`).join('')}<path d="M${x} ${big ? 18 + (i % 2) * 8 : 42} q14 -8 16 4 M${x} ${big ? 20 + (i % 2) * 8 : 44} q-14 -8 -16 4" stroke="#6cb85a" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}</svg>`;
  }
  if (c === 'cacao') {
    return `<svg viewBox="0 0 100 100">${soil}<rect x="46" y="${big ? 40 : 52}" width="8" height="${big ? 46 : 34}" rx="3" fill="#a8784e" ${SL}/>
      <circle cx="50" cy="${big ? 30 : 44}" r="${big ? 30 : 20}" fill="#6cb85a" ${SL}/><circle cx="40" cy="${big ? 22 : 38}" r="${big ? 8 : 5}" fill="#8fd47c"/>
      ${big ? [[38, 52, '#e89a4a'], [62, 50, '#d9792e'], [50, 62, '#ffb84d']].map(([x, y, f]) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="10" fill="${f}" ${SL}/><path d="M${x} ${y - 9} v18" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>`).join('') : '<ellipse cx="56" cy="52" rx="4" ry="6" fill="#c9e68a" stroke="#5b4040" stroke-width="1.6"/>'}</svg>`;
  }
  return `<svg viewBox="0 0 100 100">${soil}<path d="M50 84 q-20 -4 -26 -18 q12 -8 26 8 q14 -16 26 -8 q-6 14 -26 18z" fill="#6cc17a" ${SL}/>
    <path d="M50 76 q-4 -20 -16 -24 M50 76 q4 -20 16 -24" stroke="#4f9e3a" stroke-width="2.5" fill="none"/>
    ${big ? [[30, 60], [52, 52], [70, 62]].map(([x, y]) => `<g transform="translate(${x - 12} ${y - 12}) scale(.5)">${ICONS.strawberry}</g>`).join('') : '<circle cx="36" cy="56" r="4" fill="#fff" stroke="#5b4040" stroke-width="1.4"/><circle cx="64" cy="56" r="4" fill="#fff" stroke="#5b4040" stroke-width="1.4"/>'}</svg>`;
}
let farmSeed = 'cacao';
function screenFarm(msg) {
  setArea('sato');
  const st = satoState();
  $('#app').innerHTML = `
    <div class="screen sato farm">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="さとへ">↩️</button>
        <h2>カカオと さとうきびの はたけ</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior fm-field"><div class="fm-sky"></div><div class="fm-plots" id="plots"></div>
          <div class="fm-cat">${catSVG('komugi', 'happy')}</div><div class="bubble fm-bubble" id="fmb">${msg || 'たねを えらんで、はたけを タップ!'}</div></section>
        <section class="menu">
          <div class="qcard"><h3 class="fm-h">たね</h3>
            <div class="fm-seeds">${Object.entries(CROPS).map(([k, c]) => `<button class="fm-seed ${k === farmSeed ? 'on' : ''}" data-seed="${k}"><span>${cropSVG(k, 3)}</span><b>${c.name}</b><small>${Math.round(c.secs / 60 * 10) / 10}ぷんで ${c.yield}${GOODS[c.good].unit}</small></button>`).join('')}</div>
            <p class="muted">そだっている ときに タップすると みずやり（はやく そだつよ）</p></div>
          <div class="qcard"><h3 class="fm-h">とれた もの</h3><div class="st-bag in" id="fmbag"></div>
            <button class="btn pink" id="toCook">クッキングへ いく</button></div>
        </section>
      </div>
    </div>`;
  const bubble = (t) => { $('#fmb').textContent = t; };
  function drawBag() { $('#fmbag').innerHTML = ['cacao', 'sugar', 'ichigo'].map(k => `<span class="st-good">${goodIc(k)}<small>${GOODS[k].name}</small><b>${have(k)}</b></span>`).join(''); }
  function draw() {
    $('#plots').innerHTML = st.plots.map((p, i) => {
      const s = plotStage(p);
      return `<button class="fm-plot ${s === 3 ? 'ready' : ''} ${s < 0 ? 'empty' : ''}" data-i="${i}">
        ${s < 0 ? '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="86" rx="40" ry="10" fill="#a8784e"/></svg><span class="fm-plus">＋</span>' : cropSVG(p.c, s)}
        <span class="fm-tag">${s < 0 ? 'あいてるよ' : s === 3 ? 'とれるよ!' : `あと ${plotLeft(p)}びょう`}</span></button>`;
    }).join('');
    $$('.fm-plot').forEach(b => b.onclick = () => tapPlot(+b.dataset.i, b));
  }
  function tapPlot(i, b) {
    const p = st.plots[i], s = plotStage(p);
    if (s < 0) {
      st.plots[i] = { c: farmSeed, at: Date.now(), w: 0 };
      sfx('tap'); save(); bubble(`${CROPS[farmSeed].name}の たねを まいたよ`);
    } else if (s === 3) {
      const c = CROPS[p.c];
      addGood(c.good, c.yield);
      st.plots[i] = null;
      save(); sfx('coin'); sparkle(b, 10);
      bubble(`${GOODS[c.good].name}が ${c.yield}${GOODS[c.good].unit} とれた!`);
      addXP(1);
      drawBag();
    } else {
      const max = CROPS[p.c].secs * 0.6;
      if ((p.w || 0) >= max) { bubble('みずは もう じゅうぶん。まってね'); return; }
      p.w = Math.min(max, (p.w || 0) + CROPS[p.c].secs * 0.15);
      save(); sfx('tap');
      b.classList.remove('water'); void b.offsetWidth; b.classList.add('water');
      bubble('みずを あげたよ。ぐんぐん そだつ!');
    }
    draw();
  }
  $$('.fm-seed').forEach(b => b.onclick = () => { farmSeed = b.dataset.seed; $$('.fm-seed').forEach(x => x.classList.toggle('on', x === b)); sfx('tap'); bubble(`${CROPS[farmSeed].name}の たねに したよ`); });
  $('#back').onclick = () => screenSato();
  $('#toCook').onclick = () => screenCooking();
  draw(); drawBag();
  const plots = $('#plots');
  const tm = setInterval(() => { if (!document.body.contains(plots)) { clearInterval(tm); return; } draw(); }, 1000);
}

/* ---------- クッキング ---------- */
function screenCooking(msg) {
  setArea('sato');
  satoState();
  const can = (r) => Object.entries(r.need).every(([k, n]) => have(k) >= n);
  $('#app').innerHTML = `
    <div class="screen sato cook">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="さとへ">↩️</button>
        <h2>クッキング</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior ck-kitchen">
          <div class="ck-oven">${spotSVG('cook')}</div>
          <div class="ck-cat">${catSVG('sakura', 'happy')}</div>
          <div class="ck-me bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
          <div class="bubble ck-bubble">${msg || 'なにを つくる にゃ?'}</div>
        </section>
        <section class="menu">
          <div class="qcard ck-menu"><h3 class="fm-h">メニュー</h3>
            ${RECIPES.map(r => `<div class="ck-rec ${can(r) ? '' : 'no'}">
              <span class="ck-ic">${iconSVG(r.id)}</span>
              <span class="ck-txt"><b>${r.name}</b><span class="ck-need">${Object.entries(r.need).map(([k, n]) => `<span class="${have(k) >= n ? 'ok' : 'ng'}">${goodIc(k)}${GOODS[k].name} ${n}<small>（${have(k)}）</small></span>`).join('')}</span></span>
              <button class="btn ${can(r) ? 'pink' : 'sub'}" data-r="${r.id}">つくる</button></div>`).join('')}
            <p class="muted">できた おかしは おうちで ${nameOf(S.partner)}に あげられるよ</p>
            <button class="btn sub" id="toFarm">はたけへ ざいりょうを とりに いく</button>
          </div>
        </section>
      </div>
    </div>`;
  $('#back').onclick = () => screenSato();
  $('#toFarm').onclick = () => screenFarm();
  $$('[data-r]').forEach(b => b.onclick = () => {
    const r = RECIPES.find(x => x.id === b.dataset.r);
    if (!can(r)) { sfx('ng'); toast('ざいりょうが たりないよ。はたけで とってこよう'); return; }
    sfx('tap');
    cookSteps(r);
  });
}
function cookSteps(r) {
  satoFrame(`${r.name}を つくろう`, 'cook');
  $('#back').onclick = () => screenCooking();
  const color = { ichigocookie: '#ffc6d8', gum: '#9fe3cf', chocolate: '#8b5a3c' }[r.id];
  $('#scene').innerHTML = `<div class="ck-bowlwrap"><div class="ck-bowl" id="bowl"><div class="ck-mix" style="background:${color}"></div>
    <div class="ck-ings">${Object.entries(r.need).map(([k, n]) => Array.from({ length: n }, () => `<span>${goodSVG(k)}</span>`).join('')).join('')}</div></div>
    <div class="ck-cat2">${catSVG('sakura', 'happy')}</div></div>`;
  let mix = 0;
  const N = 8;
  $('#q').innerHTML = `<div class="qcard"><p class="qtext">ボウルを タップして まぜまぜ しよう!</p>
    <div class="ck-meter"><i id="ckm"></i></div><button class="btn pink big" id="stir">まぜる!</button></div>`;
  const stir = () => {
    if (mix >= N) return;
    mix++;
    sfx('tap');
    const bw = $('#bowl');
    bw.classList.remove('stir'); void bw.offsetWidth; bw.classList.add('stir');
    bw.style.setProperty('--mix', mix / N);
    $('#ckm').style.width = mix / N * 100 + '%';
    if (mix >= N) { sfx('ok'); setTimeout(arrange, 600); }
  };
  $('#stir').onclick = stir;
  $('#bowl').onclick = stir;
  function arrange() {
    // かたに ならべる（九九）
    const per = rnd(2, 5), rows = rnd(2, 5), target = per * rows;
    $('#scene').innerHTML = `<div class="ck-tray"><div class="ck-cat2">${catSVG('sakura', 'happy')}</div><div class="bubble">${per}こずつ ならべてね!</div></div>`;
    askQuestion($('#q'), {
      kind: 'array', cat: 'kuku', title: 'かたに ならべよう',
      text: `${r.name}を 1れつに ${per}こずつ ならべて、ぜんぶで <b>${target}こ</b> に しよう!`,
      per, target, emoji: icHTML(r.id),
      hints: [`${per}の だんで かんがえよう`, `${per} × ? ＝ ${target}`],
      reveal: `${rows}れつ（${per} × ${rows} ＝ ${target}）`,
      speak: `${r.name}を 1れつに ${per}こずつ ならべて、ぜんぶで ${target}こに しよう`,
    }, () => finish());
  }
  function finish() {
    Object.entries(r.need).forEach(([k, n]) => addGood(k, -n));
    S.food[r.id] = (S.food[r.id] || 0) + r.make;
    save();
    addXP(3);
    sfx('fanfare');
    $('#scene').innerHTML = `<div class="ck-done"><div class="ck-plate">${Array.from({ length: r.make }, () => `<span>${iconSVG(r.id)}</span>`).join('')}</div><div class="ck-cat2">${catSVG('sakura', 'happy')}</div></div>`;
    $('#q').innerHTML = `<div class="qcard done"><h3>${r.name} できあがり!</h3><p class="pay">${r.name}を ${r.make}こ つくったよ</p>
      <p>おうちで ${nameOf(S.partner)}に あげてね</p>
      <div class="row"><button class="btn ok" id="more">ほかも つくる</button><button class="btn sub" id="home">おうちへ</button></div></div>`;
    sparkle($('.ck-plate'), 18);
    $('#more').onclick = () => screenCooking('つぎは なにを つくる にゃ?');
    $('#home').onclick = () => screenHome(`${r.name} おいしそう!`);
  }
}

/* ---------- 木の はたけ（かんじ） ---------- */
const KJ_FOREST = [
  ['木', '木', '林', 'はやし'], ['林', '木', '森', 'もり'], ['人', '木', '休', 'やすむ'], ['木', '寸', '村', 'むら'],
  ['木', '交', '校', 'こう'], ['日', '月', '明', 'あかるい'], ['田', '力', '男', 'おとこ'], ['口', '鳥', '鳴', 'なく'],
  ['日', '寺', '時', 'とき'], ['言', '十', '計', 'はかる'], ['木', '主', '柱', 'はしら'], ['木', '反', '板', 'いた'],
  ['木', '直', '植', 'うえる'], ['木', '黄', '横', 'よこ'], ['火', '田', '畑', 'はたけ'], ['山', '石', '岩', 'いわ'],
  ['日', '青', '晴', 'はれ'], ['糸', '会', '絵', 'え'], ['女', '市', '姉', 'あね'], ['言', '売', '読', 'よむ'],
];
const KJ_N = 5;
function startKanjiForest() {
  satoFrame('木の はたけ', 'kf');
  const st = satoState();
  const qs = [KJ_FOREST[0], KJ_FOREST[1], ...shuffle(KJ_FOREST.slice(2)).slice(0, KJ_N - 2)];
  const g = { i: 0, score: 0, grown: [] };
  function drawField() {
    $('#scene').innerHTML = `<div class="kf-field">${Array.from({ length: KJ_N }, (_, i) => {
      const k = g.grown[i];
      return `<div class="kf-slot ${k ? 'up' : ''}">${k ? `<div class="kf-tree">${treeSVG(i % 2 ? 'mint' : 'green')}</div><span class="kf-tag">${k}</span>` : '<span class="kf-sprout">🌱</span>'}</div>`;
    }).join('')}</div><div class="kf-cat">${catSVG('komugi', 'happy')}</div>
    <div class="bubble kf-bubble">${g.grown.length >= 2 ? '木 → 林 → 森 だにゃ!' : 'かんじを たして、木を そだてよう!'}</div>`;
  }
  function next() {
    drawField();
    if (g.i >= qs.length) return end();
    const [a, b, ans, yomi] = qs[g.i];
    const opts = shuffle([ans, ...shuffle(KJ_FOREST.filter(x => x[2] !== ans).map(x => x[2])).slice(0, 3)]);
    askQuestion($('#q'), {
      kind: 'choice', cat: 'kanji', title: `かんじ たしざん（${g.i + 1} / ${qs.length}）`,
      text: `<span class="kf-eq"><b>${a}</b> ＋ <b>${b}</b> ＝ <b class="kf-q">？</b></span>`,
      speak: `${a} たす ${b} は なんの かんじ?`,
      options: opts, answer: ans,
      hints: [`${a}と ${b}が はいっている かんじを さがそう`, `よみかたは「${yomi}」だよ`],
      reveal: `${ans}（${yomi}）`,
    }, (first) => {
      if (first) g.score++;
      g.grown.push(ans);
      toast(`${ans}（${yomi}）`);
      g.i++;
      next();
    });
  }
  function end() {
    st.forest = (st.forest || 0) + g.grown.length;
    save();
    const yen = satoReward(10 + g.score * 4, 2 + g.score);
    satoDone('もりが できた!', `<p class="pay">${g.score} / ${qs.length} もん いっかいで せいかい!</p><p class="kf-made">${g.grown.join(' ')}</p><p class="muted">いままでに そだてた 木: ${st.forest}ぽん</p>`, yen, startKanjiForest);
  }
  next();
}

/* ---------- ねこの おんせん ---------- */
function screenOnsen(msg) {
  setArea('sato');
  const p = pet();
  $('#app').innerHTML = `
    <div class="screen sato onsen">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="さとへ">↩️</button>
        <h2>ねこの おんせん</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior on-scene" id="pool">
          <div class="on-steam"><i></i><i></i><i></i><i></i></div>
          <div class="on-pool">
            <div class="on-water" id="water"></div>
            <div class="on-cat c1">${catSVG('sakura', 'bath')}</div>
            <div class="on-cat c2">${catSVG('komugi', 'bath')}</div>
            <div class="on-me" id="onme"></div>
            <div class="on-yuzu" style="left:30%"></div><div class="on-yuzu" style="left:62%;animation-delay:-1.2s"></div>
          </div>
          <div class="bubble on-bubble" id="onb">${msg || 'ぽかぽか だにゃ〜'}</div>
        </section>
        <section class="menu">
          <div class="qcard"><p class="qtext">おんせんで ${nameOf(S.partner)}を ぴかぴか・げんきに しよう</p>
            ${barHTML('きれい', '🛁', p.clean, 'c')}${barHTML('げんき', '💤', p.energy, 'e')}
            <button class="btn pink big" id="bathe">おんせんに はいる</button>
            <p class="muted">おゆを タップすると ちゃぷん!</p></div>
        </section>
      </div>
    </div>`;
  $('#back').onclick = () => screenSato();
  $('#water').onclick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const d = document.createElement('i');
    d.className = 'on-ripple';
    d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px';
    e.currentTarget.appendChild(d);
    setTimeout(() => d.remove(), 800);
    sfx('tap');
  };
  $('#bathe').onclick = () => {
    const pt = pet();
    const dirty = pt.clean < 80 || pt.energy < 70;
    pt.clean = 100;
    pt.energy = Math.min(100, pt.energy + 30);
    save();
    if (dirty) addXP(2);
    sfx('ok');
    $('#onme').innerHTML = charSVG(S.partner, 'happy', S.wear);
    $('#onme').classList.add('in');
    $('#onb').textContent = dirty ? 'ぽかぽか〜 きもちいい!' : 'もう ぴかぴか だね♪';
    $('#bathe').disabled = true;
    setTimeout(() => sparkle($('#onme'), 14), 500);
    setTimeout(() => screenOnsen(dirty ? 'ぴかぴかに なったにゃ!' : 'また きてにゃ〜'), 2600);
  };
}

/* ---------- バーベキュー ---------- */
const BBQ_FOODS = [
  { id: 'corn',  name: 'とうもろこし', col: '#ffd45c', svg: '<ellipse cx="24" cy="24" rx="9" ry="18" fill="#ffd45c" STROKE/><path d="M18 14h12M17 20h14M17 26h14M18 32h12M24 7v34" stroke="#e6b422" stroke-width="1.5"/><path d="M14 40c2-10 6-14 10-14M34 40c-2-10-6-14-10-14" stroke="#6cc17a" stroke-width="4" fill="none" stroke-linecap="round"/>' },
  { id: 'pman',  name: 'ピーマン',     col: '#6cc17a', svg: '<path d="M24 10c10 0 14 8 13 18s-6 14-13 14-12-4-13-14 3-18 13-18z" fill="#6cc17a" STROKE/><path d="M24 10v-5" stroke="#3f7a2f" stroke-width="4" stroke-linecap="round"/><path d="M24 14v26" stroke="#4f9e3a" stroke-width="1.6"/>' },
  { id: 'sausage', name: 'ウインナー', col: '#e88a64', svg: '<rect x="8" y="17" width="32" height="14" rx="7" fill="#e88a64" STROKE/><path d="M16 20l3 8M24 20l3 8M32 20l3 8" stroke="#b85a3a" stroke-width="1.6"/>' },
  { id: 'onion', name: 'たまねぎ',     col: '#fff2d6', svg: '<circle cx="24" cy="26" r="15" fill="#fff2d6" STROKE/><circle cx="24" cy="26" r="9" fill="none" stroke="#e8d0a0" stroke-width="2"/><circle cx="24" cy="26" r="4" fill="none" stroke="#e8d0a0" stroke-width="2"/>' },
];
const BBQ_SECS = 30;
function startBBQ() {
  satoFrame('バーベキュー', 'bbq');
  const st = satoState();
  const usable = ['takenoko', 'kinoko'].filter(k => have(k) > 0);
  $('#scene').innerHTML = `<div class="bq-wrap">
      <div class="bq-time"><span id="bqbar"></span></div>
      <div class="bq-grill" id="grill">${[0, 1, 2, 3].map(i => `<button class="bq-slot" data-i="${i}"><span class="bq-food"></span><span class="bq-meter"><i></i></span></button>`).join('')}</div>
      <div class="bq-plate" id="bqplate"></div>
      <div class="bq-cat">${catSVG('komugi', 'happy')}</div>
    </div>`;
  $('#q').innerHTML = `<div class="qcard"><h3 class="fm-h">やきかた</h3>
    <p class="qtext">いろが <b class="bq-good">きつねいろ</b>（メーターが みどり）に なったら タップして おさらへ!</p>
    <p class="muted">まだ なまの ときは まってね。こげたら やりなおし。</p>
    ${usable.length ? `<p class="bq-bonus">${usable.map(k => goodIc(k) + GOODS[k].name).join('・')}も やけるよ（ボーナス!）</p>` : '<p class="muted">たけのこ＆きのこの さとで とった ものも やけるよ</p>'}
    <button class="btn pink big" id="go">スタート!</button></div>`;
  $('#go').onclick = run;
  function foodSVG(f) {
    if (f.good) return goodSVG(f.good);
    return `<svg viewBox="0 0 48 48">${f.svg.replace(/STROKE/g, SL)}</svg>`;
  }
  function run() {
    const g = { t0: performance.now(), score: 0, burnt: 0, slots: [null, null, null, null], used: {}, alive: true };
    $('#q').innerHTML = `<div class="qcard"><p class="qtext center">やけた かず <b id="bqsc">0</b></p><p class="muted center">きつねいろで タップ!</p></div>`;
    const slots = $$('.bq-slot');
    const place = (i) => {
      const left = ['takenoko', 'kinoko'].filter(k => have(k) - (g.used[k] || 0) > 0);
      const f = left.length && Math.random() < 0.35 ? { good: pick(left), name: GOODS[pick(left)].name } : pick(BBQ_FOODS);
      if (f.good) f.name = GOODS[f.good].name;
      g.slots[i] = { f, p: 0, speed: 1 / (rnd(35, 55) / 10) };
      slots[i].querySelector('.bq-food').innerHTML = foodSVG(f);
      slots[i].classList.remove('done', 'burnt');
    };
    [0, 1, 2, 3].forEach(i => setTimeout(() => g.alive && place(i), i * 500));
    slots.forEach((b, i) => b.onclick = () => {
      const s = g.slots[i];
      if (!g.alive || !s) return;
      if (s.p < 0.7) { sfx('ng'); toast('まだ なまだよ'); return; }
      if (s.p <= 1.05) {
        const pts = s.f.good ? 2 : 1;
        g.score += pts;
        if (s.f.good) g.used[s.f.good] = (g.used[s.f.good] || 0) + 1;
        sfx('coin'); sparkle(b, 6);
        $('#bqplate').insertAdjacentHTML('beforeend', `<span>${foodSVG(s.f)}</span>`);
        $('#bqsc').textContent = g.score;
        b.classList.add('done');
      }
      g.slots[i] = null;
      b.querySelector('.bq-food').innerHTML = '';
      setTimeout(() => g.alive && place(i), 700);
    });
    let last = performance.now();
    function frame(t) {
      if (!g.alive || !document.body.contains(slots[0])) return;
      const dt = (t - last) / 1000; last = t;
      const el = (t - g.t0) / 1000;
      $('#bqbar').style.width = Math.max(0, 100 - el / BBQ_SECS * 100) + '%';
      g.slots.forEach((s, i) => {
        if (!s) return;
        s.p += s.speed * dt;
        const b = slots[i], fd = b.querySelector('.bq-food');
        const cook = Math.min(1, s.p), burn = Math.max(0, s.p - 1.05);
        fd.style.filter = `sepia(${cook * 0.6}) saturate(${1 + cook * 0.6}) brightness(${1 - burn * 1.6})`;
        const mi = b.querySelector('.bq-meter i');
        mi.style.width = Math.min(100, s.p / 1.3 * 100) + '%';
        mi.className = s.p < 0.7 ? '' : s.p <= 1.05 ? 'good' : 'bad';
        if (s.p > 1.3) {
          g.burnt++; g.slots[i] = null; fd.innerHTML = '<span class="bq-smoke">💨</span>'; b.classList.add('burnt');
          setTimeout(() => g.alive && place(i), 900);
        }
      });
      if (el >= BBQ_SECS) return end();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    function end() {
      g.alive = false;
      Object.entries(g.used).forEach(([k, n]) => addGood(k, -n));
      const yen = satoReward(Math.min(40, 10 + g.score * 2), 2 + Math.min(6, Math.floor(g.score / 2)));
      satoDone('いただきます!', `<p class="pay">${g.score}てん（こげちゃった: ${g.burnt}こ）</p>`, yen, startBBQ);
    }
  }
}

/* ---------- たけのこ＆きのこの さと ---------- */
const KN_SECS = 25;
function startKinokoGame() {
  satoFrame('たけのこ＆きのこの さと', 'kn');
  $('#scene').innerHTML = `<div class="kn-wrap">
    <div class="bq-time"><span id="knbar"></span></div>
    <div class="kn-hill">${Array.from({ length: 9 }, (_, i) => `<button class="kn-hole" data-i="${i}"><span class="kn-pop"></span><span class="kn-dirt"></span></button>`).join('')}</div>
    <div class="kn-basket"><span>${goodIc('takenoko')}<b id="knt">0</b></span><span>${goodIc('kinoko')}<b id="knk">0</b></span></div></div>`;
  $('#q').innerHTML = `<div class="qcard"><p class="qtext">つちから ひょこっと でてくる <b>たけのこ</b>と <b>きのこ</b>を タップして とろう!</p>
    <p class="muted">${KN_SECS}びょうで いくつ とれるかな?</p><button class="btn pink big" id="go">スタート!</button></div>`;
  $('#go').onclick = run;
  function run() {
    $('#q').innerHTML = `<div class="qcard"><p class="qtext center">でてきたら タップ!</p></div>`;
    const g = { t0: performance.now(), t: 0, k: 0, alive: true, holes: Array(9).fill(null) };
    const holes = $$('.kn-hole');
    holes.forEach((h, i) => h.onclick = () => {
      const o = g.holes[i];
      if (!g.alive || !o) return;
      g.holes[i] = null;
      clearTimeout(o.tm);
      o.kind === 'takenoko' ? g.t++ : g.k++;
      $('#knt').textContent = g.t; $('#knk').textContent = g.k;
      sfx('coin');
      h.classList.remove('up'); h.classList.add('got');
      setTimeout(() => h.classList.remove('got'), 300);
    });
    function pop() {
      if (!g.alive || !document.body.contains(holes[0])) return;
      const free = g.holes.map((o, i) => (o ? -1 : i)).filter(i => i >= 0);
      if (free.length) {
        const i = pick(free), kind = Math.random() < 0.55 ? 'takenoko' : 'kinoko';
        const el = (performance.now() - g.t0) / 1000;
        const life = Math.max(900, 1700 - el * 30);
        const h = holes[i];
        h.querySelector('.kn-pop').innerHTML = goodSVG(kind);
        h.classList.add('up');
        g.holes[i] = { kind, tm: setTimeout(() => { g.holes[i] = null; h.classList.remove('up'); }, life) };
      }
      setTimeout(pop, rnd(380, 700));
    }
    pop();
    (function tick() {
      if (!g.alive || !document.body.contains(holes[0])) return;
      const el = (performance.now() - g.t0) / 1000;
      $('#knbar').style.width = Math.max(0, 100 - el / KN_SECS * 100) + '%';
      if (el >= KN_SECS) {
        g.alive = false;
        holes.forEach(h => h.classList.remove('up'));
        return ask();
      }
      requestAnimationFrame(tick);
    })();
    function ask() {
      const { t, k } = g;
      const finish = (first) => {
        addGood('takenoko', t); addGood('kinoko', k);
        const yen = satoReward(Math.min(40, 8 + Math.floor((t + k) / 2) + (first ? 6 : 0)), 2 + (first ? 2 : 0));
        satoDone('たくさん とれたね!', `<p class="pay">${goodIc('takenoko')}たけのこ ${t}こ・${goodIc('kinoko')}きのこ ${k}こ</p><p class="muted">バーベキューで やけるよ</p>`, yen, startKinokoGame);
      };
      if (t + k === 0) return finish(false);
      const q = t === k
        ? { text: `たけのこ ${t}こ と きのこ ${k}こ。ぜんぶで いくつ?`, answer: t + k, hints: [`${t} ＋ ${k} を けいさん しよう`], reveal: `${t + k}こ` }
        : { text: `たけのこ ${t}こ、きのこ ${k}こ。${t > k ? 'たけのこ' : 'きのこ'}の ほうが いくつ おおい?`, answer: Math.abs(t - k), hints: [`おおい ほうから すくない ほうを ひこう`, `${Math.max(t, k)} − ${Math.min(t, k)} ＝ ?`], reveal: `${Math.abs(t - k)}こ` };
      askQuestion($('#q'), {
        kind: 'keypad', cat: 'total', title: 'かずの もんだい', suffix: 'こ',
        visual: `<div class="kn-count"><span>${Array.from({ length: t }, () => goodSVG('takenoko')).join('')}</span><span>${Array.from({ length: k }, () => goodSVG('kinoko')).join('')}</span></div>`,
        ...q,
      }, finish);
    }
  }
}

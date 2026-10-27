// 絵文字を イラスト（SVG）に おきかえる。アプリの なかの 絵文字は じどうで ここの え に なる。
const ICON_LINE = 'stroke="#5b4040" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
const IL = ICON_LINE;
const ihi = (x, y, rx = 3, ry = 2) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".75"/>`;

const ICONS = {
  icecream: `<path d="M16 24l8 20 8-20Z" fill="#eab676" ${IL}/><path d="M18 27l12 0M19.5 31l9 0M21 35l6 0" stroke="#c98a4a" stroke-width="1.6"/><circle cx="24" cy="17" r="10" fill="#ffc0d6" ${IL}/><circle cx="20" cy="9" r="2" fill="#ff5a6e"/>${ihi(20, 15, 3, 2.5)}`,
  elephant: `<ellipse cx="22" cy="28" rx="14" ry="11" fill="#b9c3cf" ${IL}/><circle cx="33" cy="20" r="9" fill="#b9c3cf" ${IL}/><path d="M39 24c3 5 2 11-2 13" fill="none" stroke="#5b4040" stroke-width="5" stroke-linecap="round"/><path d="M39 24c3 5 2 11-2 13" fill="none" stroke="#b9c3cf" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="27" cy="19" rx="5" ry="7" fill="#a3aebb" ${IL}/><circle cx="35" cy="18" r="1.6" fill="#5b4040"/><path d="M13 37v5M28 37v5" ${IL}/>`,
  train: `<rect x="10" y="9" width="28" height="28" rx="7" fill="#fff" ${IL}/><rect x="14" y="14" width="20" height="10" rx="3" fill="#bfe6ff" ${IL}/><rect x="10" y="27" width="28" height="4" fill="#ff6b6b"/><circle cx="17" cy="33" r="2" fill="#ffd45c"/><circle cx="31" cy="33" r="2" fill="#ffd45c"/><path d="M16 38l-4 5M32 38l4 5" ${IL}/>`,
  plane: `<path d="M8 27l30-12c4-1 6 2 3 4L14 33Z" fill="#fff" ${IL}/><path d="M22 22l-6-10 5-1 11 7Z" fill="#7cc6ff" ${IL}/><path d="M20 30l2 9 4-1 2-11Z" fill="#7cc6ff" ${IL}/><path d="M10 26l-3-6 4-1 4 5Z" fill="#ff8fb8" ${IL}/>`,
  strawberry: `<path d="M24 43C12 37 7 25 11 18c4-5 22-5 26 0 4 7-1 19-13 25Z" fill="#ff5a6e" ${IL}/>
    <g fill="#ffe680">${[[18, 24], [24, 22], [30, 24], [21, 30], [27, 30], [24, 36]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.3" ry="2"/>`).join('')}</g>
    <path d="M14 15c4 1 6-1 10-6 4 5 6 7 10 6-2 4-6 5-10 4-4 1-8 0-10-4Z" fill="#6cc17a" ${IL}/>${ihi(16, 22, 2.5, 3.5)}`,
  blueberry: `<circle cx="24" cy="26" r="15" fill="#7b8fe0" ${IL}/><path d="M19 15l2 4 3-3 3 3 2-4" fill="#4f5fb8" stroke="#3d4790" stroke-width="2" stroke-linejoin="round"/>${ihi(17, 23, 3, 4)}`,
  cherry: `<path d="M16 32C18 20 22 12 30 7M32 30C31 20 30 13 30 7" fill="none" stroke="#5aa35a" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M30 7c5-3 10-1 11 3-5 2-9 1-11-3Z" fill="#7fd37f" ${IL}/>
    <circle cx="15" cy="34" r="9" fill="#ff4f6a" ${IL}/><circle cx="33" cy="32" r="9" fill="#ff4f6a" ${IL}/>${ihi(12, 31, 2.2, 3)}${ihi(30, 29, 2.2, 3)}`,
  choco: `<rect x="9" y="10" width="30" height="30" rx="5" fill="#8b5a3c" ${IL}/><path d="M19 10v30M29 10v30M9 20h30M9 30h30" stroke="#a8724f" stroke-width="2"/>
    <path d="M27 40l12-12v12Z" fill="#d6dde6" ${IL}/><path d="M12 13h5" stroke="#b98262" stroke-width="2" stroke-linecap="round"/>`,
  peach: `<path d="M24 42c-10 0-16-7-16-15 0-8 7-13 16-9 9-4 16 1 16 9 0 8-6 15-16 15Z" fill="#ffb38a" ${IL}/><path d="M24 18c-3 7-3 15 0 24" fill="none" stroke="#f08a6a" stroke-width="2"/>
    <path d="M24 18c2-6 8-9 13-7-2 5-8 8-13 7Z" fill="#7fd37f" ${IL}/><ellipse cx="15" cy="28" rx="3" ry="4" fill="#ff8fab" opacity=".6"/>${ihi(14, 25)}`,
  apple: `<path d="M24 16c-6-4-16-2-16 10 0 9 7 17 12 17 2 0 3-1 4-1s2 1 4 1c5 0 12-8 12-17 0-12-10-14-16-10Z" fill="#ff6b6b" ${IL}/>
    <path d="M24 16c0-4 1-7 3-9" fill="none" ${IL}/><path d="M27 11c4-4 9-3 10 0-4 3-8 3-10 0Z" fill="#7fd37f" ${IL}/>${ihi(15, 23, 2.5, 4)}`,
  onigiri: `<path d="M24 7c4 0 17 23 17 29 0 5-5 6-17 6S7 41 7 36c0-6 13-29 17-29Z" fill="#fff" ${IL}/><rect x="15" y="29" width="18" height="13" rx="2" fill="#3f5246" ${IL}/>
    <ellipse cx="13" cy="28" rx="2.5" ry="1.6" fill="#ffb3c6"/><ellipse cx="35" cy="28" rx="2.5" ry="1.6" fill="#ffb3c6"/><circle cx="20" cy="23" r="1.4" fill="#5b4040"/><circle cx="28" cy="23" r="1.4" fill="#5b4040"/>`,
  milk: `<path d="M14 18l4-10h12l4 10v23H14Z" fill="#fff" ${IL}/><path d="M14 18h20" ${IL}/><rect x="14" y="24" width="20" height="10" fill="#9fd3ff"/>
    <path d="M24 26c-2 3-3 4-3 5a3 3 0 0 0 6 0c0-1-1-2-3-5Z" fill="#fff"/><path d="M14 18v23h20V18" fill="none" ${IL}/>`,
  cookie: `<circle cx="24" cy="24" r="16" fill="#eab676" ${IL}/><g fill="#7a4a2e">${[[18, 18], [29, 16], [31, 27], [20, 30], [25, 23], [16, 25]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>${ihi(15, 15)}`,
  pudding: `<ellipse cx="24" cy="40" rx="18" ry="4" fill="#fff" ${IL}/><path d="M13 39l4-24h14l4 24Z" fill="#ffd45c" ${IL}/><path d="M17 15h14l1 6c-3 2-5-1-8 1-3-2-5 1-8-1Z" fill="#a8582a" ${IL}/>
    <circle cx="24" cy="11" r="4" fill="#ff4f6a" ${IL}/>${ihi(19, 28, 1.6, 4)}`,
  pancake: `<ellipse cx="24" cy="36" rx="17" ry="6" fill="#e6a85c" ${IL}/><ellipse cx="24" cy="29" rx="17" ry="6" fill="#f0c27b" ${IL}/><ellipse cx="24" cy="22" rx="17" ry="6" fill="#f6d08f" ${IL}/>
    <path d="M10 22c4 4 24 4 28 0-2 3-1 7-3 7s-1-4-4-4c-5 1-12 1-16 0-2 3-3 5-4 2" fill="#b5651d" opacity=".75"/><rect x="20" y="15" width="8" height="6" rx="1.5" fill="#fff3a0" ${IL}/>`,
  cupcake: `<path d="M12 26h24l-4 16H16Z" fill="#ffb3cc" ${IL}/><path d="M18 26l2 16M24 26v16M30 26l-2 16" stroke="#e57ea6" stroke-width="2"/>
    <path d="M11 27c-2-6 3-10 7-9 0-6 12-6 12 0 4-1 9 3 7 9Z" fill="#fff" ${IL}/><circle cx="24" cy="12" r="4" fill="#ff4f6a" ${IL}/>
    <g fill="#7fd6c2"><rect x="16" y="22" width="4" height="1.6" rx=".8"/></g><g fill="#ffd45c"><rect x="27" y="20" width="4" height="1.6" rx=".8"/></g>`,
  cake: `<path d="M6 30L38 18v20H6Z" fill="#f6d79b" ${IL}/><path d="M6 30L38 18v6L6 36Z" fill="#ffd0de"/><path d="M6 30L38 18v20H6Z" fill="none" ${IL}/>
    <path d="M38 18v20l4-3V17Z" fill="#e8c27f" ${IL}/><path d="M5 30L38 17l4 0" fill="none" ${IL}/>
    <path d="M26 17c-4-2-5-6-2-8 2-1 4 0 5 2 2-1 4 0 4 2 0 3-4 4-7 4Z" fill="#ff5a6e" ${IL}/>`,
  coffee: `<ellipse cx="22" cy="40" rx="16" ry="4" fill="#fff" ${IL}/><path d="M10 20h24v10c0 6-5 10-12 10s-12-4-12-10Z" fill="#fff" ${IL}/><path d="M34 23c6 0 6 8 0 8" fill="none" ${IL}/>
    <ellipse cx="22" cy="20" rx="12" ry="3" fill="#a8724f" ${IL}/><path d="${'M18 13c-2-3 2-4 0-7M26 13c-2-3 2-4 0-7'}" fill="none" stroke="#c9b6c0" stroke-width="2" stroke-linecap="round"/><path d="M19 30l3 3 3-3a2 2 0 0 0-3-2 2 2 0 0 0-3 2Z" fill="#ff8fb8"/>`,
  juice: `<rect x="13" y="14" width="22" height="28" rx="3" fill="#ffd45c" ${IL}/><path d="M28 14l4-10h4" fill="none" stroke="#ff8fb8" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="29" r="6" fill="#ff9d3b" ${IL}/><path d="M24 23v12M18 29h12" stroke="#ffd45c" stroke-width="1.5"/>`,
  plant: `<path d="M24 26C20 18 12 16 8 18c2 6 9 9 16 8Z" fill="#7fd37f" ${IL}/><path d="M24 26c4-10 12-14 17-12-1 7-9 12-17 12Z" fill="#6cc17a" ${IL}/><path d="M24 26c-1-8 0-14 4-19 3 5 1 13-4 19Z" fill="#9fe38f" ${IL}/>
    <path d="M14 27h20l-3 15H17Z" fill="#ffb38a" ${IL}/><rect x="12" y="25" width="24" height="5" rx="2" fill="#ff9d7a" ${IL}/>`,
  clock: `<circle cx="13" cy="10" r="5" fill="#ffd45c" ${IL}/><circle cx="35" cy="10" r="5" fill="#ffd45c" ${IL}/><circle cx="24" cy="26" r="15" fill="#ff9fc1" ${IL}/><circle cx="24" cy="26" r="11" fill="#fff" ${IL}/>
    <path d="M24 26v-7M24 26l5 3" ${IL} fill="none"/><path d="M14 40l-3 4M34 40l3 4" ${IL}/>`,
  teddy: `<circle cx="13" cy="13" r="6" fill="#d9a06b" ${IL}/><circle cx="35" cy="13" r="6" fill="#d9a06b" ${IL}/><circle cx="24" cy="26" r="16" fill="#d9a06b" ${IL}/>
    <ellipse cx="24" cy="31" rx="7" ry="5.5" fill="#f3d9bc"/><ellipse cx="24" cy="29" rx="2.4" ry="1.8" fill="#5b4040"/><circle cx="18" cy="23" r="1.8" fill="#5b4040"/><circle cx="30" cy="23" r="1.8" fill="#5b4040"/>
    <path d="M30 40l4 4 4-4-4-3Z" fill="#ff6fa0" ${IL}/>`,
  picture: `<rect x="6" y="8" width="36" height="32" rx="3" fill="#ffd9a0" ${IL}/><rect x="11" y="13" width="26" height="22" fill="#cdeeff"/><path d="M11 35l8-11 6 7 4-4 8 8Z" fill="#8fd47c"/><circle cx="31" cy="19" r="3.5" fill="#ffd45c"/><rect x="11" y="13" width="26" height="22" fill="none" ${IL}/>`,
  books: `<rect x="7" y="12" width="9" height="30" rx="2" fill="#ff9fc1" ${IL}/><rect x="16" y="8" width="9" height="34" rx="2" fill="#7cc6ff" ${IL}/><rect x="25" y="14" width="8" height="28" rx="2" fill="#ffd45c" ${IL}/>
    <path d="M33 16l7-2 4 26-7 2Z" fill="#a98cf0" ${IL}/><path d="M7 18h9M16 14h9M25 20h8" stroke="#fff" stroke-width="2"/>`,
  sofa: `<rect x="9" y="12" width="30" height="16" rx="7" fill="#ffb3cc" ${IL}/><rect x="4" y="22" width="9" height="16" rx="4" fill="#ff9fc1" ${IL}/><rect x="35" y="22" width="9" height="16" rx="4" fill="#ff9fc1" ${IL}/>
    <rect x="11" y="27" width="26" height="11" rx="4" fill="#ffc9da" ${IL}/><path d="M9 38v4M39 38v4" ${IL}/><path d="M24 20l2 2 2-2a1.4 1.4 0 0 0-2-1.4 1.4 1.4 0 0 0-2 1.4Z" fill="#fff"/>`,
  bed: `<rect x="5" y="14" width="8" height="28" rx="3" fill="#c99a6b" ${IL}/><rect x="9" y="26" width="34" height="10" rx="3" fill="#fff" ${IL}/><rect x="9" y="20" width="10" height="7" rx="3" fill="#fff" ${IL}/>
    <path d="M18 24h25v12H18Z" fill="#a98cf0" ${IL}/><path d="M22 28h3M30 31h3M37 27h3" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M43 30v12" ${IL}/>`,
  map: `<path d="M5 13 Q5 9 9 8 L17 6 L31 9 L39 7 Q43 6 43 10 V35 Q43 38 40 39 L31 42 L17 39 L9 41 Q5 42 5 38Z" fill="#fff6d6" ${IL}/>
    <path d="M17 6 V39 L31 42 V9Z" fill="#ffe1ec"/><path d="M31 9 L39 7 Q43 6 43 10 V35 Q43 38 40 39 L31 42Z" fill="#d9f4ea"/>
    <path d="M17 6 V39 M31 9 V42" stroke="#5b4040" stroke-width="2"/>
    <path d="M9 32 q6 -6 12 -2 t14 -6" fill="none" stroke="#ffb43c" stroke-width="2.2" stroke-dasharray="1 3.5" stroke-linecap="round"/>
    <g transform="translate(10 15)"><path d="M0 6 L5 1 L10 6 V11 H0Z" fill="#fff" stroke="#5b4040" stroke-width="1.6" stroke-linejoin="round"/><path d="M-1 6 L5 0 L11 6" fill="none" stroke="#ff8fb8" stroke-width="2" stroke-linecap="round"/></g>
    <path d="M36 25 C30 19 30 14 33 12 C35 11 36 12 36 14 C36 12 37 11 39 12 C42 14 42 19 36 25Z" fill="#ff6f9e" ${IL} stroke-width="1.8"/><circle cx="34" cy="15" r="1.3" fill="#fff"/>`,
  gear: `<path d="M21 5h6l1 5 4 2 4-3 4 4-3 4 2 4 5 1v6l-5 1-2 4 3 4-4 4-4-3-4 2-1 5h-6l-1-5-4-2-4 3-4-4 3-4-2-4-5-1v-6l5-1 2-4-3-4 4-4 4 3 4-2Z" fill="#b9c7e6" ${IL}/><circle cx="24" cy="24" r="6" fill="#fff" ${IL}/>`,
  speaker: `<path d="M8 19h7l9-8v26l-9-8H8Z" fill="#7cc6ff" ${IL}/><path d="M30 18c3 3 3 9 0 12M35 13c6 6 6 16 0 22" fill="none" ${IL}/>`,
  bulb: `<path d="M24 6a12 12 0 0 0-7 22c1 1 2 3 2 5h10c0-2 1-4 2-5a12 12 0 0 0-7-22Z" fill="#ffe680" ${IL}/><rect x="19" y="33" width="10" height="8" rx="2" fill="#c9d1dc" ${IL}/>${ihi(19, 15, 2.5, 4)}<path d="M21 26l3-5 3 5" fill="none" stroke="#e0a400" stroke-width="2" stroke-linecap="round"/>`,
  purse: `<path d="M17 17c0-8 14-8 14 0" fill="none" stroke="#e09520" stroke-width="3"/><path d="M6 22c0-4 3-6 7-6h22c4 0 7 2 7 6v12c0 5-4 8-9 8H15c-5 0-9-3-9-8Z" fill="#ff9fc1" ${IL}/>
    <circle cx="20" cy="17" r="3" fill="#ffd45c" ${IL}/><circle cx="28" cy="17" r="3" fill="#ffd45c" ${IL}/><path d="M24 34l3-3a2 2 0 0 0-3-3 2 2 0 0 0-3 3Z" fill="#fff"/>`,
  plate: `<ellipse cx="24" cy="28" rx="16" ry="14" fill="#fff" ${IL}/><ellipse cx="24" cy="28" rx="10" ry="8.5" fill="none" stroke="#f3c6d8" stroke-width="2"/><path d="M5 10v12M5 10v6M2 10v6M8 10v6M5 22v18" ${IL}/><path d="M43 10c-3 2-4 8-1 12v18" fill="none" ${IL}/>`,
  bell: `<path d="M24 6c-8 0-12 7-12 15v8l-4 6h32l-4-6v-8c0-8-4-15-12-15Z" fill="#ffd45c" ${IL}/><circle cx="24" cy="39" r="4" fill="#ff9d3b" ${IL}/><circle cx="24" cy="5" r="2.5" fill="#ffd45c" ${IL}/>${ihi(18, 16, 2, 4)}`,
  servicebell: `<rect x="6" y="36" width="36" height="6" rx="3" fill="#ff9fc1" ${IL}/><path d="M9 36a15 15 0 0 1 30 0Z" fill="#ffd45c" ${IL}/><rect x="21" y="16" width="6" height="5" rx="2" fill="#ffd45c" ${IL}/><circle cx="24" cy="14" r="3" fill="#ff9d3b" ${IL}/>${ihi(16, 29, 2, 3)}`,
  coin: `<circle cx="24" cy="24" r="17" fill="#ffd45c" ${IL}/><circle cx="24" cy="24" r="12" fill="none" stroke="#e0a400" stroke-width="2"/><text x="24" y="30" font-size="15" font-weight="bold" fill="#c78a00" text-anchor="middle" font-family="sans-serif">円</text>`,
  basket: `<path d="M7 20h34l-4 20H11Z" fill="#e8b06a" ${IL}/><path d="M12 26h24M13 32h22M16 20l2 20M24 20v20M32 20l-2 20" stroke="#c48a4a" stroke-width="1.8"/><path d="M14 20c0-12 20-12 20 0" fill="none" stroke="#c48a4a" stroke-width="3"/><path d="M33 20l3-3 3 3-3 3Z" fill="#ff6fa0"/>`,
  dress: `<path d="M18 6l-2 8 4 4-11 24h30L28 18l4-4-2-8-3 4h-6Z" fill="#ff9fc1" ${IL}/><path d="M17 18h14" stroke="#fff" stroke-width="3"/><circle cx="24" cy="30" r="2" fill="#fff"/><circle cx="18" cy="36" r="2" fill="#fff"/><circle cx="30" cy="36" r="2" fill="#fff"/>`,
  ribbon: `<path d="M24 22L8 12c-3 4-3 16 0 20Z" fill="#ff6fa0" ${IL}/><path d="M24 22l16-10c3 4 3 16 0 20Z" fill="#ff6fa0" ${IL}/><path d="M22 24l-6 18 5-2 3 4M26 24l6 18-5-2-3 4" fill="#ff8fb8" ${IL}/><rect x="20" y="18" width="8" height="9" rx="3" fill="#ff9ec0" ${IL}/>`,
  bag: `<path d="M9 16h30l-2 26H11Z" fill="#a98cf0" ${IL}/><path d="M17 20v-6a7 7 0 0 1 14 0v6" fill="none" ${IL}/><path d="M24 33l4-4a2.5 2.5 0 0 0-4-3 2.5 2.5 0 0 0-4 3Z" fill="#fff"/>`,
  maru: `<circle cx="24" cy="24" r="16" fill="none" stroke="#ff5a6e" stroke-width="6"/>`,
  star: `<path d="M24 5l5.6 11.4 12.6 1.8-9.1 8.9 2.2 12.5L24 33.7l-11.3 5.9 2.2-12.5-9.1-8.9 12.6-1.8Z" fill="#ffd45c" ${IL}/>${ihi(20, 18, 2, 3)}`,
  heart: `<path d="M24 41C10 32 5 24 5 17c0-6 5-10 10-10 4 0 7 2 9 6 2-4 5-6 9-6 5 0 10 4 10 10 0 7-5 15-19 24Z" fill="#ff8fb8" ${IL}/>${ihi(13, 16, 2.5, 3.5)}`,
  sparkle: `<path d="M24 4c2 12 8 18 20 20-12 2-18 8-20 20-2-12-8-18-20-20 12-2 18-8 20-20Z" fill="#fff3a0" stroke="#ffc94a" stroke-width="2" stroke-linejoin="round"/>`,
  cloud: `<path d="M12 36a8 8 0 0 1 0-16 11 11 0 0 1 21-3 9 9 0 0 1 3 19Z" fill="#fff" stroke="#9fc4dc" stroke-width="2.4" stroke-linejoin="round"/>`,
  rainbow: `<g fill="none" stroke-width="5" stroke-linecap="round"><path d="M6 38a18 18 0 0 1 36 0" stroke="#ffb8cf"/><path d="M11 38a13 13 0 0 1 26 0" stroke="#fff3a0"/><path d="M16 38a8 8 0 0 1 16 0" stroke="#9fd9ff"/></g><ellipse cx="9" cy="39" rx="7" ry="4" fill="#fff"/><ellipse cx="39" cy="39" rx="7" ry="4" fill="#fff"/>`,
  zzz: `<text x="14" y="38" font-size="20" font-weight="bold" fill="#7a83c9" font-family="sans-serif">Z</text><text x="28" y="24" font-size="14" font-weight="bold" fill="#9aa2dd" font-family="sans-serif">z</text>`,
  tear: `<path d="M24 6c-7 11-11 17-11 23a11 11 0 0 0 22 0c0-6-4-12-11-23Z" fill="#8fd0ff" ${IL}/>${ihi(19, 28, 2, 3.5)}`,
  bath: `<path d="M6 24h36v6c0 7-6 12-13 12H19c-7 0-13-5-13-12Z" fill="#fff" ${IL}/><path d="M10 24V12a5 5 0 0 1 10 0" fill="none" ${IL}/><path d="M12 40l-2 4M36 40l2 4" ${IL}/>
    <g fill="#bfe6ff" stroke="#7cb8e0" stroke-width="1.8"><circle cx="16" cy="21" r="5"/><circle cx="25" cy="18" r="6"/><circle cx="34" cy="21" r="5"/></g><path d="M8 30h32" stroke="#7cc6ff" stroke-width="3"/>`,
  moon: `<path d="M30 6a18 18 0 1 0 12 28A15 15 0 0 1 30 6Z" fill="#ffe680" ${IL}/><circle cx="20" cy="22" r="2.4" fill="#e0b400"/><circle cx="26" cy="32" r="1.8" fill="#e0b400"/><path d="M38 10l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5Z" fill="#fff3a0"/>`,
  acorn: `<path d="M12 22c0 12 5 20 12 20s12-8 12-20Z" fill="#d9a06b" ${IL}/><path d="M9 22c0-7 7-11 15-11s15 4 15 11Z" fill="#8b5a3c" ${IL}/><path d="M24 11V5" ${IL}/><path d="M13 17h22M15 14h18" stroke="#a8724f" stroke-width="1.6"/>${ihi(18, 29, 2, 4)}`,
  pinecone: `<path d="M24 44c-9 0-13-10-13-20 0-9 6-17 13-20 7 3 13 11 13 20 0 10-4 20-13 20Z" fill="#b5835a" ${IL}/>
    <path d="M14 18c4 3 16 3 20 0M12 26c5 4 19 4 24 0M13 34c5 4 17 4 22 0M24 6v36M17 12l7 30M31 12l-7 30" fill="none" stroke="#8b5a3c" stroke-width="1.6"/>`,
  leaf: `<path d="M24 4l4 9 9-3-3 9 9 4-9 4 3 9-9-3-4 9-4-9-9 3 3-9-9-4 9-4-3-9 9 3Z" fill="#ff8a5c" ${IL}/><path d="M24 26v18" ${IL}/><path d="M24 26l-6-8M24 26l6-8M24 26V12" stroke="#d9603a" stroke-width="1.6"/>`,
  flower2: `<g fill="#ffb3cc" ${IL}>${[0, 72, 144, 216, 288].map(a => `<circle cx="${24 + 10 * Math.sin(a * Math.PI / 180)}" cy="${22 - 10 * Math.cos(a * Math.PI / 180)}" r="8"/>`).join('')}</g><circle cx="24" cy="22" r="6" fill="#ffe680" ${IL}/><path d="M24 30v14" stroke="#6cb85a" stroke-width="3"/>`,
  back: `<circle cx="24" cy="24" r="18" fill="#c9f0e4" ${IL}/><path d="M28 15l-10 9 10 9" fill="none" stroke="#5b4040" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
};

const EMOJI_ICON = {
  '🎂': 'cake', '🍦': 'icecream', '🐘': 'elephant', '🚃': 'train', '✈': 'plane',
  '🍓': 'strawberry', '🫐': 'blueberry', '🍒': 'cherry', '🍫': 'choco', '🍑': 'peach', '🍎': 'apple', '🍙': 'onigiri', '🥛': 'milk', '🍪': 'cookie', '🍮': 'pudding',
  '🥞': 'pancake', '🧁': 'cupcake', '🍰': 'cake', '☕': 'coffee', '🧃': 'juice', '🪴': 'plant', '⏰': 'clock', '🧸': 'teddy', '🖼': 'picture', '📚': 'books',
  '🛋': 'sofa', '🛏': 'bed', '🗺': 'map', '⚙': 'gear', '🔊': 'speaker', '💡': 'bulb', '👛': 'purse', '🍽': 'plate', '🔔': 'bell', '🛎': 'servicebell',
  '🪙': 'coin', '🧺': 'basket', '👗': 'dress', '🎀': 'ribbon', '🛍': 'bag', '⭕': 'maru', '⭐': 'star', '🌟': 'star', '✨': 'sparkle', '💫': 'sparkle',
  '💖': 'heart', '☁': 'cloud', '🌈': 'rainbow', '💤': 'zzz', '💧': 'tear', '↩': 'back', '🛁': 'bath', '🌙': 'moon', '🌰': 'acorn',
};
const ICON_RE = new RegExp(`(${Object.keys(EMOJI_ICON).join('|')})\\uFE0F?`, 'gu');
const iconSVG = (name) => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${ICONS[name]}</svg>`;

// 画面に でてきた 絵文字を ぜんぶ イラストに かえる
function iconify(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    ICON_RE.lastIndex = 0;
    if (ICON_RE.test(n.nodeValue)) hits.push(n);
  }
  hits.forEach(node => {
    const parent = node.parentNode;
    if (!parent) return;
    if (parent.namespaceURI === 'http://www.w3.org/2000/svg') {
      // SVG の <text> の なかの 絵文字
      if (parent.tagName !== 'text') return;
      const m = node.nodeValue.match(ICON_RE);
      const size = parseFloat(parent.getAttribute('font-size') || 16) * 1.15;
      const x = parseFloat(parent.getAttribute('x') || 0), y = parseFloat(parent.getAttribute('y') || 0);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      g.setAttribute('viewBox', '0 0 48 48');
      g.setAttribute('x', x - size / 2); g.setAttribute('y', y - size * 0.85);
      g.setAttribute('width', size); g.setAttribute('height', size);
      g.innerHTML = ICONS[EMOJI_ICON[m[0].replace('️', '')]];
      parent.replaceWith(g);
      return;
    }
    const frag = document.createElement('span');
    frag.innerHTML = node.nodeValue.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
      .replace(ICON_RE, (all, e) => `<span class="ic">${iconSVG(EMOJI_ICON[e])}</span>`);
    parent.replaceChild(frag, node);
    frag.replaceWith(...frag.childNodes);
  });
}

new MutationObserver((muts) => {
  for (const m of muts) {
    if (m.type === 'characterData') { if (m.target.parentNode) iconify(m.target.parentNode); continue; }
    m.addedNodes.forEach(n => { if (n.nodeType === 1) iconify(n); else if (n.nodeType === 3 && n.parentNode) iconify(n.parentNode); });
  }
}).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

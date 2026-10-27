'use strict';
// タウンの けしき（そら・おか・じめん・みち・き・はな・いけ）を 1まいの SVG で かく。
// フィールドの じっさいの おおきさ（px）で かくので、まるい ものが つぶれない。
// たてもの・いけの いちを はかって、そこと みちを よけて しょくぶつを おく。たねつき らんすうで まいかい おなじ けしきに なる。

const FS_LN = '#7b5a4f';
function fsRand(seed) {
  return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const fsN = (v) => Math.round(v * 10) / 10;

// まるを かさねた かたちを「そとがわだけ せん」で かく（き・しげみ）
function fsBlob(circles, fill, line = 2.2) {
  return circles.map(([x, y, r]) => `<circle cx="${fsN(x)}" cy="${fsN(y)}" r="${fsN(r + line / 2)}" fill="${FS_LN}"/>`).join('')
    + circles.map(([x, y, r]) => `<circle cx="${fsN(x)}" cy="${fsN(y)}" r="${fsN(r - line / 2)}" fill="${fill}"/>`).join('');
}

const FS_TREE = {
  green: ['#93d67f', '#74bf63', '#bdeaa8', '#ff7e8e'],
  pink: ['#ffc4d8', '#f4a3c1', '#ffe3ec', '#fff'],
  mint: ['#a4e3d1', '#7ccdb7', '#cdf3e7', '#fff3a0'],
  yellow: ['#ffe08a', '#f5c45e', '#fff1c2', '#ff9fbf'],
};
function fsTree(x, y, s, kind, R) {
  const [c, cd, cl, dot] = FS_TREE[kind];
  const k = (v) => v * s;
  const crown = [[x - k(13), y - k(40), k(15)], [x + k(13), y - k(40), k(15)], [x, y - k(55), k(18)], [x - k(4), y - k(36), k(15)]];
  const dots = Array.from({ length: 4 }, () => `<circle cx="${fsN(x + (R() - .5) * k(34))}" cy="${fsN(y - k(36) - R() * k(26))}" r="${fsN(k(2.6))}" fill="${dot}" stroke="${FS_LN}" stroke-width="1"/>`).join('');
  return `<g class="fs-tree">
    <ellipse cx="${fsN(x + k(3))}" cy="${fsN(y)}" rx="${fsN(k(22))}" ry="${fsN(k(6))}" fill="rgba(70, 120, 50, .22)"/>
    <path d="M${fsN(x - k(5))} ${fsN(y)} q${fsN(k(1))} ${fsN(-k(14))} ${fsN(k(1))} ${fsN(-k(30))} h${fsN(k(8))} q0 ${fsN(k(16))} ${fsN(k(1))} ${fsN(k(30))}z" fill="#c99a6b" stroke="${FS_LN}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${fsN(x + k(1))} ${fsN(y - k(2))} v${fsN(-k(26))}" stroke="rgba(123,90,79,.25)" stroke-width="${fsN(k(3))}"/>
    <g class="fs-crown" style="--d:${(R() * 3).toFixed(2)}s">${fsBlob(crown, c)}
      <ellipse cx="${fsN(x + k(6))}" cy="${fsN(y - k(33))}" rx="${fsN(k(19))}" ry="${fsN(k(9))}" fill="${cd}" opacity=".55"/>
      <circle cx="${fsN(x - k(7))}" cy="${fsN(y - k(60))}" r="${fsN(k(7))}" fill="${cl}"/><circle cx="${fsN(x - k(17))}" cy="${fsN(y - k(46))}" r="${fsN(k(4))}" fill="${cl}"/>
      ${dots}</g></g>`;
}
function fsBush(x, y, s, R, flowers = true) {
  const k = (v) => v * s;
  const fl = flowers ? Array.from({ length: 3 }, () => `<circle cx="${fsN(x + (R() - .5) * k(26))}" cy="${fsN(y - k(6) - R() * k(12))}" r="${fsN(k(2.4))}" fill="${['#ff9fbf', '#fff', '#ffd45c'][Math.floor(R() * 3)]}" stroke="${FS_LN}" stroke-width=".9"/>`).join('') : '';
  return `<ellipse cx="${fsN(x)}" cy="${fsN(y)}" rx="${fsN(k(17))}" ry="${fsN(k(4.5))}" fill="rgba(70, 120, 50, .2)"/>
    ${fsBlob([[x - k(9), y - k(7), k(8)], [x + k(9), y - k(7), k(8)], [x, y - k(12), k(10)]], '#84cf72', 2)}
    <ellipse cx="${fsN(x + k(4))}" cy="${fsN(y - k(5))}" rx="${fsN(k(12))}" ry="${fsN(k(4))}" fill="#6dbb5c" opacity=".5"/>
    <circle cx="${fsN(x - k(3))}" cy="${fsN(y - k(16))}" r="${fsN(k(3.5))}" fill="#b8e9a4"/>${fl}`;
}
function fsTuft(x, y, s, col) {
  return `<path d="M${fsN(x)} ${fsN(y)} q${fsN(-2 * s)} ${fsN(-5 * s)} ${fsN(-5 * s)} ${fsN(-7 * s)} M${fsN(x)} ${fsN(y)} q0 ${fsN(-6 * s)} ${fsN(1.2 * s)} ${fsN(-9 * s)} M${fsN(x)} ${fsN(y)} q${fsN(2 * s)} ${fsN(-4 * s)} ${fsN(5 * s)} ${fsN(-6 * s)}" stroke="${col}" stroke-width="${fsN(1.5 + s * .3)}" fill="none" stroke-linecap="round"/>`;
}
function fsFlower(x, y, s, col, line) {
  const r = 2.3 * s;
  return `<g transform="translate(${fsN(x)} ${fsN(y)})"><path d="M0 ${fsN(r)} v${fsN(4 * s)}" stroke="#6dbb5c" stroke-width="1.3"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${fsN(Math.sin(a * Math.PI / 180) * r)}" cy="${fsN(-Math.cos(a * Math.PI / 180) * r)}" r="${fsN(r * .78)}" fill="${col}"${line ? ` stroke="${FS_LN}" stroke-width=".9"` : ''}/>`).join('')}<circle r="${fsN(r * .5)}" fill="#ffe680"/></g>`;
}
const fsClover = (x, y, s) => `<g fill="#86cc74">${[[-2.2, 0], [2.2, 0], [0, -3]].map(([dx, dy]) => `<circle cx="${fsN(x + dx * s)}" cy="${fsN(y + dy * s)}" r="${fsN(2.4 * s)}"/>`).join('')}</g>`;

function fieldSceneSVG(field, m) {
  const W = field.clientWidth, H = field.clientHeight;
  if (!W || !H) return '';
  const R = fsRand(m === 'land' ? 20261024 : 1024);
  const rr = (a, b) => a + R() * (b - a);
  const fr = field.getBoundingClientRect();
  const horizon = H * .19;
  const RW = Math.max(24, Math.min(34, Math.min(W, H) * .05));
  const pz = PLAZA[m], P = (x, y) => [x / 100 * W, y / 100 * H];
  const [cx, cy] = P(pz[0], pz[1]);
  const plazaR = Math.max(62, Math.min(84, Math.min(W, H) * .13));
  const segs = [];
  Object.values(PLACES).forEach(p => { const [bx] = P(p[m][0], 0), [, by] = P(0, p[m][1] + 2); segs.push([cx, cy, bx, cy], [bx, cy, bx, by]); });
  const boxes = [...field.querySelectorAll('.bld')].map(b => { const r = b.getBoundingClientRect(); return [r.left - fr.left, r.top - fr.top + r.height * .1, r.right - fr.left, r.bottom - fr.top + 30]; });
  const pr = $('#plaza') ? $('#plaza').getBoundingClientRect() : null;
  const pond = pr ? [(pr.left + pr.right) / 2 - fr.left, (pr.top + pr.bottom) / 2 - fr.top, pr.width / 2, pr.height / 2] : [cx, cy, 80, 50];

  const bw = boxes.length ? (boxes[0][2] - boxes[0][0]) : 200;
  const segDist = (x, y, [ax, ay, bx, by]) => { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1; const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l)); return Math.hypot(x - ax - t * dx, y - ay - t * dy); };
  const roadDist = (x, y) => Math.min(Math.hypot(x - cx, y - cy) - plazaR, ...segs.map(s => segDist(x, y, s) - RW / 2));
  const inBox = (x, y, pad) => boxes.some(([a, b, c, d]) => x > a - pad && x < c + pad && y > b - pad && y < d + pad);
  const inPond = (x, y, pad) => ((x - pond[0]) / (pond[2] + pad)) ** 2 + ((y - pond[1]) / (pond[3] + pad)) ** 2 < 1;
  const free = (x, y, pad = 4) => y > horizon + 8 && x > 4 && x < W - 4 && y < H - 2 && roadDist(x, y) > pad && !inBox(x, y, pad) && !inPond(x, y, pad);
  const depth = (y) => .7 + .5 * Math.max(0, (y - horizon) / (H - horizon));

  let s = `<svg class="fscene" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>
    <linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcff"/><stop offset=".6" stop-color="#d7f0ff"/><stop offset="1" stop-color="#fff3ea"/></linearGradient>
    <linearGradient id="fs-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9ebaf"/><stop offset=".45" stop-color="#b6e29b"/><stop offset="1" stop-color="#a3d888"/></linearGradient>
    <radialGradient id="fs-lite"><stop offset="0" stop-color="#f4ffd6" stop-opacity=".55"/><stop offset="1" stop-color="#f4ffd6" stop-opacity="0"/></radialGradient>
    <radialGradient id="fs-dark"><stop offset="0" stop-color="#5fa94c" stop-opacity=".22"/><stop offset="1" stop-color="#5fa94c" stop-opacity="0"/></radialGradient>
  </defs>`;
  // そら・にじ
  s += `<rect width="${W}" height="${horizon + 40}" fill="url(#fs-sky)"/>`;
  const rbR = Math.min(W, H) * .24, rbx = W * .84, rby = horizon + 10;
  ['#ffb8cf', '#ffd0a8', '#fff3a0', '#b9f0c0', '#9fd9ff', '#c9b6ff'].forEach((c, i) => { const r = rbR - i * rbR * .055; s += `<path d="M${fsN(rbx - r)} ${fsN(rby)} A${fsN(r)} ${fsN(r)} 0 0 1 ${fsN(rbx + r)} ${fsN(rby)}" fill="none" stroke="${c}" stroke-width="${fsN(rbR * .055)}" opacity=".7"/>`; });
  // とおくの おか（うすい みどり）→ ちかくの おか
  const hills = (y0, amp, n, col, seedOff) => { let d = `M0 ${H} L0 ${fsN(y0)}`; const step = W / n; for (let i = 0; i < n; i++) { const h = amp * (.5 + .5 * Math.sin(i * 1.7 + seedOff)); d += ` Q${fsN(step * i + step / 2)} ${fsN(y0 - h * 2)} ${fsN(step * (i + 1))} ${fsN(y0)}`; } return `<path d="${d} L${W} ${H}Z" fill="${col}"/>`; };
  s += hills(horizon - H * .02, H * .045, Math.max(3, Math.round(W / 260)), '#d3ecc7', 1);
  for (let i = 0; i < Math.round(W / 70); i++) { const x = rr(0, W), y = horizon - H * .01 + rr(-4, 6); s += `<g opacity=".75"><rect x="${fsN(x - 1.2)}" y="${fsN(y - 6)}" width="2.4" height="7" fill="#b9a08a"/><circle cx="${fsN(x)}" cy="${fsN(y - 10)}" r="${fsN(rr(5, 8))}" fill="${R() < .3 ? '#f7d6e2' : '#bfe2ad'}"/></g>`; }
  s += hills(horizon + H * .02, H * .035, Math.max(2, Math.round(W / 380)), '#c2e7aa', 3.2);
  // じめん
  s += `<path d="M0 ${fsN(horizon + H * .035)} Q${fsN(W * .25)} ${fsN(horizon + H * .01)} ${fsN(W * .5)} ${fsN(horizon + H * .03)} T${W} ${fsN(horizon + H * .025)} L${W} ${H} L0 ${H}Z" fill="url(#fs-ground)"/>`;
  for (let i = 0; i < 9; i++) { const x = rr(0, W), y = rr(horizon + 20, H), r = rr(.12, .26) * Math.max(W, H); s += `<ellipse cx="${fsN(x)}" cy="${fsN(y)}" rx="${fsN(r)}" ry="${fsN(r * .55)}" fill="url(#fs-${i % 2 ? 'dark' : 'lite'})"/>`; }

  // みち: かげ → ふち → みち → まんなかの あかるさ → こいし
  const road = segs.map(([a, b, c, d]) => `M${fsN(a)} ${fsN(b)} L${fsN(c)} ${fsN(d)}`).join(' ');
  s += `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="${road}" stroke="rgba(90, 130, 60, .22)" stroke-width="${fsN(RW + 12)}" transform="translate(0 3)"/>
    <circle cx="${fsN(cx)}" cy="${fsN(cy + 3)}" r="${fsN(plazaR + 6)}" fill="rgba(90, 130, 60, .22)" stroke="none"/>
    <path d="${road}" stroke="#e2c58e" stroke-width="${fsN(RW + 7)}"/>
    <circle cx="${fsN(cx)}" cy="${fsN(cy)}" r="${fsN(plazaR + 3.5)}" fill="#e2c58e" stroke="none"/>
    <path d="${road}" stroke="#f9e9c3" stroke-width="${fsN(RW)}"/>
    <circle cx="${fsN(cx)}" cy="${fsN(cy)}" r="${fsN(plazaR)}" fill="#f9e9c3" stroke="none"/>
    <path d="${road}" stroke="#fff6df" stroke-width="${fsN(RW * .42)}" opacity=".8"/>
    <circle cx="${fsN(cx)}" cy="${fsN(cy)}" r="${fsN(plazaR - 10)}" fill="none" stroke="#fff6df" stroke-width="${fsN(RW * .42)}" opacity=".8"/></g>`;
  // こいし（みちの うえ）
  const pebble = (x, y) => { const r = rr(1.6, 3.4); return `<ellipse cx="${fsN(x)}" cy="${fsN(y)}" rx="${fsN(r * 1.3)}" ry="${fsN(r)}" fill="#ecd3a0" stroke="rgba(123,90,79,.35)" stroke-width=".9"/>`; };
  segs.forEach(([a, b, c, d]) => { const L = Math.hypot(c - a, d - b); for (let t = 0; t < L; t += rr(26, 60)) { const f = t / L, off = rr(-RW * .38, RW * .38); const x = a + (c - a) * f + (b === d ? 0 : off), y = b + (d - b) * f + (b === d ? off : 0); if (Math.hypot(x - cx, y - cy) > plazaR - 4 && !inBox(x, y, -10)) s += pebble(x, y); } });
  for (let i = 0; i < 18; i++) { const a = rr(0, Math.PI * 2), r = rr(plazaR * .78, plazaR * .95); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .9; if (!inPond(x, y, 2)) s += pebble(x, y); }

  // じめんの しょくぶつ: むれ（クラスタ）で おいて、すきまも のこす
  const items = [];
  const clusters = Math.round(W * H / 15000);
  for (let c = 0; c < clusters; c++) {
    let x, y, tries = 0;
    do { x = rr(0, W); y = rr(horizon + 10, H); } while (!free(x, y, 10) && ++tries < 20);
    if (tries >= 20) continue;
    const kind = R(), n = Math.round(rr(4, 10)), spread = rr(14, 34) * depth(y), fcol = ['#fff', '#ffb3cc', '#fff3a0', '#d9c8ff', '#bfe6ff', '#ffc9a8'][Math.floor(R() * 6)];
    for (let i = 0; i < n; i++) {
      const px = x + (R() - .5) * spread * 2, py = y + (R() - .5) * spread;
      if (!free(px, py, 3)) continue;
      const sc = depth(py) * rr(.75, 1.3);
      if (kind < .3) items.push([py, fsTuft(px, py, sc, R() < .7 ? '#6fba5d' : '#d6f3c2')]);
      else if (kind < .68) items.push([py, R() < .8 ? fsFlower(px, py, sc * rr(.8, 1.3), fcol, sc > 1) : fsTuft(px, py, sc, '#6fba5d')]);
      else if (kind < .88) items.push([py, fsClover(px, py, sc)]);
      else items.push([py, `<ellipse cx="${fsN(px)}" cy="${fsN(py)}" rx="${fsN(2.6 * sc)}" ry="${fsN(1.3 * sc)}" fill="${R() < .5 ? '#ffd3e2' : '#fff6b8'}" transform="rotate(${Math.round(rr(-40, 40))} ${fsN(px)} ${fsN(py)})"/>`]);
    }
  }
  // みちぞいの くさ
  segs.forEach(([a, b, c, d]) => { const L = Math.hypot(c - a, d - b); for (let t = 10; t < L; t += rr(28, 70)) { const f = t / L, side = R() < .5 ? -1 : 1; const o = RW / 2 + rr(5, 9); const x = a + (c - a) * f + (b === d ? 0 : side * o), y = b + (d - b) * f + (b === d ? side * o : 0) + 4; if (free(x, y, 0)) items.push([y, R() < .75 ? fsTuft(x, y, depth(y) * rr(.8, 1.1), '#6fba5d') : fsFlower(x, y, depth(y), pick(['#fff', '#ffb3cc', '#fff3a0']), false)]); } });
  // みちぞいの ひくい うえこみ（たまに）
  segs.forEach(([a, b, c, d]) => { const L = Math.hypot(c - a, d - b); for (let t = 60; t < L - 40; t += rr(140, 220)) { const f = t / L, side = R() < .5 ? -1 : 1; const o = RW / 2 + 16 * depth(b); const x = a + (c - a) * f + (b === d ? 0 : side * o), y = b + (d - b) * f + (b === d ? (side > 0 ? o + 14 : -o + 4) : 10); if (free(x, y, 6) && free(x, y - 18, 2)) items.push([y, fsBush(x, y, depth(y) * bw / 170, R)]); } });
  // ひろばの かだん
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    const x = cx + sx * (plazaR + RW * 1.6), y = cy + sy * (plazaR * .75 + RW);
    if (!free(x - 34 * bw / 160, y, 4) || !free(x + 34 * bw / 160, y, 4)) return;
    const k = bw / 160;
    let bed = `<ellipse cx="${fsN(x)}" cy="${fsN(y + 2 * k)}" rx="${fsN(32 * k)}" ry="${fsN(10 * k)}" fill="rgba(70,120,50,.18)"/><ellipse cx="${fsN(x)}" cy="${fsN(y)}" rx="${fsN(30 * k)}" ry="${fsN(10 * k)}" fill="#d8b089" stroke="${FS_LN}" stroke-width="1.8"/><ellipse cx="${fsN(x)}" cy="${fsN(y - k)}" rx="${fsN(25 * k)}" ry="${fsN(7 * k)}" fill="#b98d68"/>`;
    const fc = ['#ffb3cc', '#fff3a0', '#d9c8ff', '#fff'];
    for (let i = 0; i < 7; i++) bed += fsFlower(x + (-18 + i * 6) * k, y + (-4 + (i % 2) * 4) * k, 1.4 * k, fc[(i + (sx > 0 ? 1 : 0)) % 4], true);
    items.push([y, bed]);
  });
  // たてものの わきの しげみ
  boxes.forEach(([a, b, c, d], i) => { [[a + 6, d - 34], [c - 6, d - 34]].forEach(([x, y], j) => { if ((i + j) % 2 === 0 && free(x, y, 0) && roadDist(x, y) > 10) items.push([y, fsBush(x, y, depth(y) * bw / 150, R)]); }); });
  // き: はしと ひろい ところに。とおくは ちいさく
  const kinds = ['green', 'pink', 'mint', 'green', 'yellow', 'pink'];
  const want = Math.round(W * H / (bw * bw * 2.1)) + 3;
  let placed = 0, guard = 0;
  const trees = [];
  while (placed < want && guard++ < 400) {
    const edge = R() < .65;
    const x = edge ? (R() < .5 ? rr(10, W * .12) : rr(W * .88, W - 10)) : rr(20, W - 20);
    const y = rr(horizon + 30, H - 4), sc = depth(y) * (bw / 150) * rr(.8, 1.1);
    const top = y - 75 * sc;
    if (!free(x, y, 14) || !free(x, top + 30 * sc, 10) || !free(x - 26 * sc, y - 40 * sc, 2) || !free(x + 26 * sc, y - 40 * sc, 2)) continue;
    if (trees.some(([tx, ty, ts]) => Math.hypot(tx - x, (ty - y) * 1.4) < 70 * Math.max(ts, sc))) continue;
    trees.push([x, y, sc]);
    items.push([y, fsTree(x, y, sc, kinds[placed % kinds.length], R)]);
    placed++;
  }
  items.sort((p, q) => p[0] - q[0]);
  s += items.map(it => it[1]).join('');
  return s + '</svg>';
}

// いけ: ふちの いし・みずの こさ・はもん・すいれん・あし
function pondSVG() {
  const stones = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2, x = 70 + Math.cos(a) * 62, y = 54 + Math.sin(a) * 31; const r = 4.6 + (i * 7 % 5) * .5; return `<ellipse cx="${fsN(x)}" cy="${fsN(y)}" rx="${fsN(r * 1.25)}" ry="${fsN(r)}" fill="${i % 3 ? '#e9e2d6' : '#d9d0c4'}" stroke="${FS_LN}" stroke-width="1.4"/>`; }).join('');
  return `<svg viewBox="0 0 140 92">
    <defs><radialGradient id="fs-water" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#7cc4f2"/><stop offset=".7" stop-color="#9dd6ff"/><stop offset="1" stop-color="#c3e9ff"/></radialGradient></defs>
    <ellipse cx="70" cy="58" rx="68" ry="33" fill="rgba(70, 120, 50, .25)"/>
    <ellipse cx="70" cy="54" rx="67" ry="35" fill="#9fdb87" stroke="${FS_LN}" stroke-width="1.8"/>
    <path d="M10 54 C10 31 40 23 70 24 C103 23 130 32 130 54 C129 75 100 83 70 83 C39 83 10 76 10 54Z" fill="url(#fs-water)" stroke="${FS_LN}" stroke-width="2"/>
    <path d="M16 50 C20 34 44 28 70 28 C96 28 118 34 124 48" fill="none" stroke="rgba(40, 90, 140, .18)" stroke-width="5" stroke-linecap="round"/>
    <g fill="none" stroke="#fff" stroke-linecap="round" opacity=".85" stroke-width="1.6"><ellipse class="pond-ring" cx="52" cy="60" rx="9" ry="3.2"/><ellipse class="pond-ring r2" cx="92" cy="46" rx="7" ry="2.6"/><path d="M28 44 q8 -4 16 0 M60 38 q6 -3 12 0 M86 66 q7 -3 14 0"/></g>
    ${stones}
    <g><ellipse cx="34" cy="60" rx="9" ry="5" fill="#86d36f" stroke="${FS_LN}" stroke-width="1.5"/><path d="M34 60 l8 -3" stroke="${FS_LN}" stroke-width="1.5"/>
      <g transform="translate(31 56)">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="${fsN(Math.sin(a * Math.PI / 180) * 2.4)}" cy="${fsN(-Math.cos(a * Math.PI / 180) * 2.4)}" rx="1.8" ry="2.6" fill="#ffc4d8" stroke="${FS_LN}" stroke-width=".7" transform="rotate(${a} ${fsN(Math.sin(a * Math.PI / 180) * 2.4)} ${fsN(-Math.cos(a * Math.PI / 180) * 2.4)})"/>`).join('')}<circle r="1.4" fill="#ffe680"/></g></g>
    <g><ellipse cx="104" cy="40" rx="8" ry="4.5" fill="#86d36f" stroke="${FS_LN}" stroke-width="1.5"/><path d="M104 40 l7 -2" stroke="${FS_LN}" stroke-width="1.5"/></g>
    <g><ellipse cx="62" cy="72" rx="6" ry="3.2" fill="#86d36f" stroke="${FS_LN}" stroke-width="1.3"/></g>
    <g class="pond-fish"><path d="M66 50 c4 -6 12 -6 15 0 c-3 6 -11 6 -15 0z" fill="#ff9d3b" stroke="${FS_LN}" stroke-width="1.4"/><path d="M80 50 l5 -4 v8z" fill="#ff9d3b" stroke="${FS_LN}" stroke-width="1.4"/><circle cx="70" cy="49" r="1.2" fill="${FS_LN}"/></g>
    <g stroke="${FS_LN}" stroke-width="1.2" stroke-linecap="round"><path d="M14 46 q-1 -12 2 -20" fill="none"/><path d="M19 47 q0 -10 4 -16" fill="none"/><path d="M10 49 q-3 -8 -2 -13" fill="none"/>
      <rect x="14.6" y="22" width="3.4" height="9" rx="1.7" fill="#c99a6b"/><rect x="21.4" y="27.5" width="3" height="7" rx="1.5" fill="#c99a6b"/></g>
    <g transform="translate(112 62)"><rect x="-2" y="-2" width="4.5" height="22" rx="1.5" fill="#c99a6b" stroke="${FS_LN}" stroke-width="1.4"/><rect x="-23" y="-17" width="46" height="17" rx="4" fill="#f3d3a3" stroke="${FS_LN}" stroke-width="1.8"/><path d="M-20 -12 h40" stroke="rgba(150,100,60,.15)" stroke-width="1.5"/><circle cx="-19.5" cy="-8.5" r="1.3" fill="${FS_LN}"/><circle cx="19.5" cy="-8.5" r="1.3" fill="${FS_LN}"/><text x="0" y="-5" font-size="9" font-weight="bold" fill="#2f78b0" text-anchor="middle">さかなつり</text></g>
  </svg>`;
}

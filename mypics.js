'use strict';
// じぶんの え: おうちのひとが えらんだ キャラの絵を、この iPhone / iPad の なか（IndexedDB）だけに ほぞんして つかう。
// ネットには あげない。サイトに おくのは オリジナル版だけで OK。

const MYPICS_DB = 'yumeiro-mypics';
const MYPICS_MOODS = [['normal', 'ふつう'], ['happy', 'にこにこ'], ['sad', 'しょんぼり']];
const CHAR_IMAGES_BASE = JSON.parse(JSON.stringify(window.CHAR_IMAGES || {}));
let myPicURLs = [];
let myPicNames = {};
let myPicHas = {};

function picsDB() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open(MYPICS_DB, 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('pics');
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
async function picsTx(mode, fn) {
  const db = await picsDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('pics', mode);
    const st = tx.objectStore('pics');
    const out = fn(st);
    tx.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
    tx.onerror = () => rej(tx.error);
  });
}
const picsGetAll = () => picsDB().then(db => new Promise((res, rej) => {
  const all = {};
  const rq = db.transaction('pics').objectStore('pics').openCursor();
  rq.onsuccess = () => { const c = rq.result; if (c) { all[c.key] = c.value; c.continue(); } else res(all); };
  rq.onerror = () => rej(rq.error);
}));
const picsPut = (key, val) => picsTx('readwrite', st => st.put(val, key));
const picsDel = (keys) => picsTx('readwrite', st => keys.forEach(k => st.delete(k)));

// ほぞんしてある絵を CHAR_IMAGES_ALL に まぜる
async function loadMyPics() {
  if (!window.indexedDB) return;
  let all = {};
  try { all = await picsGetAll(); } catch (e) { return; }
  myPicURLs.forEach(u => URL.revokeObjectURL(u));
  myPicURLs = [];
  myPicNames = {};
  myPicHas = {};
  Object.keys(CHAR_IMAGES_ALL).forEach(k => delete CHAR_IMAGES_ALL[k]);
  Object.assign(CHAR_IMAGES_ALL, JSON.parse(JSON.stringify(CHAR_IMAGES_BASE)));
  for (const id of Object.keys(CHARS)) {
    const mine = {};
    for (const [m] of MYPICS_MOODS) {
      const b = all[`${id}_${m}`];
      if (b instanceof Blob) { const u = URL.createObjectURL(b); myPicURLs.push(u); mine[m] = u; }
    }
    if (all[`${id}_name`]) myPicNames[id] = all[`${id}_name`];
    myPicHas[id] = Object.keys(mine).length > 0;
    if (!myPicHas[id]) continue;
    mine.normal = mine.normal || mine.happy || mine.sad;
    const base = CHAR_IMAGES_ALL[id] || {};
    CHAR_IMAGES_ALL[id] = { ...base, ...mine, name: myPicNames[id] || base.name || CHARS[id].name, desc: base.desc || CHARS[id].desc };
  }
  if (Object.keys(myPicHas).some(k => myPicHas[k]) && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}

// えらんだ ファイルを ととのえる: まわりの しろを とうめいに → よぶんな よはくを きる → 512px いないに
function readImage(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(u); res(img); };
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); };
    img.src = u;
  });
}
async function tidyPicture(file, clearWhite) {
  const img = await readImage(file);
  const MAX = 1024;
  const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.max(1, Math.round(img.naturalWidth * k)), H = Math.max(1, Math.round(img.naturalHeight * k));
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const cx = cv.getContext('2d');
  cx.drawImage(img, 0, 0, W, H);
  const id = cx.getImageData(0, 0, W, H), d = id.data;
  if (clearWhite) {
    // ふちから つながっている しろっぽい ところだけ けす（キャラの なかの しろは のこる）
    const seen = new Uint8Array(W * H), stack = [];
    const light = (p) => d[p * 4 + 3] < 20 || (d[p * 4] > 232 && d[p * 4 + 1] > 232 && d[p * 4 + 2] > 232);
    for (let x = 0; x < W; x++) { stack.push(x, (H - 1) * W + x); }
    for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
    while (stack.length) {
      const p = stack.pop();
      if (seen[p] || !light(p)) continue;
      seen[p] = 1;
      d[p * 4 + 3] = 0;
      const x = p % W, y = (p / W) | 0;
      if (x > 0) stack.push(p - 1);
      if (x < W - 1) stack.push(p + 1);
      if (y > 0) stack.push(p - W);
      if (y < H - 1) stack.push(p + W);
    }
    cx.putImageData(id, 0, 0);
  }
  // よはくを きる
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (d[(y * W + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const s = Math.min(1, 512 / Math.max(cw, ch));
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(cw * s)); out.height = Math.max(1, Math.round(ch * s));
  out.getContext('2d').drawImage(cv, x0, y0, cw, ch, 0, 0, out.width, out.height);
  return new Promise(res => out.toBlob(b => res(b), 'image/png'));
}

// おうちのひと がめんの カード
function myPicsCardHTML() {
  if (!window.indexedDB) return '';
  return `<section class="setcard mypics">
    <h3>じぶんの えを つかう</h3>
    <p class="muted">iPhone の しゃしんから キャラの えを えらぶと、この iPhone / iPad の なかだけに ほぞん されます（ネットには でません）。しゃしんアプリで えを ながおし →「ステッカーを ついか」や「がぞうを ほぞん」で せなかを けした えが きれいです。</p>
    <label class="toggle"><input type="checkbox" id="mpWhite" checked> まわりの しろい ところを とうめいに する</label>
    ${Object.keys(CHARS).map(id => `<div class="mp-row" data-mp="${id}">
      <input class="mp-name" data-mpname="${id}" value="${myPicNames[id] || ''}" placeholder="${CHARS[id].name} の かわり（なまえ）" maxlength="8">
      <div class="mp-slots">${MYPICS_MOODS.map(([m, label]) => {
        const src = myPicHas[id] && CHAR_IMAGES_ALL[id] && CHAR_IMAGES_ALL[id][m] && myPicURLs.includes(CHAR_IMAGES_ALL[id][m]) ? CHAR_IMAGES_ALL[id][m] : '';
        return `<label class="mp-slot ${src ? 'has' : ''}">${src ? `<img src="${src}" alt="">` : '<span class="mp-plus">＋</span>'}<small>${label}</small><input type="file" accept="image/*" data-mpfile="${id}_${m}" hidden></label>`;
      }).join('')}</div>
      ${myPicHas[id] ? `<button class="btn sub mp-clear" data-mpclear="${id}">けす</button>` : ''}
    </div>`).join('')}
    <p class="muted">「ふつう」だけでも OK。ほかの かおが ないときは ふつうの えが うごきます。</p>
  </section>`;
}

function bindMyPics(rerender) {
  $$('[data-mpfile]').forEach(inp => inp.onchange = async () => {
    const f = inp.files && inp.files[0];
    if (!f) return;
    const slot = inp.closest('.mp-slot');
    slot.classList.add('busy');
    try {
      const blob = await tidyPicture(f, $('#mpWhite') ? $('#mpWhite').checked : true);
      await picsPut(inp.dataset.mpfile, blob);
      await loadMyPics();
      if (S.settings.charset === 'original') S.settings.charset = 'image';
      save();
      applyCharset();
      sfx('ok');
    } catch (e) {
      alert('この えは よみこめませんでした。PNG か JPEG の えを えらんでね。');
    }
    rerender();
  });
  $$('[data-mpname]').forEach(i => i.onchange = async () => {
    const id = i.dataset.mpname, v = i.value.trim();
    await (v ? picsPut(`${id}_name`, v) : picsDel([`${id}_name`]));
    await loadMyPics(); applyCharset(); rerender();
  });
  $$('[data-mpclear]').forEach(b => b.onclick = async () => {
    const id = b.dataset.mpclear;
    if (!confirm('この キャラの えを けしますか?')) return;
    await picsDel([...MYPICS_MOODS.map(([m]) => `${id}_${m}`), `${id}_name`]);
    await loadMyPics(); applyCharset(); rerender();
  });
}

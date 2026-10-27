// オフライン用: 一度ひらいたら ぜんぶ キャッシュして ネットなしでも あそべる
const CACHE = 'yumeiro-v19';
const FILES = ['./', 'index.html', 'style.css', 'charset.js', 'icons.js', 'chars.js', 'mypics.js', 'buildings.js', 'field.js', 'app.js', 'english.js', 'catch.js', 'fishing.js', 'room.js', 'kanji.js', 'kanjidig.js', 'merge.js', 'manifest.json', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// ネットが つながるときは あたらしい版を とってきて キャッシュを こうしん、つながらないときは キャッシュ
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});

// このアプリを「インストール」できるようにするための、最小限の仕組みです。
const CACHE_NAME = 'daily-tasks-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// 【2026-08-28の修正】更新しても古い画面が出たままになる件
// GitHub Pages は cache-control: max-age=600 を返す。つまりブラウザは
// 「10分間は取りに来なくていい」と言われた状態になり、その間ずっと古いHTMLを出す。
// ページ本体だけは、ブラウザの保存分を使わずに毎回取りに行く。
// （取れなかったときだけ、前回とれた分を出す＝オフラインでも開ける）
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isPage = req.mode === 'navigate'
    || req.destination === 'document'
    || req.url.indexOf('.html') !== -1;

  if (isPage) {
    event.respondWith(
      fetch(req, { cache: 'reload' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

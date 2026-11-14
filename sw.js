// sw.js - 鮎川まどか 手機APP / PWA 雲端與離線獨立運作快取引擎 (v16)
const CACHE_NAME = 'madoka-pwa-v16';

// 核心 Shell 資源 (極速安裝，體積小於 1.5MB，秒級完成安裝，避免背景佔用手機頻寬)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './renderer.js',
  './costumes.json',
  './cloud_bundle.json',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/avatar_portrait.png',
  './assets/costumes/uniform_idle.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = new URL(event.request.url);

  // 1. API 請求交由前端引擎處理
  if (reqUrl.pathname.startsWith('/api/')) {
    return;
  }

  // 2. 音訊檔案 (.mp3/.wav/assets/audio)：全面放行！交由瀏覽器原生 HTTP 206 Partial Content (Range) 串流
  // 徹底避免 Service Worker 快取截斷大型 OST (5~8MB) 導致 Safari / Chrome 靜音或卡頓問題
  if (/\.(mp3|wav|ogg|m4a)$/i.test(reqUrl.pathname) || reqUrl.pathname.includes('/assets/audio/')) {
    return;
  }

  // 3. 圖片資源 (PNG/JPG/WEBP/GIF/SVG)：Cache-First + 動態背景漸進式快取，無逾時中斷，確保圖片順暢秒現
  if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(reqUrl.pathname)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return networkRes;
        }).catch(() => {
          return cached || new Response('', { status: 408, statusText: 'Image Fetch Error' });
        });
      })
    );
    return;
  }

  // 4. 核心網頁、樣式與腳本 (HTML, CSS, JS, JSON)：Network-First，斷網時無縫切換本機離線快取
  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return networkRes;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});

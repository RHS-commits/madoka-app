// sw.js - 鮎川まどか 手機APP / PWA 雲端與離線獨立運作快取引擎 (v11)
const CACHE_NAME = 'madoka-pwa-v11';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './renderer.js?v=11',
  './costumes.json',
  './cloud_bundle.json',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/avatar_portrait.png',
  './assets/costumes/uniform_idle.png',
  './assets/costumes/home_idle.png',
  './assets/costumes/night_idle.png',
  './assets/costumes/work_ol_idle.png',
  './assets/costumes/boyfriend_shirt_idle.png',
  './assets/costumes/guitar_idle.png',
  './assets/costumes/strawhat_idle.png',
  './assets/costumes/maid_witch_idle.png',
  './assets/costumes/evening_gown_idle.png',
  './assets/costumes/variant_home_curtain.png',
  './assets/costumes/variant_work_night.jpg',
  './assets/costumes/variant_night_blue.png',
  './assets/costumes/variant_night_sleep.png',
  './assets/pov_photos/pov_01_tie.png',
  './assets/pov_photos/pov_11_cafe_latte.png',
  './assets/pov_photos/pov_12_morning_kitchen.png',
  './assets/pov_photos/pov_13_morning_wakeup.jpg',
  './assets/pov_photos/pov_16_chair_wink_study.png',
  './assets/pov_photos/pov_18_golden_gown.png',
  './assets/pov_photos/pov_20_boyfriend_shirt.png',
  './assets/pov_photos/pov_21_office_ol.png',
  './assets/pov_photos/pov_22_guitar_home.png'
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

function fetchWithFastTimeout(request, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('SW_TIMEOUT')), timeoutMs);
    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = new URL(event.request.url);

  // API 請求交由前端 apiFetchJson 快速逾時與離線獨立引擎處理
  if (reqUrl.pathname.startsWith('/api/')) {
    return;
  }

  // 音訊檔 (.mp3/.wav/.ogg/.m4a)：完全交由瀏覽器原生媒體引擎直接串流 (HTTP 206 Range)，不經由 Service Worker 攔截，避免 iOS Safari / Android Chrome 音訊解碼中斷或靜音
  if (/\.(mp3|wav|ogg|m4a)$/i.test(reqUrl.pathname) || reqUrl.pathname.includes('/assets/audio/')) {
    return;
  }

  // 圖片採用 Cache-First，確保電腦關機或離線時瞬間載入
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(reqUrl.pathname)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetchWithFastTimeout(event.request, 6000).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 核心網頁與腳本採用 6 秒逾時 Network-First，離線時自動切換快取
  event.respondWith(
    fetchWithFastTimeout(event.request, 6000)
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

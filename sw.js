// sw.js - 鮎川まどか 手機APP / PWA 雲端與離線獨立運作快取引擎 (v6)
const CACHE_NAME = 'madoka-pwa-v6';

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
  './assets/pov_photos/pov_22_guitar_home.png',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E8%B5%B7%E5%BA%8A(%E7%94%9C%E8%9C%9C).mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E8%B5%B7%E5%BA%8A(%E5%BC%B7%E7%83%88).mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E9%AE%8E%E5%B7%9D%E3%81%BE%E3%81%A9%E3%81%8B%E7%9A%84%E5%96%9A%E9%86%92.mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E8%B5%B7%E5%BA%8A.mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E5%87%BA%E9%96%80%E5%89%8D%E6%8B%BF%E4%BE%BF%E7%95%B6(%E7%94%9C%E8%9C%9C).mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E6%9C%89%E5%BF%83%E4%BA%8B%E5%97%8E(%E6%BA%AB%E6%9F%94).mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E5%AE%89%E6%85%B0.mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E6%92%92%E5%AC%8C).mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E6%BA%AB%E6%9F%94).mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E7%86%B1%E6%83%85).mp3',
  './assets/audio/%E6%97%A5%E5%B8%B8/%E5%92%96%E5%95%A1.mp3'
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

function fetchWithFastTimeout(request, timeoutMs = 1500) {
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

  // 音訊檔 (.mp3/.wav)：支援手機瀏覽器 HTTP Range 串流播放（避免大型 OST 歌曲被 3.5 秒逾時中斷）
  if (/\.(mp3|wav)$/i.test(reqUrl.pathname)) {
    if (event.request.headers.get('range')) {
      return;
    }
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkRes) => {
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

  // 圖片採用 Cache-First，確保電腦關機或離線時瞬間載入
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(reqUrl.pathname)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetchWithFastTimeout(event.request, 5000).then((networkRes) => {
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

  // 核心網頁與腳本採用 1.5 秒快速逾時 Network-First，電腦關機時立即切換離線快取
  event.respondWith(
    fetchWithFastTimeout(event.request, 1500)
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

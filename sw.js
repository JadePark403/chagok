// 서비스 워커: 앱 파일을 기기에 한 벌 보관해 두었다가, 인터넷이 끊겨도 앱이 열리게 해요.
// 내 기록(글, 해낸 일)은 여기서 다루지 않아요. 기록은 늘 브라우저 저장소에만 있어요.
//
// 앱 파일을 새로 추가하면 FILES에도 적어 주고, VERSION 숫자를 하나 올려 주세요.
const VERSION = "chagok-v9";
const FILES = [
  "./",
  "./index.html",
  "./vent.html",
  "./lookback.html",
  "./kit.html",
  "./backup.html",
  "./people.html",
  "./people.js",
  "./theme.css",
  "./fonts/GowunDodum-Regular.woff2",
  "./help.js",
  "./record-sheet.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

// 처음 설치될 때: 앱 파일을 모두 보관해 둬요
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// 새 버전이 되면: 예전 보관본은 정리해요
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 파일을 열 때: 인터넷이 되면 새 파일을 받아 보관본도 바꾸고,
// 인터넷이 안 되면 보관해 둔 파일로 열어요.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached) return cached;
        if (req.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      })
  );
});

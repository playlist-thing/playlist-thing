/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

import { Trouter } from 'trouter';

type HandlerFunction = (params: Record<string, string>) => Promise<Response>;

async function health() {
  return Response.json({
    status: 'OK'
  });
}

const router = new Trouter<HandlerFunction>();
router.get('/health', health);

sw.addEventListener('install', (event) => {});

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin === 'https://localapi.playlist-thing.com') {
    const obj = router.find(request.method, url.pathname);
    if (obj.handlers.length === 1) {
      async function respond() {
        return await obj.handlers[0](obj.params);
      }

      event.respondWith(respond());
    } else {
      event.respondWith(Response.error());
    }
  }
});

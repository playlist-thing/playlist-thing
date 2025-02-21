/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { Trouter } from 'trouter';

type HandlerFunction = (params: Record<string, string>) => Promise<Response>;

async function health() {
  return Response.json({
    status: 'OK'
  });
}

const router = new Trouter<HandlerFunction>();
router.get('/health', health);

self.addEventListener('install', (event) => {});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event: FetchEvent) => {
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

// Kill switch. The old static prototype (now archived under
// legacy-static-site/) registered a service worker at this same
// origin+scope, and any browser that ever visited it still has that
// registration active, silently intercepting every fetch on later visits
// regardless of what's actually deployed since. skipWaiting() +
// clients.claim() take over immediately on the next load; activate then
// wipes every cache, unregisters itself, and reloads any open tab so it
// goes back to plain network requests with no service worker at all.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});

// Aaradhya Planner — Service Worker
const CACHE = 'aaradhya-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install — cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for shell, network for everything else
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || '⏰ Aaradhya Reminder', {
      body: data.body || 'Have you entered today\'s tasks?',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: './' },
      actions: [
        { action: 'open',   title: 'Add Task' },
        { action: 'snooze', title: 'Remind Later' }
      ]
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'open' || !e.action) {
    e.waitUntil(clients.openWindow('./'));
  }
});

// Background sync (for future Google Sheets integration)
self.addEventListener('sync', e => {
  if (e.tag === 'sync-data') {
    // Placeholder for Google Sheets sync
    console.log('[SW] Background sync triggered');
  }
});

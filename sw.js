// Service Worker for Israeli Finance Dashboard
// Provides offline functionality and caching

const CACHE_NAME = 'israeli-finance-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Built assets will be automatically cached by their actual paths
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./');
          }
        });
      })
  );
});

// Background sync for financial data
self.addEventListener('sync', (event) => {
  if (event.tag === 'financial-data-sync') {
    console.log('Service Worker: Syncing financial data...');
    event.waitUntil(syncFinancialData());
  }
});

// Push notifications for budget alerts
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'התראה פיננסית חדשה',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    dir: 'rtl',
    lang: 'he',
    vibrate: [200, 100, 200],
    data: {
      url: './'
    },
    actions: [
      {
        action: 'view',
        title: 'צפה',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'סגור',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('מעקב פיננסי', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || './')
    );
  }
});

// Sync financial data function
async function syncFinancialData() {
  try {
    // This will be implemented when we add data management
    console.log('Service Worker: Financial data sync completed');
  } catch (error) {
    console.error('Service Worker: Financial data sync failed:', error);
  }
}
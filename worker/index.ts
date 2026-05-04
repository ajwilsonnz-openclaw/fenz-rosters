declare let self: any;

// To bypass TypeScript errors for standard SW events
export {};

self.addEventListener('push', function(event: any) {
    if (event.data) {
        let payload: any = {};
        try {
            payload = event.data.json();
        } catch (e) {
            payload = { title: 'FENZ OT', body: event.data.text() };
        }
        
        const options = {
            body: payload.body || 'You have a new overtime offer.',
            icon: '/fenz-logo.png', // SWs need png usually, fallback to default if missing
            badge: '/fenz-logo.png',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            data: {
                url: payload.url || '/offers'
            },
            requireInteraction: true,
            actions: [
                { action: 'view', title: 'View Details' },
                { action: 'close', title: 'Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(payload.title || 'FENZ Overtime', options)
        );
    }
});

self.addEventListener('notificationclick', function(event: any) {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList: any) {
            const urlToOpen = event.notification.data?.url || '/offers';
            
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

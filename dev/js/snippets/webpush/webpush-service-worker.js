self.addEventListener('push', function(event) {
    var messageData;

    try {
        messageData = JSON.parse(event.data.text());
    } catch (ex) {
        // invalid json
        messageData = {
            title: event.data.text(),
            body: null,
            data: null
        };
    }

    var title = messageData.title;
    var options = {
        body: messageData.content,
        data: messageData
    };

    if (messageData.iconPath) {
        options.icon = messageData.iconPath;
    }

    if (messageData.badgePath) {
        options.badge = messageData.badgePath;
    }

    if (messageData.url) {
        options.url = messageData.url;
    }

    if (messageData.tag) {
        options.tag = messageData.tag;
    }

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
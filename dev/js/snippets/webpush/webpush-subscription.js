var WebPushHandler = {};

try {
    WebPushHandler.publicKey = null;
    WebPushHandler.version = null;
    WebPushHandler.hasPermission = null;

    WebPushHandler.urlBase64ToUint8Array = function(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    WebPushHandler.registerServiceWorker = function () {
        return navigator.serviceWorker.register('/ajax/js/webpush_service_worker.js?v=' + WebPushHandler.version)
            .then(function (registration) {
                return registration;
            })
            .catch(function (err) {
                console.log('Unable to register service worker.', err);
            });
    };

    WebPushHandler.askPermission = function () {
        return new Promise(function (resolve, reject) {
            const permissionResult = Notification.requestPermission(function (result) {
                resolve(result);
            });

            if (permissionResult) {
                permissionResult.then(resolve, reject);
            }
        });
    };

    WebPushHandler.getNotificationPermissionState = function () {
        if (navigator.permissions) {
            return navigator.permissions.query({name: 'notifications'})
                .then(function (result) {
                    return result.state;
                });
        }

        return new Promise(function (resolve) {
            resolve(Notification.permission);
        });
    };

    WebPushHandler.subscribeUserToPush = function () {
        return WebPushHandler.swRegistration
            .then(function (registration) {
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: WebPushHandler.urlBase64ToUint8Array(WebPushHandler.publicKey)
                };

                return registration.pushManager.subscribe(subscribeOptions);
            })
            .then(function (pushSubscription) {
                WebPushHandler.sendSubscriptionToBackEnd(pushSubscription);

                return pushSubscription;
            });
    };

    WebPushHandler.sendSubscriptionToBackEnd = function (subscription) {
        var request = {
            subscription: subscription,
            vapidPublicKey: WebPushHandler.publicKey
        };

        return fetch('/ajax/web-push.php?action=subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(request)
        })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Bad status code from server.');
            }

            return response.json();
        })
        .then(function (responseData) {
        });
    };

    WebPushHandler.checkCompatibility = function() {
        return ('serviceWorker' in navigator) && ('PushManager' in window);
    };

    WebPushHandler.setPermissionValue = function() {
        return WebPushHandler.getNotificationPermissionState()
            .then(function (permission) {
                WebPushHandler.hasPermission = permission;
            });
    };

    WebPushHandler.isSnippetAvailable = function() {
        return WebPushHandler.checkCompatibility() && WebPushHandler.hasPermission != 'granted' && WebPushHandler.hasPermission != 'denied';
    };

    WebPushHandler.setSnippetVisibility = function() {
        if (WebPushHandler.isSnippetAvailable() && $("#iai_webpush_toplayer")) {
            $("#iai_webpush_toplayer").show();
        }
    };

    WebPushHandler.init = function () {
        if (!WebPushHandler.checkCompatibility()) {
            return;
        }

        WebPushHandler.swRegistration = WebPushHandler.registerServiceWorker();
        WebPushHandler.swRegistration.then(function () {
            return WebPushHandler.getNotificationPermissionState()
                .then(function (permission) {
                    if (permission != 'granted') {
                        return WebPushHandler.askPermission();
                    }
                });
        })
        .then(function (permission) {
            if (permission == 'granted') {
                WebPushHandler.subscribeUserToPush();
            }
        });
    };
} catch(e) {
    console.log(e);
}


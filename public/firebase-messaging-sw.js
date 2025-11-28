self.addEventListener('push', function(event) {
    var data =event.data.json();
    var userLang = navigator.language || navigator.userLanguage;
    let title;
    let body;
    if (data.data['title_'+userLang] && data.data['body_'+userLang]){
        title = data.data['title_'+userLang];
        body = data.data['body_'+userLang]
    }else{
        title = data.data['title_en'];
        body = data.data['body_en']
    }
    let url = data.data.url;
    url = url.replace('{headline}', encodeURI(title));
    url = url.replace('{body}', encodeURI(body));
    const options = {
        body: body,
        collapse_key: data.data.colkey,
        icon: data.notification.icon,
        image: data.data.image || '',
        requireInteraction: true,
        tag: data.data.tag,
        vibrate: [300, 100, 400],
        data:{
            url: url
        },
        actions: [{action: "learn", title: "Learn More"},{action: "setting", title: "Settings"}]

    };
    console.log(options)
    var pushData = {
        unique_id: data.data.tag,
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    )
    fetch("https://statistics.signalpusher.com/statistics/delivered", {
        mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify(pushData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        console.log(response)
    })
});

self.addEventListener('notificationclick', function(event) {
    var data = {
        unique_id : event.notification.tag,
    };
    var url = event.notification.data.url;

    event.notification.close();


    if (event.action === 'learn') {
        event.waitUntil(clients.openWindow(url));
    }
    if (event.action === 'Settings') {
        event.waitUntil(clients.openWindow(url));
    }
    event.waitUntil(clients.openWindow(url));
    fetch("https://statistics.signalpusher.com/statistics/clicked", {
        mode: 'no-cors',
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        console.log(response.json())
    })

});

self.addEventListener('pushsubscriptionchange', function(event) {
    console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
    console.log(event);
});

self.addEventListener("notificationclose", function(event) {
    var data = {
        unique_id : event.notification.tag,
    };

    var url = event.notification.data.url;
    event.notification.close();

    event.waitUntil(
        fetch("https://statistics.signalpusher.com/statistics/closed", {
            mode: 'no-cors',
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {

        })
    );
});
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyA36V03w7qZaOrfBtaxqk82iblwg88IsTQ",
  authDomain: "grindery-ping.firebaseapp.com",
  projectId: "grindery-ping",
  storageBucket: "grindery-ping.appspot.com",
  messagingSenderId: "1009789264721",
  appId: "1:1009789264721:web:468fe5b2c6dcc39e0ea970",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle =
    (payload.data && payload.data.title) ||
    (payload.notification && payload.notification.title) ||
    "Title";
  const notificationOptions = {
    body:
      (payload.data && payload.data.body) ||
      (payload.notification && payload.notification.body) ||
      "",
    icon: "https://ping.grindery.org/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  function handleClick(event) {
    event.notification.close();
    console.log("clicked notification payload", event.notification.data);
    // Open the url you set on notification.data
    if (event.notification.data && event.notification.data.url) {
      clients.openWindow(event.notification.data.url);
    }
  }
  self.addEventListener("notificationclick", handleClick);
});

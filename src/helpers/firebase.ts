import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA36V03w7qZaOrfBtaxqk82iblwg88IsTQ",
  authDomain: "grindery-ping.firebaseapp.com",
  projectId: "grindery-ping",
  storageBucket: "grindery-ping.appspot.com",
  messagingSenderId: "1009789264721",
  appId: "1:1009789264721:web:468fe5b2c6dcc39e0ea970",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// // Initialize Firebase Cloud Messaging
const messaging = getMessaging(firebaseApp);

onMessage(messaging, (payload) => {
  const notificationTitle =
    (payload.data && payload.data.title) ||
    (payload.notification && payload.notification.title) ||
    "Title";
  const notificationOptions = {
    body:
      (payload.data && payload.data.body) ||
      (payload.notification && payload.notification.body) ||
      "",
    icon:
      (payload.data && payload.data.icon) ||
      "https://ping.grindery.org/logo192.png",
  };

  new Notification(notificationTitle, notificationOptions);
});

// Request permissions to receive notifications
export const requestPermission = (
  tokenCallback: (a: string) => void,
  browserSupportedCallback: (a: boolean) => void
) => {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      getToken(messaging, {
        vapidKey:
          "BAaPC5Kx24prWkEWnIEFOKvlseb2_DFVc6wzqwAQrHw_lJ96BE3r9dvX6I1LOuzW1HCAiIMftP35FLZW1FcXpUI",
      })
        .then((currentToken) => {
          if (currentToken) {
            tokenCallback(currentToken);
          } else {
            console.error(
              "No registration token available. Request permission to generate one."
            );
            tokenCallback("");
          }
        })
        .catch((err) => {
          console.error("An error occurred while retrieving token. ", err);
          tokenCallback("");
          browserSupportedCallback(false);
        });
    } else {
      tokenCallback("");
    }
  });
};

// Check if browser supports push notifications
export const checkBrowser = (callback: (a: boolean) => void) => {
  isSupported()
    .then((res) => {
      if (res) {
        callback(true);
      } else {
        callback(false);
      }
    })
    .catch((err) => {
      console.error(err);
      callback(false);
    });
};

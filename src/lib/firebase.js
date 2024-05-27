// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { get, writable } from "svelte/store";
import { getMessaging } from "firebase/messaging";
import { PUBLIC_VAPID_KEY } from "$env/static/public";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyBvIBgjOVdvEcj2NpR_UxrCa2KIjl9QOGM",
    authDomain: "dx-sveltekit-starter.firebaseapp.com",
    projectId: "dx-sveltekit-starter",
    storageBucket: "dx-sveltekit-starter.appspot.com",
    messagingSenderId: "456403072850",
    appId: "1:456403072850:web:ec05dbcf86bd13a2c1ac8b",
    measurementId: "G-264JK7NMJV"
};

// Making then serviceWorkerRegistration available globally to be used by services such as firebase messaging.
export let serviceWorkerRegistration = writable(null);

const defaultUserNotificationPreferences = { ignored: true, accepted: false, rejected: false };

// let userNotificationPreferences = writable(
//     JSON.parse(localStorage.getItem("userNotificationPreferences")) || defaultUserNotificationPreferences
// );
// userNotificationPreferences.subscribe((val) => localStorage.setItem("userNotificationPreferences", JSON.stringify(val)));
let userNotificationPreferences = writable(defaultUserNotificationPreferences);

let fcmOptions = {
    vapidKey: PUBLIC_VAPID_KEY
};

let newServiceWorker;
let mustShowAppUpdateAvailable = false;

export const initFirebase = async () => {
    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        // Init FCM Messaging
        const messaging = getMessaging(app);

        if ("serviceWorker" in navigator) {
            serviceWorkerRegistration;
            navigator.serviceWorker.controller.addEventListener("updatefound", () => {
                console.log("Update found");
                newServiceWorker = navigator.serviceWorker.controller.installing;

                newServiceWorker.addEventListener("statechange", () => {
                    switch (newServiceWorker.state) {
                        case "installed":
                            if (navigator.serviceWorker.controller) {
                                mustShowAppUpdateAvailable = true;
                            }
                            // No update available
                            break;
                    }
                });
            });
        }

        navigator.serviceWorker.getRegistrations().then(async (registrations) => {
            for (let registration of registrations) {
                // const subscription = await registration.pushManager.subscribe({
                //     userVisibleOnly: true,
                //     applicationServerKey: PUBLIC_VAPID_KEY
                // });
                console.log("registration", registration);
                // console.log("subscription", subscription);
                // fcmOptions["webPushSubscription"] = subscription;
                fcmOptions["serviceWorkerRegistration"] = registration;
            }
        });

        return {
            app: app,
            messaging: messaging,
            fcmOptions: fcmOptions,
            initComplete: fcmOptions.serviceWorkerRegistration !== null
        };
    } catch (firebaseError) {
        console.log("Error initializing firebase:", firebaseError);
        return {
            app: null,
            messaging: null,
            fcmOptions: {},
            initComplete: false
        };
    }
};

/**
 *
 * @returns {{ignored: boolean, accepted: boolean, rejected: boolean}}
 */
export const checkUserNotificationPreferences = () => {
    return get(userNotificationPreferences);
};
/**
 *
 * @param {{ignored: boolean, accepted: boolean, rejected: boolean}} preferences
 */
export const setUserNotificationPreferences = (preferences) => {
    const currentUserPreferences = get(userNotificationPreferences);
    for (const key of Object.keys(preferences)) {
        currentUserPreferences[key] = preferences[key];
    }
    userNotificationPreferences.set(currentUserPreferences);
};

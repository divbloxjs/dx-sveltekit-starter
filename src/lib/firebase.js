// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { get, writable } from "svelte/store";
import { getMessaging } from "firebase/messaging";
import { env } from "$env/dynamic/public";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: env.PUBLIC_FIREBASE_API_KEY,
    authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.PUBLIC_FIREBASE_APP_ID,
    measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Making then serviceWorkerRegistration available globally to be used by services such as firebase messaging.
export let serviceWorkerRegistration;

let fcmOptions = {
    vapidKey: env.PUBLIC_VAPID_KEY
};

let newServiceWorker;

export let firebaseApp;
export let firebaseMessaging;
export const initFirebase = async () => {
    try {
        // Initialize Firebase
        firebaseApp = initializeApp(firebaseConfig);
        // Init FCM Messaging
        firebaseMessaging = getMessaging(firebaseApp);

        if (!serviceWorkerRegistration) {
            serviceWorkerRegistration = (await navigator.serviceWorker.getRegistrations())[0];
        }

        if ("serviceWorker" in navigator) {
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

        const serviceWorkerRegistrations = await navigator.serviceWorker.getRegistrations();

        if (serviceWorkerRegistrations.length !== 1) {
            console.error(`${serviceWorkerRegistrations.length} service workers are registered. 1 is expected`);
        }

        serviceWorkerRegistration = serviceWorkerRegistrations[0];
        fcmOptions["serviceWorkerRegistration"] = serviceWorkerRegistrations[0];

        return {
            app: firebaseApp,
            messaging: firebaseMessaging,
            fcmOptions: fcmOptions,
            initComplete: fcmOptions.serviceWorkerRegistration !== null
        };
    } catch (error) {
        console.log("Error initializing firebase:", error);
        return {
            app: null,
            messaging: null,
            fcmOptions: {},
            initComplete: false
        };
    }
};

<script>
    import "../app.pcss";
    import { initializeApp } from "firebase/app";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/components/ui/sonner";
    import { toast } from "svelte-sonner";
    import { firebaseConfig, initFirebase } from "$lib/firebase";
    import { getMessaging, getToken, onMessage } from "firebase/messaging";
    import { onMount } from "svelte";
    import { PUBLIC_VAPID_KEY } from "$env/static/public";
    import { browser } from "$app/environment";

    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };

    // token will store the Firebase Cloud Messaging token
    let token = null;

    // messages will hold the array of messages received
    let messages;

    onMount(async () => {
        // Initialize Firebase
        // const firebaseApp = initializeApp(firebaseConfig);

        console.log(1);
        if (!browser) return;
        const { app, messaging, fcmOptions } = await initFirebase();
        console.log("app", app);
        console.log("messaging", messaging);
        console.log("fcmOptions", fcmOptions);
        console.log(2);

        onMessage(messaging, (payload) => {
            console.log("Message received. ", payload);
            // ...
        });

        // Request permission for notifications
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                // Permission granted: Get the token
                getToken(messaging, fcmOptions)
                    .then(async (fetchedToken) => {
                        console.log("TOKEN!", fetchedToken);
                        // Store the received token
                        token = fetchedToken;
                        const subscription = await fcmOptions.serviceWorkerRegistration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: PUBLIC_VAPID_KEY
                        });
                        console.log("subscription", subscription);
                    })
                    .catch((error) => {
                        // Handle any errors in fetching the token
                        console.error("Error fetching token:", error);
                    });
            }
        });
    });
</script>

<ModeWatcher />
<Toaster />

<slot />

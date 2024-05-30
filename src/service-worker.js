/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));
/// <reference types="@sveltejs/kit" />
import { build, files, version } from "$service-worker";

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
    ...build, // the app itself
    ...files // everything in `static`
];

self.addEventListener("install", (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event) => {
    // ignore POST requests etc
    if (event.request.method !== "GET") return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // `build`/`files` can always be served from the cache
        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);

            if (response) {
                return response;
            }
        }

        // for everything else, try the network first, but
        // fall back to the cache if we're offline
        try {
            const response = await fetch(event.request);

            // if we're offline, fetch can return a value that is not a Response
            // instead of throwing - and we can't pass this non-Response to respondWith
            if (!(response instanceof Response)) {
                throw new Error("invalid response from fetch");
            }

            if (response.status === 200) {
                // if (event.request.url.match("^(http|https)://")) {
                cache.put(event.request, response.clone());
                // }
            }

            return response;
        } catch (err) {
            const response = await cache.match(event.request);

            if (response) {
                return response;
            }

            // if there's no cache, then just error out
            // as there is nothing we can do to respond to this request
            throw err;
        }
    }

    event.respondWith(respond());
});

self.addEventListener("message", async (event) => {
    console.log(`The client sent me a message`, event.data);
    if (event.data.action === "skipWaiting") {
        self.skipWaiting();
    }

    if (event.data.action === "storePushSubscription") {
        if (fcmConfig.isFcmEnabled && self.registration.pushManager) {
            // Web Push supported.
            try {
                const options = { applicationServerKey, userVisibleOnly: true };
                const subscription = await self.registration.pushManager.subscribe(options);

                //Save this to backend with the provided endpoint
                const saveResult = await fetch(pushSubscriptionEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ pushSubscriptionObject: subscription })
                });
            } catch (err) {
                console.log("Error", err);
            }
        } else {
            // Web Push not supported.
            console.log("Web push not supported");
        }
        self.skipWaiting();
    }
});

self.addEventListener("push", (event) => {
    if (!event.data) {
        console.log("Push event received, but no data");
        return;
    }

    const pushData = event.data.json();
    const title = pushData?.notification?.title ?? "Divblox Notification";

    const showNotification = async () => {
        try {
            await self.registration.showNotification(title, pushData.notification);
        } catch (error) {
            console.log("Could not send service worker notification:", error);
        }
    };

    event.waitUntil(showNotification());
});

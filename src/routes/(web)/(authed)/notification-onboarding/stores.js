import { writable } from "svelte/store";
import { syncToLocalStorage } from "$lib/middlewares/sync-to-local-storage.js";

/**
 * @type {import("svelte/store").Writable<string>}
 */
export const pushNotificationUniqueIdentifier = syncToLocalStorage(writable(""), "pushNotificationUniqueIdentifier");

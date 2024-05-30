import { browser } from "$app/environment";
import { isJsonString, isNumeric } from "dx-utilities";
import { get } from "svelte/store";

/**
 *
 * @param {import("svelte/store").Writable<any>} store
 * @param {string} key
 * @returns {import("svelte/store").Writable<any>}
 */
export const syncToLocalStorage = (store, key) => {
    if (!key || typeof key !== "string" || key.trim() === "") {
        console.warn("Local storage key not provided or invalid: ", key);
    }

    function loadFromStorage() {
        if (!browser) return;

        const valueStr = localStorage.getItem(key);
        let parsedValue = valueStr;

        if (isJsonString(valueStr)) {
            parsedValue = JSON.parse(valueStr);
        }

        if (valueStr?.toLowerCase() === "false" || valueStr?.toLowerCase() === "true") {
            parsedValue = valueStr?.toLowerCase() === "false" ? false : true;
        }

        if (isNumeric(valueStr)) {
            parsedValue = Number(valueStr);
        }

        store.set(parsedValue);
    }

    function saveToStorage(value) {
        if (!browser) return;

        let valueStr = value;
        if (typeof value === "boolean" || typeof value === "number") {
            valueStr = value.toString();
        }

        if (typeof value === "object") {
            valueStr = JSON.stringify(value);
        }

        localStorage.setItem(key, valueStr);
    }

    function set(value) {
        saveToStorage(value);
        store.set(value);
    }

    /**
     *
     * @param {import('./$types').Updater} fn
     */
    function update(fn) {
        const value = fn(get(store));
        saveToStorage(value);
        store.update(fn);
    }

    loadFromStorage();

    return {
        subscribe: store.subscribe,
        set,
        update
    };
};

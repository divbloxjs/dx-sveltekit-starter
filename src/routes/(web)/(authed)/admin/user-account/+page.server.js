// export const ssr = false;

import { loadUserAccountArray } from "$lib/components/data-model/user-account/user-account.server";
import { deliverPushNotificationToAllSubscriptionsForUserAccount } from "$lib/server/web-push";
import { fail } from "@sveltejs/kit";
import { isNumeric, isValidObject } from "dx-utilities";
import { parse } from "qs";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ url, params }) => {
    const urlSearchParams = parse(url.search, { ignoreQueryPrefix: true });

    const constraints = {};

    if (urlSearchParams.hasOwnProperty("search")) {
        constraints.search = urlSearchParams.search;
    }

    if (urlSearchParams.hasOwnProperty("limit") && isNumeric(urlSearchParams.limit)) {
        constraints.limit = parseInt(urlSearchParams.limit.toString());
    }

    if (urlSearchParams.hasOwnProperty("offset") && isNumeric(urlSearchParams.offset)) {
        constraints.offset = parseInt(urlSearchParams.offset.toString());
    }

    if (urlSearchParams.hasOwnProperty("sort") && isValidObject(urlSearchParams.sort)) {
        constraints.sort = urlSearchParams.sort;
    }

    if (urlSearchParams.hasOwnProperty("filter") && isValidObject(urlSearchParams.filter)) {
        constraints.filter = urlSearchParams.filter;
    }

    return await loadUserAccountArray(constraints);
};

/** @type {import('./$types').Actions} */
export const actions = {
    testPushNotification: async ({ request, locals }) => {
        const data = await request.formData();

        if (!data.get("id")) return fail(400, { message: "Invalid ID provided" });

        const title = data.get("title") ?? "Test notification";
        const body = data.get("body") ?? "Test notification body";
        const { pushSubscriptions, errors } = await deliverPushNotificationToAllSubscriptionsForUserAccount({
            user_account_id: data.get("id"),
            notificationContent: { title, body }
        });

        if (errors.length !== 0) {
            return fail(400, { message: "Could not deliver push notification", errors });
        }

        if (pushSubscriptions.length === 0) return { type: "info", message: "No active push subscriptions found" };

        return {
            type: "success",
            message: `Test notification sent to ${pushSubscriptions.length} subscription${pushSubscriptions.length > 1 ? "s" : ""}`
        };
    }
};

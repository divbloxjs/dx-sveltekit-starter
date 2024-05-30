import { fail } from "@sveltejs/kit";
import { isJsonString, sleep } from "dx-utilities";

import { prisma } from "$lib/server/prisma-instance";
import { createHash } from "node:crypto";
import { deliverPushNotificationToAllSubscriptionsForUserAccount } from "$lib/server/web-push";

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
    return {};
}

/** @type {import('./$types').Actions} */
export const actions = {
    accept: async ({ request, locals }) => {
        const data = await request.formData();

        const pushSubscriptionDetailsString = data.get("pushSubscriptionDetailsString");
        if (!pushSubscriptionDetailsString || !isJsonString(pushSubscriptionDetailsString)) {
            return fail(400, { message: "Invalid input for 'pushSubscriptionDetailsString'" });
        }

        const pushSubscriptionDetails = JSON.parse(pushSubscriptionDetailsString);
        if (!validatePushSubscriptionDetails(pushSubscriptionDetails)) {
            return fail(400, { message: "Invalid push subscription details provided" });
        }

        let uniqueIdentifier = data.get("uniqueIdentifier");
        if (!uniqueIdentifier) {
            const newUniqueIdentifier = createPushSubscriptionUniqueIdentifier(pushSubscriptionDetails?.endpoint);
            if (!newUniqueIdentifier) return fail(400, { message: "Could not generate a unique identifier" });
            uniqueIdentifier = newUniqueIdentifier;
        }

        const existingPushSubscription = await prisma.pushSubscription.findFirst({
            where: { uniqueIdentifier }
        });

        if (existingPushSubscription) return { message: "Using existing subscription", pushSubscription: existingPushSubscription };

        const newPushSubscription = await prisma.pushSubscription.create({
            data: { uniqueIdentifier, pushSubscriptionDetails, userAccountId: locals?.user?.id }
        });

        return { message: "Created a new subscription", pushSubscription: newPushSubscription };
    },
    ignore: async ({ request, locals }) => {
        const data = await request.formData();

        const existingUniqueIdentifier = data.get("pushNotificationUniqueIdentifier")?.toString();
        if (!existingUniqueIdentifier) return { message: "No push subscription unique identifier provided" };

        try {
            await prisma.pushSubscription.update({
                where: { uniqueIdentifier: existingUniqueIdentifier },
                data: { isActive: false }
            });

            return { message: "Subscription updated" };
        } catch (error) {
            console.error("error", error);
            // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
            if (error?.code === "P2025") {
                return { type: "info", message: "Push subscription has already been unregistered" };
            }

            return fail(400, { message: "Could not update push subscription" });
        }
    },
    test: async ({ request, locals }) => {
        const { pushSubscriptions, errors } = await deliverPushNotificationToAllSubscriptionsForUserAccount({
            userAccountId: locals?.user?.id
        });

        if (errors.length !== 0) {
            return fail(400, { message: "Could not deliver push notification", errors });
        }

        if (pushSubscriptions.length === 0) return { type: "info", message: "No active push subscriptions found" };

        return {
            type: "success",
            message: `Test notification sent to ${pushSubscriptions.length} subscription ${pushSubscriptions.length > 1 ? "s" : ""}`
        };
    }
};

/**
 * Creates a unique hash to reference the push subscription.
 * Uses the push notification endpoint as a base as it is already unique
 * @param {string} pushSubscriptionEndpoint Endpoint provided by FCM
 * @returns {string|false} Returns a hash of the url, or false if error occurred
 */
const createPushSubscriptionUniqueIdentifier = (pushSubscriptionEndpoint) => {
    if (!pushSubscriptionEndpoint) return false;

    return createHash("md5").update(pushSubscriptionEndpoint).digest("hex");
};

const validatePushSubscriptionDetails = (pushSubscriptionDetails) => {
    if (
        !pushSubscriptionDetails?.endpoint ||
        !pushSubscriptionDetails?.keys ||
        !pushSubscriptionDetails?.keys?.auth ||
        !(pushSubscriptionDetails?.keys?.p256d || pushSubscriptionDetails?.keys?.p256dh)
    ) {
        return false;
    }

    return true;
};

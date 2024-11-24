import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";

// https://github.com/web-push-libs/web-push
import webPush from "web-push";
import { prisma } from "./prisma-instance";

if (publicEnv.PUBLIC_ENABLE_WEB_PUSH?.toLowerCase() === "true") {
    if (!publicEnv?.PUBLIC_VAPID_KEY) {
        throw new Error(`Invalid Public Vapid Key provided: ${publicEnv?.PUBLIC_VAPID_KEY}`);
    }

    if (!env?.PRIVATE_VAPID_KEY) {
        throw new Error(`Invalid Private Vapid Key provided: ${env?.PRIVATE_VAPID_KEY}`);
    }

    webPush.setVapidDetails(
        `mailto:${publicEnv?.PUBLIC_WEB_PUSH_CONTACT_EMAIL_ADDRESS}`,
        publicEnv?.PUBLIC_VAPID_KEY,
        env?.PRIVATE_VAPID_KEY
    );
}

/**
 * Delivers a push notification to a specific subscription
 * @returns {Promise<boolean>} False if anything went wrong
 */
export const deliverPushNotificationToUniqueSubscription = async ({
    unique_identifier = "",
    notificationContent = {
        title: "Push Notification",
        body: "More info...",
        data: {}
    },
    mustSetAsUnseen = false
}) => {
    if (publicEnv.PUBLIC_ENABLE_WEB_PUSH?.toLowerCase() !== "true") {
        console.error("Push notifications not enabled. Update the 'PUBLIC_ENABLE_WEB_PUSH' environment variable");
        return true;
    }
    const pushSubscription = await prisma.push_subscription.findFirst({ where: { unique_identifier } });

    if (!pushSubscription) return false;

    if (mustSetAsUnseen) {
        await prisma.push_subscription.update({
            where: { unique_identifier },
            data: { has_unseen_notification: true }
        });
    }

    try {
        await webPush.sendNotification(pushSubscription.push_subscription_details, JSON.stringify({ notification: notificationContent }));
    } catch (error) {
        console.error("error", error);
        if (error?.statusCode === 410) {
            await prisma.push_subscription.delete({ where: { unique_identifier } });
            // return true;
        }

        return false;
    }

    return true;
};

/**
 *
 * @param {{user_account_id: number, notificationContent: {title:string, body: string, data:Object}, mustSetAsUnseen:boolean}} param0
 * @returns
 */
export const deliverPushNotificationToAllSubscriptionsForUserAccount = async ({
    user_account_id,
    notificationContent = {
        title: "Push Notification",
        body: "More info...",
        data: {}
    },
    mustSetAsUnseen = false
}) => {
    if (publicEnv.PUBLIC_ENABLE_WEB_PUSH?.toLowerCase() !== "true") {
        console.error("Push notifications not enabled. Update the 'PUBLIC_ENABLE_WEB_PUSH' environment variable");
        return true;
    }

    if (!user_account_id) return { pushSubscriptions: [], errors: [{ message: "Invalid user account provided" }] };
    const pushSubscriptions = await prisma.push_subscription.findMany({ where: { user_account_id, is_active: true } });

    if (mustSetAsUnseen) {
        await prisma.push_subscription.updateMany({
            where: { user_account_id },
            data: { has_unseen_notification: true }
        });
    }

    const errors = [];
    for (const pushSubscription of pushSubscriptions) {
        try {
            await webPush.sendNotification(
                pushSubscription.push_subscription_details,
                JSON.stringify({ notification: notificationContent }),
                { timeout: 30000 }
            );
        } catch (error) {
            console.error("error", error);
            if (error?.statusCode === 410) {
                await prisma.push_subscription.delete({ where: { id: pushSubscription.id } });
            }

            errors.push({
                statusCode: error?.statusCode,
                message: error?.body ?? error?.message ?? "No message provided"
            });
        }
    }

    return { pushSubscriptions, errors };
};

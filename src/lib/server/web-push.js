import { PRIVATE_VAPID_KEY } from "$env/static/private";
import { PUBLIC_VAPID_KEY } from "$env/static/public";

// https://github.com/web-push-libs/web-push
import webPush from "web-push";
import { prisma } from "./prisma-instance";

webPush.setVapidDetails("mailto:dani.simeonov@stratusolve.com", PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

/**
 * Delivers a push notification to a specific subscription
 * @returns {Promise<boolean>} False if anything went wrong
 */
export const deliverPushNotificationToUniqueSubscription = async ({
    uniqueIdentifier = "",
    notificationContent = { title: "Push Notification", body: "More info...", data: {} },
    mustSetAsUnseen = false
}) => {
    const pushSubscription = await prisma.pushSubscription.findFirst({ where: { uniqueIdentifier } });

    if (!pushSubscription) return false;

    if (mustSetAsUnseen) {
        await prisma.pushSubscription.update({ where: { uniqueIdentifier }, data: { hasUnseenNotification: true } });
    }

    try {
        await webPush.sendNotification(pushSubscription.pushSubscriptionDetails, JSON.stringify({ notification: notificationContent }));
    } catch (error) {
        console.error("error", error);
        if (error?.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { uniqueIdentifier } });
            // return true;
        }

        return false;
    }

    return true;
};

/**
 *
 * @param {{userAccountId: number, notificationContent: {title:string, body: string, data:Object}, mustSetAsUnseen:boolean}} param0
 * @returns
 */
export const deliverPushNotificationToAllSubscriptionsForUserAccount = async ({
    userAccountId,
    notificationContent = { title: "Push Notification", body: "More info...", data: {} },
    mustSetAsUnseen = false
}) => {
    const pushSubscriptions = await prisma.pushSubscription.findMany({ where: { userAccountIda: 1 } });
    console.log("pushSubscriptions", pushSubscriptions);

    if (mustSetAsUnseen) {
        await prisma.pushSubscription.updateMany({ where: { userAccountId }, data: { hasUnseenNotification: true } });
    }

    const errors = [];
    for (const pushSubscription of pushSubscriptions) {
        try {
            await webPush.sendNotification(pushSubscription.pushSubscriptionDetails, JSON.stringify({ notification: notificationContent }));
        } catch (error) {
            console.error("error", error);
            if (error?.statusCode === 410) {
                await prisma.pushSubscription.delete({ where: { id: pushSubscription.id } });
            }

            errors.push({ statusCode: error?.statusCode, message: error?.body ?? error?.message ?? "No message provided" });
        }
    }

    return { pushSubscriptions, errors };
};

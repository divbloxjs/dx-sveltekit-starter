import { prisma } from "$lib/server/prisma-instance";
import { json } from "@sveltejs/kit";
import { deliverPushNotificationToUniqueSubscription } from "$lib/server/web-push";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, params }) => {
    console.log("IN DELIVER POST ---------");

    const uniqueIdentifier = "d4adf0cc0e712b9fd99d41bf5c5f6000";
    const notificationContent = {
        notification: {
            title: "HALLO",
            body: `All tickets in`,
            data: { action: "openDeliveryTicket", uniqueIdentifier }
        }
    };

    const mustSetAsUnseen = false;

    const result = await deliverPushNotificationToUniqueSubscription({ uniqueIdentifier, mustSetAsUnseen });
    console.log("result", result);
    return json({});
};

// const deliverPushNotificationToUniqueSubscription = async ({ uniqueIdentifier, notificationContent, mustSetAsUnseen }) => {
//     const pushSubscription = await prisma.pushSubscription.findFirst({ where: { uniqueIdentifier } });

//     console.log("pushSubscription", pushSubscription);
//     if (!pushSubscription) return false;

//     if (mustSetAsUnseen) {
//         await prisma.pushSubscription.update({ where: { uniqueIdentifier }, data: { hasUnseenNotification: true } });
//     }
//     console.log("pushSubscription.pushSubscriptionDetails", pushSubscription.pushSubscriptionDetails);
//     console.log("pushSubscription.notificationContent", notificationContent);

//     try {
//         await webPush.sendNotification(pushSubscription.pushSubscriptionDetails, JSON.stringify(notificationContent));
//     } catch (error) {
//         if (error?.statusCode === 410) {
//             await prisma.pushSubscription.delete({ where: { uniqueIdentifier } });
//             return true;
//         }

//         console.log("error", error);
//         return false;
//     }

//     return true;
// };

// const deliverPushNotificationToAllSubscriptionsForUserAccount = async ({ userAccountId, messageOptions, mustSetAsUnseen }) => {
//     const pushSubscriptions = await prisma.pushSubscription.findMany({ where: { userAccountId } });
//     if (!pushSubscriptions) return false;

//     if (mustSetAsUnseen) {
//         await prisma.pushSubscription.updateMany({ where: { userAccountId }, data: { hasUnseenNotification: true } });
//     }

//     const errors = [];
//     for (const pushSubscription of pushSubscriptions) {
//         const sendResult = await webPush.sendNotification(pushSubscription.pushSubscriptionDetails, JSON.stringify(options));
//         if (!sendResult) {
//             errors.push();
//         }
//     }

//     if (errors.length !== 0) {
//         return false;
//     }

//     return true;
// };

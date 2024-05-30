import { prisma } from "$lib/server/prisma-instance";
import { error, json } from "@sveltejs/kit";
import { createHash } from "node:crypto";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
    const body = await request.json();
    const pushSubscriptionDetails = body?.pushSubscriptionDetails;
    console.log("pushSubscriptionDetails", pushSubscriptionDetails);

    if (
        !pushSubscriptionDetails ||
        !pushSubscriptionDetails?.endpoint ||
        !pushSubscriptionDetails?.keys ||
        !pushSubscriptionDetails?.keys?.auth ||
        !pushSubscriptionDetails?.keys?.p256d
    ) {
        return error(400, { message: "Invalid push subscription details provided" });
    }

    const uniqueIdentifier = await createPushSubscriptionUniqueIdentifier(pushSubscriptionDetails);
    console.log("uniqueIdentifier", uniqueIdentifier);
    if (!uniqueIdentifier) return json({});

    const existingPushSubscription = await prisma.pushSubscription.findFirst({ where: { uniqueIdentifier: uniqueIdentifier } });
    console.log("existingPushSubscription", existingPushSubscription);

    if (existingPushSubscription) return json({});

    const result = await prisma.pushSubscription.create({
        data: { uniqueIdentifier, pushSubscriptionDetails, userAccountId: locals?.user?.id }
    });

    console.log("result", result);

    return json({});
};

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }) => {
    const data = await request.json();

    return json({});
};

/** @type {import('./$types').RequestHandler} */
export const PUT = async ({ request }) => {
    const data = await request.json();

    return json({});
};

/** @type {import('./$types').RequestHandler} */
export const DELETE = async ({ request }) => {
    const body = await request.json();
    const uniqueIdentifier = body?.uniqueIdentifier;
    const userAccountId = body?.userAccountId;

    if (uniqueIdentifier) await prisma.pushSubscription.delete({ where: { uniqueIdentifier } });
    if (userAccountId) await prisma.pushSubscription.deleteMany({ where: { userAccountId } });

    return json({});
};

// const createPushSubscriptionUniqueIdentifier = async (pushSubscriptionDetails = {}) => {
//     if (!pushSubscriptionDetails?.endpoint) return false;

//     return createHash("md5").update(pushSubscriptionDetails?.endpoint).digest("hex");
// };

// const deliverPushNotificationToUniqueSubscription = async ({ uniqueIdentifier, messageOptions, mustSetAsUnseen }) => {
//     const pushSubscription = await prisma.pushSubscription.findFirst({ where: { uniqueIdentifier } });

//     if (!pushSubscription) return false;

//     if (mustSetAsUnseen) {
//         await prisma.pushSubscription.update({ where: { uniqueIdentifier }, data: { hasUnseenNotification: true } });
//     }

//     const sendResult = await webPush.sendNotification(pushSubscription.pushSubscriptionDetails, JSON.stringify(options));
//     if (!sendResult) return false;

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

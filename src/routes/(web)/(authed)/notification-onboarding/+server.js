import { prisma } from "$lib/server/prisma-instance";
import { error, fail, json } from "@sveltejs/kit";
import { createHash } from "node:crypto";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, locals }) => {
    const body = await request.json();
    const pushSubscriptionDetails = body?.pushSubscriptionDetails;

    if (
        !pushSubscriptionDetails ||
        !pushSubscriptionDetails?.endpoint ||
        !pushSubscriptionDetails?.keys ||
        !pushSubscriptionDetails?.keys?.auth ||
        !pushSubscriptionDetails?.keys?.p256d
    ) {
        return error(400, { message: "Invalid push subscription details provided" });
    }

    const unique_identifier = await createPushSubscriptionUniqueIdentifier(pushSubscriptionDetails);
    if (!unique_identifier) return json({});

    const existingPushSubscription = await prisma.push_subscription.findFirst({ where: { unique_identifier: unique_identifier } });

    if (existingPushSubscription) return json({});

    const result = await prisma.push_subscription.create({
        data: { unique_identifier, push_subscription_details: pushSubscriptionDetails, user_account_id: locals?.user?.id }
    });

    return json({});
};

const createPushSubscriptionUniqueIdentifier = async (pushSubscriptionDetails = {}) => {
    if (!pushSubscriptionDetails?.endpoint) return false;

    return createHash("md5").update(pushSubscriptionDetails?.endpoint).digest("hex");
};

import { error, fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { userAccountCreateSchema, userAccountUpdateSchema } from "$components/data-model/user-account/user-account.schema";
import argon2 from "argon2";
import {
    loadUserAccount,
    getUserAccountRelationshipData,
    updateUserAccount
} from "$components/data-model/user-account/user-account.server";
import { deliverPushNotificationToAllSubscriptionsForUserAccount } from "$lib/server/web-push";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    event.locals.auth.isAdmin();

    const { params } = event;

    let form;
    if (params?.id.toLowerCase() === "new") {
        form = await superValidate(event, zod(userAccountCreateSchema));
        const relationshipData = await getUserAccountRelationshipData();
        return { form, ...relationshipData };
    } else {
        form = await superValidate(event, zod(userAccountUpdateSchema));
    }

    const userAccountData = await loadUserAccount(params?.id);

    form.data = { ...userAccountData.userAccount };

    return { form, ...userAccountData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        event.locals.auth.isAdmin();

        const form = await superValidate(event, zod(userAccountCreateSchema));

        if (!form.valid) return fail(400, { form });
        if (form.data.user_role_id?.length === 0) {
            delete form.data.user_role_id;
        }
        form.data.username = form.data.email_address;

        if (form.data.password) {
            form.data.hashed_password = argon2.hash(form.data.password);
            delete form.data.password;
        }
        try {
            await prisma.user_account.create({ data: form.data });
        } catch (error) {
            console.error(error);
            // https://www.prisma.io/docs/orm/reference/error-reference#p2002
            if (error?.code === "P2002") {
                return setError(form, "email_address", "User already exists");
            }

            return fail(400, { form });
        }
    },
    update: async (event) => {
        event.locals.auth.isAdmin();

        const form = await superValidate(event, zod(userAccountUpdateSchema));

        if (!form.valid) return fail(400, { form });

        try {
            await updateUserAccount(form.data);
        } catch (error) {
            console.error(error);
            return fail(400, form);
        }

        return { form };
    },
    delete: async (event) => {
        event.locals.auth.isAdmin();

        await prisma.user_account.delete({ where: { id: event.params?.id } });
    },
    testNotification: async ({ request, locals, params }) => {
        locals.auth.isAdmin();

        const data = await request.formData();
        const userAccountId = data.get("id");

        if (!userAccountId) return fail(400, { message: "No ID provided" });

        const { pushSubscriptions, errors } = await deliverPushNotificationToAllSubscriptionsForUserAccount({ userAccountId });

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

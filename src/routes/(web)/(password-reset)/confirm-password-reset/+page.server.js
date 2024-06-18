import { prisma } from "$lib/server/prisma-instance";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { confirmPasswordResetSchema } from "./confirm-password-reset.schema";
import { sleep } from "dx-utilities";
import { getGuid } from "$lib/server/helpers";
import argon2d from "argon2";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const form = await superValidate(event, zod(confirmPasswordResetSchema));

    const { params, locals, request, route, url } = event;

    const token = url.searchParams.get("token");

    if (!token) return { form, error: true, message: "No token provided" };

    // DX-NOTE: Clean up of ANY expired tokens in system
    await prisma.one_time_token.deleteMany({
        where: { expires_at: { lt: new Date() } }
    });

    // DX-NOTE: How to join on non-fk relations in prisma...? Hm...
    const oneTimeTokens = await prisma.$queryRaw`
    SELECT
        user_account.id as user_account_id,
        user_account.username,
        user_account.email_address,
        one_time_token.id,
        one_time_token.token_value,
        one_time_token.time_to_live_in_minutes,
        one_time_token.expires_at
    FROM user_account
    INNER JOIN one_time_token ON
        one_time_token.linked_entity_id = user_account.id AND
        one_time_token.linked_entity_name = 'userAccount'
    WHERE one_time_token.token_value = ${token}
        AND one_time_token.expires_at >= NOW()
    LIMIT 1;`;

    if (!oneTimeTokens) return { form, error: true };

    if (oneTimeTokens.length === 0) {
        return {
            form,
            error: true
        };
    }

    return { form };
};

/** @type {import('./$types').Actions} */
export const actions = {
    confirmPasswordReset: async (event) => {
        const form = await superValidate(event, zod(confirmPasswordResetSchema));
        if (!form.valid) return fail(400, { form });

        try {
            const oneTimeToken = await prisma.one_time_token.findUnique({ where: { token_value: form.data.token_value } });
            if (!oneTimeToken) return message(form, "No one time token found");

            // DX-NOTE: Clean up of ANY expired tokens in system + currently consumed one
            await prisma.one_time_token.deleteMany({
                where: { expires_at: { lt: new Date() }, token_value: form.data.token_value }
            });

            await prisma.user_account.update({
                where: { id: oneTimeToken.linked_entity_id },
                data: { hashed_password: await argon2d.hash(form.data.password) }
            });
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    }
};

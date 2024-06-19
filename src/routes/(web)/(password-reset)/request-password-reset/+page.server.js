import { prisma } from "$lib/server/prisma-instance";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { requestPasswordResetSchema } from "./request-password-reset.schema";
import { sleep } from "dx-utilities";
import { getGuid } from "$lib/server/helpers";
import { addMinutes } from "date-fns";
import { sendPasswordResetEmail } from "$lib/server/communications";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const form = await superValidate(event, zod(requestPasswordResetSchema));

    return { form };
};

/** @type {import('./$types').Actions} */
export const actions = {
    requestPasswordReset: async (event) => {
        await sleep(1000);
        const form = await superValidate(event, zod(requestPasswordResetSchema));
        if (!form.valid) return fail(400, { form });

        try {
            const userAccount = await prisma.user_account.findUnique({ where: { username: form.data.email_address } });
            if (!userAccount) return message(form, "No user account found");

            // DX-NOTE: Clean up of ANY expired tokens in system
            await prisma.one_time_token.deleteMany({
                where: { expires_at: { lt: new Date() } }
            });

            const token_value = getGuid();

            await prisma.one_time_token.create({
                data: {
                    token_value,
                    time_to_live_in_minutes: 10,
                    expires_at: addMinutes(new Date(), 10),
                    linked_entity_id: userAccount.id,
                    linked_entity_name: "userAccount",
                    token_type: "passwordReset"
                }
            });
            // Send email to user with oneTimeToken

            await sendPasswordResetEmail(userAccount, token_value);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }
    }
};

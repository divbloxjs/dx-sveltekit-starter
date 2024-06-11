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
            const userAccount = await prisma.userAccount.findUnique({ where: { username: form.data.emailAddress } });
            if (!userAccount) return message(form, "No user account found");

            // DX-NOTE: Clean up of ANY expired tokens in system
            await prisma.oneTimeToken.deleteMany({
                where: { expiresAt: { lt: new Date() } }
            });

            const tokenValue = getGuid();

            await prisma.oneTimeToken.create({
                data: {
                    tokenValue,
                    timeToLiveInMinutes: 10,
                    expiresAt: addMinutes(new Date(), 10),
                    linkedEntityId: userAccount.id,
                    linkedEntityName: "userAccount",
                    tokenType: "passwordReset"
                }
            });
            // Send email to user with oneTimeToken

            await sendPasswordResetEmail(userAccount, tokenValue);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    }
};

import { prisma } from "$lib/server/prisma-instance";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { requestPasswordResetSchema } from "./request-password-reset.schema";
import { sleep } from "dx-utilities";

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    const form = await superValidate(
        event,
        zod(
            z.object({
                emailAddress: z.string().trim().min(3).max(150)
            })
        )
    );

    return { form };
}

/** @type {import('./$types').Actions} */
export const actions = {
    requestPasswordReset: async (event) => {
        await sleep(1000);
        const { params } = event;
        const form = await superValidate(event, zod(requestPasswordResetSchema));
        if (!form.valid) return fail(400, { form });

        try {
            // send email
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    }
};

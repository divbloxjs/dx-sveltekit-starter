import { prisma } from "$lib/server/prisma-instance";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { confirmPasswordResetSchema } from "./confirm-password-reset.schema";

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    const { params } = event;

    console.log(params);
    const form = await superValidate(event, zod(confirmPasswordResetSchema));
    return { form };
}

/** @type {import('./$types').Actions} */
export const actions = {
    confirmPasswordReset: async (event) => {
        const { params } = event;
        const form = await superValidate(event, zod(confirmPasswordResetSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await prisma.organisation.create({ data: form.data });
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    }
};

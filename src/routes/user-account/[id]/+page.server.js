import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
    userAccountCreateSchema,
    userAccountUpdateSchema,
} from "$lib/components/data-model/user-account/user-account.schema";

import {
    loadUserAccount,
    getUserAccountRelationshipData,
    updateUserAccount,
} from "$lib/components/data-model/user-account/user-account.server";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
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
        const form = await superValidate(event, zod(userAccountCreateSchema));

        if (!form.valid) return fail(400, { form });

        try {
            await prisma.userAccount.create({ data: form.data });
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    },
    update: async (event) => {
        const form = await superValidate(event, zod(userAccountUpdateSchema));

        if (!form.valid) return fail(400, { form });

        const result = await updateUserAccount(form.data);
        if (!result) return message(form, "Bad!");

        return { form, message: "Updated successfully!" };
    },
    delete: async (event) => {
        await prisma.userAccount.delete({ where: { id: event.params?.id } });
    },
};

import { prisma } from "$lib/server/prisma-instance";
import { fail, message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { userAccountSchema } from "$lib/components/data-model/user-account/user-account.schema";

import {
    loadUserAccount,
    getUserAccountRelationshipData,
    updateUserAccount
} from "$lib/components/data-model/user-account/user-account.server";
import { error } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { params } = event;
    const form = await superValidate(event, zod(userAccountSchema));

    if (params?.id.toLowerCase() === "new") {
        const relationshipData = await getUserAccountRelationshipData();
        return { form, ...relationshipData };
    }

    const userAccountData = await loadUserAccount(params?.id);

    form.data = { ...userAccountData.userAccount };

    console.log("form", form);
    return { form, ...userAccountData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        const form = await superValidate(event, zod(userAccountSchema));

        if (!form.valid) return fail(400, { form });

        try {
            await prisma.userAccount.create({ data: form.data });
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    },
    update: async (event) => {
        const form = await superValidate(event, zod(userAccountSchema));

        if (!form.valid) return fail(400, { form });

        console.log("form", form);
        const result = await updateUserAccount(form.data);
        if (!result) return setError(form, "Bad!");
        return;
        return { form, message: "Updated successfully!" };
    },
    delete: async (event) => {
        await prisma.userAccount.delete({ where: { id: event.params?.id } });
    }
};

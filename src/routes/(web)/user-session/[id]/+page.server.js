import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
    userSessionCreateSchema,
    userSessionUpdateSchema,
} from "$lib/components/data-model/user-session/user-session.schema.js";

import {
    loadUserSession,
    getUserSessionRelationshipData,
    updateUserSession,
    createUserSession,
} from "$lib/components/data-model/user-session/user-session.server";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { params } = event;

    let form;
    if (params?.id.toLowerCase() === "new") {
        form = await superValidate(event, zod(userSessionCreateSchema));
        const relationshipData = await getUserSessionRelationshipData();
        return { form, ...relationshipData };
    } else {
        form = await superValidate(event, zod(userSessionUpdateSchema));
    }

    const userSessionData = await loadUserSession(params?.id);

    form.data = { ...userSessionData.userSession };

    return { form, ...userSessionData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        const form = await superValidate(event, zod(userSessionCreateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await createUserSession(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    update: async (event) => {
        const form = await superValidate(event, zod(userSessionUpdateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await updateUserSession(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    delete: async (event) => {
        await prisma.user_session.delete({ where: { id: event.params?.id } });
    },
};

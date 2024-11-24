import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { userRoleCreateSchema, userRoleUpdateSchema } from "$lib/components/data-model/user-role/user-role.schema.js";

import {
    loadUserRole,
    getUserRoleRelationshipData,
    updateUserRole,
    createUserRole
} from "$lib/components/data-model/user-role/user-role.server";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    event.locals.auth.isAdmin();

    const { params } = event;

    let form;
    if (params?.id.toLowerCase() === "new") {
        form = await superValidate(event, zod(userRoleCreateSchema));
        const relationshipData = await getUserRoleRelationshipData();
        return { form, ...relationshipData };
    } else {
        form = await superValidate(event, zod(userRoleUpdateSchema));
    }

    const userRoleData = await loadUserRole(Number(params?.id));

    form.data = { ...userRoleData.userRole };

    return { form, ...userRoleData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        event.locals.auth.isAdmin();

        const form = await superValidate(event, zod(userRoleCreateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await createUserRole(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    update: async (event) => {
        event.locals.auth.isAdmin();

        const form = await superValidate(event, zod(userRoleUpdateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await updateUserRole(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    delete: async (event) => {
        event.locals.auth.isAdmin();

        await prisma.user_role.delete({ where: { id: Number(event.params?.id) } });
    }
};

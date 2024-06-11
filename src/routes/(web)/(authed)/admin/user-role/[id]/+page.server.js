import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { userRoleCreateSchema, userRoleUpdateSchema } from "$lib/components/shadcn/data-model/user-role/user-role.schema";

import { loadUserRole, getUserRoleRelationshipData, updateUserRole } from "$lib/components/shadcn/data-model/user-role/user-role.server";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { params } = event;

    let form;
    if (params?.id.toLowerCase() === "new") {
        form = await superValidate(event, zod(userRoleCreateSchema));
        const relationshipData = await getUserRoleRelationshipData();
        return { form, ...relationshipData };
    } else {
        form = await superValidate(event, zod(userRoleUpdateSchema));
    }

    const userRoleData = await loadUserRole(params?.id);

    form.data = { ...userRoleData.userRole };

    return { form, ...userRoleData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        const form = await superValidate(event, zod(userRoleCreateSchema));

        if (!form.valid) return fail(400, { form });

        try {
            await prisma.userRole.create({ data: form.data });
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    },
    update: async (event) => {
        const form = await superValidate(event, zod(userRoleUpdateSchema));

        if (!form.valid) return fail(400, { form });

        const result = await updateUserRole(form.data);
        if (!result) return message(form, "Bad!");

        return { form, message: "Updated successfully!" };
    },
    delete: async (event) => {
        await prisma.userRole.delete({ where: { id: event.params?.id } });
    }
};

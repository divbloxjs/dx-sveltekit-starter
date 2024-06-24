import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
    organisationCreateSchema,
    organisationUpdateSchema,
} from "$lib/components/data-model/organisation/organisation.schema.js";

import {
    loadOrganisation,
    getOrganisationRelationshipData,
    updateOrganisation,
    createOrganisation,
} from "$lib/components/data-model/organisation/organisation.server";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { params } = event;

    let form;
    if (params?.id.toLowerCase() === "new") {
        form = await superValidate(event, zod(organisationCreateSchema));
        const relationshipData = await getOrganisationRelationshipData();
        return { form, ...relationshipData };
    } else {
        form = await superValidate(event, zod(organisationUpdateSchema));
    }

    const organisationData = await loadOrganisation(params?.id);

    form.data = { ...organisationData.organisation };

    return { form, ...organisationData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        const form = await superValidate(event, zod(organisationCreateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await createOrganisation(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    update: async (event) => {
        const form = await superValidate(event, zod(organisationUpdateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await updateOrganisation(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    delete: async (event) => {
        await prisma.organisation.delete({ where: { id: event.params?.id } });
    },
};

import { getIntId, getRefererFromRequest } from "$lib/dx-components/data-model/_helpers/helpers";
import { getRequestBody } from "$lib/dx-components/data-model/_helpers/helpers.server";
import { fail, redirect } from "@sveltejs/kit";

import {
    createOrganisation,
    deleteOrganisation,
    loadOrganisation,
    updateOrganisation
} from "$lib/dx-components/data-model/organisation/organisation.server";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { organisationSchema } from "$lib/dx-components/data-model/organisation/organisation.schema";

let redirectPath = "/organisation/overview";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, request }) => {
    console.log("load()");
    const form = await superValidate(zod(organisationSchema));

    if (params?.id.toLowerCase() === "new") {
        return { organisationForm: form };
    }

    const { organisation, placeOptions, parentOrganisationOptions } = await loadOrganisation(params?.id);

    form.data.id = organisation.id.toString();
    form.data.firstName = organisation.firstName;
    form.data.lastName = organisation.lastName;
    form.data.emailAddress = organisation.emailAddress;
    form.data.username = organisation.username;
    form.data.parentOrganisationOptions = organisation.username;
    form.data.placeOptions = placeOptions;
    form.data.parentOrganisationOptions = parentOrganisationOptions;

    return { organisationForm: form };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (data) => {
        const requestBody = await getRequestBody(data, "organisation");

        const result = await createOrganisation(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    update: async (data) => {
        const requestBody = await getRequestBody(data, "organisation");

        const result = await updateOrganisation(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    delete: async (data) => {
        const requestBody = await getRequestBody(data, "organisation");

        const result = await deleteOrganisation(getIntId(data.params?.id));

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    }
};

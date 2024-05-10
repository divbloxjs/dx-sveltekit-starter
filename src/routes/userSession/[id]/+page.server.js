import { getIntId, getRefererFromRequest, getRequestBody } from "$lib/dx-components/data-model/_helpers/helpers";
import { getRequestBody } from "$lib/dx-components/data-model/_helpers/helpers.server";
import { fail, redirect } from "@sveltejs/kit";

import {
    createUserSession,
    deleteUserSession,
    loadUserSession,
    updateUserSession,
} from "$lib/dx-components/data-model/userSession/userSession.server";

let redirectPath = "/userSession/overview";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, request }) => {
    redirectPath = getRefererFromRequest(request, redirectPath);

    if (params?.id.toLowerCase() === "new") {
        return {};
    }

    return await loadUserSession(params?.id);
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (data) => {
        const requestBody = await getRequestBody(data, "userSession");

        const result = await createUserSession(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    update: async (data) => {
        const requestBody = await getRequestBody(data, "userSession");

        const result = await updateUserSession(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    delete: async (data) => {
        const requestBody = await getRequestBody(data, "userSession");

        const result = await deleteUserSession(getIntId(data.params?.id));

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
};

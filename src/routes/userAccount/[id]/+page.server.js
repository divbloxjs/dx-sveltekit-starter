import { getIntId, getRefererFromRequest } from "$lib/dx-components/data-model/_helpers/helpers";
import { getRequestBody } from "$lib/dx-components/data-model/_helpers/helpers.server";
import { fail, redirect } from "@sveltejs/kit";

import {
    createUserAccount,
    deleteUserAccount,
    loadUserAccount,
    updateUserAccount
} from "$lib/dx-components/data-model/userAccount/userAccount.server";

let redirectPath = "/userAccount/overview";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, request }) => {
    redirectPath = getRefererFromRequest(request, redirectPath);

    if (params?.id.toLowerCase() === "new") {
        return {};
    }

    return await loadUserAccount(params?.id);
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (data) => {
        const requestBody = await getRequestBody(data, "userAccount");

        const result = await createUserAccount(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    update: async (data) => {
        const requestBody = await getRequestBody(data, "userAccount");

        const result = await updateUserAccount(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    delete: async (data) => {
        const requestBody = await getRequestBody(data, "userAccount");

        const result = await deleteUserAccount(getIntId(data.params?.id));

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    }
};

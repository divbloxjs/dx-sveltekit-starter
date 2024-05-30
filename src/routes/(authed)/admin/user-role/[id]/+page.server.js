import { getIntId, getRefererFromRequest } from "$lib/dx-components/data-model/_helpers/helpers";
import { getRequestBody } from "$lib/dx-components/data-model/_helpers/helpers.server";
import { fail, redirect } from "@sveltejs/kit";

import { createUserRole, deleteUserRole, loadUserRole, updateUserRole } from "$lib/dx-components/data-model/userRole/userRole.server";

let redirectPath = "/userRole/overview";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, request }) => {
    redirectPath = getRefererFromRequest(request, redirectPath);

    if (params?.id.toLowerCase() === "new") {
        return {};
    }

    return await loadUserRole(params?.id);
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (data) => {
        const requestBody = await getRequestBody(data, "userRole");

        const result = await createUserRole(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    update: async (data) => {
        const requestBody = await getRequestBody(data, "userRole");

        const result = await updateUserRole(requestBody);

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    },
    delete: async (data) => {
        const requestBody = await getRequestBody(data, "userRole");

        const result = await deleteUserRole(getIntId(data.params?.id));

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    }
};

import { getIntId, getRefererFromRequest } from "$lib/dx-components/data-model/_helpers/helpers";
import { getRequestBody } from "$lib/dx-components/data-model/_helpers/helpers.server";
import { fail, redirect } from "@sveltejs/kit";

import {
    createUserAccount,
    deleteUserAccount,
    loadUserAccount,
    updateUserAccount
} from "$lib/dx-components/data-model/userAccount/userAccount.server";
import { userAccountSchema } from "$lib/dx-components/data-model/userAccount/userAccount.schema";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

let redirectPath = "/admin/user-account/overview";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    console.log("load()");
    const { params, request, cookies } = event;
    const form = await superValidate({}, zod(userAccountSchema));

    if (params?.id.toLowerCase() === "new") {
        return {
            form: await superValidate(zod(userAccountSchema))
        };
    }
    console.log("params", params);
    const userAccount = await loadUserAccount(params?.id);

    form.data.emailAddress = userAccount.emailAddress;
    return {
        form: await superValidate(zod(userAccountSchema))
    };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        console.log("ASDASD");
        const { request, cookies } = event;
        const form = await superValidate(event, zod(userAccountSchema));
        console.log(form);

        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const result = await createUserAccount(form.data);

        if (!result)
            return fail(400, {
                form
            });
    },
    update: async (data) => {
        console.log("UPDATING");
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

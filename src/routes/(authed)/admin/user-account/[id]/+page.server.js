import { getIntId, getRefererFromRequest } from "$lib/dx-components/data-model/_helpers/helpers";
import { getRequestBody } from "$lib/dx-components/data-model/_helpers/helpers.server";
import { error, fail, json, redirect } from "@sveltejs/kit";

import {
    createUserAccount,
    deleteUserAccount,
    loadUserAccount,
    updateUserAccount
} from "$lib/dx-components/data-model/userAccount/userAccount.server";
import { userAccountSchema } from "$lib/dx-components/data-model/userAccount/userAccount.schema";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import argon2d from "argon2";
import { prisma } from "$lib/server/prisma-instance";

let redirectPath = "/admin/user-account/overview";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    console.log("load()");
    const { params, request, cookies } = event;
    const form = await superValidate(zod(userAccountSchema));

    if (params?.id.toLowerCase() === "new") {
        return { form };
    }

    const { userAccount } = await loadUserAccount(params?.id);

    form.data.id = userAccount.id.toString();
    form.data.firstName = userAccount.firstName;
    form.data.lastName = userAccount.lastName;
    form.data.emailAddress = userAccount.emailAddress;
    form.data.username = userAccount.username;

    return { form };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        const form = await superValidate(event, zod(userAccountSchema));

        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const userAccount = {
            firstName: form.data.firstName,
            lastName: form.data.lastName,
            emailAddress: form.data.emailAddress,
            username: form.data.emailAddress,
            hashedPassword: await argon2d.hash("password")
        };

        try {
            await prisma.userAccount.create({ data: userAccount });
        } catch (error) {
            console.error(error?.code === "P2002");
            if (error?.code === "P2002") {
                return setError(form, "emailAddress", "E-mail already exists.");
            }

            return message(form, "Something went wrong. Please try again");
        }
    },
    update: async (event) => {
        console.log("UPDATING");
        const form = await superValidate(event, zod(userAccountSchema));
        console.log("form", form);

        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const userAccount = {
            id: form.data.id,
            firstName: form.data.firstName,
            lastName: form.data.lastName,
            emailAddress: form.data.emailAddress,
            username: form.data.emailAddress
        };

        console.log("ABOUT TO START");
        const result = await updateUserAccount(userAccount);
        console.log(result);
        if (!result) return message(form, "Bad!");

        console.log("form", form);
        return { form, message: "Updated successfully!" };
    },
    delete: async (data) => {
        const requestBody = await getRequestBody(data, "userAccount");

        const result = await deleteUserAccount(getIntId(data.params?.id));

        if (!result) return fail(400, requestBody);

        redirect(302, redirectPath);
    }
};

import { FILE_CATEGORY } from "$lib/constants/constants.server";
import { userAccountSchema } from "./schemas/user-account.schema";
import { passwordSchema } from "./schemas/password.schema";
import { loadUserAccount, updateUserAccount } from "$lib/dx-components/data-model/userAccount/userAccount.server";
import { prisma } from "$lib/server/prisma-instance";
import { fail, message, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sleep } from "dx-utilities";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { userAccount } = await loadUserAccount(event?.locals?.user?.id);

    const userForm = await superValidate(zod(userAccountSchema));
    const passwordForm = await superValidate(zod(passwordSchema));
    if (!userAccount) return { userForm, passwordForm };

    passwordForm.data.id = userAccount?.id;

    userForm.data.id = userAccount?.id?.toString();
    userForm.data.firstName = userAccount?.firstName;
    userForm.data.lastName = userAccount?.lastName;
    userForm.data.username = userAccount?.username;
    userForm.data.emailAddress = userAccount?.emailAddress;

    const profilePicture = await prisma.file.findFirst({
        where: { linkedEntity: "userAccount", linkedEntityId: event?.locals?.user?.id, category: FILE_CATEGORY.PROFILE_PICTURE }
    });

    return { userForm, passwordForm, profilePicture };
};

/** @type {import('./$types').Actions} */
export const actions = {
    updateUser: async (event) => {
        console.log("UPDATING");
        await sleep(1000);
        const { request, cookies } = event;
        const form = await superValidate(event, zod(userAccountSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        const result = await updateUserAccount(form.data);
        if (!result) return message(form, "Could not update your details. Please Try again", { status: 400 });

        return { form, message: "Updated successfully!" };
    },
    updatePassword: async (event) => {
        console.log("UPDATING");
        const { request, cookies } = event;
        const form = await superValidate(event, zod(passwordSchema));
        console.log(form);

        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        console.log("ABOUT TO START");
        const result = await updateUserAccount(form.data);

        console.log(result);
        if (!result) return message(form, "Bad!");

        return { form, message: "Updated successfully!" };
    }
};

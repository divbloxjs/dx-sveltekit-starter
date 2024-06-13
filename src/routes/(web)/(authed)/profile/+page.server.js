import { FILE_CATEGORY } from "$lib/constants/constants.server";
import { userAccountSchema } from "./schemas/user-account.schema";
import { passwordSchema } from "./schemas/password.schema";
import { deleteUserAccount, loadUserAccount, updateUserAccount } from "$lib/components/shadcn/data-model/user-account/user-account.server";
import { prisma } from "$lib/server/prisma-instance";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sleep } from "dx-utilities";
import argon2 from "argon2";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const userAccountData = await loadUserAccount(event?.locals?.user?.id);
    const userAccount = userAccountData.userAccount;

    const userForm = await superValidate(zod(userAccountSchema));
    const passwordForm = await superValidate(zod(passwordSchema));
    if (!userAccount) return { userForm, passwordForm };

    passwordForm.data.id = userAccount?.id;

    userForm.data.id = userAccount?.id;
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
        const form = await superValidate(event, zod(userAccountSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        const result = await updateUserAccount(form.data);
        if (!result) return message(form, "Could not update your details. Please Try again", { status: 400 });

        return { form, message: "Updated successfully!" };
    },
    deleteUser: async (event) => {
        const form = await superValidate(event, zod(userAccountSchema));

        if (!form.data?.id) {
            return fail(400, { form });
        }

        const result = await deleteUserAccount(form.data.id);
        if (!result) return message(form, "Could not delete your account. Please Try again", { status: 400 });

        return { form };
    },
    updatePassword: async (event) => {
        const form = await superValidate(event, zod(passwordSchema));

        if (!form.valid) return fail(400, { form });

        const hashedPassword = await argon2.hash(form.data.password);
        const result = await updateUserAccount({ id: form.data.id, hashedPassword });

        if (!result) return message(form, "Bad!");

        return { form, message: "Updated successfully!" };
    },
    updateProfilePictureDisplayName: async (event) => {
        event.locals.auth.isAuthenticated();

        const data = await event.request.formData();
        const displayName = data.get("displayName");
        const fileId = data.get("id");

        await prisma.file.update({
            where: { id: fileId, linkedEntity: "userAccount", linkedEntityId: event.locals.user?.id, category: "profilePicture" },
            data: { displayName }
        });

        return { message: "Updated successfully!" };
    }
};

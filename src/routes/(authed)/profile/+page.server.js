import { FILE_CATEGORY } from "$lib/constants/constants.server";
import { userAccountSchema } from "$lib/dx-components/data-model/userAccount/userAccount.schema";
import { loadUserAccount } from "$lib/dx-components/data-model/userAccount/userAccount.server";
import { prisma } from "$lib/server/prisma-instance";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { userAccount } = await loadUserAccount(event?.locals?.user?.id);

    const form = await superValidate(zod(userAccountSchema));
    if (!userAccount) return { form };

    form.data.id = userAccount?.id;
    form.data.firstName = userAccount?.firstName;
    form.data.lastName = userAccount?.lastName;
    form.data.username = userAccount?.username;
    form.data.emailAddress = userAccount?.emailAddress;
    form.data.password = userAccount?.password;

    const profilePicture = await prisma.file.findFirst({
        where: { linkedEntity: "userAccount", linkedEntityId: event?.locals?.user?.id, category: FILE_CATEGORY.PROFILE_PICTURE }
    });
    return { form, profilePicture };
};

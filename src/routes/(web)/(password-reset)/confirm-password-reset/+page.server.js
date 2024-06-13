import { prisma } from "$lib/server/prisma-instance";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { confirmPasswordResetSchema } from "./confirm-password-reset.schema";
import { sleep } from "dx-utilities";
import { getGuid } from "$lib/server/helpers";
import argon2d from "argon2";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const form = await superValidate(event, zod(confirmPasswordResetSchema));

    const { params, locals, request, route, url } = event;

    const token = url.searchParams.get("token");

    if (!token) return { form, error: true, message: "No token provided" };

    // DX-NOTE: Clean up of ANY expired tokens in system
    await prisma.oneTimeToken.deleteMany({
        where: { expiresAt: { lt: new Date() } }
    });

    // DX-NOTE: How to join on non-fk relations in prisma...? Hm...
    const oneTimeTokens = await prisma.$queryRaw`
    SELECT
        userAccount.id as userAccountId,
        userAccount.username,
        userAccount.emailAddress,
        oneTimeToken.id,
        oneTimeToken.tokenValue,
        oneTimeToken.timeToLiveInMinutes,
        oneTimeToken.expiresAt
    FROM userAccount
    INNER JOIN oneTimeToken ON
        oneTimeToken.linkedEntityId = userAccount.id AND
        oneTimeToken.linkedEntityName = 'userAccount'
    WHERE oneTimeToken.tokenValue = ${token}
        AND oneTimeToken.expiresAt >= NOW()
    LIMIT 1;`;

    if (!oneTimeTokens) return { form, error: true };

    if (oneTimeTokens.length === 0) {
        return {
            form,
            error: true
        };
    }

    return { form };
};

/** @type {import('./$types').Actions} */
export const actions = {
    confirmPasswordReset: async (event) => {
        const form = await superValidate(event, zod(confirmPasswordResetSchema));
        if (!form.valid) return fail(400, { form });

        try {
            const oneTimeToken = await prisma.oneTimeToken.findUnique({ where: { tokenValue: form.data.tokenValue } });
            if (!oneTimeToken) return message(form, "No one time token found");

            // DX-NOTE: Clean up of ANY expired tokens in system + currently consumed one
            await prisma.oneTimeToken.deleteMany({
                where: { expiresAt: { lt: new Date() }, tokenValue: form.data.tokenValue }
            });

            await prisma.userAccount.update({
                where: { id: oneTimeToken.linkedEntityId },
                data: { hashedPassword: await argon2d.hash(form.data.password) }
            });
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    }
};

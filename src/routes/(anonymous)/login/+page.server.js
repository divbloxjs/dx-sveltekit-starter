import { fail, json, redirect } from "@sveltejs/kit";
import { superValidate, message } from "sveltekit-superforms";
import { loginSchema } from "./login.schema";
import { zod } from "sveltekit-superforms/adapters";
import { prisma } from "$lib/server/prisma-instance";
import { addDays, addMinutes } from "date-fns";
import { getGuid } from "$lib/server/helpers";
import argon2 from "argon2";
import { deleteAllExpiredUserSessions } from "$lib/server/auth";
import { SESSION_LENGTH_IN_MINS } from "$env/static/private";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }) => {
    const returnData = {
        loginForm: await superValidate(zod(loginSchema))
    };

    const sessionId = cookies.get("sessionId");
    if (!sessionId) return returnData;

    const userSession = await prisma.userSession.findFirst({
        where: { sessionId, expiryDateTime: { lte: new Date() } },
        select: { id: true, userAccount: true }
    });

    if (!userSession) return { ...returnData, message: "No session ID set" };

    return returnData;
};

/** @type {import('./$types').Actions} */
export const actions = {
    login: async (event) => {
        const { request, cookies } = event;
        const form = await superValidate(event, zod(loginSchema));
        if (!form.valid) return fail(400, { form });

        const existingUser = await prisma.userAccount.findFirst({ where: { userName: form.data.userName } });
        if (!existingUser) return message(form, "Invalid credentials. Please try again");

        let isVerified = false;
        try {
            if (await argon2.verify(existingUser.hashedPassword, form.data.password)) {
                isVerified = true;
            }
        } catch (err) {
            return message(form, "Something went wrong. Please try again");
        }

        if (!isVerified) return message(form, "Invalid credentials. Please try again");

        const newSession = await prisma.userSession.create({
            data: {
                durationInMinutes: parseInt(SESSION_LENGTH_IN_MINS ?? 20),
                expiryDateTime: addMinutes(new Date(), parseInt(SESSION_LENGTH_IN_MINS ?? 20)),
                sessionData: {},
                sessionId: getGuid(),
                userAgent: request.headers.get("user-agent"),
                userAccountId: existingUser.id
            }
        });

        cookies.set("sessionId", newSession.sessionId, {
            path: "/",
            httpOnly: true,
            maxAge: 60 * newSession.durationInMinutes,
            expires: newSession.expiryDateTime
        });

        // Clear up expired tokens from DB
        await deleteAllExpiredUserSessions();

        redirect(301, "/dashboard");
    }
};

import { fail, json, redirect } from "@sveltejs/kit";
import { superValidate, message } from "sveltekit-superforms";
import { loginSchema } from "./login.schema";
import { zod } from "sveltekit-superforms/adapters";
import { prisma } from "$lib/server/prisma-instance";
import { addDays, addMinutes } from "date-fns";
import { getGuid } from "$lib/server/helpers";
import argon2 from "argon2";
import { deleteAllExpiredUserSessions } from "$lib/server/auth";
import { DEFAULT_ROUTE } from "$constants/constants";
import { env } from "$env/dynamic/private";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }) => {
    const returnData = {
        loginForm: await superValidate(zod(loginSchema))
    };

    const sessionId = cookies.get("sessionId");
    if (!sessionId) return returnData;

    const userSession = await prisma.user_session.findFirst({
        where: { sessionId, expiry_date_time: { lte: new Date() } },
        select: { id: true, user_account: true }
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

        const existingUser = await prisma.user_account.findFirst({ where: { username: form.data.emailAddress } });
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

        const newSession = await prisma.user_session.create({
            data: {
                duration_in_minutes: parseInt(env.SESSION_LENGTH_IN_MINS ?? 20),
                expiry_date_time: addMinutes(new Date(), parseInt(env.SESSION_LENGTH_IN_MINS ?? 20)),
                session_data: {},
                session_id: getGuid(),
                userAgent: request.headers.get("user-agent"),
                userAccountId: existingUser.id
            }
        });

        cookies.set("sessionId", newSession.sessionId, {
            path: "/",
            httpOnly: true,
            maxAge: 60 * newSession.durationInMinutes,
            expires: newSession.expires_at
        });

        // Clear up expired tokens from DB
        await deleteAllExpiredUserSessions();

        redirect(300, DEFAULT_ROUTE);
    }
};

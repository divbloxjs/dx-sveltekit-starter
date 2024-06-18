import argon2 from "argon2";

import { fail, redirect } from "@sveltejs/kit";

import { superValidate, setError } from "sveltekit-superforms";
import { registerSchema } from "./register.schema";
import { zod } from "sveltekit-superforms/adapters";
import { prisma } from "$lib/server/prisma-instance";
import { addMinutes } from "date-fns";
import { getGuid } from "$lib/server/helpers";
import { DEFAULT_ROUTE } from "$constants/constants";
import { env } from "$env/dynamic/private";

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
    return {
        registerForm: await superValidate(zod(registerSchema))
    };
};

/** @type {import('./$types').Actions} */
export const actions = {
    register: async (event) => {
        const { request, cookies } = event;

        const form = await superValidate(event, zod(registerSchema));

        if (!form.valid) return fail(400, { form });

        const existingUser = await prisma.user_account.findFirst({ where: { username: form.data.emailAddress } });
        if (existingUser) return setError(form, "emailAddress", "E-mail already exists");

        const userData = {
            email_address: form.data.emailAddress,
            username: form.data.emailAddress,
            hashedPassword: await argon2.hash(form.data.password)
        };

        const newUser = await prisma.user_account.create({ data: userData });

        const newSession = await prisma.user_session.create({
            data: {
                duration_in_minutes: parseInt(env.SESSION_LENGTH_IN_MINS ?? 20),
                expiry_date_time: addMinutes(new Date(), parseInt(env.SESSION_LENGTH_IN_MINS ?? 20)),
                session_data: {},
                session_id: getGuid(),
                userAgent: request.headers.get("user-agent"),
                userAccountId: newUser.id
            }
        });

        cookies.set("sessionId", newSession.sessionId, {
            path: "/",
            httpOnly: true,
            maxAge: 60 * newSession.durationInMinutes, // In seconds
            expires: newSession.expires_at
        });

        redirect(300, DEFAULT_ROUTE);
    }
};

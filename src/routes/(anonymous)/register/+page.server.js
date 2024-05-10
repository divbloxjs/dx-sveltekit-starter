import { fail, redirect } from "@sveltejs/kit";
import { superValidate, setError } from "sveltekit-superforms";
import { registerSchema, initialData } from "./register.schema";
import { zod } from "sveltekit-superforms/adapters";
import { prisma } from "$lib/server/prisma-instance";
import { addMinutes } from "date-fns";
import { getGuid } from "$lib/server/helpers";
import argon2 from "argon2";
import { SESSION_LENGTH_IN_MINS } from "$env/static/private";

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
    return {
        registerForm: await superValidate(initialData, zod(registerSchema))
    };
};

/** @type {import('./$types').Actions} */
export const actions = {
    register: async (event) => {
        const { request, cookies } = event;
        const form = await superValidate(event, zod(registerSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }
        const existingUser = await prisma.userAccount.findFirst({ where: { username: form.data.emailAddress } });

        if (existingUser) return setError(form, "emailAddress", "E-mail already exists");

        const userData = {
            emailAddress: form.data.emailAddress,
            username: form.data.emailAddress,
            hashedPassword: await argon2.hash(form.data.password)
        };

        const newUser = await prisma.userAccount.create({ data: userData });

        const newSession = await prisma.userSession.create({
            data: {
                durationInMinutes: parseInt(SESSION_LENGTH_IN_MINS ?? 20),
                expiryDateTime: addMinutes(new Date(), parseInt(SESSION_LENGTH_IN_MINS ?? 20)),
                sessionData: {},
                sessionId: getGuid(),
                userAgent: request.headers.get("user-agent"),
                userAccountId: newUser.id
            }
        });

        cookies.set("sessionId", newSession.sessionId, {
            path: "/",
            httpOnly: true,
            maxAge: 60 * newSession.durationInMinutes, // In seconds
            expires: newSession.expiryDateTime
        });

        redirect(300, "/dashboard");
    }
};

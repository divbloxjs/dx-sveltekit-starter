import type { Actions, PageServerLoad } from "./$types";

import { fail, json, redirect } from "@sveltejs/kit";
import { superValidate, message } from "sveltekit-superforms";
import { registerSchema, initialData } from "./register.schema";
import { zod } from "sveltekit-superforms/adapters";
import { prisma } from "$lib/server/prisma-instance";
import { addDays } from "date-fns";
import { getGuid } from "$lib/server/helpers";
import argon2 from "argon2";

export const load: PageServerLoad = async () => {
    return {
        registerForm: await superValidate(initialData, zod(registerSchema))
    };
};

export const actions = {
    register: async (event) => {
        const { request, cookies } = event;
        const form = await superValidate(event, zod(registerSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }
        const existingUser = await prisma.userAccount.findFirst({ where: { emailAddress: form.data.emailAddress } });

        if (existingUser) return message(form, "Email address already taken! Please try another one");

        const userData = {
            firstName: form.data.firstName,
            lastName: form.data.lastName,
            emailAddress: form.data.emailAddress,
            hashedPassword: await argon2.hash(form.data.password)
        };

        const newUser = await prisma.userAccount.create({ data: userData });

        const newSession = await prisma.userSession.create({
            data: {
                durationInMinutes: 20,
                expiryDateTime: addDays(new Date(), 20),
                sessionData: {},
                sessionId: getGuid(),
                userAgent: request.headers.get("user-agent"),
                userAccountId: newUser.id
            }
        });

        cookies.set("sessionId", newSession.sessionId, {
            path: "/",
            httpOnly: true,
            maxAge: 60 * newSession.durationInMinutes,
            expires: newSession.expiryDateTime
        });

        redirect(300, "/dashboard");
        // return { form, sessionData: newSession.sessionData };
    }
} satisfies Actions;

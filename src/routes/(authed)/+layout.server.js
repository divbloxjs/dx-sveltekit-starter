import { fail, json, redirect } from "@sveltejs/kit";
import { superValidate, message } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { prisma } from "$lib/server/prisma-instance";
import { addDays } from "date-fns";
import { getGuid } from "$lib/server/helpers";
import argon2 from "argon2";

// /** @type {import('./dashboard/$types').LayoutServerLoad} */
// export const load = async () => {};

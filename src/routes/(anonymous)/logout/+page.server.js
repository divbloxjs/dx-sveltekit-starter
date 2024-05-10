import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }) => {
    console.log("LOGOUT LOAD");
    cookies.delete("sessionId", { path: "/" });
    redirect(307, "/login");
};

/** @type {import('./$types').Actions} */
export const actions = {
    default: async ({ cookies }) => {
        console.log("LOGOUT DEFAULT");
        cookies.delete("sessionId", { path: "/" });
        redirect(307, "/login");
    }
};

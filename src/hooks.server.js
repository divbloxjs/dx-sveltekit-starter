import { authenticateUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    if (event.route.id?.includes("(authed)")) {
        event.locals.user = await authenticateUser(event);
        console.log("IN authed", event.locals.user);
        if (!event.locals.user) {
            throw redirect(303, "/login");
        }
    }

    if (event.route.id?.includes("(anonymous)") && event.cookies.get("sessionId")) {
        event.locals.user = await authenticateUser(event);
        console.log("IN anonymous");
        if (event.locals.user) {
            throw redirect(303, "/dashboard");
        }
    }

    const response = await resolve(event);

    return response;
};

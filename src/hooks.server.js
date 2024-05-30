import { LANDING_PAGE } from "$lib/constants/constants.server";
import { authenticateUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    // If in the (authed) route group, check sessionId for current user
    if (event.route.id?.includes("/(authed)")) {
        event.locals.user = await authenticateUser(event);
        if (!event.locals.user) {
            throw redirect(303, "/login");
        }
    }

    // If in (anonymous) route group, check for current user and if set - navigate to landing page
    if (event.route.id?.includes("/(anonymous)") && event.cookies.get("sessionId")) {
        event.locals.user = await authenticateUser(event);
        if (event.locals.user) {
            throw redirect(303, LANDING_PAGE);
        }
    }

    const response = await resolve(event);

    return response;
};

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
    console.log("error", error);
    console.log("event", event);
    console.log("status", status);
    console.log("message", message);
    return { message: "Whoops!" };
}

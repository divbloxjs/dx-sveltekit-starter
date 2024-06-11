import { DEFAULT_ROUTE } from "$env/static/private";
import { AuthorisationManager, authenticateUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    console.log("event.route.id", event.route.id);
    // If in the (authed) route group, check sessionId for current user
    if (event.route.id?.includes("/(authed)")) {
        console.log("AUTHED");
        event.locals.user = await authenticateUser(event);
        console.log("event.locals.user", event.locals.user);
        if (!event.locals.user) {
            throw redirect(303, "/login");
        }
    }

    // If in (anonymous) route group AND a session is provided, check for current user and if set - navigate to landing page
    if (event.route.id?.includes("/(anonymous)") && event.cookies.get("sessionId")) {
        event.locals.user = await authenticateUser(event);
        if (event.locals.user) {
            throw redirect(303, DEFAULT_ROUTE);
        }
    }

    // DX-NOTE: event.locals.auth is the
    event.locals.auth = new AuthorisationManager(event);
    return await resolve(event);
};

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
    console.log("error", error);
    // console.log("event", event);
    console.log("status", status);
    console.log("message", message);
    return { message };
}

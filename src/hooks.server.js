import { AuthorisationManager, authenticateUser } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    event.locals.user = await authenticateUser(event);
    event.locals.auth = new AuthorisationManager(event);

    // If in the (authed) route group, check sessionId for current user
    if (event.route.id?.includes("/(authed)")) {
        if (!event.locals.user) {
            // No sessionId present at all
            if (!event.cookies.get("sessionId")) {
                throw redirect(303, "/login");
            }

            // Invalid/expired sessionId
            throw redirect(303, "/login?session-expired=true");
        }
    }

    // If in the admin route group, check if the current user isAdmin()
    if (event.route.id?.includes("/admin")) {
        event.locals.auth.isAdmin();
    }

    // DX-NOTE: Can mutate the response for all requests here
    const response = await resolve(event);

    return response;
};

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
    // DX-NOTE: Hook that handles any request that end with an error.
    // Global catch, can be used for logging or piping errors elsewhere

    console.log("error", error);
    console.log("status", status);
    console.log("message", message);

    return { message };
}

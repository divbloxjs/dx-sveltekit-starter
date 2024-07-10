import { DEFAULT_ROUTE } from "$constants/constants";
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    // DX-NOTE: Redirect users that land on the 'root' route ("/") to a configured default route
    if (DEFAULT_ROUTE) redirect(301, DEFAULT_ROUTE);
};

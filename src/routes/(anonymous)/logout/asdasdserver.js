import { json, redirect } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
    cookies.delete("sessionId", { path: "/" });
    redirect(307, "/login");
}

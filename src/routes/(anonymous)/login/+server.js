import { json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ cookies }) => {
    const sessionId = cookies.delete("sessionId", { path: "/" });
    return json({ message: "Logged out" });
};

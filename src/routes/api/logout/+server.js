import { goto } from "$app/navigation";
import { prisma } from "$lib/server/prisma-instance";
import { json, redirect } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, url, cookies }) => {
    const sessionId = cookies.get("sessionId");

    if (!sessionId) throw redirect(301, "/login");

    console.log(cookies.getAll());
    console.log("sessionId", sessionId);
    const result = await prisma.userSession.delete({ where: { sessionId } });
    console.log(result);
    cookies.delete("sessionId", { path: "/" });
    console.log(cookies.getAll());
    throw redirect(301, "/login");
};

import { prisma } from "$lib/server/prisma-instance";
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ cookies }) => {
    const sessionId = cookies.get("sessionId");

    if (!sessionId) throw redirect(301, "/login");

    await prisma.user_session.delete({ where: { sessionId } });
    cookies.delete("sessionId", { path: "/" });
    throw redirect(301, "/login");
};

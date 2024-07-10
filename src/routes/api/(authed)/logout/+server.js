import { prisma } from "$lib/server/prisma-instance";
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ cookies }) => {
    const session_id = cookies.get("sessionId");

    if (!session_id) throw redirect(301, "/login");

    await prisma.user_session.delete({ where: { session_id } });

    cookies.delete("sessionId", { path: "/" });

    throw redirect(301, "/login");
};

import { prisma } from "$lib/server/prisma-instance";
import { fail, json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export const PUT = async ({ request, url }) => {
    // TODO Auth on who you are and what files you can update
    const body = await request.json();
    try {
        await prisma.file.update({ where: { object_identifier: body.guid }, data: { display_name: body.display_name } });

        return json({ message: "Deleted successfully!" });
    } catch (err) {
        console.error(err);
        return fail(400);
    }
};

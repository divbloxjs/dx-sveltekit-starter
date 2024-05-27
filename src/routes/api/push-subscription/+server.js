import { json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
    const data = await request.json();

    return json({});
};

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ request }) => {
    const data = await request.json();

    return json({});
};

/** @type {import('./$types').RequestHandler} */
export const PUT = async ({ request }) => {
    const data = await request.json();

    return json({});
};

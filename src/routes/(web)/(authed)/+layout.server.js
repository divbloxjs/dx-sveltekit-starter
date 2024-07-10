/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals, cookies, params }) => {
    return { currentUser: locals.user };
};

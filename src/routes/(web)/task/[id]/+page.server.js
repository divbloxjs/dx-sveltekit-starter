import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
    taskCreateSchema,
    taskUpdateSchema,
} from "$lib/components/data-model/task/task.schema.js";

import {
    loadTask,
    getTaskRelationshipData,
    updateTask,
    createTask,
} from "$lib/components/data-model/task/task.server";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { params } = event;

    let form;
    if (params?.id.toLowerCase() === "new") {
        form = await superValidate(event, zod(taskCreateSchema));
        const relationshipData = await getTaskRelationshipData();
        return { form, ...relationshipData };
    } else {
        form = await superValidate(event, zod(taskUpdateSchema));
    }

    const taskData = await loadTask(params?.id);

    form.data = { ...taskData.task };

    return { form, ...taskData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        const form = await superValidate(event, zod(taskCreateSchema));

        if (!form.valid) return fail(400, { form });

        try {
            await createTask(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }
    },
    update: async (event) => {
        const form = await superValidate(event, zod(taskUpdateSchema));

        if (!form.valid) return fail(400, { form });

        try {
            await updateTask(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again");
        }

        return { form, message: "Updated successfully!" };
    },
    delete: async (event) => {
        await prisma.task.delete({ where: { id: event.params?.id } });
    },
};

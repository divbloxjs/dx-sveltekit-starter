import { error, fail } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma-instance";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
    fundingEventCreateSchema,
    fundingEventUpdateSchema
} from "$lib/components/data-model/funding-event/funding-event.schema.js";

import {
    loadFundingEvent,
    getFundingEventRelationshipData,
    updateFundingEvent,
    createFundingEvent
} from "$lib/components/data-model/funding-event/funding-event.server";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
    const { params } = event;

    let form;
    if (params?.id.toLowerCase() === "new") {
        form = await superValidate(event, zod(fundingEventCreateSchema));
        const relationshipData = await getFundingEventRelationshipData();
        return { form, ...relationshipData };
    } else {
        form = await superValidate(event, zod(fundingEventUpdateSchema));
    }

    const fundingEventData = await loadFundingEvent(Number(params?.id));
    if (!fundingEventData.fundingEvent) return error(404, { message: "Not found" });

    form.data = { ...fundingEventData.fundingEvent };

    return { form, ...fundingEventData };
};

/** @type {import('./$types').Actions} */
export const actions = {
    create: async (event) => {
        const form = await superValidate(event, zod(fundingEventCreateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await createFundingEvent(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    update: async (event) => {
        const form = await superValidate(event, zod(fundingEventUpdateSchema));
        if (!form.valid) return fail(400, { form });

        try {
            await updateFundingEvent(form.data);
        } catch (error) {
            console.error(error);
            return message(form, "Something went wrong. Please try again", { status: 400 });
        }

        return { form };
    },
    delete: async (event) => {
        await prisma.funding_event.delete({ where: { id: Number(event.params?.id) } });
    }
};

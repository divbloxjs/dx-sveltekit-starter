import { json } from "@sveltejs/kit";

import { loadFundingEventArray } from "$lib/components/data-model/funding-event/funding-event.server";
import { isNumeric, isValidObject } from "dx-utilities";
import { parse } from "qs";

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, url, locals }) {
    const urlSearchParams = parse(url.search, { ignoreQueryPrefix: true });

    const constraints = getConstraintObject(urlSearchParams);

    const result = await loadFundingEventArray(constraints);

    return json({ ...result });
}

const getConstraintObject = (params) => {
    const constraints = {};

    if (params.hasOwnProperty("search")) {
        constraints.search = params.search;
    }

    if (params.hasOwnProperty("limit") && isNumeric(params.limit)) {
        constraints.limit = parseInt(params.limit.toString());
    }

    if (params.hasOwnProperty("offset") && isNumeric(params.offset)) {
        constraints.offset = parseInt(params.offset.toString());
    }

    if (params.hasOwnProperty("sort") && isValidObject(params.sort)) {
        constraints.sort = params.sort;
    }

    if (params.hasOwnProperty("filter") && isValidObject(params.filter)) {
        constraints.filter = params.filter;
    }

    return constraints;
};

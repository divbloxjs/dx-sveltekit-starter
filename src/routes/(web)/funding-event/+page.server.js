// export const ssr = false;

import { loadFundingEventArray } from "$lib/components/data-model/funding-event/funding-event.server";
import { isNumeric, isValidObject } from "dx-utilities";
import { parse } from "qs";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ url, params }) => {
    const urlSearchParams = parse(url.search, { ignoreQueryPrefix: true });

    const constraints = {};

    if (urlSearchParams.hasOwnProperty("search")) {
        constraints.search = urlSearchParams.search;
    }

    if (urlSearchParams.hasOwnProperty("limit") && isNumeric(urlSearchParams.limit)) {
        constraints.limit = parseInt(urlSearchParams.limit.toString());
    }

    if (urlSearchParams.hasOwnProperty("offset") && isNumeric(urlSearchParams.offset)) {
        constraints.offset = parseInt(urlSearchParams.offset.toString());
    }

    if (urlSearchParams.hasOwnProperty("sort") && isValidObject(urlSearchParams.sort)) {
        constraints.sort = urlSearchParams.sort;
    }

    if (urlSearchParams.hasOwnProperty("filter") && isValidObject(urlSearchParams.filter)) {
        constraints.filter = urlSearchParams.filter;
    }

    return await loadFundingEventArray(constraints);
};

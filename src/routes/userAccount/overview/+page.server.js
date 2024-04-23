// export const ssr = false;

import { loadUserAccountArray } from "$lib/dx-components/data-model/userAccount/userAccount.server";
import { isNumeric, isValidObject } from "dx-utilities";
import { parse } from "qs";

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ url, params }) => {
    const urlSearchParams = parse(url.search, { ignoreQueryPrefix: true });
    const constraints = {};

    console.log(urlSearchParams);

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

    console.log("constraints", constraints);
    return await loadUserAccountArray(constraints);
};

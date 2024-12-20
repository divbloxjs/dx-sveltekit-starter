import { error } from "@sveltejs/kit";
import { isNumeric } from "dx-utilities";

export const urlParamParser = {
    /**
     * Returns correctly typed URLSearchParam by key
     * @param {URLSearchParams} searchParams
     * @param {string} key
     * @param {Object} options
     * @param {'string'|'boolean'|'number'} options.type
     * @param {boolean} options.errorIfMissing
     * @returns {string|boolean|number}
     */
    get: (searchParams, key, options = { type: "string", errorIfMissing: false }) => {
        const type = options.hasOwnProperty("type") ? options.type : "string";
        const errorIfMissing = options.hasOwnProperty("errorIfMissing") ? options.errorIfMissing : false;

        let value = searchParams.get(key);

        if (errorIfMissing && value === null) {
            error(400, { message: `URLSearchParam '${key}' not provided.` });
        }

        if (type === "number") {
            if (!isNumeric(value)) {
                error(400, { message: `Non-numeric URLSearchParam '${key}' provided: '${value}'.` });
            }

            return Number(value);
        }

        if (type === "boolean") {
            const lowerCaseVal = value?.toLowerCase();
            const acceptedBooleanVals = ["true", "t", "false", "f"];

            if (!acceptedBooleanVals.includes(lowerCaseVal)) {
                error(400, {
                    message: `Non-boolean URLSearchParam '${key}' provided: '${value}'. Accepted options: ['true', 't', 'false', 'f']`
                });
            }

            return lowerCaseVal === "true" || lowerCaseVal === "t";
        }

        return searchParams.get(key);
    },
    /**
     * Returns correctly typed URLSearchParam by key or errors out
     * @param {URLSearchParams} searchParams
     * @param {string} key
     * @param {Object} options
     * @param {'string'|'boolean'|'number'} options.type
     * @returns {string|boolean|number}
     */
    getOrError: (searchParams, key, options = { type: "string" }) => {
        return urlParamParser.get(searchParams, key, { ...options, errorIfMissing: true });
    },
    /**
     * Returns Boolean search parameters by key
     *
     * True|TRUE|TruE|t|T (case-insensitive) are accepted as true
     *
     * False|FALSE|FaLsE|F|f (case-insensitive) are accepted as false
     * @param {URLSearchParams} searchParams
     * @param {string} key The key to check for
     * @param {Object} options
     * @param {boolean} options.errorIfMissing
     * @returns {boolean}
     */
    getBoolean: (searchParams, key, options = { errorIfMissing: false }) => {
        return urlParamParser.get(searchParams, key, { ...options, type: "boolean" });
    },
    /**
     * Returns Numeric search parameters by key
     * @param {URLSearchParams} searchParams
     * @param {string} key The key to check for
     * @param {Object} options
     * @param {boolean} options.errorIfMissing
     * @returns {boolean}
     */
    getNumeric: (searchParams, key, options = { errorIfMissing: false }) => {
        return urlParamParser.get(searchParams, key, { ...options, type: "number" });
    }
};

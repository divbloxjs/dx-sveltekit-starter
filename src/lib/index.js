// place files you want to import through the `$lib` alias in this folder.

import { isJsonString, isNumeric } from "dx-utilities";
import { toast } from "svelte-sonner";

/**
 * @typedef {(string|boolean|number|File)} StructuredFormDataBase
 */

/**
 * @typedef {(string|boolean|number|File|StructuredFormDataBase[])} StructuredFormData
 */

/**
 *  Helper function to mutate form data back to correct types
 * @param {FormData} body
 * @returns {Record<string, StructuredFormData>}
 */
export function getObjectFromFormBody(body) {
    return [...body.entries()].reduce((data, [key, formValue]) => {
        let finalValue = formValue;

        if (formValue === "true") finalValue = true;
        if (formValue === "false") finalValue = false;
        if (isNumeric(formValue)) finalValue = Number(formValue);
        if (isJsonString(formValue)) finalValue = JSON.parse(formValue);

        // For grouped fields like multi-selects and checkboxes, we need to
        // store the values in an array.
        if (key in data) {
            const val = data[key];
            finalValue = Array.isArray(val) ? [...val, finalValue] : [val, finalValue];
        }

        data[key] = finalValue;

        return data;
    }, {});
}

/**
 * Helper function that validates whether a form action was successful or not
 * @param {import('@sveltejs/kit').ActionResult} result
 * @returns {boolean}
 */
export const checkFormActionResultStatus = (result) => {
    if (result?.type === "success") return true;
    if (result?.type === "failure") return false;

    return false;
};

/**
 * Helper function that deals with showing toasts based on the form action's response
 * @param  {import('@sveltejs/kit').ActionResult} result
 * @returns {boolean}
 */
export const handleFormActionToast = (result) => {
    console.log("result", result);
    const message = result?.data?.message;
    if (!checkFormActionResultStatus(result)) {
        toast.error(result?.data?.message ?? "Something went wrong. Please try again");
        return false;
    }

    // If no message, no toast shown
    if (!message) return true;

    const type = result?.data?.type ?? "success";

    switch (type) {
        case "info":
            toast.info(message);
            break;
        case "error":
            toast.error(message);
            break;
        case "success":
            toast.success(message);
            break;
    }

    return true;
};

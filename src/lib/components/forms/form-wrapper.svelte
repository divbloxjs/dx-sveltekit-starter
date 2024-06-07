<script>
    import SuperDebug, { superForm } from "sveltekit-superforms";

    /** @type {import("sveltekit-superforms").SuperValidated<Record<string, unknown>>} */
    export let data;

    /** @type {"form"|"json"} */
    export let dataType = "form";

    export let invalidateAll = true; // set to false to keep form data using multiple forms on a page

    export const superform = superForm(data, {
        dataType,
        invalidateAll,
        onUpdated({ form }) {
            if (form.valid) {
                // Successful post! Do some more client-side stuff.
            }
        }
    });

    const { form, message, delayed, errors, allErrors, enhance } = superform;
</script>

<form method="POST" use:enhance {...$$restProps}>
    <slot {superform} form={$form} message={$message} errors={$errors} allErrors={$allErrors} delayed={$delayed} />
</form>

<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Checkbox } from "$lib/components/shadcn/ui/checkbox";

    /**
     * @type {import('sveltekit-superforms/client').SuperForm<any,any>}
     */
    export let form;
    export let name;

    export let label = undefined;
    export let checked = false;
</script>

<Form.Field {form} {name}>
    <Form.Control let:attrs>
        {#if label}
            <Form.Label>{label}</Form.Label>
        {/if}
        <Checkbox {...attrs} bind:checked />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

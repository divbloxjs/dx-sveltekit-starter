<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input } from "$lib/components/shadcn/ui/input";

    /** @type {import('sveltekit-superforms/client').SuperForm<any,any>} */
    export let form;
    export let name;

    /** @type {string|number} */
    export let value;
</script>

<Form.Field {form} {name} class="m-0 p-0">
    <Form.Control let:attrs>
        <Input {...attrs} {...$$restProps} type="hidden" bind:value on:change />
    </Form.Control>
</Form.Field>

<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input, InputNumber } from "$lib/components/shadcn/ui/input";

    /** @type {import('sveltekit-superforms/client').SuperForm<any,any>} */
    export let form;
    export let name;

    export let type = "text";

    /** @type {string|number} */
    export let value;
</script>

<Form.Field {form} {name} class="m-0 p-0">
    <Form.Control let:attrs>
        {#if type === "number"}
            <InputNumber {...attrs} {...$$restProps} bind:value on:change />
        {:else}
            <Input {...attrs} {...$$restProps} {type} bind:value on:change />
        {/if}
    </Form.Control>
</Form.Field>

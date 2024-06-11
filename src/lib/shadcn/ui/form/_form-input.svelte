<script>
    import * as Form from "$lib/shadcn/ui/form";
    import { Input } from "$lib/shadcn/ui/input";

    export let form;
    export let name;

    export let type = "text";
    export let label;

    export let value;
</script>

<Form.Field {form} {name} class={`my-0 ${type === "hidden" ? "" : "p-1"}`}>
    <Form.Control let:attrs>
        {#if type !== "hidden"}
            <Form.Label>{label}</Form.Label>
        {/if}
        <Input {...attrs} {...$$restProps} {type} bind:value />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

<script>
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";

    export let form;
    export let name;

    export let type = "text";
    export let label;

    export let value;
</script>

<Form.Field {form} {name} class={`${type === "hidden" ? "m-0 p-0" : ""}`}>
    <Form.Control let:attrs>
        {#if type !== "hidden"}
            <Form.Label>{label}</Form.Label>
        {/if}
        <Input {...attrs} {...$$restProps} {type} bind:value />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

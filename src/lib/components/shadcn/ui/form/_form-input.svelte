<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input, InputNumber } from "$lib/components/shadcn/ui/input";

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
        {#if type === "number"}
            <InputNumber {...attrs} {...$$restProps} bind:value />
        {:else}
            <Input {...attrs} {...$$restProps} {type} bind:value />
        {/if}
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

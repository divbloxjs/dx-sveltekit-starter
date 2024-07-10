<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Textarea } from "$lib/components/shadcn/ui/textarea";
    import { cn } from "$lib/components/shadcn/utils";

    /**
     * @type {import('sveltekit-superforms/client').SuperForm<any,any>}
     */
    export let form;
    export let name;

    export let label = undefined;
    export let placeholder = undefined;

    /**
     * @type {string}
     */
    export let value;

    let classNames = "";
    export { classNames as class };

    export let formFieldClass = "";
</script>

<Form.Field {form} {name} class={cn("", formFieldClass)}>
    <Form.Control let:attrs>
        {#if label}
            <Form.Label>{label}</Form.Label>
        {/if}
        <Textarea {...attrs} {placeholder} class={classNames} bind:value />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

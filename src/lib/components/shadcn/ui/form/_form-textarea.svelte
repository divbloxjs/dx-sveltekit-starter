<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Textarea } from "$lib/components/shadcn/ui/textarea";
    import { cn } from "$lib/components/shadcn/utils";

    export let form;
    export let name;

    export let label;
    export let placeholder = "Description...";
    export let value;

    let classNames = "";
    export { classNames as class };
    export let formFieldClass = "";
</script>

<Form.Field {form} {name} class={formFieldClass}>
    <Form.Control let:attrs>
        <Form.Label>{label}</Form.Label>
        <Textarea {...attrs} {placeholder} class={classNames} bind:value />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

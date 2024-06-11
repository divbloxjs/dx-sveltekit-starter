<script>
    import * as Form from "$lib/shadcn/ui/form";
    import { Checkbox } from "$lib/shadcn/ui/checkbox";

    export let name;
    export let label;
    export let form;
    export let checked = false;
</script>

<Form.Field {form} {name}>
    <Form.Control let:attrs>
        <Form.Label>{label}</Form.Label>
        <Checkbox {...attrs} bind:checked />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

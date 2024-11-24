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
        <div class="flex items-center gap-2">
            {#if label}
                <Form.Label class="h-full">{label}</Form.Label>
            {/if}
            <Checkbox {...attrs} bind:checked />
        </div>
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

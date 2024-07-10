<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input, InputNumber } from "$lib/components/shadcn/ui/input";

    /**
     * @type {import('sveltekit-superforms/client').SuperForm<any,any>}
     */
    export let form;
    export let name;

    export let type = "text";
    export let label = undefined;

    /**
     * @type {string|number}
     */
    export let value;
</script>

{#if type === "hidden"}
    <Form.Field {form} {name} class="m-0 p-0">
        <Form.Control let:attrs>
            <Input {...attrs} {...$$restProps} {type} bind:value />
        </Form.Control>
    </Form.Field>
{:else}
    <Form.Field {form} {name}>
        <Form.Control let:attrs>
            {#if label}
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
{/if}

<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input, InputNumber } from "$lib/components/shadcn/ui/input";

    /**
     * @type {import('sveltekit-superforms/client').SuperForm<any,any>}
     */
    export let form;
    export let name;
    export let fieldClass = "";

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
            <Input {...attrs} {...$$restProps} {type} bind:value on:change />
        </Form.Control>
    </Form.Field>
{:else}
    <Form.Field {form} {name} class={fieldClass}>
        <Form.Control let:attrs>
            {#if label}
                <Form.Label>{label}</Form.Label>
            {/if}

            {#if type === "number"}
                <InputNumber {...attrs} {...$$restProps} bind:value on:change />
            {:else}
                <Input {...attrs} {...$$restProps} {type} bind:value on:change />
            {/if}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
{/if}

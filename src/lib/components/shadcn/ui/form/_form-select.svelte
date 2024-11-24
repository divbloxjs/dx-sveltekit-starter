<script>
    import { cn } from "$components/shadcn/utils";
    import * as Form from "$lib/components/shadcn/ui/form";
    import * as Select from "$lib/components/shadcn/ui/select/index";
    import { createEventDispatcher } from "svelte";

    /**
     * @type {import('sveltekit-superforms/client').SuperForm<any,any>}
     */
    export let form;

    export let placeholder = "-Please Select-";
    export let name;
    export let label = name;

    export let formFieldClass = "";

    /**
     * @type {import('../../../../../app').GenericDropdownOptions}
     */
    export let options = [];

    export let selectedValue = "";
    export let allowNull = true;

    /**
     * @type {import('../../../../../app').GenericDropdownOption}
     */
    let selected;

    $: selectedValue, (selected = options.find(({ value, label }) => value === selectedValue) ?? { label: "-Please Select-", value: "" });
    const dispatch = createEventDispatcher();
</script>

<Form.Field {form} {name} class={cn("", formFieldClass)}>
    <Form.Control let:attrs>
        <Form.Label>{label}</Form.Label>

        <input hidden bind:value={selectedValue} name={attrs.name} />

        <Select.Root
            {selected}
            onSelectedChange={(v) => {
                v && (selectedValue = v.value);
                dispatch("select-changed", { value: selectedValue });
            }}>
            <Select.Input name={attrs.name} />
            <Select.Trigger {...attrs}>
                <Select.Value {placeholder} />
            </Select.Trigger>
            <Select.Content>
                {#if allowNull}
                    <Select.Item {...$$restProps} value={null} label={"-Please Select-"} class="bg-accent/80" />
                {/if}
                {#if options.length === 0}
                    <Select.Item disabled value="" label="No options" />
                {/if}

                {#each options as option}
                    <Select.Item {...$$restProps} value={option.value} label={option.label} />
                {/each}
            </Select.Content>
        </Select.Root>
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

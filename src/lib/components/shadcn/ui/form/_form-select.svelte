<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import * as Select from "$lib/components/shadcn/ui/select/index";
    import { onMount } from "svelte";

    export let form;

    export let placeholder = "-Please Select-";
    export let name;
    export let label = name;

    export let options = [];
    export let selectedValue = "";

    let selected;

    onMount(() => {
        selected = options.find(({ value, label }) => value === selectedValue) ?? { label: "-Please Select-", value: "" };
        console.log("options", options);
        console.log("selectedValue", selectedValue);
    });
</script>

<Form.Field {form} {name} class="my-0 p-1">
    <Form.Control let:attrs>
        <Form.Label>{label}</Form.Label>

        <input hidden bind:value={selectedValue} name={attrs.name} />

        <Select.Root
            {selected}
            onSelectedChange={(v) => {
                v && (selectedValue = v.value);
            }}>
            <Select.Input name={attrs.name} />
            <Select.Trigger {...attrs}>
                <Select.Value {placeholder} />
            </Select.Trigger>
            <Select.Content>
                {#if options.length === 0}
                    <Select.Item disabled value="" label="No options" />
                {/if}

                {#each options as option}
                    <Select.Item value={option.value} label={option.label} />
                {/each}
            </Select.Content>
        </Select.Root>
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

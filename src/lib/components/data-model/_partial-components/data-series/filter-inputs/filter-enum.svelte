<script>
    import Button from "$components/shadcn/ui/button/button.svelte";
    import Input from "$components/shadcn/ui/input/input.svelte";
    import * as Select from "$lib/components/shadcn/ui/select/index";
    import { RotateCcw } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";

    export let placeholder = "-Please Select-";
    export let name;
    export let label = name;

    export let options = [];
    export let selectedValue = "";

    const dispatch = createEventDispatcher();

    const handleFilterClear = () => {
        selectedValue = "";
        dispatch("filter-clear");
    };

    let selected;

    $: selectedValue, (selected = options.find(({ value, label }) => value === selectedValue) ?? { label: "-Please Select-", value: "" });
</script>

<div class="flex items-center gap-1">
    <Select.Root
        {selected}
        onSelectedChange={(v) => {
            v && (selectedValue = v.value);
            dispatch("filter-change", { filterValue: selectedValue, filterComparison: "eq" });
        }}>
        <Select.Input {name} />
        <Select.Trigger class="h-6 min-w-40">
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
    <Button variant="link" size="inline-icon" on:click={handleFilterClear}>
        <RotateCcw size="18" />
    </Button>
</div>

<script>
    import { Button } from "$components/shadcn/ui/button";
    import { Input } from "$components/shadcn/ui/input";
    import RotateCcw from "lucide-svelte/icons/rotate-ccw";
    import { createEventDispatcher } from "svelte";

    export let displayName;
    export let filterValue;

    const dispatch = createEventDispatcher();
</script>

<div class="flex items-center gap-1">
    <Input
        class="h-6"
        type="date"
        name={displayName}
        placeholder="Filter..."
        bind:value={filterValue}
        on:change={() => dispatch("filter-change", { filterValue, filterComparison: "eq" })} />

    <Button variant="link" size="inline-icon" on:click={() => dispatch("filter-clear")}>
        <RotateCcw size="18" />
    </Button>
</div>

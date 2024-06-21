<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { Button } from "$components/shadcn/ui/button";
    import { Input } from "$components/shadcn/ui/input";
    import RotateCcw from "lucide-svelte/icons/rotate-ccw";
    import { parse, stringify } from "qs";

    export let displayName;
    export let attributeName;
    export let filters;
    export let basePath;

    //#region Filter handlers
    const handleFilterChange = (displayName, attributeName) => {
        const originalParams = parse($page.url.search, { ignoreQueryPrefix: true });

        if (!originalParams.filter) originalParams.filter = {};

        if (!originalParams.filter[attributeName]) {
            originalParams.filter[attributeName] = { eq: filters[displayName] };
        }

        const newParams = stringify(originalParams, { encodeValuesOnly: true });

        goto(`${basePath}?${newParams}`, {
            keepFocus: true
        });
    };

    const handleFilterClear = (displayName, attributeName) => {
        filters[displayName] = "";
        const originalParams = parse($page.url.search, { ignoreQueryPrefix: true });

        delete originalParams.filter?.[attributeName];
        const newParams = stringify(originalParams, { encodeValuesOnly: true });
        goto(`${basePath}?${newParams}`, {
            invalidateAll: true
        });
    };
    //#endregion
</script>

<Input
    type="text"
    class="h-6"
    name={displayName}
    placeholder="Filter..."
    bind:value={filters[displayName]}
    on:change={() => handleFilterChange(displayName, attributeName)} />

<Button variant="link" size="inline-icon" class="ml-2 h-4 w-4" on:click={() => handleFilterClear(displayName, attributeName)}>
    <RotateCcw />
</Button>

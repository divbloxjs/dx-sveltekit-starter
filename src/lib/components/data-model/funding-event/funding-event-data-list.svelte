<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { page } from "$app/stores";

    import { Input } from "$lib/components/shadcn/ui/input";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";

    import { Plus, X } from "lucide-svelte";

    import DataListRowFundingEvent from "$lib/components/data-model/funding-event/data-series/funding-event-data-list-row.svelte";

    export let getEntityArrayPath = "/funding-event";
    export let entityInstancePath = "/funding-event";
    export let redirectBackPath = $page.url.pathname;

    export let disableDefaultRowClickAction = false;

    export let defaultSearch = "";
    let search = defaultSearch;

    export let defaultLimit = 2;
    $: limit = Number(defaultLimit);

    export let paginateSize = 2;

    export let allowCreate = true;

    const dispatch = createEventDispatcher();

    let fundingEventArray = [];
    let fundingEventTotalCount = 0;
    let enums = [];

    let isInitialised = false;
    onMount(async () => {
        let newSearchParams = new URLSearchParams();
        newSearchParams.set("limit", limit.toString());

        await getFundingEventArray(newSearchParams);

        isInitialised = true;
    });

    const getFundingEventArray = async (searchParams) => {
        const response = await fetch(`${getEntityArrayPath}?${searchParams?.toString() ?? ""}`);
        const result = await response.json();

        if (!Array.isArray(result.fundingEventArray)) {
            return;
        }

        fundingEventArray = result.fundingEventArray;
        fundingEventTotalCount = result.fundingEventTotalCount;
        enums = result.enums;
    };

    const handleSearchChange = () => {
        let newSearchParams = new URLSearchParams();
        if (search) newSearchParams.set("search", search);

        limit = Number(defaultLimit);
        newSearchParams.set("limit", limit.toString());

        getFundingEventArray(newSearchParams);
    };

    const handleSearchClear = () => {
        search = "";
        limit = Number(defaultLimit);

        let newSearchParams = new URLSearchParams();
        if (limit) newSearchParams.set("limit", limit.toString());

        getFundingEventArray(newSearchParams);
    };

    const handleLoadMore = async () => {
        let offset = limit;
        limit = limit + paginateSize;

        let newSearchParams = new URLSearchParams();
        if (limit) newSearchParams.set("limit", limit.toString());
        if (offset) newSearchParams.set("offset", offset.toString());
        if (search) newSearchParams.set("search", search);

        const response = await fetch(`${getEntityArrayPath}?${newSearchParams?.toString() ?? ""}`);
        const result = await response.json();

        if (!Array.isArray(result.fundingEventArray)) {
            return;
        }

        fundingEventArray = [...fundingEventArray, ...result.fundingEventArray];
        fundingEventTotalCount = result.fundingEventTotalCount;

        enums = result.enums;
    };
</script>

<div class="flex h-full w-full flex-col gap-2">
    <div class="flex flex-row gap-2">
        <Input class="h-9" type="text" bind:value={search} placeholder="Search..." on:change={handleSearchChange} />
        <Button size="sm" variant="link" class="px-0" on:click={handleSearchClear}><X /></Button>
        {#if allowCreate}
            <a href={`${entityInstancePath}/new`} class={`${buttonVariants({ size: "sm" })}`}><Plus></Plus></a>
        {/if}
    </div>

    <div class="w-full divide-y overflow-y-auto rounded-lg border">
        {#if isInitialised}
            {#each fundingEventArray as fundingEventData}
                <DataListRowFundingEvent
                    {fundingEventData}
                    basePath={entityInstancePath}
                    {redirectBackPath}
                    {disableDefaultRowClickAction}
                    on:row-clicked={(event) => dispatch("row-clicked", event.detail)} />
            {/each}

            {#if fundingEventArray.length === 0}
                <button class="w-full bg-card px-2 py-4 text-center">
                    <p class="truncate">No results found</p>
                </button>
            {/if}
        {:else}
            <button class="w-full bg-card px-2 py-4 text-center">
                <p class="truncate">Loading...</p>
            </button>
        {/if}
    </div>

    {#if fundingEventTotalCount > limit}
        <Button variant="link" size="sm" class="self-center" on:click={handleLoadMore}>Load More</Button>
    {/if}
</div>

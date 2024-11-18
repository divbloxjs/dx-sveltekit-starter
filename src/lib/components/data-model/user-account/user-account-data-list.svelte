<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { page } from "$app/stores";

    import { Input } from "$lib/components/shadcn/ui/input";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";
    import { Label } from "$lib/components/shadcn/ui/label";

    import DataListRowUserAccount from "$lib/components/data-model/user-account/data-series/user-account-data-list-row.svelte";

    export let getUserAccountArrayPath = "/user-account";
    export let entityInstancePath = "/user-account";
    export let redirectBackPath = $page.url.pathname;

    export let disableDefaultRowClickAction = false;

    export let defaultSearch = "";
    let search = defaultSearch;

    export let defaultLimit = 2;
    $: limit = defaultLimit;

    export let paginateSize = 2;

    export let allowCreate = true;

    const dispatch = createEventDispatcher();

    let userAccountArray = [];
    let userAccountTotalCount = 0;
    let enums = [];

    let isInitialised = false;
    onMount(async () => {
        let newSearchParams = new URLSearchParams();
        newSearchParams.set("limit", limit.toString());

        getUserAccountArray(newSearchParams);
    });

    const getUserAccountArray = async (searchParams) => {
        isInitialised = false;
        const response = await fetch(`${getUserAccountArrayPath}?${searchParams?.toString() ?? ""}`);
        const result = await response.json();

        userAccountArray = result.userAccountArray;
        userAccountTotalCount = result.userAccountTotalCount;
        enums = result.enums;
        isInitialised = true;
    };

    const handleSearchChange = () => {
        let newSearchParams = new URLSearchParams();
        if (search) newSearchParams.set("search", search);

        limit = defaultLimit;
        newSearchParams.set("limit", limit.toString());

        getUserAccountArray(newSearchParams);
    };

    const handleSearchClear = () => {
        search = "";
        let newSearchParams = new URLSearchParams();
        if (limit) newSearchParams.set("limit", limit.toString());

        getUserAccountArray(newSearchParams);
    };

    const handleLoadMore = () => {
        limit = limit + paginateSize;

        let newSearchParams = new URLSearchParams();
        if (limit) newSearchParams.set("limit", limit.toString());
        if (search) newSearchParams.set("search", search);

        getUserAccountArray(newSearchParams);
    };
</script>

<div class="flex w-full flex-col gap-2 p-2">
    <Label for="search">Search</Label>
    <div class="flex flex-row gap-2">
        <Input class="h-9" type="text" bind:value={search} on:change={handleSearchChange} />
        <Button size="sm" on:click={handleSearchClear}>Clear</Button>
    </div>
    <div class="mt-2 flex flex-row">
        {#if allowCreate}
            <a href={`${entityInstancePath}/new`} class={`${buttonVariants({ size: "sm" })}`}>New</a>
        {/if}
    </div>
    <div class="max-h-96 w-full divide-y overflow-y-auto rounded-lg border">
        {#if isInitialised}
            {#each userAccountArray as userAccountData}
                <DataListRowUserAccount
                    {userAccountData}
                    basePath={entityInstancePath}
                    {redirectBackPath}
                    {disableDefaultRowClickAction}
                    on:row-clicked={(event) => dispatch("row-clicked", event.detail)} />
            {/each}

            {#if userAccountArray.length === 0}
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

    {#if userAccountTotalCount > limit}
        <Button variant="link" size="sm" class="self-center" on:click={handleLoadMore}>Load More</Button>
    {/if}
</div>

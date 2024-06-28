<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { page } from "$app/stores";

    import { Input } from "$lib/components/shadcn/ui/input";
    import { Button } from "$lib/components/shadcn/ui/button";
    import { Label } from "$lib/components/shadcn/ui/label";

    import DataListRowUserRole from "$lib/components/data-model/user-role/data-series/user-role-data-list-row.svelte";

    export let getEntityArrayPath = "/user-role";
    export let entityInstancePath = "/user-role";
    export let redirectBackPath = $page.url.pathname;

    export let disableDefaultRowClickAction = false;

    export let defaultSearch = "";
    let search = defaultSearch;

    export let defaultLimit = 2;
    let limit = defaultLimit;

    export let paginateSize = 2;

    const dispatch = createEventDispatcher();

    let userRoleArray = [];
    let userRoleTotalCount = 0;
    let enums = [];

    let isInitialised = false;
    onMount(async () => {
        await getUserRoleArray();
        limit = userRoleArray.length;
    });

    const getUserRoleArray = async (searchParams) => {
        isInitialised = false;
        const response = await fetch(`${getEntityArrayPath}?${searchParams?.toString() ?? ""}`);
        const result = await response.json();

        userRoleArray = result.userRoleArray;
        userRoleTotalCount = result.userRoleTotalCount;
        enums = result.enums;

        isInitialised = true;
    };

    const handleSearchChange = () => {
        let newSearchParams = new URLSearchParams();
        if (search) newSearchParams.set("search", search);

        limit = defaultLimit;
        newSearchParams.set("limit", limit.toString());

        getUserRoleArray(newSearchParams);
    };

    const handleSearchClear = () => {
        search = "";
        let newSearchParams = new URLSearchParams();
        if (limit) newSearchParams.set("limit", limit.toString());

        getUserRoleArray(newSearchParams);
    };

    const handleLoadMore = () => {
        limit = limit + paginateSize;

        let newSearchParams = new URLSearchParams();
        if (limit) newSearchParams.set("limit", limit.toString());
        if (search) newSearchParams.set("search", search);

        getUserRoleArray(newSearchParams);
    };
</script>

<div class="flex w-full flex-col gap-2">
    <Label for="search">Search</Label>
    <div class="flex flex-row gap-2">
        <Input class="h-9" type="text" bind:value={search} on:change={handleSearchChange} />
        <Button size="sm" on:click={handleSearchClear}>Clear</Button>
    </div>

    <div class="max-h-96 w-full divide-y overflow-y-auto rounded-lg border">
        {#if isInitialised}
            {#each userRoleArray as userRoleData}
                <DataListRowUserRole
                    {userRoleData}
                    basePath={entityInstancePath}
                    {redirectBackPath}
                    {disableDefaultRowClickAction}
                    on:row-clicked={(event) => dispatch("row-clicked", event.detail)} />
            {/each}

            {#if userRoleArray.length === 0}
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
    userRoleTotalCount: {userRoleTotalCount} <br />
    limit: {limit}
    {#if userRoleTotalCount > limit}
        <Button variant="link" size="sm" class="self-center" on:click={handleLoadMore}>Load More</Button>
    {/if}
</div>

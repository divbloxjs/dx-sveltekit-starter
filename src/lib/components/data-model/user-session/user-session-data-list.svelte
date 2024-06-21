<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    import { Input } from "$lib/components/shadcn/ui/input";
    import { Button } from "$lib/components/shadcn/ui/button";
    import { Label } from "$lib/components/shadcn/ui/label";

    import DataListRowUserSession from "$lib/components/data-model/user-session/data-series/user-session-data-list-row.svelte";

    export let basePath = "/user-session";
    export let data;

    export let defaultSearch = "";
    export let pageSize = 10;

    let search = defaultSearch;
    let limit = pageSize;

    if ($page.url.searchParams.get("limit")) limit = parseInt($page.url.searchParams.get("limit") ?? "2");
    if ($page.url.searchParams.get("search")) search = $page.url.searchParams.get("search") ?? "";

    const handleSearchChange = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.set("search", search);
        goto(`?${newSearchParams.toString()}`);
    };

    const handleSearchClear = () => {
        search = "";
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.delete("search");
        goto(`?${newSearchParams.toString()}`);
    };

    const handleLoadMore = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        limit = limit + pageSize;
        newSearchParams.set("limit", limit.toString());
        goto(`?${newSearchParams.toString()}`);
    };
</script>

<div class="flex w-full flex-col gap-2">
    <Label for="search">Search</Label>
    <div class="flex flex-row gap-2">
        <Input class="h-9" type="text" bind:value={search} on:change={handleSearchChange} />
        <Button size="sm" on:click={handleSearchClear}>Clear</Button>
    </div>

    <div class="w-full divide-y overflow-hidden rounded-lg border">
        {#each data.userSessionArray as userSessionData}
            <DataListRowUserSession {userSessionData} />
        {/each}
    </div>

    {#if data?.userSessionTotalCount > limit}
        <Button variant="link" size="sm" class="self-center" on:click={handleLoadMore}>Load More</Button>
    {/if}
</div>


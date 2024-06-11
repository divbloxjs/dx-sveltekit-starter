<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    import DataListRowUserAccount from "$lib/components/data-model/user-account/data-series/user-account-data-list-row.svelte";
    import { Input } from "$lib/shadcn/ui/input";
    import Button from "$lib/shadcn/ui/button/button.svelte";
    import Label from "$lib/shadcn/ui/label/label.svelte";

    export let basePath = "/user-account";
    export let data;

    let limit = parseInt($page.url.searchParams.get("limit") ?? "2");
    if (!limit) limit = 2;

    let search = $page.url.searchParams.get("search");
    if (!search) search = "";

    let offset = parseInt($page.url.searchParams.get("offset") ?? "0");
    if (!offset) offset = 0;

    const handleSearchChange = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.set("search", search);
        goto(`${basePath}/overview?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };

    const handleSearchClear = () => {
        search = "";
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.delete("search");
        goto(`${basePath}/overview?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };
    const handleLimitChange = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.set("limit", limit.toString());
        goto(`${basePath}/overview?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };
    const handleLimitClear = () => {
        limit = 10;
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.set("limit", limit.toString());
        goto(`${basePath}/overview?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };

    const handleLoadMore = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        limit = limit + 2;
        newSearchParams.set("limit", limit.toString());
        goto(`${basePath}/overview?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };
</script>

<div class="flex w-full flex-col">
    <Label for="search">
        Search
        <div class="flex flex-row gap-2">
            <Input type="text" bind:value={search} on:change={handleSearchChange} />
            <Button on:click={handleSearchClear}>Clear</Button>
        </div>
    </Label>

    <Label for="limit">
        Limit
        <div class="flex flex-row gap-2">
            <Input type="number" bind:value={limit} on:change={handleLimitChange} />
            <Button on:click={handleLimitClear}>Reset</Button>
        </div>
    </Label>

    <Button variant="link" class="self-center" on:click={goto(`${basePath}/overview`)}>Reset All</Button>

    <div class="w-full divide-y overflow-hidden rounded-lg border">
        {#each data.userAccountArray as userAccountData}
            <DataListRowUserAccount {userAccountData} />
        {/each}
    </div>

    <Button variant="link" class="self-center" on:click={handleLoadMore}>Load More</Button>
</div>

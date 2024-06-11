<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    import { Input } from "$lib/components/shadcn/ui/input";
    import { Button } from "$lib/components/shadcn/ui/button";
    import { Label } from "$lib/components/shadcn/ui/label";

    import DataListRowUserRole from "$lib/components/shadcn/data-model/user-role/data-series/user-role-data-list-row.svelte";

    export let basePath = "/user-role";
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



	const handleResetAll = async () => {
		await goto(`${basePath}/overview`, { invalidateAll: true, replaceState: true });
	}
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

    <Button variant="link" class="self-center"on:click={handleResetAll}>Reset All</Button>

    <div class="w-full divide-y overflow-hidden rounded-lg border">
        {#each data.userRoleArray as userRoleData}
            <DataListRowUserRole {userRoleData} />
        {/each}
    </div>

    <Button variant="link" class="self-center" on:click={handleLoadMore}>Load More</Button>
</div>

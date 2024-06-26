<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    import dataTableConfig from "./data-series/user-account-data-table.config.json";
    import { buildAttributeMap, flattenRowObject } from "$lib/components/data-model/_helpers/helpers";

    import X from "lucide-svelte/icons/x";
    
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";
    import { Input } from "$lib/components/shadcn/ui/input";
    import { Label } from "$lib/components/shadcn/ui/label";

    import FilterInput from "$lib/components/data-model/_partial-components/data-series/filter-inputs/_filter-input.svelte";
    import UserAccountDataTableRow from "./data-series/user-account-data-table-row.svelte";

    let limit = parseInt($page.url.searchParams.get("limit") ?? "20");
    if (!limit) limit = 20;

    let search = $page.url.searchParams.get("search");
    if (!search) search = "";

    let offset = parseInt($page.url.searchParams.get("offset") ?? "0");
    if (!offset) offset = 0;

    export let allowEdit = true;
    export let allowDelete = true;
    export let allowCreate = true;

    export let basePath = "/user-account";

    export let data;

    let attributeMap = {};
    buildAttributeMap("userAccount", dataTableConfig, attributeMap);

    let flatRows = [];
    $: (() => {
        flatRows = [];
        for (const nestedRow of data.userAccountArray) {
            flatRows.push(flattenRowObject(nestedRow, attributeMap));
        }
    })();

    //#region Search
    const handleSearchChange = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.set("search", search);
        goto(`${basePath}?${newSearchParams.toString()}`, {
            keepFocus: true
        });
    };

    const handleSearchClear = () => {
        search = "";

        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.delete("search");
        goto(`${basePath}?${newSearchParams.toString()}`, {
            keepFocus: true
        });
    };
    //#endregion

    //#region Pagination
    const handlePaginationPrev = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        offset = parseInt(offset) - parseInt(limit) <= 0 ? 0 : parseInt(offset) - parseInt(limit);
        newSearchParams.set("offset", offset.toString());
        goto(`${basePath}?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };

    const handlePaginationNext = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        offset = offset + limit;
        newSearchParams.set("offset", offset.toString());
        goto(`${basePath}?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };
    //#endregion

    const handleLimitChange = () => {
        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
        newSearchParams.set("limit", limit.toString());
        goto(`${basePath}?${newSearchParams.toString()}`, {
            invalidateAll: true
        });
    };
</script>

<div class="flex flex-row justify-between p-2">
    <div class="flex flex-col">
        <div class="flex flex-row gap-2">
            <Input type="text" bind:value={search} name="search" placeholder="Search..." on:change={handleSearchChange}></Input>
            <Button variant="link" size="sm" class="px-0" on:click={handleSearchClear}>
                <X></X>
            </Button>
        </div>
    </div>
    {#if allowCreate}
        <a href={`${basePath}/new`} class={buttonVariants({ variant: "default", size: "sm" })}>New</a>
    {/if}
</div>

<div class="w-full overflow-x-auto">
    <table class="w-full table-auto border">
        <tr class="child:border-b child:border-l child:p-2 child:font-bold">
            {#each Object.values(attributeMap) as { displayName }}
                <th class="min-w-48 max-w-56 text-left">{displayName}</th>
            {/each}
            {#if allowDelete || allowEdit}
                <th colspan="2">Actions</th>
            {/if}
        </tr>

        <tr class="last:border-l child:border-b child:border-r">
            {#each Object.values(attributeMap) as { entityName, displayName, stack, attributeName }}
                <th class="p-2 text-left">
                    <div class="flex items-center">
                        <FilterInput
                            {entityName}
                            {basePath}
                            {attributeName}
                            {displayName}
                            options={data.enums?.[entityName]?.[attributeName] ?? []} />
                    </div>
                </th>
            {/each}
        </tr>
        {#each flatRows as flatRow, index}
            <UserAccountDataTableRow {flatRow} rowId={data?.userAccountArray[index]?.id} {basePath} {allowEdit} {allowDelete}/>
        {/each}
    </table>
</div>

<div class="justify-left flex w-full flex-row p-2">
    <div class="flex flex-col gap-2">
        <Label>Items per page</Label>
        <div class="flex gap-2">
            <Input type="number" name="limit" placeholder="Items per Page" bind:value={limit} on:change={handleLimitChange} />

            <div class="flex gap-2">
                <Button on:click={handlePaginationPrev}>Prev</Button>
                <Button on:click={handlePaginationNext}>Next</Button>
            </div>
        </div>
    </div>
</div>

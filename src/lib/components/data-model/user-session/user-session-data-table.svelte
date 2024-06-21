<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";

    import { parse, stringify } from "qs";

    import dataTableConfig from "./data-series/user-session-data-table.config.json";

    import { buildAttributeMap, flattenRowObject } from "$lib/components/data-model/_helpers/helpers";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";
    import { Input } from "$lib/components/shadcn/ui/input";
    import { Pencil, RotateCcw, X } from "lucide-svelte";
    import { Label } from "$lib/components/shadcn/ui/label";
    import FilterText from "./data-series/filter-inputs/filter-text.svelte";
    import FilterInput from "./data-series/filter-inputs/_filter-input.svelte";

    let limit = parseInt($page.url.searchParams.get("limit") ?? "20");
    if (!limit) limit = 20;

    let search = $page.url.searchParams.get("search");
    if (!search) search = "";

    let offset = parseInt($page.url.searchParams.get("offset") ?? "0");
    if (!offset) offset = 0;

    export let allowEdit = true;
    export let allowDelete = true;
    export let allowCreate = true;

    export let basePath = "/user-session";

    export let data;

    let attributeMap = {};
    buildAttributeMap(dataTableConfig, attributeMap);

    let flatRows = [];
    $: (() => {
        flatRows = [];
        for (const nestedRow of data.userSessionArray) {
            flatRows.push(flattenRowObject(nestedRow, attributeMap));
        }
    })();

    let filters = {};

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
        offset = offset - limit <= 0 ? 0 : offset - limit;
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
            {#each Object.values(attributeMap) as { displayName, stack, attributeName }}
                <th class="p-2 text-left">
                    <div class="flex items-center">
                        <FilterInput entityName="userSession" {basePath} {stack} {attributeName} {displayName} {filters}></FilterInput>
                    </div>
                </th>
            {/each}
        </tr>
        {#each flatRows as flatRow, index}
            <tr class="odd:bg-background-100 hover:bg-background-200 child:p-2">
                {#each Object.values(flatRow) as { value, type }}
                    <td class="min-w-48 max-w-56 truncate border-r">{value}</td>
                {/each}
                {#if allowEdit || allowDelete}
                    <td class="flex items-center justify-center text-center">
                        <a
                            href={`${basePath}/${data?.userSessionArray[index]?.id}`}
                            class="bg-tranparent border border-none border-tertiary text-tertiary">
                            <Pencil class="h-4 w-4" />
                        </a>

                        <form action={`${basePath}/${data?.userSessionArray[index]?.id}?/delete`} use:enhance method="POST">
                            <input type="hidden" bind:value={data.userSessionArray[index].id} />
                            <Button type="submit" class="border-none" variant="destructive-outline" size="inline-icon">
                                <X class="h-4 w-4" />
                            </Button>
                        </form>
                    </td>
                {/if}
            </tr>
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
                <Button on:click={handlePaginationNext}>Prev</Button>
            </div>
        </div>
    </div>
</div>

<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";

    import { parse, stringify } from "qs";

    import dataTableConfig from "./data-series/user-account-data-table.config.json";

    import { buildAttributeMap, flattenRowObject } from "$lib/components/data-model/_helpers/helpers";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";
    import { Input } from "$lib/components/shadcn/ui/input";
    import Bell from "lucide-svelte/icons/bell";
    import Pencil from "lucide-svelte/icons/pencil";
    import RotateCcw from "lucide-svelte/icons/rotate-ccw";
    import X from "lucide-svelte/icons/x";
    import { Label } from "$lib/components/shadcn/ui/label";
    import { handleFormActionToast } from "$lib";
    import * as Tooltip from "$lib/components/shadcn/ui/tooltip";
    import Dialog from "$components/shadcn/ui/dialog/_dialog.svelte";
    import Textarea from "$components/shadcn/ui/textarea/textarea.svelte";

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
    buildAttributeMap(dataTableConfig, attributeMap);

    let flatRows = [];
    $: (() => {
        flatRows = [];
        console.log("attributeMap", attributeMap);
        console.log("data.userAccountArray", data.userAccountArray);
        for (const nestedRow of data.userAccountArray) {
            flatRows.push(flattenRowObject(nestedRow, attributeMap));
        }
        console.log("flatRows", flatRows);
    })();

    let filters = {};

    let testNotificationDialogOpen = false;
    let submittingTest = false;
    /**
     *  @type {import('./$types').SubmitFunction}
     */
    const submitTest = async ({ formData, cancel }) => {
        submittingTest = true;
        return async ({ result, update }) => {
            submittingTest = false;
            testNotificationDialogOpen = false;
            update();

            handleFormActionToast(result);
        };
    };
</script>

<div class="flex flex-row justify-between p-2">
    <div class="flex flex-col">
        <div class="flex flex-row gap-2">
            <Input
                type="text"
                bind:value={search}
                name="search"
                placeholder="Search..."
                on:change={() => {
                    let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
                    newSearchParams.set("search", search);
                    goto(`${basePath}/overview?${newSearchParams.toString()}`, {
                        keepFocus: true
                    });
                }}>
            </Input>
            <Button
                variant="link"
                size="sm"
                class="px-0"
                on:click={() => {
                    search = "";

                    let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
                    newSearchParams.delete("search");
                    goto(`${basePath}/overview?${newSearchParams.toString()}`, {
                        keepFocus: true
                    });
                }}>
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
                        <Input
                            type="text"
                            class="h-6"
                            name={displayName}
                            placeholder="Filter..."
                            bind:value={filters[displayName]}
                            on:change={() => {
                                const originalParams = parse($page.url.search, { ignoreQueryPrefix: true });

                                if (!originalParams.filter) originalParams.filter = {};

                                if (!originalParams.filter[attributeName]) {
                                    originalParams.filter[attributeName] = { like: filters[displayName] };
                                }

                                const newParams = stringify(originalParams, { encodeValuesOnly: true });

                                goto(`${basePath}/overview?${newParams}`, {
                                    keepFocus: true
                                });
                            }} />
                        <Button
                            variant="link"
                            size="inline-icon"
                            class="ml-2 h-4 w-4"
                            on:click={() => {
                                filters[displayName] = "";
                                const originalParams = parse($page.url.search, { ignoreQueryPrefix: true });

                                delete originalParams.filter?.[attributeName];
                                const newParams = stringify(originalParams, { encodeValuesOnly: true });
                                goto(`${basePath}/overview?${newParams}`, {
                                    invalidateAll: true
                                });
                            }}>
                            <RotateCcw></RotateCcw>
                        </Button>
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
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Button
                                    variant="secondary-outline"
                                    class="border-none"
                                    size="inline-icon"
                                    disabled={submittingTest}
                                    loading={submittingTest}
                                    on:click={() => (testNotificationDialogOpen = !testNotificationDialogOpen)}>
                                    <Bell class="h-4"></Bell>
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <p>Send a test notification to this user's <br /> registered devices</p>
                            </Tooltip.Content>
                        </Tooltip.Root>

                        <Dialog
                            bind:open={testNotificationDialogOpen}
                            title="Send test notification?"
                            description="This will send a push notification to all devices registered for this user">
                            <form action="?/testPushNotification" method="POST" use:enhance={submitTest} class="flex flex-col gap-4 py-4">
                                <input type="hidden" name="id" value={data?.userAccountArray[index]?.id} />
                                <div class="grid grid-cols-4 items-center gap-4">
                                    <Label for="title" class="text-right">Title</Label>
                                    <Input name="title" placeholder="New message" class="col-span-3" />
                                </div>
                                <div class="grid grid-cols-4 items-center gap-4">
                                    <Label for="body" class="text-right">Body</Label>
                                    <Textarea name="body" placeholder="More details..." class="col-span-3" />
                                </div>

                                <Button type="submit" class="w-fit self-end">Send notification</Button>
                            </form>
                        </Dialog>

                        <a
                            href={`${basePath}/${data?.userAccountArray[index]?.id}`}
                            class="bg-tranparent border border-none border-tertiary text-tertiary">
                            <Pencil class="h-4 w-4" /></a>

                        <form action={`${basePath}/${data?.userAccountArray[index]?.id}?/delete`} use:enhance method="POST">
                            <input type="hidden" bind:value={data.userAccountArray[index].id} />
                            <Button type="submit" class="border-none" variant="destructive-outline" size="inline-icon">
                                <X class="h-4 w-4" /></Button>
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
            <Input
                type="number"
                name="limit"
                placeholder="Items per Page"
                bind:value={limit}
                on:change={() => {
                    let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
                    newSearchParams.set("limit", limit.toString());
                    goto(`${basePath}/overview?${newSearchParams.toString()}`, {
                        invalidateAll: true
                    });
                }} />

            <div class="flex gap-2">
                <Button
                    on:click={() => {
                        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
                        offset = offset - limit <= 0 ? 0 : offset - limit;
                        newSearchParams.set("offset", offset.toString());
                        goto(`${basePath}/overview?${newSearchParams.toString()}`, {
                            invalidateAll: true
                        });
                    }}>
                    Prev
                </Button>
                <Button
                    on:click={() => {
                        let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
                        offset = offset + limit;
                        newSearchParams.set("offset", offset.toString());
                        goto(`${basePath}/overview?${newSearchParams.toString()}`, {
                            invalidateAll: true
                        });
                    }}>
                    Next
                </Button>
            </div>
        </div>
    </div>
</div>

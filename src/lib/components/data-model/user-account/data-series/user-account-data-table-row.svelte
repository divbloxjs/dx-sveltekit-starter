<script>
    import { enhance } from "$app/forms";

    import Button from "$components/shadcn/ui/button/button.svelte";
    import Pencil from "lucide-svelte/icons/pencil";
    import X from "lucide-svelte/icons/x";

    import UserAccountDataTableCell from "./user-account-data-table-cell.svelte";
    import { env } from "$env/dynamic/public";
    import NotificationTest from "../_notification-test.svelte";

    export let flatRow;

    export let rowId;
    export let allowEdit = false;
    export let allowDelete = false;

    export let basePath;
</script>

<tr class="odd:bg-background-100 hover:bg-background-200 child:p-2">
    {#each Object.values(flatRow) as { value, type }}
        <UserAccountDataTableCell {value} {type} />
    {/each}

    {#if allowEdit || allowDelete}
        <td class="flex items-center justify-center text-center">
            {#if env.PUBLIC_ENABLE_WEB_PUSH.toLowerCase() === "true"}
                <NotificationTest id={rowId} />
            {/if}
            <a href={`${basePath}/${rowId}`} class="bg-tranparent border border-none border-tertiary text-tertiary">
                <Pencil class="h-4 w-4" />
            </a>

            <form action={`${basePath}/${rowId}?/delete`} use:enhance method="POST">
                <input type="hidden" bind:value={rowId} />
                <Button type="submit" class="border-none" variant="destructive-outline" size="inline-icon">
                    <X class="h-4 w-4" />
                </Button>
            </form>
        </td>
    {/if}
</tr>

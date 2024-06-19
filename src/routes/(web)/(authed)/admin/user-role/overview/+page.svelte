<script>
    import DataListUserRole from "$lib/components/data-model/user-role/user-role-data-list.svelte";
    import DataTableUserRole from "$lib/components/data-model/user-role/user-role-data-table.svelte";
    import { getContext } from "svelte";

    const pageTitle = getContext("pageTitle");
    $pageTitle = "Manage User Roles";

    export let data;
    export let form;

    export let displayAsList = false;

    let viewportWidth = 700;

    $: displayAsList = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#if displayAsList}
    <DataListUserRole {data} basePath="/admin/user-role" />
{:else}
    <DataTableUserRole {data} allowDelete={true} allowEdit={true} basePath="/admin/user-role" />
{/if}

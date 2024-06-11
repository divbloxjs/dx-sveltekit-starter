<script>
    import DataListUserAccount from "$lib/components/shadcn/data-model/user-account/user-account-data-list.svelte";
    import DataTableUserAccount from "$lib/components/shadcn/data-model/user-account/user-account-data-table.svelte";

    export let data;
    export let form;

    export let displayAsList = false;

    let viewportWidth = 700;

    $: displayAsList = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#if displayAsList}
    <DataListUserAccount {data} basePath="/admin/user-account" />
{:else}
    <DataTableUserAccount {data} allowDelete={true} allowEdit={true} basePath="/admin/user-account" />
{/if}

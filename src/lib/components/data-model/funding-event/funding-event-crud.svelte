<script>
    import DataListFundingEvent from "$lib/components/data-model/funding-event/funding-event-data-list.svelte";
    import DataTableFundingEvent from "$lib/components/data-model/funding-event/funding-event-data-table.svelte";

    export let basePath = "/funding-event";
    export let data;
</script>

<div class="flex h-full w-full p-2 @container">
    <div class="hidden w-full @lg:block">
        <DataTableFundingEvent {data} {basePath} allowDelete={true} allowEdit={true} />
    </div>

    <div class="h-full max-h-full w-full @lg:hidden">
        <DataListFundingEvent getEntityArrayPath={basePath} entityInstancePath={basePath} redirectBackPath={basePath} />
    </div>
</div>

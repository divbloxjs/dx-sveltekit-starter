<script>
    import CrudFundingEvent from "$lib/components/data-model/funding-event/funding-event-crud.svelte";

    export let data;
</script>

<CrudFundingEvent {data} basePath="/funding-event" />

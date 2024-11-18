<script>
    import FormCreateFundingEvent from "$lib/components/data-model/funding-event/funding-event-form-create.svelte";
    import FormUpdateFundingEvent from "$lib/components/data-model/funding-event/funding-event-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;

    const basePath = "/funding-event";
    const redirectBackPath = $page.url.searchParams.get("redirectBackPath") ?? basePath;
</script>

<div class="flex w-full max-w-4xl self-center">
    {#if $page.params.id === "new"}
        <FormCreateFundingEvent {data} {basePath} {redirectBackPath} />
    {:else if parseInt($page.params.id) > 0}
        <FormUpdateFundingEvent {data} {basePath} {redirectBackPath} />
    {/if}
</div>



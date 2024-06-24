<script>
    import FormCreateOrganisation from "$lib/components/data-model/organisation/organisation-form-create.svelte";
    import FormUpdateOrganisation from "$lib/components/data-model/organisation/organisation-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="flex w-full max-w-4xl self-center">
    {#if $page.params.id === "new"}
        <FormCreateOrganisation {data} basePath="/organisation" />
    {:else if parseInt($page.params.id) > 0}
        <FormUpdateOrganisation {data} basePath="/organisation" />
    {/if}
</div>


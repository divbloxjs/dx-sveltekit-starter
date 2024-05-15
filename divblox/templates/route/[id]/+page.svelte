<script>
    import FormCreate__entityNamePascalCase__ from "__componentsPathAlias__/data-model/__entityName__/__entityName__-form-create.svelte";
    import FormUpdate__entityNamePascalCase__ from "__componentsPathAlias__/data-model/__entityName__/__entityName__-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

{#if $page.params.id === "new"}
    <FormCreate__entityNamePascalCase__ {data} />
{:else if $page.params.id > 0}
    <FormUpdate__entityNamePascalCase__ {data} />
{/if}

<script>
    import CrudUserSession from "$lib/components/data-model/organisation/organisation-crud.svelte";

    export let data;
</script>

<CrudUserSession {data} basePath="/organisation" />

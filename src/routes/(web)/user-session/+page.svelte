<script>
    import CrudUserSession from "$lib/components/data-model/user-session/user-session-crud.svelte";

    export let data;
</script>

<CrudUserSession {data} basePath="/user-session" />

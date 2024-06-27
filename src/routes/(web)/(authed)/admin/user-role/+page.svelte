<script>
    import CrudUserRole from "$lib/components/data-model/user-role/user-role-crud.svelte";

    export let data;
</script>

<CrudUserRole {data} basePath="/admin/user-role" />

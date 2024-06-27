<script>
    import CrudUserAccount from "$lib/components/data-model/user-account/user-account-crud.svelte";

    export let data;
</script>

<CrudUserAccount {data} basePath="/admin/user-account" />

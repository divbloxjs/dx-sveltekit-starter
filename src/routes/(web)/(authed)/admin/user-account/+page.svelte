<script>
    import CrudUserAccount from "$lib/components/data-model/user-account/user-account-crud.svelte";
    import { getContext } from "svelte";

    const pageTitle = getContext("pageTitle");
    $pageTitle = "User Management";
    
    export let data;
</script>

<CrudUserAccount {data} basePath="/admin/user-account" />

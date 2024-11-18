<script>
    import DataListUserAccount from "$lib/components/data-model/user-account/user-account-data-list.svelte";
    import DataTableUserAccount from "$lib/components/data-model/user-account/user-account-data-table.svelte";

    export let basePath = "/admin/user-account";
    export let data;
</script>

<div class="flex w-full @container">
    <div class="hidden w-full @lg:block">
        <DataTableUserAccount {data} {basePath} allowDelete={true} allowEdit={true} />
    </div>

    <div class="w-full @lg:hidden">
        <DataListUserAccount
            allowCreate={true}
            getUserAccountArrayPath={basePath}
            entityInstancePath={basePath}
            redirectBackPath={basePath} />
    </div>
</div>

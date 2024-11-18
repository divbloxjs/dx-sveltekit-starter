<script>
    import DataListUserRole from "$lib/components/data-model/user-role/user-role-data-list.svelte";
    import DataTableUserRole from "$lib/components/data-model/user-role/user-role-data-table.svelte";

    export let basePath = "/user-role";
    export let data;
</script>

<div class="flex w-full p-2 @container">
    <div class="hidden w-full @lg:block">
        <DataTableUserRole {data} {basePath} allowDelete={true} allowEdit={true} />
    </div>

    <div class="w-full @lg:hidden">
        <DataListUserRole getEntityArrayPath={basePath} entityInstancePath={basePath} redirectBackPath={basePath} />
    </div>
</div>

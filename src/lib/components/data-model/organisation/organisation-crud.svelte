<script>
	import DataListOrganisation from '$lib/components/data-model/organisation/organisation-data-list.svelte';
	import DataTableOrganisation from '$lib/components/data-model/organisation/organisation-data-table.svelte';

	export let basePath = "/organisation";
	export let data;
</script>

<div class="flex w-full @container">
    <div class="hidden w-full @lg:block">
        <DataTableOrganisation {data} {basePath} allowDelete={true} allowEdit={true} />
    </div>

    <div class="w-full @lg:hidden">
        <DataListOrganisation {data} {basePath} />
    </div>
</div>

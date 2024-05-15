<script>
	import DataListOrganisation from '$lib/dx-components/data-model/organisation/organisation-data-list.svelte';
	import DataTableOrganisation from '$lib/dx-components/data-model/organisation/organisation-data-table.svelte';

	export let data;
	export let form;

	export let displayAsList = false;

	let viewportWidth = 700;

	$: displayAsList = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#if displayAsList}
	<DataListOrganisation {data}/>
{:else}
	<DataTableOrganisation {data} allowDelete={true} allowEdit={true}/>
{/if}

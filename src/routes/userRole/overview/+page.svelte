<script>
	import DataListUserRole from '$lib/dx-components/data-model/userRole/userRole-data-list.svelte';
	import DataTableUserRole from '$lib/dx-components/data-model/userRole/userRole-data-table.svelte';

	export let data;
	export let form;

	export let displayAsList = false;

	let viewportWidth = 700;

	$: displayAsList = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#if displayAsList}
	<DataListUserRole {data}/>
{:else}
	<DataTableUserRole {data} allowDelete={true} allowEdit={true}/>
{/if}

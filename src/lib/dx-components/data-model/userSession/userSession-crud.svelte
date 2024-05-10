<script>
	import DataListUserSession from '$lib/dx-components/data-model/userSession/userSession-data-list.svelte';
	import DataTableUserSession from '$lib/dx-components/data-model/userSession/userSession-data-table.svelte';

	export let data;
	export let form;

	export let displayType = '';
	export let list = false;

	let viewportWidth = 700;

	$: list = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />
{#if list}
	<DataListUserSession {data} />
{:else}
	<DataTableUserSession {data} allowDelete={true} allowEdit={true} />
{/if}

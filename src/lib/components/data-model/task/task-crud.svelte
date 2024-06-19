<script>
	import DataListTask from '$lib/components/data-model/task/task-data-list.svelte';
	import DataTableTask from '$lib/components/data-model/task/task-data-table.svelte';

	export let data;
	export let form;

	export let displayType = '';
	export let list = false;

	let viewportWidth = 700;

	$: list = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />
{#if list}
	<DataListTask {data} />
{:else}
	<DataTableTask {data} allowDelete={true} allowEdit={true} />
{/if}

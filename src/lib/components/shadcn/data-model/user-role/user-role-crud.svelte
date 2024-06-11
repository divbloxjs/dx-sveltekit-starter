<script>
	import DataListUserRole from '$lib/components/shadcn/data-model/user-role/user-role-data-list.svelte';
	import DataTableUserRole from '$lib/components/shadcn/data-model/user-role/user-role-data-table.svelte';

	export let data;
	export let form;

	export let displayType = '';
	export let list = false;

	let viewportWidth = 700;

	$: list = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />
{#if list}
	<DataListUserRole {data} />
{:else}
	<DataTableUserRole {data} allowDelete={true} allowEdit={true} />
{/if}

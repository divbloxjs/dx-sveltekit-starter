<script>
	import DataListUserAccount from '$lib/dx-components/data-model/userAccount/userAccount-data-list.svelte';
	import DataTableUserAccount from '$lib/dx-components/data-model/userAccount/userAccount-data-table.svelte';

	export let data;
	export let form;

	export let displayType = '';
	export let list = false;

	let viewportWidth = 700;

	$: list = viewportWidth < 600;
</script>

<svelte:window bind:innerWidth={viewportWidth} />
{#if list}
	<DataListUserAccount {data} />
{:else}
	<DataTableUserAccount {data} allowDelete={true} allowEdit={true} />
{/if}

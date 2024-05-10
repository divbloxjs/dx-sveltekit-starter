<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import DataListRowUserRole from '$lib/dx-components/data-model/userRole/data-series/userRole-row-data-list.svelte';

	let limit = parseInt($page.url.searchParams.get('limit') ?? '2');
	if (!limit) limit = 2;
	let search = $page.url.searchParams.get('search');
	if (!search) search = '';

	let offset = parseInt($page.url.searchParams.get('offset') ?? '0');
	if (!offset) offset = 0;
	export let data;
</script>

<label for="search">
	Search
	<input
		type="text"
		bind:value={search}
		on:change={() => {
			let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
			newSearchParams.set('search', search);
			goto(`/userRole/overview?${newSearchParams.toString()}`, {
				invalidateAll: true
			});
		}}
	/>
	<button
		on:click={() => {
			search = '';
			let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
			newSearchParams.delete('search');
			goto(`/userRole/overview?${newSearchParams.toString()}`, {
				invalidateAll: true
			});
		}}>Clear</button
	>
</label>

<br />

<label for="limit">
	Limit
	<input
		type="number"
		bind:value={limit}
		on:change={() => {
			let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
			newSearchParams.set('limit', limit.toString());
			goto(`/userRole/overview?${newSearchParams.toString()}`, {
				invalidateAll: true
			});
		}}
	/>
	<button
		on:click={() => {
			limit = 10;
			let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
			newSearchParams.set('limit', limit.toString());
			goto(`/userRole/overview?${newSearchParams.toString()}`, {
				invalidateAll: true
			});
		}}>Reset</button
	>
</label>

<button
	on:click={() => {
		let newSearchParams = new URLSearchParams($page.url.searchParams.toString());
		limit = limit + 2;
		newSearchParams.set('limit', limit.toString());
		goto(`/userRole/overview?${newSearchParams.toString()}`, {
			invalidateAll: true
		});
	}}
>
	Load More
</button>

<br />

<button
	on:click={() => {
		goto(`/userRole/overview`);
	}}
>
	Reset All
</button>

{#each data.userRoleArray as userRoleData}
	<DataListRowUserRole {userRoleData} />
{/each}

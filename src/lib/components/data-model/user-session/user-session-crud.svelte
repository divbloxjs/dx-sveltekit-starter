<script>
	import DataListUserSession from '$lib/components/data-model/user-session/user-session-data-list.svelte';
	import DataTableUserSession from '$lib/components/data-model/user-session/user-session-data-table.svelte';

	export let basePath = "/user-session";
	export let data;
</script>

<div class="flex w-full @container">
    <div class="hidden w-full @lg:block">
        <DataTableUserSession {data} {basePath} allowDelete={true} allowEdit={true} />
    </div>

    <div class="w-full @lg:hidden">
        <DataListUserSession {data} {basePath} />
    </div>
</div>

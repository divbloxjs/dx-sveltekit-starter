<script>
	import FormCreateUserRole from '$lib/dx-components/data-model/userRole/userRole-form-create.svelte';
	import FormUpdateUserRole from '$lib/dx-components/data-model/userRole/userRole-form-update.svelte';

	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;

	export let form;
</script>

{#if $page.params.id === 'new'}
	<FormCreateUserRole />
{:else if $page.params.id > 0}
	<FormUpdateUserRole />
{/if}

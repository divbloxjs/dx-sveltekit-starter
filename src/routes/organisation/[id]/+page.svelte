<script>
	import FormCreateOrganisation from '$lib/dx-components/data-model/organisation/organisation-form-create.svelte';
	import FormUpdateOrganisation from '$lib/dx-components/data-model/organisation/organisation-form-update.svelte';

	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;

	export let form;
</script>

{#if $page.params.id === 'new'}
	<FormCreateOrganisation />
{:else if $page.params.id > 0}
	<FormUpdateOrganisation />
{/if}

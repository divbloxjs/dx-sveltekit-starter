<script>
	import FormCreateUserSession from '$lib/dx-components/data-model/userSession/userSession-form-create.svelte';
	import FormUpdateUserSession from '$lib/dx-components/data-model/userSession/userSession-form-update.svelte';

	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;

	export let form;
</script>

{#if $page.params.id === 'new'}
	<FormCreateUserSession />
{:else if $page.params.id > 0}
	<FormUpdateUserSession />
{/if}

<script>
	import FormCreateUserAccount from '$lib/dx-components/data-model/userAccount/userAccount-form-create.svelte';
	import FormUpdateUserAccount from '$lib/dx-components/data-model/userAccount/userAccount-form-update.svelte';

	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;

	export let form;
</script>

{#if $page.params.id === 'new'}
	<FormCreateUserAccount />
{:else if $page.params.id > 0}
	<FormUpdateUserAccount />
{/if}

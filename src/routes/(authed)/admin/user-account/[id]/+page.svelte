<script>
    import FormCreateUserAccount from "$lib/dx-components/data-model/userAccount/userAccount-form-create.svelte";
    import FormUpdateUserAccount from "$lib/dx-components/data-model/userAccount/userAccount-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;

    export let form;
</script>

<div class="flex h-full w-full justify-center pt-10">
    {#if $page.params.id === "new"}
        <FormCreateUserAccount {data} />
    {:else if $page.params.id > 0}
        <FormUpdateUserAccount {data} />
    {/if}
</div>

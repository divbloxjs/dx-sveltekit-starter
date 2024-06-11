<script>
    import FormCreateUserAccount from "$lib/components/data-model/user-account/user-account-form-create.svelte";
    import FormUpdateUserAccount from "$lib/components/data-model/user-account/user-account-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="flex w-full max-w-4xl self-center">
    {#if $page.params.id === "new"}
        <FormCreateUserAccount {data} basePath="/admin/user-account" />
    {:else if parseInt($page.params.id) > 0}
        <FormUpdateUserAccount {data} basePath="/admin/user-account" />
    {/if}
</div>

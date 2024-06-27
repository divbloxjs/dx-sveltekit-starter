<script>
    import FormCreateUserAccount from "$lib/components/data-model/user-account/user-account-form-create.svelte";
    import FormUpdateUserAccount from "$lib/components/data-model/user-account/user-account-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;

    const basePath = "/admin/user-account";
    const redirectBackPath = $page.url.searchParams.get("redirectBackPath") ?? basePath;
</script>

<div class="flex w-full max-w-4xl self-center">
    {#if $page.params.id === "new"}
        <FormCreateUserAccount {data} {basePath} {redirectBackPath} />
    {:else if parseInt($page.params.id) > 0}
        <FormUpdateUserAccount {data} {basePath} {redirectBackPath} />
    {/if}
</div>

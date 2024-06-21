<script>
    import FormCreateUserSession from "$lib/components/data-model/user-session/user-session-form-create.svelte";
    import FormUpdateUserSession from "$lib/components/data-model/user-session/user-session-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="flex w-full max-w-4xl self-center">
    {#if $page.params.id === "new"}
        <FormCreateUserSession {data} basePath="/user-session" />
    {:else if parseInt($page.params.id) > 0}
        <FormUpdateUserSession {data} basePath="/user-session" />
    {/if}
</div>


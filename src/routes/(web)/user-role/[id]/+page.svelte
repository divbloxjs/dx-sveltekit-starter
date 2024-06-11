<script>
    import FormCreateUserRole from "$lib/components/shadcn/data-model/user-role/user-role-form-create.svelte";
    import FormUpdateUserRole from "$lib/components/shadcn/data-model/user-role/user-role-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="flex w-full max-w-4xl self-center">
    {#if $page.params.id === "new"}
        <FormCreateUserRole {data} />
    {:else if parseInt($page.params.id) > 0}
        <FormUpdateUserRole {data} />
    {/if}
</div>


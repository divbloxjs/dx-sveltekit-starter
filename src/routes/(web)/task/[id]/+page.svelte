<script>
    import FormCreateTask from "$lib/components/data-model/task/task-form-create.svelte";
    import FormUpdateTask from "$lib/components/data-model/task/task-form-update.svelte";

    import { page } from "$app/stores";

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="flex w-full max-w-4xl self-center">
    {#if $page.params.id === "new"}
        <FormCreateTask {data} />
    {:else if parseInt($page.params.id) > 0}
        <FormUpdateTask {data} />
    {/if}
</div>


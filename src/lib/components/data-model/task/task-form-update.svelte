<script>
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { toast } from "svelte-sonner";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";

    import { taskUpdateSchema } from "./task.schema.js";

    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";
    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";

    import AlertDialog from "$lib/components/shadcn/ui/alert-dialog/_alert-dialog.svelte";

    export let data;
    export let basePath = "/task";

    let deleteAlertOpen = false;
    let deleteFormEl;

    const form = superForm(data.form, {
        validators: zodClient(taskUpdateSchema),
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Updated task");
                await goto(`${basePath}/overview`);
            }
        }
    });

    const { form: formData, enhance: formEnhance, message, errors, submitting } = form;
</script>

<form method="POST" action={`${basePath}/${$formData.id}?/update`} use:formEnhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 child:break-inside-avoid-column columns-1">
    <FormInput {form} name="id" label="id" type="hidden" bind:value={$formData.id} />

	<FormSelect
    {form}
    name="status"
    label="Status"
    bind:selectedValue={$formData.status}
    options={[{"label":"New","value":"New"},{"label":"In Progress","value":"In Progress"},{"label":"Completed","value":"Completed"}]} />

	<FormInput {form} name="due_date" label="Due date" type="date" bind:value={$formData.due_date} />

	<FormInput {form} name="task_name" label="Task name" type="text" bind:value={$formData.task_name} />

	<FormTextarea {form} name="description" label="Description" bind:value={$formData.description} />

<FormSelect
    {form}
    name="task_category"
    label="Task category"
    bind:selectedValue={$formData.task_category}
    options={data?.taskCategoryOptions?.map((option) => {
        return {
            label: option.id,
            value: option.id
        };
})} />
	<FormSelect
    {form}
    name="task_user"
    label="Task user"
    bind:selectedValue={$formData.task_user}
    options={data?.taskUserOptions?.map((option) => {
        return {
            label: option.id,
            value: option.id
        };
})} />
	
    </div>

    {#if $message}
        <div class="text-destructive">{$message}</div>
    {/if}

    <div class="mt-2 flex w-full flex-row justify-between">
        <a href={`${basePath}/overview`} class={buttonVariants({ variant: "outline", size: "sm" })}>Cancel</a>

        <div class="flex gap-2">
            <form
                method="POST"
                action={`${basePath}/${$formData.id}?/delete`}
                bind:this={deleteFormEl}
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type !== "success") {
                            toast.error("Could not delete task");
                            return;
                        }

                        await goto(`${basePath}/overview`);
                    };
                }}>
                <Button variant="destructive" size="sm" on:click={() => (deleteAlertOpen = !deleteAlertOpen)}>Delete</Button>

                <AlertDialog
                    bind:open={deleteAlertOpen}
                    formToSubmit={deleteFormEl}
                    title="Are you sure?"
                    description="This will permanently delete this entry." />
            </form>

            <Button type="submit" variant="default" size="sm" disabled={$submitting} loading={$submitting}>Update</Button>
        </div>
    </div>
</form>

<script>
    import { goto } from "$app/navigation";

    import { toast } from "svelte-sonner";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { buttonVariants, Button } from "$lib/components/shadcn/ui/button";

    import { taskCreateSchema } from "./task.schema.js";

    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";
    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";

    export let data;
    export let basePath = "/task";

    const form = superForm(data.form, {
        validators: zodClient(taskCreateSchema),
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Created task");
                await goto(`${basePath}/overview`);
            }
        }
    });

    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 child:break-inside-avoid-column columns-1">
	<FormSelect
    {form}
    name="status"
    label="Status"
    bind:selectedValue={$formData.status}
    options={data?.statusOptions?.map((option) => {
        return {
            label: option.id,
            value: option.id
        };
})} />

	<FormInput {form} name="due_date" label="Due date" type="date" bind:value={$formData.due_date} />

	<FormInput {form} name="task_name" label="Task name" type="text" bind:value={$formData.task_name} />

	<FormTextarea {form} name="description" label="Description" bind:value={$formData.description} />

<FormSelect
    {form}
    name="category_id"
    label="Category"
    bind:selectedValue={$formData.category_id}
    options={data?.categoryIdOptions?.map((option) => {
        return {
            label: option.id,
            value: option.id
        };
})} />
	<FormSelect
    {form}
    name="user_account_id"
    label="User account"
    bind:selectedValue={$formData.user_account_id}
    options={data?.userAccountIdOptions?.map((option) => {
        return {
            label: option.id,
            value: option.id
        };
})} />
	
    </div>

    {#if $message}
        <span class="text-sm font-medium italic text-destructive">{$message}</span>
    {/if}

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${basePath}/overview`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Submit</Button>
    </div>
</form>

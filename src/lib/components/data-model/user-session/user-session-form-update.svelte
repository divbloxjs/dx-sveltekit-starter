<script>
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { toast } from "svelte-sonner";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";

    import { userSessionUpdateSchema } from "./user-session.schema.js";

    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";
    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";

    import AlertDialog from "$lib/components/shadcn/ui/alert-dialog/_alert-dialog.svelte";

    export let data;
    export let basePath = "/user-session";

    let deleteAlertOpen = false;
    let deleteFormEl;

    const form = superForm(data.form, {
        validators: zodClient(userSessionUpdateSchema),
        dataType: "json",
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Updated userSession");
                await goto(`${basePath}`);
            }
        }
    });

    const { form: formData, enhance: formEnhance, message, errors, submitting } = form;
</script>

<form method="POST" action={`${basePath}/${$formData.id}?/update`} use:formEnhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 child:break-inside-avoid-column columns-1">
    <FormInput {form} name="id" label="id" type="hidden" bind:value={$formData.id} />

	<FormInput {form} name="expires_at" label="Expires at" type="datetime-local" bind:value={$formData.expires_at} />

	<FormInput {form} name="session_id" label="Session id" type="text" bind:value={$formData.session_id} />

	<FormInput {form} name="user_agent" label="User agent" type="text" bind:value={$formData.user_agent} />

	<FormTextarea {form} name="session_data" label="Session data" bind:value={$formData.session_data} />

	<FormInput {form} name="duration_in_minutes" label="Duration in minutes" type="number" bind:value={$formData.duration_in_minutes} />

<FormSelect
    {form}
    name="user_account_id"
    label="User account id"
    bind:selectedValue={$formData.user_account_id}
    options={data?.userAccountIdOptions?.map((option) => {
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
        <a href={`${basePath}`} class={buttonVariants({ variant: "outline", size: "sm" })}>Cancel</a>

        <div class="flex gap-2">
            <form
                method="POST"
                action={`${basePath}/${$formData.id}?/delete`}
                bind:this={deleteFormEl}
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type !== "success") {
                            toast.error("Could not delete userSession");
                            return;
                        }

                        await goto(`${basePath}`);
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

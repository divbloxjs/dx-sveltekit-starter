<script>
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { toast } from "svelte-sonner";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";

    import { userAccountUpdateSchema } from "./user-account.schema.js";

    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";
    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";

    import AlertDialog from "$lib/components/shadcn/ui/alert-dialog/_alert-dialog.svelte";

    export let data;
    export let basePath = "/user-account";

    let deleteAlertOpen = false;
    let deleteFormEl;

    const form = superForm(data.form, {
        validators: zodClient(userAccountUpdateSchema),
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Updated userAccount");
                await goto(`${basePath}/overview`);
            }
        }
    });

    const { form: formData, enhance: formEnhance, message, errors, submitting } = form;
</script>

<form method="POST" action={`${basePath}/${$formData.id}?/update`} use:formEnhance class="w-full p-1 @container">
    <div class="columns-1 @xl:columns-2 @4xl:columns-3 @7xl:columns-4 child:break-inside-avoid-column">
        <FormInput {form} name="id" label="id" type="hidden" bind:value={$formData.id} />
        <FormInput {form} name="first_name" label="First name" type="text" bind:value={$formData.first_name} />
        <FormInput {form} name="last_name" label="Last name" type="text" bind:value={$formData.last_name} />
        <FormInput {form} name="email_address" label="Email address" type="text" bind:value={$formData.email_address} />
        <FormInput {form} name="password" label="Password" type="text" bind:value={$formData.password} />

        <FormSelect
            {form}
            name="user_role_id"
            label="User role"
            bind:selectedValue={$formData.user_role_id}
            options={data?.userRoleOptions?.map((option) => {
                return {
                    label: option.role_name,
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
                            toast.error("Could not delete userAccount");
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

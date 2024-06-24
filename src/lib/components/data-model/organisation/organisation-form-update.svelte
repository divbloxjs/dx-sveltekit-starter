<script>
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { toast } from "svelte-sonner";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";

    import { organisationUpdateSchema } from "./organisation.schema.js";

    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";
    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";

    import AlertDialog from "$lib/components/shadcn/ui/alert-dialog/_alert-dialog.svelte";

    export let data;
    export let basePath = "/organisation";

    let deleteAlertOpen = false;
    let deleteFormEl;

    const form = superForm(data.form, {
        validators: zodClient(organisationUpdateSchema),
        dataType: "json",
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Updated organisation");
                await goto(`${basePath}`);
            }
        }
    });

    const { form: formData, enhance: formEnhance, message, errors, submitting } = form;
</script>

<form method="POST" action={`${basePath}/${$formData.id}?/update`} use:formEnhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 child:break-inside-avoid-column columns-1">
    <FormInput {form} name="id" label="id" type="hidden" bind:value={$formData.id} />

	<FormInput {form} name="org_name" label="Org name" type="text" bind:value={$formData.org_name} />

	<FormInput {form} name="org_date" label="Org date" type="date" bind:value={$formData.org_date} />

	<FormInput {form} name="org_date_time" label="Org date time" type="datetime-local" bind:value={$formData.org_date_time} />

	<FormInput {form} name="org_number" label="Org number" type="number" bind:value={$formData.org_number} />

	<FormTextarea {form} name="org_json" label="Org json" bind:value={$formData.org_json} />

	<FormSelect
    {form}
    name="status"
    label="Status"
    bind:selectedValue={$formData.status}
    options={[{"label":"New","value":"New"},{"label":"In Progress","value":"In Progress"},{"label":"Completed","value":"Completed"}]} />

<FormSelect
    {form}
    name="parent_organisation_id"
    label="Parent organisation id"
    bind:selectedValue={$formData.parent_organisation_id}
    options={data?.parentOrganisationIdOptions?.map((option) => {
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
                            toast.error("Could not delete organisation");
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

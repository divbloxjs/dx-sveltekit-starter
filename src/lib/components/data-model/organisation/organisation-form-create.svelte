<script>
    import { goto } from "$app/navigation";

    import { toast } from "svelte-sonner";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { buttonVariants, Button } from "$lib/components/shadcn/ui/button";

    import { organisationCreateSchema } from "./organisation.schema.js";

    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";
    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";

    export let data;
    export let basePath = "/organisation";

    const form = superForm(data.form, {
        validators: zodClient(organisationCreateSchema),
        dataType: "json",
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Created organisation");
                await goto(`${basePath}`);
            }
        }
    });

    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 child:break-inside-avoid-column columns-1">
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
        <span class="text-sm font-medium italic text-destructive">{$message}</span>
    {/if}

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${basePath}`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Submit</Button>
    </div>
</form>

<script>
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { toast } from "svelte-sonner";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";

    import { fundingEventUpdateSchema } from "./funding-event.schema.js";

    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";
    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormInputHidden from "$lib/components/shadcn/ui/form/_form-input-hidden.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";

    import AlertDialog from "$lib/components/shadcn/ui/alert-dialog/_alert-dialog.svelte";

    export let data;
    export let basePath = "/funding-event";
    export let redirectBackPath = "/funding-event";

    let deleteAlertOpen = false;
    let deleteFormEl;

    const form = superForm(data.form, {
        validators: zodClient(fundingEventUpdateSchema),
        dataType: "json",
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Updated fundingEvent");
                await goto(`${redirectBackPath}?event=success-update`);
            }
        }
    });

    const { form: formData, enhance: formEnhance, message, errors, submitting } = form;
</script>

<form method="POST" action={`${basePath}/${$formData.id}?/update`} use:formEnhance class="w-full p-1 @container">
    <div class="columns-1 @xl:columns-2 @4xl:columns-3 @7xl:columns-4 child:break-inside-avoid-column">
        <FormInputHidden {form} name="id" label="id" bind:value={$formData.id} />

        	<FormTextarea {form} name="description" label="Description" bind:value={$formData.description} placeholder="description" />

	<FormInput {form} name="amount" label="Amount" type="number" bind:value={$formData.amount} placeholder="amount" />

	<FormSelect
    {form}
    name="type"
    label="Type"
    bind:selectedValue={$formData.type}
    options={[{"label":"Deposit","value":"Deposit"},{"label":"Withdrawal","value":"Withdrawal"},{"label":"Allocated","value":"Allocated"}]} />

	<FormInput {form} name="issued_shares" label="Issued shares" type="number" bind:value={$formData.issued_shares} placeholder="issuedShares" />

	<FormInput {form} name="allocated_shares" label="Allocated shares" type="number" bind:value={$formData.allocated_shares} placeholder="allocatedShares" />

	<FormCheckbox {form} name="has_shares_issued_affect" label="Has shares issued affect" bind:checked={$formData.has_shares_issued_affect} />

	<FormInput {form} name="funding_date" label="Funding date" type="date" bind:value={$formData.funding_date} placeholder="fundingDate" />

	<FormInput {form} name="vesting_date" label="Vesting date" type="date" bind:value={$formData.vesting_date} placeholder="vestingDate" />

<FormSelect
    {form}
    name="fund_id"
    label="Fund id"
    bind:selectedValue={$formData.fund_id}
    options={data?.fundIdOptions?.map((option) => {
        return {
            label: option.id,
            value: option.id
        };
})} />
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
        <a href={`${redirectBackPath}?event=cancel-update`} class={buttonVariants({ variant: "outline", size: "sm" })}>Cancel</a>

        <div class="flex gap-2">
            <form
                method="POST"
                action={`${basePath}/${$formData.id}?/delete`}
                bind:this={deleteFormEl}
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type !== "success") {
                            toast.error("Could not delete fundingEvent");
                            return;
                        }

                        await goto(`${redirectBackPath}?event=success-delete`);
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

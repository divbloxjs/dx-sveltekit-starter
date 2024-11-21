<script>
    import { goto } from "$app/navigation";

    import { toast } from "svelte-sonner";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { buttonVariants, Button } from "$lib/components/shadcn/ui/button";

    import { fundingEventCreateSchema } from "./funding-event.schema.js";

    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";
    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";

    export let data;
    export let basePath = "/funding-event";
    export let redirectBackPath = "/funding-event";

    const form = superForm(data.form, {
        validators: zodClient(fundingEventCreateSchema),
        dataType: "json",
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Created fundingEvent");
                await goto(`${redirectBackPath}?event=success-create`);
            }
        }
    });

    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 child:break-inside-avoid-column columns-1">
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
        <span class="text-sm font-medium italic text-destructive">{$message}</span>
    {/if}

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${redirectBackPath}?event=cancel-create`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Submit</Button>
    </div>
</form>

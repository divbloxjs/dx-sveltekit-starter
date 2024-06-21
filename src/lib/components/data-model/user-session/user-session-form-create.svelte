<script>
    import { goto } from "$app/navigation";

    import { toast } from "svelte-sonner";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { buttonVariants, Button } from "$lib/components/shadcn/ui/button";

    import { userSessionCreateSchema } from "./user-session.schema.js";

    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";
    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";

    export let data;
    export let basePath = "/user-session";

    const form = superForm(data.form, {
        validators: zodClient(userSessionCreateSchema),
        dataType: "json",
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Created userSession");
                await goto(`${basePath}`);
            }
        }
    });

    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 child:break-inside-avoid-column columns-1">
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
        <span class="text-sm font-medium italic text-destructive">{$message}</span>
    {/if}

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${basePath}`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Submit</Button>
    </div>
</form>

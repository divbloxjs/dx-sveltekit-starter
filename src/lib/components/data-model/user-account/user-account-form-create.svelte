<script>
    import { goto } from "$app/navigation";

    import { toast } from "svelte-sonner";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { buttonVariants, Button } from "$lib/components/shadcn/ui/button";

    import { userAccountCreateSchema } from "./user-account.schema.js";

    import FormInput from "$lib/components/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/shadcn/ui/form/_form-checkbox.svelte";
    import FormSelect from "$lib/components/shadcn/ui/form/_form-select.svelte";

    export let data;
    export let basePath = "/user-account";

    const form = superForm(data.form, {
        validators: zodClient(userAccountCreateSchema),
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Created userAccount");
                await goto(`${basePath}/overview`);
            }
        }
    });

    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="w-full p-1 @container">
    <div class="columns-1 @xl:columns-2 @4xl:columns-3 @7xl:columns-4 child:break-inside-avoid-column">
        <FormInput {form} name="first_name" label="First name" type="text" bind:value={$formData.first_name} />
        <FormInput {form} name="last_name" label="Last name" type="text" bind:value={$formData.last_name} />
        <FormInput {form} name="email_address" label="Email address" type="text" bind:value={$formData.email_address} />
        <FormInput {form} name="password" label="password" type="text" bind:value={$formData.password} />

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
        <span class="text-sm font-medium italic text-destructive">{$message}</span>
    {/if}

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${basePath}/overview`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Submit</Button>
    </div>
</form>

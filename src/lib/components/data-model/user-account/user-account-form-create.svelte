<script>
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { buttonVariants, Button } from "$lib/components/ui/button";

    import { userAccountSchema } from "./user-account.schema.js";

    import FormInput from "$lib/components/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/components/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/components/ui/form/_form-checkbox.svelte";
    import FormSelect from "$lib/components/ui/form/_form-select.svelte";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";

    export let data;
    export let basePath = "/user-account";

    const form = superForm(data.form, {
        validators: zodClient(userAccountSchema),
        onResult: async (event) => {
            if (event.result.type === "success") {
                toast.success("Updated userAccount");
                await goto(`${basePath}/overview`);
            }
        }
    });

    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 columns-1 child:break-inside-avoid-column">
        <FormInput {form} name="lastName" label="lastName" type="text" bind:value={$formData.lastName} />

        <FormInput {form} name="firstName" label="firstName" type="text" bind:value={$formData.firstName} />

        <FormInput {form} name="emailAddress" label="emailAddress" type="text" bind:value={$formData.emailAddress} />

        <FormInput {form} name="hashedPassword" label="hashedPassword" type="text" bind:value={$formData.hashedPassword} />

        <FormInput {form} name="userName" label="userName" type="text" bind:value={$formData.userName} />

        <FormInput {form} name="username" label="username" type="text" bind:value={$formData.username} />

        <FormSelect
            {form}
            name="userRoleId"
            label="userRole"
            bind:selectedValue={$formData.userRoleId}
            options={data?.userRoleOptions?.map((option) => {
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

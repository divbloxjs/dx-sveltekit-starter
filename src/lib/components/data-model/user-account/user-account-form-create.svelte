<script>
    import { goto } from "$app/navigation";

    import { toast } from "svelte-sonner";

    import * as Form from "$lib/shadcn/ui/form";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { buttonVariants, Button } from "$lib/shadcn/ui/button";

    import { userAccountCreateSchema } from "./user-account.schema.js";

    import FormInput from "$lib/shadcn/ui/form/_form-input.svelte";
    import FormTextarea from "$lib/shadcn/ui/form/_form-textarea.svelte";
    import FormCheckbox from "$lib/shadcn/ui/form/_form-checkbox.svelte";
    import FormSelect from "$lib/shadcn/ui/form/_form-select.svelte";
    import Input from "$lib/shadcn/ui/input/input.svelte";

    export let data;
    export let basePath = "/user-account";

    const form = superForm(data.form, {
        validators: zodClient(userAccountCreateSchema),
        onSubmit: async (event) => {
            console.log("userRoleId", event.formData.get("userRoleId"));
            if (event.formData.get("userRoleId")?.length === 0) {
                event.formData.delete("userRoleId");
            }

            console.log("userRoleId", event.formData.get("userRoleId"));
        },
        onResult: async (event) => {
            console.log("event.result", event.result);
            if (event.result.type === "success") {
                toast.success("Created userAccount");
                await goto(`${basePath}/overview`);
            }
        }
    });

    const { form: formData, enhance, message, errors } = form;
    console.log("$formData.userRoleId", $formData.userRoleId);
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="@container w-full p-1">
    <div class="@7xl:columns-4 @4xl:columns-3 @xl:columns-2 columns-1 space-y-6 child:break-inside-avoid-column">
        <FormInput {form} name="firstName" label="First name" type="text" bind:value={$formData.firstName} />
        <FormInput {form} name="lastName" label="Last name" type="text" bind:value={$formData.lastName} />
        <FormInput {form} name="emailAddress" label="Email address" type="text" bind:value={$formData.emailAddress} />

        <FormSelect
            {form}
            name="userRoleId"
            label="User role"
            bind:selectedValue={$formData.userRoleId}
            options={data?.userRoleOptions?.map((option) => {
                return {
                    label: option.roleName,
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

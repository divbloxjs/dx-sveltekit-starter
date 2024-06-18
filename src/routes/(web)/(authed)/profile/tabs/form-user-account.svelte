<script>
    import * as Form from "$lib/components/shadcn/ui/form";

    import { userAccountSchema } from "../schemas/user-account.schema";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { Button } from "$lib/components/shadcn/ui/button/index.js";
    import { Input } from "$lib/components/shadcn/ui/input/index.js";
    import { handleFormActionToast, superFormOnResult, superFormOnSubmit, superFormOnUpdated } from "$lib";
    import { enhance } from "$app/forms";
    import { buttonVariants } from "$lib/components/shadcn/ui/button";
    import { get } from "svelte/store";

    export let data;

    const form = superForm(data.userForm, {
        validators: zodClient(userAccountSchema),
        invalidateAll: "force",
        resetForm: true,
        onUpdated: (event) => {
            console.log("event", event);
            handleSuperFormUpdatedToast(event?.form);
        }
    });

    const { form: formData, enhance: submitEnhance, message, errors, formId, submitting, capture } = form;
</script>

<form method="POST" action={`?/updateUser`} use:submitEnhance class="flex max-w-full flex-grow flex-col">
    <input type="hidden" name="id" bind:value={$formData.id} />

    <Form.Field {form} name="first_name">
        <Form.Control let:attrs>
            <Form.Label>First Name</Form.Label>
            <Input {...attrs} bind:value={$formData.first_name} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="last_name">
        <Form.Control let:attrs>
            <Form.Label>Last Name</Form.Label>
            <Input {...attrs} bind:value={$formData.last_name} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="email_address">
        <Form.Control let:attrs>
            <Form.Label>Email Address</Form.Label>
            <Input {...attrs} bind:value={$formData.email_address} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <a href="/notification-onboarding" class={`${buttonVariants({ variant: "link" })} w-fit self-center`}>Notification preferences</a>
    <div class="mt-2 flex flex-row justify-between">
        <form action={`?/deleteUser`} method="POST" use:enhance>
            <input type="hidden" name="id" bind:value={$formData.id} />
            <Button type="submit" name="delete" variant="destructive-outline">Delete</Button>
        </form>
        <Button type="submit" disabled={$submitting} loading={$submitting}>Update</Button>
    </div>
</form>

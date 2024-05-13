<script>
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import Button from "$lib/dx-components/form-elements/button.svelte";

    import { userAccountSchema } from "./userAccount.schema";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    export let data;
    export let basePath = "/admin/user-account";

    console.log(data.form);
    const form = superForm(data.form, {
        validators: zodClient(userAccountSchema)
    });
    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="flex max-w-sm flex-col">
    <Form.Field {form} name="firstName">
        <Form.Control let:attrs>
            <Form.Label>First Name</Form.Label>
            <Input {...attrs} bind:value={$formData.firstName} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="lastName">
        <Form.Control let:attrs>
            <Form.Label>Last Name</Form.Label>
            <Input {...attrs} bind:value={$formData.lastName} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="emailAddress">
        <Form.Control let:attrs>
            <Form.Label>Email Address</Form.Label>
            <Input {...attrs} bind:value={$formData.emailAddress} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="username">
        <Form.Control let:attrs>
            <Form.Label>Username</Form.Label>
            <Input {...attrs} bind:value={$formData.username} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${basePath}/overview`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Create</Button>
    </div>
</form>

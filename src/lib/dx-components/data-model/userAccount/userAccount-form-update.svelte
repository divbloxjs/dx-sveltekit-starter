<script>
    import { buttonVariants } from "$lib/dx-components/form-elements/button.js";
    import Button from "$lib/dx-components/form-elements/button.svelte";
    import * as Form from "$lib/components/ui/form";

    import { userAccountSchema } from "./userAccount.schema";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import Input from "$lib/components/ui/input/input.svelte";

    export let data;
    export let basePath = "/admin/user-account";

    const form = superForm(data.form, {
        validators: zodClient(userAccountSchema)
    });
    
    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`${basePath}/${$formData.id}?/update`} use:enhance class="flex max-w-lg flex-grow flex-col">
    <input type="hidden" name="id" bind:value={$formData.id} />

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

    <Form.Field {form} name="password">
        <Form.Control let:attrs>
            <Form.Label>Password</Form.Label>
            <Input {...attrs} type="password" bind:value={$formData.password} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="confirmPassword">
        <Form.Control let:attrs>
            <Form.Label>Confirm Password</Form.Label>
            <Input {...attrs} type="password" bind:value={$formData.confirmPassword} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    {#if $errors._errors}
        {$errors._errors}
    {/if}

    {#if $message}
        {$message}
    {/if}

    <slot name="footer">
        <div class="mt-2 flex flex-row justify-between">
            <a href={`${basePath}/overview`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
            <Form.Button variant="destructive" formaction={`${basePath}/${$formData.id}?/delete`}>Delete</Form.Button>
            <Form.Button>Update</Form.Button>
        </div>
    </slot>
</form>

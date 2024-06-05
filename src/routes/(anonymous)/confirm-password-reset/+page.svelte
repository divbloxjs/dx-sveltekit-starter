<script>
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { z } from "zod";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { confirmPasswordResetSchema } from "./confirm-password-reset.schema";

    /** @type {import('./$types').PageData} */
    export let data;
    export let basePath = "/admin/user-account";

    const form = superForm(data.form, {
        validators: zodClient(confirmPasswordResetSchema)
    });
    const { form: formData, enhance, message, errors } = form;
</script>

<div class="flex h-full w-full items-center justify-center">
    <div class="flex h-96 w-96 flex-row rounded-lg bg-red-100">
        <div class="text-xl">Update your password</div>
        <div class="">If you have an account with us, we will send you an email so you can reset your password.</div>

        <form method="POST" action={`?/requestPasswordReset`} use:enhance class="flex max-w-lg flex-grow flex-col">
            <Form.Field {form} name="emailAddress">
                <Form.Control let:attrs>
                    <Form.Label>Email Address</Form.Label>
                    <Form.FieldErrors />
                    <Input {...attrs} type="password" bind:value={$formData.password} />
                </Form.Control>
            </Form.Field>
            <Form.Field {form} name="confirmPassword">
                <Form.Control let:attrs>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.FieldErrors />
                    <Input {...attrs} type="password" bind:value={$formData.confirmPassword} />
                </Form.Control>
            </Form.Field>

            {#if $message}
                <span class="text-sm font-medium italic text-destructive">{$message}</span>
            {/if}

            <div class="mt-2 flex flex-row justify-between">
                <Form.Button>Submit</Form.Button>
            </div>
        </form>
    </div>
</div>

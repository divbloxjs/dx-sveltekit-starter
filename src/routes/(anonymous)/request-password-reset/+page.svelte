<script>
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { z } from "zod";
    import SuperDebug, { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { requestPasswordResetSchema } from "./request-password-reset.schema";

    /** @type {import('./$types').PageData} */
    export let data;
    export let basePath = "/admin/user-account";

    const form = superForm(data.form, {
        validators: zodClient(requestPasswordResetSchema)
    });
    const { form: formData, enhance, message, errors, submitting } = form;
</script>

<div class="flex h-full w-full items-center justify-center">
    <div class="flex h-96 w-96 flex-col rounded-lg">
        <div class="mb-2 text-2xl">Update your password</div>
        <div class="mb-2">If you have an account with us, we will send you an email so you can reset your password.</div>

        <SuperDebug data={$formData}></SuperDebug>
        <form method="POST" action={`?/requestPasswordReset`} use:enhance class="flex max-w-lg flex-grow flex-col">
            <Form.Field {form} name="emailAddress">
                <Form.Control let:attrs>
                    <Form.Label>Email Address</Form.Label>
                    <Form.FieldErrors />

                    <Input {...attrs} type="email" bind:value={$formData.emailAddress} />
                </Form.Control>
            </Form.Field>

            {#if $message}
                <span class="text-sm font-medium italic text-destructive">{$message}</span>
            {/if}

            <div class="mt-2 flex flex-row justify-end">
                <Form.Button disabled={$submitting} loading={$submitting}>Submit</Form.Button>
            </div>
        </form>
    </div>
</div>

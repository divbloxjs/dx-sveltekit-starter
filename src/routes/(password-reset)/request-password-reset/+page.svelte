<script>
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import SuperDebug, { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { requestPasswordResetSchema } from "./request-password-reset.schema";
    import { superFormOnResult } from "$lib";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { buttonVariants } from "$lib/components/ui/button";

    /** @type {import('./$types').PageData} */
    export let data;

    const form = superForm(data.form, {
        validators: zodClient(requestPasswordResetSchema),
        onResult: async ({ result }) => {
            if (result.type === "success") {
                console.log("$page.url", $page.url);
                $page.url.searchParams.set("submitted", "true");
                await goto($page.url, { invalidateAll: true });
            }
        }
    });
    const { form: formData, enhance, message, errors, submitting, posted } = form;
</script>

<div class="flex h-full w-full items-center justify-center">
    <div class="flex h-96 w-96 flex-col rounded-lg">
        {#if !$page.url.searchParams.get("submitted")}
            <div class="mb-2 text-center text-2xl font-bold">Update your password</div>
            <div class="mb-4">If you have an account with us, we will send you an email so you can reset your password.</div>

            <form method="POST" action={`?/requestPasswordReset`} use:enhance class="flex max-w-lg flex-grow flex-col">
                <Form.Field {form} name="emailAddress">
                    <Form.Control let:attrs>
                        <Form.Label>Email Address</Form.Label>

                        <Input {...attrs} type="email" bind:value={$formData.emailAddress} />
                        <Form.FieldErrors class="relative" />
                    </Form.Control>
                </Form.Field>

                {#if $message}
                    <span class="text-sm font-medium italic text-destructive">{$message}</span>
                {/if}

                <div class="mt-2 flex justify-between">
                    <a href="/login" class={`${buttonVariants({ variant: "outline" })}`}>Login</a>
                    <Form.Button disabled={$submitting} loading={$submitting}>Submit</Form.Button>
                </div>
            </form>
        {:else}
            <div class="mb-2 text-2xl font-bold">Sent!</div>
            <div class="mb-4">If you have an account with us, you will receive an email with a link to reset your password.</div>
            <a href="/login" class={`${buttonVariants()} w-fit self-center`}>Back to Login</a>
        {/if}
    </div>
</div>

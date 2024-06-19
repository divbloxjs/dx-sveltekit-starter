<script>
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input } from "$lib/components/shadcn/ui/input";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { requestPasswordResetSchema } from "./request-password-reset.schema";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { buttonVariants } from "$lib/components/shadcn/ui/button";

    import AppLogo from "$lib/components/app-images/app-logo.svelte";

    import * as Card from "$lib/components/shadcn/ui/card";
    import { env } from "$env/dynamic/public";

    /** @type {import('./$types').PageData} */
    export let data;

    const form = superForm(data.form, {
        validators: zodClient(requestPasswordResetSchema),
        onResult: async ({ result }) => {
            if (result.type === "success") {
                $page.url.searchParams.set("submitted", "true");
                await goto($page.url, { invalidateAll: true });
            }
        }
    });
    const { form: formData, enhance, message, errors, submitting, posted } = form;
</script>

<div class="flex h-full w-full flex-col items-center justify-center">
    <Card.Root class="w-80 bg-card shadow-2xl">
        <Card.Header class="mb-2 p-0 text-center">
            <AppLogo class="w-56 self-center py-8" />
            <Card.Title>
                Reset your {env.PUBLIC_APP_DISPLAY_NAME} password
            </Card.Title>
            {#if $page.url.searchParams.get("submitted")}
                <Card.Description class="py-4">
                    <span class="font-bold">Done!</span>
                    If you have an account with us, you will receive an email with a link to reset your password.
                </Card.Description>
            {/if}
        </Card.Header>
        <Card.Content class="flex w-80 flex-col">
            {#if !$page.url.searchParams.get("submitted")}
                <form method="POST" action={`?/requestPasswordReset`} use:enhance class="flex flex-grow flex-col">
                    <Form.Field {form} name="email_address">
                        <Form.Control let:attrs>
                            <Form.Label>Email Address</Form.Label>

                            <Input {...attrs} type="email" bind:value={$formData.email_address} />
                            <Form.FieldErrors class="relative" />
                        </Form.Control>
                    </Form.Field>

                    {#if $message}
                        <span class="text-sm font-medium italic text-destructive">{$message}</span>
                    {/if}

                    <div class="mt-2 flex justify-between">
                        <a href="/login" class={`${buttonVariants({ variant: "link" })}`}>Cancel</a>
                        <Form.Button disabled={$submitting} loading={$submitting}>Confirm</Form.Button>
                    </div>
                </form>
            {:else}
                <a href="/login" class={`${buttonVariants({ variant: "outline" })} w-fit self-center`}>Back to Login</a>
            {/if}
        </Card.Content>
    </Card.Root>
</div>

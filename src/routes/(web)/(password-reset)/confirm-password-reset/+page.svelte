<script>
    import { buttonVariants } from "$lib/components/shadcn/ui/button";
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input } from "$lib/components/shadcn/ui/input";
    import SuperDebug, { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { confirmPasswordResetSchema } from "./confirm-password-reset.schema";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    import AppLogo from "$lib/components/app-images/app-logo.svelte";

    import * as Card from "$lib/components/shadcn/ui/card";
    import { PUBLIC_APP_DISPLAY_NAME } from "$env/static/public";
    import { toast } from "svelte-sonner";

    /** @type {import('./$types').PageData} */
    export let data;

    const form = superForm(data.form, {
        validators: zodClient(confirmPasswordResetSchema),
        onResult: async ({ result }) => {
            if (result.type === "success") {
                toast.success("Password updated");
                await goto("/login");
            }
        }
    });

    onMount(() => {
        $formData.tokenValue = $page.url.searchParams.get("token");
    });

    const { form: formData, enhance, message, errors, submitting } = form;
</script>

<div class="flex h-full w-full flex-col items-center justify-center">
    <Card.Root class="w-80 bg-card shadow-2xl">
        <Card.Header class="mb-2 p-0 text-center">
            <AppLogo class="w-56 self-center py-8" />
            {#if !data?.error}
                <Card.Title>Confirm your new password below</Card.Title>
            {/if}
        </Card.Header>
        <Card.Content class="flex w-80 flex-col">
            {#if data.error}
                <div class="-mt-4 flex flex-col text-center">
                    <span class="mb-4 italic">Something went. Please try again.</span>

                    <a href="/request-password-reset" class={`mt-2 ${buttonVariants()} self-center`}>Try again</a>
                </div>
            {:else}
                <form method="POST" action={`?/confirmPasswordReset`} use:enhance class="flex flex-grow flex-col">
                    <input type="hidden" name="tokenValue" bind:value={$formData.tokenValue} />
                    <Form.Field {form} name="password">
                        <Form.Control let:attrs>
                            <Form.Label>Password</Form.Label>
                            <Input {...attrs} type="password" bind:value={$formData.password} />
                            <Form.FieldErrors class="relative" />
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

                    <div class="mt-2 flex flex-row justify-end">
                        <Form.Button disabled={$submitting} loading={$submitting}>Reset Password</Form.Button>
                    </div>
                </form>
            {/if}
        </Card.Content>
    </Card.Root>
</div>

<div class="flex h-full w-full items-center justify-center">
    <div class="flex h-96 w-96 flex-col rounded-lg">
        <div class="mb-4 text-xl font-bold">Update your password</div>

        {#if data.error}
            <div class="mb-4">
                <span class="mb-2 font-bold text-destructive">Invalid token provided.</span> <br />Your token may have expired. Please
                request to reset your password again and follow the new link.

                <a href="/request-password-reset" class={`mt-2 ${buttonVariants()}`}>Reset Password</a>
            </div>
        {/if}

        {#if !data.error}
            <div class="mb-2">{data?.message}</div>

            <form method="POST" action={`?/confirmPasswordReset`} use:enhance class="flex max-w-lg flex-grow flex-col">
                <input type="hidden" name="tokenValue" bind:value={$formData.tokenValue} />
                <Form.Field {form} name="password">
                    <Form.Control let:attrs>
                        <Form.Label>Password</Form.Label>
                        <Input {...attrs} type="password" bind:value={$formData.password} />
                        <Form.FieldErrors class="relative" />
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

                <div class="mt-2 flex flex-row justify-end">
                    <Form.Button disabled={$submitting} loading={$submitting}>Submit</Form.Button>
                </div>
            </form>
        {/if}
    </div>
</div>

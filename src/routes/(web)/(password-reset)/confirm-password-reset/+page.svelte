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
            if (result.type === "failure") {
                console.error(result?.data?.form?.errors)
            }

            if (result.type === "success") {
                toast.success("Password updated");
                await goto("/login");
            }
        }
    });

    onMount(() => {
        $formData.token_value = $page.url.searchParams.get("token");
    });

    const { form: formData, enhance, message, errors, submitting } = form;
</script>

<div class="flex h-full w-full flex-col items-center justify-center">
    <Card.Root class="w-80 bg-card shadow-2xl">
        <Card.Header class="mb-2 p-0 text-center">
            <AppLogo class="w-56 self-center py-6" />
            {#if !data?.error}
                <Card.Title class="px-4">Confirm your new password</Card.Title>
            {/if}
        </Card.Header>
        <Card.Content class="flex w-80 flex-col mt-5">
            {#if data.error}
                <div class="flex flex-col text-center">
                    <div class="flex h-full w-full items-center justify-center">
                        <div class="flex w-96 flex-col rounded-lg">
                            <div class="mb-4 text-xl font-bold">Update your password</div>

                            {#if data.error}
                                <div class="mb-4 px-4">
                                    <span class="font-light text-sm">
                                        Your token may have expired. Please request to reset your password again and follow the new link.
                                    </span>
                                    <br />
                                    <a href="/request-password-reset" class={`mt-5 ${buttonVariants()}`}>Reset Password</a>
                                </div>
                            {/if}

                            {#if !data.error}
                                <div class="mb-2">{data?.message}</div>

                                <form method="POST" action={`?/confirmPasswordReset`} use:enhance class="flex max-w-lg flex-grow flex-col">
                                    <input type="hidden" name="token_value" bind:value={$formData.token_value} />
                                    <Form.Field {form} name="password">
                                        <Form.Control let:attrs>
                                            <Form.Label>Password</Form.Label>
                                            <Input {...attrs} type="password" bind:value={$formData.password} />
                                            <Form.FieldErrors class="relative" />
                                        </Form.Control>
                                    </Form.Field>
                                    <Form.Field {form} name="confirm_password">
                                        <Form.Control let:attrs>
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.FieldErrors />
                                            <Input {...attrs} type="password" bind:value={$formData.confirm_password} />
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
                </div>
            {:else}
                <form method="POST" action={`?/confirmPasswordReset`} use:enhance class="flex flex-grow flex-col">
                    <input type="hidden" name="token_value" bind:value={$formData.token_value} />
                    <Form.Field {form} name="password">
                        <Form.Control let:attrs>
                            <Form.Label>Password</Form.Label>
                            <Input {...attrs} type="password" bind:value={$formData.password} />
                            <Form.FieldErrors class="relative" />
                        </Form.Control>
                    </Form.Field>
                    <Form.Field {form} name="confirm_password">
                        <Form.Control let:attrs>
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.FieldErrors />
                            <Input {...attrs} type="password" bind:value={$formData.confirm_password} />
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

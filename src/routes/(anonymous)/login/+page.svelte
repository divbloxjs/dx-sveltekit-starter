<script lang="ts">
    import { buttonVariants } from "$lib/components/shadcn/ui/button";
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input } from "$lib/components/shadcn/ui/input";
    import { toast } from "svelte-sonner";

    import { loginSchema } from "./login.schema";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import AppLogo from "$lib/components/app-images/app-logo.svelte";

    import * as Card from "$lib/components/shadcn/ui/card";
    import { PUBLIC_APP_DISPLAY_NAME } from "$env/static/public";

    export let data;

    const form = superForm(data.loginForm, {
        validators: zodClient(loginSchema),
        onError(event) {
            console.log("event", event);
        }
    });

    const { form: formData, enhance, message, submitting } = form;
</script>

<div class="flex h-full w-full items-center justify-center">
    <Card.Root class="w-fit bg-card shadow-2xl">
        <Card.Header class="mb-2 p-0 text-center">
            <AppLogo class="w-56 self-center py-8" />
            <Card.Title>Sign in</Card.Title>
        </Card.Header>
        <Card.Content class="flex flex-col">
            <form action="?/login" method="POST" class="w-80" use:enhance>
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
                        <Input type="password" {...attrs} bind:value={$formData.password} />
                    </Form.Control>

                    <Form.FieldErrors />
                </Form.Field>

                {#if $message}
                    <span class="text-sm font-medium text-destructive">{$message}</span>
                {/if}

                <div class="mt-2 flex justify-between">
                    <a href="/request-password-reset" class={`${buttonVariants({ variant: "link", size: "link" })} text-foreground/60`}>
                        Forgot Password?
                    </a>

                    <Form.Button disabled={$submitting} loading={$submitting}>Sign In</Form.Button>
                </div>

                <div class="mt-4 flex justify-center">
                    <div class="flex flex-col justify-center">
                        <p class="mb-2 text-center">New to {PUBLIC_APP_DISPLAY_NAME}?</p>
                        <a href="/register" class={buttonVariants({ variant: "outline" })}>Create your account now</a>
                    </div>
                </div>
            </form>
        </Card.Content>
    </Card.Root>
</div>

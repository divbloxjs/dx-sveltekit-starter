<script lang="ts">
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";

    import { loginSchema } from "./login.schema";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    export let data;

    const form = superForm(data.loginForm, {
        validators: zodClient(loginSchema)
    });

    const { form: formData, enhance, message } = form;
</script>

<div class="flex h-full w-full items-center justify-center">
    <form action="?/login" method="POST" class="w-96" use:enhance>
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

        <div class="flex justify-between">
            <a href="/register" class={buttonVariants({ variant: "outline" })}>No Account?</a>
            <Form.Button>Login</Form.Button>
        </div>
    </form>
</div>

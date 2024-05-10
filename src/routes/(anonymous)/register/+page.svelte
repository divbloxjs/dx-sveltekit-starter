<script lang="ts">
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";

    import { registerSchema } from "./register.schema";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    export let data;

    const form = superForm(data.registerForm, {
        validators: zodClient(registerSchema)
    });

    const { form: formData, enhance, message } = form;
</script>

<div class="flex h-full w-full items-center justify-center">
    <form action="?/register" method="POST" class="w-96" use:enhance>
        <Form.Field {form} name="firstName">
            <Form.Control let:attrs>
                <Form.Label>FirstName</Form.Label>
                <Input {...attrs} bind:value={$formData.firstName} />
            </Form.Control>
            <Form.Description>This is your public display name.</Form.Description>
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
                <Input type="password" {...attrs} bind:value={$formData.password} />
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="confirmPassword">
            <Form.Control let:attrs>
                <Form.Label>Confirm Password</Form.Label>
                <Input type="password" {...attrs} bind:value={$formData.confirmPassword} />
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
        {#if $message}
            <span class="text-sm font-medium text-destructive">{$message}</span>
        {/if}
        <div class="flex justify-between">
            <a href="/login" class={buttonVariants({ variant: "outline" })}>Back to Login</a>
            <Form.Button>Submit</Form.Button>
        </div>
    </form>
</div>

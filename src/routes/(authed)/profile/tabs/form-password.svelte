<script>
    import * as Form from "$lib/components/ui/form";

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { passwordSchema } from "../schemas/password.schema";

    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";

    export let data;

    export let basePath = "/admin/user-account";

    const form = superForm(data.passwordForm, {
        validators: zodClient(passwordSchema)
    });

    const { form: formData, enhance, message, errors } = form;
    console.log("formData", $formData);
</script>

<form method="POST" action={`?/updatePassword`} class="flex max-w-full flex-grow flex-col">
    <input type="hidden" name="id" bind:value={$formData.id} />

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

    {#if $message}
        {$message._message}
    {/if}

    <div class="mt-2 flex flex-row justify-end">
        <Button type="submit">Update Password</Button>
    </div>
</form>

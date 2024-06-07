<script>
    import * as Form from "$lib/components/ui/form";

    import SuperDebug, { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { passwordSchema } from "../schemas/password.schema";

    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { toast } from "svelte-sonner";

    export let data;

    export let basePath = "/admin/user-account";

    const form = superForm(data.passwordForm, {
        validators: zodClient(passwordSchema),
        onSubmit: (event) => {
            console.log("onSubmit event", event);
        },
        onError: (event) => {
            console.log("error event", event);
        },
        onResult: (event) => {
            if (event?.result?.type === "success") {
                toast.success("Password updated");
            }
            console.log("onResult event", event);
        }
    });

    const { form: formData, enhance, message, errors } = form;
</script>

<form method="POST" action={`?/updatePassword`} use:enhance class="flex max-w-full flex-grow flex-col">
    <input name="id" type="hidden" bind:value={$formData.id} />

    <Form.Field {form} name="password">
        <Form.Control let:attrs>
            <Form.Label>Password</Form.Label>
            <Input {...attrs} type="password" bind:value={$formData.password} />
        </Form.Control>
        <Form.FieldErrors class="relative" />
    </Form.Field>
    <Form.Field {form} name="confirmPassword">
        <Form.Control let:attrs>
            <Form.Label>Confirm Password</Form.Label>
            <Input {...attrs} type="password" bind:value={$formData.confirmPassword} />
        </Form.Control>
        <Form.FieldErrors class="relative" />
    </Form.Field>

    {#if $message}
        {$message}
    {/if}

    <div class="mt-2 flex flex-row justify-end">
        <Button type="submit">Update Password</Button>
    </div>
</form>

<script>
    import * as Form from "$lib/components/ui/form";

    import { userAccountSchema } from "../schemas/user-account.schema";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { buttonVariants } from "$lib/dx-components/form-elements/button";

    export let data;

    export let basePath = "/profile";

    const form = superForm(data.userForm, {
        validators: zodClient(userAccountSchema)
    });

    const { form: formData, enhance, message, errors, formId } = form;
    console.log("formId", $formId);
    console.log("formData", $formData);
</script>

<form method="POST" action={`?/updateUser`} class="flex max-w-full flex-grow flex-col">
    <input type="hidden" name="id" bind:value={$formData.id} />

    <Form.Field {form} name="firstName">
        <Form.Control let:attrs>
            <Form.Label>First Name</Form.Label>
            <Input {...attrs} bind:value={$formData.firstName} />
        </Form.Control>
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
    <Form.Field {form} name="username">
        <Form.Control let:attrs>
            <Form.Label>Username</Form.Label>
            <Input {...attrs} bind:value={$formData.username} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <div class="mt-2 flex flex-row justify-between">
        <Button type="submit" variant="destructive" formaction={`${basePath}/${$formData.id}?/delete`}>Delete</Button>
        <Button type="submit">Update</Button>
    </div>
</form>

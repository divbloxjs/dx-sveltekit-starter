<script>
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form";
    import { organisationSchema } from "./organisation.schema";
    import Input from "$lib/components/ui/input/input.svelte";
    import Textarea from "$lib/dx-components/form-elements/textarea.svelte";

    export let data;
    export let basePath = "/admin/user-account";

    console.log(data.organisationForm);
    const form = superForm(data.organisationForm, {
        validators: zodClient(organisationSchema)
    });

    const { form: formData, enhance, message, errors } = form;

    const placeOptions = $page.data?.placeOptions ?? [];
    const parentOrganisationOptions = $page.data?.parentOrganisationOptions ?? [];
</script>

<form method="POST" action={`${basePath}/new?/create`} use:enhance class="flex max-w-lg flex-grow flex-col">
    <Form.Field {form} name="organisationName">
        <Form.Control let:attrs>
            <Form.Label>Name</Form.Label>
            <Input {...attrs} bind:value={$formData.organisationName} />
            <Form.FieldErrors />
        </Form.Control>
    </Form.Field>
    <Form.Field {form} name="description">
        <Form.Control let:attrs>
            <Form.Label>Description</Form.Label>
            <Textarea {...attrs}>{$formData.description}</Textarea>
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

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${basePath}/overview`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Form.Button>Submit</Form.Button>
    </div>
</form>

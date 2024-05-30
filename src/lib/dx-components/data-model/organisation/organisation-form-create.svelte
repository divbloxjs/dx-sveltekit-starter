<script>
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form";
    import { organisationSchema } from "./organisation.schema";
    import Input from "$lib/components/ui/input/input.svelte";
    import { buttonVariants } from "$lib/components/ui/button";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import { Select } from "$lib/components/ui/select";
    import { ChevronsUpDown } from "lucide-svelte";

    export let data;
    export let basePath = "/admin/user-account";

    console.log(data.organisationForm);
    const form = superForm(data.organisationForm, {
        validators: zodClient(organisationSchema)
    });

    const { form: formData, enhance, message, errors } = form;

    console.log("formData", $formData);
    //     const placeOptions = $page.data?.placeOptions ?? [];
    //     const parentOrganisationOptions = $page.data?.parentOrganisationOptions ?? [];
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
            <Textarea {...attrs} bind:value={$formData.description} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="isDefault">
        <Form.Control let:attrs>
            <Form.Label>Default</Form.Label>
            <Checkbox {...attrs} bind:checked={$formData.isDefault} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="details">
        <Form.Control let:attrs>
            <Form.Label>Detail</Form.Label>
            <Textarea {...attrs} bind:value={$formData.password} />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="placeId">
        <Form.Control let:attrs>
            <Form.Label>Place</Form.Label>
            <Select {...attrs} bind:value={$formData.placeId} />
            <Form.FieldErrors />
        </Form.Control>
    </Form.Field>

    <Form.Field {form} name="Parent">
        <Form.Control let:attrs>
            <Form.Label>Parent</Form.Label>
            <Select {...attrs} bind:value={$formData.parentOrganisationId} />
            <Form.FieldErrors />
        </Form.Control>
    </Form.Field>

    <div class="mt-2 flex flex-row justify-between">
        <a href={`${basePath}/overview`} class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Form.Button>Submit</Form.Button>
    </div>
</form>

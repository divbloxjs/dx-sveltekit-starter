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

    <Form.Field {form} name="language" class="flex flex-col">
        <Popover.Root bind:open let:ids>
            <Form.Control let:attrs>
                <Form.Label>Language</Form.Label>
                <Popover.Trigger
                    class={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-[200px] justify-between",
                        !$formData.language && "text-muted-foreground"
                    )}
                    role="combobox"
                    {...attrs}>
                    {languages.find((f) => f.value === $formData.language)?.label ?? "Select language"}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Popover.Trigger>
                <input hidden value={$formData.language} name={attrs.name} />
            </Form.Control>
            <Popover.Content class="w-[200px] p-0">
                <Command.Root>
                    <Command.Input autofocus placeholder="Search language..." class="h-9" />
                    <Command.Empty>No language found.</Command.Empty>
                    <Command.Group>
                        {#each languages as language}
                            <Command.Item
                                value={language.label}
                                onSelect={() => {
                                    $formData.language = language.value;
                                    closeAndFocusTrigger(ids.trigger);
                                }}>
                                {language.label}
                                <Check class={cn("ml-auto h-4 w-4", language.value !== $formData.language && "text-transparent")} />
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.Root>
            </Popover.Content>
        </Popover.Root>
        <Form.Description>This is the language that will be used in the dashboard.</Form.Description>
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

<script>
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";

    import { buttonVariants } from "$lib/dx-components/form-elements/button.js";
    import Button from "$lib/dx-components/form-elements/button.svelte";
    import InputSelect from "$lib/dx-components/form-elements/input-select.svelte";
    import InputText from "$lib/dx-components/form-elements/input-text.svelte";
    import Label from "$lib/dx-components/form-elements/label.svelte";
    import Textarea from "$lib/dx-components/form-elements/textarea.svelte";

    // __associatedEntitiesImports__;

    export let readOnly = false;

    	const placeOptions = $page.data?.placeOptions ?? []; 
	const parentOrganisationOptions = $page.data?.parentOrganisationOptions ?? []; 
;

    	const formValues = { 
		id: $page?.data?.organisation?.id ?? $page?.form?.id ?? '',
		effort:
            $page?.data?.organisation?.effort ??
            $page?.form?.effort ??
            '',
		isDefault:
            $page?.data?.organisation?.isDefault ??
            $page?.form?.isDefault ??
            '',
		description:
            $page?.data?.organisation?.description ??
            $page?.form?.description ??
            '',
		organisationName:
            $page?.data?.organisation?.organisationName ??
            $page?.form?.organisationName ??
            '',
		placeId:
            $page?.data?.organisation?.placeId?.toString() ?? $page?.form?.placeId?.toString() ?? 'null',
		parentOrganisationId:
            $page?.data?.organisation?.parentOrganisationId?.toString() ?? $page?.form?.parentOrganisationId?.toString() ?? 'null',
	};
</script>

<form method="POST" action="/organisation/{formValues.id}?/update" use:enhance class="max-w-sm">
    	<Label for="effort">effort</Label>
	<InputText bind:value={formValues.effort} attributeName="effort" name="effort" />
	<Label for="isDefault">isDefault</Label>
	<InputText bind:value={formValues.isDefault} attributeName="isDefault" name="isDefault" />
	<Label for="description">description</Label>
	<InputText bind:value={formValues.description} attributeName="description" name="description" />
	<Label for="organisationName">organisationName</Label>
	<InputText bind:value={formValues.organisationName} attributeName="organisationName" name="organisationName" />
	<Label for="place">place</Label>
	<InputSelect bind:value={formValues.placeId} attributeName="placeId" optionDisplayName="id" labelValue="place" options={placeOptions}/>
	<Label for="parentOrganisation">parentOrganisation</Label>
	<InputSelect bind:value={formValues.parentOrganisationId} attributeName="parentOrganisationId" optionDisplayName="id" labelValue="parentOrganisation" options={parentOrganisationOptions}/>


    <div class="mt-2 flex w-full flex-row justify-between">
        <a href="/organisation/overview" class={buttonVariants({ variant: "outline", size: "sm" })}>Cancel</a>

        <div>
            <Button type="submit" variant="destructive" size="sm" formaction="/organisation/{formValues.id}?/delete">Delete</Button>
            <Button type="submit" variant="default" size="sm">Update</Button>
        </div>
    </div>
</form>

<!-- __associatedEntitiesComponents__ -->

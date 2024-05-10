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

    ;

    	const formValues = { 
		id: $page?.data?.userRole?.id ?? $page?.form?.id ?? '',
		roleName:
            $page?.data?.userRole?.roleName ??
            $page?.form?.roleName ??
            '',
	};
</script>

<form method="POST" action="/userRole/{formValues.id}?/update" use:enhance class="max-w-sm">
    	<Label for="roleName">roleName</Label>
	<InputText bind:value={formValues.roleName} attributeName="roleName" name="roleName" />


    <div class="mt-2 flex w-full flex-row justify-between">
        <a href="/userRole/overview" class={buttonVariants({ variant: "outline", size: "sm" })}>Cancel</a>

        <div>
            <Button type="submit" variant="destructive" size="sm" formaction="/userRole/{formValues.id}?/delete">Delete</Button>
            <Button type="submit" variant="default" size="sm">Update</Button>
        </div>
    </div>
</form>

<!-- __associatedEntitiesComponents__ -->

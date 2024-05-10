<script>
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";

    import { buttonVariants } from "$lib/dx-components/form-elements/button.js";
    import Button from "$lib/dx-components/form-elements/button.svelte";
    import InputSelect from "$lib/dx-components/form-elements/input-select.svelte";
    import InputText from "$lib/dx-components/form-elements/input-text.svelte";
    import Label from "$lib/dx-components/form-elements/label.svelte";
    import Textarea from "$lib/dx-components/form-elements/textarea.svelte";

    ;

    	const formValues = { 
		id: $page?.data?.userRole?.id ?? $page?.form?.id ?? '',
		roleName:
            $page?.data?.userRole?.roleName ??
            $page?.form?.roleName ??
            '',
	};
</script>

<form method="POST" action="/userAccount/new?/create" use:enhance class="flex max-w-sm flex-col">
    	<Label for="roleName">roleName</Label>
	<InputText bind:value={formValues.roleName} attributeName="roleName" name="roleName" />

    <div class="mt-2 flex flex-row justify-between">
        <a href="/userAccount/overview" class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Create</Button>
    </div>
</form>

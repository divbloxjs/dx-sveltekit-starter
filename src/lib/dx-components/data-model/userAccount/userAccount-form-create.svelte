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
		id: $page?.data?.userAccount?.id ?? $page?.form?.id ?? '',
		lastName:
            $page?.data?.userAccount?.lastName ??
            $page?.form?.lastName ??
            '',
		password:
            $page?.data?.userAccount?.password ??
            $page?.form?.password ??
            '',
		firstName:
            $page?.data?.userAccount?.firstName ??
            $page?.form?.firstName ??
            '',
		emailAddress:
            $page?.data?.userAccount?.emailAddress ??
            $page?.form?.emailAddress ??
            '',
	};
</script>

<a href="/userAccount/overview">back</a>
<form method="POST" action="/userAccount/new?/create" use:enhance class="flex max-w-sm flex-col">
    	<Label for="lastName">lastName</Label>
	<InputText bind:value={formValues.lastName} attributeName="lastName" name="lastName" />
	<Label for="password">password</Label>
	<InputText bind:value={formValues.password} attributeName="password" name="password" />
	<Label for="firstName">firstName</Label>
	<InputText bind:value={formValues.firstName} attributeName="firstName" name="firstName" />
	<Label for="emailAddress">emailAddress</Label>
	<InputText bind:value={formValues.emailAddress} attributeName="emailAddress" name="emailAddress" />

    <div class="mt-2 flex flex-row justify-between">
        <a href="/userAccount/overview" class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Create</Button>
    </div>
</form>

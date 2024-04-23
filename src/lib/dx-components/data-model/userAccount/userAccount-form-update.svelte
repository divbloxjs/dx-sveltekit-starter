<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import InputSelect from "$lib/dx-components/form-elements/input-select.svelte"
	import InputText from "$lib/dx-components/form-elements/input-text.svelte"
	import Textarea from "$lib/dx-components/form-elements/textarea.svelte"

// __associatedEntitiesImports__;

	export let readOnly = false;

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
<form method="POST" action="/userAccount/{formValues.id}?/update" use:enhance>
	<InputText bind:value={formValues.lastName} attributeName="lastName" labelValue="lastName" />
	<InputText bind:value={formValues.password} attributeName="password" labelValue="password" />
	<InputText bind:value={formValues.firstName} attributeName="firstName" labelValue="firstName" />
	<InputText bind:value={formValues.emailAddress} attributeName="emailAddress" labelValue="emailAddress" />

	<button>Update</button>
	<button formaction="/userAccount/{formValues.id}?/delete">Delete</button>
</form>

<!-- __associatedEntitiesComponents__ -->

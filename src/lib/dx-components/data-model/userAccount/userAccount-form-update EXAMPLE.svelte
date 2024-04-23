<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

// __associatedEntitiesImports__;
	// import DataTableCustomer from '$lib/dx-components/data-model/customer/data-table-customer.svelte';

	export let readOnly = false;

;
	// const placeOptions = $page.data?.placeOptions ?? [];
	// const parentOrganisationOptions = $page.data?.parentOrganisationOptions ?? [];

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
	// const formValues = {
	// 	id: $page?.data?.userAccount?.id ?? $page?.form?.id ?? '',

	// 	//loop over all attributes and add as below - either simple or select version
	// 	// default basic attribute
	// 	__attributeName__:
	// 		$page?.data?.userAccount?.__attributeName__ ??
	// 		$page?.form?.__attributeName__ ??
	// 		__attributeNameDefaultValue__,

	// 	// example of attribute that needs toString() for selects
	// 	isDefault:
	// 		$page?.data?.userAccount?.isDefault?.toString() ??
	// 		$page?.form?.isDefault?.toString() ??
	// 		'null',

	// 	// loop over all relationships and add as below
	// 	placeId:
	// 		$page?.data?.userAccount?.placeId?.toString() ?? $page?.form?.placeId?.toString() ?? 'null'
	// };
</script>

<a href="/userAccount/overview">back</a>
<form method="POST" action="/userAccount/{formValues.id}?/update" use:enhance>
	<Label for="lastName">lastName</Label>
	<InputText bind:value={formValues.lastName} attributeName="lastName" name="lastName" />
	<Label for="password">password</Label>
	<InputText bind:value={formValues.password} attributeName="password" name="password" />
	<Label for="firstName">firstName</Label>
	<InputText bind:value={formValues.firstName} attributeName="firstName" name="firstName" />
	<Label for="emailAddress">emailAddress</Label>
	<InputText bind:value={formValues.emailAddress} attributeName="emailAddress" name="emailAddress" />

	<!-- Loop over each key in formValues object - based on UI config - display input|select|textarea with correct params -->

	<!-- Example: Replace with select component -->
	<!-- <label>
		Place:

		<select name="placeId" value={formValues.placeId}>
			<option value="null">-Please Select-</option>
			{#each placeOptions as placeOption}
				<option value={placeOption.id}>{placeOption.placeName}</option>
			{/each}
		</select>
	</label> -->

	<button>Update</button>
	<button formaction="/userAccount/{formValues.id}?/delete">Delete</button>
</form>

<!-- __associatedEntitiesComponents__ -->
<!-- <DataTableCustomer data={{ customers: $page?.data.associatedEntities.customer }} /> -->

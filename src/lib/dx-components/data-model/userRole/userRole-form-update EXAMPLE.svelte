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
		id: $page?.data?.userRole?.id ?? $page?.form?.id ?? '',
		roleName:
            $page?.data?.userRole?.roleName ??
            $page?.form?.roleName ??
            '',
	};
	// const formValues = {
	// 	id: $page?.data?.userRole?.id ?? $page?.form?.id ?? '',

	// 	//loop over all attributes and add as below - either simple or select version
	// 	// default basic attribute
	// 	__attributeName__:
	// 		$page?.data?.userRole?.__attributeName__ ??
	// 		$page?.form?.__attributeName__ ??
	// 		__attributeNameDefaultValue__,

	// 	// example of attribute that needs toString() for selects
	// 	isDefault:
	// 		$page?.data?.userRole?.isDefault?.toString() ??
	// 		$page?.form?.isDefault?.toString() ??
	// 		'null',

	// 	// loop over all relationships and add as below
	// 	placeId:
	// 		$page?.data?.userRole?.placeId?.toString() ?? $page?.form?.placeId?.toString() ?? 'null'
	// };
</script>

<a href="/userRole/overview">back</a>
<form method="POST" action="/userRole/{formValues.id}?/update" use:enhance>
	<Label for="roleName">roleName</Label>
	<InputText bind:value={formValues.roleName} attributeName="roleName" name="roleName" />

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
	<button formaction="/userRole/{formValues.id}?/delete">Delete</button>
</form>

<!-- __associatedEntitiesComponents__ -->
<!-- <DataTableCustomer data={{ customers: $page?.data.associatedEntities.customer }} /> -->

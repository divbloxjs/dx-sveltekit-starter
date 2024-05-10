<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import InputSelect from "../form-elements/input-select.svelte"
	import InputText from "../form-elements/input-text.svelte"
	import Textarea from "../form-elements/textarea.svelte"

	const userAccountOptions = $page.data?.userAccountOptions ?? []; 
;
	// const placeOptions = $page.data?.placeOptions ?? [];
	// const parentOrganisationOptions = $page.data?.parentOrganisationOptions ?? [];

	const formValues = { 
		id: $page?.data?.userSession?.id ?? $page?.form?.id ?? '',
		sessionId:
            $page?.data?.userSession?.sessionId ??
            $page?.form?.sessionId ??
            '',
		userAgent:
            $page?.data?.userSession?.userAgent ??
            $page?.form?.userAgent ??
            '',
		sessionData:
            $page?.data?.userSession?.sessionData ??
            $page?.form?.sessionData ??
            '',
		expiryDateTime:
            $page?.data?.userSession?.expiryDateTime ??
            $page?.form?.expiryDateTime ??
            '',
		durationInMinutes:
            $page?.data?.userSession?.durationInMinutes ??
            $page?.form?.durationInMinutes ??
            '',
		userAccountId:
            $page?.data?.userSession?.userAccountId?.toString() ?? $page?.form?.userAccountId?.toString() ?? 'null',
	};
	// const formValues = {
	// 	id: $page?.data?.userSession?.id ?? $page?.form?.id ?? '',

	// 	//loop over all attributes and add as below - either simple or select version
	// 	// default basic attribute
	// 	__attributeName__:
	// 		$page?.data?.userSession?.__attributeName__ ??
	// 		$page?.form?.__attributeName__ ??
	// 		__attributeNameDefaultValue__,

	// 	// example of attribute that needs toString() for selects
	// 	isDefault:
	// 		$page?.data?.organisation?.isDefault?.toString() ??
	// 		$page?.form?.isDefault?.toString() ??
	// 		'null',

	// 	// loop over all relationships and add as below
	// 	placeId:
	// 		$page?.data?.organisation?.placeId?.toString() ?? $page?.form?.placeId?.toString() ?? 'null'
	// };
</script>

<a href="/userSession/overview">back</a>
<form method="POST" action="/userSession/new?/create" use:enhance>
	<Label for="sessionId">sessionId</Label>
	<InputText bind:value={formValues.sessionId} attributeName="sessionId" name="sessionId" />
	<Label for="userAgent">userAgent</Label>
	<InputText bind:value={formValues.userAgent} attributeName="userAgent" name="userAgent" />
	<Label for="sessionData">sessionData</Label>
	<InputText bind:value={formValues.sessionData} attributeName="sessionData" name="sessionData" />
	<Label for="expiryDateTime">expiryDateTime</Label>
	<InputText bind:value={formValues.expiryDateTime} attributeName="expiryDateTime" name="expiryDateTime" />
	<Label for="durationInMinutes">durationInMinutes</Label>
	<InputText bind:value={formValues.durationInMinutes} attributeName="durationInMinutes" name="durationInMinutes" />
	<Label for="userAccount">userAccount</Label>
	<InputSelect bind:value={formValues.userAccountId} attributeName="userAccountId" optionDisplayName="id" labelValue="userAccount" options={userAccountOptions}/>





	<!-- <InputSelect bind:value={formValues.__attributeName__} attributeName="__attributeName__" labelValue="__displayName__" options={__relationshipName__Options}/>
	<InputText bind:value={formValues.__attributeName__} attributeName="__attributeName__" labelValue="__displayName__" />
	<Textarea bind:value={formValues.__attributeName__} attributeName="__attributeName__" labelValue="__displayName__" /> -->
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
	<button>Create</button>
</form>

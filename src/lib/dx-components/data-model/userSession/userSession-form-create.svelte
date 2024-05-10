<script>
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";

    import { buttonVariants } from "$lib/dx-components/form-elements/button.js";
    import Button from "$lib/dx-components/form-elements/button.svelte";
    import InputSelect from "$lib/dx-components/form-elements/input-select.svelte";
    import InputText from "$lib/dx-components/form-elements/input-text.svelte";
    import Label from "$lib/dx-components/form-elements/label.svelte";
    import Textarea from "$lib/dx-components/form-elements/textarea.svelte";

    	const userAccountOptions = $page.data?.userAccountOptions ?? []; 
;

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
</script>

<form method="POST" action="/userAccount/new?/create" use:enhance class="flex max-w-sm flex-col">
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

    <div class="mt-2 flex flex-row justify-between">
        <a href="/userAccount/overview" class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Create</Button>
    </div>
</form>

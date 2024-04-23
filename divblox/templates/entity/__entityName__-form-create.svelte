<script>
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";

    import { buttonVariants } from "__componentsPathAlias__/form-elements/button.js";
    import Button from "__componentsPathAlias__/form-elements/button.svelte";
    import InputSelect from "__componentsPathAlias__/form-elements/input-select.svelte";
    import InputText from "__componentsPathAlias__/form-elements/input-text.svelte";
    import Label from "__componentsPathAlias__/form-elements/label.svelte";
    import Textarea from "__componentsPathAlias__/form-elements/textarea.svelte";

    __relatedEntitiesOptions__;

    __formValues__;
</script>

<a href="/__entityName__/overview">back</a>
<form method="POST" action="/userAccount/new?/create" use:enhance class="flex max-w-sm flex-col">
    __formValueComponents__
    <div class="mt-2 flex flex-row justify-between">
        <a href="/userAccount/overview" class={buttonVariants({ variant: "outline" })}>Cancel</a>
        <Button type="submit">Create</Button>
    </div>
</form>

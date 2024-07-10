<script>
    import { page } from "$app/stores";

    // TODO: Annoyingly SvelteKit seems to insert a default message of 'Error: StatusCode'
    // when no message is passed from backend. Figure out how to remove it and handle defaults here
    $: defaultMessage = "Something wet wrong. Please try again";

    if ($page.status === 404) {
        defaultMessage = "Unable to load specified resource";
    }
</script>

<div class="flex h-full w-full flex-col items-center justify-center">
    <h1 class="text-xl font-bold">{$page.status}</h1>
    <p>{$page.error?.message ?? defaultMessage}</p>
</div>

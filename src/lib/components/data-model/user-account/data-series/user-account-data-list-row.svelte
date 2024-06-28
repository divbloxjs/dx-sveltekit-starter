<script>
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";

    export let userAccountData;
    export let basePath = "/user-account";
    export let redirectBackPath = "";

    // Set to true if you want to handle the row click event manually in parent component
    export let disableDefaultRowClickAction = false;

    const dispatch = createEventDispatcher();

    const searchParams = new URLSearchParams();
    if (redirectBackPath) searchParams.set("redirectBackPath", redirectBackPath);
</script>

<button
    class="w-full bg-card px-2 py-4 text-left"
    on:click={() => {
        dispatch("row-clicked", { rowData: userAccountData });
        if (!disableDefaultRowClickAction) {
            goto(`${basePath}/${userAccountData.id}?${searchParams.toString()}`);
        }
    }}>
    <p class="truncate">{userAccountData.first_name}</p>
    <p class="truncate">{userAccountData.email_address}</p>
</button>

<!-- Interrogate relationships in the userAccountData object -->

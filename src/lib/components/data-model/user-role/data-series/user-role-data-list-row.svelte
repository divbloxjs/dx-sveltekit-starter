<script>
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";

    export let userRoleData;
    export let basePath = "/user-role";
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
        dispatch("row-clicked", { rowData: userRoleData });

        if (!disableDefaultRowClickAction) {
            goto(`${basePath}/${userRoleData.id}?${searchParams.toString()}`);
        }
    }}>
    <p class="truncate">{userRoleData.role_name}</p>
</button>

<!-- Interrogate relationships in the userRoleData object -->

<script>
    import { goto } from "$app/navigation";

    export let userRoleData;
    export let basePath = "/user-role";
    export let redirectBackPath = "";

    const searchParams = new URLSearchParams();
    if (redirectBackPath) searchParams.set("redirectBackPath", redirectBackPath);
</script>

<button
    class="w-full bg-card px-2 py-4 text-left"
    on:click={() => {
        goto(`${basePath}/${userRoleData.id}?${searchParams.toString()}`);
    }}>
    <p class="truncate">{userRoleData.role_name}</p>

</button>

<!-- Interrogate relationships in the userRoleData object -->


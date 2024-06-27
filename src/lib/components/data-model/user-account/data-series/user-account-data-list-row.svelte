<script>
    import { goto } from "$app/navigation";

    export let userAccountData;
    export let basePath = "/user-account";
    export let redirectBackPath = "";

    const searchParams = new URLSearchParams();
    if (redirectBackPath) searchParams.set("redirectBackPath", redirectBackPath);
</script>

<button
    class="w-full bg-card px-2 py-4 text-left"
    on:click={() => {
        goto(`${basePath}/${userAccountData.id}?${searchParams.toString()}`);
    }}>
    <p class="truncate">{userAccountData.first_name}</p>
    <p class="truncate">{userAccountData.email_address}</p>
</button>

<!-- Interrogate relationships in the userAccountData object -->

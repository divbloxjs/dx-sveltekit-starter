<script>
    import { goto } from "$app/navigation";

    export let userSessionData;
    export let basePath = "/user-session";
</script>

<button
    class="w-full bg-card px-2 py-4"
    on:click={() => {
        goto(`${basePath}/${userSessionData.id}`);
    }}>
    <p class="truncate">{userSessionData.expiresAt}</p>
<p class="truncate">{userSessionData.sessionId}</p>
<p class="truncate">{userSessionData.userAgent}</p>
<p class="truncate">{userSessionData.sessionData}</p>
<p class="truncate">{userSessionData.durationInMinutes}</p>

</button>

<!-- Interrogate relationships in the userSessionData object -->


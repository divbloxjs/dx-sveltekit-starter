<script>
    export let userAccountData;
</script>

<div class="w-full bg-card px-2 py-4">
    <p class="truncate">{userAccountData.lastName}</p>
    <p class="truncate">{userAccountData.username}</p>
    <p class="truncate">{userAccountData.firstName}</p>
    <p class="truncate">{userAccountData.emailAddress}</p>
    <p class="truncate">{userAccountData.hashedPassword}</p>
</div>

<!-- Interrogate relationships in the userAccountData object -->

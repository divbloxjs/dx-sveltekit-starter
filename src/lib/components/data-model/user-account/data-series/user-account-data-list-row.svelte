<script>
    export let userAccountData;
</script>

<div class="w-full bg-card px-2 py-4">
    <p class="truncate">{userAccountData.first_name}</p>
    <p class="truncate">{userAccountData.last_name}</p>
    <p class="truncate">{userAccountData.email_address}</p>
</div>

<!-- Interrogate relationships in the userAccountData object -->

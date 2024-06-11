<script>
    export let userAccountData;
</script>

<div class="w-full bg-card">
    <p>{userAccountData.lastName}</p>
    <p>{userAccountData.username}</p>
    <p>{userAccountData.firstName}</p>
    <p>{userAccountData.emailAddress}</p>
    <p>{userAccountData.hashedPassword}</p>
</div>

<!-- Interrogate relationships in the userAccountData object -->

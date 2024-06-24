<script>
    import { goto } from "$app/navigation";

    export let organisationData;
    export let basePath = "/organisation";
</script>

<button
    class="w-full bg-card px-2 py-4 text-left"
    on:click={() => {
        goto(`${basePath}/${organisationData.id}`);
    }}>
    <p class="truncate">{organisationData.org_name}</p>
<p class="truncate">{organisationData.org_date}</p>
<p class="truncate">{organisationData.org_date_time}</p>
<p class="truncate">{organisationData.org_number}</p>
<p class="truncate">{organisationData.org_json}</p>
<p class="truncate">{organisationData.status}</p>

</button>

<!-- Interrogate relationships in the organisationData object -->


<script>
    import { goto } from "$app/navigation";
    import { createEventDispatcher } from "svelte";

    export let fundingEventData;
    export let basePath = "/funding-event";
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
        dispatch("row-clicked", { rowData: fundingEventData });

        if (!disableDefaultRowClickAction) {
            goto(`${basePath}/${fundingEventData.id}?${searchParams.toString()}`);
        }
    }}>
    <p class="truncate">{fundingEventData.description}</p>
<p class="truncate">{fundingEventData.amount}</p>
<p class="truncate">{fundingEventData.type}</p>
<p class="truncate">{fundingEventData.issued_shares}</p>
<p class="truncate">{fundingEventData.allocated_shares}</p>
<p class="truncate">{fundingEventData.has_shares_issued_affect}</p>
<p class="truncate">{fundingEventData.funding_date}</p>
<p class="truncate">{fundingEventData.vesting_date}</p>

</button>

<!-- Interrogate relationships in the fundingEventData object -->


<script lang="ts">
    import { onMount } from "svelte";
    import DataTable from "./data-table.svelte";
    import { writable, type Writable } from "svelte/store";

    type Payment = {
        id: string;
        amount: number;
        status: "pending" | "processing" | "success" | "failed";
        email: string;
    };
</script>

<div class="container mx-auto py-10">
    <DataTable />
</div>

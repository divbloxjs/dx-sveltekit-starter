<script>
    export let value;
    export let attributeName;
    export let options = [];
    export let optionValue = "id";
    export let optionDisplayName = "id";
</script>

<select
    name={attributeName}
    bind:value
    {...$$restProps}
    class="flex h-8 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
    {#each options as option}
        <option value={option[optionValue]} selected={optionValue === value}>
            {option[optionDisplayName]}
        </option>
    {/each}
</select>

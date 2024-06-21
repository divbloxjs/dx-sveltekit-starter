<script>
    import dataModelUi from "datamodel-ui";
    import FilterText from "./filter-text.svelte";
    import FilterNumber from "./filter-number.svelte";
    import FilterSelect from "./filter-select.svelte";
    import FilterDate from "./filter-date.svelte";

    import { getCamelFromSqlCase } from "$lib/helpers.js";
    import { getDeepValue } from "$components/data-model/_helpers/helpers";
    import FilterDatetime from "./filter-datetime.svelte";
    import { parse, stringify } from "qs";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    export let entityName = "userAccount";
    export let attributeName = "name";

    export let displayName;
    export let basePath;
    export let filters;

    console.log("dataModelUi", dataModelUi);

    export let stack;
    console.log("stack", stack);
    const a = { user_account: { last_name: "asd" } };
    const haha = getDeepValue(a, [...stack]);

    // console.log("deep", getDeepValue(stack));

    // console.log("attributeName", attributeName);

    // console.log("attributeName CC", getCamelFromSqlCase(attributeName));

    console.log("dataModelUi[entityName]", dataModelUi[entityName]);
    console.log("getCamelFromSqlCase(attributeName)", getCamelFromSqlCase(attributeName));
    console.log("thing", dataModelUi[entityName][getCamelFromSqlCase(attributeName)]);
    console.log("type", dataModelUi[entityName][getCamelFromSqlCase(attributeName)]?.type);
    $: type = dataModelUi[entityName][getCamelFromSqlCase(attributeName)]?.type;
    console.log("type", type);

    //#region Filter handlers
    const handleFilterChange = ({ detail }) => {
        const newFilterValue = detail.filterValue;
        const originalParams = parse($page.url.search, { ignoreQueryPrefix: true });

        if (!originalParams.filter) originalParams.filter = {};

        if (!originalParams.filter[attributeName]) {
            originalParams.filter[attributeName] = { eq: newFilterValue };
        }

        const newParams = stringify(originalParams, { encodeValuesOnly: true });

        goto(`${basePath}?${newParams}`, { keepFocus: true });
    };

    const handleFilterClear = () => {
        const originalParams = parse($page.url.search, { ignoreQueryPrefix: true });
        delete originalParams.filter?.[attributeName];

        const newParams = stringify(originalParams, { encodeValuesOnly: true });
        goto(`${basePath}?${newParams}`, { invalidateAll: true });
    };
    //#endregion
</script>

{#if type === "text"}
    <FilterText {displayName} on:filter-change={handleFilterChange} on:filter-clear={handleFilterClear}></FilterText>
{:else if type === "number"}
    <FilterNumber {displayName} on:filter-change={handleFilterChange} on:filter-clear={handleFilterClear}></FilterNumber>
{:else if type === "select"}
    <!-- <FilterSelect {basePath} {attributeName} {displayName} {filters}></FilterSelect> -->
{:else if type === "date"}
    <!-- <FilterDate {basePath} {attributeName} {displayName} {filters}></FilterDate> -->
{:else if type === "datetime-local"}
    <!-- <FilterDatetime {basePath} {attributeName} {displayName} {filters}></FilterDatetime> -->
{:else}
    No filter
{/if}

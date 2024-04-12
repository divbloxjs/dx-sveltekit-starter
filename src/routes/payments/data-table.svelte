<script lang="ts">
    // import CaretSort from "svelte-radix/CaretSort.svelte";
    // import ChevronDown from "svelte-radix/ChevronDown.svelte";
    import { Render, Subscribe, createRender, createTable } from "svelte-headless-table";
    import { addHiddenColumns, addPagination, addSelectedRows, addSortBy, addTableFilter } from "svelte-headless-table/plugins";
    import { writable, type Writable } from "svelte/store";
    import Actions from "./data-table-actions.svelte";
    import DataTableCheckbox from "./data-table-checkbox.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { cn } from "$lib/utils.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { sleep } from "dx-utilities";
    import { onMount } from "svelte";

    type Payment = {
        id: string;
        amount: number;
        status: "pending" | "processing" | "success" | "failed";
        email: string;
    };

    export let data: Writable<Payment[]> = writable([]);
    export let serverItemCount: Writable<Number> = writable(0);

    const getPayments = async () => {
        console.log("getting payments");
        console.log("filterValue", $filterValue);
        console.log("pageIndex", $pageIndex);
        console.log("pageSize", $pageSize);

        await sleep(2000);
        $data = [
            {
                id: "m5gr1284i9",
                amount: 316,
                status: "pending",
                email: "ertgh@yahoo.com"
            },
            {
                id: "m5gr82434i9",
                amount: 345,
                status: "pending",
                email: "fhghj@yahoo.com"
            },
            {
                id: "m5gr5684i9",
                amount: 345,
                status: "success",
                email: "fgnhfgh@yahoo.com"
            },
            {
                id: "m5g234r84i9",
                amount: 234,
                status: "failed",
                email: "dfg@yahoo.com"
            },
            {
                id: "m5gr81234i9",
                amount: 123,
                status: "failed",
                email: "asd@yahoo.com"
            }
        ];

        $serverItemCount = 14;
    };

    onMount(() => {
        getPayments();
    });

    const paginate = (change) => {
        $pageIndex = $pageIndex + change;
        getPayments();
    };

    const table = createTable(data, {
        sort: addSortBy({ disableMultiSort: true }),
        page: addPagination({ serverSide: true, serverItemCount }),
        filter: addTableFilter({ serverSide: true, initialFilterValue: "haha" }),
        select: addSelectedRows(),
        hide: addHiddenColumns()
    });

    const columns = table.createColumns([
        table.column({
            header: (_, { pluginStates }) => {
                const { allPageRowsSelected } = pluginStates.select;
                return createRender(DataTableCheckbox, {
                    checked: allPageRowsSelected
                });
            },
            accessor: "id",
            cell: ({ row }, { pluginStates }) => {
                const { getRowState } = pluginStates.select;
                const { isSelected } = getRowState(row);

                return createRender(DataTableCheckbox, {
                    checked: isSelected
                });
            },
            plugins: {
                sort: {
                    disable: true
                }
            }
        }),
        table.column({
            header: "Status",
            accessor: "status",
            plugins: { sort: { disable: true } }
        }),
        table.column({
            header: "Email",
            accessor: "email",
            cell: ({ value }) => value.toLowerCase(),
            plugins: {}
        }),
        table.column({
            header: "Amount",
            accessor: "amount",
            cell: ({ value }) => {
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD"
                }).format(value);
                return formatted;
            },
            plugins: {
                sort: {
                    disable: true
                }
            }
        }),
        table.column({
            header: "",
            accessor: ({ id }) => id,
            cell: (item) => {
                return createRender(Actions, { id: item.value });
            },
            plugins: {
                sort: {
                    disable: true
                }
            }
        })
    ]);

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } = table.createViewModel(columns);

    const { sortKeys } = pluginStates.sort;

    const { hiddenColumnIds } = pluginStates.hide;
    const ids = flatColumns.map((c) => c.id);
    let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

    $: $hiddenColumnIds = Object.entries(hideForId)
        .filter(([, hide]) => !hide)
        .map(([id]) => id);

    const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;

    console.log("hasNextPage", $hasNextPage);
    console.log("hasPreviousPage", $hasPreviousPage);
    console.log("pageIndex", $pageIndex);
    console.log("pageCount", $pageCount);
    console.log("pageSize", $pageSize);

    const { filterValue } = pluginStates.filter;

    const { selectedDataIds } = pluginStates.select;

    const hideableCols = ["status", "email", "amount"];
</script>

<div class="w-full">
    <div class="mb-4 flex items-center gap-4">
        <Input
            class="max-w-sm"
            placeholder="Filter emails..."
            type="text"
            bind:value={$filterValue}
            on:change={() => {
                getPayments();
            }}
        />
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
                <Button variant="outline" class="ml-auto" builders={[builder]}>
                    Columns
                    <!-- <ChevronDown class="ml-2 h-4 w-4" /> -->
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                {#each flatColumns as col}
                    {#if hideableCols.includes(col.id)}
                        <DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
                            {col.header}
                        </DropdownMenu.CheckboxItem>
                    {/if}
                {/each}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
    <div class="rounded-md border">
        <Table.Root {...$tableAttrs}>
            <Table.Header>
                {#each $headerRows as headerRow}
                    <Subscribe rowAttrs={headerRow.attrs()}>
                        <Table.Row>
                            {#each headerRow.cells as cell (cell.id)}
                                <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                                    <Table.Head {...attrs} class={cn("[&:has([role=checkbox])]:pl-3")}>
                                        {#if cell.id === "amount"}
                                            <div class="text-right">
                                                <Render of={cell.render()} />
                                            </div>
                                        {:else if cell.id === "email"}
                                            <Button variant="ghost" on:click={props.sort.toggle}>
                                                <Render of={cell.render()} />
                                                <!-- <CaretSort class={cn($sortKeys[0]?.id === cell.id && "text-foreground", "ml-2 h-4 w-4")} /> -->
                                            </Button>
                                        {:else}
                                            <Render of={cell.render()} />
                                        {/if}
                                    </Table.Head>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                    </Subscribe>
                {/each}
            </Table.Header>
            <Table.Body {...$tableBodyAttrs}>
                {#each $pageRows as row (row.id)}
                    <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                        <Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && "selected"}>
                            {#each row.cells as cell (cell.id)}
                                <Subscribe attrs={cell.attrs()} let:attrs>
                                    <Table.Cell class="[&:has([role=checkbox])]:pl-3" {...attrs}>
                                        {#if cell.id === "amount"}
                                            <div class="text-right font-medium">
                                                <Render of={cell.render()} />
                                            </div>
                                        {:else}
                                            <Render of={cell.render()} />
                                        {/if}
                                    </Table.Cell>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                    </Subscribe>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <div class="flex items-center justify-end space-x-2 py-4">
        <div class="flex-1 text-sm text-muted-foreground">
            {Object.keys($selectedDataIds).length} of {$rows.length} row(s) selected.
        </div>
        <Button variant="outline" size="sm" on:click={() => paginate(-1)} disabled={!$hasPreviousPage}>Previous</Button>
        <Button variant="outline" size="sm" disabled={!$hasNextPage} on:click={() => paginate(1)}>Next</Button>
    </div>
</div>

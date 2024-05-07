<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Pencil, X } from "lucide-svelte";
    import MimeType from "./mimeType.svelte";
    import { slide } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte";
    import { quintOut } from "svelte/easing";
    import { sleep } from "dx-utilities";

    export let preloadedFile;

    export let index: number;
    export let deleteFileEndpoint: string;
    export let updateFileNameEndpoint: string;

    let isNew = true;

    onMount(async () => {
        await sleep(1000);
        isNew = false;
    });

    let file = preloadedFile.sizes.original;
    if (preloadedFile.sizes.thumbnail) {
        file = preloadedFile.sizes.thumbnail;
    }

    const dispatch = createEventDispatcher();

    const removeFile = async (guid = "") => {
        const deleteResult = await fetch(deleteFileEndpoint, { method: "DELETE", body: JSON.stringify({ guid }) });

        if (deleteResult.ok) dispatch("deleted", { toRemoveIndex: index });
    };

    const processFileChange = async (guid = "") => {
        // TODO comment about editing actual file
        const updateResult = await fetch(updateFileNameEndpoint, {
            method: "PUT",
            body: JSON.stringify({ guid, displayName: "New name" })
        });

        if (updateResult.ok) dispatch("updated", { updatedIndex: index });
    };

    let humanReadableSize = "";
    let sizeInKb = preloadedFile.sizes.original.sizeInBytes / 1024;
    let sizeInMb = sizeInKb / 1024;
    let sizeInGb = sizeInMb / 1024;

    $: humanReadableSize =
        sizeInGb > 1
            ? `${Math.floor((sizeInGb / 10) * 10)} gb`
            : sizeInMb > 1
              ? `${Math.floor((sizeInMb / 10) * 10)} mb`
              : `${Math.floor((sizeInKb / 10) * 10)} kb`;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    on:dragstart|preventDefault|stopPropagation={() => {}}
    class="mt-1 flex w-full min-w-0 justify-between overflow-hidden rounded-xl bg-gray-200"
    transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: "y" }}>
    <div class="flex h-12 w-12 min-w-12 overflow-hidden">
        <MimeType {file}></MimeType>
    </div>
    <span class="items-left flex min-w-0 grow flex-col justify-center px-2 transition-colors duration-1000" class:bg-green-200={isNew}>
        <a href={file.url} target="_blank" class="truncate">
            {file.displayName}
        </a>
        <a href={file.url} target="_blank" class="truncate text-xs italic">{humanReadableSize} </a>
    </span>
    <span class="flex flex-nowrap items-center gap-1 px-2">
        <Button
            class="bg-tranparent hover:slate-800 border border-none border-slate-600 text-slate-600 hover:text-white"
            size="inline-icon"
            on:click={() => processFileChange(file.guid)}>
            <Pencil class="h-4 w-4" />
        </Button>
        <Button class="border-none" variant="destructive-outline" size="inline-icon" on:click={() => removeFile(file.objectIdentifier)}>
            <X class="h-4 w-4" />
        </Button>
    </span>
</div>

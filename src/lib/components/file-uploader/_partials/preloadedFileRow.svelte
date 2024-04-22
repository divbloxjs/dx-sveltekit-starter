<script>
    import { Button } from "$lib/components/ui/button/index.js";
    import { Pencil, X } from "lucide-svelte";
    import MimeType from "./mimeType.svelte";
    import { slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import { quintOut } from "svelte/easing";

    export let preloadedFiles;
    export let index;
    export let disable;
    export let deleteFileEndpoint;
    export let updateFileNameEndpoint;

    const dispatch = createEventDispatcher();

    const removeFile = async (guid = "") => {
        const deleteResult = await fetch(deleteFileEndpoint, { method: "DELETE", body: JSON.stringify({ guid }) });
        if (deleteResult.ok) dispatch("deleted", { toRemoveIndex: index });
    };

    const updateFileDisplayName = async (guid = "") => {
        const updateResult = await fetch(updateFileNameEndpoint, {
            method: "PUT",
            body: JSON.stringify({ guid, displayName: "New name" })
        });
        if (updateResult.ok) dispatch("updated", { updatedIndex: index });
    };

    let humanReadableSize = "";
    let sizeInKb = preloadedFiles[index].sizeInBytes / 1024;
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
    class="mt-1 flex w-full justify-between overflow-hidden rounded-xl bg-gray-200"
    transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: "y" }}
>
    <div class="flex h-12 w-12 min-w-12 overflow-hidden rounded-xl">
        <MimeType file={preloadedFiles[index]}></MimeType>
    </div>
    <span class="items-left flex min-w-0 grow flex-col justify-center bg-green-200 px-2">
        <a href={preloadedFiles[index].url} target="_blank" class="truncate">
            {preloadedFiles[index].displayName}
        </a>
        <a href={preloadedFiles[index].url} target="_blank" class="truncate text-xs italic">{humanReadableSize} </a>
    </span>
    <span class="flex flex-nowrap items-center gap-1 px-2">
        <Button
            class="bg-tranparent hover:slate-800 border border-slate-600 text-slate-600 hover:text-white"
            size="inline-icon"
            on:click={() => updateFileDisplayName(preloadedFiles[index].guid)}
        >
            <Pencil class="h-4 w-4" />
        </Button>
        <Button variant="destructive-outline" size="inline-icon" on:click={() => removeFile(preloadedFiles[index].guid)}>
            <X class="h-4 w-4" />
        </Button>
    </span>
</div>

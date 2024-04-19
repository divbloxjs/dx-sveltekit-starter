<script>
    import { Button } from "$lib/components/ui/button/index.js";
    import { Pencil, X } from "lucide-svelte";
    import MimeType from "./mimeType.svelte";
    import { fade, slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import { quintOut } from "svelte/easing";

    export let preloadedFiles;
    export let index;
    console.log(preloadedFiles[index]);
    export let deleteEndpoint = "api/file-upload/user-account";

    const dispatch = createEventDispatcher();

    const removeFile = async (guid = "") => {
        const deleteResult = await fetch(deleteEndpoint, { method: "DELETE", body: JSON.stringify({ guid }) });
        if (deleteResult.ok) dispatch("deleted", { toRemoveIndex: index });
    };

    let humanReadableSize = "";
    if (preloadedFiles[index].sizeInBytes < 1024) {
        humanReadableSize = `${humanReadableSize}kb`;
    } else if (preloadedFiles[index].sizeInBytes < 1024 * 1024) {
        humanReadableSize = `${Math.floor((preloadedFiles[index].sizeInBytes / 1024) * 10) / 10}mb`;
    }
</script>

<div
    class="mt-1 flex w-full justify-between overflow-hidden rounded-xl bg-gray-200"
    transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: "y" }}
>
    <div class="flex h-12 w-12 min-w-12 overflow-hidden rounded-xl">
        <MimeType file={preloadedFiles[index]}></MimeType>
    </div>
    <span class="flex min-w-0 grow items-center justify-between bg-green-200 px-2">
        <a href={preloadedFiles[index].url} target="_blank" class="truncate">{preloadedFiles[index].displayName} </a>
        <a href={preloadedFiles[index].url} target="_blank" class="truncate">{preloadedFiles[index].sizeInBytes} </a>
    </span>
    <span class="flex flex-nowrap items-center gap-1 px-2">
        <Button variant="outline" size="inline-icon" on:click={() => removeFile(preloadedFiles[index].guid)}>
            <Pencil class="h-4 w-4" />
        </Button>
        <Button variant="destructive-outline" size="inline-icon" on:click={() => removeFile(preloadedFiles[index].guid)}>
            <X class="h-4 w-4" />
        </Button>
    </span>
</div>

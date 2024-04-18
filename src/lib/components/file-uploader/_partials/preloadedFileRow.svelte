<script>
    import Button from "$lib/components/ui/button/index";
    import { Pencil, X } from "lucide-svelte";
    import MimeType from "../mimeType.svelte";
    import { fade, slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    export let preloadedFiles;
    export let index;

    const dispatch = createEventDispatcher();

    const removeFile = async (guid = "", toRemoveIndex) => {
        const deleteResult = await fetch("api/s3/upload-file", { method: "DELETE", body: JSON.stringify({ guid }) });
        dispatch("deleted", { toRemoveIndex: index });
    };

    console.log(preloadedFiles);
</script>

<div class="mt-1 flex w-full justify-between overflow-hidden rounded bg-gray-200" in:slide out:fade>
    <div class="flex h-12 w-12 min-w-12 overflow-hidden rounded bg-red-200">
        <MimeType file={preloadedFiles[index]}></MimeType>
    </div>
    <span class="flex min-w-0 grow items-center justify-between bg-green-200 px-2">
        <a href={preloadedFiles[index].url} target="_blank" class="truncate">{preloadedFiles[index].displayName} </a>
    </span>
    <span class="flex flex-nowrap items-center gap-1 bg-red-200 px-2">
        <Button variant="outline" size="inline-icon" on:click={() => removeFile(preloadedFiles[index].guid, index)}>
            <Pencil class="h-4 w-4" />
        </Button>
        <Button variant="destructive-outline" size="inline-icon" on:click={() => removeFile(preloadedFiles[index].guid, index)}>
            <X class="h-4 w-4" />
        </Button>
    </span>
</div>

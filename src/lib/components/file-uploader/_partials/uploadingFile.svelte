<script>
    import Button from "$lib/components/ui/button/button.svelte";
    import { LoaderCircle, Pencil, X } from "lucide-svelte";
    import { quintOut } from "svelte/easing";
    import { slide } from "svelte/transition";

    export let file;
    export let isTransferComplete;
    export let progress;
</script>

<div
    class="mt-1 flex w-full justify-between overflow-hidden rounded-xl bg-gray-200"
    transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: "y" }}
>
    <div class="flex h-12 w-12 min-w-12 overflow-hidden rounded-xl"></div>
    <span class="items-left flex min-w-0 grow flex-col justify-center bg-green-200 px-2">
        <span class="truncate">{file.name} </span>
        <div class="flex w-full items-center">
            {#if !isTransferComplete && progress === 100}
                <LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Processing...
            {:else}
                <span class="text-nowrap">{progress ?? 0} %</span>
                <progress
                    max="100"
                    value={progress ?? 0}
                    class="h-2 flex-grow pl-2 [&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:bg-violet-400"
                />
            {/if}
        </div>
    </span>
    <span class="flex flex-nowrap items-center gap-1 px-2">
        <Button variant="outline" size="inline-icon" disabled>
            <Pencil class="h-4 w-4" />
        </Button>
        <Button variant="destructive-outline" size="inline-icon" disabled>
            <X class="h-4 w-4" />
        </Button>
    </span>
</div>

<script>
    import { LoaderCircle } from "lucide-svelte";

    export let file;
    export let isTransferComplete;
    export let progress;
</script>

<div class="m-1 flex w-full flex-col rounded bg-gray-200 px-2 py-1">
    <div class="flex w-full justify-between">
        <span>{file.name} </span>
    </div>

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
</div>

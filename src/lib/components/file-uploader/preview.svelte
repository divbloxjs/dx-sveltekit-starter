<script>
    import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { pressEscapeAction } from "./escape.action";
    import { clickOutsideAction } from "./click-outside.action";
    import Button from "../ui/button/button.svelte";

    export let preloadedFiles;

    export let index = -1;
    let file;
    $: index, (file = preloadedFiles[index]);

    let fileType = "any";
    $: file,
        (() => {
            console.log(file);
            if (["mov", "mp4", "ogg", "webm"].includes(file?.uploadedFileExtension.toLowerCase())) {
                fileType = "video";
            } else if (
                ["image/apng", "image/png", "image/jpeg", "image/svg", "image/ico", "image/gif"].includes(file?.mimeType.toLowerCase())
            ) {
                fileType = "image";
            } else {
                fileType = "any";
            }

            console.log(fileType);
        })();

    let overlayEl;

    const handleNextFile = () => {
        if (index === preloadedFiles.length - 1) {
            index = 0;
        } else {
            index++;
        }
    };
    const handlePrevFile = () => {
        if (index === 0) {
            index = preloadedFiles.length - 1;
        } else {
            index--;
        }
    };
    const close = () => {
        index = -1;
    };
</script>

{#if index >= 0}
    <div
        bind:this={overlayEl}
        use:clickOutsideAction
        use:pressEscapeAction
        on:clickoutside={close}
        on:escapepress={close}
        class="fixed left-[50%] top-[50%] z-[9999] flex h-[100dvh] w-[100dvw] max-w-full justify-center rounded-lg bg-muted md:h-[80dvh] md:w-[80dvw]"
        style="transform: translate(-50%, -50%);">
        <div class="relative flex h-full w-full flex-row">
            {#if preloadedFiles.length > 1}
                <div class="absolute top-[50%] z-10">
                    <Button size="xl" class="mx-4" on:click={handlePrevFile}>
                        <ChevronLeft class="pointer-events-none" />
                    </Button>
                </div>
            {/if}
            <div class="flex flex-grow flex-col items-center justify-center pt-4">
                {#if fileType !== "any"}
                    <div class="flex w-full flex-row justify-center">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                            class="max-w-[20ch] truncate hover:cursor-pointer md:max-w-[40ch]"
                            on:click={async () => {
                                await navigator.clipboard.writeText(file?.displayName);
                                toast.success("Copied to clipboard");
                            }}>
                            {file?.displayName}
                        </div>

                        <button
                            class="btn btn-accent btn-xs ml-2"
                            on:click={() => {
                                window.open(`${file?.urls.original}`, "_blank");
                            }}>
                            <ExternalLink />
                        </button>
                    </div>
                {/if}
                {#if fileType === "image"}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <img class="bg-base-300 overflow-hidden rounded-lg object-contain p-6" src={file?.urls.web} />
                {:else if fileType === "video"}
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <video controls class="bg-base-300 w-full overflow-hidden rounded-lg p-4">
                        <source src={file?.urls.original} />
                    </video>
                {:else}
                    <div class="flex h-72 w-60 flex-col items-center justify-center rounded-lg p-4 md:w-96">
                        <div class=" max-w-[30ch] truncate hover:cursor-pointer">
                            {file?.displayName}
                        </div>
                        <Button
                            variant="primary"
                            size="xl"
                            class="mt-4 gap-2 text-lg md:text-xl"
                            on:click={() => {
                                window.open(`${file?.urls.original}`, "_blank");
                            }}>
                            Open <ExternalLink />
                        </Button>
                    </div>
                {/if}
            </div>

            {#if preloadedFiles.length > 1}
                <div class="absolute right-0 top-[50%] z-10">
                    <Button size="xl" class="mx-4" on:click={handlePrevFile}>
                        <ChevronRight class="pointer-events-none" />
                    </Button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<script lang="ts">
    import { Button } from "$lib/components/shadcn/ui/button";
    import Check from "lucide-svelte/icons/check";
    import Pencil from "lucide-svelte/icons/pencil";
    import X from "lucide-svelte/icons/x";
    import MimeType from "./mimeType.svelte";
    import { slide } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte";
    import { quintOut } from "svelte/easing";
    import { sleep } from "dx-utilities";
    import { Input } from "$lib/components/shadcn/ui/input";
    import { enhance } from "$app/forms";
    import { handleFormActionToast } from "$lib";
    import { focusTrap } from "$lib/actions/focus-trap.action";

    export let preloadedFile;
    $: preloadedFile;

    export let index: number;
    export let deleteFileEndpoint: string;
    export let updateFileNameEndpoint: string;

    const dispatch = createEventDispatcher();

    let isNew = true;

    onMount(async () => {
        await sleep(1000);
        isNew = false;
    });

    let file = preloadedFile;

    file.url = preloadedFile.urls.original;
    if (preloadedFile.sizes_saved.includes("thumbnail")) {
        file.url = preloadedFile.urls.thumbnail;
    }

    const removeFile = async () => {
        const deleteResult = await fetch(deleteFileEndpoint, { method: "DELETE", body: JSON.stringify({ id: file.id }) });

        if (deleteResult.ok) dispatch("deleted", { toRemoveIndex: index });
    };

    let updateDisplayNameFormEl: HTMLFormElement;
    let displayNameInputEl: HTMLInputElement;
    let isEditingDisplayName = false;
    let isEditingDisplayNameFocusTrapState = false;
    $: isEditingDisplayName, selectInput();

    const selectInput = async () => {
        await sleep(100); // Input needs to mount into the DOM...?

        if (isEditingDisplayNameFocusTrapState) displayNameInputEl?.select();
        isEditingDisplayNameFocusTrapState = !isEditingDisplayNameFocusTrapState;
    };

    let submittingUpdate = false;
    /**
     *  @type {import('./$types').SubmitFunction}
     */
    const submitDisplayNameUpdate = async ({ formData, cancel }) => {
        submittingUpdate = true;
        return async ({ result, update }) => {
            submittingUpdate = false;
            update();

            if (result.type === "success") {
                file.display_name = formData.get("display_name");
            }

            dispatch("updated", { updatedIndex: formData.get("id") });
            isEditingDisplayName = false;
            handleFormActionToast(result);
        };
    };

    let humanReadableSize = "";
    let sizeInKb = preloadedFile.original_size_in_bytes / 1024;
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
    class="mt-1 flex w-full min-w-0 justify-between overflow-hidden rounded-xl bg-background-200"
    transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: "y" }}>
    {#if isEditingDisplayName}
        <div class="flex h-12 w-12 min-w-12 overflow-hidden">
            <MimeType {file} />
        </div>
        <span
            class="items-left flex min-w-0 grow flex-col justify-center px-2 transition-colors duration-1000"
            class:bg-success={isNew}
            class:text-success-foreground={isNew}>
            <form
                bind:this={updateDisplayNameFormEl}
                action={`${updateFileNameEndpoint}`}
                method="POST"
                use:focusTrap={isEditingDisplayNameFocusTrapState}
                use:enhance={submitDisplayNameUpdate}>
                <Input bind:inputEl={displayNameInputEl} name="display_name" value={file.display_name} />
                <Input type="hidden" name="id" value={file.id} />
            </form>
        </span>

        <span class="flex flex-nowrap items-center gap-1 px-2">
            <Button
                class="hover:primary border border-none border-slate-600 bg-transparent text-slate-600 hover:text-white"
                size="inline-icon"
                on:click={() => {
                    updateDisplayNameFormEl?.requestSubmit();
                }}>
                <Check class="h-4 w-4" />
            </Button>
            <Button
                class="border-none"
                variant="destructive-outline"
                size="inline-icon"
                on:click={() => (isEditingDisplayName = !isEditingDisplayName)}>
                <X class="h-4 w-4" />
            </Button>
        </span>
    {:else}
        <div class="flex h-12 w-12 min-w-12 overflow-hidden">
            <MimeType {file} />
        </div>
        <span
            class="items-left flex min-w-0 grow flex-col justify-center px-2 transition-colors duration-1000"
            class:bg-success={isNew}
            class:text-success-foreground={isNew}>
            <a href={file.url} target="_blank" class="truncate">
                {file.display_name}
            </a>
            <a href={file.url} target="_blank" class="truncate text-xs italic">{humanReadableSize} </a>
        </span>

        <span class="flex flex-nowrap items-center gap-1 px-2">
            <Button
                class="border border-none bg-transparent text-foreground hover:bg-neutral hover:text-neutral-foreground"
                size="inline-icon"
                on:click={() => (isEditingDisplayName = !isEditingDisplayName)}>
                <Pencil class="h-4 w-4" />
            </Button>
            <Button class="border-none" variant="destructive-outline" size="inline-icon" on:click={() => removeFile()}>
                <X class="h-4 w-4" />
            </Button>
        </span>
    {/if}
</div>

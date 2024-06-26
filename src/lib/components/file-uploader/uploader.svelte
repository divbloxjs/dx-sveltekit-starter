<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { fade } from "svelte/transition";

    import InputFile from "$lib/components/shadcn/ui/input-file/input-file.svelte";
    import PreloadedFileRow from "./_partials/preloadedFileRow.svelte";
    import Button from "$lib/components/shadcn/ui/button/button.svelte";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import Preview from "./_partials/preview.svelte";

    const dispatch = createEventDispatcher();

    export let SINGLE_MAX_UPLOAD_SIZE = 10 * 1024 * 1024 * 1024;
    export let TOTAL_MAX_UPLOAD_SIZE = 2 * SINGLE_MAX_UPLOAD_SIZE;
    export let FILE_NUMBER_LIMIT: number = 3;

    export let replaceExistingFiles = false;
    export let accept = "";
    export let multiple = false;
    export let createThumbnailAndWebImages = true;
    export let uploadAsPublic = false;

    export let getFilesEndpoint: string | undefined;
    export let postFilesEndpoint: string;

    const fullUploadEndpoint = `${postFilesEndpoint}?createThumbnailAndWebImages=${createThumbnailAndWebImages}&uploadAsPublic=${uploadAsPublic}&replaceExistingFiles=${replaceExistingFiles}`;

    export let deleteFileEndpoint: string;
    export let updateFileNameEndpoint: string;

    let inputFileEl: HTMLInputElement;
    let files: FileList;
    export let preloadedFiles: [] = [];

    onMount(async () => {
        await refreshFiles();
    });

    const refreshFiles = async () => {
        if (!getFilesEndpoint) return;

        const response = await fetch(getFilesEndpoint);
        const result = await response.json();

        preloadedFiles = result?.files ?? [];
    };

    const handleChange = (event: Event) => {
        const target = event.target;

        if (!validateFileSize(target)) return;
        if (!validateFileNumber(target)) return;

        uploadNewFiles(target.files);
    };

    const validateFileSize = (target) => {
        if (target.files && target.files[0]) {
            let totalSize = 0;
            let maxSize = 0;
            let sizes = [];

            for (let i = 0; i < target.files.length; i++) {
                let file = target.files[i];

                totalSize = totalSize + file.size;
                sizes.push(file.size);
                if (file.size > SINGLE_MAX_UPLOAD_SIZE) {
                    removeInputFiles();
                    alert(`Choose max ${Math.round(SINGLE_MAX_UPLOAD_SIZE / 1024 / 1024)} mb files`);
                    target.value = "";
                    return false;
                }

                if (file.size > maxSize) maxSize = file.size;
            }

            if (totalSize > TOTAL_MAX_UPLOAD_SIZE) {
                removeInputFiles();
                alert(`Choose total ${Math.round(TOTAL_MAX_UPLOAD_SIZE / 1024 / 1024)} mb files`);
                target.value = "";

                return false;
            }
        }

        return true;
    };

    const validateFileNumber = (target) => {
        if (target.files && target.files[0]) {
            console.log(target.files);
            console.log(preloadedFiles);
        }

        return true;
    };

    let currentXHR: XMLHttpRequest;
    let isTransferComplete = false;
    let uploadingFiles = false;

    const uploadNewFiles = async (filesToUpload = []) => {
        hasTransferFailed = false;
        isTransferComplete = false;
        uploadingFiles = true;

        if (filesToUpload.length === 0) {
            inputFileEl.click();
            return;
        }

        currentXHR = new window.XMLHttpRequest();
        const formData = new FormData();

        for (let i = 0; i < filesToUpload.length; i++) {
            const guid = crypto.randomUUID();
            formData.append(guid, filesToUpload[i]);
        }

        currentXHR.upload.addEventListener("progress", updateProgress);
        currentXHR.addEventListener("load", transferComplete);
        currentXHR.addEventListener("error", transferFailed);
        currentXHR.addEventListener("abort", transferCanceled);

        currentXHR.open("POST", fullUploadEndpoint, true);

        currentXHR.send(formData);
    };

    //#region Request Handlers
    let percentComplete = 0;
    const updateProgress = (event) => {
        if (event.lengthComputable) {
            percentComplete = (event.loaded / event.total) * 100;
            percentComplete = Math.round(Math.min(percentComplete, 100));
        }
    };

    const transferComplete = async (evt) => {
        isTransferComplete = true;
        uploadingFiles = false;

        if (evt.currentTarget.status !== 200) {
            hasTransferFailed = true;
            return;
        }

        const newFiles = JSON.parse(evt.currentTarget.response).files;
        preloadedFiles = newFiles;

        await refreshFiles();
        removeInputFiles();
        dispatch("transferComplete");
    };

    let hasTransferFailed = false;
    const transferFailed = (evt) => {
        console.error("An error occurred while transferring the file");
        hasTransferFailed = true;
        uploadingFiles = false;
        dispatch("transferFailed");
    };

    const transferCanceled = (evt) => {
        console.log("The transfer has been canceled by the user");
        uploadingFiles = false;
        hasTransferFailed = true;
        dispatch("transferCanceled");
    };
    //#endregion

    const removeInputFiles = async () => {
        const dt = new DataTransfer();
        files = dt.files;
        inputFileEl.files = files;
    };

    //#region Dragging Handlers
    const handleDrop = (e) => {
        isDraggingOver = false;
        if (uploadingFiles) return;

        let newDataTransfer = e.dataTransfer;
        let droppedFiles = newDataTransfer.files;

        if (droppedFiles.length + preloadedFiles.length > FILE_NUMBER_LIMIT) return;

        const existingDataTransfer = new DataTransfer();

        for (let i = 0; i < droppedFiles.length; i++) {
            existingDataTransfer.items.add(droppedFiles[i]); // here you exclude the file. thus removing it.
        }

        files = existingDataTransfer.files; // Assign the updates list
        inputFileEl.files = files;

        uploadNewFiles(files);
    };

    let isDraggingOver = false;
    const handleDragOver = () => {
        if (uploadingFiles) return;
        isDraggingOver = true;
    };

    const handleDragEnter = () => {
        if (uploadingFiles) return;
        isDraggingOver = true;
    };
    const handleDragLeave = () => {
        if (uploadingFiles) return;
        isDraggingOver = false;
    };
    //#endregion

    let previewFileIndex = -1;
</script>

<svelte:window
    on:paste={(event) => {
        if (event.clipboardData.files.length > 0) {
            files = event.clipboardData.files;
            inputFileEl.files = event.clipboardData.files;
            uploadNewFiles(files);
        }
    }} />

<Preview {preloadedFiles} bind:index={previewFileIndex}></Preview>

<div class="relative h-full w-full overflow-hidden rounded-xl bg-background-100 p-2">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="flex w-full flex-col justify-center rounded-xl border-2 border-dashed border-blue-200 {uploadingFiles
            ? 'hover:cursor-no-drop'
            : 'hover:cursor-pointer'}"
        on:dragenter={() => (isDraggingOver = true)}>
        <div class="flex flex-col p-4 hover:cursor-default">
            <InputFile
                bind:inputFileEl
                name="fileToUpload"
                type="file"
                class="hidden"
                {accept}
                bind:files
                on:change={handleChange}
                {multiple} />
            {#if isDraggingOver}
                <span
                    class="absolute flex flex-col items-center justify-center self-center pt-5 text-center text-2xl"
                    in:fade={{ delay: 100, duration: 150 }}
                    out:fade={{ delay: 0, duration: 150 }}>
                    Drop to upload
                </span>
            {/if}
            {#if uploadingFiles}
                <span
                    class="absolute flex flex-col items-center justify-center self-center pt-5 text-center text-2xl"
                    in:fade={{ delay: 100, duration: 150 }}
                    out:fade={{ delay: 0, duration: 150 }}>
                    <div class="flex w-full flex-col items-center">
                        {#if !isTransferComplete && percentComplete === 100}
                            <LoaderCircle class="mr-2 h-8 w-8 animate-spin" /> Processing...
                        {:else}
                            <span class="text-nowrap">
                                Uploading
                                {#if files?.length === 1}
                                    file
                                {:else}
                                    files
                                {/if}
                                ...
                            </span>

                            <span class="mt-2 flex items-center text-base">
                                <span class="text-nowrap">{percentComplete ?? 0} %</span>
                                <progress
                                    max="100"
                                    value={percentComplete ?? 0}
                                    class="[&::-webkit-progress-bar]:bg-background-content h-2 flex-grow pl-2 [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:bg-primary" />
                            </span>
                        {/if}
                    </div>
                </span>
            {/if}
            {#if !hasTransferFailed}
                <span
                    class="mx-auto text-xl opacity-0 transition-opacity duration-100"
                    class:opacity-100={!isDraggingOver && !uploadingFiles}>
                    Drag and Drop
                </span>
                <span class="mx-auto opacity-0 transition-opacity duration-100" class:opacity-100={!isDraggingOver && !uploadingFiles}>
                    or
                </span>
                <div
                    class="flex w-full justify-center opacity-0 transition-opacity duration-100"
                    class:opacity-100={!isDraggingOver && !uploadingFiles}>
                    <Button
                        variant="default"
                        class="mx-auto mt-4 w-fit rounded-lg"
                        on:click={(e) => {
                            e.stopPropagation();
                            inputFileEl.click();
                        }}>Browse files</Button>
                </div>
            {:else}
                <span
                    class="mx-auto w-full animate-shake text-center text-xl text-destructive opacity-0 transition-opacity duration-100"
                    class:opacity-100={!isDraggingOver && !uploadingFiles}>
                    Something went wrong!
                </span>
                <span class="mx-auto opacity-0 transition-opacity duration-100" class:opacity-100={!isDraggingOver && !uploadingFiles}>
                    Click below to re-upload {files.length} file {files.length > 1 ? "s" : ""}</span>
                <Button
                    variant="default"
                    class="mx-auto mt-4 w-fit rounded-lg"
                    on:click={(e) => {
                        e.stopPropagation();
                        uploadNewFiles(files);
                    }}>Retry</Button>
            {/if}
        </div>

        <div class="w-full p-2 text-sm transition-all">
            {#each preloadedFiles ?? [] as preloadedFile, index}
                <PreloadedFileRow
                    {deleteFileEndpoint}
                    {updateFileNameEndpoint}
                    preloadedFile={preloadedFiles[index]}
                    {index}
                    on:clicked={(event) => {}}
                    on:updated={(event) => {
                        dispatch("updated", event.detail);
                    }}
                    on:deleted={(event) => {
                        preloadedFiles = JSON.parse(
                            JSON.stringify(preloadedFiles.filter((file, index) => index !== event.detail.toRemoveIndex))
                        );

                        preloadedFiles = preloadedFiles;
                        index = index;
                    }}>
                </PreloadedFileRow>
            {/each}
        </div>
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class:hidden={!isDraggingOver}
        class="absolute left-0 top-0 h-full w-full bg-background-300/20"
        on:drop|preventDefault|stopPropagation={handleDrop}
        on:dragenter|preventDefault|stopPropagation={handleDragEnter}
        on:dragover|preventDefault|stopPropagation={handleDragOver}
        on:dragleave|preventDefault|stopPropagation={handleDragLeave}>
    </div>
</div>

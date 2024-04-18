<script lang="ts">
    import Input from "../ui/input/input.svelte";
    import Label from "../ui/label/label.svelte";
    import { sleep } from "dx-utilities";
    import { enhance } from "$app/forms";
    import InputFile from "../ui/input-file/input-file.svelte";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import { getFileExtension } from "./functions";
    import MimeType from "./mimeType.svelte";
    import { Cross, LoaderCircle, Pencil, PencilIcon, X } from "lucide-svelte";
    import Button from "../ui/button/button.svelte";

    let inputFileEl: HTMLInputElement;
    let files: FileList;
    let preloadedFiles: [] = [];

    onMount(async () => {
        const response = await fetch("/api/s3/upload-file");
        const result = await response.json();

        preloadedFiles = result?.files ?? [];
        console.log("preloadedFiles", files);
    });

    const handleChange = (event) => {
        console.log(event);
    };

    let currentXHR = undefined;
    let isTransferComplete = false;
    const uploadNewFiles = async (filesToUpload = []) => {
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

        currentXHR.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const newFiles = JSON.parse(this.response).files;
                preloadedFiles.push(...newFiles);
                preloadedFiles = preloadedFiles;
                removeInputFiles();
            }
        };

        currentXHR.upload.addEventListener("progress", updateProgress);
        currentXHR.addEventListener("load", transferComplete);
        currentXHR.addEventListener("error", transferFailed);
        currentXHR.addEventListener("abort", transferCanceled);

        currentXHR.open("POST", "/api/s3/upload-file", true);

        currentXHR.send(formData);
    };

    //#region Request Handlers
    const progressArray = [];
    let percentComplete = 0;
    const updateProgress = (event) => {
        if (event.lengthComputable) {
            percentComplete = (event.loaded / event.total) * 100;
            // …
        } else {
            // Unable to compute progress information since the total size is unknown
        }

        let innerComplete = percentComplete;

        for (let i = 0; i < files.length; i++) {
            progressArray[i] = 0;
        }

        for (let i = 0; i < files.length; i++) {
            const uploadNumber = i + 1;
            if (i === 0) {
                progressArray[i] = Math.round(Math.min(percentComplete * files.length, 100));
                continue;
            }

            if (percentComplete > (100 * i) / files.length) {
                innerComplete = (percentComplete - (i / files.length) * 100) * uploadNumber;

                progressArray[i] = Math.round(Math.min(innerComplete * (files.length - i), 100));
            }
        }
    };

    const transferComplete = (evt) => {
        isTransferComplete = true;
    };

    const transferFailed = (evt) => {
        console.log("An error occurred while transferring the file.");
    };

    const transferCanceled = (evt) => {
        console.log("The transfer has been canceled by the user.");
    };
    //#endregion

    const removeFile = async (guid = "", toRemoveIndex) => {
        const deleteResult = await fetch("api/s3/upload-file", { method: "DELETE", body: JSON.stringify({ guid }) });
        if (deleteResult.ok) {
            preloadedFiles = preloadedFiles.filter((file, index) => index !== toRemoveIndex);
        }

        return;
    };

    const removeInputFiles = async () => {
        const dt = new DataTransfer();
        files = dt.files;
        inputFileEl.files = files;
    };

    //#region Dragging Handlers
    const handleDrop = (e) => {
        let newDataTransfer = e.dataTransfer;
        let droppedFiles = newDataTransfer.files;

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
        isDraggingOver = true;
    };

    const handleDragEnter = () => {
        isDraggingOver = true;
    };
    const handleDragLeave = () => {
        isDraggingOver = false;
    };
    //#endregion
</script>

<div class="h-full w-full overflow-hidden rounded bg-slate-400">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="m-[2px] flex flex-col justify-center rounded bg-slate-400 p-2 hover:cursor-pointer"
        class:ring-2={isDraggingOver}
        class:ring-black={isDraggingOver}
        on:click={() => inputFileEl.click()}
        on:drop|preventDefault|stopPropagation={handleDrop}
        on:dragenter|preventDefault|stopPropagation={handleDragEnter}
        on:dragover|preventDefault|stopPropagation={handleDragOver}
        on:dragleave|preventDefault|stopPropagation={handleDragLeave}
    >
        <div class="flex flex-col p-4 hover:cursor-default">
            <InputFile
                bind:inputFileEl
                name="fileToUpload"
                type="file"
                class="hidden"
                bind:files
                on:change={handleChange}
                on:input={handleChange}
                multiple={true}
            />

            <button type="submit" on:click|stopPropagation={() => uploadNewFiles(files)} class="mt-4">
                Drop and drop <br /> files here
            </button>
        </div>

        <div class="w-full" on:click|stopPropagation={() => {}}>
            {#each preloadedFiles ?? [] as fileInfo, index}
                <div class="mt-1 flex w-full justify-between overflow-hidden rounded bg-gray-200" in:slide out:fade>
                    <div class="flex h-12 w-12 min-w-12 overflow-hidden rounded bg-red-200">
                        <MimeType file={fileInfo}></MimeType>
                    </div>
                    <span class="flex min-w-0 grow items-center justify-between bg-green-200 px-2">
                        <a href={fileInfo.url} target="_blank" class="truncate">{fileInfo.displayName} </a>
                    </span>
                    <span class="flex flex-nowrap items-center gap-1 bg-red-200 px-2">
                        <Button variant="outline" size="inline-icon" on:click={() => removeFile(fileInfo.guid, index)}>
                            <Pencil class="h-4 w-4" />
                        </Button>
                        <Button variant="destructive-outline" size="inline-icon" on:click={() => removeFile(fileInfo.guid, index)}>
                            <X class="h-4 w-4" />
                        </Button>
                    </span>
                </div>
            {/each}

            {#each files ?? [] as file, index}
                <div class="m-1 flex w-full flex-col rounded bg-gray-200 px-2 py-1">
                    <div class="flex w-full justify-between">
                        <span>{file.name} </span>
                    </div>

                    <div class="flex w-full items-center">
                        {#if !isTransferComplete && progressArray[index] === 100}
                            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Processing...
                        {:else}
                            <span class="text-nowrap">{progressArray[index] ?? 0} %</span>
                            <progress
                                max="100"
                                value={progressArray[index] ?? 0}
                                class="h-2 flex-grow pl-2 [&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:bg-violet-400"
                            />
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- {#each preloadedFiles ?? [] as fileInfo, index}
        <div class="mt-1 flex w-[350px] justify-between overflow-hidden rounded bg-gray-200" in:slide out:fade>
            <div class="flex h-12 w-12 min-w-12 overflow-hidden rounded bg-red-200">
                <MimeType file={fileInfo}></MimeType>
            </div>
            <span class="flex min-w-0 grow items-center justify-between bg-green-200 px-2">
                <a href={fileInfo.url} target="_blank" class="truncate">{fileInfo.displayName} </a>
            </span>
            <span class="flex flex-nowrap items-center gap-1 bg-red-200 px-2">
                <Button variant="outline" size="inline-icon" on:click={() => removeFile(fileInfo.guid, index)}>
                    <Pencil class="h-4 w-4" />
                </Button>
                <Button variant="destructive-outline" size="inline-icon" on:click={() => removeFile(fileInfo.guid, index)}>
                    <X class="h-4 w-4" />
                </Button>
            </span>
        </div>
    {/each}

    {#each files ?? [] as file, index}
        <div class="m-1 flex w-[350px] flex-col rounded bg-gray-200 px-2 py-1">
            <div class="flex w-full justify-between">
                <span>{file.name} </span>
            </div>

            <div class="flex w-full items-center">
                {#if !isTransferComplete && progressArray[index] === 100}
                    Processing...
                {:else}
                    <span class="text-nowrap">{progressArray[index] ?? 0} %</span>
                    <progress
                        max="100"
                        value={progressArray[index] ?? 0}
                        class="h-2 flex-grow pl-2 [&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:bg-violet-400"
                    />
                {/if}
            </div>
        </div>
    {/each} -->
</div>

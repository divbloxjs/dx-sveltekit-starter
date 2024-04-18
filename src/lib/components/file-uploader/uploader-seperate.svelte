<script lang="ts">
    import { onMount } from "svelte";
    import InputFile from "../ui/input-file/input-file.svelte";

    let inputFileEl: HTMLInputElement;
    let files: FileList;
    let preloadedFiles: [] = [];

    onMount(async () => {
        const response = await fetch("/api/s3/presigned-url", { method: "POST", body: JSON.stringify({ bucketName: "", objectKey: "" }) });
        const result = await response.json();
        console.log(result);

        const currentXHR = new window.XMLHttpRequest();
        const formData = new FormData();

        const guid = crypto.randomUUID();
        formData.append(guid, "asdasd");

        currentXHR.upload.addEventListener("progress", () => {
            console.log("progress");
        });

        currentXHR.addEventListener("load", () => {
            console.log("load");
        });

        currentXHR.addEventListener("error", () => {
            console.log("error");
        });

        currentXHR.addEventListener("abort", () => {
            console.log("abort");
        });

        currentXHR.open("PUT", result.presignedUrl, true);

        currentXHR.send(formData);
    });

    const uploadFile = async (file) => {
        const response = await fetch("/api/s3/presigned-url", { method: "POST", body: JSON.stringify({ bucketName: "", objectKey: "" }) });
        const result = await response.json();
        console.log(result);

        const currentXHR = new window.XMLHttpRequest();
        const formData = new FormData();

        const guid = crypto.randomUUID();
        formData.append(guid, file);

        currentXHR.upload.addEventListener("progress", () => {
            console.log("progress");
        });

        currentXHR.addEventListener("load", () => {
            console.log("load");
        });

        currentXHR.addEventListener("error", () => {
            console.log("error");
        });

        currentXHR.addEventListener("abort", () => {
            console.log("abort");
        });

        currentXHR.open("PUT", result.presignedUrl, true);

        currentXHR.send(formData);
    };

    const handleChange = (event) => {
        console.log(event);
    };

    let startTime;
    let endTime;
    let currentXHR = undefined;

    let isTransferComplete = false;
    const uploadNewFiles = async (filesToUpload) => {
        await uploadFile(filesToUpload[0]);
        return;
        // 1. Create a new XMLHttpRequest object
        currentXHR = new window.XMLHttpRequest();
        const formData = new FormData();

        for (let i = 0; i < filesToUpload.length; i++) {
            const guid = crypto.randomUUID();
            formData.append(guid, filesToUpload[i]);
            // previewFile(guid);
        }

        currentXHR.upload.addEventListener("progress", updateProgress);
        currentXHR.addEventListener("load", transferComplete);
        currentXHR.addEventListener("error", transferFailed);
        currentXHR.addEventListener("abort", transferCanceled);

        currentXHR.open("POST", "/api/s3/upload-file", true);

        startTime = performance.now();
        // 3. Send the request over the network
        currentXHR.send(formData);

        // setTimeout(() => {
        //     currentXHR.abort();
        // }, 400);
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
        console.log("The transfer is complete.", evt);
        endTime = performance.now();
        console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
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
        currentXHR?.abort();
        const deleteResult = await fetch("api/s3/upload-file", { method: "DELETE", body: JSON.stringify({ guid }) });
        preloadedFiles = preloadedFiles.filter((file, index) => index !== toRemoveIndex);
        return;
    };

    //#region Dragging Handlers
    const handleDrop = (e) => {
        let newDataTransfer = e.dataTransfer;
        let droppedFiles = newDataTransfer.files;

        const existingDataTransfer = new DataTransfer();

        for (let i = 0; i < droppedFiles.length; i++) {
            existingDataTransfer.items.add(droppedFiles[i]); // here you exclude the file. thus removing it.
            // previewFile(droppedFiles[i]);
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

<div class="h-full w-full">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="flex h-52 w-52 justify-center rounded bg-slate-400 hover:cursor-pointer"
        class:ring-2={isDraggingOver}
        class:ring-black={isDraggingOver}
        on:click={() => inputFileEl.click()}
        on:drop|preventDefault|stopPropagation={handleDrop}
        on:dragenter|preventDefault|stopPropagation={handleDragEnter}
        on:dragover|preventDefault|stopPropagation={handleDragOver}
        on:dragleave|preventDefault|stopPropagation={handleDragLeave}
    >
        <div class="flex flex-col p-4">
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
    </div>

    {#each preloadedFiles ?? [] as fileInfo, index}
        <div class="mt-1 flex w-52 justify-between rounded bg-gray-200 px-2 py-1" transition:slide>
            <!-- <span>{getFileExtension(fileInfo.url)}</span> -->
            <a href={fileInfo.url} target="_blank">{fileInfo.displayName} </a>
            <span>
                <button on:click={() => removeFile(index)}>e</button>
                <button on:click={() => removeFile(fileInfo.guid, index)}>x</button>
            </span>
        </div>
    {/each}

    {#each files ?? [] as file, index}
        <div class="m-1 flex w-52 flex-col rounded bg-gray-200 px-2 py-1">
            <div class="flex w-full justify-between">
                <span>{file.name} </span>
                {#if progressArray[index] === 100}
                    <button on:click={() => removeFile(fileInfo.guid, index)}>x</button>
                {:else}
                    <!-- <button on:click={() => cancelUpload(index)}>cancel</button> -->
                {/if}
            </div>

            <div class="flex w-full items-center">
                <span class="text-nowrap">{progressArray[index] ?? 0} %</span>
                <progress
                    max="100"
                    value={progressArray[index] ?? 0}
                    class="h-2 flex-grow pl-2 [&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:bg-violet-400"
                />
                {#if !isTransferComplete && progressArray[index] === 100}
                    Final Processing...
                {/if}
            </div>
        </div>
    {/each}
</div>

<script lang="ts">
    import InputFile from "../ui/input-file/input-file.svelte";
    import { onMount } from "svelte";
    import PreloadedFileRow from "./_partials/preloadedFileRow.svelte";
    import UploadingFile from "./_partials/uploadingFile.svelte";

    export let SINGLE_MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
    export let TOTAL_MAX_UPLOAD_SIZE = 2 * SINGLE_MAX_UPLOAD_SIZE;

    let inputFileEl: HTMLInputElement;
    let files: FileList;
    let preloadedFiles: [] = [];

    onMount(async () => {
        const response = await fetch("/api/file-upload/user-account?id=1");
        const result = await response.json();
        preloadedFiles = result?.files ?? [];
    });

    const handleChange = (event) => {
        const target = event.target;
        if (target.files && target.files[0]) {
            let totalSize = 0;
            let maxSize = 0;
            let sizes = [];
            console.log("target.files", target.files);

            for (let i = 0; i < target.files.length; i++) {
                let file = target.files[i];
                console.log("file.size", file.size);

                totalSize = totalSize + file.size;
                sizes.push(file.size);
                if (file.size > SINGLE_MAX_UPLOAD_SIZE) {
                    alert(`Choose max ${Math.round(TOTAL_MAX_UPLOAD_SIZE / 1023 / 1024)}mb files`);
                    target.value = "";
                    return;
                }
                if (file.size > maxSize) maxSize = file.size;
            }

            console.log("totalSize", totalSize);

            if (totalSize > TOTAL_MAX_UPLOAD_SIZE) {
                alert(`Choose total ${Math.round(TOTAL_MAX_UPLOAD_SIZE / 1023 / 1024)}mb files`);
                target.value = "";
            }
        }
    };

    let currentXHR = undefined;
    let isTransferComplete = false;
    let uploadingFiles = false;
    const uploadNewFiles = async (filesToUpload = []) => {
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

        currentXHR.open("POST", "/api/file-upload/user-account?id=1", true);

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
        uploadingFiles = false;
    };

    const transferFailed = (evt) => {
        uploadingFiles = false;
        console.log("An error occurred while transferring the file.");
    };

    const transferCanceled = (evt) => {
        uploadingFiles = false;
        console.log("The transfer has been canceled by the user.");
    };
    //#endregion

    const removeInputFiles = async () => {
        const dt = new DataTransfer();
        files = dt.files;
        inputFileEl.files = files;
    };

    //#region Dragging Handlers
    const handleDrop = (e) => {
        if (uploadingFiles) return;
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
</script>

<div class="h-full w-full overflow-hidden rounded bg-slate-400">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="cursor- m-[2px] flex flex-col justify-center rounded bg-slate-400 p-2 {uploadingFiles
            ? 'hover:cursor-no-drop'
            : 'hover:cursor-pointer'}"
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
                Click or drop <br /> files here
            </button>
        </div>

        <div class="w-full text-sm" on:click|stopPropagation={() => {}}>
            {#each preloadedFiles ?? [] as _, index}
                <PreloadedFileRow
                    bind:preloadedFiles
                    {index}
                    on:deleted={(event) => {
                        preloadedFiles = preloadedFiles.filter((file, index) => index !== event.detail.toRemoveIndex);
                    }}
                ></PreloadedFileRow>
            {/each}

            {#each files ?? [] as file, index}
                <UploadingFile {file} {isTransferComplete} progress={progressArray[index]}></UploadingFile>
            {/each}
        </div>
    </div>
</div>

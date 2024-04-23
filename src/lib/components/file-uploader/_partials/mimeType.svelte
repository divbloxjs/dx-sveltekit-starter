<script>
    import { getFileExtension } from "../functions";

    export let file;
    const isImage = file.mimeType.includes("image/");
</script>

<div class="flex h-full w-full justify-center" class:items-center={!isImage} class:bg-gray-300={!isImage}>
    {#if isImage}
        <img src={file.url} alt={file.displayName} class="w-full object-fill" />
    {:else}
        {@const fileType = file.mimeType.substring(0, file.mimeType.indexOf("/"))}
        {@const fileExtension = getFileExtension(file.displayName)}
        {#if fileExtension.length < 10}
            {fileExtension}
        {:else}
            {fileType.substr(0, 3)}
        {/if}
    {/if}
</div>

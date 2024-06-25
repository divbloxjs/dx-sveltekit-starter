<script>
    import { getFileExtension } from "../functions";

    export let file;
    const isImage = file.mime_type.includes("image/");
</script>

<div class="flex h-full w-full justify-center" class:items-center={!isImage} class:bg-gray-300={!isImage}>
    {#if isImage}
        <img src={file.url} alt={file.display_name} class="w-full object-fill" />
    {:else}
        {@const fileType = file.mime_type.substring(0, file.mime_type.indexOf("/"))}
        {@const fileExtension = getFileExtension(file.display_name)}
        {#if fileExtension.length < 10}
            {fileExtension}
        {:else}
            {fileType.substr(0, 3)}
        {/if}
    {/if}
</div>

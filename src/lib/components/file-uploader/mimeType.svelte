<script>
    import { getFileExtension } from "./functions";

    export let file;
</script>

<div class="flex h-full w-full items-center justify-center">
    {#if file.mimeType.includes("image")}
        <img src={file.url} alt={file.displayName} width="100%" height="100%" />
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

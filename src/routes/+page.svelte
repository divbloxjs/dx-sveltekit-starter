<script>
    import PreloadedFileRow from "$lib/components/file-uploader/_partials/preloadedFileRow.svelte";
    import UploadingFile from "$lib/components/file-uploader/_partials/uploadingFile.svelte";
    import Uploader from "$lib/components/file-uploader/uploader.svelte";
</script>

<div class="flex h-full w-full items-center justify-center">
    <div class="w-[400px] overflow-y-auto">
        <Uploader
            getFilesEndpoint="/api/file-upload/user-account?id=1"
            postFilesEndpoint="/api/file-upload/user-account?id=1"
            deleteFileEndpoint="api/file-upload/user-account"
            updateFileNameEndpoint="api/file-upload">
        </Uploader>
    </div>
</div>

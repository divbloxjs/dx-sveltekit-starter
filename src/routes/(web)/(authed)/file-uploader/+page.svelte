<script>
    import Uploader from "$lib/components/file-uploader/uploader.svelte";
    import { getContext } from "svelte";

    const pageTitle = getContext("pageTitle");
    $pageTitle = "";
</script>

<div class="flex h-full w-full items-center justify-center">
    <div class="w-[400px] overflow-y-auto">
        <Uploader
            getFilesEndpoint="/api/file-upload/user-account?id=1&category=profilePicture"
            postFilesEndpoint="/api/file-upload/user-account?id=1"
            deleteFileEndpoint="api/file-upload/user-account"
            updateFileNameEndpoint="api/file-upload">
        </Uploader>
    </div>
</div>

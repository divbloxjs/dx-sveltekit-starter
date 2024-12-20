<script>
    import { Button } from "$lib/components/shadcn/ui/button";
    import Uploader from "./uploader.svelte";
    import PlaceholderImage from "$lib/assets/images/profile-placeholder.svg";
    import { FILE_CATEGORY } from "$lib/constants/constants";

    let preloadedFiles = [];
    let viewOnly = true;
    const toggleView = () => {
        viewOnly = !viewOnly;
    };

    let displayUrl;
    $: preloadedFiles[0]?.urls?.thumbnail,
        (() => {
            displayUrl = preloadedFiles[0]?.urls?.thumbnail ?? PlaceholderImage;
        })();
</script>

{#if viewOnly}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="mx-auto flex h-40 w-40 overflow-hidden rounded-full sm:h-48 sm:w-48" on:click={toggleView}>
        <img
            class="w-full object-cover transition-all duration-500 hover:cursor-pointer hover:brightness-50"
            src={displayUrl}
            alt="profile" />
    </div>
    <Button class="mx-auto w-full max-w-xs" variant="link" on:click={toggleView}>Edit</Button>
{/if}
<div class:hidden={viewOnly} class="mx-auto w-56 sm:w-72">
    <Uploader
        multiple={false}
        replaceExistingFiles={true}
        bind:preloadedFiles
        FILE_NUMBER_LIMIT={1}
        on:updated={toggleView}
        on:transferComplete={toggleView}
        getFilesEndpoint={`/api/file-upload/user-account?category=${FILE_CATEGORY.PROFILE_PICTURE}`}
        postFilesEndpoint="/api/file-upload/user-account"
        deleteFileEndpoint="api/file-upload/user-account"
        updateFileNameEndpoint="api/file-upload"
        {...$$restProps}>
    </Uploader>
    <Button class="mx-auto w-full max-w-xs" variant="link" on:click={toggleView}>Cancel</Button>
</div>

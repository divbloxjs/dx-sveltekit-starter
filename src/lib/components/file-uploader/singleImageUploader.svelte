<script>
    import Button from "../ui/button/button.svelte";
    import Uploader from "./uploader.svelte";

    let preloadedFiles = [];
    let viewOnly = true;
    const toggleView = () => {
        viewOnly = !viewOnly;
    };

    $: displayUrl = preloadedFiles[0]?.urls?.thumbnail ?? "";

    $: preloadedFiles,
        (() => {
            displayUrl = preloadedFiles[0]?.urls?.thumbnail ?? "";
        })();
</script>

{#if viewOnly}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="mx-auto flex h-56 w-56 overflow-hidden rounded-full sm:h-72 sm:w-72" on:click={toggleView}>
        <img class="transition-all duration-500 hover:cursor-pointer hover:brightness-50" src={displayUrl} alt="profile" />
    </div>
    <Button class="mx-auto w-full max-w-xs" on:click={toggleView}>Edit</Button>
{:else}
    <Uploader
        bind:preloadedFiles
        getFilesEndpoint="/api/file-upload/user-account?id=1&category=Profile_Picture"
        postFilesEndpoint="/api/file-upload/user-account?id=1"
        deleteFileEndpoint="api/file-upload/user-account"
        updateFileNameEndpoint="api/file-upload"
        {...$$restProps}>
    </Uploader>

    <Button on:click={toggleView}>Confirm</Button>
{/if}

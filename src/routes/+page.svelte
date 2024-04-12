<script lang="ts">
    import Testing from "$lib/components/forms/testing.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    export let dialogOpen = false;
</script>

<button on:click={() => (dialogOpen = true)}>Open Dialog</button>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Overlay class="bg-black"></Dialog.Overlay>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
            <Dialog.Description>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </Dialog.Description>
        </Dialog.Header>
        <Testing></Testing>
    </Dialog.Content>
</Dialog.Root>
<div class="h-[110vh] w-full bg-red-300">qweqwe</div>

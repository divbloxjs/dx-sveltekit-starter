<script lang="ts">
    import { Dialog } from "bits-ui";
    let dialogOpen = false;

    let onOpenChange = (open) => {
        console.log("dialogOpen", dialogOpen);
    };
</script>

<button on:click={() => (dialogOpen = true)}>Open Dialog</button>
<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger />
    <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
            <Dialog.Title />
            <Dialog.Description />
            <Dialog.Close />
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>

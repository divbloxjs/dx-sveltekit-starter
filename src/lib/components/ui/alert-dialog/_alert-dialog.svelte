<script>
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { createEventDispatcher } from "svelte";
    import { buttonVariants } from "../button";

    export let open = false;
    export let title;
    export let description;

    export let showCancelButton = true;
    export let showActionButton = true;

    export let formToSubmit;
    const dispatch = createEventDispatcher();
</script>

<AlertDialog.Root bind:open closeOnOutsideClick={true}>
    <AlertDialog.Content class="">
        <AlertDialog.Header>
            <AlertDialog.Title>{title}</AlertDialog.Title>
            <AlertDialog.Description>
                {description}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            {#if showCancelButton}
                <AlertDialog.Cancel
                    class={buttonVariants({ variant: "outline" })}
                    on:click={() => {
                        console.log("Cancel");
                        dispatch("cancel");
                    }}>
                    Cancel
                </AlertDialog.Cancel>
            {/if}
            {#if showActionButton}
                <AlertDialog.Action
                    class={buttonVariants({ variant: "destructive" })}
                    on:click={() => {
                        dispatch("action");
                        formToSubmit?.requestSubmit();
                        console.log("action");
                    }}>Delete</AlertDialog.Action>
            {/if}
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

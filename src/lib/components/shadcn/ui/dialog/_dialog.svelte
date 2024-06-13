<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";
    import * as Dialog from "$lib/components/shadcn/ui/dialog";
    import { Input } from "$lib/components/shadcn/ui/input";
    import { Label } from "$lib/components/shadcn/ui/label";

    export let title = "Dialog Title";
    export let description = "Make changes to your profile here. Click save when you're done";

    export let open = false;
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
        </Dialog.Header>

        <slot />

        <!-- <Dialog.Footer>
            <Button type="submit">Save changes</Button>
        </Dialog.Footer> -->
    </Dialog.Content>
</Dialog.Root>

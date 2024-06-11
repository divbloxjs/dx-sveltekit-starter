<script>
    import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
    import { buttonVariants } from "$lib/components/shadcn/ui/button/index.js";
    import { cn } from "$lib/components/shadcn/utils.js";
    let className = undefined;
    export { className as class };
</script>

<AlertDialogPrimitive.Action class={cn(buttonVariants(), className)} {...$$restProps} on:click on:keydown let:builder>
    <slot {builder} />
</AlertDialogPrimitive.Action>

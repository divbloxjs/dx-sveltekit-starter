<script>
    import { getFormControl } from "formsnap";
    import { cn } from "$lib/components/shadcn/utils.js";
    import { Label } from "$lib/components/shadcn/ui/label";
    let className = undefined;
    export { className as class };
    const { labelAttrs } = getFormControl();
</script>

<!-- data-[fs-error]:text-destructive -->
<Label {...$labelAttrs} class={cn("", className)} {...$$restProps}>
    <slot {labelAttrs} />
</Label>

<script>
    import { getFormControl } from "formsnap";
    import { cn } from "$lib/utils.js";
    import { Label } from "$lib/components/ui/label/index.js";
    let className = undefined;
    export { className as class };
    const { labelAttrs } = getFormControl();
</script>

<!-- data-[fs-error]:text-destructive -->
<Label {...$labelAttrs} class={cn("", className)} {...$$restProps}>
    <slot {labelAttrs} />
</Label>

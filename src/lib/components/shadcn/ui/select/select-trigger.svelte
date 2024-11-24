<script>
    import { Select as SelectPrimitive } from "bits-ui";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { cn } from "$lib/components/shadcn/utils.js";
    let className = undefined;
    export { className as class };

    let focusClasses = `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`;
    let disabledClasses = `disabled:cursor-not-allowed disabled:opacity-50`;
    let errorClasses = `data-[fs-error]:border-destructive data-[fs-error]:outline-destructive`;
    let highlightedClasses = `data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground`;
</script>

<SelectPrimitive.Trigger
    class={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground [&>span]:line-clamp-1",
        focusClasses,
        disabledClasses,
        errorClasses,
        className
    )}
    {...$$restProps}
    let:builder
    on:click
    on:keydown>
    <slot {builder} />
    <div>
        <ChevronDown class="h-4 w-4 opacity-50" />
    </div>
</SelectPrimitive.Trigger>

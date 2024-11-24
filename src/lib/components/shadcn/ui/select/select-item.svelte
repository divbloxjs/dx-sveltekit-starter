<script>
    import Check from "lucide-svelte/icons/check";
    import { Select as SelectPrimitive } from "bits-ui";
    import { cn } from "$lib/components/shadcn/utils.js";

    export let value;
    export let label = undefined;
    export let disabled = undefined;

    let className = undefined;
    export { className as class };

    let disabledClasses = `disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:pointer-events-none`;
    let highlightedClasses = `data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground`;
</script>

<SelectPrimitive.Item
    {value}
    {disabled}
    {label}
    class={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-7 pr-2 text-sm outline-none",
        highlightedClasses,
        disabledClasses,
        className
    )}
    {...$$restProps}
    on:click
    on:keydown
    on:focusin
    on:focusout
    on:pointerleave
    on:pointermove>
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
            <Check class="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
    </span>
    <slot>
        {label || value}
    </slot>
</SelectPrimitive.Item>

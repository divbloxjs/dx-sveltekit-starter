<script>
    import { cn } from "$lib/shadcn/utils.js";
    let className = undefined;
    export { className as class };
</script>

<div class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...$$restProps}>
    <slot />
</div>

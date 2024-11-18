<script>
    import { cn } from "$lib/components/shadcn/utils.js";
    let className = undefined;
    export { className as class };
</script>

<div class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...$$restProps} on:click>
    <slot />
</div>

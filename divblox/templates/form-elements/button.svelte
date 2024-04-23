<script>
    import { buttonVariants } from "./button.js";
    import { cn } from "$lib/utils.js";
    let className = undefined;
    export let variant = "default";
    export let size = "default";
    export { className as class };
</script>

<button class={cn(buttonVariants({ variant, size, className }))} type="button" {...$$restProps} on:click on:keydown>
    <slot />
</button>

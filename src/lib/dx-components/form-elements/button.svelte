<script>
    import { buttonVariants } from "./button.js";
    import { cn } from "$lib/utils.js";
    import { LoaderCircle } from "lucide-svelte";
    let className = undefined;
    export let variant = "default";
    export let size = "default";
    export { className as class };
    export let loading = false;
</script>

<button class={cn(buttonVariants({ variant, size, className }))} type="button" {...$$restProps} on:click on:keydown>
    {#if loading}
        <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
    {/if}
    <slot />
</button>

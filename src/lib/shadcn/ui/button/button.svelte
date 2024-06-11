<script>
    import { Button as ButtonPrimitive } from "bits-ui";
    import { buttonVariants } from "./index.js";
    import { cn } from "$lib/shadcn/utils.js";
    import { LoaderCircle } from "lucide-svelte";
    let className = undefined;
    export let variant = "default";
    export let size = "default";
    export let builders = [];
    export { className as class };
    export let loading = false;
</script>

<ButtonPrimitive.Root
    {builders}
    class={cn(buttonVariants({ variant, size, className }))}
    type="button"
    {...$$restProps}
    on:click
    on:keydown>
    {#if loading}
        <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
    {/if}
    <slot />
</ButtonPrimitive.Root>

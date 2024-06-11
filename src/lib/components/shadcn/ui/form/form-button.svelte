<script>
    import * as Button from "$lib/components/shadcn/ui/button/index.js";
</script>

<Button.Root type="submit" on:click on:keydown {...$$restProps}>
    <slot />
</Button.Root>

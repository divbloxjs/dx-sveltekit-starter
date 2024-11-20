<script>
    import { cn } from "$lib/components/shadcn/utils.js";

    export let value = undefined;
    export let files = undefined;
    export let inputFileEl = undefined;
    export let readonly = undefined;

    let className = undefined;
    export { className as class };

    let focusClasses = `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`;
    let disabledClasses = `disabled:cursor-not-allowed disabled:opacity-50`;
    let errorClasses = `data-[fs-error]:border-destructive data-[fs-error]:outline-destructive`;
    let fileClasses = `file:border-0 file:bg-transparent file:text-sm file:font-medium`;
</script>

<input
    class={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
        focusClasses,
        disabledClasses,
        fileClasses,
        className
    )}
    bind:this={inputFileEl}
    bind:value
    bind:files
    type="file"
    {readonly}
    on:blur
    on:change
    on:click
    on:focus
    on:focusin
    on:focusout
    on:keydown
    on:keypress
    on:keyup
    on:mouseover
    on:mouseenter
    on:mouseleave
    on:paste
    on:input
    on:wheel
    {...$$restProps} />

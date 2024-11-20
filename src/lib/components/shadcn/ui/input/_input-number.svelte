<!-- DX-NOTE: Copy of the `input.svelte` component, with hard-coded type="number" -->
<!-- Used because for some reason having a dynamic type makes superForms coerce the input value into a string -->
<script>
    import { cn } from "$lib/components/shadcn/utils.js";

    export let value = undefined;
    export let readonly = undefined;
    export let inputEl = undefined;

    let className = undefined;
    export { className as class };

    let focusClasses = `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`;
    let disabledClasses = `disabled:cursor-not-allowed disabled:opacity-50`;
    let errorClasses = `data-[fs-error]:border-destructive data-[fs-error]:outline-destructive`;
    let fileClasses = `file:border-0 file:bg-transparent file:text-sm file:font-medium`;
</script>

<input
    class={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
        focusClasses,
        disabledClasses,
        errorClasses,
        fileClasses,
        className
    )}
    bind:this={inputEl}
    bind:value
    type="number"
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

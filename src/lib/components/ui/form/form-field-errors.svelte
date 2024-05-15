<script>
    import * as FormPrimitive from "formsnap";
    import { cn } from "$lib/utils.js";
    let className = undefined;
    export { className as class };
    export let errorClasses = undefined;
</script>

<FormPrimitive.FieldErrors
    class={cn("absolute right-0 top-1 text-xs font-medium italic text-destructive", className)}
    {...$$restProps}
    let:errors
    let:fieldErrorsAttrs
    let:errorAttrs>
    <slot {errors} {fieldErrorsAttrs} {errorAttrs}>
        {#each errors as error}
            <div {...errorAttrs} class={cn(errorClasses)}>{error}</div>
        {/each}
    </slot>
</FormPrimitive.FieldErrors>

<script lang="ts" context="module"></script>

<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPath<T>">
    import * as FormPrimitive from "formsnap";
    import { cn } from "$lib/components/shadcn/utils.js";
    export let form;
    export let name;
    let className: string | undefined = undefined;
    export { className as class };
</script>

<FormPrimitive.Field {form} {name} let:constraints let:errors let:tainted let:value>
    <div class={cn("relative my-1 space-y-1 p-1", className)}>
        <slot {constraints} {errors} {tainted} {value} />
    </div>
</FormPrimitive.Field>

<script>
    import "../app.pcss";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/components/shadcn/ui/sonner";
</script>

<ModeWatcher />
<Toaster richColors />

<div class="flex h-full w-full flex-col">
    <slot />
</div>

<script>
    import "../app.pcss";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/shadcn/ui/sonner";

    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };
</script>

<ModeWatcher />
<Toaster richColors closeButton />

<div class="flex h-full w-full flex-col">
    <slot />
</div>

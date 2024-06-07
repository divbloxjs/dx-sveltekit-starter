<script>
    import "../app.pcss";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/components/ui/sonner";
    import { browser } from "$app/environment";

    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };
</script>

<ModeWatcher />
<Toaster richColors closeButton />

<slot />

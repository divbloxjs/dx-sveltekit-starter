<script>
    import "../app.pcss";
    import { initializeApp } from "firebase/app";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/components/ui/sonner";
    import { toast } from "svelte-sonner";
    import { firebaseConfig, initFirebase } from "$lib/firebase";
    import { getMessaging, getToken, onMessage } from "firebase/messaging";
    import { onMount } from "svelte";
    import { PUBLIC_VAPID_KEY } from "$env/static/public";
    import { browser } from "$app/environment";

    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };
</script>

<ModeWatcher />
<Toaster richColors />

<slot />

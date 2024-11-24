<script>
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { enhance } from "$app/forms";

    import { initFirebase, firebaseMessaging, serviceWorkerRegistration } from "$lib/firebase.js";
    import { getToken, onMessage } from "firebase/messaging";

    import { Button } from "$lib/components/shadcn/ui/button";

    import { pushNotificationUniqueIdentifier } from "./stores";
    import * as Tooltip from "$lib/components/shadcn/ui/tooltip";
    import { toast } from "svelte-sonner";
    import { checkFormActionResultStatus, handleFormActionToast } from "$lib";
    import CircleHelp from "lucide-svelte/icons/circle-help";
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input } from "$lib/components/shadcn/ui/input";
    import AppLogo from "$lib/components/app-images/app-logo.svelte";

    import * as Card from "$lib/components/shadcn/ui/card";
    import { env } from "$env/dynamic/public";
    import { getContext } from "svelte";
    import { goto } from "$app/navigation";

    const pageTitle = getContext("pageTitle");
    $pageTitle = "";

    export let data;

    onMount(async () => {
        if (!browser) return;

        await initFirebase();

        onMessage(firebaseMessaging, (payload) => {
            console.log("Message received. ", payload);
            // ...
        });
    });

    let submittingAccept = false;
    let submittingIgnore = false;
    let submittingTest = false;

    /**
     *  @type {import('./$types').SubmitFunction}
     */
    const submitAccept = async ({ formData, cancel }) => {
        submittingAccept = true;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            toast.error("Notification permissions are disabled", {
                description: "Please re-enable notifications on your browser for this site and try again"
            });
            submittingAccept = false;
            return;
        }

        try {
            const existingPushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

            // Store the received token
            const pushSubscriptionDetails = await serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: env.PUBLIC_VAPID_KEY
            });

            formData.append("pushSubscriptionDetailsString", JSON.stringify(pushSubscriptionDetails));
        } catch (error) {
            submittingAccept = false;

            console.error("Error storing token:", error);
            cancel();
        }

        return async ({ result, update }) => {
            update();

            handleFormActionToast(result);

            $pushNotificationUniqueIdentifier = result?.data?.pushSubscription?.uniqueIdentifier ?? "";
            submittingAccept = false;
            window.history.back();
        };
    };

    /**
     *  @type {import('./$types').SubmitFunction}
     */
    const submitIgnore = async ({ formData, cancel }) => {
        submittingIgnore = true;
        formData.append("pushNotificationUniqueIdentifier", $pushNotificationUniqueIdentifier);

        return async ({ result, update }) => {
            submittingIgnore = false;
            update();

            handleFormActionToast(result);
        };
    };
</script>

<div class="flex h-full w-full items-center justify-center">
    <Card.Root class="w-80 bg-card p-4 shadow-2xl">
        <Card.Header class="mb-2 p-0 text-center">
            <AppLogo class="w-56 self-center py-4" />
            <Card.Title>Notification Permission</Card.Title>
            <Card.Description>
                <!-- DX-NOTE: Change this message to suite your app's needs -->
                Allow {env.PUBLIC_APP_DISPLAY_NAME} to notify you of time sensitive events?
            </Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col">
            <div class="mt-8 flex w-full flex-row justify-between gap-2">
                <form action="?/ignore" method="POST" use:enhance={submitIgnore}>
                    <Button type="submit" variant="destructive-outline" disabled={submittingIgnore} loading={submittingIgnore}>
                        Ignore
                    </Button>
                </form>

                <form action="?/accept" method="POST" use:enhance={submitAccept}>
                    <Button type="submit" disabled={submittingAccept} loading={submittingAccept}>Accept</Button>
                </form>
            </div>
        </Card.Content>
    </Card.Root>
</div>

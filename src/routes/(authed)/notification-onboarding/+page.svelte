<script>
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { enhance } from "$app/forms";

    import { PUBLIC_VAPID_KEY } from "$env/static/public";

    import { initFirebase, firebaseMessaging, serviceWorkerRegistration } from "$lib/firebase.js";
    import { getToken, onMessage } from "firebase/messaging";

    import Button from "$lib/dx-components/form-elements/button.svelte";

    import { pushNotificationUniqueIdentifier } from "./stores";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { toast } from "svelte-sonner";
    import { checkFormActionResultStatus, handleFormActionToast } from "$lib";
    import { CircleHelp } from "lucide-svelte";

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
        console.log("permission", permission);

        if (permission !== "granted") {
            toast.error("Notification permissions are disabled", {
                description: "Please re-enable notifications on your browser for this site and try again"
            });
            submittingAccept = false;
            return;
        }

        try {
            // const fetchedToken = await getToken(firebaseMessaging, { serviceWorkerRegistration, vapidKey: PUBLIC_VAPID_KEY });

            // console.log("fetchedToken", fetchedToken);

            const existingPushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

            // Store the received token
            const pushSubscriptionDetails = await serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: PUBLIC_VAPID_KEY
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
        };
    };

    /**
     *  @type {import('./$types').SubmitFunction}
     */
    const submitTest = async ({ formData, cancel }) => {
        submittingTest = true;
        return async ({ result, update }) => {
            submittingTest = false;
            update();

            handleFormActionToast(result);
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
    <div class="relative m-2 flex max-w-96 flex-col items-center justify-center gap-8 rounded-lg bg-slate-300 p-8">
        <p class="text-xl font-bold">Allow notifications?</p>
        <p>By allowing notifications - you allow Divblox to notify you of time sensitive events occurring on your projects.</p>
        <div class="mt-8 flex w-full flex-row justify-center gap-2">
            <form action="?/ignore" method="POST" use:enhance={submitIgnore}>
                <Button type="submit" variant="destructive-outline" disabled={submittingIgnore} loading={submittingIgnore}>Ignore</Button>
            </form>

            <form action="?/accept" method="POST" use:enhance={submitAccept}>
                <Button type="submit" disabled={submittingAccept} loading={submittingAccept}>Accept</Button>
            </form>
        </div>

        <form action="?/test" method="POST" use:enhance={submitTest} class="absolute right-2 top-2">
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Tooltip.Root>
                        <Tooltip.Trigger>
                            <Button type="submit" size="sm" disabled={submittingTest} loading={submittingTest}>Test</Button>
                        </Tooltip.Trigger>
                    </Tooltip.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Send a test notification to all your <br /> registered push subscriptions</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </form>
    </div>
</div>

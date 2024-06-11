<script>
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { enhance } from "$app/forms";

    import { PUBLIC_VAPID_KEY } from "$env/static/public";

    import { initFirebase, firebaseMessaging, serviceWorkerRegistration } from "$lib/firebase.js";
    import { getToken, onMessage } from "firebase/messaging";

    import { Button } from "$lib/components/shadcn/ui/button";

    import { pushNotificationUniqueIdentifier } from "./stores";
    import * as Tooltip from "$lib/components/shadcn/ui/tooltip";
    import { toast } from "svelte-sonner";
    import { checkFormActionResultStatus, handleFormActionToast } from "$lib";
    import { CircleHelp } from "lucide-svelte";
    import * as Form from "$lib/components/shadcn/ui/form";
    import { Input } from "$lib/components/shadcn/ui/input";
    import AppLogo from "$lib/components/app-images/app-logo.svelte";

    import * as Card from "$lib/components/shadcn/ui/card";
    import { PUBLIC_APP_DISPLAY_NAME } from "$env/static/public";

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
    <Card.Root class="w-80 bg-card p-4 shadow-2xl">
        <Card.Header class="mb-2 p-0 text-center">
            <AppLogo class="w-56 self-center py-4" />
            <Card.Title>Notification Permission</Card.Title>
            <Card.Description>
                <!-- DX-NOTE: Change this message to suite your app's needs -->
                Allow {PUBLIC_APP_DISPLAY_NAME} to notify you of time sensitive events?
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

            <!-- TODO Remove when user account tests done -->
            <!-- <form action="?/test" method="POST" use:enhance={submitTest} class="absolute right-2 top-2">
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
            </form> -->
        </Card.Content>
    </Card.Root>
</div>

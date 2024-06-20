<script>
    import { enhance } from "$app/forms";

    import { Button } from "$lib/components/shadcn/ui/button";
    import { Input } from "$lib/components/shadcn/ui/input";
    import Bell from "lucide-svelte/icons/bell";
    import { Label } from "$lib/components/shadcn/ui/label";
    import { handleFormActionToast } from "$lib";
    import * as Tooltip from "$lib/components/shadcn/ui/tooltip";
    import Dialog from "$components/shadcn/ui/dialog/_dialog.svelte";
    import Textarea from "$components/shadcn/ui/textarea/textarea.svelte";

    export let data;

    let testNotificationDialogOpen = false;
    let submittingTest = false;
    /**
     *  @type {import('./$types').SubmitFunction}
     */
    const submitTest = async ({ formData, cancel }) => {
        submittingTest = true;
        return async ({ result, update }) => {
            submittingTest = false;
            testNotificationDialogOpen = false;
            update();

            handleFormActionToast(result);
        };
    };
</script>

<Tooltip.Root>
    <Tooltip.Trigger>
        <Button
            variant="secondary-outline"
            class="border-none"
            size="inline-icon"
            disabled={submittingTest}
            loading={submittingTest}
            on:click={() => (testNotificationDialogOpen = !testNotificationDialogOpen)}>
            <Bell class="h-4"></Bell>
        </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>
        <p>Send a test notification to this user's <br /> registered devices</p>
    </Tooltip.Content>
</Tooltip.Root>

<Dialog
    bind:open={testNotificationDialogOpen}
    title="Send test notification?"
    description="This will send a push notification to all devices registered for this user">
    <form action="?/testPushNotification" method="POST" use:enhance={submitTest} class="flex flex-col gap-4 py-4">
        <input type="hidden" name="id" value={data?.userAccountArray[index]?.id} />
        <div class="grid grid-cols-4 items-center gap-4">
            <Label for="title" class="text-right">Title</Label>
            <Input name="title" placeholder="New message" class="col-span-3" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
            <Label for="body" class="text-right">Body</Label>
            <Textarea name="body" placeholder="More details..." class="col-span-3" />
        </div>

        <Button type="submit" class="w-fit self-end" loading={submittingTest} disabled={submittingTest}>Send notification</Button>
    </form>
</Dialog>

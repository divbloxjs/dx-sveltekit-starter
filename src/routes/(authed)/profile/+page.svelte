<script>
    import SingleImageUploader from "$lib/components/file-uploader/singleImageUploader.svelte";
    import FormPassword from "./tabs/form-password.svelte";
    import FormUserAccount from "./tabs/form-user-account.svelte";

    import * as Tabs from "$lib/shadcn/ui/tabs/index.js";
    import * as Card from "$lib/shadcn/ui/card/index.js";

    import { buttonVariants } from "$lib/shadcn/ui/button";

    export let data;
</script>

<div class="flex h-full w-full justify-center">
    <div class="mx-2 mt-2 flex w-full sm:w-[36rem]">
        <Tabs.Root value="account" class="w-full">
            <Tabs.List class="w-full">
                <Tabs.Trigger value="account" class="w-full">Account</Tabs.Trigger>
                <Tabs.Trigger value="password" class="w-full">Password</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="account">
                <Card.Root>
                    <Card.Content class="space-y-2">
                        <div class="mt-4 flex flex-col self-center">
                            <SingleImageUploader
                                getFilesEndpoint="/api/file-upload/user-account?id=1&category=Profile_Picture"
                                postFilesEndpoint="/api/file-upload/user-account?id=1"
                                deleteFileEndpoint="api/file-upload/user-account"
                                updateFileNameEndpoint="api/file-upload"></SingleImageUploader>
                        </div>

                        <div class="flex w-full justify-center">
                            <a href="/admin/user-account/overview" class={`${buttonVariants({ variant: "link" })}`}>Admin Dashboard</a>
                        </div>

                        <FormUserAccount {data} />
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
            <Tabs.Content value="password">
                <Card.Root>
                    <Card.Content class="mt-4 space-y-2">
                        <FormPassword {data} />
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
            <Tabs.Content value="profilePicture">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Profile Picture</Card.Title>
                        <Card.Description>Update your profile picture here</Card.Description>
                    </Card.Header>
                    <Card.Content class="flex flex-col justify-center space-y-4"></Card.Content>
                </Card.Root>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</div>

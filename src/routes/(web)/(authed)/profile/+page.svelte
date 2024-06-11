<script>
    import SingleImageUploader from "$lib/components/file-uploader/singleImageUploader.svelte";
    import FormPassword from "./tabs/form-password.svelte";
    import FormUserAccount from "./tabs/form-user-account.svelte";

    import * as Tabs from "$lib/components/shadcn/ui/tabs/index.js";
    import * as Card from "$lib/components/shadcn/ui/card/index.js";

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
                                getFilesEndpoint="/api/file-upload/user-account?category=profilePicture"
                                postFilesEndpoint="/api/file-upload/user-account"
                                deleteFileEndpoint="api/file-upload/user-account"
                                updateFileNameEndpoint="?/updateProfilePictureDisplayName" />
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

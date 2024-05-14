<script>
    import FormUpdateUserAccount from "$lib/dx-components/data-model/userAccount/userAccount-form-update.svelte";

    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Card from "$lib/components/ui/card/index.js";

    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";

    import Uploader from "$lib/components/file-uploader/uploader.svelte";

    export let data;
</script>

<div class="flex h-full w-full justify-center">
    <div class="flex w-full md:w-96">
        <Tabs.Root value="account" class="w-full">
            <Tabs.List class="grid w-full grid-cols-3">
                <Tabs.Trigger value="account">Account</Tabs.Trigger>
                <Tabs.Trigger value="password">Password</Tabs.Trigger>
                <Tabs.Trigger value="profilePicture">Profile Picture</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="account">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Account</Card.Title>
                        <Card.Description>Make changes to your account here. Click save when you're done.</Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <FormUpdateUserAccount {data} />
                    </Card.Content>
                    <Card.Footer>
                        <Button>Save changes</Button>
                    </Card.Footer>
                </Card.Root>
            </Tabs.Content>
            <Tabs.Content value="password">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Password</Card.Title>
                        <Card.Description>Change your password here. After saving, you'll be logged out.</Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <div class="space-y-1">
                            <Label for="current">Current password</Label>
                            <Input id="current" type="password" />
                        </div>
                        <div class="space-y-1">
                            <Label for="new">New password</Label>
                            <Input id="new" type="password" />
                        </div>
                    </Card.Content>
                    <Card.Footer>
                        <Button>Save password</Button>
                    </Card.Footer>
                </Card.Root>
            </Tabs.Content>
            <Tabs.Content value="profilePicture">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Profile Picture</Card.Title>
                        <Card.Description>Update your profile picture here</Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <Uploader
                            multiple={true}
                            getFilesEndpoint="/api/file-upload/user-account?id=1&category=Profile_Picture"
                            postFilesEndpoint="/api/file-upload/user-account?id=1"
                            deleteFileEndpoint="api/file-upload/user-account"
                            updateFileNameEndpoint="api/file-upload">
                        </Uploader>
                        <Uploader
                            multiple={true}
                            uploadAsPublic={true}
                            getFilesEndpoint="/api/file-upload/user-account?id=2&category=Profile_Picture"
                            postFilesEndpoint="/api/file-upload/user-account?id=2"
                            deleteFileEndpoint="api/file-upload/user-account"
                            updateFileNameEndpoint="api/file-upload">
                        </Uploader>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</div>

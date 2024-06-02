<script>
    import SingleImageUploader from "$lib/components/file-uploader/singleImageUploader.svelte";
    import FormPassword from "./tabs/form-password.svelte";
    import FormUserAccount from "./tabs/form-user-account.svelte";

    import * as Form from "$lib/components/ui/form";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import FormWrapper from "$lib/components/forms/form-wrapper.svelte";
    import Input from "$lib/components/ui/input/input.svelte";

    export let data;
</script>

<div class="flex h-full w-full justify-center">
    <div class="mx-2 mt-2 flex w-full sm:w-[36rem]">
        <Tabs.Root value="profilePicture" class="w-full">
            <Tabs.List class="w-full">
                <Tabs.Trigger value="account" class="w-full">Account</Tabs.Trigger>
                <Tabs.Trigger value="password" class="w-full">Password</Tabs.Trigger>
                <Tabs.Trigger value="profilePicture" class="w-full">Profile Picture</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="account">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Account</Card.Title>
                        <Card.Description>Make changes to your account here. Click save when you're done.</Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <FormWrapper action="?/register" data={data.userForm} invalidateAll={false} let:message let:superform let:form>
                            {#if message}
                                <div
                                    class="status"
                                    class:error={message.status >= 400}
                                    class:success={!message.status || message.status < 300}>
                                    {message.text}
                                </div>
                            {/if}

                            <Form.Field form={data.userForm} name="firstName">
                                <Form.Control let:attrs>
                                    <Form.Label>First Name</Form.Label>
                                    <Input {...attrs} bind:value={form.firstName} />
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                            <Form.Field form={data.userForm} name="lastName">
                                <Form.Control let:attrs>
                                    <Form.Label>Last Name</Form.Label>
                                    <Input {...attrs} bind:value={form.lastName} />
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                            <Form.Field form={data.userForm} name="emailAddress">
                                <Form.Control let:attrs>
                                    <Form.Label>Email Address</Form.Label>
                                    <Input {...attrs} bind:value={form.emailAddress} />
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                            <Form.Field form={data.userForm} name="username">
                                <Form.Control let:attrs>
                                    <Form.Label>Username</Form.Label>
                                    <Input {...attrs} bind:value={form.username} />
                                </Form.Control>
                                <Form.FieldErrors />
                            </Form.Field>
                            <p><button>Submit</button></p>
                        </FormWrapper>
                        <FormUserAccount {data} />
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
            <Tabs.Content value="password">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Password</Card.Title>
                        <Card.Description>Change your password here. After saving, you'll be logged out.</Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-2">
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
                    <Card.Content class="flex flex-col justify-center space-y-4">
                        <SingleImageUploader
                            getFilesEndpoint="/api/file-upload/user-account?id=1&category=Profile_Picture"
                            postFilesEndpoint="/api/file-upload/user-account?id=1"
                            deleteFileEndpoint="api/file-upload/user-account"
                            updateFileNameEndpoint="api/file-upload"></SingleImageUploader>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</div>

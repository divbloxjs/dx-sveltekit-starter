<script>
    import { getContext } from "svelte";

    import SingleImageUploader from "$lib/components/file-uploader/singleImageUploader.svelte";
    import FormPassword from "./tabs/form-password.svelte";
    import FormUserAccount from "./tabs/form-user-account.svelte";

    import * as Tabs from "$lib/components/shadcn/ui/tabs/index.js";
    import * as Card from "$lib/components/shadcn/ui/card/index.js";
    import { FILE_CATEGORY } from "$lib/constants/constants";
    import { resetMode, setMode } from "mode-watcher";
    import { Button } from "$ui/button/index.js";
    import * as DropdownMenu from "$lib/components/shadcn/ui/dropdown-menu/index.js";
    import Moon from "lucide-svelte/icons/moon";
    import Sun from "lucide-svelte/icons/sun";

    const pageTitle = getContext("pageTitle");
    $pageTitle = "Profile";

    export let data;

    /**
     * @type {import("svelte/store").Writable<import("../../../../app").UserInfo | null>}
     */
    const currentUser = getContext("currentUser");
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
                        <div class="relative mt-4 flex flex-col self-center">
                            <div class="absolute -right-3 -top-4 text-xl font-bold">
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild let:builder>
                                        <Button builders={[builder]} variant="link" size="icon" class="float-right">
                                            <Sun
                                                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                            <Moon
                                                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                            <span class="sr-only">Toggle theme</span>
                                        </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content align="end">
                                        <DropdownMenu.Item on:click={() => setMode("light")}>Light</DropdownMenu.Item>
                                        <DropdownMenu.Item on:click={() => setMode("dark")}>Dark</DropdownMenu.Item>
                                        <DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </div>

                            <SingleImageUploader
                                getFilesEndpoint={`/api/file/user-account?category=${FILE_CATEGORY.PROFILE_PICTURE}`}
                                postFilesEndpoint="/api/file/user-account"
                                deleteFileEndpoint="api/file/user-account"
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

<script>
    import AppIcon from "$lib/components/app-images/app-icon.svelte";
    import { Button } from "$lib/components/shadcn/ui/button";
    import UserRound from "lucide-svelte/icons/user-round";
    import AlignJustify from "lucide-svelte/icons/align-justify";
    import Power from "lucide-svelte/icons/power";
    import UserCog from "lucide-svelte/icons/user-cog";
    import { goto } from "$app/navigation";
    import * as DropdownMenu from "$lib/components/shadcn/ui/dropdown-menu/index.js";

    /**
     * @type {HTMLFormElement}
     */
    let logoutForm;

    const doLogout = () => {
        logoutForm.submit();
    };
</script>

<form bind:this={logoutForm} action="/api/logout" method="POST"></form>

<div
    class="bg-background-200 fixed top-0 z-50 flex h-[calc(env(safe-area-inset-top)+3rem)] w-full items-end justify-between px-2 pb-1 pt-[env(safe-area-inset-top)] shadow-sm">
    <div class="flex items-center justify-start">
        <a href="/dashboard"><AppIcon class="max-h-10" /></a>
    </div>
    <div class="hidden items-center justify-end sm:visible sm:flex">
        <Button
            variant="link"
            on:click={() => {
                goto("/admin");
            }}><UserCog /></Button>
        <Button
            variant="link"
            on:click={() => {
                goto("/profile");
            }}><UserRound /></Button>
        <Button
            variant="link"
            on:click={() => {
                doLogout();
            }}><Power /></Button>
    </div>
    <div class="flex items-center justify-start sm:hidden">
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant="link" size="icon">
                    <AlignJustify />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
                <DropdownMenu.Item on:click={() => goto("/profile")}>
                    <span class="flex h-10 w-full items-center justify-start hover:cursor-pointer"><UserRound />Profile</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => doLogout()}>
                    <span class="flex h-10 w-full items-center justify-start hover:cursor-pointer"><Power />Log out</span>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
</div>

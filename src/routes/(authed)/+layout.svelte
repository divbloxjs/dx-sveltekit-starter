<script>
    import { page } from "$app/stores";
    import { Button, buttonVariants } from "$lib/shadcn/ui/button";
    import TopNavUser from "$lib/components/navigation/top-nav-user.svelte";
    import TopNavAdmin from "$lib/components/navigation/top-nav-admin.svelte";
    import BottomNavUser from "$lib/components/navigation/bottom-nav-user.svelte";

    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";

    import { resetMode, setMode } from "mode-watcher";
    import * as DropdownMenu from "$lib/shadcn/ui/dropdown-menu/index.js";
</script>

<TopNavUser />
<!-- Dani help! How do I check for admin here?-->
<!-- Todo: figure out page height here for bottom nav scroll-->
<TopNavAdmin />

<div class="flex w-full flex-col pt-14">
    <!--<div class="flex bg-slate-200 p-2">
        <a
            href="/dashboard"
            class="{$page.url.pathname.includes('dashboard') ? 'bg-blue-100 hover:bg-blue-200' : ''} {buttonVariants({
                variant: 'outline'
            })}">
            Dashboard
        </a>
        <div class="ml-auto flex flex-row">
            <a
                href="/profile"
                class="{$page.url.pathname.includes('profile') ? 'bg-blue-100 hover:bg-blue-200' : ''} {buttonVariants({
                    variant: 'outline'
                })}">
                Profile
            </a>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="outline" size="icon">
                        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span class="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                    <DropdownMenu.Item on:click={() => setMode("light")}>Light</DropdownMenu.Item>
                    <DropdownMenu.Item on:click={() => setMode("dark")}>Dark</DropdownMenu.Item>
                    <DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <form action="/api/logout" method="POST" class="flex">
                <Button type="submit" variant="outline">Log out</Button>
            </form>
        </div>
    </div>-->

    <slot />
</div>
<BottomNavUser />

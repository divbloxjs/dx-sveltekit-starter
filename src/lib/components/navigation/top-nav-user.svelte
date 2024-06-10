<script>
    import AppIcon from "$lib/components/app-images/app-icon.svelte";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import UserRound from "lucide-svelte/icons/user-round";
    import AlignJustify from "lucide-svelte/icons/align-justify";
    import Power from "lucide-svelte/icons/power";
    import { goto } from "$app/navigation";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
</script>

<div class="fixed top-0 flex h-14 w-full items-center justify-between bg-slate-200 px-2 shadow-sm">
    <div class="flex items-center justify-start">
        <a href="/"><AppIcon class="max-h-10" /></a>
    </div>
    <div class="hidden items-center justify-end sm:visible sm:flex">
        <Button
            type="button"
            variant="link"
            on:click={() => {
                goto("/profile");
            }}><UserRound /></Button>
        <form action="/api/logout" method="POST">
            <Button type="submit" variant="link"><Power /></Button>
        </form>
    </div>
    <div class="flex items-center justify-end sm:hidden">
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant="link" size="icon">
                    <AlignJustify />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
                <DropdownMenu.Item on:click={() => goto("/profile")}
                    ><span class="flex h-10 w-full items-center justify-center hover:cursor-pointer"><UserRound /></span
                    ></DropdownMenu.Item>
                <DropdownMenu.Item>
                    <form action="/api/logout" method="POST" class="flex h-10 w-full items-center justify-center hover:cursor-pointer">
                        <Button type="submit" variant="link"><Power /></Button>
                    </form>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
</div>

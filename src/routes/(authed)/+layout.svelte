<script>
    import { page } from "$app/stores";
    import { Button, buttonVariants } from "$lib/components/ui/button";
</script>

<div class="flex h-full w-full flex-col">
    <div class="flex bg-slate-200 p-2">
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
            <form action="/api/logout" method="POST" class="flex">
                <Button type="submit" variant="outline">Log out</Button>
            </form>
        </div>
    </div>

    <div class="flex flex-grow flex-col">
        <slot />
    </div>
</div>

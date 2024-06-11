<script lang="ts">
    import { buttonVariants, Button } from "$lib/components/ui/button";
</script>

<div class="flex h-full w-full flex-col">
    <div class="flex bg-slate-200 p-2">
        <a href="/admin" class={buttonVariants({ variant: "outline" })}>Data Model</a>
        <a href="/dashboard" class={buttonVariants({ variant: "outline" })}>Back to App</a>
        <form action="/api/logout" method="POST" class="ml-auto flex">
            <Button type="submit" variant="outline">Log out</Button>
        </form>
    </div>

    <div class="flex w-full flex-grow flex-col">
        <div class="flex flex-row gap-2 border-r p-2">
            <a href="/admin/user-account/overview" class={buttonVariants({ variant: "link", size: "sm" })}>User Accounts</a>
            <a href="/admin/user-role/overview" class={buttonVariants({ variant: "link", size: "sm" })}>User Roles</a>
        </div>

        <div class="flex flex-grow flex-col p-5">
            <slot />
        </div>
    </div>
</div>

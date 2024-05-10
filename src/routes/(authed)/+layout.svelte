<script>
    import { Button, buttonVariants } from "$lib/components/ui/button";
</script>

<div class="flex h-full w-full flex-col">
    <div class="flex bg-slate-200 p-2">
        <a href="/dashboard" class={buttonVariants({ variant: "outline" })}>Dashboard</a>
        <form action="/api/logout" method="POST" class="ml-auto flex">
            <Button type="submit" variant="outline">Log out</Button>
        </form>
    </div>

    <div class="flex flex-grow flex-col">
        <slot />
    </div>
</div>

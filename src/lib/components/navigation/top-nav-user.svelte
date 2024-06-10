<script>
    import AppIcon from "$lib/components/app-images/app-icon.svelte";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import UserRound from "lucide-svelte/icons/user-round";
</script>

<div class="fixed top-0 flex h-14 w-full items-center justify-between bg-slate-200 px-2 shadow-sm">
    <div class="flex items-center justify-start">
        <a href="/"><AppIcon class="max-h-10" /></a>
    </div>
    <div class="flex items-center justify-end">
        <a href="/profile" class="text-sm font-medium uppercase text-primary underline-offset-4 hover:underline"><UserRound /></a>
        <form action="/api/logout" method="POST">
            <Button type="submit" variant="link">Log out</Button>
        </form>
    </div>
</div>

<script>
    import { Button } from "$lib/components/ui/button";
</script>

<div class="flex h-full w-full flex-col">
    <div class="flex bg-slate-200">
        <form action="/logout" method="POST" class="ml-auto flex">
            <Button type="submit" variant="outline" class="m-2">Log out</Button>
        </form>
    </div>

    <div class="flex flex-grow">
        <slot />
    </div>
</div>

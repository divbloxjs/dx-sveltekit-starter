<script>
    import { buttonVariants } from "$lib/components/ui/button";
</script>

<div class="flex h-full w-full">
    <div class="flex h-full w-48 flex-col gap-2 border-r p-2">
        <a href="/admin/user-account/overview" class={buttonVariants({ variant: "outline" })}>User Accounts</a>
        <a href="/admin/user-role/overview" class={buttonVariants({ variant: "outline" })}>User Roles</a>
    </div>

    <div class="flex flex-grow flex-col p-5">
        <slot />
    </div>
</div>

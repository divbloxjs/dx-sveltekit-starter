<script>
    import { Button, buttonVariants } from "$components/shadcn/ui/button";

</script>

<div class="flex w-full flex-col">
    <div class="flex flex-row gap-2 border-r p-2">
        <a href="/admin/user-account/overview" class={buttonVariants({ variant: "link", size: "sm" })}>User Accounts</a>
        <a href="/admin/user-role/overview" class={buttonVariants({ variant: "link", size: "sm" })}>User Roles</a>
    </div>
    <slot/>
</div>
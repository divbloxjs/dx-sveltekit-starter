<script lang="ts">
    import TopNavAdmin from "$lib/components/navigation/top-nav-admin.svelte";
    import { buttonVariants, Button } from "$lib/components/shadcn/ui/button";
</script>

<div class="flex h-full w-full flex-col">
    <TopNavAdmin></TopNavAdmin>

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

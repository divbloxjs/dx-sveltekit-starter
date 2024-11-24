<script>
    import { buttonVariants } from "$components/shadcn/ui/button";
    import { page } from "$app/stores";

    const items = [
        { path: "/admin/user-account", displayLabel: "User Accounts" },
        { path: "/admin/user-role", displayLabel: "User Roles" }
    ];
</script>

<div class="flex w-full flex-col">
    <div class="flex flex-row gap-2 border-r p-2">
        {#each items as item}
            <a
                href={item.path}
                class:underline={$page.url.pathname.includes(item.path)}
                class={buttonVariants({ variant: "link", size: "sm" })}>{item.displayLabel}</a>
        {/each}
    </div>
    <slot />
</div>

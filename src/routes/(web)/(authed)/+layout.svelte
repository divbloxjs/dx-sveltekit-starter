<script>
    import TopNavUser from "$lib/components/navigation/top-nav-user.svelte";
    import TopNavAdmin from "$lib/components/navigation/top-nav-admin.svelte";
    import BottomNavUser from "$lib/components/navigation/bottom-nav-user.svelte";

    export let data;
</script>

{#if data?.user?.userRole?.roleName === "Admin"}
    <TopNavAdmin />
{:else}
    <TopNavUser />
{/if}

<div
    class="mb-[calc(env(safe-area-inset-bottom)+3.5rem)] mt-[calc(env(safe-area-inset-top)+3rem)] flex h-full w-full flex-col overflow-auto">
    <slot />
</div>
<BottomNavUser />

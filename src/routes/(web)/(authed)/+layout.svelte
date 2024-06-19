<script>
    import TopNavUser from "$lib/components/navigation/top-nav-user.svelte";
    import TopNavAdmin from "$lib/components/navigation/top-nav-admin.svelte";
    import BottomNavUser from "$lib/components/navigation/bottom-nav-user.svelte";
    import { setContext } from "svelte";
    import { writable } from "svelte/store";

    /** @type {import('./$types').LayoutData} */
    export let data;

    /**
     * @type {import("svelte/store").Writable<import("../../../app").UserInfo | null>}
     */
    const currentUser = writable();
    $: data.user, (() => currentUser.set(data.user))();

    setContext("currentUser", currentUser);

    const pageTitle = writable("");
    setContext("pageTitle", pageTitle);
</script>

{#if $currentUser?.user_role?.role_name === "Admin"}
    <TopNavAdmin pageTitle={$pageTitle} />
{:else}
    <TopNavUser pageTitle={$pageTitle} />
{/if}

<div
    class="mb-[calc(env(safe-area-inset-bottom)+3.5rem)] mt-[calc(env(safe-area-inset-top)+3rem)] flex h-full w-full flex-col overflow-auto px-5">
    <slot />
</div>
<BottomNavUser />

<script>
    import AppIcon from "$lib/components/app-images/app-icon.svelte";
    import { Button } from "$lib/components/shadcn/ui/button";
    import UserRound from "lucide-svelte/icons/user-round";
    import AlignJustify from "lucide-svelte/icons/align-justify";
    import Power from "lucide-svelte/icons/power";
    import { goto } from "$app/navigation";
    import * as DropdownMenu from "$lib/components/shadcn/ui/dropdown-menu/index.js";

    /**
     * @type {HTMLFormElement}
     */
    let logoutForm;

    const doLogout = () => {
        logoutForm.submit();
    };
</script>

<form bind:this={logoutForm} action="/api/logout" method="POST"></form>

<div
    class="fixed bottom-0 z-50 flex h-[calc(env(safe-area-inset-bottom)+3.5rem)] w-full items-start justify-between bg-slate-200 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
    <Button
        type="button"
        variant="link"
        on:click={() => {
            goto("/profile");
        }}><UserRound /></Button
    >|
    <Button
        type="button"
        variant="link"
        on:click={() => {
            doLogout();
        }}><Power /></Button>
</div>

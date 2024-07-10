<script>
    import * as Card from "$lib/components/shadcn/ui/card";

    import ZodLogo from "$lib/assets/dashboard-images/zod-logo.svg";
    import SuperformsLogo from "$lib/assets/dashboard-images/superforms-logo.svg";
    import SvelteLogo from "$lib/assets/dashboard-images/svelte-logo.svg";
    import LucideLogo from "$lib/assets/dashboard-images/lucide-logo.svg";
    import TailwindLogo from "$lib/assets/dashboard-images/tailwind-logo.svg";
    import ShadcnSvelteLogo from "$lib/assets/dashboard-images/shadcn-svelte-logo.svg";
    import PrismaLogo from "$lib/assets/dashboard-images/prisma-logo.svg";

    import { buttonVariants } from "$lib/components/shadcn/ui/button";
    import ExternalLink from "lucide-svelte/icons/external-link";

    import DivbloxLogo from "$lib/components/app-images/app-icon.svelte";
    import { getContext } from "svelte";

    // DX-NOTE: The pageTitle context store is used to update the page title in the top navigation bar
    const pageTitle = getContext("pageTitle");
    $pageTitle = "Dashboard";

    // DX-NOTE: A context store set in the (authed) layout, that can be used in any deeply nested component.
    // Alternatively, the same object is available at 'data.currentUser' - if you have access to the page data object
    const currentUser = getContext("currentUser");

    export let data;
</script>

<div class="flex h-full w-full flex-col items-center overflow-y-auto @container">
    <div class="flex w-full flex-col gap-2 px-2 pt-4 text-center">
        <span class="text-3xl font-bold">Welcome, {$currentUser.first_name ?? "User"}!</span>
        <p>This starter project is built with the core technologies below.</p>
        <p>It already provides for database integration and an ORM as well as certain core functionalities such as User Authentication.</p>
    </div>
    <div class=" flex max-w-5xl flex-row flex-wrap justify-center gap-5 p-5 child:w-full child:sm:w-72">
        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <DivbloxLogo class="h-7"></DivbloxLogo>
                    Divblox
                </Card.Title>
                <Card.Description class="h-14">
                    A CLI for nodeJS that integrates Divblox (<a class="underline" href="https://web.divblox.app">
                        divblox.app <ExternalLink class="mx-0 inline-flex h-3 w-3"></ExternalLink></a
                    >) functionality into your project
                </Card.Description>
            </Card.Header>

            <Card.Content class="flex justify-center pb-2">
                <a href="https://github.com/divbloxjs/divblox/wiki" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation
                    <ExternalLink class="ml-1 h-4"></ExternalLink></a>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <img src={SvelteLogo} alt="svelte logo" class="h-7" />
                    SvelteKit
                </Card.Title>
                <Card.Description class="h-14">Svelte meta framework for building web apps</Card.Description>
            </Card.Header>

            <Card.Content class="flex justify-center pb-2">
                <a href="https://kit.svelte.dev/docs" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation
                    <ExternalLink class="ml-1 h-4"></ExternalLink></a>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <img src={LucideLogo} alt="lucide logo" class="h-5" />

                    Lucide
                </Card.Title>
                <Card.Description class="h-14">Icon pack bundled with ShadCN</Card.Description>
            </Card.Header>
            <Card.Content class="flex justify-center pb-2">
                <a href="https://lucide.dev/icons/" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation<ExternalLink class="ml-1 h-4"></ExternalLink></a>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <img src={SuperformsLogo} alt="superforms logo" class="w-5" />
                    Superforms
                </Card.Title>
                <Card.Description class="h-14">Comprehensive solution for server and client form validation</Card.Description>
            </Card.Header>
            <Card.Content class="flex justify-center pb-2">
                <a href="https://superforms.rocks/" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation<ExternalLink class="ml-1 h-4"></ExternalLink></a>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <svg viewBox="0 0 50 31" class="w-6">
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M25.517 0C18.712 0 14.46 3.382 12.758 10.146c2.552-3.382 5.529-4.65 8.931-3.805 1.941.482 3.329 1.882 4.864 3.432 2.502 2.524 5.398 5.445 11.722 5.445 6.804 0 11.057-3.382 12.758-10.145-2.551 3.382-5.528 4.65-8.93 3.804-1.942-.482-3.33-1.882-4.865-3.431C34.736 2.92 31.841 0 25.517 0zM12.758 15.218C5.954 15.218 1.701 18.6 0 25.364c2.552-3.382 5.529-4.65 8.93-3.805 1.942.482 3.33 1.882 4.865 3.432 2.502 2.524 5.397 5.445 11.722 5.445 6.804 0 11.057-3.381 12.758-10.145-2.552 3.382-5.529 4.65-8.931 3.805-1.941-.483-3.329-1.883-4.864-3.432-2.502-2.524-5.398-5.446-11.722-5.446z"
                            fill="#38bdf8">
                        </path>
                    </svg>
                    tailwindCSS
                </Card.Title>
                <Card.Description class="h-14">A utility-first CSS framework</Card.Description>
            </Card.Header>
            <Card.Content class="flex justify-center pb-2">
                <a href="https://tailwindcss.com/docs" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation<ExternalLink class="ml-1 h-4"></ExternalLink></a>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <img src={ShadcnSvelteLogo} alt="superforms logo" class="w-5" />
                    shadcn-svelte
                </Card.Title>

                <Card.Description class="h-14">UI Component library for TailwindCSS</Card.Description>
            </Card.Header>
            <Card.Content class="flex justify-center pb-2">
                <a href="https://www.shadcn-svelte.com/docs" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation <ExternalLink class="ml-1 h-4"></ExternalLink></a>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <img src={ZodLogo} alt="zod logo" class="w-5" />
                    Zod
                </Card.Title>
                <Card.Description class="h-14">TypeScript-first schema validation with static type inference</Card.Description>
            </Card.Header>
            <Card.Content class="flex justify-center pb-2">
                <a href="https://zod.dev/" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation <ExternalLink class="ml-1 h-4"></ExternalLink>
                </a>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title class="flex h-8 flex-row items-center gap-2">
                    <img src={PrismaLogo} alt="zod logo" class="w-5" />
                    Prisma
                </Card.Title>
                <Card.Description class="h-14">Core ORM implementation used by Divblox</Card.Description>
            </Card.Header>
            <Card.Content class="flex justify-center pb-2">
                <a href="https://www.prisma.io/docs" class={`${buttonVariants({ variant: "link" })}`} target="_blank">
                    Documentation <ExternalLink class="ml-1 h-4"></ExternalLink>
                </a>
            </Card.Content>
        </Card.Root>
    </div>
</div>

<script>
    import { resetMode, setMode } from "mode-watcher";
    import * as DropdownMenu from "$lib/components/shadcn/ui/dropdown-menu/index.js";
    import ExternalLink from "lucide-svelte/icons/external-link";
    import Moon from "lucide-svelte/icons/moon";
    import Sun from "lucide-svelte/icons/sun";
    import { Button, buttonVariants } from "$lib/components/shadcn/ui/button";
    import * as Card from "$lib/components/shadcn/ui/card";
    import * as Accordion from "$lib/components/shadcn/ui/accordion";
    import AlertDialog from "$lib/components/shadcn/ui/alert-dialog/_alert-dialog.svelte";
    import * as Drawer from "$lib/components/shadcn/ui/drawer/index.js";
    import * as Alert from "$lib/components/shadcn/ui/alert/index.js";

    let alertDialogOpen = false;
</script>

<div class="flex h-full w-full flex-col gap-5">
    <div class="text-xl font-bold">
        Colour Palette <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
                <Button builders={[builder]} variant="link" size="icon">
                    <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span class="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
                <DropdownMenu.Item on:click={() => setMode("light")}>Light</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => setMode("dark")}>Dark</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>

    <div class="flex w-full justify-center px-5 text-center">
        This page can be used as a guideline to customize your project's theme. To modify your theme, simply update the values in
        /src/app.pcss
    </div>
    <div class="flex flex-col">
        <div class="flex w-full flex-wrap">
            <div class="flex h-24 flex-grow items-center justify-center bg-primary px-5 text-primary-foreground">Primary</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-secondary px-5 text-secondary-foreground">Secondary</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-tertiary px-5 text-tertiary-foreground">Tertiary</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-accent px-5 text-accent-foreground">Accent</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-success px-5 text-success-foreground">Success</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-warning px-5 text-warning-foreground">Warning</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-destructive px-5 text-destructive-foreground">Destructive</div>
        </div>

        <div class="flex w-full flex-wrap">
            <div class="flex h-24 flex-grow items-center justify-center bg-background px-5 text-foreground">Background</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-background-100 px-5 text-foreground">Background 100</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-background-200 px-5 text-foreground">Background 200</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-background-300 px-5 text-foreground">Background 300</div>
            <div class="flex h-24 flex-grow items-center justify-center bg-muted px-5 text-muted-foreground">Muted</div>
        </div>
    </div>

    <div class="flex w-full text-xl font-bold">Buttons</div>
    <div class="flex w-full flex-wrap justify-start gap-1 px-5">
        <Button>Default</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="tertiary">tertiary</Button>
        <Button variant="success">success</Button>
        <Button variant="warning">warning</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="link">link</Button>
    </div>

    <div class="flex w-full flex-wrap justify-start gap-1 px-5">
        <Button variant="outline">Outline</Button>
        <Button variant="secondary-outline">Outline</Button>
        <Button variant="tertiary-outline">Outline</Button>
        <Button variant="success-outline">Outline</Button>
        <Button variant="warning-outline">Outline</Button>
        <Button variant="destructive-outline">Outline</Button>
    </div>

    <div class="flex w-full flex-wrap">
        <span class="text-xl font-bold">Components</span>
        <a href="https://shadcn-svelte.com/docs" target="_blank" class={`${buttonVariants({ variant: "link", size: "xs" })}`}>
            Shadcn Docs <ExternalLink class="ml-2 h-4"></ExternalLink>
        </a>

        <Alert.Root class="m-5">
            <!-- <Terminal class="h-4 w-4" /> -->
            <Alert.Title>Heads up!</Alert.Title>
            <Alert.Description
                >Below is a small sample of shadcn components. Please refer to their documentation for more details.</Alert.Description>
        </Alert.Root>
    </div>

    <div class="flex w-full flex-row flex-wrap gap-5 px-5">
        <Card.Root class="w-56">
            <Card.Header>
                <Card.Title>Card Title</Card.Title>
                <Card.Description>Card Description</Card.Description>
            </Card.Header>
            <Card.Content>
                <p>Card Content</p>
            </Card.Content>
            <Card.Footer>
                <p>Card Footer</p>
            </Card.Footer>
        </Card.Root>

        <Accordion.Root class="w-72">
            <Accordion.Item value="item-1">
                <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
                <Accordion.Content>Yes. It adheres to the WAI-ARIA design pattern.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="item-2">
                <Accordion.Trigger>Is it styled?</Accordion.Trigger>
                <Accordion.Content>Yes. It comes with default styles that matches the other components' aesthetic.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="item-3">
                <Accordion.Trigger>Is it animated?</Accordion.Trigger>
                <Accordion.Content>Yes. It's animated by default, but you can disable it if you prefer.</Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>

        <Button on:click={() => (alertDialogOpen = !alertDialogOpen)}>Alert</Button>
        <AlertDialog title="Alert Title" description="Alert description" bind:open={alertDialogOpen}></AlertDialog>

        <Drawer.Root>
            <Drawer.Trigger asChild let:builder>
                <Button builders={[builder]} variant="outline">Open Drawer</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <div class="mx-auto w-full max-w-sm">
                    <Drawer.Header>
                        <Drawer.Title>Drawer Title</Drawer.Title>
                        <Drawer.Description>
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum, amet aperiam hic ab laborum quas nostrum, natus
                            nam iusto, harum magni delectus? Nisi voluptatibus quaerat, ducimus ipsam assumenda nemo fugit exercitationem
                            accusantium aspernatur accusamus corporis sed? Impedit nisi corporis sit voluptatem cupiditate velit at vero
                            repudiandae cumque eveniet! Deserunt, aspernatur! Commodi corrupti esse incidunt aliquid architecto repellat
                            magnam, facere saepe, tempora sit pariatur praesentium ipsum nisi suscipit nobis! Minima eos explicabo labore
                            totam! Nostrum debitis iusto odio. Perspiciatis quibusdam unde provident nam tenetur quaerat omnis voluptate
                            laudantium dolores, repellat voluptatem, perferendis totam delectus deleniti distinctio ipsum ex voluptas dicta
                            magnam!
                        </Drawer.Description>
                    </Drawer.Header>

                    <Drawer.Footer>
                        <Drawer.Close asChild let:builder>
                            <Button builders={[builder]} variant="outline">Cancel</Button>
                        </Drawer.Close>
                    </Drawer.Footer>
                </div>
            </Drawer.Content>
        </Drawer.Root>
    </div>
</div>

import { tv } from "tailwind-variants";
import Root from "./button.svelte";

const buttonVariants = tv({
    base: "uppercase inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants: {
        variant: {
            default: "bg-neutral text-background-100",
            outline: "border border-neutral hover:bg-neutral hover:text-background-100",

            primary: "bg-primary text-primary-foreground hover:bg-primary/90",
            "primary-outline": "border border-primary hover:bg-accent hover:text-accent-foreground",

            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
            "secondary-outline": "border border-secondary text-secondary hover:bg-secondary/90 hover:text-secondary-foreground",

            tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90",
            "tertiary-outline": "border border-tertiary text-tertiary hover:bg-tertiary/90 hover:text-tertiary-foreground",

            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            "destructive-outline": "border border-destructive text-destructive hover:bg-destructive/90 hover:text-destructive-foreground",

            success: "bg-success text-success-foreground hover:bg-success/90",
            "success-outline": "border border-success text-success hover:bg-success/90 hover:text-success-foreground",

            warning: "bg-warning text-warning-foreground hover:bg-warning/90",
            "warning-outline": "border border-warning text-warning hover:bg-warning/90 hover:text-warning-foreground",

            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline "
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            xs: "h-7 rounded-md px-2 text-sm",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
            "inline-icon": "h-6 w-6",
            link: "px-0"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
export {
    Root,
    //
    Root as Button,
    buttonVariants
};

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 no-default-hover-elevate no-default-active-elevate transition-shadow duration-500 ease-out",
    {


        variants: {
            variant: {
                default:
                    "bg-primary-btn-bg-color hover:bg-primary-btn-bg-hover-color text-primary-btn-text-color border border-primary-btn-bg-color hover:border-primary-btn-bg-hover-color rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium",
                secondary: "text-[16px] rounded-full font-inter font-medium bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color text-secondary-btn-text-color border-solid border border-secondary-btn-border-color hover:secondary-btn-bg-hover-color hover:shadow-secondary-btn",
                destructive:
                    "bg-destructive text-destructive-foreground border border-destructive-border",
                outline:
                    "border [border-color:var(--button-outline)] hover-elevate active:shadow-none hover:border-secondary-border",
                ghost: "border border-transparent hover-elevate  hover:bg-secondary-btn-bg-hover-color ",
            },

            size: {
                default: "min-h-9 px-4 py-2",
                sm: "min-h-8 rounded-full px-3 text-xs",
                lg: "min-h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };

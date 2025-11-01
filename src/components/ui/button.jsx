import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tanjiro-green disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-3 border-black",
  {
    variants: {
      variant: {
        default:
          "bg-tanjiro-green text-cream shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[8px] active:translate-y-[8px]",
        destructive:
          "bg-demon-red text-cream shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[8px] active:translate-y-[8px]",
        outline:
          "border-3 border-black bg-cream text-charcoal shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[8px] active:translate-y-[8px]",
        secondary:
          "bg-earthy-orange text-charcoal shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[8px] active:translate-y-[8px]",
        ghost: "border-0 shadow-none hover:bg-tanjiro-green/10",
        link: "border-0 shadow-none text-tanjiro-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }

import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-2 border-black px-2.5 py-0.5 text-xs font-semibold transition-all shadow-neu-sm",
  {
    variants: {
      variant: {
        default:
          "bg-tanjiro-green text-cream hover:translate-x-[1px] hover:translate-y-[1px]",
        secondary:
          "bg-earthy-orange text-charcoal hover:translate-x-[1px] hover:translate-y-[1px]",
        destructive:
          "bg-demon-red text-cream hover:translate-x-[1px] hover:translate-y-[1px]",
        outline: "bg-cream text-charcoal hover:translate-x-[1px] hover:translate-y-[1px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }

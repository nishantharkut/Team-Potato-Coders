import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-md border-3 border-black bg-white px-4 py-3 text-base font-medium text-charcoal transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tanjiro-green focus-visible:border-tanjiro-green disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }

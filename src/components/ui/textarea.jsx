import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-md border-3 border-black bg-white px-4 py-3 text-base font-medium text-charcoal transition-all placeholder:text-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tanjiro-green focus-visible:border-tanjiro-green disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }

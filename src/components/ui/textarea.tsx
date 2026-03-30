import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border border-border bg-surface-subtle text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-focus-ring focus-visible:ring-2 focus-visible:ring-focus-ring aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-xl px-3 py-2 text-base shadow-xs transition-[color,box-shadow,background-color,border-color] outline-none disabled:cursor-not-allowed disabled:opacity-80 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

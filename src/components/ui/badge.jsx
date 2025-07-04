import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
 'inline-flex items-center rounded-base border-2 text-black border-border dark:border-darkBorder px-2.5 font-base py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-main',
        temuan: 'bg-red-500/50 dark:bg-red-500/20',
        pending: 'bg-amber-300 dark:bg-amber-300',
        neutral: 'bg-white dark:bg-darkBg dark:text-darkText',
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

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 [a&]:hover:bg-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 [a&]:hover:bg-amber-500/20",
        info:
          "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400 [a&]:hover:bg-blue-500/20",
        // Verification status variants
        verified:
          "border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 [a&]:hover:bg-emerald-100 dark:[a&]:hover:bg-emerald-500/20 transition-colors",
        pending:
          "border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 [a&]:hover:bg-amber-100 dark:[a&]:hover:bg-amber-500/20 transition-colors animate-pulse",
        unverified:
          "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 [a&]:hover:bg-slate-100 dark:[a&]:hover:bg-slate-700/50 transition-colors",
        // Status variants
        draft:
          "border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/80",
        active:
          "border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 [a&]:hover:bg-green-100 dark:[a&]:hover:bg-green-500/20",
        inactive:
          "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 [a&]:hover:bg-slate-100 dark:[a&]:hover:bg-slate-700/50"
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
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

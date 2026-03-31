import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] border border-transparent text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
  {
    variants: {
      variant: {
        default: "bg-brand-dark text-text-inverse hover:bg-brand-dark/90",
        destructive:
          "bg-destructive text-text-inverse hover:bg-destructive/90 focus-visible:outline-destructive/30",
        outline:
          "border-border-strong bg-transparent text-brand-dark hover:bg-page-alt",
        secondary:
          "bg-brand-gold text-brand-dark hover:bg-brand-gold/90",
        ghost:
          "border-transparent bg-transparent text-brand-dark hover:bg-page-alt",
        link: "border-none bg-transparent text-brand-dark underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-8",
        sm: "h-9 px-5",
        lg: "h-12 px-10",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

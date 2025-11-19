import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring-secondary,var(--ring)))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
      variants: {
        variant: {
          default: "bg-primary text-primary-foreground hover:bg-primary/90",
          destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          outline:
            "border border-input bg-background hover:bg-[hsl(var(--accent-secondary,var(--accent)))] hover:text-[hsl(var(--accent-secondary-foreground,var(--accent-foreground)))] active:bg-[hsl(var(--accent-tertiary,var(--accent-secondary,var(--accent))))] active:text-[hsl(var(--accent-tertiary-foreground,var(--accent-secondary-foreground,var(--accent-foreground))))]",
          secondary:
            "bg-[hsl(var(--accent-secondary,var(--secondary)))] text-[hsl(var(--accent-secondary-foreground,var(--secondary-foreground)))] hover:bg-[hsl(var(--accent-tertiary,var(--accent-secondary,var(--secondary))))] hover:text-[hsl(var(--accent-tertiary-foreground,var(--accent-secondary-foreground,var(--secondary-foreground))))]",
          ghost: "hover:bg-[hsl(var(--accent-secondary,var(--accent)))] hover:text-[hsl(var(--accent-secondary-foreground,var(--accent-foreground)))] active:bg-[hsl(var(--accent-tertiary,var(--accent-secondary,var(--accent))))] active:text-[hsl(var(--accent-tertiary-foreground,var(--accent-secondary-foreground,var(--accent-foreground))))]",
          link: "text-primary underline-offset-4 hover:underline hover:text-[hsl(var(--primary-secondary,var(--primary)))]",
        },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    // Adaptive radius based on button size
    // Small buttons (icon, sm) use smaller radius, larger buttons use medium radius
    const getRadius = () => {
      if (size === 'icon' || size === 'sm') {
        return 'var(--radius-xs)'
      }
      if (size === 'lg') {
        return 'var(--radius-md)'
      }
      return 'var(--radius-sm)'
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }), 
          'rounded-[var(--radius-sm)]',
          className
        )}
        style={{
          borderRadius: getRadius(),
          ...style,
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


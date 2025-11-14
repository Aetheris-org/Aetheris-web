import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-muted rounded-sm", className)}
      style={{
        borderRadius: 'var(--radius-sm)',
      }}
      {...props}
    />
  )
}

export { Skeleton }


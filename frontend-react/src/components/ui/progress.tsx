import * as React from 'react'

import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const clamped = Math.min(Math.max(value, 0), max)
    const percentage = max === 0 ? 0 : (clamped / max) * 100

    return (
      <div
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--accent-secondary,var(--primary)))] to-[hsl(var(--accent-tertiary,var(--accent-secondary,var(--primary))))] transition-all"
          style={{ 
            width: percentage === 0 ? '0%' : '100%',
            transform: percentage === 0 ? 'none' : `translateX(-${100 - percentage}%)`
          }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }

import * as React from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

interface TooltipContextValue {
  open: boolean
  setOpen: (value: boolean) => void
  triggerRef: React.MutableRefObject<HTMLElement | null>
  triggerRect: DOMRect | null
  setTriggerRect: (rect: DOMRect | null) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

type TooltipProviderProps = {
  children: React.ReactNode
  delayDuration?: number
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

interface TooltipProps {
  children: React.ReactNode
  delayDuration?: number
}

export function Tooltip({ children, delayDuration = 150 }: TooltipProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null)
  const [timer, setTimer] = React.useState<number | null>(null)

  const setOpenWithDelay = React.useCallback(
    (next: boolean) => {
      if (timer) {
        window.clearTimeout(timer)
        setTimer(null)
      }

      if (next) {
        const id = window.setTimeout(() => {
          setTriggerRect(triggerRef.current?.getBoundingClientRect() ?? null)
          setOpen(true)
          setTimer(null)
        }, delayDuration)
        setTimer(id)
      } else {
        setOpen(false)
      }
    },
    [delayDuration, timer],
  )

  const contextValue = React.useMemo<TooltipContextValue>(
    () => ({
      open,
      setOpen: (value: boolean) => setOpenWithDelay(value),
      triggerRef,
      triggerRect,
      setTriggerRect,
    }),
    [open, setOpenWithDelay, triggerRect],
  )

  React.useEffect(() => {
    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [timer])

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>
}

type TriggerProps = {
  children: React.ReactElement
} & React.HTMLAttributes<HTMLElement>

export const TooltipTrigger = React.forwardRef<HTMLElement, TriggerProps>(function TooltipTrigger(
  { children, onFocus, onBlur, onMouseEnter, onMouseLeave, ...props },
  forwardedRef,
) {
  const context = React.useContext(TooltipContext)

  if (!context) {
    throw new Error('TooltipTrigger must be used within a Tooltip')
  }

  const { triggerRef, setOpen, setTriggerRect } = context

  const mergedRef = (node: HTMLElement | null) => {
    triggerRef.current = node

    if (typeof forwardedRef === 'function') {
      forwardedRef(node)
    } else if (forwardedRef) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(forwardedRef as React.MutableRefObject<any>).current = node
    }

    if (React.isValidElement(children) && children.ref) {
      if (typeof children.ref === 'function') {
        children.ref(node)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(children.ref as React.MutableRefObject<any>).current = node
      }
    }
  }

  const child = React.Children.only(children)
  const childProps = child.props as React.HTMLAttributes<HTMLElement>

  const handleOpen = (event: React.SyntheticEvent<HTMLElement>) => {
    setTriggerRect(triggerRef.current?.getBoundingClientRect() ?? null)
    setOpen(true)
    if (event.type === 'focus') {
      onFocus?.(event as React.FocusEvent<HTMLElement>)
      childProps.onFocus?.(event as React.FocusEvent<HTMLElement>)
    }
    if (event.type === 'mouseenter') {
      onMouseEnter?.(event as React.MouseEvent<HTMLElement>)
      childProps.onMouseEnter?.(event as React.MouseEvent<HTMLElement>)
    }
  }

  const handleClose = (event: React.SyntheticEvent<HTMLElement>) => {
    setOpen(false)
    if (event.type === 'blur') {
      onBlur?.(event as React.FocusEvent<HTMLElement>)
      childProps.onBlur?.(event as React.FocusEvent<HTMLElement>)
    }
    if (event.type === 'mouseleave') {
      onMouseLeave?.(event as React.MouseEvent<HTMLElement>)
      childProps.onMouseLeave?.(event as React.MouseEvent<HTMLElement>)
    }
  }

  const triggerProps = {
    ref: mergedRef,
    onFocus: handleOpen,
    onBlur: handleClose,
    onMouseEnter: handleOpen,
    onMouseLeave: handleClose,
    ...props,
  }

  return React.cloneElement(child, {
    ...childProps,
    ...props,
    ...triggerProps,
  })
})

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { className, children, side = 'top', align = 'center', sideOffset = 6, style, ...props },
  ref,
) {
  const context = React.useContext(TooltipContext)

  if (!context) {
    throw new Error('TooltipContent must be used within a Tooltip')
  }

  const { open, triggerRect } = context

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open || !triggerRect) {
    return null
  }

  const top =
    side === 'bottom'
      ? triggerRect.bottom + sideOffset
      : triggerRect.top - sideOffset
  const left = (() => {
    switch (align) {
      case 'start':
        return triggerRect.left
      case 'end':
        return triggerRect.right
      case 'center':
      default:
        return triggerRect.left + triggerRect.width / 2
    }
  })()

  const content = (
    <div
      ref={ref}
      role="tooltip"
      style={{
        position: 'fixed',
        top,
        left,
        transform:
          align === 'center'
            ? 'translateX(-50%)'
            : align === 'end'
              ? 'translateX(-100%)'
              : undefined,
        zIndex: 50,
        pointerEvents: 'none',
        ...style,
      }}
      className={cn(
        'border border-border/60 bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md rounded-sm',
        className,
      )}
      style={{
        borderRadius: 'var(--radius-sm)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
})


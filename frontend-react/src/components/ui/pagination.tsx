import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<'ul'>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = React.ComponentPropsWithoutRef<'a'> & {
  isActive?: boolean
}

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      'flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
      isActive && 'border-border bg-accent text-accent-foreground',
      className
    )}
    {...props}
  />
)

PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn('gap-1 pl-2.5 pr-3', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    {children}
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn('gap-1 pl-3 pr-2.5', className)}
    {...props}
  >
    {children}
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}


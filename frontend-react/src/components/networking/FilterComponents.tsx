/**
 * FILTER COMPONENTS FOR NETWORKING PAGE
 * 
 * Переиспользуемые компоненты для фильтров
 */

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FilterGroupProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option
          return (
            <Button
              key={option}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('text-xs', isActive && 'shadow-sm')}
              onClick={() => onChange(option)}
            >
              {option === 'all' ? 'Any' : option}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

interface FilterToggleGroupProps {
  label: string
  options: string[]
  values: string[]
  onToggle: (value: string) => void
  renderLabel?: (value: string) => string
}

export function FilterToggleGroup({
  label,
  options,
  values,
  onToggle,
  renderLabel,
}: FilterToggleGroupProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = values.includes(option)
          return (
            <Button
              key={option}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('text-xs', isActive && 'shadow-sm')}
              onClick={() => onToggle(option)}
            >
              {renderLabel ? renderLabel(option) : option}
            </Button>
          )
        })}
      </div>
    </div>
  )
}


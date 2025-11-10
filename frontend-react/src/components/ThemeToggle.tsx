import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/themeStore'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useThemeStore((state) => ({
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme: state.setTheme,
  }))

  const nextResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  const handleToggle = () => {
    setTheme(nextResolvedTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="h-9 w-9"
      aria-label={
        theme === 'system'
          ? `Use ${nextResolvedTheme} mode instead of system`
          : resolvedTheme === 'dark'
            ? 'Switch to light mode'
            : 'Switch to dark mode'
      }
      title={
        theme === 'system'
          ? `Following system theme (${resolvedTheme}). Click to force ${nextResolvedTheme} mode.`
          : resolvedTheme === 'dark'
            ? 'Switch to light mode'
            : 'Switch to dark mode'
      }
    >
      {resolvedTheme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}


import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotkeysStore, matchKeyCombo, type HotkeyActionId } from '@/stores/hotkeysStore'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

function isInputLike(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function HotkeysListener() {
  const navigate = useNavigate()
  const keybinds = useHotkeysStore((s) => s.keybinds)
  const user = useAuthStore((s) => s.user)
  const { resolvedTheme, setTheme } = useThemeStore((s) => ({
    resolvedTheme: s.resolvedTheme,
    setTheme: s.setTheme,
  }))

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isInputLike(e.target)) return

      const run = (action: HotkeyActionId) => {
        e.preventDefault()
        e.stopPropagation()
        switch (action) {
          case 'createPost':
            navigate('/create')
            break
          case 'goToForum':
            navigate('/forum')
            break
          case 'goToNotifications':
            navigate('/notifications')
            break
          case 'goToReadingList':
            navigate('/reading-list')
            break
          case 'goToSettings':
            navigate('/settings/profile')
            break
          case 'goToProfile':
            if (user?.id) navigate(`/profile/${user.id}`)
            break
          case 'toggleTheme':
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            break
        }
      }

      const actions: HotkeyActionId[] = [
        'createPost',
        'goToForum',
        'goToNotifications',
        'goToReadingList',
        'goToSettings',
        'goToProfile',
        'toggleTheme',
      ]
      for (const action of actions) {
        const combo = keybinds[action]
        if (combo && matchKeyCombo(combo, e)) {
          run(action)
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [navigate, keybinds, user?.id, resolvedTheme, setTheme])

  return null
}

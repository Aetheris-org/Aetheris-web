/**
 * Fate Engine - React компонент для отображения контента редактора
 * Аналог EditorContent из TipTap
 */

import { useEffect, useRef, useState } from 'react'
import type { FateEditor } from '../types'

interface EditorContentProps {
  editor: FateEditor | null
  className?: string
}

export function EditorContent({ editor, className }: EditorContentProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!editor) {
      setHtmlContent('')
      return
    }

    const updateContent = () => {
      try {
        // Получаем HTML из редактора
        const html = editor.getHTML()
        setHtmlContent(html || '')
        setError(null)
      } catch (err) {
        console.error('[FateEngine] Error getting HTML from editor:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setHtmlContent('')
      }
    }

    // Обновляем сразу
    updateContent()

    // Используем requestAnimationFrame для обновления после рендеринга
    const rafId = requestAnimationFrame(() => {
      updateContent()
    })

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [editor])

  if (error) {
    return (
      <div className={className} style={{ padding: '1rem', color: 'red' }}>
        <p>Ошибка при отображении контента: {error.message}</p>
      </div>
    )
  }

  if (!editor) {
    return (
      <div className={className} style={{ minHeight: '400px' }}>
        <p>Загрузка редактора...</p>
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{ minHeight: '400px' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

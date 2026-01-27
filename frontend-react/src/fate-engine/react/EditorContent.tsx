/**
 * Fate Engine - React компонент для отображения контента редактора
 * Аналог EditorContent из TipTap
 */

import { useEffect, useRef } from 'react'
import type { FateEditor } from '../types'

interface EditorContentProps {
  editor: FateEditor | null
  className?: string
}

export function EditorContent({ editor, className }: EditorContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor || !containerRef.current) return

    const view = editor.view
    if (view.dom && containerRef.current) {
      // Очищаем контейнер
      containerRef.current.innerHTML = ''
      // Добавляем DOM редактора
      containerRef.current.appendChild(view.dom)
    }

    return () => {
      // Очистка при размонтировании
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: '400px' }}
    />
  )
}

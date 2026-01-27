/**
 * Fate Engine - React Hook для редактора
 * Аналог useEditor из TipTap
 */

import { useEffect, useRef, useState } from 'react'
import { createEditor } from '../core/Editor'
import type { FateEditor, FateEditorOptions } from '../types'

export function useEditor(options: FateEditorOptions = {}): FateEditor | null {
  const [editor, setEditor] = useState<FateEditor | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    const instance = createEditor(optionsRef.current)
    setEditor(instance)

    return () => {
      instance.destroy()
    }
  }, [])

  // Обновляем редактор при изменении опций
  useEffect(() => {
    if (!editor) return

    if (options.content !== undefined) {
      editor.setContent(options.content)
    }
  }, [editor, options.content])

  return editor
}

/**
 * Fate Engine - Главный экспорт
 * Экспортирует все публичные API движка
 */

// Core
export { createEditor } from './core/Editor'
export type { FateEditor, FateEditorOptions, FateEditorState } from './core/Editor'
export type { FateSchema } from './core/Schema'

// Nodes
export * from './nodes'

// Marks
export * from './marks'

// Extensions
export { StarterKit } from './extensions/StarterKit'
export { TextAlign } from './extensions/TextAlign'

// React
export { useEditor, EditorContent } from './react'

// Types
export type * from './types'

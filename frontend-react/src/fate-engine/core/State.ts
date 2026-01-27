/**
 * Fate Engine - Состояние редактора
 * Управление состоянием документа и выделения
 */

import type {
  FateEditorState,
  FateDocument,
} from '../types'
import type { FateSchema } from './Schema'

export interface StateOptions {
  editable?: boolean
  selection?: {
    anchor: number
    head: number
  }
}

export function createState(
  _schema: FateSchema,
  doc: FateDocument,
  options: StateOptions = {}
): FateEditorState {
  return {
    doc,
    selection: options.selection || {
      anchor: 0,
      head: 0,
    },
  }
}

export function applyTransaction(
  state: FateEditorState,
  transaction: any
): FateEditorState {
  // Применяем транзакцию к состоянию
  // В упрощенной версии просто обновляем документ
  return {
    ...state,
    doc: transaction.doc || state.doc,
    selection: transaction.selection || state.selection,
  }
}

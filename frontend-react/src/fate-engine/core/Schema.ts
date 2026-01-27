/**
 * Fate Engine - Схема документа
 * Определяет структуру и правила валидации документа
 */

import type {
  FateExtension,
  FateNodeDefinition,
  FateMarkDefinition,
  FateDocument,
} from '../types'

export interface FateSchema {
  nodes: Record<string, FateNodeDefinition>
  marks: Record<string, FateMarkDefinition>
}

// Экспортируем тип для использования в других модулях
export type { FateSchema }

export function createSchema(extensions: FateExtension[]): FateSchema {
  const nodes: Record<string, FateNodeDefinition> = {}
  const marks: Record<string, FateMarkDefinition> = {}

  // Собираем узлы и метки из всех расширений
  extensions.forEach((ext) => {
    if (ext.addNodes) {
      const nodeDefs = ext.addNodes()
      nodeDefs.forEach((def) => {
        nodes[def.name] = def
      })
    }

    if (ext.addMarks) {
      const markDefs = ext.addMarks()
      markDefs.forEach((def) => {
        marks[def.name] = def
      })
    }
  })

  return { nodes, marks }
}

export function validateDocument(schema: FateSchema, doc: FateDocument): boolean {
  // Базовая валидация структуры документа
  if (!doc || doc.type !== 'doc') {
    return false
  }

  if (!Array.isArray(doc.content)) {
    return false
  }

  // Валидируем каждый узел
  return doc.content.every((node) => validateNode(schema, node))
}

function validateNode(schema: FateSchema, node: any): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  // Проверяем, что тип узла существует в схеме
  if (!schema.nodes[node.type]) {
    return false
  }

  const nodeDef = schema.nodes[node.type]

  // Валидируем атрибуты
  if (node.attrs && nodeDef.attrs) {
    for (const key in node.attrs) {
      if (!(key in nodeDef.attrs)) {
        return false
      }
    }
  }

  // Валидируем дочерние узлы
  if (node.content && Array.isArray(node.content)) {
    return node.content.every((child: any) => validateNode(schema, child))
  }

  // Валидируем метки
  if (node.marks && Array.isArray(node.marks)) {
    return node.marks.every((mark: any) => {
      return mark && typeof mark === 'object' && schema.marks[mark.type]
    })
  }

  return true
}

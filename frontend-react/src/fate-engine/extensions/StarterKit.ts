/**
 * Fate Engine - StarterKit
 * Базовый набор расширений для редактора
 */

import type { FateExtension } from '../types'
import { Paragraph, Heading, HardBreak, HorizontalRule } from '../nodes'
import { Bold, Italic, Underline, Strikethrough, Code } from '../marks'

export interface StarterKitOptions {
  paragraph?: boolean
  heading?: boolean | { levels?: number[] }
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  hardBreak?: boolean
  horizontalRule?: boolean
}

export function StarterKit(options: StarterKitOptions = {}): FateExtension {
  const extensions: FateExtension[] = []

  // Узлы
  if (options.paragraph !== false) {
    extensions.push({
      name: 'paragraph',
      addNodes: () => [Paragraph],
    })
  }

  if (options.heading !== false) {
    extensions.push({
      name: 'heading',
      addNodes: () => [Heading],
    })
  }

  if (options.hardBreak !== false) {
    extensions.push({
      name: 'hardBreak',
      addNodes: () => [HardBreak],
    })
  }

  if (options.horizontalRule !== false) {
    extensions.push({
      name: 'horizontalRule',
      addNodes: () => [HorizontalRule],
    })
  }

  // Метки
  if (options.bold !== false) {
    extensions.push({
      name: 'bold',
      addMarks: () => [Bold],
    })
  }

  if (options.italic !== false) {
    extensions.push({
      name: 'italic',
      addMarks: () => [Italic],
    })
  }

  if (options.underline !== false) {
    extensions.push({
      name: 'underline',
      addMarks: () => [Underline],
    })
  }

  if (options.strikethrough !== false) {
    extensions.push({
      name: 'strikethrough',
      addMarks: () => [Strikethrough],
    })
  }

  if (options.code !== false) {
    extensions.push({
      name: 'code',
      addMarks: () => [Code],
    })
  }

  // Объединяем все расширения в одно
  return {
    name: 'starterKit',
    addNodes: () => {
      const nodes: any[] = []
      extensions.forEach((ext) => {
        if (ext.addNodes) {
          nodes.push(...ext.addNodes())
        }
      })
      return nodes
    },
    addMarks: () => {
      const marks: any[] = []
      extensions.forEach((ext) => {
        if (ext.addMarks) {
          marks.push(...ext.addMarks())
        }
      })
      return marks
    },
    addCommands: () => {
      const commands: Record<string, (...args: any[]) => any> = {}
      extensions.forEach((ext) => {
        if (ext.addCommands) {
          Object.assign(commands, ext.addCommands())
        }
      })
      return commands
    },
  }
}

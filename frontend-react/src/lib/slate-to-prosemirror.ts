/**
 * Утилита для преобразования Slate JSON в ProseMirror JSON (для TipTap)
 * Это обратная конвертация от ProseMirror → Slate
 * 
 * KeystoneJS хранит документы в Slate формате, но TipTap использует ProseMirror
 * Эта функция позволяет использовать TipTap Editor для отображения контента
 */

import { logger } from './logger'

interface SlateNode {
  type?: string
  children?: SlateNode[]
  text?: string
  level?: number
  url?: string
  [key: string]: any
}

/**
 * Преобразует Slate JSON в ProseMirror JSON
 * @param slateContent - Slate JSON (массив блоков или объект с полем document)
 * @returns ProseMirror JSON (объект с type: 'doc' и content: [...])
 */
export function slateToProseMirror(slateContent: any): any {
  if (!slateContent) {
    return {
      type: 'doc',
      content: [],
    }
  }

  // Извлекаем массив блоков из Slate формата
  let blocks: SlateNode[] = []
  if (Array.isArray(slateContent)) {
    blocks = slateContent
  } else if (typeof slateContent === 'object' && slateContent !== null) {
    if (slateContent.document) {
      if (Array.isArray(slateContent.document)) {
        blocks = slateContent.document
      } else if (slateContent.document.children && Array.isArray(slateContent.document.children)) {
        blocks = slateContent.document.children
      }
    } else if (slateContent.children && Array.isArray(slateContent.children)) {
      blocks = slateContent.children
    }
  } else if (typeof slateContent === 'string') {
    try {
      const parsed = JSON.parse(slateContent)
      return slateToProseMirror(parsed)
    } catch (e) {
      return {
        type: 'doc',
        content: [],
      }
    }
  }

  if (blocks.length === 0) {
    return {
      type: 'doc',
      content: [],
    }
  }

  // Преобразуем каждый блок Slate в ProseMirror узел
  // Важно: разворачиваем массивы параграфов, если convertSlateToProseMirror вернул массив
  const content: any[] = []
  blocks.forEach((block) => {
    const converted = convertSlateToProseMirror(block)
    if (converted) {
      // Если вернулся массив (несколько параграфов), разворачиваем его
      if (Array.isArray(converted)) {
        content.push(...converted.filter((node: any) => node !== null))
      } else {
        content.push(converted)
      }
    }
  })

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  }
}

/**
 * Извлекает blockId из маркера в тексте и удаляет маркер
 * @param children - массив дочерних узлов
 * @returns объект с blockId и обработанными children
 */
function extractBlockIdFromChildren(children: SlateNode[]): { blockId: string | null; processedChildren: SlateNode[] } {
  let blockId: string | null = null
  const processedChildren = children.map((child: any) => {
    if (child && typeof child === 'object' && child.text !== undefined && !child.type) {
      const anchorMatch = child.text.match(/^\u200B\u200B\u200B\[ANCHOR:([^\]]+)\]\u200B\u200B\u200B/)
      if (anchorMatch) {
        blockId = anchorMatch[1]
        // Удаляем маркер из текста
        let text = child.text.replace(/^\u200B\u200B\u200B\[ANCHOR:[^\]]+\]\u200B\u200B\u200B\s?/, '')
        // Если после удаления маркера текст пустой, оставляем пробел
        // чтобы узел не был полностью пустым
        if (!text.trim()) {
          text = ' '
        }
        child = {
          ...child,
          text: text,
        }
      }
    }
    return child
  })
  return { blockId, processedChildren }
}

/**
 * Преобразует один узел Slate в ProseMirror узел
 */
function convertSlateToProseMirror(node: SlateNode): any {
  if (!node || typeof node !== 'object') {
    return null
  }

  const type = node.type || 'paragraph'
  const children = node.children || []

  // Текстовый узел: { text: "..." } → { type: "text", text: "..." }
  if (node.text !== undefined && !node.type) {
    const result: any = {
      type: 'text',
      text: node.text || '',
    }

    // Добавляем marks для форматирования
    const marks: any[] = []
    if (node.bold) marks.push({ type: 'bold' })
    if (node.italic) marks.push({ type: 'italic' })
    if (node.code) marks.push({ type: 'code' })
    if (node.underline) marks.push({ type: 'underline' })
    if (node.strikethrough) marks.push({ type: 'strikethrough' })
    if (node.url) marks.push({ type: 'link', attrs: { href: node.url } })

    if (marks.length > 0) {
      result.marks = marks
    }

    return result
  }

  // Блоки: { type: "paragraph", children: [...] } → { type: "paragraph", content: [...] }
  const typeMapping: Record<string, string> = {
    'unordered-list': 'bulletList',
    'ordered-list': 'orderedList',
    'list-item': 'listItem',
    'code': 'codeBlock',
    'divider': 'horizontalRule',
  }

  const proseMirrorType = typeMapping[type] || type

  // Специальная обработка для разных типов блоков
  switch (type) {
    case 'heading': {
      const level = node.level || 1
      // Извлекаем blockId из маркера
      const headingAnchor = extractBlockIdFromChildren(children)
      const headingResult: any = {
        type: 'heading',
        attrs: { level: Math.min(Math.max(level, 1), 6) },
        content: convertChildren(headingAnchor.processedChildren),
      }
      if (headingAnchor.blockId) {
        headingResult.attrs.blockId = headingAnchor.blockId
        if (import.meta.env.DEV) {
          logger.debug('[slateToProseMirror] Extracted blockId for heading:', headingAnchor.blockId)
        }
      }
      return headingResult
    }

    case 'code':
    case 'code-block':
      // Извлекаем language и blockId из маркеров в тексте
      let language = 'plaintext'
      let codeBlockId: string | null = null
      if (children.length > 0) {
        const firstTextNode = children.find((child: any) => 
          child && typeof child === 'object' && child.text !== undefined && !child.type
        )
        if (firstTextNode && firstTextNode.text) {
          // Проверяем маркер языка
          const languageMatch = firstTextNode.text.match(/^\u200B\u200B\u200B\[LANGUAGE:([^\]]+)\]\u200B\u200B\u200B/)
          if (languageMatch) {
            language = languageMatch[1]
          }
          // Проверяем маркер anchor
          const anchorMatch = firstTextNode.text.match(/^\u200B\u200B\u200B\[ANCHOR:([^\]]+)\]\u200B\u200B\u200B/)
          if (anchorMatch) {
            codeBlockId = anchorMatch[1]
          }
        }
      }

      // Извлекаем текст кода (удаляем маркеры языка и anchor)
      const codeContent = children
        .map((child: any) => {
          if (child.text !== undefined) {
            let text = child.text || ''
            // Удаляем маркер языка
            text = text.replace(/^\u200B\u200B\u200B\[LANGUAGE:[^\]]+\]\u200B\u200B\u200B\s?/, '')
            // Удаляем маркер anchor
            text = text.replace(/^\u200B\u200B\u200B\[ANCHOR:[^\]]+\]\u200B\u200B\u200B\s?/, '')
            // Если после удаления маркеров текст пустой, пропускаем узел
            if (!text.trim()) {
              return null
            }
            return { type: 'text', text: text.trim() }
          }
          return null
        })
        .filter((child: any) => child !== null && child.text && child.text.trim())

      // Если нет контента, создаем пустой code block (но не пустой текстовый узел!)
      // TipTap codeBlock может быть пустым, но не может содержать пустой текстовый узел
      const codeResult: any = {
        type: 'codeBlock',
        attrs: { language },
        content: codeContent.length > 0 ? codeContent : [],
      }
      if (codeBlockId) {
        codeResult.attrs.blockId = codeBlockId
        if (import.meta.env.DEV) {
          logger.debug('[slateToProseMirror] Extracted blockId for codeBlock:', codeBlockId)
        }
      }
      return codeResult

    case 'blockquote':
      // Проверяем, является ли это callout (по маркеру в тексте)
      let calloutVariant: string | null = null
      let blockquoteBlockId: string | null = null
      if (children.length > 0) {
        const firstChild = children[0]
        if (firstChild && firstChild.type === 'paragraph' && firstChild.children) {
          for (const child of firstChild.children) {
            if (child && typeof child === 'object' && child.text) {
              // Проверяем маркер callout
              const markerMatch = child.text.match(/^\u200B\u200B\u200B\[CALLOUT:([^\]]+)\]\u200B\u200B\u200B/)
              if (markerMatch) {
                calloutVariant = markerMatch[1]
                // Удаляем маркер из текста
                let text = child.text.replace(/^\u200B\u200B\u200B\[CALLOUT:[^\]]+\]\u200B\u200B\u200B/, '')
                // Если после удаления маркера текст пустой, оставляем пробел
                if (!text.trim()) {
                  text = ' '
                }
                child.text = text
                break
              }
              // Проверяем маркер anchor
              const anchorMatch = child.text.match(/^\u200B\u200B\u200B\[ANCHOR:([^\]]+)\]\u200B\u200B\u200B/)
              if (anchorMatch) {
                blockquoteBlockId = anchorMatch[1]
                // Удаляем маркер из текста
                let text = child.text.replace(/^\u200B\u200B\u200B\[ANCHOR:[^\]]+\]\u200B\u200B\u200B\s?/, '')
                if (!text.trim()) {
                  text = ' '
                }
                child.text = text
              }
            }
          }
        }
      }

      if (calloutVariant) {
        // Конвертируем в callout
        const calloutResult: any = {
          type: 'callout',
          attrs: { variant: calloutVariant },
          content: convertChildren(children),
        }
        if (blockquoteBlockId) {
          calloutResult.attrs.blockId = blockquoteBlockId
          if (import.meta.env.DEV) {
            logger.debug('[slateToProseMirror] Extracted blockId for callout:', blockquoteBlockId)
          }
        }
        return calloutResult
      }

      // Обычный blockquote
      const blockquoteResult: any = {
        type: 'blockquote',
        content: convertChildren(children),
      }
      if (blockquoteBlockId) {
        blockquoteResult.attrs = { blockId: blockquoteBlockId }
        if (import.meta.env.DEV) {
          logger.debug('[slateToProseMirror] Extracted blockId for blockquote:', blockquoteBlockId)
        }
      }
      return blockquoteResult

    case 'unordered-list':
    case 'ordered-list':
      return {
        type: proseMirrorType,
        content: children
          .filter((child: any) => child.type === 'list-item' || child.type === 'listItem')
          .map((item: any) => convertSlateToProseMirror(item))
          .filter((item: any) => item !== null),
      }

    case 'list-item':
      // List item может содержать paragraph или напрямую текст
      // Извлекаем blockId из маркера
      const listItemAnchor = extractBlockIdFromChildren(children)
      const itemContent = convertChildren(listItemAnchor.processedChildren)
      const listItemResult: any = {
        type: 'listItem',
        content: itemContent.length > 0 ? itemContent : [{ type: 'paragraph' }],
      }
      if (listItemAnchor.blockId) {
        listItemResult.attrs = { blockId: listItemAnchor.blockId }
        if (import.meta.env.DEV) {
          logger.debug('[slateToProseMirror] Extracted blockId for listItem:', listItemAnchor.blockId)
        }
      }
      return listItemResult

    case 'divider':
    case 'horizontal-rule':
      return {
        type: 'horizontalRule',
      }

    case 'image':
      // Обработка изображений из Slate формата
      const imageUrl = node.url || node.src || ''
      const imageAlt = node.alt || ''
      const imageBlockId = node.blockId || null
      
      if (!imageUrl) {
        return null
      }

      const imageResult: any = {
        type: 'image',
        attrs: {
          src: imageUrl,
          alt: imageAlt || undefined,
        },
      }

      if (imageBlockId) {
        imageResult.attrs.blockId = imageBlockId
      }

      return imageResult

    case 'layout':
      // KeystoneJS layout → TipTap columns
      const layoutAreas = children.filter((child: any) => child.type === 'layout-area')
      const columns = layoutAreas.map((area: any) => ({
        type: 'column',
        content: convertChildren(area.children || []),
      }))

      return {
        type: 'columns',
        content: columns.length > 0 ? columns : [{ type: 'column', content: [{ type: 'paragraph' }] }],
      }

    case 'paragraph':
    default:
      // Обрабатываем blockId (anchor) из маркера в тексте
      let blockId: string | null = null
      const processedChildren = children.map((child: any) => {
        if (child && typeof child === 'object' && child.text !== undefined && !child.type) {
          const anchorMatch = child.text.match(/^\u200B\u200B\u200B\[ANCHOR:([^\]]+)\]\u200B\u200B\u200B/)
          if (anchorMatch) {
            blockId = anchorMatch[1]
            // Удаляем маркер из текста
            let text = child.text.replace(/^\u200B\u200B\u200B\[ANCHOR:[^\]]+\]\u200B\u200B\u200B\s?/, '')
            // Если после удаления маркера текст пустой, оставляем пробел
            // чтобы узел не был полностью пустым
            if (!text.trim()) {
              text = ' '
            }
            child = {
              ...child,
              text: text,
            }
          }
        }
        return child
      })

      // ВАЖНО: Если в параграфе несколько текстовых узлов, разделяем их на отдельные параграфы
      // Это нужно для правильного отображения переносов строк
      const textNodes = processedChildren.filter((child: any) => 
        child && typeof child === 'object' && child.text !== undefined && !child.type
      )
      
      // Если есть несколько текстовых узлов, создаем отдельные параграфы для каждого
      if (textNodes.length > 1) {
        const paragraphs: any[] = []
        textNodes.forEach((textNode: any, index: number) => {
          // Создаем отдельный параграф для каждого текстового узла
          const paragraphContent = convertChildren([textNode])
          if (paragraphContent.length > 0 || index === 0) {
            const paragraph: any = {
              type: 'paragraph',
              content: paragraphContent.length > 0 ? paragraphContent : [],
            }
            // Добавляем blockId только к первому параграфу
            if (blockId && index === 0) {
              paragraph.attrs = { blockId }
            }
            paragraphs.push(paragraph)
          }
        })
        
        // Возвращаем массив параграфов (будет обработан специально)
        return paragraphs.length > 0 ? paragraphs : { type: 'paragraph', content: [] }
      }

      // Если только один текстовый узел или нет текстовых узлов, обрабатываем как обычно
      const convertedContent = convertChildren(processedChildren)
      
      // Если после конвертации контент пустой, создаем пустой paragraph
      // (TipTap допускает пустые paragraph, но не пустые текстовые узлы)
      const result: any = {
        type: 'paragraph',
        content: convertedContent.length > 0 ? convertedContent : [],
      }

      if (blockId) {
        result.attrs = { blockId }
        if (import.meta.env.DEV) {
          logger.debug('[slateToProseMirror] Extracted blockId for paragraph:', blockId)
        }
      }

      return result
  }
}

/**
 * Преобразует массив children Slate в массив content ProseMirror
 */
function convertChildren(children: SlateNode[]): any[] {
  if (!children || children.length === 0) {
    return []
  }

  // Сначала обрабатываем все children, включая развертывание массивов
  const processedChildren: any[] = []
  
  children.forEach((child: any) => {
    // Текстовый узел
    if (child.text !== undefined && !child.type) {
      let text = child.text || ''
      
      // Извлекаем маркер ссылки [LINK:href]
      let linkHref: string | null = null
      const linkMatch = text.match(/^\u200B\u200B\u200B\[LINK:([^\]]+)\]\u200B\u200B\u200B/)
      if (linkMatch) {
        linkHref = linkMatch[1]
        // Удаляем маркер из текста
        text = text.replace(/^\u200B\u200B\u200B\[LINK:[^\]]+\]\u200B\u200B\u200B\s?/, '')
      }
      
        // Обрабатываем переносы строк в тексте
        // Разбиваем текст по переносам строк и создаем hardBreak узлы
        const lines = text.split('\n')
        if (lines.length > 1) {
          // Если есть переносы строк, создаем узлы с hardBreak между ними
          lines.forEach((line: string, index: number) => {
          // Добавляем текстовый узел для строки (если она не пустая или есть ссылка)
          const trimmedLine = line.trim()
          if (trimmedLine || linkHref) {
            const textNode: any = {
              type: 'text',
              text: trimmedLine || (linkHref ? ' ' : ''),
            }
            
            const marks: any[] = []
            if (child.bold) marks.push({ type: 'bold' })
            if (child.italic) marks.push({ type: 'italic' })
            if (child.code) marks.push({ type: 'code' })
            if (child.underline) marks.push({ type: 'underline' })
            if (child.strikethrough) marks.push({ type: 'strikethrough' })
            if (linkHref) {
              marks.push({ type: 'link', attrs: { href: linkHref } })
            }
            
            if (marks.length > 0) {
              textNode.marks = marks
            }
            
            processedChildren.push(textNode)
          }
          
          // Добавляем hardBreak после каждой строки, кроме последней
          if (index < lines.length - 1) {
            processedChildren.push({ type: 'hardBreak' })
          }
        })
      } else {
        // Если переносов строк нет, обрабатываем как обычно
        const trimmedText = text.trim()
        if (trimmedText || linkHref) {
          const result: any = {
            type: 'text',
            text: trimmedText || (linkHref ? ' ' : ''),
          }

          const marks: any[] = []
          if (child.bold) marks.push({ type: 'bold' })
          if (child.italic) marks.push({ type: 'italic' })
          if (child.code) marks.push({ type: 'code' })
          if (child.underline) marks.push({ type: 'underline' })
          if (child.strikethrough) marks.push({ type: 'strikethrough' })
          if (linkHref) {
            marks.push({ type: 'link', attrs: { href: linkHref } })
          }

          if (marks.length > 0) {
            result.marks = marks
          }

          processedChildren.push(result)
        }
      }
    } else if (child.type) {
      // Блок
      const converted = convertSlateToProseMirror(child)
      if (converted) {
        processedChildren.push(converted)
      }
    }
  })
  
  // Фильтруем null и пустые текстовые узлы
  return processedChildren.filter((node: any) => {
    if (!node) return false
    if (node.type === 'text' && (!node.text || !node.text.trim())) {
      return false
    }
    return true
  })
}


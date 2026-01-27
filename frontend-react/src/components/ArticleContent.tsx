/**
 * Компонент для отображения контента статьи через Fate Engine
 * Использует Fate Engine в режиме только для чтения для правильного отображения всех блоков
 */
import { useMemo, useEffect, useRef } from 'react'
import { slateToFate, prosemirrorToFate } from '@/fate-engine/utils/converter'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface ArticleContentProps {
  content: any // Slate JSON или ProseMirror JSON
  className?: string
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  // Конвертируем Slate или ProseMirror в Fate Engine формат
  const fateContent = useMemo((): { type: 'doc'; content: any[] } => {
    try {
      if (!content) {
        return { type: 'doc', content: [] }
      }

      // Если это уже ProseMirror формат (есть type: 'doc')
      if (typeof content === 'object' && content !== null && content.type === 'doc') {
        try {
          const converted = prosemirrorToFate(content)
          // Убеждаемся, что тип точно 'doc'
          if (converted && converted.type === 'doc') {
            // Отладочная информация
            if (import.meta.env.DEV) {
              const paragraphCount = converted.content?.filter((n: any) => n.type === 'paragraph').length || 0
              logger.debug('[ArticleContent] Converted ProseMirror to Fate:', {
                totalNodes: converted.content?.length || 0,
                paragraphs: paragraphCount,
                sample: converted.content?.slice(0, 3).map((n: any) => ({
                  type: n.type,
                  hasText: !!n.content?.some((c: any) => c.type === 'text'),
                  hasHardBreak: !!n.content?.some((c: any) => c.type === 'hardBreak'),
                })),
              })
            }
            return converted
          }
          return { type: 'doc', content: converted?.content || [] }
        } catch (err) {
          console.error('[ArticleContent] Error converting ProseMirror to Fate:', err)
          return { type: 'doc', content: [] }
        }
      }

      // Если это Slate формат, конвертируем
      try {
        const converted = slateToFate(content)
        // Убеждаемся, что тип точно 'doc'
        if (converted && converted.type === 'doc') {
          // Отладочная информация
          if (import.meta.env.DEV) {
            const paragraphCount = converted.content?.filter((n: any) => n.type === 'paragraph').length || 0
            logger.debug('[ArticleContent] Converted Slate to Fate:', {
              totalNodes: converted.content?.length || 0,
              paragraphs: paragraphCount,
              sample: converted.content?.slice(0, 3).map((n: any) => ({
                type: n.type,
                hasText: !!n.content?.some((c: any) => c.type === 'text'),
                hasHardBreak: !!n.content?.some((c: any) => c.type === 'hardBreak'),
              })),
            })
          }
          return converted
        }
        return { type: 'doc', content: converted?.content || [] }
      } catch (err) {
        console.error('[ArticleContent] Error converting Slate to Fate:', err)
        return { type: 'doc', content: [] }
      }
    } catch (err) {
      console.error('[ArticleContent] Error in fateContent useMemo:', err)
      return { type: 'doc', content: [] }
    }
  }, [content])

  // Создаем редактор - всегда вызываем хук на верхнем уровне
  // ВРЕМЕННО ОТКЛЮЧАЕМ РЕДАКТОР - используем только fallback рендеринг
  // Это предотвращает React error #310 и зависание страницы

  // Проверка и обработка изображений, видео и аудио после рендеринга (один раз)
  useEffect(() => {
    if (!editorRef.current) return

    // Используем флаг, чтобы не обрабатывать элементы повторно
    const processedKey = 'data-media-processed'
    
    const handleMediaElements = () => {
      const container = editorRef.current
      if (!container) return

      // Проверяем изображения только один раз
      const images = container.querySelectorAll<HTMLImageElement>(`img:not([${processedKey}])`)
      images.forEach(img => {
        img.setAttribute(processedKey, 'true')
        
        // Убеждаемся, что изображения имеют правильные стили
        if (!img.classList.contains('max-w-full')) {
          img.classList.add('max-w-full', 'h-auto', 'rounded-lg', 'my-4')
        }
        
        // Принудительно устанавливаем стили для гарантированного отображения
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
        img.style.display = img.src ? 'block' : 'none'
        
        // Проверяем, что src установлен и валиден
        if (!img.src || img.src === window.location.href) {
          if (import.meta.env.DEV) {
            logger.warn('[ArticleContent] Image has invalid or missing src:', {
              src: img.getAttribute('src'),
              alt: img.alt,
            })
          }
        }
      })

      // Находим все элементы video и audio
      const videoWrappers = container.querySelectorAll(`.editor-video-wrapper:not([${processedKey}])`)
      const audioWrappers = container.querySelectorAll(`.editor-audio-wrapper:not([${processedKey}])`)
      
      videoWrappers.forEach(wrapper => {
        wrapper.setAttribute(processedKey, 'true')
        const video = wrapper.querySelector('video')
        if (video && !video.hasAttribute('controls')) {
          video.setAttribute('controls', '')
        }
      })
      
      audioWrappers.forEach(wrapper => {
        wrapper.setAttribute(processedKey, 'true')
        const audio = wrapper.querySelector('audio')
        if (audio && !audio.hasAttribute('controls')) {
          audio.setAttribute('controls', '')
        }
      })
    }

    // Запускаем один раз с задержкой
    const timeoutId = setTimeout(handleMediaElements, 300)
    return () => clearTimeout(timeoutId)
  }, [fateContent])

  // В опубликованных статьях добавляем только кратковременную подсветку при клике на якорную ссылку
  // Постоянные индикаторы не нужны - только эффект при навигации

  // Отладочная информация: проверяем, что blockId правильно применены (только в DEV режиме, один раз)
  useEffect(() => {
    if (!import.meta.env.DEV || !editorRef.current) return
    
    // Проверяем наличие элементов с blockId после рендеринга (один раз)
    const timeoutId = setTimeout(() => {
      const allAnchors = editorRef.current?.querySelectorAll('[id], [data-block-id]')
      if (allAnchors && allAnchors.length > 0) {
        logger.debug('[ArticleContent] Anchors found after render:', Array.from(allAnchors).map(el => ({
          id: el.id,
          dataBlockId: el.getAttribute('data-block-id'),
          tagName: el.tagName,
          textContent: el.textContent?.substring(0, 50),
        })))
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [fateContent])

  // Обработка кликов по якорным ссылкам (href="#anchor-id")
  // Добавляем кратковременную подсветку блока-якоря при клике
  useEffect(() => {
    if (!editorRef.current) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href^="#"]')
      
      if (link) {
        event.preventDefault()
        const href = link.getAttribute('href')
        if (!href || !href.startsWith('#')) return
        
        const anchorId = href.substring(1) // Убираем #
        if (!anchorId) return
        
        if (import.meta.env.DEV) {
          logger.debug('[ArticleContent] Anchor link clicked:', { href, anchorId })
        }
        
        // Ищем элемент с id или data-block-id равным anchorId
        const anchorElement = document.querySelector(
          `[id="${anchorId}"], [data-block-id="${anchorId}"]`
        ) as HTMLElement | null
        
        if (anchorElement) {
          // Прокручиваем к элементу
          anchorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
          
          // Красивая анимация подсветки через CSS класс
          anchorElement.classList.add('anchor-highlight')
          
          // Убираем класс после завершения анимации
          setTimeout(() => {
            anchorElement.classList.remove('anchor-highlight')
          }, 2000)
        } else {
          // Если не нашли, попробуем найти внутри контейнера
          const containerElement = editorRef.current
          const anchorInContainer = containerElement?.querySelector(
            `[id="${anchorId}"], [data-block-id="${anchorId}"]`
          ) as HTMLElement | null
          
          if (anchorInContainer) {
            anchorInContainer.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
            
            anchorInContainer.classList.add('anchor-highlight')
            
            setTimeout(() => {
              anchorInContainer.classList.remove('anchor-highlight')
            }, 2000)
          } else if (import.meta.env.DEV) {
            logger.warn('[ArticleContent] Anchor element not found:', anchorId)
          }
        }
      }
    }

    const containerElement = editorRef.current
    containerElement?.addEventListener('click', handleClick)
    
    return () => {
      containerElement?.removeEventListener('click', handleClick)
    }
  }, [])

  // Применяем стили один раз после рендеринга (оптимизировано для предотвращения бесконечных циклов)
  useEffect(() => {
    if (!editorRef.current) return

    const applyStyles = () => {
      const fateElement = editorRef.current
      if (!fateElement) return

      // Применяем стили только к элементам, которые еще не стилизованы
      const paragraphs = fateElement.querySelectorAll('p:not([data-styled])')
      paragraphs.forEach((p, index) => {
        const el = p as HTMLElement
        el.setAttribute('data-styled', 'true')
        // Важно: margin-bottom для создания отступов между параграфами
        el.style.setProperty('margin-bottom', '1rem', 'important')
        el.style.setProperty('margin-top', '0', 'important')
        // white-space: normal - параграфы уже разделены, не нужно pre-wrap
        // pre-wrap может конфликтовать с margin-bottom между параграфами
        el.style.setProperty('white-space', 'normal', 'important')
        el.style.setProperty('line-height', '1.7', 'important')
        el.style.setProperty('display', 'block', 'important')
        
        // Проверяем, является ли это последним параграфом среди всех параграфов
        const allParagraphs = fateElement.querySelectorAll('p')
        if (index === allParagraphs.length - 1) {
          el.style.setProperty('margin-bottom', '0', 'important')
        }
      })
      
      // Применяем стили к заголовкам, которые еще не стилизованы
      const headings = fateElement.querySelectorAll('h1:not([data-styled]), h2:not([data-styled]), h3:not([data-styled]), h4:not([data-styled]), h5:not([data-styled]), h6:not([data-styled])')
      headings.forEach((h) => {
        const el = h as HTMLElement
        el.setAttribute('data-styled', 'true')
        const tagName = el.tagName.toLowerCase()
        
        // Находим индекс среди всех заголовков
        const allHeadings = fateElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
        const index = Array.from(allHeadings).indexOf(el)
        
        el.style.setProperty('white-space', 'normal', 'important')
        el.style.setProperty('display', 'block', 'important')
        
        if (tagName === 'h1') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '2rem', 'important')
          el.style.setProperty('margin-bottom', '1rem', 'important')
          el.style.setProperty('font-size', '1.875rem', 'important')
          el.style.setProperty('font-weight', '700', 'important')
          el.style.setProperty('line-height', '1.2', 'important')
        } else if (tagName === 'h2') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1.5rem', 'important')
          el.style.setProperty('margin-bottom', '1rem', 'important')
          el.style.setProperty('font-size', '1.5rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.3', 'important')
        } else if (tagName === 'h3') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1.25rem', 'important')
          el.style.setProperty('margin-bottom', '1rem', 'important')
          el.style.setProperty('font-size', '1.25rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.4', 'important')
        } else if (tagName === 'h4') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1rem', 'important')
          el.style.setProperty('margin-bottom', '0.75rem', 'important')
          el.style.setProperty('font-size', '1.125rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.4', 'important')
        } else if (tagName === 'h5') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '1rem', 'important')
          el.style.setProperty('margin-bottom', '0.75rem', 'important')
          el.style.setProperty('font-size', '1rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.5', 'important')
        } else if (tagName === 'h6') {
          el.style.setProperty('margin-top', index === 0 ? '0' : '0.75rem', 'important')
          el.style.setProperty('margin-bottom', '0.5rem', 'important')
          el.style.setProperty('font-size', '0.875rem', 'important')
          el.style.setProperty('font-weight', '600', 'important')
          el.style.setProperty('line-height', '1.5', 'important')
        }
      })
    }
    
    // Применяем стили один раз с задержкой (только для новых элементов)
    const timeoutId = setTimeout(applyStyles, 150)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [fateContent])

  // Функция для рендеринга fallback (простой HTML)
  const renderFallback = () => {
    if (!fateContent || !fateContent.content || fateContent.content.length === 0) {
      return (
        <div className={cn('prose prose-neutral dark:prose-invert max-w-none article-content', className)}>
          <p className="text-muted-foreground">Нет контента для отображения</p>
        </div>
      )
    }
    
    try {
      // Отладочная информация в DEV режиме
      if (import.meta.env.DEV) {
        const paragraphCount = fateContent.content.filter((n: any) => n.type === 'paragraph').length
        const hardBreakCount = JSON.stringify(fateContent).match(/"type":"hardBreak"/g)?.length || 0
        logger.debug('[ArticleContent] Rendering content:', {
          totalNodes: fateContent.content.length,
          paragraphs: paragraphCount,
          hardBreaks: hardBreakCount,
          structure: fateContent.content.map((n: any) => ({
            type: n.type,
            hasContent: !!n.content,
            contentLength: n.content?.length || 0,
          })),
        })
      }
      
      // Простой рендеринг через dangerouslySetInnerHTML как временное решение
      const html = docToSimpleHTML(fateContent)
      if (!html || html.trim() === '') {
        return (
          <div className={cn('prose prose-neutral dark:prose-invert max-w-none article-content', className)}>
            <p className="text-muted-foreground">Контент пуст</p>
          </div>
        )
      }
      
      if (import.meta.env.DEV) {
        logger.debug('[ArticleContent] Generated HTML:', {
          htmlLength: html.length,
          paragraphCount: (html.match(/<p/g) || []).length,
          brCount: (html.match(/<br/g) || []).length,
          preview: html.substring(0, 200),
        })
      }
      
      return (
        <div 
          className={cn('prose prose-neutral dark:prose-invert max-w-none article-content', className)} 
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      )
    } catch (fallbackError) {
      console.error('[ArticleContent] Error in fallback rendering:', fallbackError)
      // Даже при ошибке показываем что-то, чтобы страница не была пустой
      return (
        <div className={cn('prose prose-neutral dark:prose-invert max-w-none article-content', className)}>
          <p className="text-muted-foreground">Ошибка при отображении контента</p>
          {import.meta.env.DEV && fallbackError instanceof Error && (
            <p className="text-xs text-red-500 mt-2">{fallbackError.message}</p>
          )}
        </div>
      )
    }
  }

  // ВРЕМЕННО: Всегда используем fallback рендеринг
  // Редактор отключен до исправления проблем с хуками
  return (
    <div ref={editorRef} className="article-content-wrapper">
      {renderFallback()}
      {/* Отладочная информация в DEV режиме */}
      {import.meta.env.DEV && (
        <details className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-xs">
          <summary className="cursor-pointer font-semibold text-yellow-600 dark:text-yellow-400">
            🔍 Отладочная информация (DEV)
          </summary>
          <div className="mt-2 space-y-2 text-yellow-700 dark:text-yellow-300">
            <div>
              <strong>Структура контента:</strong>
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-yellow-50 dark:bg-yellow-950 p-2">
                {JSON.stringify(
                  {
                    totalNodes: fateContent.content?.length || 0,
                    paragraphs: fateContent.content?.filter((n: any) => n.type === 'paragraph').length || 0,
                    nodes: fateContent.content?.slice(0, 5).map((n: any) => ({
                      type: n.type,
                      hasContent: !!n.content,
                      contentLength: n.content?.length || 0,
                      hasHardBreak: JSON.stringify(n).includes('hardBreak'),
                    })) || [],
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <div>
              <strong>Исходный контент (первые 500 символов):</strong>
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-yellow-50 dark:bg-yellow-950 p-2">
                {JSON.stringify(content, null, 2).substring(0, 500)}
              </pre>
            </div>
            <div>
              <strong>Сгенерированный HTML (первые 300 символов):</strong>
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-yellow-50 dark:bg-yellow-950 p-2">
                {docToSimpleHTML(fateContent).substring(0, 300)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}

// Простая функция для конвертации документа в HTML (fallback)
function docToSimpleHTML(doc: { type: 'doc'; content: any[] }): string {
  if (!doc || !doc.content) return ''
  
  try {
    return doc.content.map((node: any) => {
      if (!node || typeof node !== 'object') return ''
      
      if (node.type === 'paragraph') {
        const text = extractText(node, true) // С метками (включая hardBreak)
        const textAlign = node.attrs?.textAlign
        const alignAttr = textAlign ? ` style="text-align: ${escapeHtmlSimple(textAlign)}"` : ''
        // Если текст пустой, все равно создаем параграф для сохранения структуры
        // Это важно для сохранения отступов между параграфами
        // Каждый параграф рендерится отдельно, что создает визуальный отступ
        return `<p${alignAttr}>${text || '<br>'}</p>`
      }
      
      // Обрабатываем hardBreak отдельно (на случай, если он на верхнем уровне)
      if (node.type === 'hardBreak' || node.type === 'hard_break') {
        return '<br>'
      }
      if (node.type === 'heading') {
        const level = Math.min(Math.max(node.attrs?.level || 1, 1), 6)
        const text = extractText(node, true) // С метками
        const blockId = node.attrs?.blockId
        const textAlign = node.attrs?.textAlign
        const idAttr = blockId ? ` id="${escapeHtmlSimple(blockId)}" data-block-id="${escapeHtmlSimple(blockId)}"` : ''
        const alignAttr = textAlign ? ` style="text-align: ${escapeHtmlSimple(textAlign)}"` : ''
        return `<h${level}${idAttr}${alignAttr}>${text}</h${level}>`
      }
      if (node.type === 'image') {
        const src = node.attrs?.src || ''
        const alt = node.attrs?.alt || ''
        if (!src) return ''
        return `<img src="${escapeHtmlSimple(src)}" alt="${escapeHtmlSimple(alt)}" class="max-w-full h-auto rounded-lg my-4" />`
      }
      if (node.type === 'bulletList' || node.type === 'orderedList') {
        const tag = node.type === 'bulletList' ? 'ul' : 'ol'
        const items = node.content?.map((item: any) => {
          if (item.type === 'listItem') {
            const text = extractText(item, true) // С метками
            return `<li>${text}</li>`
          }
          return ''
        }).filter(Boolean).join('') || ''
        return `<${tag}>${items}</${tag}>`
      }
      if (node.type === 'blockquote') {
        const text = extractText(node, true) // С метками
        return `<blockquote>${text}</blockquote>`
      }
      if (node.type === 'codeBlock') {
        const text = extractText(node)
        const language = node.attrs?.language || 'plaintext'
        return `<pre class="code-block-wrapper"><code class="language-${escapeHtmlSimple(language)}">${escapeHtmlSimple(text)}</code></pre>`
      }
      if (node.type === 'callout') {
        const variant = node.attrs?.variant || 'info'
        const text = extractText(node, true) // С метками
        return `<aside class="callout-block" data-variant="${escapeHtmlSimple(variant)}">${text}</aside>`
      }
      if (node.type === 'horizontalRule') {
        return '<hr>'
      }
      return ''
    }).filter(Boolean).join('')
  } catch (error) {
    console.error('[ArticleContent] Error in docToSimpleHTML:', error)
    return ''
  }
}

function extractText(node: any, withMarks: boolean = false): string {
  if (!node || typeof node !== 'object') return ''
  
  if (node.type === 'text') {
    let text = String(node.text || '')
    
    // Сначала экранируем HTML в тексте
    text = escapeHtmlSimple(text)
    
    // Если нужно с метками, применяем их (после экранирования)
    if (withMarks && node.marks && Array.isArray(node.marks)) {
      // Применяем метки в обратном порядке (внутренние сначала)
      const sortedMarks = [...node.marks].reverse()
      
      sortedMarks.forEach((mark: any) => {
        if (!mark || typeof mark !== 'object') return
        
        if (mark.type === 'bold') {
          text = `<strong>${text}</strong>`
        } else if (mark.type === 'italic') {
          text = `<em>${text}</em>`
        } else if (mark.type === 'underline') {
          text = `<u>${text}</u>`
        } else if (mark.type === 'strikethrough') {
          text = `<s>${text}</s>`
        } else if (mark.type === 'code') {
          text = `<code>${text}</code>`
        } else if (mark.type === 'link') {
          const href = mark.attrs?.href || '#'
          const target = mark.attrs?.target || ''
          const targetAttr = target ? ` target="${escapeHtmlSimple(target)}"` : ''
          text = `<a href="${escapeHtmlSimple(href)}"${targetAttr}>${text}</a>`
        } else if (mark.type === 'highlight') {
          const color = mark.attrs?.color || '#fef08a'
          text = `<mark style="background-color: ${escapeHtmlSimple(color)}">${text}</mark>`
        } else if (mark.type === 'color') {
          const color = mark.attrs?.color
          if (color) {
            text = `<span style="color: ${escapeHtmlSimple(color)}">${text}</span>`
          }
        } else if (mark.type === 'textStyle') {
          // Обрабатываем textStyle mark (fontSize и color)
          const styleAttrs: string[] = []
          if (mark.attrs?.fontSize) {
            styleAttrs.push(`font-size: ${escapeHtmlSimple(mark.attrs.fontSize)}`)
          }
          if (mark.attrs?.color) {
            styleAttrs.push(`color: ${escapeHtmlSimple(mark.attrs.color)}`)
          }
          if (styleAttrs.length > 0) {
            text = `<span style="${styleAttrs.join('; ')}">${text}</span>`
          }
        }
      })
    }
    
    return text
  }
  
  // Обрабатываем hardBreak (перенос строки)
  if (node.type === 'hardBreak' || node.type === 'hard_break') {
    return '<br>'
  }
  
  if (node.content && Array.isArray(node.content)) {
    // Объединяем дочерние элементы, сохраняя структуру
    // Важно: не используем join('') с разделителями, чтобы hardBreak узлы правильно обрабатывались
    return node.content.map((child: any) => extractText(child, withMarks)).join('')
  }
  return ''
}

function escapeHtmlSimple(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}


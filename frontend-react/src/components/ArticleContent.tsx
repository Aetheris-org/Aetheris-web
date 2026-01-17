/**
 * Компонент для отображения контента статьи через TipTap Editor
 * Использует TipTap в режиме только для чтения для правильного отображения всех блоков
 */
import { useEditor, EditorContent } from '@tiptap/react'
import { useMemo, useEffect, useRef } from 'react'
import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CodeBlockWithCopy } from '@/extensions/code-block-with-copy'
import { Callout } from '@/extensions/callout'
import { BlockAnchor } from '@/extensions/block-anchor'
import { Column, Columns } from '@/extensions/columns'
import { slateToProseMirror } from '@/lib/slate-to-prosemirror'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface ArticleContentProps {
  content: any // Slate JSON или ProseMirror JSON
  className?: string
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  // Конвертируем Slate в ProseMirror, если нужно
  const proseMirrorContent = useMemo(() => {
    if (!content) {
      return { type: 'doc', content: [] }
    }

    // Если это уже ProseMirror формат (есть type: 'doc')
    if (typeof content === 'object' && content.type === 'doc') {
      return content
    }

    // Если это Slate формат, конвертируем
    return slateToProseMirror(content)
  }, [content])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Отключаем некоторые функции, которые не нужны для отображения
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // Используем CodeBlockWithCopy вместо стандартного
        link: false, // Используем кастомный Link
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80 cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlockWithCopy,
      Callout,
      BlockAnchor.configure({
        types: [
          'paragraph',
          'heading',
          'callout',
          'columns',
          'column',
          'blockquote',
          'codeBlock',
        ],
      }),
      Column,
      Columns,
      Placeholder.configure({
        placeholder: '',
      }),
    ],
    content: proseMirrorContent,
    editable: false, // Режим только для чтения
    editorProps: {
      attributes: {
        class: cn(
          'tiptap prose prose-neutral dark:prose-invert max-w-none',
          'text-foreground leading-relaxed break-words',
          className
        ),
      },
    },
  })

  // Обработка HTML-элементов видео и аудио после рендеринга
  useEffect(() => {
    if (!editor || !editorRef.current) return

    const handleVideoAudio = () => {
      // Находим все элементы video и audio внутри редактора
      const videoWrappers = editorRef.current?.querySelectorAll('.editor-video-wrapper')
      const audioWrappers = editorRef.current?.querySelectorAll('.editor-audio-wrapper')
      
      // Убеждаемся, что video и audio элементы правильно отображаются
      videoWrappers?.forEach(wrapper => {
        const video = wrapper.querySelector('video')
        if (video && !video.hasAttribute('controls')) {
          video.setAttribute('controls', '')
        }
      })
      
      audioWrappers?.forEach(wrapper => {
        const audio = wrapper.querySelector('audio')
        if (audio && !audio.hasAttribute('controls')) {
          audio.setAttribute('controls', '')
        }
      })
    }

    // Запускаем после небольшой задержки, чтобы дать TipTap время отрендерить
    const timeoutId = setTimeout(handleVideoAudio, 100)
    return () => clearTimeout(timeoutId)
  }, [editor, proseMirrorContent])

  // В опубликованных статьях добавляем только кратковременную подсветку при клике на якорную ссылку
  // Постоянные индикаторы не нужны - только эффект при навигации

  // Отладочная информация: проверяем, что blockId правильно применены
  useEffect(() => {
    if (!editor || !editorRef.current) return
    
    // Проверяем наличие элементов с blockId после рендеринга
    if (import.meta.env.DEV) {
      const checkAnchors = () => {
        const allAnchors = editorRef.current?.querySelectorAll('[id], [data-block-id]')
        if (allAnchors && allAnchors.length > 0) {
          logger.debug('[ArticleContent] Anchors found after render:', Array.from(allAnchors).map(el => ({
            id: el.id,
            dataBlockId: el.getAttribute('data-block-id'),
            tagName: el.tagName,
            textContent: el.textContent?.substring(0, 50),
          })))
        }
      }
      
      // Проверяем после небольшой задержки, чтобы дать TipTap время отрендерить контент
      const timeoutId = setTimeout(checkAnchors, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [editor, proseMirrorContent])

  // Обработка кликов по якорным ссылкам (href="#anchor-id")
  // Добавляем кратковременную подсветку блока-якоря при клике
  useEffect(() => {
    if (!editor || !editorRef.current) return

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
        // Ищем внутри всего документа, так как TipTap может рендерить контент в разных местах
        const anchorElement = document.querySelector(
          `[id="${anchorId}"], [data-block-id="${anchorId}"]`
        ) as HTMLElement | null
        
        if (import.meta.env.DEV) {
          logger.debug('[ArticleContent] Found anchor element:', anchorElement)
          if (!anchorElement) {
            // Проверяем, какие элементы с id или data-block-id есть в документе
            const allAnchors = document.querySelectorAll('[id], [data-block-id]')
            const anchorsInfo = Array.from(allAnchors).map(el => ({
              id: el.id,
              dataBlockId: el.getAttribute('data-block-id'),
              tagName: el.tagName,
              className: el.className,
              textContent: el.textContent?.substring(0, 50),
            }))
            logger.debug('[ArticleContent] All anchors in document:', anchorsInfo)
            logger.debug('[ArticleContent] Looking for anchorId:', anchorId)
            logger.debug('[ArticleContent] Editor content:', editor.getJSON())
          }
        }
        
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
          // Если не нашли, попробуем найти внутри редактора
          const editorElement = editorRef.current
          const anchorInEditor = editorElement?.querySelector(
            `[id="${anchorId}"], [data-block-id="${anchorId}"]`
          ) as HTMLElement | null
          
          if (anchorInEditor) {
            anchorInEditor.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
            
            anchorInEditor.classList.add('anchor-highlight')
            
            setTimeout(() => {
              anchorInEditor.classList.remove('anchor-highlight')
            }, 2000)
          } else if (import.meta.env.DEV) {
            logger.warn('[ArticleContent] Anchor element not found:', anchorId)
          }
        }
      }
    }

    const editorElement = editorRef.current
    editorElement?.addEventListener('click', handleClick)
    
    return () => {
      editorElement?.removeEventListener('click', handleClick)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div ref={editorRef}>
      <EditorContent editor={editor} />
    </div>
  )
}


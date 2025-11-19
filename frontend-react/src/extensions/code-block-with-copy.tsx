import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import { Copy, Check } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import { cn } from '@/lib/utils'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { useState } from 'react'
import hljs from 'highlight.js'

const lowlight = createLowlight(common)

// Функция для автоматического определения языка по содержимому кода используя highlight.js
function detectLanguage(code: string): string {
  if (!code || !code.trim()) return 'plaintext'
  
  const trimmed = code.trim()
  
  // Не определяем язык для очень коротких фрагментов (меньше 10 символов)
  if (trimmed.length < 10) return 'plaintext'
  
  try {
    // Используем highlight.js для автоматического определения языка
    // Ограничиваем список языков для более точного определения
    const result = hljs.highlightAuto(trimmed, [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
      'html', 'css', 'json', 'xml', 'sql', 'bash', 'shell', 'php',
      'ruby', 'go', 'rust', 'kotlin', 'swift', 'scala', 'r', 'matlab'
    ])
    
    // Используем язык только если уверенность достаточно высока
    // highlightAuto возвращает relevance - чем выше, тем увереннее
    if (result.language && result.relevance && result.relevance > 2) {
      return result.language
    }
    
    return 'plaintext'
  } catch (err) {
    // Fallback на plaintext, если highlight.js не может определить
    return 'plaintext'
  }
}

// Функция для получения читаемого названия языка
function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    php: 'PHP',
    ruby: 'Ruby',
    go: 'Go',
    rust: 'Rust',
    swift: 'Swift',
    kotlin: 'Kotlin',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    xml: 'XML',
    sql: 'SQL',
    bash: 'Bash',
    shell: 'Shell',
    plaintext: 'Plain Text',
    text: 'Text',
  }
  return labels[language.toLowerCase()] || language.charAt(0).toUpperCase() + language.slice(1)
}

const CodeBlockHeader = ({ node, editor, detectedLanguage }: { 
  node: ProseMirrorNode
  editor: any
  detectedLanguage?: string | null
}) => {
  const [copied, setCopied] = useState(false)

  const language = node.attrs.language || detectedLanguage || 'plaintext'
  const languageLabel = getLanguageLabel(language)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const text = node.textContent
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="code-block-header">
      <span className="text-xs font-medium uppercase tracking-wide code-block-language">
        {languageLabel}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'h-6 w-6 flex items-center justify-center rounded shrink-0',
          'text-muted-foreground hover:text-primary',
          'hover:bg-primary/10 active:bg-primary/15',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2'
        )}
        title={copied ? 'Скопировано!' : 'Скопировать код'}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 transition-transform duration-150" />
        ) : (
          <Copy className="h-3.5 w-3.5 transition-transform duration-150" />
        )}
      </button>
    </div>
  )
}

export const CodeBlockWithCopy = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: 'plaintext',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.code-block-wrapper',
        getAttrs: (node) => {
          const element = node as HTMLElement
          // Извлекаем язык из data-language атрибута
          const language = element.getAttribute('data-language') || 'plaintext'
          return { language }
        },
        // Извлекаем содержимое из code элемента внутри .code-block-content > pre > code
        contentElement: (node) => {
          const wrapper = node as HTMLElement
          // Ищем структуру: .code-block-content > pre > code
          const codeContent = wrapper.querySelector('.code-block-content')
          if (codeContent) {
            const preElement = codeContent.querySelector('pre')
            if (preElement) {
              const codeElement = preElement.querySelector('code')
              if (codeElement) {
                return codeElement
              }
              // Если code нет, используем pre
              return preElement
            }
          }
          // Fallback: ищем code напрямую в wrapper
          const codeElement = wrapper.querySelector('code')
          if (codeElement) {
            return codeElement
          }
          // Fallback: ищем pre напрямую
          const preElement = wrapper.querySelector('pre')
          if (preElement) {
            return preElement
          }
          return null
        },
      },
      {
        tag: 'pre',
        getAttrs: (node) => {
          const element = node as HTMLElement
          const codeElement = element.querySelector('code')
          if (codeElement) {
            const classList = codeElement.classList
            // Извлекаем язык из класса language-xxx
            for (const className of classList) {
              if (className.startsWith('language-')) {
                const language = className.replace('language-', '')
                return { language }
              }
            }
          }
          return { language: 'plaintext' }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const language = node.attrs.language || 'plaintext'
    
    // Определяем язык автоматически, если не указан
    let detectedLanguage = language
    if ((!node.attrs.language || node.attrs.language === 'plaintext') && node.textContent.trim().length >= 10) {
      const detected = detectLanguage(node.textContent)
      if (detected !== 'plaintext') {
        detectedLanguage = detected
      }
    }
    
    const finalLanguage = detectedLanguage !== 'plaintext' ? detectedLanguage : language
    const finalLanguageLabel = getLanguageLabel(finalLanguage)
    
    // SVG иконки для кнопки копирования (сохраняем в data-атрибутах)
    const copyIconSvg = '<svg class="h-3.5 w-3.5 copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>'
    const checkIconSvg = '<svg class="h-3.5 w-3.5 check-icon hidden text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>'
    
    // Возвращаем структуру с header и кнопкой копирования
    // TipTap renderHTML поддерживает вложенные массивы
    // Используем data-атрибуты для сохранения информации, которая будет использована на review этапе
    return [
      'div',
      {
        class: 'relative group mb-6 rounded-lg overflow-hidden code-block-wrapper',
        'data-language': finalLanguage,
        'data-language-label': finalLanguageLabel,
        'data-copy-icon-svg': copyIconSvg,
        'data-check-icon-svg': checkIconSvg,
      },
      [
        'div',
        { class: 'flex items-center justify-between gap-3 px-3 py-2 code-block-header' },
        [
          'span',
          { class: 'text-xs font-medium uppercase tracking-wide code-block-language' },
          finalLanguageLabel,
        ],
        [
          'button',
          {
            type: 'button',
            class: 'code-block-copy-btn',
            title: 'Скопировать код',
            'aria-label': 'Скопировать код',
          },
          '', // Пустая строка для button (иконки будут добавлены через JavaScript)
        ],
      ],
      [
        'div',
        { class: 'code-block-content' },
        [
          'pre',
          { class: 'overflow-x-auto p-4 text-sm m-0' },
          [
            'code',
            {
              class: `language-${finalLanguage}`,
              spellcheck: 'false',
            },
            0, // 0 означает, что здесь будет контент узла
          ],
        ],
      ],
    ]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, editor }) => {
      if (import.meta.env.DEV) {
        console.log('[CodeBlockWithCopy] addNodeView called, language:', node.attrs.language)
      }
      
      const dom = document.createElement('div')
      dom.className = 'relative group mb-6 rounded-lg overflow-hidden code-block-wrapper'
      
      // Создаем шапку
      const headerContainer = document.createElement('div')
      headerContainer.className = 'code-block-header'
      dom.appendChild(headerContainer)
      
      // Создаем контейнер для pre/code (используем существующий рендеринг CodeBlockLowlight)
      const codeContainer = document.createElement('div')
      codeContainer.className = 'code-block-content'
      
      const pre = document.createElement('pre')
      pre.className = 'overflow-x-auto p-4 text-sm m-0'
      pre.setAttribute('spellcheck', 'false') // Отключаем проверку орфографии
      pre.setAttribute('autocorrect', 'off')
      pre.setAttribute('autocapitalize', 'off')
      
      let currentLanguage = node.attrs.language || 'plaintext'
      let detectedLang: string | null = null
      
      // Автоматически определяем язык, если он не указан (только визуально, без изменения узла)
      // Определяем только если код достаточно длинный
      if ((!node.attrs.language || node.attrs.language === 'plaintext') && node.textContent.trim().length >= 10) {
        const detected = detectLanguage(node.textContent)
        if (detected !== 'plaintext') {
          detectedLang = detected
          currentLanguage = detected
        }
      }
      
      // ВАЖНО: ProseMirror ожидает, что contentDOM будет прямым дочерним элементом dom
      // Но нам нужна структура: dom > headerContainer + codeContainer > pre
      // CodeBlockLowlight обычно использует pre как contentDOM
      // Мы используем pre как contentDOM напрямую - ProseMirror будет вставлять текст в pre
      // Подсветка синтаксиса будет применяться к содержимому pre через lowlight
      // Lowlight автоматически создаст code элемент внутри pre для подсветки
      codeContainer.appendChild(pre)
      dom.appendChild(codeContainer)
      
      // Рендерим React компонент для шапки
      const headerRoot = createRoot(headerContainer)
      
      // Сохраняем текущее состояние для компонента
      let currentDetectedLang = detectedLang
      let lastNodeAttrs = { ...node.attrs }
      let lastTextContent = node.textContent
      let isUpdating = false
      
      // Функция для обновления шапки
      const updateHeader = (updatedNode: ProseMirrorNode, detectedLang: string | null) => {
        if (isUpdating) return // Предотвращаем обновление во время обновления
        headerRoot.render(<CodeBlockHeader node={updatedNode} editor={editor} detectedLanguage={detectedLang} />)
      }
      
      updateHeader(node, currentDetectedLang)
      
      // Предотвращаем клики на шапке от всплытия, но НЕ блокируем pointer-events
      headerContainer.addEventListener('click', (e) => {
        // Останавливаем всплытие только для элементов внутри header (кнопка копирования и т.д.)
        if (e.target !== headerContainer && !headerContainer.contains(e.target as Node)) {
          return
        }
        e.stopPropagation()
      }, true)
      
      // Убеждаемся, что pre элемент может получать клики и фокус
      // ProseMirror автоматически установит contenteditable на contentDOM (pre)
      pre.style.pointerEvents = 'auto'
      codeContainer.style.pointerEvents = 'auto'
      
      // Убеждаемся, что header не блокирует клики на pre
      headerContainer.style.pointerEvents = 'auto'
      
      // ВАЖНО: ProseMirror требует, чтобы contentDOM был прямым дочерним элементом dom
      // Но у нас структура: dom > [headerContainer, codeContainer > pre]
      // Мы используем pre как contentDOM (стандартный подход для CodeBlockLowlight)
      // ProseMirror будет вставлять текст в pre, а lowlight автоматически применит подсветку синтаксиса
      
      return {
        dom,
        contentDOM: pre, // Используем pre как contentDOM - это стандартный подход для CodeBlockLowlight
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }
          
          // Предотвращаем обновление во время обработки событий
          if (isUpdating) {
            return true
          }
          
          isUpdating = true
          
          // Проверяем, действительно ли что-то изменилось
          const attrsChanged = JSON.stringify(updatedNode.attrs) !== JSON.stringify(lastNodeAttrs)
          const textChanged = updatedNode.textContent !== lastTextContent
          
          // Обновляем язык визуально, если он изменился (без изменения атрибутов узла во время редактирования)
          // Определяем язык только если код достаточно длинный (>= 10 символов)
          let updatedLanguage = updatedNode.attrs.language || 'plaintext'
          let updatedDetectedLang: string | null = null
          
          if ((!updatedNode.attrs.language || updatedNode.attrs.language === 'plaintext') && updatedNode.textContent.trim().length >= 10) {
            const detected = detectLanguage(updatedNode.textContent)
            if (detected !== 'plaintext') {
              updatedDetectedLang = detected
              updatedLanguage = detected
            }
          } else if (updatedNode.textContent.trim().length < 10) {
            // Если код стал слишком коротким, сбрасываем определение
            updatedDetectedLang = null
            updatedLanguage = updatedNode.attrs.language || 'plaintext'
          }
          
          // Обновляем класс языка на pre (lowlight будет использовать его для подсветки)
          if (updatedLanguage !== currentLanguage) {
            // Lowlight автоматически создаст code элемент с нужным классом
            // Нам нужно только убедиться, что pre имеет правильный класс для lowlight
            currentLanguage = updatedLanguage
          }
          
          // Обновляем обнаруженный язык если изменился
          if (updatedDetectedLang !== currentDetectedLang) {
            currentDetectedLang = updatedDetectedLang
          }
          
          // Обновляем шапку только если действительно изменился язык или атрибуты
          // НЕ обновляем при изменении текста, чтобы не мешать редактированию
          if (attrsChanged || updatedDetectedLang !== currentDetectedLang) {
            // Используем setTimeout для отложенного обновления, чтобы избежать проблем с событиями
            setTimeout(() => {
              updateHeader(updatedNode, currentDetectedLang)
              isUpdating = false
            }, 0)
          } else {
            isUpdating = false
          }
          
          // Обновляем сохраненные значения
          lastNodeAttrs = { ...updatedNode.attrs }
          lastTextContent = updatedNode.textContent
          
          return true
        },
        destroy: () => {
          headerRoot.unmount()
        },
      }
    }
  },
}).configure({
  lowlight,
})


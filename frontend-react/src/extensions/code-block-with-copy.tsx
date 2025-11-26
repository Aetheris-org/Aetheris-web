import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import { Copy, Check } from 'lucide-react'
import { createRoot, type Root } from 'react-dom/client'
import { cn } from '@/lib/utils'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { useState } from 'react'
import hljs from 'highlight.js'
import { logger } from '@/lib/logger'
// Импортируем дополнительные языки для lowlight
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import swift from 'highlight.js/lib/languages/swift'
import kotlin from 'highlight.js/lib/languages/kotlin'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import shell from 'highlight.js/lib/languages/shell'

// Создаем lowlight с поддержкой всех необходимых языков
const lowlight = createLowlight(common)
// Регистрируем дополнительные языки
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('cpp', cpp)
lowlight.register('csharp', csharp)
lowlight.register('php', php)
lowlight.register('ruby', ruby)
lowlight.register('go', go)
lowlight.register('rust', rust)
lowlight.register('swift', swift)
lowlight.register('kotlin', kotlin)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('json', json)
lowlight.register('sql', sql)
lowlight.register('bash', bash)
lowlight.register('shell', shell)

// Функция для автоматического определения языка по содержимому кода используя highlight.js
function detectLanguage(code: string): string {
  if (!code || !code.trim()) return 'plaintext'
  
  const trimmed = code.trim()
  
  // Не определяем язык для очень коротких фрагментов (меньше 10 символов)
  if (trimmed.length < 10) return 'plaintext'
  
  try {
    // Используем highlight.js для автоматического определения языка
    const result = hljs.highlightAuto(trimmed, [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
      'html', 'css', 'json', 'xml', 'sql', 'bash', 'shell', 'php',
      'ruby', 'go', 'rust', 'kotlin', 'swift', 'scala', 'r', 'matlab'
    ])
    
    // Используем язык только если уверенность достаточно высока
    if (result.language && result.relevance && result.relevance >= 1) {
      return result.language
    }
    
    return 'plaintext'
  } catch (err) {
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

const CodeBlockHeader = ({ 
  node, 
  language 
}: { 
  node: ProseMirrorNode
  language: string
}) => {
  const [copied, setCopied] = useState(false)

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
      logger.error('Failed to copy text:', err)
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
          const language = element.getAttribute('data-language') || 'plaintext'
          return { language }
        },
        contentElement: (node) => {
          const wrapper = node as HTMLElement
          const codeContent = wrapper.querySelector('.code-block-content')
          if (codeContent) {
            const preElement = codeContent.querySelector('pre')
            if (preElement) {
              const codeElement = preElement.querySelector('code')
              if (codeElement) {
                return codeElement
              }
              return preElement
            }
          }
          const codeElement = wrapper.querySelector('code')
          if (codeElement) {
            return codeElement
          }
          return wrapper.querySelector('pre') || wrapper
        },
      },
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (node) => {
          const element = node as HTMLElement
          const codeElement = element.querySelector('code')
          const language = codeElement?.className.match(/language-(\w+)/)?.[1] || 'plaintext'
          return { language }
        },
      },
    ]
  },

  addNodeView() {
    return ({ node }) => {
      // Создаем основной контейнер
      const dom = document.createElement('div')
      dom.className = 'relative group mb-6 rounded-lg overflow-hidden code-block-wrapper'
      
      // Создаем контейнер для шапки
      const headerContainer = document.createElement('div')
      headerContainer.className = 'code-block-header'
      dom.appendChild(headerContainer)
      
      // Создаем контейнер для кода
      const codeContainer = document.createElement('div')
      codeContainer.className = 'code-block-content'
      
      const pre = document.createElement('pre')
      pre.className = 'overflow-x-auto p-4 text-sm m-0'
      pre.setAttribute('spellcheck', 'false')
      pre.setAttribute('autocorrect', 'off')
      pre.setAttribute('autocapitalize', 'off')
      
      const code = document.createElement('code')
      code.className = 'hljs'
      
      pre.appendChild(code)
      codeContainer.appendChild(pre)
      dom.appendChild(codeContainer)
      
      // Кеш для определения языка (чтобы не вызывать detectLanguage слишком часто)
      let languageCache: { text: string; language: string } | null = null
      
      // Определяем язык для отображения
      const getDisplayLanguage = (node: ProseMirrorNode): string => {
        const attrLanguage = node.attrs.language || 'plaintext'
        if (attrLanguage !== 'plaintext') {
          return attrLanguage
        }
        
        const textContent = node.textContent.trim()
        if (textContent.length < 10) {
          return 'plaintext'
        }
        
        // Используем кеш, если содержимое не изменилось
        if (languageCache && languageCache.text === textContent) {
          return languageCache.language
        }
        
        // Определяем язык только если содержимое изменилось
        const detected = detectLanguage(textContent)
        languageCache = { text: textContent, language: detected }
        
        return detected !== 'plaintext' ? detected : 'plaintext'
      }
      
      // Функция для экранирования HTML
      const escapeHtml = (text: string): string => {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
      }
      
      // Функция для применения подсветки синтаксиса
      const applyHighlighting = (text: string, language: string) => {
        if (!text.trim()) {
          code.textContent = text
          return
        }
        
        const lang = language !== 'plaintext' ? language : undefined
        
        if (lang) {
          try {
            const result = lowlight.highlight(lang, text)
            const html = result.children.map((child: any) => {
              if (typeof child === 'string') {
                return escapeHtml(child)
              }
              if (child.type === 'element' && child.tagName === 'span') {
                const className = Array.isArray(child.properties?.className) 
                  ? child.properties.className.join(' ') 
                  : child.properties?.className || ''
                const content = child.children.map((c: any) => {
                  if (typeof c === 'string') {
                    return escapeHtml(c)
                  }
                  if (c.type === 'text') {
                    return escapeHtml(c.value || '')
                  }
                  return ''
                }).join('')
                return `<span class="${escapeHtml(className)}">${content}</span>`
              }
              if (child.type === 'text') {
                return escapeHtml(child.value || '')
              }
              return ''
            }).join('')
            code.innerHTML = html
          } catch (error) {
            code.textContent = text
          }
        } else {
          code.textContent = text
        }
      }
      
      // Инициализация
      // Определяем язык только если содержимое не пустое, чтобы не блокировать UI при создании пустого блока
      const initialText = node.textContent.trim()
      let currentDisplayLanguage = 'plaintext'
      let lastTextContent = initialText // Отслеживаем содержимое для оптимизации
      if (initialText.length >= 10) {
        currentDisplayLanguage = getDisplayLanguage(node)
      } else if (node.attrs.language && node.attrs.language !== 'plaintext') {
        currentDisplayLanguage = node.attrs.language
      }
      
      let headerRoot: Root | null = null
      
      // Рендерим шапку сразу
      headerRoot = createRoot(headerContainer)
      headerRoot.render(<CodeBlockHeader node={node} language={currentDisplayLanguage} />)
      
      // Обновляем класс языка
      if (currentDisplayLanguage && currentDisplayLanguage !== 'plaintext') {
        code.className = `hljs language-${currentDisplayLanguage}`
      }
      
      // Предотвращаем клики на шапке от всплытия
      headerContainer.addEventListener('click', (e) => {
        if (e.target !== headerContainer && !headerContainer.contains(e.target as Node)) {
          return
        }
        e.stopPropagation()
      }, true)
      
      // ВРЕМЕННО ОТКЛЮЧАЕМ MutationObserver, чтобы избежать зависания
      // Подсветка будет применяться только через метод update
      // Это предотвращает бесконечные циклы и зависания
      
      return {
        dom,
        contentDOM: pre,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }
          
          // Обновляем язык и применяем подсветку с debounce
          const newText = updatedNode.textContent.trim()
          if (newText !== lastTextContent) {
            lastTextContent = newText
            
            // Определяем язык только если содержимое достаточно длинное
            if (newText.length >= 10) {
              const newLang = getDisplayLanguage(updatedNode)
              if (newLang !== currentDisplayLanguage) {
                currentDisplayLanguage = newLang
                if (currentDisplayLanguage && currentDisplayLanguage !== 'plaintext') {
                  code.className = `hljs language-${currentDisplayLanguage}`
                } else {
                  code.className = 'hljs'
                }
                
                // Обновляем header с новым языком
                if (headerRoot) {
                  headerRoot.render(<CodeBlockHeader node={updatedNode} language={currentDisplayLanguage} />)
                }
              }
            } else if (newText.length === 0 && currentDisplayLanguage !== 'plaintext') {
              // Сбрасываем язык только если содержимое полностью пустое
              currentDisplayLanguage = 'plaintext'
              code.className = 'hljs'
              if (headerRoot) {
                headerRoot.render(<CodeBlockHeader node={updatedNode} language={currentDisplayLanguage} />)
              }
            }
            
            // Применяем подсветку с debounce через requestAnimationFrame
            // Это предотвращает зависание и дает ProseMirror время обновить DOM
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const text = code.textContent || pre.textContent || ''
                if (text && currentDisplayLanguage !== 'plaintext') {
                  applyHighlighting(text, currentDisplayLanguage)
                }
              })
            })
          }
          
          return true
        },
        destroy: () => {
          // Уничтожаем React root асинхронно, чтобы избежать предупреждений React
          if (headerRoot) {
            requestAnimationFrame(() => {
              if (headerRoot) {
                headerRoot.unmount()
                headerRoot = null
              }
            })
          }
        },
      }
    }
  },
}).configure({
  lowlight,
})

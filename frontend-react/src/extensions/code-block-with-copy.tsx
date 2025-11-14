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
    <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-2 rounded-t-lg">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {languageLabel}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'h-6 w-6 flex items-center justify-center rounded-sm',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        title={copied ? 'Скопировано!' : 'Скопировать код'}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}

export const CodeBlockWithCopy = CodeBlockLowlight.extend({
  addNodeView() {
    return ({ node, HTMLAttributes, editor }) => {
      const dom = document.createElement('div')
      dom.className = 'relative group mb-6 rounded-lg border border-border/70 bg-muted/20 overflow-hidden'
      
      // Создаем шапку
      const headerContainer = document.createElement('div')
      headerContainer.className = 'code-block-header'
      dom.appendChild(headerContainer)
      
      // Создаем контейнер для pre/code (используем существующий рендеринг CodeBlockLowlight)
      const codeContainer = document.createElement('div')
      codeContainer.className = 'code-block-content'
      
      const pre = document.createElement('pre')
      pre.className = 'overflow-x-auto p-4 text-sm m-0'
      
      const code = document.createElement('code')
      code.setAttribute('spellcheck', 'false') // Отключаем проверку орфографии
      code.setAttribute('autocorrect', 'off')
      code.setAttribute('autocapitalize', 'off')
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
      
      code.className = `language-${currentLanguage}`
      
      pre.appendChild(code)
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
      
      // Предотвращаем клики на шапке от всплытия
      headerContainer.addEventListener('click', (e) => {
        e.stopPropagation()
      }, true)
      
      return {
        dom,
        contentDOM: code, // Используем contentDOM для редактирования, CodeBlockLowlight автоматически применит подсветку
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
          
          if (updatedLanguage !== currentLanguage) {
            code.className = `language-${updatedLanguage}`
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


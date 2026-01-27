/**
 * Fate Engine - Блок кода
 * Узел для блоков кода с подсветкой синтаксиса
 */

import type { FateNodeDefinition } from '../types'
import { createLowlight, common } from 'lowlight'
import hljs from 'highlight.js'
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

// Функция для автоматического определения языка (используется в toDOM)
function _detectLanguage(code: string): string {
  if (!code || !code.trim()) return 'plaintext'
  
  const trimmed = code.trim()
  if (trimmed.length < 10) return 'plaintext'
  
  try {
    const result = hljs.highlightAuto(trimmed, [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
      'html', 'css', 'json', 'xml', 'sql', 'bash', 'shell', 'php',
      'ruby', 'go', 'rust', 'kotlin', 'swift', 'scala', 'r', 'matlab'
    ])
    
    if (result.language && result.relevance && result.relevance >= 1) {
      return result.language
    }
    
    return 'plaintext'
  } catch (err) {
    return 'plaintext'
  }
}

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

export const CodeBlock: FateNodeDefinition = {
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  attrs: {
    language: {
      default: 'plaintext',
      parseDOM: (dom: HTMLElement) => {
        const codeElement = dom.querySelector('code')
        if (codeElement) {
          const className = codeElement.className
          const match = className.match(/language-(\w+)/)
          return match ? match[1] : 'plaintext'
        }
        return 'plaintext'
      },
      toDOM: (language: string) => {
        return { 'data-language': language }
      },
    },
  },
  parseDOM: [
    {
      tag: 'pre',
      preserveWhitespace: 'full',
      getAttrs: (dom: HTMLElement) => {
        const codeElement = dom.querySelector('code')
        const language = codeElement?.className.match(/language-(\w+)/)?.[1] || 'plaintext'
        return { language }
      },
    },
    {
      tag: 'div.code-block-wrapper',
      getAttrs: (dom: HTMLElement) => {
        const language = dom.getAttribute('data-language') || 'plaintext'
        return { language }
      },
    },
  ],
  toDOM: (node) => {
    const language = node.attrs?.language || 'plaintext'
    const languageLabel = getLanguageLabel(language)
    
    // Создаем структуру с шапкой и кодом
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper relative group mb-6 rounded-lg overflow-hidden'
    
    const header = document.createElement('div')
    header.className = 'code-block-header flex items-center justify-between px-4 py-2 bg-muted border-b border-border'
    
    const languageSpan = document.createElement('span')
    languageSpan.className = 'text-xs font-medium uppercase tracking-wide text-muted-foreground'
    languageSpan.textContent = languageLabel
    
    const copyButton = document.createElement('button')
    copyButton.className = 'h-6 w-6 flex items-center justify-center rounded shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10'
    copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"/></svg>'
    copyButton.title = 'Скопировать код'
    
    header.appendChild(languageSpan)
    header.appendChild(copyButton)
    
    const pre = document.createElement('pre')
    pre.className = 'overflow-x-auto p-4 text-sm m-0 bg-muted/50'
    pre.setAttribute('spellcheck', 'false')
    
    const code = document.createElement('code')
    code.className = language !== 'plaintext' ? `hljs language-${language}` : 'hljs'
    
    pre.appendChild(code)
    
    wrapper.appendChild(header)
    wrapper.appendChild(pre)
    
    // Обработчик копирования
    copyButton.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      const text = node.text || ''
      try {
        await navigator.clipboard.writeText(text)
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>'
        setTimeout(() => {
          copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"/></svg>'
        }, 2000)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    })
    
    // Возвращаем [wrapper, code] где code - это contentDOM
    return [wrapper, code]
  },
  addCommands: () => ({
    setCodeBlock: (_attrs?: { language?: string }) => () => {
      // Команда для установки блока кода
      return true
    },
    toggleCodeBlock: (_attrs?: { language?: string }) => () => {
      // Команда для переключения блока кода
      return true
    },
  }),
}

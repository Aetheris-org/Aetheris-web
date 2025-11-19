/**
 * Утилита для преобразования Slate JSON в HTML
 * KeystoneJS document field использует Slate формат
 * 
 * Поддерживаемые типы блоков:
 * - paragraph
 * - heading (h1-h6)
 * - blockquote
 * - code (inline code)
 * - code-block
 * - bullet-list / ordered-list
 * - list-item
 * - link
 * 
 * Поддерживаемое форматирование:
 * - bold
 * - italic
 * - code (inline)
 * - underline
 * - strikethrough
 */

interface SlateNode {
  type?: string;
  children?: SlateNode[];
  text?: string;
  level?: number;
  url?: string;
  [key: string]: any;
}

/**
 * Преобразует Slate JSON в HTML
 * @param slateContent - Slate JSON (массив блоков или объект с полем document)
 * @returns HTML строка
 */
export function slateToHtml(slateContent: any): string {
  if (!slateContent) {
    return '';
  }

  // Логируем входные данные для отладки
  if (import.meta.env.DEV) {
    console.log('[slateToHtml] Input:', {
      type: typeof slateContent,
      isArray: Array.isArray(slateContent),
      isObject: typeof slateContent === 'object' && slateContent !== null,
      hasDocument: typeof slateContent === 'object' && slateContent?.document !== undefined,
      preview: JSON.stringify(slateContent).substring(0, 500),
    });
  }

  // Если это массив блоков, обрабатываем напрямую
  let blocks: SlateNode[] = [];
  if (Array.isArray(slateContent)) {
    blocks = slateContent;
    if (import.meta.env.DEV) {
      console.log('[slateToHtml] Processing as array, blocks count:', blocks.length);
    }
  } else if (typeof slateContent === 'object' && slateContent !== null) {
    // KeystoneJS может возвращать document в разных форматах
    if (slateContent.document) {
      // Формат: { document: [...] } или { document: { children: [...] } }
      if (Array.isArray(slateContent.document)) {
        blocks = slateContent.document;
        if (import.meta.env.DEV) {
          console.log('[slateToHtml] Processing document as array, blocks count:', blocks.length);
        }
      } else if (slateContent.document.children && Array.isArray(slateContent.document.children)) {
        blocks = slateContent.document.children;
        if (import.meta.env.DEV) {
          console.log('[slateToHtml] Processing document.children, blocks count:', blocks.length);
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn('[slateToHtml] Unknown document format:', slateContent.document);
        }
      }
    } else if (slateContent.children && Array.isArray(slateContent.children)) {
      // Формат: { children: [...] }
      blocks = slateContent.children;
      if (import.meta.env.DEV) {
        console.log('[slateToHtml] Processing children, blocks count:', blocks.length);
      }
    } else if (slateContent.type === 'doc' && Array.isArray(slateContent.content)) {
      // ProseMirror формат: { type: 'doc', content: [...] }
      // Это может прийти, если конвертация не сработала
      blocks = slateContent.content;
      if (import.meta.env.DEV) {
        console.log('[slateToHtml] Processing ProseMirror doc.content, blocks count:', blocks.length);
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('[slateToHtml] Unknown object format:', Object.keys(slateContent));
      }
    }
  } else if (typeof slateContent === 'string') {
    // Если это JSON строка, парсим её
    try {
      const parsed = JSON.parse(slateContent);
      if (Array.isArray(parsed)) {
        blocks = parsed;
      } else if (parsed.document) {
        if (Array.isArray(parsed.document)) {
          blocks = parsed.document;
        } else if (parsed.document.children && Array.isArray(parsed.document.children)) {
          blocks = parsed.document.children;
        }
      } else if (parsed.children && Array.isArray(parsed.children)) {
        blocks = parsed.children;
      } else if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
        // ProseMirror формат
        blocks = parsed.content;
      }
    } catch (e) {
      // Если не JSON, возвращаем как есть (возможно, это уже HTML)
      return slateContent;
    }
  }

  if (blocks.length === 0) {
    if (import.meta.env.DEV) {
      console.warn('[slateToHtml] No blocks found, returning empty string');
    }
    return '';
  }

  if (import.meta.env.DEV) {
    console.log('[slateToHtml] Processing blocks:', {
      count: blocks.length,
      types: blocks.map(b => b.type),
      firstBlock: JSON.stringify(blocks[0]).substring(0, 200),
    });
  }

  // Преобразуем каждый блок в HTML
  const htmlBlocks = blocks.map((block) => {
    const html = renderBlock(block);
    if (import.meta.env.DEV && !html) {
      console.warn('[slateToHtml] Block rendered empty HTML:', block.type, block);
    }
    return html;
  }).filter(Boolean);
  const result = htmlBlocks.join('');
  
  if (import.meta.env.DEV) {
    console.log('[slateToHtml] Result HTML:', {
      length: result.length,
      preview: result.substring(0, 500),
      fullHTML: result, // Полный HTML для отладки
      blockCount: htmlBlocks.length,
      blockTypes: blocks.map(b => b.type),
    });
  }
  
  return result;
}

/**
 * Рендерит один блок Slate в HTML
 */
function renderBlock(node: SlateNode): string {
  if (!node) {
    return '';
  }

  const type = node.type || 'paragraph';
  const children = node.children || [];

  // Функция для получения атрибутов blockId (для anchor блоков)
  // blockId может быть в самом узле или сохранен через маркер в тексте
  const getBlockIdAttrs = (node: SlateNode, nodeChildren: SlateNode[] = []): string => {
    let blockId = node.blockId || node.attrs?.blockId
    const searchChildren = nodeChildren.length > 0 ? nodeChildren : children
    
    // Если blockId не найден напрямую, ищем маркер в тексте первого дочернего элемента
    if (!blockId && searchChildren.length > 0) {
      // Ищем текстовый узел напрямую в children
      const directTextNode = searchChildren.find((child: any) => 
        child && typeof child === 'object' && child.text !== undefined && !child.type
      )
      
      if (directTextNode && directTextNode.text) {
        const markerMatch = directTextNode.text.match(/^\u200B\u200B\u200B\[ANCHOR:([^\]]+)\]\u200B\u200B\u200B/);
        if (markerMatch) {
          blockId = markerMatch[1];
        }
      } else {
        // Ищем в первом paragraph
        const firstChild = searchChildren[0];
        if (firstChild && firstChild.type === 'paragraph' && firstChild.children) {
          for (const child of firstChild.children) {
            if (child && typeof child === 'object' && child.text) {
              const markerMatch = child.text.match(/^\u200B\u200B\u200B\[ANCHOR:([^\]]+)\]\u200B\u200B\u200B/);
              if (markerMatch) {
                blockId = markerMatch[1];
                break;
              }
            }
          }
        } else if (firstChild && firstChild.text) {
          // Если первый child - это текстовый узел
          const markerMatch = firstChild.text.match(/^\u200B\u200B\u200B\[ANCHOR:([^\]]+)\]\u200B\u200B\u200B/);
          if (markerMatch) {
            blockId = markerMatch[1];
          }
        }
      }
    }
    
    if (blockId) {
      return ` id="${escapeHtml(blockId)}" data-block-id="${escapeHtml(blockId)}"`
    }
    return ''
  }

  switch (type) {
    case 'paragraph':
      const paragraphContent = renderChildren(children);
      const paragraphAttrs = getBlockIdAttrs(node, children);
      // Если параграф пустой, возвращаем <br> для сохранения структуры
      return `<p${paragraphAttrs}>${paragraphContent || '<br>'}</p>`;

    case 'heading':
      const level = node.level || 1;
      const headingContent = renderChildren(children);
      const tag = `h${Math.min(Math.max(level, 1), 6)}`;
      const headingAttrs = getBlockIdAttrs(node, children);
      return `<${tag}${headingAttrs}>${headingContent}</${tag}>`;

    case 'blockquote':
      // Проверяем, является ли это callout (сохраненным как blockquote с variant)
      // Вариант 1: variant в самом blockquote (старый формат, для обратной совместимости)
      // Вариант 2: variant в первом дочернем элементе через data-callout-variant (старый формат)
      // Вариант 3: variant через маркер в тексте первого paragraph (новый формат)
      let calloutVariant = node.variant || node['data-callout-variant'] || node.attrs?.variant;
      
      // Если variant не найден, проверяем маркер в тексте первого paragraph
      if (!calloutVariant && children.length > 0) {
        const firstChild = children[0];
        // Старый формат: data-callout-variant в paragraph
        if (firstChild && firstChild['data-callout-variant']) {
          calloutVariant = firstChild['data-callout-variant'];
        }
        // Новый формат: маркер в тексте первого paragraph
        if (!calloutVariant && firstChild && firstChild.type === 'paragraph' && firstChild.children) {
          // Ищем маркер в первом текстовом узле
          for (const child of firstChild.children) {
            if (child && typeof child === 'object' && child.text) {
              const markerMatch = child.text.match(/^\u200B\u200B\u200B\[CALLOUT:([^\]]+)\]\u200B\u200B\u200B/);
              if (markerMatch) {
                calloutVariant = markerMatch[1];
                // Удаляем маркер из текста
                child.text = child.text.replace(/^\u200B\u200B\u200B\[CALLOUT:[^\]]+\]\u200B\u200B\u200B/, '');
                break;
              }
            }
          }
        }
      }
      
      if (calloutVariant) {
        // Рендерим как callout
        // Рендерим children (маркер уже удален из текста, если был)
        const calloutContent = renderChildren(children);
        
        // SVG иконки из lucide-react (совпадают с редактором)
        // Используем точные пути из lucide-react для совпадения с редактором
        const getCalloutIcon = (variant: string): string => {
          const icons: Record<string, string> = {
            // Info icon (lucide-react Info)
            info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
            // CheckCircle2 icon (lucide-react CheckCircle2)
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
            // AlertTriangle icon (lucide-react AlertTriangle)
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
            // Lightbulb icon (lucide-react Lightbulb)
            idea: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 0 0 12c1.657 0 3-4.03 3-9s-1.343-9-3-9Z"></path><path d="M12 3c-1.657 0-3 4.03-3 9s1.343 9 3 9"></path><path d="M12 3v18"></path></svg>`,
            // StickyNote icon (lucide-react StickyNote)
            note: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sticky-note"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path><path d="m15 9 6-6"></path><path d="M21 3v5h-5"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path></svg>`,
          };
          return icons[variant] || icons.info;
        };
        
        const calloutConfig: Record<string, { label: string; borderColor: string; iconColor: string; labelColor: string }> = {
          info: {
            label: 'Инфо',
            borderColor: 'border-l-blue-500',
            iconColor: 'text-blue-500 dark:text-blue-400',
            labelColor: 'text-blue-600 dark:text-blue-400',
          },
          success: {
            label: 'Успех',
            borderColor: 'border-l-emerald-500',
            iconColor: 'text-emerald-500 dark:text-emerald-400',
            labelColor: 'text-emerald-600 dark:text-emerald-400',
          },
          warning: {
            label: 'Внимание',
            borderColor: 'border-l-amber-500',
            iconColor: 'text-amber-500 dark:text-amber-400',
            labelColor: 'text-amber-600 dark:text-amber-400',
          },
          idea: {
            label: 'Идея',
            borderColor: 'border-l-purple-500',
            iconColor: 'text-purple-500 dark:text-purple-400',
            labelColor: 'text-purple-600 dark:text-purple-400',
          },
          note: {
            label: 'Заметка',
            borderColor: 'border-l-pink-500',
            iconColor: 'text-pink-500 dark:text-pink-400',
            labelColor: 'text-pink-600 dark:text-pink-400',
          },
        };
        
        const config = calloutConfig[calloutVariant] || calloutConfig.info;
        const iconSvg = getCalloutIcon(calloutVariant);
        const blockIdAttrs = getBlockIdAttrs(node, children);
        
        return `
          <aside class="callout-block group relative my-4 flex gap-3 rounded-lg border border-border/60 bg-muted/30 ${config.borderColor} border-l-4 px-4 py-3 text-sm transition-all" data-variant="${escapeHtml(calloutVariant)}"${blockIdAttrs}>
            <div class="mt-0.5 flex h-5 w-5 shrink-0 items-start justify-center">
              <span class="h-5 w-5 ${config.iconColor}">${iconSvg}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider ${config.labelColor}">${escapeHtml(config.label)}</span>
              </div>
              <div class="prose prose-sm max-w-none text-foreground leading-relaxed">${calloutContent}</div>
            </div>
          </aside>
        `;
      }
      // Обычный blockquote
      const blockquoteContent = renderChildren(children);
      const blockquoteAttrs = getBlockIdAttrs(node, children);
      return `<blockquote${blockquoteAttrs}>${blockquoteContent}</blockquote>`;

          case 'code-block':
          case 'code': // KeystoneJS использует 'code', а не 'code-block'
          case 'codeBlock': // TipTap формат
            // Code block может содержать текст напрямую или через children
            let codeContent = '';
            let detectedLanguage = node.language || node.attrs?.language || 'plaintext';
            
            if (children.length > 0) {
              // Если children содержат текст напрямую (без paragraph)
              const hasDirectText = children.some((child: any) => child.text !== undefined && !child.type);
              if (hasDirectText) {
                // Извлекаем язык из маркера в первом текстовом узле
                const firstTextNode = children.find((child: any) => 
                  child && typeof child === 'object' && child.text !== undefined && !child.type
                );
                if (firstTextNode && firstTextNode.text) {
                  // Ищем маркер языка: \u200B\u200B\u200B[LANGUAGE:language]\u200B\u200B\u200B
                  const languageMatch = firstTextNode.text.match(/^\u200B\u200B\u200B\[LANGUAGE:([^\]]+)\]\u200B\u200B\u200B/);
                  if (languageMatch) {
                    detectedLanguage = languageMatch[1];
                  }
                }
                
                codeContent = children
                  .map((child: any) => {
                    if (child.text !== undefined) {
                      // Удаляем маркер языка из текста перед рендерингом
                      let text = child.text;
                      text = text.replace(/^\u200B\u200B\u200B\[LANGUAGE:[^\]]+\]\u200B\u200B\u200B\s?/, '');
                      return escapeHtml(text);
                    }
                    return '';
                  })
                  .join('\n');
              } else {
                // Если children содержат другие блоки (например, paragraph), рекурсивно рендерим их
                // и также ищем маркер языка в первом текстовом узле внутри этих блоков
                const firstChild = children[0];
                if (firstChild && firstChild.type === 'paragraph' && firstChild.children) {
                  for (const child of firstChild.children) {
                    if (child && typeof child === 'object' && child.text) {
                      const languageMatch = child.text.match(/^\u200B\u200B\u200B\[LANGUAGE:([^\]]+)\]\u200B\u200B\u200B/);
                      if (languageMatch) {
                        detectedLanguage = languageMatch[1];
                        // Удаляем маркер из текста
                        child.text = child.text.replace(/^\u200B\u200B\u200B\[LANGUAGE:[^\]]+\]\u200B\u200B\u200B\s?/, '');
                        break;
                      }
                    }
                  }
                }
                codeContent = renderChildren(children, { preserveWhitespace: true });
              }
            } else if (node.text !== undefined) {
              // Извлекаем язык из маркера в тексте
              const languageMatch = node.text.match(/^\u200B\u200B\u200B\[LANGUAGE:([^\]]+)\]\u200B\u200B\u200B/);
              if (languageMatch) {
                detectedLanguage = languageMatch[1];
              }
              // Удаляем маркер языка из текста перед рендерингом
              let text = node.text;
              text = text.replace(/^\u200B\u200B\u200B\[LANGUAGE:[^\]]+\]\u200B\u200B\u200B\s?/, '');
              codeContent = escapeHtml(text);
            }
            
            // Получаем язык программирования
            const language = detectedLanguage;
            const languageLabel = getLanguageLabel(language);
      
      // Генерируем уникальный ID для кнопки копирования
      const codeBlockId = `code-block-${Math.random().toString(36).substring(2, 9)}`;
      const codeBlockAttrs = getBlockIdAttrs(node, children);
      
      // Экранируем код для data-атрибута (используем base64 для безопасного хранения)
      // Но проще использовать textContent из code элемента при копировании
      
      return `
        <div class="relative group mb-6 rounded-lg overflow-hidden code-block-wrapper" data-language="${escapeHtml(language)}"${codeBlockAttrs}>
          <div class="flex items-center justify-between gap-3 px-3 py-2 code-block-header">
            <span class="text-xs font-medium uppercase tracking-wide code-block-language">${escapeHtml(languageLabel)}</span>
            <button
              type="button"
              class="code-block-copy-btn"
              data-code-block-id="${codeBlockId}"
              title="Скопировать код"
              aria-label="Скопировать код"
            >
              <svg class="h-3.5 w-3.5 copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg class="h-3.5 w-3.5 check-icon hidden text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <pre class="overflow-x-auto p-4 text-sm m-0 code-block-content"><code class="language-${escapeHtml(language)}" contenteditable="false" spellcheck="false">${codeContent}</code></pre>
        </div>
      `;

    case 'bulleted-list':
    case 'unordered-list': // KeystoneJS использует 'unordered-list', а не 'bulleted-list'
    case 'bullet-list':
    case 'bulletList': // TipTap формат
    case 'ul':
      const ulAttrs = getBlockIdAttrs(node, children);
      const bulletItems = children
        .filter((child) => child.type === 'list-item' || child.type === 'li')
        .map((item) => {
          // List item может содержать paragraph, list-item-content или напрямую текст
          let itemContent = '';
          if (item.children && item.children.length === 1) {
            if (item.children[0].type === 'list-item-content') {
              // Обрабатываем неправильную структуру list-item-content
              itemContent = renderChildren(item.children[0].children || []);
            } else if (item.children[0].type === 'paragraph') {
              // Если внутри есть paragraph, рендерим только его содержимое (без тега <p>)
              itemContent = renderChildren(item.children[0].children || []);
            } else {
              itemContent = renderChildren(item.children || []);
            }
          } else {
            itemContent = renderChildren(item.children || []);
          }
          const liAttrs = getBlockIdAttrs(item, item.children || []);
          return `<li${liAttrs}>${itemContent || ''}</li>`;
        })
        .join('');
      return bulletItems ? `<ul${ulAttrs}>${bulletItems}</ul>` : '';

    case 'numbered-list':
    case 'ordered-list':
    case 'orderedList': // TipTap формат
    case 'ol':
      const olAttrs = getBlockIdAttrs(node, children);
      const orderedItems = children
        .filter((child) => child.type === 'list-item' || child.type === 'li')
        .map((item) => {
          // List item может содержать paragraph, list-item-content или напрямую текст
          let itemContent = '';
          if (item.children && item.children.length === 1) {
            if (item.children[0].type === 'list-item-content') {
              // Обрабатываем неправильную структуру list-item-content
              itemContent = renderChildren(item.children[0].children || []);
            } else if (item.children[0].type === 'paragraph') {
              // Если внутри есть paragraph, рендерим только его содержимое (без тега <p>)
              itemContent = renderChildren(item.children[0].children || []);
            } else {
              itemContent = renderChildren(item.children || []);
            }
          } else {
            itemContent = renderChildren(item.children || []);
          }
          const liAttrs = getBlockIdAttrs(item, item.children || []);
          return `<li${liAttrs}>${itemContent || ''}</li>`;
        })
        .join('');
      return orderedItems ? `<ol${olAttrs}>${orderedItems}</ol>` : '';

    case 'list-item':
    case 'li':
      // List items обрабатываются внутри списков
      // Могут содержать paragraph или напрямую текст
      // Также могут содержать list-item-content (неправильная структура, но нужно обработать)
      let listItemContent = '';
      
      // Обрабатываем list-item-content (неправильная структура, но может прийти)
      if (children.length === 1 && children[0].type === 'list-item-content') {
        // Извлекаем содержимое из list-item-content
        const contentChildren = children[0].children || [];
        listItemContent = renderChildren(contentChildren);
      } else if (children.length === 1 && children[0].type === 'paragraph') {
        // Если внутри есть paragraph, рендерим только его содержимое (без тега <p>)
        listItemContent = renderChildren(children[0].children || []);
      } else {
        // Прямой текст или другие блоки
        listItemContent = renderChildren(children);
      }
      const listItemAttrs = getBlockIdAttrs(node, children);
      return `<li${listItemAttrs}>${listItemContent || ''}</li>`;

    case 'divider':
    case 'horizontal-rule':
    case 'hr':
      const dividerAttrs = getBlockIdAttrs(node, children);
      return `<hr${dividerAttrs} />`;

    case 'image':
      // Обработка изображений (если они есть в Slate)
      const imageUrl = node.url || node.src || '';
      const imageAlt = node.alt || '';
      const imageAttrs = getBlockIdAttrs(node, children);
      if (imageUrl) {
        return `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}"${imageAttrs} />`;
      }
      return '';

    case 'table':
      // Обработка таблиц (базовая поддержка)
      const tableContent = renderChildren(children);
      return `<table>${tableContent}</table>`;

    case 'table-row':
      const rowContent = renderChildren(children);
      return `<tr>${rowContent}</tr>`;

    case 'table-cell':
      const cellContent = renderChildren(children);
      return `<td>${cellContent || ''}</td>`;

    case 'layout':
      // KeystoneJS layout для колонок (2 или 3 колонки)
      // Структура: { type: 'layout', layout: [1, 1] или [1, 1, 1], children: [layout-area, layout-area, ...] }
      const layoutType = node.layout || [1, 1];
      const layoutAttrs = getBlockIdAttrs(node, children);
      const layoutAreas = children
        .filter((child) => child.type === 'layout-area')
        .map((area) => {
          const areaContent = renderChildren(area.children || []);
          const areaAttrs = getBlockIdAttrs(area, area.children || []);
          return `<div class="prose-layout-area"${areaAttrs}>${areaContent}</div>`;
        })
        .join('');
      
      // Определяем количество колонок
      const columnCount = Array.isArray(layoutType) ? layoutType.length : 2;
      const gridCols = columnCount === 3 ? 'grid-cols-3' : 'grid-cols-2';
      
      return `<div class="prose-layout grid ${gridCols} gap-4 my-4"${layoutAttrs}>${layoutAreas}</div>`;

    case 'layout-area':
      // Layout area обрабатывается внутри layout
      // Но на всякий случай обработаем и отдельно
      const areaContent = renderChildren(children);
      const areaAttrs = getBlockIdAttrs(node, children);
      return `<div class="prose-layout-area"${areaAttrs}>${areaContent}</div>`;

    default:
      // Для неизвестных типов логируем и пытаемся рендерить children
      if (import.meta.env.DEV) {
        console.warn('[slateToHtml] Unknown block type:', type, node);
      }
      const defaultContent = renderChildren(children);
      const defaultAttrs = getBlockIdAttrs(node, children);
      if (defaultContent) {
        // Обернем в div с классом для стилизации через prose
        return `<div class="prose-unknown-${escapeHtml(type)}"${defaultAttrs}>${defaultContent}</div>`;
      }
      return '';
  }
}

/**
 * Рендерит children узла (текст с форматированием)
 */
function renderChildren(
  children: SlateNode[],
  options: { preserveWhitespace?: boolean } = {}
): string {
  if (!children || children.length === 0) {
    return '';
  }

  return children
    .map((child) => {
      // Текстовый узел
      if (child.text !== undefined) {
        let text = child.text;
        
        // Удаляем маркер ANCHOR из текста (он уже использован для установки id атрибута)
        // Также удаляем пробел после маркера, если текст состоит только из маркера и пробела
        const anchorMarkerRegex = /^\u200B\u200B\u200B\[ANCHOR:[^\]]+\]\u200B\u200B\u200B\s?/
        text = text.replace(anchorMarkerRegex, '')
        
        // Удаляем маркер LANGUAGE из текста (он уже использован для определения языка code блока)
        // Также удаляем пробел после маркера, если текст состоит только из маркера и пробела
        const languageMarkerRegex = /^\u200B\u200B\u200B\[LANGUAGE:[^\]]+\]\u200B\u200B\u200B\s?/
        text = text.replace(languageMarkerRegex, '')
        
        // Экранируем HTML для безопасности
        text = escapeHtml(text);
        
        // Применяем форматирование (порядок важен для вложенных тегов)
        // Сначала обрабатываем inline code (он не должен содержать другие теги)
        if (child.code) {
          text = `<code>${text}</code>`;
        }
        
        // Затем остальное форматирование
        if (child.bold) {
          text = `<strong>${text}</strong>`;
        }
        if (child.italic) {
          text = `<em>${text}</em>`;
        }
        if (child.underline) {
          text = `<u>${text}</u>`;
        }
        if (child.strikethrough) {
          text = `<s>${text}</s>`;
        }

        // Обрабатываем ссылки (должны быть последними, чтобы обернуть все форматирование)
        if (child.url) {
          const href = escapeHtml(child.url)
          // Для внутренних ссылок на якоря (href="#...") не добавляем target="_blank"
          const isAnchorLink = href.startsWith('#')
          if (isAnchorLink) {
            text = `<a href="${href}">${text}</a>`
          } else {
            text = `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
          }
        }

        return text;
      }

      // Если это блок, рекурсивно рендерим его
      if (child.type) {
        // Обрабатываем link как отдельный блок
        if (child.type === 'link' && child.url) {
          const linkContent = renderChildren(child.children || [], options);
          const href = escapeHtml(child.url)
          // Для внутренних ссылок на якоря (href="#...") не добавляем target="_blank"
          const isAnchorLink = href.startsWith('#')
          if (isAnchorLink) {
            return `<a href="${href}">${linkContent}</a>`
          } else {
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${linkContent}</a>`
          }
        }
        
        // Для paragraph внутри list-item рендерим только содержимое (без тега <p>)
        // Это стандартная практика в HTML - <li> может содержать текст напрямую
        if (child.type === 'paragraph') {
          const paragraphChildren = child.children || [];
          // Если paragraph содержит только текст, рендерим его напрямую
          if (paragraphChildren.length === 1 && paragraphChildren[0].text !== undefined) {
            return renderChildren(paragraphChildren, options);
          }
          // Если paragraph содержит другие блоки, рендерим их
          if (paragraphChildren.length > 0) {
            return renderChildren(paragraphChildren, options);
          }
        }
        
        return renderBlock(child);
      }

      // Если есть children, рекурсивно рендерим их
      if (child.children && Array.isArray(child.children)) {
        return renderChildren(child.children, options);
      }

      return '';
    })
    .join('');
}

/**
 * Получает читаемое название языка программирования
 */
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
  };
  return labels[language.toLowerCase()] || language.charAt(0).toUpperCase() + language.slice(1);
}

/**
 * Экранирует HTML символы
 * Безопасная функция, работает в любом окружении (включая SSR)
 */
function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}


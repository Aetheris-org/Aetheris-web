# Fate Engine

Собственный движок редактора для платформы Aetheris, заменяющий TipTap.

## Структура

```
fate-engine/
├── core/           # Ядро движка
│   ├── Editor.ts   # Основной класс редактора
│   ├── Schema.ts   # Схема документа
│   ├── State.ts    # Управление состоянием
│   └── EditorView.ts # Представление редактора
├── nodes/          # Типы узлов
│   ├── Text.ts
│   ├── Paragraph.ts
│   ├── Heading.ts
│   ├── BulletList.ts
│   ├── OrderedList.ts
│   ├── ListItem.ts
│   ├── Blockquote.ts
│   ├── Image.ts
│   └── ...
├── marks/          # Типы меток (форматирование)
│   ├── Bold.ts
│   ├── Italic.ts
│   ├── Underline.ts
│   ├── Strikethrough.ts
│   ├── Code.ts
│   ├── Link.ts
│   └── ...
├── extensions/     # Расширения
│   └── StarterKit.ts
├── react/          # React интеграция
│   ├── useEditor.ts
│   └── EditorContent.tsx
└── types/          # TypeScript типы
    └── index.ts
```

## Использование

### Базовое использование

```tsx
import { useEditor, EditorContent } from '@/fate-engine/react'
import { StarterKit } from '@/fate-engine/extensions/StarterKit'

function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit()],
    content: { type: 'doc', content: [] },
    editable: true,
    onUpdate: ({ doc }) => {
      console.log('Content updated:', doc)
    },
  })

  return <EditorContent editor={editor} />
}
```

### С расширениями

```tsx
import { useEditor, EditorContent } from '@/fate-engine/react'
import { StarterKit } from '@/fate-engine/extensions/StarterKit'
import { Link } from '@/fate-engine/marks/Link'
import { Image } from '@/fate-engine/nodes/Image'

function MyEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit({
        heading: { levels: [1, 2, 3] },
        bold: true,
        italic: true,
      }),
      // Добавляем дополнительные расширения
    ],
    content: { type: 'doc', content: [] },
    editable: true,
  })

  return <EditorContent editor={editor} />
}
```

## API

### Editor

Основной класс редактора.

```typescript
interface FateEditor {
  state: FateEditorState
  view: FateEditorView
  commands: Record<string, (...args: any[]) => boolean>
  chain: () => FateCommandChain
  setContent: (content: FateDocument | string) => void
  getContent: () => FateDocument
  getHTML: () => string
  getJSON: () => FateDocument
  getText: () => string
  focus: () => void
  blur: () => void
  destroy: () => void
  isEditable: boolean
  isFocused: boolean
}
```

### Команды

```typescript
// Использование команд
editor.commands.toggleBold()
editor.commands.setHeading({ level: 1 })
editor.commands.setImage({ src: 'https://example.com/image.jpg' })

// Цепочка команд
editor.chain()
  .toggleBold()
  .toggleItalic()
  .run()
```

## Расширение

### Создание нового узла

```typescript
import type { FateNodeDefinition } from '@/fate-engine/types'

export const MyNode: FateNodeDefinition = {
  name: 'myNode',
  group: 'block',
  content: 'inline*',
  parseDOM: [
    {
      tag: 'div[data-type="my-node"]',
    },
  ],
  toDOM: () => {
    return ['div', { 'data-type': 'my-node' }, 0]
  },
  addCommands: () => ({
    setMyNode: () => ({ state, dispatch }: any) => {
      // Реализация команды
      return true
    },
  }),
}
```

### Создание новой метки

```typescript
import type { FateMarkDefinition } from '@/fate-engine/types'

export const MyMark: FateMarkDefinition = {
  name: 'myMark',
  parseDOM: [
    {
      tag: 'span[data-mark="my-mark"]',
    },
  ],
  toDOM: () => {
    return ['span', { 'data-mark': 'my-mark' }, 0]
  },
  addCommands: () => ({
    toggleMyMark: () => ({ state, dispatch }: any) => {
      // Реализация команды
      return true
    },
  }),
}
```

## Миграция с TipTap

Fate Engine использует совместимый с TipTap API, что упрощает миграцию:

1. Замените импорты:
   ```typescript
   // Было
   import { useEditor, EditorContent } from '@tiptap/react'
   
   // Стало
   import { useEditor, EditorContent } from '@/fate-engine/react'
   ```

2. Замените расширения:
   ```typescript
   // Было
   import StarterKit from '@tiptap/starter-kit'
   
   // Стало
   import { StarterKit } from '@/fate-engine/extensions/StarterKit'
   ```

3. Адаптируйте кастомные расширения под API Fate Engine

## Статус разработки

- ✅ Базовая структура
- ✅ Базовые узлы (paragraph, heading, text, lists, blockquote, image)
- ✅ Базовые метки (bold, italic, underline, strikethrough, code, link)
- ✅ Расширенные узлы (codeBlock, callout, columns)
- ✅ Расширенные метки (highlight, color, textAlign, fontSize, textStyle)
- ✅ React интеграция (useEditor, EditorContent)
- ✅ Утилиты для конвертации (slate, prosemirror, html)
- ✅ Пример адаптации (ArticleContentFate)
- ⏳ Полная адаптация RichTextEditor
- ⏳ Дополнительные расширения (Placeholder, CharacterCount, SmartInput, BlockAnchor, DragHandle, ImageResize)

## Утилиты конвертации

```typescript
import { slateToFate, prosemirrorToFate, htmlToFate, fateToProsemirror } from '@/fate-engine/utils/converter'

// Конвертация из Slate
const fateDoc = slateToFate(slateContent)

// Конвертация из ProseMirror
const fateDoc = prosemirrorToFate(prosemirrorContent)

// Конвертация из HTML
const fateDoc = htmlToFate(htmlString)

// Конвертация в ProseMirror (для совместимости)
const prosemirrorDoc = fateToProsemirror(fateDoc)
```

## Пример использования

См. `ArticleContentFate.tsx` для примера адаптации существующего компонента.

## Примечания

Fate Engine находится в активной разработке. Базовая функциональность реализована, но некоторые расширенные функции могут требовать доработки. Ядро движка готово к использованию, но для полной замены TipTap необходимо завершить реализацию всех расширений и адаптировать все компоненты.

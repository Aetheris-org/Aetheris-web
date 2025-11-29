/// <reference types="vite/client" />

// Type declarations for third-party modules
declare module 'react-grid-layout' {
  export interface Layout {
    i: string
    x: number
    y: number
    w: number
    h: number
    minW?: number
    maxW?: number
    minH?: number
    maxH?: number
    static?: boolean
    isDraggable?: boolean
    isResizable?: boolean
  }

  export interface GridLayoutProps {
    className?: string
    style?: React.CSSProperties
    width?: number
    autoSize?: boolean
    cols?: number
    draggableCancel?: string
    draggableHandle?: string
    verticalCompact?: boolean
    compactType?: 'vertical' | 'horizontal' | null
    layout?: Layout[]
    margin?: [number, number]
    containerPadding?: [number, number]
    rowHeight?: number
    maxRows?: number
    isDraggable?: boolean
    isResizable?: boolean
    isBounded?: boolean
    useCSSTransforms?: boolean
    transformScale?: number
    allowOverlap?: boolean
    preventCollision?: boolean
    isDroppable?: boolean
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>
    resizeHandle?: React.ComponentType<any>
    onLayoutChange?: (layout: Layout[]) => void
    onDragStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void
    onDrag?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void
    onDragStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void
    onResizeStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void
    onResize?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void
    onResizeStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void
    children?: React.ReactNode
  }

  export default class GridLayout extends React.Component<GridLayoutProps> {}
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FRONTEND_URL?: string
  readonly VITE_IMGBB_API_KEY?: string
  readonly DEV: boolean
  readonly MODE: string
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly dev: boolean
  readonly mode: string
  readonly prod: boolean
  readonly ssr: boolean
}


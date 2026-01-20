import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useTranslation } from '@/hooks/useTranslation'

interface ArticlePreviewZoomProps {
  src: string
  alt: string
}

export function ArticlePreviewZoom({ src, alt }: ArticlePreviewZoomProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/40 text-white backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label={t('article.viewPreview')}
      >
        <ZoomIn className="h-4 w-4" aria-hidden />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full focus:outline-none focus:ring-0"
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}

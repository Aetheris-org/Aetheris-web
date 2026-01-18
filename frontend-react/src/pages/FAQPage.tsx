import { SiteHeader } from '@/components/SiteHeader'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-muted-foreground text-center">
          Страница находится в разработке
        </p>
      </main>
    </div>
  )
}

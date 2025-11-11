import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, Calendar, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import {
  selectReadingListItems,
  useReadingListStore,
} from '@/stores/readingListStore'

export default function ReadingListPage() {
  const navigate = useNavigate()
  const items = useReadingListStore(selectReadingListItems)
  const remove = useReadingListStore((state) => state.remove)
  const clear = useReadingListStore((state) => state.clear)

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()),
    [items]
  )

  const handleOpenArticle = (articleId: number) => {
    navigate(`/article/${articleId}`)
  }

  const handleRemove = (articleId: number) => {
    remove(articleId)
  }

  return (
    <div className="min-h-screen app-surface">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">Reading list</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <main className="container py-8">
        {sortedItems.length === 0 ? (
          <Card className="mx-auto max-w-2xl border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">No saved articles yet</CardTitle>
              <CardDescription className="max-w-md">
                Use the “Read later” button on any article to add it to your personal reading queue.
              </CardDescription>
              <Button onClick={() => navigate('/')}>Browse articles</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Saved for later</CardTitle>
                  <CardDescription>
                    {sortedItems.length === 1
                      ? '1 article in your queue'
                      : `${sortedItems.length} articles ready to read`}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={clear}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </Button>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {sortedItems.map((article) => (
                <Card key={article.id} className="border-border/60">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div
                      className="flex-1 cursor-pointer space-y-3"
                      onClick={() => handleOpenArticle(article.id)}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="gap-1">
                          <Bookmark className="h-3 w-3" />
                          Saved on {new Date(article.savedAt).toLocaleDateString()}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {Math.ceil(article.content.length / 1000)} min read
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold tracking-tight text-foreground hover:text-primary">
                        {article.title}
                      </h2>
                      {article.excerpt ? (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.excerpt}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.content.slice(0, 160)}…
                        </p>
                      )}
                      {article.tags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-md">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleOpenArticle(article.id)}
                      >
                        Continue reading
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}



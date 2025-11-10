import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Clock, User, Heart, Share2, Bookmark } from 'lucide-react'
import { getArticle, reactArticle } from '@/api/articles'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isBookmarked, setIsBookmarked] = useState(false)

  // Fetch article
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticle(Number(id), user?.id),
    enabled: !!id,
  })

  // React to article
  const reactMutation = useMutation({
    mutationFn: ({ reaction }: { reaction: 'like' | 'dislike' }) =>
      reactArticle(Number(id), user!.id, reaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', id] })
      toast({
        title: 'Success',
        description: 'Your reaction has been recorded',
      })
    },
  })

  const handleReaction = (reaction: 'like' | 'dislike') => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to react to articles',
        variant: 'destructive',
      })
      return
    }
    reactMutation.mutate({ reaction })
  }

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to bookmark articles',
        variant: 'destructive',
      })
      return
    }
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copied',
        description: 'Article link copied to clipboard',
      })
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Article not found</h2>
            <p className="text-muted-foreground">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container py-8">
        <article className="mx-auto max-w-4xl">
          {article.previewImage && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-border/40">
              <img
                src={article.previewImage}
                alt={article.title}
                className="max-h-[460px] w-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{article.author.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{estimateReadTime(article.content)} min read</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReaction('like')}
                className="gap-2"
              >
                <Heart
                  className={`h-4 w-4 ${
                    article.userReaction === 'like' ? 'fill-current' : ''
                  }`}
                />
                {article.likes || 0}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className="gap-2"
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Article Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          <Separator className="my-8" />

          {/* Comments Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Comments ({article.commentsCount || 0})
            </h2>

            {user ? (
              <Card>
                <CardContent className="pt-6">
                  <textarea
                    placeholder="Write a comment..."
                    className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button>Post Comment</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Sign in to leave a comment
                  </p>
                  <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            {article.commentsCount === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No comments yet. Be the first to comment!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Comments will be rendered here */}
                <p className="text-sm text-muted-foreground">
                  Comments feature coming soon...
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}


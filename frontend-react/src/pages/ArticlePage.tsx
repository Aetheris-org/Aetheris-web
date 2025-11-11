import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Heart,
  Share2,
  Bookmark,
  Copy,
  Check,
  Twitter,
  Send,
  Linkedin,
} from 'lucide-react'
import { getArticle, reactArticle } from '@/api/articles'
import { createArticleComment, getArticleComments } from '@/api/comments'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { useReadingListStore } from '@/stores/readingListStore'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [commentText, setCommentText] = useState('')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  // Fetch article
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticle(id as string, user?.id),
    enabled: !!id,
  })

  const {
    data: commentsResponse,
    isLoading: isCommentsLoading,
    isRefetching: isCommentsRefetching,
  } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: () => getArticleComments(id as string),
    enabled: !!id,
  })

  const comments = commentsResponse?.comments ?? []

  // React to article
  const reactMutation = useMutation({
    mutationFn: ({ reaction }: { reaction: 'like' | 'dislike' }) => {
      if (!article) {
        throw new Error('Статья ещё не загружена')
      }
      return reactArticle(article.id, reaction)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', id] })
      toast({
        title: 'Success',
        description: 'Your reaction has been recorded',
      })
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!article) {
        throw new Error('Статья ещё не загружена')
      }
      return createArticleComment(article.id, { text: commentText.trim() })
    },
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['article-comments', id] })
      queryClient.invalidateQueries({ queryKey: ['article', id] })
      toast({
        title: 'Комментарий опубликован',
        description: 'Ваш комментарий успешно добавлен',
      })
    },
    onError: (mutationError: any) => {
      const message =
        mutationError?.response?.data?.error?.message || 'Не удалось добавить комментарий'
      toast({
        title: 'Ошибка',
        description: message,
        variant: 'destructive',
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
    if (!article) {
      toast({
        title: 'Подождите',
        description: 'Статья ещё не успела загрузиться. Попробуйте чуть позже.',
        variant: 'destructive',
      })
      return
    }
    reactMutation.mutate({ reaction })
  }

  const readingListToggle = useReadingListStore((state) => state.toggle)
  const isSaved = useReadingListStore((state) =>
    article ? state.items.some((item) => item.id === article.id) : false
  )

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to bookmark articles',
        variant: 'destructive',
      })
      return
    }

    if (!article) {
      toast({
        title: 'Подождите',
        description: 'Статья ещё не успела загрузиться. Попробуйте чуть позже.',
        variant: 'destructive',
      })
      return
    }

    const wasSaved = isSaved
    readingListToggle(article)
    toast({
      title: wasSaved ? 'Removed from Reading List' : 'Saved for later',
      description: wasSaved
        ? 'Эта статья удалена из списка “Читать позже”.'
        : 'Статья добавлена в список “Читать позже”.',
    })
  }

  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to leave a comment',
        variant: 'destructive',
      })
      navigate('/auth')
      return
    }

    if (!commentText.trim()) {
      toast({
        title: 'Пустой комментарий',
        description: 'Введите текст комментария прежде чем отправлять',
        variant: 'destructive',
      })
      return
    }

    addCommentMutation.mutate()
  }

  const handleShare = () => {
    setIsShareOpen(true)
  }

  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleNativeShare = async () => {
    if (!article || !shareUrl || !canUseNativeShare) return
    try {
      await navigator.share({
        title: article.title,
        url: shareUrl,
      })
      setIsShareOpen(false)
      toast({
        title: 'Shared',
        description: 'Thanks for spreading the word!',
      })
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return
      }
      toast({
        title: 'Share failed',
        description: 'Unable to share the article right now.',
        variant: 'destructive',
      })
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      if (!('clipboard' in navigator)) {
        throw new Error('Clipboard API is not available')
      }
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
      copyTimeoutRef.current = setTimeout(() => setCopySuccess(false), 2000)
      toast({
        title: 'Link copied',
        description: 'Article link copied to clipboard',
      })
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy the link. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleExternalShare = (targetUrl: string) => {
    if (!shareUrl) return
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    setIsShareOpen(false)
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

  const shareTitle = article ? `“${article.title}” on Aetheris` : 'Check out this article on Aetheris'

  const shareTargets = useMemo<Array<{ label: string; description: string; icon: LucideIcon; href: string }>>(() => {
    if (!shareUrl) return []
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)
    return [
      {
        label: 'Share on X',
        description: 'Post to X (Twitter)',
        icon: Twitter,
        href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      },
      {
        label: 'Send via Telegram',
        description: 'Share instantly in Telegram',
        icon: Send,
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      },
      {
        label: 'Share on LinkedIn',
        description: 'Reach your professional network',
        icon: Linkedin,
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      },
    ]
  }, [shareUrl, shareTitle])

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
                variant={isSaved ? 'default' : 'outline'}
                size="sm"
                onClick={handleBookmark}
                className="gap-2"
                aria-pressed={isSaved}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">
                  {isSaved ? 'Saved' : 'Read later'}
                </span>
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
              Комментарии ({comments.length})
            </h2>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <textarea
                  placeholder={user ? 'Напишите комментарий…' : 'Войдите, чтобы оставить комментарий'}
                  className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  disabled={!user || addCommentMutation.isPending}
                />
                <div className="flex justify-end gap-2">
                  {!user && (
                    <Button variant="outline" onClick={() => navigate('/auth')}>
                      Войти
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmitComment}
                    disabled={
                      !user ||
                      !commentText.trim() ||
                      addCommentMutation.isPending
                    }
                  >
                    {addCommentMutation.isPending ? 'Отправка…' : 'Отправить комментарий'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments List */}
            {isCommentsLoading || isCommentsRefetching ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Загружаем комментарии…
                </CardContent>
              </Card>
            ) : comments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Пока нет комментариев. Будьте первым!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{comment.author.username}</span>
                        <span>•</span>
                        <span>
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {comment.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>

      <Dialog
        open={isShareOpen}
        onOpenChange={(open) => {
          setIsShareOpen(open)
          if (!open) {
            setCopySuccess(false)
            if (copyTimeoutRef.current) {
              clearTimeout(copyTimeoutRef.current)
              copyTimeoutRef.current = null
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-2">
            <DialogTitle>Share this article</DialogTitle>
            <DialogDescription>
              Spread the word about {article ? `“${article.title}”` : 'this article'} across your favorite channels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Share link</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  className="gap-2 sm:w-auto"
                  onClick={handleCopyLink}
                  disabled={!shareUrl}
                >
                  {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copySuccess ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            {shareTargets.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {shareTargets.map((target) => {
                  const Icon = target.icon
                  return (
                    <Button
                      key={target.label}
                      variant="secondary"
                      className="justify-start gap-3 py-3 text-left"
                      onClick={() => handleExternalShare(target.href)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-medium">{target.label}</span>
                        <span className="text-xs text-muted-foreground">{target.description}</span>
                      </span>
                    </Button>
                  )
                })}
              </div>
            )}

            {canUseNativeShare && (
              <Button variant="outline" className="gap-2" onClick={handleNativeShare}>
                <Share2 className="h-4 w-4" />
                Share via device
              </Button>
            )}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="ghost" onClick={() => setIsShareOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


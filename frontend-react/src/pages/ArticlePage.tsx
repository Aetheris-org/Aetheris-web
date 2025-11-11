
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
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
  ChevronDown,
  ChevronRight,
  CornerUpLeft,
  CornerDownRight,
  Minimize2,
  MoreHorizontal,
  Plus,
  Minus,
  Info,
  Flag,
  Pencil,
  Trash2,
} from 'lucide-react'
import { getArticle, reactArticle } from '@/api/articles'
import { getArticleComments } from '@/api/comments'
import type { Comment as RemoteComment } from '@/api/comments'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  selectLocalComments,
  useLocalCommentsStore,
} from '@/stores/localCommentsStore'
import { cn } from '@/lib/utils'

type CommentSource = 'remote' | 'local'

interface UnifiedComment extends RemoteComment {
  source: CommentSource
}

interface CommentNode extends UnifiedComment {
  replies: CommentNode[]
}

interface CommentReactionState {
  score: number
  positive: number
  negative: number
  userReaction: 'up' | 'down' | null
}

const THREAD_LINE_WIDTH = 1.5
const THREAD_LINE_GAP = 20
const THREAD_BASE_OFFSET = 22
const THREAD_ELBOW_LENGTH = 16
const THREAD_ELBOW_Y = 34

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
  const [activeReply, setActiveReply] = useState<{ parentId: string; parentAuthor: string } | null>(
    null
  )
  const [replyText, setReplyText] = useState('')
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null)
  const [highlightDepth, setHighlightDepth] = useState<number | null>(null)
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({})
  const [threadRootId, setThreadRootId] = useState<string | null>(null)
  const replyHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [reactionState, setReactionState] = useState<Record<string, CommentReactionState>>({})
  const [infoComment, setInfoComment] = useState<CommentNode | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null)
  const replyInputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
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
    queryFn: () => getArticle(id as string, { userId: user?.id }),
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
  const articleCommentKey = useMemo(() => {
    if (article && typeof (article as any).documentId !== 'undefined' && (article as any).documentId) {
      return String((article as any).documentId)
    }
    if (article?.id) {
      return String(article.id)
    }
    return typeof id === 'string' ? id : ''
  }, [article, id])

  const localCommentsSelector = useMemo(
    () => selectLocalComments(articleCommentKey),
    [articleCommentKey]
  )
  const localComments = useLocalCommentsStore(localCommentsSelector)
  const addLocalComment = useLocalCommentsStore((state) => state.addComment)

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

  const ensureCommentAuth = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to leave a comment',
        variant: 'destructive',
      })
      navigate('/auth')
      return false
    }
    return true
  }

  const commitLocalComment = (content: string, parentId: string | null) => {
    if (!article) {
      toast({
        title: 'Подождите',
        description: 'Статья ещё не успела загрузиться. Попробуйте чуть позже.',
        variant: 'destructive',
      })
      return false
    }

    const trimmed = content.trim()
    if (!trimmed) {
      toast({
        title: 'Пустой комментарий',
        description: 'Введите текст комментария прежде чем отправлять',
        variant: 'destructive',
      })
      return false
    }

    const fallbackKey =
      typeof id === 'string' ? id : String(article.id ?? article.documentId ?? '')
    const articleKey = articleCommentKey || fallbackKey

    addLocalComment({
      id: `local-${Date.now()}`,
      articleId: articleKey,
      text: trimmed,
      createdAt: new Date().toISOString(),
      parentId,
      author: {
        id: user!.id,
        username: user?.nickname ?? user?.email ?? 'Вы',
        avatar: user?.avatar,
      },
    })
    return true
  }

  const handleSubmitComment = () => {
    if (!ensureCommentAuth()) return
    if (commitLocalComment(commentText, null)) {
      setCommentText('')
      toast({
        title: 'Комментарий сохранён',
        description: 'Пока что комментарии хранятся локально на этом устройстве.',
      })
    }
  }

  const handleReplyClick = (commentId: string, authorName: string) => {
    if (!ensureCommentAuth()) return
    setActiveReply({ parentId: commentId, parentAuthor: authorName })
    setReplyText('')
  }

  const handleCancelReply = () => {
    setActiveReply(null)
    setReplyText('')
  }

  const handleSubmitReply = () => {
    if (!activeReply) return
    if (!ensureCommentAuth()) return
    if (commitLocalComment(replyText, activeReply.parentId)) {
      setReplyText('')
      setActiveReply(null)
      toast({
        title: 'Ответ сохранён',
        description: 'Ответ пока что хранится локально и виден только вам.',
      })
    }
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

  const combinedComments = useMemo<UnifiedComment[]>(() => {
    const remote: UnifiedComment[] = (commentsResponse?.comments ?? []).map((comment) => ({
      ...comment,
      source: 'remote' as const,
    }))

    const local: UnifiedComment[] = localComments.map((comment) => ({
      id: comment.id,
      documentId: comment.id,
      databaseId: Number.parseInt(comment.articleId, 10) || 0,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: undefined,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        avatar: comment.author.avatar,
      },
      parentId: comment.parentId ?? null,
      source: 'local' as const,
    }))

    const merged = [...remote, ...local]
    return merged.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [commentsResponse?.comments, localComments])

  useEffect(() => {
    setReactionState((prev) => {
      const next: Record<string, CommentReactionState> = { ...prev }
      combinedComments.forEach((comment) => {
      if (!next[comment.id]) {
          next[comment.id] = {
          score: 0,
          positive: 0,
          negative: 0,
            userReaction: null,
          }
        }
      })
      return next
    })
  }, [combinedComments])

  const commentGraph = useMemo(() => {
    const nodes = new Map<string, CommentNode>()
    const parentById = new Map<string, string | null>()

    combinedComments.forEach((comment) => {
      nodes.set(comment.id, { ...comment, replies: [] })
      parentById.set(comment.id, comment.parentId ?? null)
    })

    const roots: CommentNode[] = []

    nodes.forEach((node) => {
      const parentId = node.parentId
      if (parentId && nodes.has(parentId)) {
        nodes.get(parentId)!.replies.push(node)
      } else {
        roots.push(node)
      }
    })

    const sortBranch = (branch: CommentNode[]) => {
      branch.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      branch.forEach((child) => sortBranch(child.replies))
    }

    sortBranch(roots)

    const depthById = new Map<string, number>()
    const descendantCountById = new Map<string, number>()
    let maxDepth = 0

    const computeMeta = (node: CommentNode, depth: number): number => {
      depthById.set(node.id, depth)
      maxDepth = Math.max(maxDepth, depth)
      let total = 0
      node.replies.forEach((child) => {
        total += 1 + computeMeta(child, depth + 1)
      })
      descendantCountById.set(node.id, total)
      return total
    }

    roots.forEach((root) => computeMeta(root, 0))

    return {
      roots,
      lookup: nodes,
      parentById,
      depthById,
      descendantCountById,
      maxDepth,
    }
  }, [combinedComments])

  const commentTree = commentGraph.roots
  const nodeLookup = commentGraph.lookup
  const parentById = commentGraph.parentById
  const depthById = commentGraph.depthById
  const descendantCountById = commentGraph.descendantCountById
  const maxCommentDepth = commentGraph.maxDepth

  const infoReactions = infoComment ? reactionState[infoComment.id] : undefined
  const infoParent = infoComment?.parentId ? nodeLookup.get(infoComment.parentId) : undefined

  const hoverContext = useMemo(() => {
    if (!hoveredCommentId || !nodeLookup.has(hoveredCommentId)) {
      return {
        ancestors: new Set<string>(),
        descendants: new Set<string>(),
      }
    }

    const ancestors = new Set<string>()
    let cursor: string | null = hoveredCommentId
    while (cursor) {
      const parentId: string | null = parentById.get(cursor) ?? null
      if (!parentId) break
      ancestors.add(parentId)
      cursor = parentId
    }

    const descendants = new Set<string>()
    const collect = (node: CommentNode) => {
      node.replies.forEach((child) => {
        descendants.add(child.id)
        collect(child)
      })
    }
    collect(nodeLookup.get(hoveredCommentId)!)

    return { ancestors, descendants }
  }, [hoveredCommentId, nodeLookup, parentById])

  useEffect(() => {
    setCollapsedMap((prev) => {
      const next: Record<string, boolean> = {}
      nodeLookup.forEach((_, id) => {
        if (prev[id]) {
          next[id] = true
        }
      })
      return next
    })
    if (threadRootId && !nodeLookup.has(threadRootId)) {
      setThreadRootId(null)
    }
    return () => {
      if (replyHighlightTimeoutRef.current) {
        clearTimeout(replyHighlightTimeoutRef.current)
        replyHighlightTimeoutRef.current = null
      }
    }
  }, [nodeLookup, threadRootId])

  useEffect(() => {
    if (!activeReply?.parentId) return
    const target = replyInputRefs.current.get(activeReply.parentId)
    if (target) {
      requestAnimationFrame(() => {
        target.focus()
        target.selectionStart = target.selectionEnd = target.value.length
      })
    }
  }, [activeReply])

  const formatCommentTimestamp = (date: string) =>
    new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const handleCommentReaction = (commentId: string, reaction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Войдите, чтобы реагировать на комментарии.',
        variant: 'destructive',
      })
      navigate('/auth')
      return
    }

    setReactionState((prev) => {
      const current =
        prev[commentId] ?? { score: 0, positive: 0, negative: 0, userReaction: null }
      let {
        score = 0,
        positive = 0,
        negative = 0,
        userReaction,
      } = current

      if (reaction === 'up') {
        if (userReaction === 'up') {
          positive = Math.max(0, positive - 1)
          score = Math.max(-999, score - 1)
          userReaction = null
        } else {
          if (userReaction === 'down') {
            negative = Math.max(0, negative - 1)
            score += 1
          }
          positive += 1
          score += 1
          userReaction = 'up'
        }
      } else {
        if (userReaction === 'down') {
          negative = Math.max(0, negative - 1)
          score = Math.min(999, score + 1)
          userReaction = null
        } else {
          if (userReaction === 'up') {
            positive = Math.max(0, positive - 1)
            score -= 1
          }
          negative += 1
          score -= 1
          userReaction = 'down'
        }
      }

      return {
        ...prev,
        [commentId]: {
          score,
          positive,
          negative,
          userReaction,
        },
      }
    })

    // TODO: integrate with Strapi comment reaction API
  }

  const handleCommentAction = (
    comment: CommentNode,
    action: 'report' | 'edit' | 'delete' | 'info'
  ) => {
    switch (action) {
      case 'report':
        toast({
          title: 'Жалоба отправлена',
          description: `Мы рассмотрим комментарий пользователя @${comment.author.username}.`,
        })
        break
      case 'edit':
        toast({
          title: 'Редактирование',
          description: 'Редактирование комментариев пока не реализовано.',
        })
        break
      case 'delete':
        toast({
          title: 'Удаление',
          description: 'Удаление комментариев пока не реализовано.',
        })
        break
      case 'info':
        setInfoComment(comment)
        setIsInfoOpen(true)
        break
    }
  }

  const renderCommentThread = (
    nodes: CommentNode[],
    depth = 0,
    options: { showConnectors?: boolean; threadMode?: boolean } = {}
  ): JSX.Element[] => {
    const { showConnectors = true, threadMode = false } = options

    return nodes.flatMap((node) => {
      const initials = (node.author.username ?? 'U').slice(0, 2).toUpperCase()

      const commentDepth = depth
      const paddingLeft =
        showConnectors && commentDepth > 0
          ? THREAD_BASE_OFFSET + commentDepth * THREAD_LINE_GAP
          : 0

      const isHoverTarget = hoveredCommentId === node.id
      const isInHoverPath =
        hoverContext.ancestors.has(node.id) || hoverContext.descendants.has(node.id)
      const matchesHighlightDepth =
        highlightDepth !== null ? commentDepth >= highlightDepth : false
      const isCollapsed = collapsedMap[node.id] ?? false
      const parentId = parentById.get(node.id) ?? null
      const parentNode = parentId ? nodeLookup.get(parentId) : undefined
      const replyDescendants = descendantCountById.get(node.id) ?? node.replies.length
      const isOwnComment = user ? String(node.author.id) === String(user.id) : false
      const isDimmedByHover = hoveredCommentId !== null && !isHoverTarget && !isInHoverPath
      const isDimmedByDepth =
        highlightDepth !== null &&
        commentDepth < highlightDepth &&
        !isHoverTarget &&
        !isInHoverPath
      const dimClass = isDimmedByHover ? 'opacity-35' : isDimmedByDepth ? 'opacity-60' : undefined
      const connectorOpacity = isDimmedByHover ? 0.35 : isDimmedByDepth ? 0.6 : 1

      const resolveConnectorTone = (level: number) => {
        if (highlightDepth !== null && level < highlightDepth) {
          return 'bg-border/30'
        }
        if (isHoverTarget) {
          return 'bg-primary/60'
        }
        if (isInHoverPath) {
          return 'bg-primary/50'
        }
        return 'bg-border/60'
      }

      const commentElement = (
        <div
          key={`comment-${node.id}`}
          id={`comment-${node.id}`}
          className="relative space-y-3"
          style={paddingLeft ? ({ paddingLeft } as CSSProperties) : undefined}
          onMouseEnter={() => setHoveredCommentId(node.id)}
          onMouseLeave={() => setHoveredCommentId((prev) => (prev === node.id ? null : prev))}
        >
          {showConnectors && commentDepth > 0 && (
            <>
              {Array.from({ length: commentDepth }).map((_, index) => {
                const depthLevel = index + 1
                const tone = resolveConnectorTone(depthLevel)
                const left = THREAD_BASE_OFFSET + index * THREAD_LINE_GAP - THREAD_LINE_WIDTH / 2
                return (
                  <span
                    key={`thread-line-${node.id}-${depthLevel}`}
                    aria-hidden
                    className={cn(
                      'pointer-events-none absolute rounded-full transition-opacity duration-[800ms]',
                      tone
                    )}
                    style={{
                      left,
                      top: 0,
                      bottom: THREAD_ELBOW_Y,
                      width: THREAD_LINE_WIDTH,
                      opacity: connectorOpacity,
                    }}
                  />
                )
              })}
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute z-10 rounded-full transition-all duration-[800ms]',
                  resolveConnectorTone(commentDepth)
                )}
                style={{
                  left:
                    THREAD_BASE_OFFSET + (commentDepth - 1) * THREAD_LINE_GAP - THREAD_LINE_WIDTH / 2,
                  top: THREAD_ELBOW_Y - THREAD_LINE_WIDTH / 2,
                  width: THREAD_ELBOW_LENGTH,
                  height: THREAD_LINE_WIDTH,
                  borderTopLeftRadius: 999,
                  borderBottomLeftRadius: 999,
                  opacity: connectorOpacity,
                }}
              />
            </>
          )}
          <Card
            className={cn(
              'border-none bg-transparent shadow-none transition-colors transition-opacity duration-[800ms]',
              isHoverTarget && 'ring-2 ring-primary/60 ring-offset-0',
              dimClass
            )}
          >
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  {node.author.avatar ? (
                    <AvatarImage src={node.author.avatar} alt={node.author.username} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {node.author.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCommentTimestamp(node.createdAt)}
                    </span>
                    {matchesHighlightDepth && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        depth {commentDepth}
                      </Badge>
                    )}
                  </div>
                  {parentNode && (
                    <button
                      type="button"
                      onClick={() => {
                        const anchor = document.getElementById(`comment-${parentNode.id}`)
                        if (anchor) {
                          anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          if (replyHighlightTimeoutRef.current) {
                            clearTimeout(replyHighlightTimeoutRef.current)
                          }
                          const parentDepth = depthById.get(parentNode.id) ?? null
                          setHighlightDepth(parentDepth)
                          replyHighlightTimeoutRef.current = setTimeout(() => {
                            setHighlightDepth((prev) =>
                              prev === parentDepth ? null : prev
                            )
                          }, 2500)
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[11px] font-medium transition hover:bg-muted hover:text-foreground"
                    >
                      <CornerUpLeft className="h-3 w-3" />
                      В ответ @{parentNode.author.username}
                    </button>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words break-all">
                    {node.text}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => handleReplyClick(node.id, node.author.username)}
                  >
                    Ответить
                  </Button>
                  {node.replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() =>
                        setCollapsedMap((prev) => ({
                          ...prev,
                          [node.id]: !isCollapsed,
                        }))
                      }
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronRight className="h-3 w-3" />
                          Показать ответы ({replyDescendants})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Свернуть ({replyDescendants})
                        </>
                      )}
                    </Button>
                  )}
                  {node.replies.length > 0 && (!threadMode || node.id !== threadRootId) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => setThreadRootId(node.id)}
                    >
                      <CornerDownRight className="h-3 w-3" />
                      Открыть ветку
                    </Button>
                  )}
                  {threadMode && threadRootId === node.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => setThreadRootId(null)}
                    >
                      <Minimize2 className="h-3 w-3" />
                      Выход
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1 rounded-[calc(var(--radius)*1.4)] bg-background/35 px-1.5 py-1 shadow-sm ring-1 ring-border/60 backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-7 w-7 rounded-[calc(var(--radius)*1.2)] text-foreground transition hover:bg-background/70',
                            reactionState[node.id]?.userReaction === 'up' &&
                              'bg-primary text-primary-foreground hover:bg-primary/90'
                          )}
                          onClick={() => handleCommentReaction(node.id, 'up')}
                          disabled={!user}
                          aria-label="Поддержать"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <span
                          className={cn(
                            'min-w-[36px] px-2 py-1 text-center text-xs font-semibold tabular-nums',
                            (reactionState[node.id]?.score ?? 0) > 0 && 'text-emerald-400',
                            (reactionState[node.id]?.score ?? 0) < 0 && 'text-destructive',
                            (reactionState[node.id]?.score ?? 0) === 0 && 'text-foreground/70'
                          )}
                        >
                          {reactionState[node.id]?.score ?? 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-7 w-7 rounded-[calc(var(--radius)*1.2)] text-foreground transition hover:bg-background/70',
                            reactionState[node.id]?.userReaction === 'down' &&
                              'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          )}
                          onClick={() => handleCommentReaction(node.id, 'down')}
                          disabled={!user}
                          aria-label="Против"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      sideOffset={28}
                      className="flex items-center gap-3 rounded-[calc(var(--radius)*1.05)] border border-border/70 bg-popover/95 px-3 py-1.5 text-xs font-semibold tabular-nums shadow-lg backdrop-blur-sm"
                    >
                      <span className="text-emerald-400">
                        +{reactionState[node.id]?.positive ?? 0}
                      </span>
                      <span className="text-destructive">
                        -{reactionState[node.id]?.negative ?? 0}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Действия">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-60 rounded-[calc(var(--radius)*1.05)] border border-border/60 bg-popover/95 p-2 shadow-lg backdrop-blur"
                    >
                      <DropdownMenuLabel className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        @{node.author.username}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="flex items-start gap-2 px-2 py-2 text-xs text-muted-foreground"
                        disabled
                      >
                        <Clock className="mt-0.5 h-3.5 w-3.5" />
                        <span>{formatCommentTimestamp(node.createdAt)}</span>
                      </DropdownMenuItem>
                      {!isOwnComment && user && (
                        <DropdownMenuSeparator className="my-1" />
                      )}
                      {!isOwnComment && user && (
                        <DropdownMenuItem
                          onClick={() => handleCommentAction(node, 'report')}
                          className="flex items-center gap-2 px-2 py-2 text-sm"
                        >
                          <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Пожаловаться</span>
                        </DropdownMenuItem>
                      )}
                      {isOwnComment && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleCommentAction(node, 'edit')}
                            className="flex items-center gap-2 px-2 py-2 text-sm"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Изменить</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCommentAction(node, 'delete')}
                            className="flex items-center gap-2 px-2 py-2 text-sm text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Удалить</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user && <DropdownMenuSeparator className="my-1" />}
                      <DropdownMenuItem
                        onClick={() => handleCommentAction(node, 'info')}
                        className="flex items-center gap-2 px-2 py-2 text-sm"
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Информация</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {activeReply?.parentId === node.id && (
                <div className="space-y-2 rounded-lg border border-dashed border-border/60 bg-muted/20 p-3">
                  <textarea
                    placeholder={`Ответить ${node.author.username}`}
                    className="w-full min-h-[100px] rounded-lg border bg-background p-3 text-sm leading-relaxed break-words break-all whitespace-pre-wrap resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    ref={(el) => {
                      if (el) {
                        replyInputRefs.current.set(node.id, el)
                      } else {
                        replyInputRefs.current.delete(node.id)
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSubmitReply()
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelReply}>
                      Отмена
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitReply}
                      disabled={!replyText.trim()}
                    >
                      Отправить
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )

      if (node.replies.length === 0 || isCollapsed) {
        if (isCollapsed && node.replies.length > 0) {
          return [
            commentElement,
            <div
              key={`collapsed-${node.id}`}
              className="ml-4 text-xs text-muted-foreground"
            >
              Ответы скрыты
            </div>,
          ]
        }
        return [commentElement]
      }

      return [
        commentElement,
        ...renderCommentThread(node.replies, depth + 1, { showConnectors, threadMode }),
      ]
    })
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
    <TooltipProvider delayDuration={150}>
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
              className="text-foreground leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          <Separator className="my-8" />

          {/* Comments Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Комментарии ({combinedComments.length})
            </h2>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {threadRootId && nodeLookup.has(threadRootId) && (
                <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-xs">
                  <span className="text-muted-foreground">Фокус ветки:</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {(() => {
                      const chain: CommentNode[] = []
                      let cursor: string | null = threadRootId
                      while (cursor) {
                        const node = nodeLookup.get(cursor)
                        if (!node) break
                        chain.unshift(node)
                        cursor = parentById.get(cursor) ?? null
                      }
                      return chain.map((node, index) => (
                        <div key={`crumb-${node.id}`} className="flex items-center gap-1">
                          <button
                            type="button"
                            className={cn(
                              'rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium transition hover:bg-muted hover:text-foreground',
                              node.id === threadRootId && 'border-primary/40 text-primary'
                            )}
                            onClick={() => setThreadRootId(node.id)}
                          >
                            @{node.author.username}
                          </button>
                          {index !== chain.length - 1 && (
                            <span className="text-muted-foreground/60">/</span>
                          )}
                        </div>
                      ))
                    })()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-full px-2 text-xs"
                    onClick={() => setThreadRootId(null)}
                  >
                    Выйти из фокуса
                  </Button>
                </div>
              )}
            </div>

            <Card className="border border-border/60 bg-card">
              <CardContent className="pt-6 space-y-3">
                <textarea
                  placeholder={user ? 'Напишите комментарий…' : 'Войдите, чтобы оставить комментарий'}
                  className="w-full min-h-[120px] rounded-lg border bg-background p-3 text-sm leading-relaxed break-words break-all whitespace-pre-wrap resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  disabled={!user}
                  ref={commentInputRef}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      handleSubmitComment()
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  {!user && (
                    <Button variant="outline" onClick={() => navigate('/auth')}>
                      Войти
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!user || !commentText.trim()}
                  >
                    Отправить комментарий
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
              ) : combinedComments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Пока нет комментариев. Будьте первым!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                  {renderCommentThread(
                    threadRootId && nodeLookup.has(threadRootId)
                      ? [nodeLookup.get(threadRootId)!]
                      : commentTree,
                    0,
                    {
                      showStripes: !(threadRootId && nodeLookup.has(threadRootId)),
                      threadMode: !!(threadRootId && nodeLookup.has(threadRootId)),
                    }
                  )}
                      </div>
            )}
          </div>
        </article>
      </div>

      <Dialog
        open={isInfoOpen && !!infoComment}
        onOpenChange={(open) => {
          setIsInfoOpen(open)
          if (!open) {
            setInfoComment(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-1.5">
            <DialogTitle>Информация о комментарии</DialogTitle>
            <DialogDescription>
              Сводка для модерации и будущей интеграции со Strapi.
            </DialogDescription>
          </DialogHeader>
          {infoComment && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/30 p-3">
                <Avatar className="h-10 w-10">
                  {infoComment.author.avatar ? (
                    <AvatarImage src={infoComment.author.avatar} alt={infoComment.author.username} />
                  ) : null}
                  <AvatarFallback>
                    {infoComment.author.username
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    @{infoComment.author.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCommentTimestamp(infoComment.createdAt)} · ID {infoComment.id}
                  </p>
                  {infoParent && (
                    <p className="text-xs text-muted-foreground">
                      Ответ на @{infoParent.author.username}
                    </p>
                  )}
              </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Текст комментария
                </p>
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-background/70 p-3 text-sm leading-relaxed">
                  {infoComment.text}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs text-muted-foreground">Источник</p>
                  <p className="text-sm font-medium text-foreground">
                    {infoComment.source === 'local' ? 'Локальное хранилище (только у текущего пользователя)' : 'Strapi (общедоступно)'}
                  </p>
                </div>
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs text-muted-foreground">Ответов</p>
                  <p className="text-sm font-medium text-foreground">{infoComment.replies.length}</p>
                </div>
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs text-muted-foreground">Реакции (рейтинг)</p>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (infoReactions?.score ?? 0) > 0 && 'text-emerald-500',
                      (infoReactions?.score ?? 0) < 0 && 'text-destructive'
                    )}
                  >
                    {infoReactions?.score ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{infoReactions?.positive ?? 0} / -{infoReactions?.negative ?? 0}
                  </p>
          </div>
                <div className="rounded-[calc(var(--radius)*1.1)] border border-border/60 bg-muted/25 p-3">
                  <p className="text-xs text-muted-foreground">Статус синхронизации</p>
                  <p className="text-sm font-medium text-foreground">
                    {infoComment.source === 'local'
                      ? 'Ожидает отправки в Strapi'
                      : 'Получен из Strapi'}
                  </p>
      </div>
    </div>

              <div className="rounded-[calc(var(--radius)*1.1)] border border-dashed border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground">
                TODO: заменить локальное хранение на запросы к Strapi (`/api/comments`) и
                синхронизировать реакции через `/api/comment-reactions`.
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button variant="ghost" onClick={() => setIsInfoOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </TooltipProvider>
  )
}


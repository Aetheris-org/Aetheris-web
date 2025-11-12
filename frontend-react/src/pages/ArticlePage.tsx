
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LucideIcon, LucideProps } from 'lucide-react'
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
  ChevronLeft,
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
  Facebook,
  MessageCircle,
  Mail,
  MessageSquare,
  Link2,
} from 'lucide-react'
import { getArticle, reactArticle } from '@/api/articles'
import { getArticleComments } from '@/api/comments'
import type { Comment as RemoteComment } from '@/api/comments'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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

function DiscordIcon(props: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20.317 4.37A17.643 17.643 0 0 0 16.61 3c-.18.32-.386.75-.53 1.09a16.14 16.14 0 0 0-4.16 0c-.144-.34-.35-.77-.53-1.09a17.64 17.64 0 0 0-3.71 1.37C4.275 8.14 3.76 11.81 4.07 15.43a17.94 17.94 0 0 0 4.43 2.18c.36-.52.68-1.07.96-1.65-.52-.19-1.01-.42-1.47-.68l.34-.27c2.82 1.31 5.89 1.31 8.69 0l.34.27c-.46.26-.95.5-1.47.68.28.58.6 1.13.96 1.65a17.94 17.94 0 0 0 4.43-2.18c.31-3.23-.27-6.86-1.96-11.06ZM9.35 13.48c-.85 0-1.55-.78-1.55-1.74 0-.95.68-1.73 1.55-1.73.88 0 1.57.79 1.55 1.73 0 .96-.68 1.74-1.55 1.74Zm5.29 0c-.85 0-1.55-.78-1.55-1.74 0-.95.68-1.73 1.55-1.73.88 0 1.57.79 1.55 1.73 0 .96-.68 1.74-1.55 1.74Z" />
    </svg>
  )
}

function RedditIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

function InstagramIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function YoutubeIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function GithubIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

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

const MAX_VISIBLE_STRIPE_DEPTH = 6
const STRIPE_WIDTH = 2
const STRIPE_GAP = 4
const BASE_COMMENT_PADDING = 16
const STRIPE_CLASSNAMES = [
  'bg-border/80',
  'bg-border/70',
  'bg-border/60',
  'bg-border/50',
  'bg-border/40',
  'bg-border/30',
]

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
  const [sharePage, setSharePage] = useState(0)
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
    // If it's the copy link option, use the copy handler instead
    if (targetUrl === shareUrl) {
      handleCopyLink()
      return
    }
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
      const stripeCount = showConnectors ? Math.min(depth, MAX_VISIBLE_STRIPE_DEPTH) : 0
      const overflowDepth = Math.max(depth - MAX_VISIBLE_STRIPE_DEPTH, 0)
      const gutterWidth = stripeCount * (STRIPE_WIDTH + STRIPE_GAP)
      const paddingLeft = showConnectors
        ? depth > 0
          ? BASE_COMMENT_PADDING + gutterWidth
          : 0
        : depth > 0
          ? BASE_COMMENT_PADDING + depth * 10
          : 0

      const containerStyle: CSSProperties = {
        paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
        boxSizing: 'border-box',
      }

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

      const commentElement = (
        <div
          key={`comment-${node.id}`}
          id={`comment-${node.id}`}
          className="relative space-y-3"
          style={containerStyle}
          onMouseEnter={() => setHoveredCommentId(node.id)}
          onMouseLeave={() => setHoveredCommentId((prev) => (prev === node.id ? null : prev))}
        >
          {showConnectors && stripeCount > 0 && (
            <>
              <div aria-hidden className="pointer-events-auto absolute left-0 top-0 bottom-0 flex">
              {Array.from({ length: stripeCount }).map((_, stripeIndex) => {
                const stripeDepth = stripeIndex + 1
                const stripeActive =
                  highlightDepth !== null ? stripeDepth >= highlightDepth : true
                  const isLastStripe = stripeIndex === stripeCount - 1
                return (
                  <span
                    key={`stripe-${node.id}-${stripeIndex}`}
                    className={cn(
                      'h-full cursor-pointer rounded-full transition-opacity',
                      STRIPE_CLASSNAMES[stripeIndex % STRIPE_CLASSNAMES.length],
                      stripeActive ? 'opacity-60 hover:opacity-90' : 'opacity-20'
                    )}
                    style={{
                      width: STRIPE_WIDTH,
                        marginRight: isLastStripe ? 0 : STRIPE_GAP,
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      setHighlightDepth((prev) =>
                        prev === stripeDepth ? null : stripeDepth
                      )
                    }}
                  />
                )
              })}
            </div>
            </>
          )}
          {overflowDepth > 0 && (
            <span className="pointer-events-none absolute left-0 top-2 inline-flex -translate-x-3 select-none rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{overflowDepth}
            </span>
          )}
          <Card
            className={cn(
              'border-none bg-transparent shadow-none transition-all duration-[800ms]',
              isHoverTarget && 'border border-border/60 bg-muted/25 shadow-md backdrop-blur-sm',
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

  const shareTargets = useMemo<Array<{ label: string; description: string; icon: LucideIcon | React.ComponentType<{ className?: string }>; href: string }>>(() => {
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
        label: 'Share on Facebook',
        description: 'Share with your friends',
        icon: Facebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
      {
        label: 'Share on LinkedIn',
        description: 'Reach your professional network',
        icon: Linkedin,
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      },
      {
        label: 'Send via Telegram',
        description: 'Share instantly in Telegram',
        icon: Send,
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      },
      {
        label: 'Share via WhatsApp',
        description: 'Send to WhatsApp contacts',
        icon: MessageCircle,
        href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      },
      {
        label: 'Share via Email',
        description: 'Send via email',
        icon: Mail,
        href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%20${encodedUrl}`,
      },
      {
        label: 'Share on Reddit',
        description: 'Post to Reddit',
        icon: RedditIcon,
        href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      },
      {
        label: 'Share on Discord',
        description: 'Share on Discord',
        icon: DiscordIcon,
        href: `https://discord.com/`,
      },
      {
        label: 'Share on Instagram',
        description: 'Share on Instagram',
        icon: InstagramIcon,
        href: `https://www.instagram.com/`,
      },
      {
        label: 'Share on YouTube',
        description: 'Share on YouTube',
        icon: YoutubeIcon,
        href: `https://www.youtube.com/`,
      },
      {
        label: 'Share on GitHub',
        description: 'Share on GitHub',
        icon: GithubIcon,
        href: `https://github.com/`,
      },
      {
        label: 'Copy link',
        description: 'Copy article link',
        icon: Link2,
        href: shareUrl,
      },
    ]
  }, [shareUrl, shareTitle])

  const SHARE_ITEMS_PER_PAGE = 6
  const totalPages = Math.ceil(shareTargets.length / SHARE_ITEMS_PER_PAGE)
  const currentPageItems = shareTargets.slice(
    sharePage * SHARE_ITEMS_PER_PAGE,
    (sharePage + 1) * SHARE_ITEMS_PER_PAGE
  )

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
        <article className="w-full">
          {article.previewImage && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-border/40">
              <img
                src={article.previewImage}
                alt={article.title}
                className="w-full h-auto object-contain"
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
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary font-medium text-xs">
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

            <div className="rounded-lg border border-border/30 bg-muted/20 p-6 space-y-6">
                {/* Comment Input Form */}
                <div className="space-y-3">
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
                </div>

                {/* Separator */}
                <Separator />

            {/* Comments List */}
            {isCommentsLoading || isCommentsRefetching ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex items-center gap-4 pt-1">
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-6 w-20" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : combinedComments.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                  Пока нет комментариев. Будьте первым!
                  </div>
            ) : (
              <div className="space-y-4">
                    {renderCommentThread(
                      threadRootId && nodeLookup.has(threadRootId)
                        ? [nodeLookup.get(threadRootId)!]
                        : commentTree,
                      0,
                      {
                        showConnectors: !(threadRootId && nodeLookup.has(threadRootId)),
                        threadMode: !!(threadRootId && nodeLookup.has(threadRootId)),
                      }
                    )}
                      </div>
                )}
            </div>
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
            setSharePage(0)
            if (copyTimeoutRef.current) {
              clearTimeout(copyTimeoutRef.current)
              copyTimeoutRef.current = null
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Share this article</DialogTitle>
            <DialogDescription className="text-base">
              Spread the word about {article ? `"${article.title}"` : 'this article'} across your favorite channels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Share link section */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Share link</label>
              <div className="relative flex items-center gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="pr-24 font-mono text-xs border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  size="sm"
                  variant={copySuccess ? 'default' : 'outline'}
                  className="absolute right-1.5 h-7 px-2.5 gap-1.5 shrink-0"
                  onClick={handleCopyLink}
                  disabled={!shareUrl}
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Social sharing buttons */}
            {shareTargets.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Share on social</label>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {sharePage + 1} / {totalPages}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setSharePage((prev) => Math.max(0, prev - 1))}
                          disabled={sharePage === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setSharePage((prev) => Math.min(totalPages - 1, prev + 1))}
                          disabled={sharePage === totalPages - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentPageItems.map((target) => {
                    const Icon = target.icon
                    return (
                      <Button
                        key={target.label}
                        variant="outline"
                        className="h-auto justify-start gap-3 p-3.5 hover:bg-accent/50 transition-colors overflow-hidden"
                        onClick={() => handleExternalShare(target.href)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left overflow-hidden">
                          <span className="text-sm font-medium leading-tight truncate w-full">
                            {target.label}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                            {target.description}
                          </span>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Native share button */}
            {canUseNativeShare && (
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-foreground">Device sharing</label>
                <Button
                  variant="outline"
                  className="w-full h-auto justify-start gap-3 p-3.5 hover:bg-accent/50 transition-colors overflow-hidden"
                  onClick={handleNativeShare}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left overflow-hidden">
                    <span className="text-sm font-medium leading-tight truncate w-full">Share via device</span>
                    <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                      Use your device's sharing options
                    </span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  )
}
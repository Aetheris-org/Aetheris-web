import { useState, useMemo } from 'react'
import {
  Bug,
  Sparkles,
  Plus,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Copy,
  XCircle,
  Filter,
  ArrowUpDown,
  Search,
  MessageSquare,
  Eye,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { mockBugs, mockFeatures, type Feedback, type FeedbackType, type FeedbackStatus, type FeedbackPriority } from '@/data/feedbackMockData'
import { useTranslation } from '@/hooks/useTranslation'
// Simple date formatting function (replaces date-fns)
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'только что'
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'} назад`
  }
  const years = Math.floor(diffInSeconds / 31536000)
  return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} назад`
}

export default function FeedbackPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'bugs' | 'features'>('bugs')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<FeedbackPriority | 'all'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-voted' | 'priority'>('newest')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredFeedback = useMemo(() => {
    const currentFeedback = activeTab === 'bugs' ? mockBugs : mockFeatures
    let filtered = [...currentFeedback]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((item) => item.priority === priorityFilter)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'most-voted':
        filtered.sort((a, b) => {
          const aVotes = a.reactions.upvote - a.reactions.downvote
          const bVotes = b.reactions.upvote - b.reactions.downvote
          return bVotes - aVotes
        })
        break
      case 'priority':
        const priorityOrder: Record<FeedbackPriority, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        }
        filtered.sort((a, b) => {
          const aPriority = a.priority ? priorityOrder[a.priority] : 0
          const bPriority = b.priority ? priorityOrder[b.priority] : 0
          return bPriority - aPriority
        })
        break
    }

    return filtered
  }, [activeTab, searchQuery, statusFilter, priorityFilter, sortBy])

  const handleReaction = (feedbackId: string, reactionType: 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix') => {
    // TODO: Replace with API call
    console.log('Reaction:', feedbackId, reactionType)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container space-y-8 sm:space-y-8 lg:space-y-10 pb-6 sm:pb-6 pt-6 sm:pt-6 px-4 sm:px-6">
        {/* Header */}
        <div className="space-y-6 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-3 sm:space-y-3">
              <h1 className="text-3xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('feedback.title')}</h1>
              <p className="text-sm sm:text-sm text-muted-foreground">{t('feedback.description')}</p>
            </div>
            {user && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('feedback.createNew')}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4">
            <Card className="border-border/40 bg-card hover:border-border transition-all">
              <CardContent className="p-5 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <Bug className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockBugs.length}</p>
                    <p className="text-xs text-muted-foreground">{t('feedback.bugs')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card hover:border-border transition-all">
              <CardContent className="p-5 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockFeatures.length}</p>
                    <p className="text-xs text-muted-foreground">{t('feedback.features')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card hover:border-border transition-all">
              <CardContent className="p-5 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {[...mockBugs, ...mockFeatures].filter((f) => f.status === 'resolved').length}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('feedback.resolved')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card hover:border-border transition-all">
              <CardContent className="p-5 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {[...mockBugs, ...mockFeatures].filter((f) => f.status === 'in-progress').length}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('feedback.inProgress')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as 'bugs' | 'features')
            // Reset filters when switching tabs
            setStatusFilter('all')
            setPriorityFilter('all')
            setSearchQuery('')
          }}
          className="space-y-6 sm:space-y-6"
        >
          <div className="space-y-4 sm:space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="bugs" className="gap-2">
                  <Bug className="h-4 w-4" />
                  {t('feedback.bugs')} ({mockBugs.length})
                </TabsTrigger>
                <TabsTrigger value="features" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('feedback.features')} ({mockFeatures.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative flex-1 sm:flex-initial sm:w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    placeholder={t('feedback.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 sm:pl-9 h-11 sm:h-10 text-base sm:text-sm"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card className="border-border/40 bg-card">
                <CardContent className="p-4 sm:p-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FeedbackStatus | 'all')}>
                      <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-9">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('feedback.filters.allStatuses')}</SelectItem>
                        <SelectItem value="open">{t('feedback.status.open')}</SelectItem>
                        <SelectItem value="in-progress">{t('feedback.status.inProgress')}</SelectItem>
                        <SelectItem value="resolved">{t('feedback.status.resolved')}</SelectItem>
                        <SelectItem value="rejected">{t('feedback.status.rejected')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {activeTab === 'bugs' && (
                      <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as FeedbackPriority | 'all')}>
                        <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-9">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('feedback.filters.allPriorities')}</SelectItem>
                          <SelectItem value="low">{t('feedback.priority.low')}</SelectItem>
                          <SelectItem value="medium">{t('feedback.priority.medium')}</SelectItem>
                          <SelectItem value="high">{t('feedback.priority.high')}</SelectItem>
                          <SelectItem value="critical">{t('feedback.priority.critical')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                      <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-9">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">{t('feedback.sort.newest')}</SelectItem>
                        <SelectItem value="oldest">{t('feedback.sort.oldest')}</SelectItem>
                        <SelectItem value="most-voted">{t('feedback.sort.mostVoted')}</SelectItem>
                        {activeTab === 'bugs' && <SelectItem value="priority">{t('feedback.sort.priority')}</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <TabsContent value="bugs" className="space-y-4 sm:space-y-4">
            {filteredFeedback.length === 0 ? (
              <Card className="border-dashed border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-12 text-center px-4">
                  <p className="text-lg sm:text-lg font-medium">{t('feedback.noResults')}</p>
                  <p className="mt-2 text-sm sm:text-sm text-muted-foreground">{t('feedback.noResultsDescription')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  onReaction={handleReaction}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-4 sm:space-y-4">
            {filteredFeedback.length === 0 ? (
              <Card className="border-dashed border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-12 text-center px-4">
                  <p className="text-lg sm:text-lg font-medium">{t('feedback.noResults')}</p>
                  <p className="mt-2 text-sm sm:text-sm text-muted-foreground">{t('feedback.noResultsDescription')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  onReaction={handleReaction}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Feedback Dialog */}
      {user && (
        <CreateFeedbackDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      )}
    </div>
  )
}

interface FeedbackCardProps {
  feedback: Feedback
  onReaction: (feedbackId: string, reactionType: 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix') => void
}

function FeedbackCard({ feedback, onReaction }: FeedbackCardProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const statusConfig = {
    open: { label: t('feedback.status.open'), icon: Clock, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    'in-progress': { label: t('feedback.status.inProgress'), icon: AlertCircle, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    resolved: { label: t('feedback.status.resolved'), icon: CheckCircle2, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    rejected: { label: t('feedback.status.rejected'), icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  }

  const priorityConfig = {
    low: { label: t('feedback.priority.low'), color: 'bg-gray-500/10 text-gray-600' },
    medium: { label: t('feedback.priority.medium'), color: 'bg-blue-500/10 text-blue-600' },
    high: { label: t('feedback.priority.high'), color: 'bg-orange-500/10 text-orange-600' },
    critical: { label: t('feedback.priority.critical'), color: 'bg-red-500/10 text-red-600' },
  }

  const StatusIcon = statusConfig[feedback.status].icon

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card hover:border-border transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start gap-3">
                {feedback.type === 'bug' ? (
                  <Bug className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                )}
                <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                  {feedback.title}
                </CardTitle>
              </div>
              <CardDescription className="line-clamp-2 text-sm">{feedback.description}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge variant="outline" className={cn('gap-1.5', statusConfig[feedback.status].color)}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig[feedback.status].label}
              </Badge>
              {feedback.priority && (
                <Badge variant="outline" className={priorityConfig[feedback.priority].color}>
                  {priorityConfig[feedback.priority].label}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Steps to Reproduce (only for bugs) */}
        {feedback.type === 'bug' && feedback.stepsToReproduce && (
          <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertCircle className="h-4 w-4 text-primary" />
              {t('feedback.stepsToReproduce')}
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pl-6">
              {feedback.stepsToReproduce}
            </div>
          </div>
        )}

        {/* Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {feedback.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer rounded-md text-xs transition-colors bg-primary/10 text-primary hover:bg-primary/15"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex flex-wrap items-center gap-2">
          <ReactionButton
            feedbackId={feedback.id}
            type="upvote"
            count={feedback.reactions.upvote}
            isActive={feedback.userReaction === 'upvote'}
            onClick={() => onReaction(feedback.id, 'upvote')}
            disabled={!user}
          />
          <ReactionButton
            feedbackId={feedback.id}
            type="downvote"
            count={feedback.reactions.downvote}
            isActive={feedback.userReaction === 'downvote'}
            onClick={() => onReaction(feedback.id, 'downvote')}
            disabled={!user}
          />
          <ReactionButton
            feedbackId={feedback.id}
            type="important"
            count={feedback.reactions.important}
            isActive={feedback.userReaction === 'important'}
            onClick={() => onReaction(feedback.id, 'important')}
            disabled={!user}
          />
          {feedback.type === 'bug' && (
            <>
              <ReactionButton
                feedbackId={feedback.id}
                type="duplicate"
                count={feedback.reactions.duplicate}
                isActive={feedback.userReaction === 'duplicate'}
                onClick={() => onReaction(feedback.id, 'duplicate')}
                disabled={!user}
              />
              <ReactionButton
                feedbackId={feedback.id}
                type="wontfix"
                count={feedback.reactions.wontfix}
                isActive={feedback.userReaction === 'wontfix'}
                onClick={() => onReaction(feedback.id, 'wontfix')}
                disabled={!user}
              />
            </>
          )}
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{feedback.author.username}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatTimeAgo(new Date(feedback.createdAt))}</span>
          </div>
          {feedback.views && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>{feedback.views}</span>
            </div>
          )}
          {feedback.commentsCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{feedback.commentsCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ReactionButtonProps {
  feedbackId: string
  type: 'upvote' | 'downvote' | 'important' | 'duplicate' | 'wontfix'
  count: number
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}

function ReactionButton({ type, count, isActive, onClick, disabled }: ReactionButtonProps) {
  const { t } = useTranslation()

  const config = {
    upvote: { icon: ThumbsUp, label: t('feedback.reactions.upvote') },
    downvote: { icon: ThumbsDown, label: t('feedback.reactions.downvote') },
    important: { icon: AlertTriangle, label: t('feedback.reactions.important') },
    duplicate: { icon: Copy, label: t('feedback.reactions.duplicate') },
    wontfix: { icon: XCircle, label: t('feedback.reactions.wontfix') },
  }

  const { icon: Icon, label } = config[type]

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      className={cn(
        'gap-1.5 h-8',
        isActive && 'bg-primary text-primary-foreground'
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{count}</span>
    </Button>
  )
}

interface CreateFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateFeedbackDialog({ open, onOpenChange }: CreateFeedbackDialogProps) {
  const { t } = useTranslation()
  const [type, setType] = useState<FeedbackType>('bug')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [priority, setPriority] = useState<FeedbackPriority>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)
    // TODO: Replace with API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Creating feedback:', {
      type,
      title,
      description,
      stepsToReproduce: type === 'bug' ? stepsToReproduce : undefined,
      priority,
      tags,
    })
    setIsSubmitting(false)
    handleOpenChange(false)
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const resetForm = () => {
    setType('bug')
    setTitle('')
    setDescription('')
    setStepsToReproduce('')
    setPriority('medium')
    setTags([])
    setTagInput('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('feedback.createNew')}</DialogTitle>
          <DialogDescription>{t('feedback.createDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>{t('feedback.form.type')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={cn(
                  'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  type === 'bug'
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-border hover:border-border/80 hover:bg-muted/50'
                )}
              >
                <Bug className={cn('h-5 w-5 shrink-0', type === 'bug' ? 'text-red-600' : 'text-muted-foreground')} />
                <div>
                  <div className="font-semibold text-foreground">{t('feedback.bugs')}</div>
                  <div className="text-xs text-muted-foreground">{t('feedback.form.bugDescription')}</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('feature')}
                className={cn(
                  'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  type === 'feature'
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border hover:border-border/80 hover:bg-muted/50'
                )}
              >
                <Sparkles className={cn('h-5 w-5 shrink-0', type === 'feature' ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <div className="font-semibold text-foreground">{t('feedback.features')}</div>
                  <div className="text-xs text-muted-foreground">{t('feedback.form.featureDescription')}</div>
                </div>
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="title">{t('feedback.form.title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('feedback.form.titlePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('feedback.form.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('feedback.form.descriptionPlaceholder')}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Steps to Reproduce (only for bugs) */}
          {type === 'bug' && (
            <div className="space-y-2">
              <Label htmlFor="stepsToReproduce" className="flex items-center gap-2">
                {t('feedback.form.stepsToReproduce')}
                <span className="text-xs text-muted-foreground font-normal">({t('common.optional')})</span>
              </Label>
              <Textarea
                id="stepsToReproduce"
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                placeholder={t('feedback.form.stepsToReproducePlaceholder')}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{t('feedback.form.stepsToReproduceHint')}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{t('feedback.form.priority')}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as FeedbackPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('feedback.priority.low')}</SelectItem>
                  <SelectItem value="medium">{t('feedback.priority.medium')}</SelectItem>
                  <SelectItem value="high">{t('feedback.priority.high')}</SelectItem>
                  {type === 'bug' && <SelectItem value="critical">{t('feedback.priority.critical')}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{t('feedback.form.tags')}</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder={t('feedback.form.tagsPlaceholder')}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                {t('feedback.form.addTag')}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1.5">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !description.trim() || isSubmitting}>
            {isSubmitting ? t('common.loading') : type === 'bug' ? t('feedback.form.submitBug') : t('feedback.form.submitFeature')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


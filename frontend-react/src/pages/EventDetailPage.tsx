import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Users,
  Trophy,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  Star,
} from 'lucide-react'

import { mockEvents } from '@/data/exploreMockData'
import type { Event } from '@/types/explore'

/**
 * EVENT DETAIL PAGE
 * 
 * Динамическая страница для каждого ивента.
 * 
 * BACKEND INTEGRATION:
 * 1. Заменить mockEvents на API call: GET /api/explore/events/:id
 * 2. Добавить real-time updates для счетчика участников
 * 3. Реализовать регистрацию: POST /api/explore/events/:id/register
 * 4. Добавить комментарии и обсуждения
 * 5. Интегрировать систему лайков
 * 6. Добавить функцию "поделиться"
 */

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // В реальном приложении: загружать из API
  const event = useMemo(() => {
    return mockEvents.find(e => e.id === id)
  }, [id])

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/explore')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </Card>
      </div>
    )
  }

  const registrationProgress = event.maxParticipants
    ? (event.participants / event.maxParticipants) * 100
    : 0

  const spotsLeft = event.maxParticipants ? event.maxParticipants - event.participants : null

  const handleRegister = () => {
    // TODO: Implement API call
    // POST /api/explore/events/:id/register
    setIsRegistered(true)
  }

  const handleUnregister = () => {
    // TODO: Implement API call
    // POST /api/explore/events/:id/unregister
    setIsRegistered(false)
  }

  const handleLike = () => {
    // TODO: Implement API call
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.shortDescription,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/explore')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Button>

      {/* Hero Banner */}
      {event.banner && (
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={event.status === 'active' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}>
                {event.status}
              </Badge>
              <Badge variant="outline">{event.type}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <p className="text-lg text-muted-foreground">{event.shortDescription}</p>
          </div>
        </div>
      )}

      {!event.banner && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={event.status === 'active' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}>
              {event.status}
            </Badge>
            <Badge variant="outline">{event.type}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-lg text-muted-foreground">{event.shortDescription}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-2">
            {event.status === 'active' || event.status === 'upcoming' ? (
              isRegistered ? (
                <Button variant="outline" className="flex-1 gap-2" onClick={handleUnregister}>
                  <CheckCircle2 className="h-4 w-4" />
                  Registered
                </Button>
              ) : (
                <Button className="flex-1 gap-2" onClick={handleRegister}>
                  <CheckCircle2 className="h-4 w-4" />
                  Register Now
                </Button>
              )
            ) : (
              <Button className="flex-1 gap-2">
                <Award className="h-4 w-4" />
                View Results
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={handleLike}>
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this event</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>{event.description}</p>
            </CardContent>
          </Card>

          {/* Prizes */}
          {event.prizes && event.prizes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Prizes & Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.prizes.map((prize) => (
                  <div key={prize.place} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                      #{prize.place}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{prize.title}</h4>
                      <p className="text-sm text-muted-foreground">{prize.description}</p>
                      {prize.value && (
                        <p className="text-lg font-bold text-primary mt-1">{prize.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {event.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.requirements.minLevel && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Minimum Level: {event.requirements.minLevel}</span>
                  </div>
                )}
                {event.requirements.minRating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>Minimum Rating: {event.requirements.minRating}</span>
                  </div>
                )}
                {event.requirements.clanOnly && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Clan members only</span>
                  </div>
                )}
                {event.requirements.inviteOnly && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span>Invite only</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs: Participants, Discussion, etc. */}
          <Tabs defaultValue="participants" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">
                Participants ({event.participants})
              </TabsTrigger>
              <TabsTrigger value="discussion">
                Discussion
              </TabsTrigger>
            </TabsList>
            <TabsContent value="participants" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Participant list will be shown here
                  </p>
                  {/* TODO: Implement participant list with API */}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="discussion" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-5 w-5" />
                    <p>Discussion feature coming soon</p>
                  </div>
                  {/* TODO: Implement discussion/comments with API */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Organizer */}
              <div>
                <div className="text-sm font-medium mb-2">Organized by</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.organizer.avatar} />
                    <AvatarFallback>{event.organizer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{event.organizer.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{event.organizer.type}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Start Date</div>
                    <div className="text-muted-foreground">
                      {new Date(event.startDate).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">End Date</div>
                    <div className="text-muted-foreground">
                      {new Date(event.endDate).toLocaleString()}
                    </div>
                  </div>
                </div>
                {event.registrationDeadline && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Registration Deadline</div>
                      <div className="text-muted-foreground">
                        {new Date(event.registrationDeadline).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Participants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Participants</span>
                  <span className="text-sm text-muted-foreground">
                    {event.participants}
                    {event.maxParticipants && `/${event.maxParticipants}`}
                  </span>
                </div>
                {event.maxParticipants && (
                  <>
                    <Progress value={registrationProgress} className="mb-2" />
                    {spotsLeft !== null && spotsLeft > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {spotsLeft} spots remaining
                      </p>
                    )}
                    {spotsLeft === 0 && (
                      <p className="text-xs text-destructive font-medium">
                        Event is full
                      </p>
                    )}
                  </>
                )}
              </div>

              <Separator />

              {/* Category & Tags */}
              <div>
                <div className="text-sm font-medium mb-2">Category</div>
                <Badge variant="outline">{event.category}</Badge>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{event.viewsCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{event.registrationsCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Registered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Events */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEvents
                .filter(e => e.id !== event.id && e.category === event.category)
                .slice(0, 3)
                .map((similarEvent) => (
                  <div
                    key={similarEvent.id}
                    className="flex gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                    onClick={() => navigate(`/explore/events/${similarEvent.id}`)}
                  >
                    {similarEvent.thumbnail && (
                      <img
                        src={similarEvent.thumbnail}
                        alt={similarEvent.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2">{similarEvent.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {similarEvent.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
    </div>
  )
}


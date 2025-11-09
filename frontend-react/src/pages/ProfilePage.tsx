import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, FileText, MessageCircle, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ArticleCard } from '@/components/ArticleCard'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  
  const isOwnProfile = currentUser?.id === Number(id)

  // Mock data - replace with actual API calls
  const profileData = {
    id: Number(id),
    username: 'JohnDoe',
    avatar: undefined,
    bio: 'Full-stack developer passionate about React and TypeScript. Building modern web applications.',
    joinDate: '2024-01-15',
    articlesCount: 12,
    followersCount: 234,
    followingCount: 89,
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
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
          <ThemeToggle />
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                {/* Avatar */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold">
                    {profileData.username[0].toUpperCase()}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold">{profileData.username}</h2>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDate(profileData.joinDate)}
                    </p>
                  </div>

                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => navigate('/settings/profile')}
                    >
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{profileData.articlesCount}</div>
                    <div className="text-xs text-muted-foreground">Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profileData.followersCount}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profileData.followingCount}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>

                {profileData.bio && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profileData.bio}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            <Tabs defaultValue="articles" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="articles" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Articles
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="space-y-4 mt-6">
                {/* Articles list will go here */}
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No articles yet
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4 mt-6">
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No comments yet
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}


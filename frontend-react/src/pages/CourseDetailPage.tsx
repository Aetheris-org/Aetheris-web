import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Lock,
  Play,
  ShieldCheck,
  Star,
  Users,
  FileText,
  Video,
  Code,
  ClipboardCheck,
  Target,
} from 'lucide-react'
import type { Course, CourseLesson } from '@/types/courses'
import { mockCourses, mockReviews, mockEnrollments } from '@/data/coursesMockData'

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Find course by slug
  const course = mockCourses.find((c) => c.slug === slug)

  // Get user enrollment (if exists)
  const enrollment = mockEnrollments.find((e) => e.courseId === course?.id)

  // Get reviews for this course
  const reviews = course ? mockReviews[course.id] || [] : []

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-16">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h2 className="text-2xl font-bold mb-2">Курс не найден</h2>
              <p className="text-muted-foreground mb-4">Курс с таким адресом не существует</p>
              <Button onClick={() => navigate('/courses')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к курсам
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isEnrolled = !!enrollment

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-8 space-y-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate('/courses')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад к курсам
        </Button>

        {/* Course Header */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {course.isVerified && (
                  <Badge className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Верифицирован
                  </Badge>
                )}
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline" className="capitalize">
                  {course.level === 'beginner' && 'Начальный'}
                  {course.level === 'intermediate' && 'Средний'}
                  {course.level === 'advanced' && 'Продвинутый'}
                  {course.level === 'expert' && 'Эксперт'}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
              <p className="text-lg text-muted-foreground">{course.description}</p>

              {/* Author info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{course.author.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{course.author.username}</span>
                    {course.author.verified && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {course.author.coursesPublished} курсов · {formatNumber(course.author.totalStudents)} студентов
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">{course.stats.averageRating}</span>
                  <span className="text-muted-foreground">
                    ({formatNumber(course.stats.totalReviews)} отзывов)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{formatNumber(course.stats.enrolledStudents)} студентов</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.totalLessons} уроков</span>
                </div>
              </div>

              {/* Progress (if enrolled) */}
              {isEnrolled && enrollment && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Ваш прогресс</span>
                        <span className="text-muted-foreground">
                          {enrollment.progress.overallProgress}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress.overallProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {enrollment.progress.completedLessons.length} из {course.totalLessons} уроков завершено
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="curriculum">Программа</TabsTrigger>
                <TabsTrigger value="reviews">Отзывы</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* What you'll learn */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Чему вы научитесь
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Требования</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {course.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Темы курса</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <CourseRoadmap course={course} enrollment={enrollment} />
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{review.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.username}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'h-3.5 w-3.5',
                                        i < review.rating
                                          ? 'fill-primary text-primary'
                                          : 'text-muted-foreground/30'
                                      )}
                                    />
                                  ))}
                                </div>
                                <span>·</span>
                                <span>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>
                          </div>
                          {review.courseProgress === 100 && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Завершен
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{review.comment}</p>
                        {review.helpful > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <span className="text-xs text-muted-foreground">
                              {review.helpful} {review.helpful === 1 ? 'человек' : 'человек'} нашли это полезным
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">Пока нет отзывов</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="pt-6 space-y-4">
                {/* Pricing */}
                <div className="space-y-3">
                  {course.access.pricing.type === 'free' && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">Бесплатно</div>
                      <p className="text-sm text-muted-foreground mt-1">Полный доступ ко всем материалам</p>
                    </div>
                  )}
                  {course.access.pricing.type === 'paid' && (
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {course.access.pricing.price} {course.access.pricing.currency}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Единоразовая оплата</p>
                    </div>
                  )}
                  {course.access.pricing.type === 'subscription' && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                        <Crown className="h-6 w-6 text-primary" />
                        Подписка {course.access.pricing.requiredTier}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Требуется активная подписка</p>
                    </div>
                  )}
                  {course.access.pricing.type === 'level-gated' && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                        <Lock className="h-6 w-6 text-primary" />
                        Уровень {course.access.pricing.requiredLevel}+
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Достигните {course.access.pricing.requiredLevel} уровень для доступа
                      </p>
                    </div>
                  )}

                  {isEnrolled ? (
                    <Button size="lg" className="w-full gap-2" onClick={() => navigate(`/courses/${course.slug}/learn`)}>
                      <Play className="h-4 w-4" />
                      Продолжить обучение
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Начать обучение
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Course includes */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Курс включает:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(course.totalDuration)} видео</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{course.totalLessons} уроков</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span>Практические задания</span>
                    </li>
                    {course.providesCertificate && (
                      <li className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>Сертификат о прохождении</span>
                      </li>
                    )}
                  </ul>
                </div>

                {course.access.hasAds && course.access.adRevenue?.enabled && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                      <p>Этот курс поддерживается рекламой. Автор получает доход от просмотров.</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Author card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Об авторе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{course.author.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{course.author.username}</span>
                      {course.author.verified && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Уровень {course.author.level} · {course.author.reputation} репутации
                    </div>
                  </div>
                </div>
                {course.author.bio && (
                  <p className="text-sm text-muted-foreground">{course.author.bio}</p>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="font-semibold">{course.author.coursesPublished}</div>
                    <div className="text-xs text-muted-foreground">Курсов</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="font-semibold">{formatNumber(course.author.totalStudents)}</div>
                    <div className="text-xs text-muted-foreground">Студентов</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

interface CourseRoadmapProps {
  course: Course
  enrollment?: typeof mockEnrollments[0]
}

function CourseRoadmap({ course, enrollment }: CourseRoadmapProps) {
  const completedLessons = enrollment?.progress.completedLessons || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Программа курса</CardTitle>
          <Badge variant="secondary">
            {course.sections.length} {course.sections.length === 1 ? 'раздел' : 'разделов'}
          </Badge>
        </div>
        <CardDescription>
          {course.totalLessons} уроков · {formatDuration(course.totalDuration)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {course.sections.map((section, sectionIndex) => {
            const sectionCompleted = section.lessons.filter((l) =>
              completedLessons.includes(l.id)
            ).length
            const sectionProgress = (sectionCompleted / section.lessons.length) * 100

            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                      {sectionIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{section.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {section.lessons.length} уроков · {formatDuration(section.estimatedDuration)}
                      </div>
                      {enrollment && sectionProgress > 0 && (
                        <div className="mt-2">
                          <Progress value={sectionProgress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-4">
                    <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                    <div className="space-y-1">
                      {section.lessons.map((lesson) => (
                        <LessonItem
                          key={lesson.id}
                          lesson={lesson}
                          isCompleted={completedLessons.includes(lesson.id)}
                        />
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}

interface LessonItemProps {
  lesson: CourseLesson
  isCompleted: boolean
}

function LessonItem({ lesson, isCompleted }: LessonItemProps) {
  const getLessonIcon = () => {
    switch (lesson.type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'interactive':
        return <Code className="h-4 w-4" />
      case 'quiz':
        return <ClipboardCheck className="h-4 w-4" />
      case 'assignment':
        return <Target className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg p-3 transition-colors',
        lesson.isPreview ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-75',
        isCompleted && 'bg-primary/5'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0',
          isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : getLessonIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{lesson.title}</span>
          {lesson.isPreview && (
            <Badge variant="secondary" className="text-xs">
              Превью
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{lesson.duration} мин</div>
      </div>
      {!lesson.isPreview && (
        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}


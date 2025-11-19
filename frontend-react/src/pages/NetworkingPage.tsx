import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  SlidersHorizontal, 
  Briefcase, 
  Users, 
  Zap,
  Star,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Eye,
  MessageSquare,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import type { CompanyJobListing, ClientRequest, FreelancerOffer } from '@/types/networking'
import { 
  mockCompanyJobs, 
  mockClientRequests, 
  mockFreelancerOffers 
} from '@/data/networkingMockData'

/**
 * NETWORKING PAGE
 * 
 * Страница нетворкинга с тремя основными разделами:
 * 1. Вакансии от компаний (платные аккаунты)
 * 2. Запросы от заказчиков (фриланс)
 * 3. Предложения от фрилансеров
 * 
 * Все предложения можно фильтровать и бустить за деньги.
 */

// Константы для фильтров - будут переведены внутри компонента
const keywordModes = [
  { id: 'title' as const, labelKey: 'networking.search.title' },
  { id: 'description' as const, labelKey: 'networking.search.description' },
  { id: 'company' as const, labelKey: 'networking.search.company' },
]

const educationOptions = [
  { id: 'none', labelKey: 'networking.filters.notRequired' },
  { id: 'secondary-vocational', labelKey: 'networking.filters.secondaryVocational' },
  { id: 'higher', labelKey: 'networking.filters.higher' },
]

const scheduleOptions = [
  '5/2', '6/1', '4/3', '4/2', '3/3', '3/2', '2/2', '2/1', '1/3', '1/2', 
  'weekends', 'flexible', 'other', '4/4',
]

const workingHourOptions = [
  '2 hours', '3 hours', '4 hours', '5 hours', '6 hours', '7 hours', '8 hours',
  '9 hours', '10 hours', '11 hours', '12 hours', '24 hours', 'Agreement', 'Other',
]

const workFormats = [
  { id: 'onsite', labelKey: 'networking.filters.employerSite' },
  { id: 'remote', labelKey: 'networking.filters.remote' },
  { id: 'hybrid', labelKey: 'networking.filters.hybrid' },
  { id: 'travel', labelKey: 'networking.filters.travelRequired' },
]

const otherFilters = [
  { id: 'withAddress', labelKey: 'networking.filters.withAddress' },
  { id: 'accessible', labelKey: 'networking.filters.accessible' },
  { id: 'withoutAgencies', labelKey: 'networking.filters.withoutAgencies' },
  { id: 'teenFriendly', labelKey: 'networking.filters.teenFriendly' },
  { id: 'accreditedIt', labelKey: 'networking.filters.accreditedIt' },
  { id: 'lowResponses', labelKey: 'networking.filters.lowResponses' },
]

const paymentFrequencies = [
  { id: 'daily', labelKey: 'networking.filters.daily' },
  { id: 'weekly', labelKey: 'networking.filters.weekly' },
  { id: 'biweekly', labelKey: 'networking.filters.biweekly' },
  { id: 'monthly', labelKey: 'networking.filters.monthly' },
  { id: 'project', labelKey: 'networking.filters.project' },
]

const timeframeOptions = [
  { id: 'all', labelKey: 'networking.filters.allTime' },
  { id: 'month', labelKey: 'networking.filters.pastMonth' },
  { id: 'week', labelKey: 'networking.filters.pastWeek' },
  { id: 'three-days', labelKey: 'networking.filters.past3Days' },
  { id: 'day', labelKey: 'networking.filters.pastDay' },
]

const pageSizeOptions = [
  { id: '20', labelKey: 'networking.filters.listings20' },
  { id: '50', labelKey: 'networking.filters.listings50' },
  { id: '100', labelKey: 'networking.filters.listings100' },
]

export default function NetworkingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  // Hero section state
  const [isHeroExpanded, setIsHeroExpanded] = useState(false)
  
  // Основной таб: companies | freelance
  const [mainTab, setMainTab] = useState<'companies' | 'freelance'>('companies')
  
  // Подтаб фриланса: requests | offers
  const [freelanceTab, setFreelanceTab] = useState<'requests' | 'offers'>('requests')
  
  // Фильтры
  const [searchQuery, setSearchQuery] = useState('')
  const [keywordMode, setKeywordMode] = useState<'title' | 'description' | 'company'>('title')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'rating' | 'boosted'>('boosted')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showBoostedOnly, setShowBoostedOnly] = useState(false)
  
  // Фильтры для компаний
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([])
  const [experienceLevels, setExperienceLevels] = useState<string[]>([])
  const [selectedEducation, setSelectedEducation] = useState<string[]>([])
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([])
  const [selectedWorkingHours, setSelectedWorkingHours] = useState<string[]>([])
  const [eveningOrNightShifts, setEveningOrNightShifts] = useState(false)
  const [selectedWorkFormats, setSelectedWorkFormats] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [compensationMin, setCompensationMin] = useState<number>(0)
  const [compensationMax, setCompensationMax] = useState<number>(200)
  const [compensationPeriod, setCompensationPeriod] = useState<'all' | 'hourly' | 'monthly' | 'yearly' | 'project'>('all')
  const [compensationSpecifiedOnly, setCompensationSpecifiedOnly] = useState(false)
  const [selectedPaymentFrequencies, setSelectedPaymentFrequencies] = useState<string[]>([])
  const [selectedOtherFlags, setSelectedOtherFlags] = useState<string[]>([])
  const [timeframe, setTimeframe] = useState<string>('all')
  const [pageSize, setPageSize] = useState<string>('20')
  
  // Фильтры для фриланса
  const [budgetMin, setBudgetMin] = useState<number | undefined>()
  const [budgetMax, setBudgetMax] = useState<number | undefined>()
  const [availability, setAvailability] = useState<string[]>([])
  
  // Фильтрация данных
  const filteredCompanies = useMemo(() => {
    let results = [...mockCompanyJobs]
    
    if (searchQuery) {
      const targetField = keywordMode === 'title' ? 'title' : keywordMode === 'description' ? 'description' : 'companyName'
      results = results.filter(job => 
        job[targetField].toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (showBoostedOnly) {
      results = results.filter(job => job.boosted)
    }
    
    if (employmentTypes.length > 0) {
      results = results.filter(job => employmentTypes.includes(job.employmentType))
    }
    
    if (experienceLevels.length > 0) {
      results = results.filter(job => experienceLevels.includes(job.experienceLevel))
    }
    
    if (remoteOnly) {
      results = results.filter(job => job.location.remote)
    }
    
    if (selectedTags.length > 0) {
      results = results.filter(job => 
        selectedTags.some(tag => job.tags.includes(tag))
      )
    }
    
    if (compensationSpecifiedOnly) {
      results = results.filter(job => job.salary.min || job.salary.max)
    }
    
    // Сортировка
    results.sort((a, b) => {
      if (sortBy === 'boosted') {
        if (a.boosted && !b.boosted) return -1
        if (!a.boosted && b.boosted) return 1
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'rating') {
        return b.companyRating.average - a.companyRating.average
      }
      return 0
    })
    
    return results
  }, [mockCompanyJobs, searchQuery, keywordMode, showBoostedOnly, employmentTypes, experienceLevels, remoteOnly, selectedTags, compensationSpecifiedOnly, sortBy])
  
  const filteredClientRequests = useMemo(() => {
    let results = [...mockClientRequests]
    
    if (searchQuery) {
      results = results.filter(req => 
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (showBoostedOnly) {
      results = results.filter(req => req.boosted)
    }
    
    if (selectedTags.length > 0) {
      results = results.filter(req => 
        selectedTags.some(tag => req.tags.includes(tag))
      )
    }
    
    if (budgetMin !== undefined) {
      results = results.filter(req => {
        const min = req.budget.min ?? req.budget.max ?? 0
        return min >= budgetMin
      })
    }
    
    if (budgetMax !== undefined) {
      results = results.filter(req => {
        const max = req.budget.max ?? req.budget.min ?? Infinity
        return max <= budgetMax
      })
    }
    
    // Сортировка
    results.sort((a, b) => {
      if (sortBy === 'boosted') {
        if (a.boosted && !b.boosted) return -1
        if (!a.boosted && b.boosted) return 1
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'rating') {
        return b.clientRating.average - a.clientRating.average
      }
      return 0
    })
    
    return results
  }, [mockClientRequests, searchQuery, showBoostedOnly, selectedTags, budgetMin, budgetMax, sortBy])
  
  const filteredFreelancerOffers = useMemo(() => {
    let results = [...mockFreelancerOffers]
    
    if (searchQuery) {
      results = results.filter(offer => 
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.freelancerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (showBoostedOnly) {
      results = results.filter(offer => offer.boosted)
    }
    
    if (selectedTags.length > 0) {
      results = results.filter(offer => 
        selectedTags.some(tag => offer.skills.includes(tag))
      )
    }
    
    if (availability.length > 0) {
      results = results.filter(offer => availability.includes(offer.availability))
    }
    
    // Сортировка
    results.sort((a, b) => {
      if (sortBy === 'boosted') {
        if (a.boosted && !b.boosted) return -1
        if (!a.boosted && b.boosted) return 1
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'rating') {
        return b.freelancerRating.average - a.freelancerRating.average
      }
      return 0
    })
    
    return results
  }, [mockFreelancerOffers, searchQuery, showBoostedOnly, selectedTags, availability, sortBy])
  
  // Популярные теги
  const popularTags = useMemo(() => {
    const allTags = new Set<string>()
    mockCompanyJobs.forEach(job => job.tags.forEach(tag => allTags.add(tag)))
    mockClientRequests.forEach(req => req.tags.forEach(tag => allTags.add(tag)))
    mockFreelancerOffers.forEach(offer => offer.skills.forEach(skill => allTags.add(skill)))
    return Array.from(allTags).slice(0, 12)
  }, [])
  
  const toggleValue = <T,>(list: T[], setList: (value: T[]) => void, value: T) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }
  
  const handleClearFilters = () => {
    setSearchQuery('')
    setKeywordMode('title')
    setSelectedTags([])
    setShowBoostedOnly(false)
    setEmploymentTypes([])
    setExperienceLevels([])
    setSelectedEducation([])
    setSelectedSchedules([])
    setSelectedWorkingHours([])
    setEveningOrNightShifts(false)
    setSelectedWorkFormats([])
    setRemoteOnly(false)
    setCompensationMin(0)
    setCompensationMax(200)
    setCompensationPeriod('all')
    setCompensationSpecifiedOnly(false)
    setSelectedPaymentFrequencies([])
    setSelectedOtherFlags([])
    setTimeframe('all')
    setPageSize('20')
    setBudgetMin(undefined)
    setBudgetMax(undefined)
    setAvailability([])
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-8 pb-12 pt-6">
        {/* Hero Section */}
        <HeroSection
          isExpanded={isHeroExpanded}
          onToggle={() => setIsHeroExpanded(!isHeroExpanded)}
        />
        
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Briefcase}
            label={t('networking.stats.activeJobs')}
            value={mockCompanyJobs.filter(j => j.status === 'active').length}
            trend={t('networking.stats.trend.week')}
          />
          <StatCard
            icon={Users}
            label={t('networking.stats.freelancers')}
            value={mockFreelancerOffers.length}
            trend={t('networking.stats.trend.topRated')}
          />
          <StatCard
            icon={MessageSquare}
            label={t('networking.stats.clientRequests')}
            value={mockClientRequests.filter(r => r.status === 'open').length}
            trend={t('networking.stats.trend.newToday')}
          />
          <StatCard
            icon={Zap}
            label={t('networking.stats.boostedListings')}
            value={[...mockCompanyJobs, ...mockClientRequests, ...mockFreelancerOffers].filter((item: any) => item.boosted).length}
            trend={t('networking.stats.trend.premiumVisibility')}
          />
          </div>
        
        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                        placeholder={t('networking.search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
              <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
                {keywordModes.map((mode) => {
                  const isActive = keywordMode === mode.id
                  return (
                    <Button
                      key={mode.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('text-xs', isActive && 'shadow-sm')}
                      onClick={() => setKeywordMode(mode.id)}
                    >
                            {t(mode.labelKey)}
                    </Button>
                  )
                })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boosted">{t('networking.sort.boosted')}</SelectItem>
                        <SelectItem value="newest">{t('networking.sort.newest')}</SelectItem>
                        <SelectItem value="rating">{t('networking.sort.rating')}</SelectItem>
                        <SelectItem value="relevance">{t('networking.sort.relevance')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(showFilters && 'bg-muted')}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
              </div>
            </div>

                {/* Active Filters */}
                {(selectedTags.length > 0 || showBoostedOnly || employmentTypes.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t('networking.filters.label')}</span>
                    {showBoostedOnly && (
                      <Badge variant="secondary" className="gap-1">
                        <Zap className="h-3 w-3" />
                        {t('networking.filters.boostedOnly')}
                        <button onClick={() => setShowBoostedOnly(false)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {employmentTypes.map(type => (
                      <Badge key={type} variant="secondary" className="gap-1 capitalize">
                        {type}
                        <button onClick={() => setEmploymentTypes(prev => prev.filter(t => t !== type))}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 text-xs">
                      {t('networking.filters.clearAll')}
                    </Button>
                  </div>
                )}
                
                {/* Extended Filters */}
                {showFilters && mainTab === 'companies' && (
                  <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                    {/* Quick Filters */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('networking.filters.quickFilters')}</Label>
                      <div className="flex flex-wrap gap-2">
              <Button
                          variant={showBoostedOnly ? 'default' : 'outline'}
                size="sm"
                          onClick={() => setShowBoostedOnly(!showBoostedOnly)}
                className="gap-2"
              >
                          <Zap className="h-3 w-3" />
                          {t('networking.filters.boostedOnly')}
              </Button>
                        <Button
                          variant={remoteOnly ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRemoteOnly(!remoteOnly)}
                        >
                          {t('networking.filters.remoteOnly')}
                        </Button>
                        <Button
                          variant={compensationSpecifiedOnly ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCompensationSpecifiedOnly(!compensationSpecifiedOnly)}
                        >
                          {t('networking.filters.withSalary')}
              </Button>
            </div>
          </div>

                    <Separator />
                    
                    {/* Compensation */}
                    <Card className="border-border/60 bg-background/50">
                      <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{t('networking.filters.compensation')}</CardTitle>
                </CardHeader>
                      <CardContent className="space-y-4">
                  <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.salaryRange')}</Label>
                    <Slider
                            value={[compensationMin, compensationMax]}
                            onValueChange={(value) => {
                              setCompensationMin(value[0])
                              setCompensationMax(value[1])
                            }}
                      min={0}
                            max={300}
                            step={10}
                            className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t('networking.filters.from', { min: compensationMin })}</span>
                            <span>{t('networking.filters.to', { max: compensationMax })}</span>
                    </div>
                  </div>
                        
                  <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.paymentPeriod')}</Label>
                    <div className="flex flex-wrap gap-2">
                            {(['all', 'hourly', 'monthly', 'yearly', 'project'] as const).map(period => (
                          <Button
                            key={period}
                                variant={compensationPeriod === period ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCompensationPeriod(period)}
                                className="text-xs capitalize"
                          >
                            {period === 'all' ? t('networking.filters.any') : t(`networking.filters.${period}`)}
                          </Button>
                            ))}
                    </div>
                        </div>
                        
                    <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.paymentFrequency')}</Label>
                      <div className="flex flex-wrap gap-2">
                            {paymentFrequencies.map(freq => (
                          <Button
                                key={freq.id}
                                variant={selectedPaymentFrequencies.includes(freq.id) ? 'default' : 'outline'}
                            size="sm"
                                onClick={() => toggleValue(selectedPaymentFrequencies, setSelectedPaymentFrequencies, freq.id)}
                                className="text-xs"
                          >
                                {t(`networking.filters.${freq.id}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                      </CardContent>
                    </Card>
                    
                    <Separator />
                    
                    {/* Employment & Experience */}
                    <Card className="border-border/60 bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">{t('networking.filters.employmentExperience')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.employmentType')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {['full-time', 'part-time', 'contract', 'internship'].map(type => (
                    <Button
                                key={type}
                                variant={employmentTypes.includes(type) ? 'default' : 'outline'}
                      size="sm"
                                onClick={() => toggleValue(employmentTypes, setEmploymentTypes, type)}
                                className="text-xs capitalize"
                    >
                                {type.replace('-', ' ')}
                    </Button>
                            ))}
                  </div>
                        </div>

                  <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.experienceLevel')}</Label>
                    <div className="flex flex-wrap gap-2">
                            {['junior', 'middle', 'senior', 'lead'].map(level => (
                        <Button
                                key={level}
                                variant={experienceLevels.includes(level) ? 'default' : 'outline'}
                          size="sm"
                                onClick={() => toggleValue(experienceLevels, setExperienceLevels, level)}
                                className="text-xs capitalize"
                        >
                                {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                        
                  <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.education')}</Label>
                    <div className="flex flex-wrap gap-2">
                            {educationOptions.map(option => (
                        <Button
                          key={option.id}
                                variant={selectedEducation.includes(option.id) ? 'default' : 'outline'}
                          size="sm"
                                onClick={() => toggleValue(selectedEducation, setSelectedEducation, option.id)}
                                className="text-xs"
                        >
                          {t(option.labelKey)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

                    <Separator />
                    
                    {/* Working Model */}
                    <Card className="border-border/60 bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">{t('networking.filters.workingModel')}</CardTitle>
                </CardHeader>
                      <CardContent className="space-y-4">
                  <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.workFormat')}</Label>
                    <div className="flex flex-wrap gap-2">
                            {workFormats.map(format => (
                        <Button
                                key={format.id}
                                variant={selectedWorkFormats.includes(format.id) ? 'default' : 'outline'}
                          size="sm"
                                onClick={() => toggleValue(selectedWorkFormats, setSelectedWorkFormats, format.id)}
                                className="text-xs"
                        >
                                {t(format.labelKey)}
                        </Button>
                      ))}
                    </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.schedule')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {scheduleOptions.slice(0, 8).map(schedule => (
                    <Button
                                key={schedule}
                                variant={selectedSchedules.includes(schedule) ? 'default' : 'outline'}
                      size="sm"
                                onClick={() => toggleValue(selectedSchedules, setSelectedSchedules, schedule)}
                                className="text-xs"
                    >
                                {schedule}
                    </Button>
                            ))}
                  </div>
                        </div>
                        
                  <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.workingHours')}</Label>
                    <div className="flex flex-wrap gap-2">
                            {workingHourOptions.slice(0, 8).map(hours => (
                        <Button
                                key={hours}
                                variant={selectedWorkingHours.includes(hours) ? 'default' : 'outline'}
                          size="sm"
                                onClick={() => toggleValue(selectedWorkingHours, setSelectedWorkingHours, hours)}
                                className="text-xs"
                        >
                                {hours}
                        </Button>
                      ))}
                    </div>
                          <Button
                            variant={eveningOrNightShifts ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEveningOrNightShifts(!eveningOrNightShifts)}
                            className="text-xs"
                          >
                            {t('networking.filters.eveningNightShifts')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Separator />
                    
                    {/* Other Parameters */}
                    <Card className="border-border/60 bg-background/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">{t('networking.filters.otherParameters')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                          {otherFilters.map(filter => (
                            <Button
                              key={filter.id}
                              variant={selectedOtherFlags.includes(filter.id) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleValue(selectedOtherFlags, setSelectedOtherFlags, filter.id)}
                              className="text-xs"
                            >
                              {t(filter.labelKey)}
                            </Button>
                          ))}
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.timeframe')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {timeframeOptions.map(option => (
                        <Button
                          key={option.id}
                                variant={timeframe === option.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTimeframe(option.id)}
                                className="text-xs"
                        >
                          {t(option.labelKey)}
                        </Button>
                      ))}
                    </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label className="text-xs">{t('networking.filters.resultsPerPage')}</Label>
                    <div className="flex flex-wrap gap-2">
                            {pageSizeOptions.map(option => (
                        <Button
                          key={option.id}
                                variant={pageSize === option.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPageSize(option.id)}
                                className="text-xs"
                        >
                          {t(option.labelKey)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
                
                {/* Freelance Filters */}
                {showFilters && mainTab === 'freelance' && (
                  <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('networking.filters.quickFilters')}</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={showBoostedOnly ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setShowBoostedOnly(!showBoostedOnly)}
                          className="gap-2"
                        >
                          <Zap className="h-3 w-3" />
                          {t('networking.filters.boostedOnly')}
                        </Button>
                      </div>
          </div>

                    {freelanceTab === 'offers' && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('networking.filters.availability')}</Label>
                          <div className="flex flex-wrap gap-2">
                            {['available', 'busy', 'unavailable'].map(status => (
                              <Button
                                key={status}
                                variant={availability.includes(status) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleValue(availability, setAvailability, status)}
                                className="capitalize"
                              >
                                {t(`networking.filters.${status}`)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('networking.filters.budgetRange')}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t('networking.filters.min')}</Label>
                          <Input
                            type="number"
                            placeholder={t('networking.filters.minBudget')}
                            value={budgetMin ?? ''}
                            onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : undefined)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t('networking.filters.max')}</Label>
                          <Input
                            type="number"
                            placeholder={t('networking.filters.maxBudget')}
                            value={budgetMax ?? ''}
                            onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : undefined)}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Tabs */}
            <Tabs value={mainTab} onValueChange={(value: any) => setMainTab(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="companies" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  {t('networking.tabs.companies')} ({filteredCompanies.length})
                </TabsTrigger>
                <TabsTrigger value="freelance" className="gap-2">
                  <Users className="h-4 w-4" />
                  {t('networking.tabs.freelance')} ({freelanceTab === 'requests' ? filteredClientRequests.length : filteredFreelancerOffers.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="companies" className="mt-6 space-y-4">
                {filteredCompanies.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-lg font-medium">{t('networking.noResults.companies')}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t('networking.noResults.companiesDescription')}
                      </p>
                      <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                        {t('networking.filters.clearAll')}
                  </Button>
                </CardContent>
              </Card>
                ) : (
                  filteredCompanies.map(job => (
                    <CompanyJobCard key={job.id} job={job} />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="freelance" className="mt-6 space-y-4">
                <Tabs value={freelanceTab} onValueChange={(value: any) => setFreelanceTab(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="requests">
                      {t('networking.tabs.requests')} ({filteredClientRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="offers">
                      {t('networking.tabs.offers')} ({filteredFreelancerOffers.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="requests" className="mt-6 space-y-4">
                    {filteredClientRequests.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
                          <p className="text-lg font-medium">{t('networking.noResults.clientRequests')}</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {t('networking.noResults.clientRequestsDescription')}
                          </p>
                          <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                            {t('networking.filters.clearAll')}
                    </Button>
                  </CardContent>
                </Card>
                    ) : (
                      filteredClientRequests.map(request => (
                        <ClientRequestCard key={request.id} request={request} />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="offers" className="mt-6 space-y-4">
                    {filteredFreelancerOffers.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                          <p className="text-lg font-medium">{t('networking.noResults.freelancerOffers')}</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {t('networking.noResults.freelancerOffersDescription')}
                          </p>
                          <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                            {t('networking.filters.clearAll')}
                          </Button>
            </CardContent>
          </Card>
                    ) : (
                      filteredFreelancerOffers.map(offer => (
                        <FreelancerOfferCard key={offer.id} offer={offer} />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Popular Tags */}
            <Card>
            <CardHeader>
                <CardTitle className="text-base">{t('networking.sidebar.popularSkills')}</CardTitle>
                <CardDescription className="text-xs">
                  {t('networking.sidebar.popularSkillsDescription')}
                </CardDescription>
            </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors hover:bg-primary/10"
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
            </CardContent>
          </Card>
            
            {/* Boost Info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-primary" />
                  {t('networking.sidebar.boostListing')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('networking.sidebar.boostDescription')}
                    </CardDescription>
                  </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{t('networking.sidebar.boostBenefits.top')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{t('networking.sidebar.boostBenefits.badge')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{t('networking.sidebar.boostBenefits.duration')}</span>
                  </li>
                </ul>
                <Button className="w-full gap-2">
                  <Zap className="h-4 w-4" />
                  {t('networking.sidebar.boostButton')}
                    </Button>
            </CardContent>
          </Card>

            {/* Help */}
            <Card>
            <CardHeader>
                <CardTitle className="text-base">{t('networking.sidebar.needHelp')}</CardTitle>
            </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  {t('networking.sidebar.howToPost')}
                  </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  {t('networking.sidebar.pricing')}
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  {t('networking.sidebar.safety')}
                </Button>
            </CardContent>
          </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}

// Component: Stat Card
function StatCard({ 
  icon: Icon, 
  label,
  value,
  trend 
}: {
  icon: any
  label: string
  value: number
  trend: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
      </div>
        <div className="flex-1">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xs text-primary">{trend}</p>
    </div>
      </CardContent>
    </Card>
  )
}

// Component: Company Job Card
function CompanyJobCard({ job }: { job: CompanyJobListing }) {
  const { t } = useTranslation()
  
  const formatSalary = () => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.salary.currency,
      maximumFractionDigits: 0,
    })
    
    if (job.salary.min && job.salary.max) {
      return t('networking.jobCard.range', { min: formatter.format(job.salary.min), max: formatter.format(job.salary.max) })
    }
    if (job.salary.min) {
      return t('networking.jobCard.from', { amount: formatter.format(job.salary.min) })
    }
    if (job.salary.max) {
      return t('networking.jobCard.upTo', { amount: formatter.format(job.salary.max) })
    }
    return t('networking.jobCard.competitiveSalary')
  }
  
  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      job.boosted && 'border-primary/50 bg-primary/5'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {job.companyLogo && (
              <img 
                src={job.companyLogo} 
                alt={job.companyName}
                className="h-12 w-12 rounded-lg border bg-background object-cover"
              />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                {job.companyVerified && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('networking.jobCard.verified')}
                  </Badge>
                )}
                {job.boosted && (
                  <Badge className="gap-1 bg-primary text-xs">
                    <Zap className="h-3 w-3 fill-current" />
                    {t('networking.jobCard.boosted')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{job.companyName}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span>{job.companyRating.average.toFixed(1)}</span>
                  <span className="text-xs">({job.companyRating.count})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatSalary()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {job.location.city ? `${job.location.city}, ${job.location.country}` : job.location.country}
              {job.location.remote && ' (Remote)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
          </div>
        </div>
        
      <div className="flex flex-wrap gap-2">
          {job.tags.slice(0, 5).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {job.tags.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{job.tags.length - 5} more
            </Badge>
          )}
      </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{job.viewsCount} {t('networking.jobCard.views')}</span>
    </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{job.applicationsCount} {t('networking.jobCard.applicants')}</span>
            </div>
          </div>
          <Button size="sm">{t('networking.jobCard.viewDetails')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Component: Client Request Card
function ClientRequestCard({ request }: { request: ClientRequest }) {
  const { t } = useTranslation()
  const formatBudget = () => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: request.budget.currency,
      maximumFractionDigits: 0,
    })
    
    if (request.budget.type === 'hourly') {
      if (request.budget.min && request.budget.max) {
        return `${formatter.format(request.budget.min)} - ${formatter.format(request.budget.max)}/hr`
      }
      return `${formatter.format(request.budget.min ?? request.budget.max ?? 0)}/hr`
    }
    
    if (request.budget.min && request.budget.max) {
      return `${formatter.format(request.budget.min)} - ${formatter.format(request.budget.max)}`
    }
    return formatter.format(request.budget.min ?? request.budget.max ?? 0)
  }

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      request.boosted && 'border-primary/50 bg-primary/5'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {request.clientAvatar && (
              <img 
                src={request.clientAvatar} 
                alt={request.clientName}
                className="h-10 w-10 rounded-full border bg-background"
              />
            )}
          <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{request.title}</CardTitle>
                {request.boosted && (
                  <Badge className="gap-1 bg-primary text-xs">
                    <Zap className="h-3 w-3 fill-current" />
                    {t('networking.requestCard.boosted')}
          </Badge>
                )}
        </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{request.clientName}</span>
          <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span>{request.clientRating.average.toFixed(1)}</span>
                  <span className="text-xs">({request.clientRating.count})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {request.description}
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">{formatBudget()}</span>
        </div>
          {request.duration && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{request.duration}</span>
          </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {request.category}
            </Badge>
          </div>
        
          <div className="flex flex-wrap gap-2">
          {request.tags.slice(0, 5).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
              </Badge>
            ))}
          {request.tags.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{request.tags.length - 5} more
            </Badge>
          )}
          </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{request.viewsCount} {t('networking.requestCard.views')}</span>
        </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{request.proposalsCount} {t('networking.requestCard.proposals')}</span>
        </div>
          </div>
          <Button size="sm">{t('networking.requestCard.submitProposal')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Component: Freelancer Offer Card
function FreelancerOfferCard({ offer }: { offer: FreelancerOffer }) {
  const { t } = useTranslation()
  
  const formatPricing = () => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: offer.pricing.currency,
      maximumFractionDigits: 0,
    })
    
    if (offer.pricing.hourlyRate) {
      return `${formatter.format(offer.pricing.hourlyRate)}/hr`
    }
    
    if (offer.pricing.projectRate) {
      return `${formatter.format(offer.pricing.projectRate.min)} - ${formatter.format(offer.pricing.projectRate.max)}/project`
    }
    
    return t('networking.offerCard.contactForPricing')
  }
  
  const availabilityColors = {
    available: 'bg-green-500/10 text-green-700 dark:text-green-400',
    busy: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    unavailable: 'bg-red-500/10 text-red-700 dark:text-red-400',
  }
  
  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      offer.boosted && 'border-primary/50 bg-primary/5'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {offer.freelancerAvatar && (
              <img 
                src={offer.freelancerAvatar} 
                alt={offer.freelancerName}
                className="h-12 w-12 rounded-full border bg-background"
              />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{offer.freelancerName}</CardTitle>
                {offer.freelancerVerified && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('networking.offerCard.verified')}
                  </Badge>
                )}
                {offer.boosted && (
                  <Badge className="gap-1 bg-primary text-xs">
                    <Zap className="h-3 w-3 fill-current" />
                    {t('networking.offerCard.boosted')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span>{offer.freelancerRating.average.toFixed(1)}</span>
                  <span className="text-xs">({offer.freelancerRating.count})</span>
                </div>
                <span>•</span>
                <span>{offer.experience.projectsCompleted} {t('networking.offerCard.projects')}</span>
              </div>
            </div>
          </div>
          <Badge className={cn('capitalize', availabilityColors[offer.availability])}>
            {offer.availability}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">{offer.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {offer.description}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">{formatPricing()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t('networking.offerCard.responds', { time: offer.responseTime })}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {offer.skills.slice(0, 6).map(skill => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {offer.skills.length > 6 && (
            <Badge variant="outline" className="text-xs">
              +{offer.skills.length - 6} more
            </Badge>
          )}
        </div>
        
        {offer.portfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {offer.portfolio.slice(0, 3).map(item => (
              <div 
                key={item.id}
                className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
              >
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{offer.viewsCount} {t('networking.offerCard.views')}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{offer.contactsCount} {t('networking.offerCard.contacts')}</span>
            </div>
          </div>
          <Button size="sm">{t('networking.offerCard.viewProfile')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface HeroSectionProps {
  isExpanded: boolean
  onToggle: () => void
}

function HeroSection({ isExpanded, onToggle }: HeroSectionProps) {
  const { t } = useTranslation()
  
  return (
    <section
      className={cn(
        'rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm transition-all duration-300 overflow-hidden',
        isExpanded ? 'p-8 max-h-[1000px]' : 'px-8 py-3 max-h-14'
      )}
    >
      {isExpanded ? (
        <div className="mx-auto max-w-3xl space-y-4 text-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8 rounded-full"
            onClick={onToggle}
            aria-label={t('networking.hero.collapse')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs uppercase tracking-wider">
            <Briefcase className="mr-2 h-3 w-3" />
            {t('networking.hero.badge')}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" dangerouslySetInnerHTML={{ __html: t('networking.hero.title') }} />
          <p className="text-lg text-muted-foreground">
            {t('networking.hero.description')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('networking.hero.postOpportunity')}
            </Button>
            <Button size="lg" variant="outline">
              {t('networking.hero.browseListings')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full">
          <Briefcase className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-foreground">{t('networking.hero.collapsedTitle')}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full -mr-1 ml-auto"
            onClick={onToggle}
            aria-label={t('networking.hero.expand')}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </section>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { SiteHeader } from '@/components/SiteHeader'
import type { NetworkingOpportunity } from '@/data/mockSections'
import {
  networkingOpportunities,
  networkingHighlights,
  networkingSavedSearches,
  featuredCompanies,
  talentSignals,
  networkingEvents,
} from '@/data/mockSections'
import { cn } from '@/lib/utils'
import { SlidersHorizontal } from 'lucide-react'

const keywordModes = [
  { id: 'title', label: 'Title' },
  { id: 'description', label: 'Description' },
  { id: 'company', label: 'Company' },
] as const

type KeywordMode = (typeof keywordModes)[number]['id']

type PriceFilter = 'all' | 'monthly' | 'hourly' | 'project' | 'shift'

type PaymentFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'project'

const paymentFrequencies: Array<{ id: PaymentFrequency; label: string }> = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Twice a month' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'project', label: 'Per project' },
]

const educationOptions = [
  { id: 'none', label: 'Not required / unspecified' },
  { id: 'secondary-vocational', label: 'Secondary vocational' },
  { id: 'higher', label: 'Higher' },
] as const

const experienceOptions = [
  { id: 'any', label: 'Any experience' },
  { id: 'none', label: 'No experience' },
  { id: '1-3', label: '1-3 years' },
  { id: '3-6', label: '3-6 years' },
  { id: '6+', label: '6+ years' },
] as const

const employmentOptions = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'project', label: 'Project-based' },
  { id: 'shift', label: 'Shift work' },
  { id: 'contract', label: 'GPC/side contract' },
  { id: 'internship', label: 'Internship' },
] as const

const scheduleOptions = [
  '6/1',
  '5/2',
  '4/3',
  '4/2',
  '3/3',
  '3/2',
  '2/2',
  '2/1',
  '1/3',
  '1/2',
  'weekends',
  'flexible',
  'other',
  '4/4',
] as const

const workingHourOptions = [
  '2 hours',
  '3 hours',
  '4 hours',
  '5 hours',
  '6 hours',
  '7 hours',
  '8 hours',
  '9 hours',
  '10 hours',
  '11 hours',
  '12 hours',
  '24 hours',
  'Agreement',
  'Other',
] as const

const workFormats = [
  { id: 'onsite', label: "Employer's site" },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'travel', label: 'Travel-required' },
] as const

const otherFilters = [
  { id: 'withAddress', label: 'With address' },
  { id: 'accessible', label: 'Accessible' },
  { id: 'withoutAgencies', label: 'No staffing agencies' },
  { id: 'teenFriendly', label: 'Available for 14+' },
  { id: 'accreditedIt', label: 'Accredited IT company' },
  { id: 'lowResponses', label: '< 10 applications' },
] as const

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'updated-desc', label: 'Most recently updated' },
  { id: 'salary-desc', label: 'Salary: high to low' },
  { id: 'salary-asc', label: 'Salary: low to high' },
] as const

const timeframeOptions = [
  { id: 'all', label: 'All time' },
  { id: 'month', label: 'Past month' },
  { id: 'week', label: 'Past week' },
  { id: 'three-days', label: 'Past 3 days' },
  { id: 'day', label: 'Past day' },
] as const

const pageSizeOptions = [
  { id: '20', label: '20 listings' },
  { id: '50', label: '50 listings' },
  { id: '100', label: '100 listings' },
] as const

export default function NetworkingPage() {
  const navigate = useNavigate()
  const [keywordMode, setKeywordMode] = useState<KeywordMode>('title')
  const [keyword, setKeyword] = useState('')
  const [specializationCategory, setSpecializationCategory] = useState('all')
  const [specialization, setSpecialization] = useState('all')
  const [industry, setIndustry] = useState('all')
  const [country, setCountry] = useState('all')
  const [region, setRegion] = useState('all')
  const [district, setDistrict] = useState('all')
  const [compensationPeriod, setCompensationPeriod] = useState<PriceFilter>('all')
  const [compensationRange, setCompensationRange] = useState<[number, number]>([0, 120])
  const [compensationSpecifiedOnly, setCompensationSpecifiedOnly] = useState(false)
  const [selectedFrequencies, setSelectedFrequencies] = useState<PaymentFrequency[]>([])
  const [selectedEducation, setSelectedEducation] = useState<string[]>([])
  const [experience, setExperience] = useState<(typeof experienceOptions)[number]['id']>('any')
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([])
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([])
  const [selectedWorkingHours, setSelectedWorkingHours] = useState<string[]>([])
  const [eveningOrNightShifts, setEveningOrNightShifts] = useState(false)
  const [selectedWorkFormats, setSelectedWorkFormats] = useState<string[]>([])
  const [selectedOtherFlags, setSelectedOtherFlags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<string>('relevance')
  const [timeframe, setTimeframe] = useState<string>('all')
  const [pageSize, setPageSize] = useState<string>('20')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const specializationCategories = useMemo(() => {
    const items = new Set(networkingOpportunities.map((item) => item.company.specializationCategory))
    return ['all', ...Array.from(items)]
  }, [])

  const specializationOptions = useMemo(() => {
    const pool = specializationCategory === 'all'
      ? networkingOpportunities
      : networkingOpportunities.filter((item) => item.company.specializationCategory === specializationCategory)
    const items = new Set(pool.map((item) => item.company.specialization))
    return ['all', ...Array.from(items)]
  }, [specializationCategory])

  const industryOptions = useMemo(() => {
    const items = new Set(networkingOpportunities.map((item) => item.company.industry))
    return ['all', ...Array.from(items)]
  }, [])

  const countryOptions = useMemo(() => {
    const items = new Set(networkingOpportunities.map((item) => item.company.country))
    return ['all', ...Array.from(items)]
  }, [])

  const regionOptions = useMemo(() => {
    const pool = country === 'all' ? networkingOpportunities : networkingOpportunities.filter((item) => item.company.country === country)
    const items = new Set(pool.map((item) => item.company.region))
    return ['all', ...Array.from(items)]
  }, [country])

  const districtOptions = useMemo(() => {
    const pool = networkingOpportunities.filter((item) => {
      if (country !== 'all' && item.company.country !== country) return false
      if (region !== 'all' && item.company.region !== region) return false
      return Boolean(item.company.district)
    })
    const items = new Set(pool.map((item) => item.company.district).filter(Boolean) as string[])
    return ['all', ...Array.from(items)]
  }, [country, region])

  const toggleValue = <T,>(list: T[], setList: (value: T[]) => void, value: T) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  const filteredOpportunities = useMemo(() => {
    const [minSlider, maxSlider] = compensationRange
    const minCompensation = minSlider * 1000
    const maxCompensation = maxSlider * 1000
    const timeframeDays: Record<string, number> = {
      all: Infinity,
      month: 30,
      week: 7,
      'three-days': 3,
      day: 1,
    }
    const now = Date.now()

    const matches = networkingOpportunities.filter((item) => {
      if (keyword) {
        const targetField =
          keywordMode === 'title'
            ? item.title
            : keywordMode === 'description'
            ? item.summary
            : item.company.name
        if (!targetField.toLowerCase().includes(keyword.toLowerCase())) return false
      }

      if (specializationCategory !== 'all' && item.company.specializationCategory !== specializationCategory) {
        return false
      }

      if (specialization !== 'all' && item.company.specialization !== specialization) {
        return false
      }

      if (industry !== 'all' && item.company.industry !== industry) {
        return false
      }

      if (country !== 'all' && item.company.country !== country) {
        return false
      }

      if (region !== 'all' && item.company.region !== region) {
        return false
      }

      if (district !== 'all' && item.company.district !== district) {
        return false
      }

      if (compensationSpecifiedOnly && !item.compensation.specified) {
        return false
      }

      if (compensationPeriod !== 'all' && item.compensation.period !== compensationPeriod) {
        return false
      }

      if (selectedFrequencies.length > 0 && !selectedFrequencies.includes(item.compensation.frequency)) {
        return false
      }

      if (item.compensation.specified) {
        const min = item.compensation.min ?? item.compensation.max ?? 0
        const max = item.compensation.max ?? item.compensation.min ?? min
        if (max < minCompensation || min > maxCompensation) {
          return false
        }
      }

      if (selectedEducation.length > 0 && !selectedEducation.includes(item.educationRequirement)) {
        return false
      }

      if (experience !== 'any' && item.experienceLevel !== experience) {
        return false
      }

      if (selectedEmploymentTypes.length > 0 && !selectedEmploymentTypes.some((type) => item.employmentTypes.includes(type as any))) {
        return false
      }

      if (selectedSchedules.length > 0 && !selectedSchedules.includes(item.schedule)) {
        return false
      }

      if (selectedWorkingHours.length > 0 && !selectedWorkingHours.includes(item.workingHours.hoursPerDay)) {
        return false
      }

      if (eveningOrNightShifts && !item.workingHours.eveningOrNight) {
        return false
      }

      if (selectedWorkFormats.length > 0 && !selectedWorkFormats.includes(item.workFormat)) {
        return false
      }

      if (selectedOtherFlags.length > 0 && !selectedOtherFlags.every((flag) => item.otherFlags.includes(flag as any))) {
        return false
      }

      if (timeframe !== 'all') {
        const daysLimit = timeframeDays[timeframe]
        const diffDays = (now - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays > daysLimit) {
          return false
        }
      }

      return item.status === 'open'
    })

    const sorted = [...matches].sort((a, b) => {
      switch (sortOrder) {
        case 'updated-desc':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case 'salary-desc': {
          const maxA = a.compensation.max ?? a.compensation.min ?? 0
          const maxB = b.compensation.max ?? b.compensation.min ?? 0
          return maxB - maxA
        }
        case 'salary-asc': {
          const minA = a.compensation.min ?? a.compensation.max ?? 0
          const minB = b.compensation.min ?? b.compensation.max ?? 0
          return minA - minB
        }
        default:
          return 0
      }
    })

    const limit = parseInt(pageSize, 10) || sorted.length
    return {
      total: sorted.length,
      results: sorted.slice(0, limit),
    }
  }, [
    keyword,
    keywordMode,
    specializationCategory,
    specialization,
    industry,
    country,
    region,
    district,
    compensationRange,
    compensationPeriod,
    compensationSpecifiedOnly,
    selectedFrequencies,
    selectedEducation,
    experience,
    selectedEmploymentTypes,
    selectedSchedules,
    selectedWorkingHours,
    eveningOrNightShifts,
    selectedWorkFormats,
    selectedOtherFlags,
    timeframe,
    sortOrder,
    pageSize,
  ])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container space-y-10 pb-12 pt-6">
        <section className="grid gap-6 rounded-2xl border border-border/60 bg-muted/20 p-6 shadow-sm lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
              Networking marketplace
            </Badge>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Match with collaborators, clients, and engineering mentors.
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Discover verified experts, design partners, and product teams looking for their next collaborator.
                Every listing is curated by the Aetheris guild to keep conversations focused, humane, and productive.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/create')} className="gap-2">
                Submit an opportunity
              </Button>
              <Button variant="outline" onClick={() => navigate('/developers')}>
                Browse maintainer toolkits
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {networkingHighlights.map((highlight) => (
              <Card key={highlight.id} className="border-border/60 bg-background shadow-sm">
                <CardHeader className="space-y-1">
                  <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                    {highlight.label}
                  </CardDescription>
                  <CardTitle className="flex items-baseline gap-2 text-2xl font-semibold">
                    {highlight.value}
                    {highlight.delta && <span className="text-xs font-medium text-emerald-500">{highlight.delta}</span>}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-border/60 bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search listings"
                className="max-w-lg"
              />
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
                      {mode.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showAdvancedFilters ? 'Hide advanced filters' : 'Show advanced filters'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setKeyword('')
                setKeywordMode('title')
                setSpecializationCategory('all')
                setSpecialization('all')
                setIndustry('all')
                setCountry('all')
                setRegion('all')
                setDistrict('all')
                setCompensationPeriod('all')
                setCompensationRange([0, 120])
                setCompensationSpecifiedOnly(false)
                setSelectedFrequencies([])
                setSelectedEducation([])
                setExperience('any')
                setSelectedEmploymentTypes([])
                setSelectedSchedules([])
                setSelectedWorkingHours([])
                setEveningOrNightShifts(false)
                setSelectedWorkFormats([])
                setSelectedOtherFlags([])
                setSortOrder('relevance')
                setTimeframe('all')
                setPageSize('20')
              }}>
                Reset all
              </Button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="grid gap-4">
              <Card className="border border-border/60 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Specialization & company</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <FilterGroup
                    label="Specialization category"
                    options={specializationCategories}
                    value={specializationCategory}
                    onChange={setSpecializationCategory}
                  />
                  <FilterGroup
                    label="Specialization"
                    options={specializationOptions}
                    value={specialization}
                    onChange={setSpecialization}
                  />
                  <FilterGroup label="Industry" options={industryOptions} value={industry} onChange={setIndustry} />
                  <FilterGroup label="Country" options={countryOptions} value={country} onChange={setCountry} />
                  <FilterGroup label="Region" options={regionOptions} value={region} onChange={setRegion} />
                  <FilterGroup label="District" options={districtOptions} value={district} onChange={setDistrict} />
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Compensation</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-[2fr_1fr]">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Range (in thousands)</p>
                    <Slider
                      value={compensationRange}
                      onValueChange={(value) => setCompensationRange(value as [number, number])}
                      min={0}
                      max={150}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>from {compensationRange[0]}k</span>
                      <span>to {compensationRange[1]}k</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment period</p>
                    <div className="flex flex-wrap gap-2">
                      {(['all', 'monthly', 'hourly', 'project', 'shift'] as PriceFilter[]).map((period) => {
                        const isActive = compensationPeriod === period
                        return (
                          <Button
                            key={period}
                            variant={isActive ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn('text-xs capitalize', isActive && 'shadow-sm')}
                            onClick={() => setCompensationPeriod(period)}
                          >
                            {period === 'all' ? 'Any' : period}
                          </Button>
                        )
                      })}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment frequency</p>
                      <div className="flex flex-wrap gap-2">
                        {paymentFrequencies.map((frequency) => (
                          <Button
                            key={frequency.id}
                            variant={selectedFrequencies.includes(frequency.id) ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn('text-xs', selectedFrequencies.includes(frequency.id) && 'shadow-sm')}
                            onClick={() => toggleValue(selectedFrequencies, setSelectedFrequencies, frequency.id)}
                          >
                            {frequency.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant={compensationSpecifiedOnly ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('text-xs', compensationSpecifiedOnly && 'shadow-sm')}
                      onClick={() => setCompensationSpecifiedOnly((prev) => !prev)}
                    >
                      Only with specified salary
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Profile & experience</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Education</p>
                    <div className="flex flex-wrap gap-2">
                      {educationOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={selectedEducation.includes(option.id) ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn('text-xs', selectedEducation.includes(option.id) && 'shadow-sm')}
                          onClick={() => toggleValue(selectedEducation, setSelectedEducation, option.id)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Experience</p>
                    <div className="flex flex-wrap gap-2">
                      {experienceOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={experience === option.id ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn('text-xs', experience === option.id && 'shadow-sm')}
                          onClick={() => setExperience(option.id)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Working model</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FilterToggleGroup
                    label="Employment type"
                    options={employmentOptions.map((option) => option.id)}
                    renderLabel={(id) => employmentOptions.find((item) => item.id === id)?.label ?? id}
                    values={selectedEmploymentTypes}
                    onToggle={(value) => toggleValue(selectedEmploymentTypes, setSelectedEmploymentTypes, value)}
                  />
                  <FilterToggleGroup
                    label="Schedule"
                    options={scheduleOptions as unknown as string[]}
                    values={selectedSchedules}
                    onToggle={(value) => toggleValue(selectedSchedules, setSelectedSchedules, value)}
                  />
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Working hours per day</p>
                    <div className="flex flex-wrap gap-2">
                      {workingHourOptions.map((option) => (
                        <Button
                          key={option}
                          variant={selectedWorkingHours.includes(option) ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn('text-xs', selectedWorkingHours.includes(option) && 'shadow-sm')}
                          onClick={() => toggleValue(selectedWorkingHours, setSelectedWorkingHours, option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant={eveningOrNightShifts ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('text-xs', eveningOrNightShifts && 'shadow-sm')}
                      onClick={() => setEveningOrNightShifts((prev) => !prev)}
                    >
                      Evening or night shifts
                    </Button>
                  </div>
                  <FilterToggleGroup
                    label="Work format"
                    options={workFormats.map((option) => option.id)}
                    renderLabel={(id) => workFormats.find((item) => item.id === id)?.label ?? id}
                    values={selectedWorkFormats}
                    onToggle={(value) => toggleValue(selectedWorkFormats, setSelectedWorkFormats, value)}
                  />
                  <FilterToggleGroup
                    label="Other parameters"
                    options={otherFilters.map((option) => option.id)}
                    renderLabel={(id) => otherFilters.find((item) => item.id === id)?.label ?? id}
                    values={selectedOtherFlags}
                    onToggle={(value) => toggleValue(selectedOtherFlags, setSelectedOtherFlags, value)}
                  />
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Sorting</p>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={sortOrder === option.id ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn('text-xs', sortOrder === option.id && 'shadow-sm')}
                          onClick={() => setSortOrder(option.id)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Timeframe</p>
                    <div className="flex flex-wrap gap-2">
                      {timeframeOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={timeframe === option.id ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn('text-xs', timeframe === option.id && 'shadow-sm')}
                          onClick={() => setTimeframe(option.id)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Results per page</p>
                    <div className="flex flex-wrap gap-2">
                      {pageSizeOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={pageSize === option.id ? 'secondary' : 'ghost'}
                          size="sm"
                          className={cn('text-xs', pageSize === option.id && 'shadow-sm')}
                          onClick={() => setPageSize(option.id)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Open opportunities</h2>
            <CardDescription>
              Showing {filteredOpportunities.results.length} of {filteredOpportunities.total} matches
            </CardDescription>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredOpportunities.results.map((item) => (
              <OpportunityCard key={item.id} {...item} />
            ))}
            {filteredOpportunities.results.length === 0 && (
              <Card className="border-dashed bg-muted/40">
                <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <span>No opportunities match the current filters.</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowAdvancedFilters(true)}>
                    Adjust filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Saved searches</CardTitle>
                <CardDescription>Set alerts and let opportunities find you.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Manage alerts
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {networkingSavedSearches.map((search) => (
                <Card key={search.id} className="border-border/50 bg-muted/30">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-sm font-semibold">{search.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {search.criteria.map((criterion) => (
                        <Badge key={criterion} variant="outline" className="rounded-md text-xs">
                          {criterion}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      Open search
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                      Set reminder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Upcoming sessions</CardTitle>
              <CardDescription>Join live or async events curated by the community.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {networkingEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold leading-tight">{event.title}</h4>
                    <Badge variant={event.format === 'live' ? 'secondary' : 'outline'} className="rounded-md text-xs">
                      {event.format === 'live' ? 'Live' : 'Async drop'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' · '}
                    {event.host}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Featured companies</CardTitle>
                <CardDescription>Studios and teams actively partnering with Aetheris members.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View hiring guide
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {featuredCompanies.map((company) => (
                <Card key={company.id} className="border border-border/50">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base font-semibold">{company.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {company.focus}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Badge variant="outline" className="rounded-md px-2">
                        {company.openings} openings
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {company.hiringFormats.map((format) => (
                          <Badge key={format} variant="secondary" className="rounded-md text-[10px] uppercase">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="px-2 text-xs" asChild>
                      <a href={`https://${company.contact}`} target="_blank" rel="noreferrer">
                        View open roles
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Talent signals</CardTitle>
              <CardDescription>High-signal members currently taking on new collaborations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {talentSignals.map((signal) => (
                <div key={signal.id} className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold leading-tight">{signal.name}</h4>
                      <p className="text-xs text-muted-foreground">{signal.role}</p>
                    </div>
                    <Badge variant="outline" className="rounded-md text-xs">
                      {signal.responseTime}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{signal.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {signal.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 px-2 text-xs">
                    Start intro
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option
          return (
            <Button
              key={option}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('text-xs', isActive && 'shadow-sm')}
              onClick={() => onChange(option)}
            >
              {option === 'all' ? 'Any' : option}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function FilterToggleGroup({
  label,
  options,
  values,
  onToggle,
  renderLabel,
}: {
  label: string
  options: string[]
  values: string[]
  onToggle: (value: string) => void
  renderLabel?: (value: string) => string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = values.includes(option)
          return (
            <Button
              key={option}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('text-xs', isActive && 'shadow-sm')}
              onClick={() => onToggle(option)}
            >
              {renderLabel ? renderLabel(option) : option}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function OpportunityCard({
  title,
  summary,
  tags,
  contact,
  availability,
  location,
  status,
  category,
  engagement,
  responseTime,
  budgetRange,
  company,
  compensation,
  educationRequirement,
  experienceLevel,
  employmentTypes,
  schedule,
  workingHours,
  workFormat,
  otherFlags,
  publishedAt,
}: NetworkingOpportunity) {
  const compensationLabel = () => {
    if (!compensation.specified) return 'Salary on request'
    const min = compensation.min ?? compensation.max
    const max = compensation.max ?? compensation.min
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: compensation.currency,
      maximumFractionDigits: 0,
    })
    if (min && max && min !== max) {
      return `${formatter.format(min)} – ${formatter.format(max)} · ${compensation.period}`
    }
    if (min)
      return `${formatter.format(min)} · ${compensation.period}`
    return `${formatter.format(max ?? 0)} · ${compensation.period}`
  }

  return (
    <Card className="flex h-full flex-col border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {company.name} · {location}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-md capitalize">
            {category}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{availability}</span>
          <span>•</span>
          <span className="capitalize">{engagement}</span>
          <span>•</span>
          <span className="capitalize">{workFormat}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">{summary}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-md">
              #{tag}
            </Badge>
          ))}
        </div>
        <Separator className="my-1" />
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{compensationLabel()}</span>
            {budgetRange && <span>{budgetRange}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md capitalize">
              Education: {educationRequirement.replace('-', ' ')}
            </Badge>
            <Badge variant="outline" className="rounded-md capitalize">
              Experience: {experienceLevel}
            </Badge>
            <Badge variant="outline" className="rounded-md capitalize">
              Schedule: {schedule}
            </Badge>
            <Badge variant="outline" className="rounded-md capitalize">
              Hours: {workingHours.hoursPerDay}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {employmentTypes.map((type) => (
              <Badge key={type} variant="secondary" className="rounded-md text-xs capitalize">
                {type}
              </Badge>
            ))}
          </div>
        </div>
        <Separator className="my-1" />
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{responseTime}</span>
          <span>•</span>
          <span>{formatRelativeTime(new Date(publishedAt))}</span>
          {otherFlags.includes('accreditedIt') && <Badge variant="outline">Accredited IT</Badge>}
          {otherFlags.includes('accessible') && <Badge variant="outline">Accessible</Badge>}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <Badge variant="outline" className="rounded-md text-xs capitalize">
            {status}
          </Badge>
          <Button variant="ghost" size="sm" className="px-2 text-xs" asChild>
            <a href={`mailto:${contact}`} aria-label={`Contact ${contact}`}>
              Request intro
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function formatRelativeTime(date: Date): string {
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (diffSeconds < 60) return 'moments ago'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute')
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour')
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return rtf.format(-diffDays, 'day')
  }

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) {
    return rtf.format(-diffWeeks, 'week')
  }

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) {
    return rtf.format(-diffMonths, 'month')
  }

  const diffYears = Math.floor(diffDays / 365)
  return rtf.format(-diffYears, 'year')
}


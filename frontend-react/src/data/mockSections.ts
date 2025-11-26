/**
 * ⚠️ ВРЕМЕННЫЕ МОК-ДАННЫЕ
 * Этот файл содержит временные мок-данные для разработки.
 * В будущем будет заменен на реальные API запросы к KeystoneJS backend.
 * TODO: Заменить на GraphQL запросы к backend
 * 
 * NOTE FOR FUTURE DEVELOPERS / AUTOMATIONS:
 *
 * This file contains temporary mock data for the Networking, Courses, and Developers sections.
 * When integrating with the real backend (KeystoneJS), follow these steps:
 *
 * 1. Create the necessary content types in Strapi (or your preferred CMS):
 *    - Networking opportunity (title, summary, tags, contact method, availability, location, status, compensation, meta flags).
 *    - Course (title, shortDescription, author, level, duration, price/free flag, isOfficial flag, skills, delivery format, rating, students).
 *    - Course bundle / learning path (goal, description, recommended courses, outcomes, focus area).
 *    - Course cohort (course reference, start/end dates, format, capacity, status).
 *    - Course skill tag (label, description, related courses) for personalized recommendations.
 *    - Course testimonial / learner story (name, role, quote, related course, outcome).
 *    - Course catalog section (category, description, ordered course list) and FAQ entries.
 *    - Developer resource/update (title, category, summary, link, publishedAt, author or maintainer, status, verification date).
 *    - Developer toolkit/template (title, description, CTA link, stack tags).
 *    - Developer roadmap milestone (title, targetDate, status, description, focus area).
 *    - Compatibility matrix entry (stack name, current version, recommended version, status, notes).
 *    - Code snippet / integration recipe (title, tags, language, code body, recommended usage).
 *    - Maintainer availability (office hours, host, format, booking link).
 *    - Contributor leaderboard entry (name, role, metrics) and support checklist items.
 *
 * 2. Replace the mock imports in the corresponding React pages with data fetched via your API layer.
 *    For example, add functions to `src/api` (e.g. `getNetworkingListings`, `getCourses`, `getCourseBundles`,
 *    `getCourseCohorts`, `getCourseTestimonials`, `getDeveloperResources`, `getDeveloperToolkit`, `getDeveloperRoadmap`)
 *    that call your backend, handle pagination/filters, and map the response to the interfaces defined below.
 *
 * 3. Once real data fetching is in place, remove or disable the exports in this file and adjust the pages to use the API hooks.
 *    You can keep the interfaces as shared types for client-side code.
 *
 * 4. Ensure loading/error states, skeletons, and optimistic updates are handled in the pages after replacing the mock data
 *    with asynchronous requests. Consider adding pagination / infinite scroll for the course catalog once the API is wired.
 *
 * 5. Delete this note after the migration is complete.
 */

export interface NetworkingOpportunity {
  id: string
  title: string
  summary: string
  tags: string[]
  contact: string
  availability: string
  location: string
  status: 'open' | 'closed' | 'draft'
  category: 'mentorship' | 'freelance' | 'hiring'
  engagement: 'remote' | 'hybrid' | 'onsite'
  responseTime: string
  budgetRange?: string
  company: {
    name: string
    specializationCategory: string
    specialization: string
    industry: string
    country: string
    region: string
    district?: string
    hasAddress: boolean
    accreditedItCompany?: boolean
  }
  compensation: {
    min?: number
    max?: number
    currency: 'USD' | 'EUR' | 'GBP'
    period: 'monthly' | 'hourly' | 'project' | 'shift'
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'project'
    specified: boolean
  }
  educationRequirement: 'none' | 'secondary-vocational' | 'higher'
  experienceLevel: 'any' | 'none' | '1-3' | '3-6' | '6+'
  employmentTypes: Array<
    | 'full-time'
    | 'part-time'
    | 'project'
    | 'shift'
    | 'contract'
    | 'internship'
  >
  schedule: '6/1' | '5/2' | '4/3' | '4/2' | '3/3' | '3/2' | '2/2' | '2/1' | '1/3' | '1/2' | 'weekends' | 'flexible' | 'other' | '4/4'
  workingHours: {
    label: string
    hoursPerDay: string
    eveningOrNight: boolean
  }
  workFormat: 'onsite' | 'remote' | 'hybrid' | 'travel'
  otherFlags: Array<
    | 'withAddress'
    | 'accessible'
    | 'withoutAgencies'
    | 'teenFriendly'
    | 'accreditedIt'
    | 'lowResponses'
  >
  publishedAt: string
}

export interface NetworkingHighlight {
  id: string
  label: string
  value: string
  delta?: string
}

export interface FeaturedCompany {
  id: string
  name: string
  focus: string
  openings: number
  contact: string
  hiringFormats: Array<'remote' | 'hybrid' | 'onsite'>
}

export interface NetworkingSavedSearch {
  id: string
  title: string
  criteria: string[]
}

export interface TalentSignal {
  id: string
  name: string
  role: string
  availability: string
  summary: string
  tags: string[]
  responseTime: string
}

export interface NetworkingEvent {
  id: string
  title: string
  date: string
  format: 'live' | 'async'
  host: string
  description: string
}

export interface CourseItem {
  id: string
  title: string
  shortDescription: string
  author: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  price: 'free' | 'paid'
  isOfficial: boolean
  format: 'async' | 'live' | 'hybrid'
  rating: number
  students: number
  skills: string[]
}

export interface CourseSkill {
  id: string
  label: string
  description: string
  courseIds: string[]
}

export interface CourseBundle {
  id: string
  title: string
  goal: string
  description: string
  bestFor: string
  duration: string
  focus: string
  courseIds: string[]
  outcomes: string[]
}

export interface CourseCohort {
  id: string
  courseId: string
  title: string
  startDate: string
  endDate: string
  format: 'live' | 'hybrid' | 'async'
  seats: number
  status: 'enrolling' | 'waitlist' | 'closed'
}

export interface CourseTestimonial {
  id: string
  name: string
  role: string
  quote: string
  courseId: string
  outcome: string
}

export interface CourseFaqEntry {
  id: string
  question: string
  answer: string
}

export interface CourseCatalogSection {
  id: string
  label: string
  description: string
  courseIds: string[]
}

export interface TrendingArticle {
  id: string
  title: string
  author: string
  summary: string
  rank: number
  publishedAt: string
  views: number
  reactions: number
  comments: number
  tags: string[]
}

export interface DeveloperResource {
  id: string
  title: string
  category: 'changelog' | 'open-source' | 'guideline' | 'tooling'
  summary: string
  link: string
  publishedAt: string
  maintainer: string
  status: 'stable' | 'beta' | 'deprecated'
  lastVerified: string
}

export interface CourseModuleHighlight {
  id: string
  title: string
  duration: string
  format: 'video' | 'article' | 'live'
}

export interface CourseTrack {
  id: string
  title: string
  description: string
  modules: CourseModuleHighlight[]
  mentor?: string
}

export interface DeveloperToolkit {
  id: string
  title: string
  description: string
  actionLabel: string
  href: string
}

export interface DeveloperCompatibilityEntry {
  id: string
  stack: string
  currentVersion: string
  recommendedVersion: string
  status: 'stable' | 'planned' | 'outdated'
  notes?: string
}

export interface DeveloperRoadmapItem {
  id: string
  title: string
  targetDate: string
  status: 'in-progress' | 'qa' | 'released' | 'planned'
  description: string
  focus: string
}

export interface DeveloperStarter {
  id: string
  title: string
  description: string
  command: string
  repoUrl: string
  tags: string[]
}

export interface DeveloperSnippetExample {
  id: string
  language: 'curl' | 'typescript' | 'bash' | 'graphql'
  code: string
  description?: string
}

export interface DeveloperSnippet {
  id: string
  title: string
  stack: string
  summary: string
  examples: DeveloperSnippetExample[]
}

export interface DeveloperOfficeHour {
  id: string
  mentor: string
  role: string
  topic: string
  date: string
  format: 'live' | 'async'
  slotsRemaining: number
  bookingLink: string
}

export interface DeveloperContributor {
  id: string
  name: string
  role: string
  commits: number
  issuesTriaged: number
  pullRequests: number
}

export interface DeveloperSupportChecklist {
  id: string
  title: string
  items: Array<{ id: string; label: string }>
}

export const networkingOpportunities: NetworkingOpportunity[] = [
  {
    id: 'net-1',
    title: 'Frontend mentor for early-stage SaaS',
    summary:
      'Looking for a React/TypeScript developer interested in mentoring a small SaaS team on component architecture and performance.',
    tags: ['React', 'Mentorship', 'UI Architecture'],
    contact: 'mentor@aetheris.dev',
    availability: '4-6 hours per week',
    location: 'Remote (UTC+1 to UTC+5 overlap)',
    status: 'open',
    category: 'mentorship',
    engagement: 'remote',
    responseTime: 'Replies within 24h',
    company: {
      name: 'Aetheris Studio',
      specializationCategory: 'Engineering mentor',
      specialization: 'Frontend architecture',
      industry: 'Software & Platforms',
      country: 'Estonia',
      region: 'Tallinn',
      hasAddress: true,
      accreditedItCompany: true,
    },
    compensation: {
      min: 1200,
      max: 1800,
      currency: 'EUR',
      period: 'monthly',
      frequency: 'biweekly',
      specified: true,
    },
    educationRequirement: 'higher',
    experienceLevel: '3-6',
    employmentTypes: ['part-time', 'contract'],
    schedule: 'flexible',
    workingHours: {
      label: '3 hours per day',
      hoursPerDay: '3 hours',
      eveningOrNight: false,
    },
    workFormat: 'remote',
    otherFlags: ['withAddress', 'accreditedIt', 'lowResponses'],
    publishedAt: '2025-02-14T10:30:00Z',
  },
  {
    id: 'net-2',
    title: 'Freelance mobile engineer (React Native)',
    summary:
      'HealthTech startup hiring a mid-level React Native engineer for a 3-month contract building patient-facing features.',
    tags: ['React Native', 'TypeScript', 'HealthTech'],
    contact: 'careers@healthspark.io',
    availability: 'Full-time contract, 3 months',
    location: 'Hybrid, Berlin or Remote EU',
    status: 'open',
    category: 'freelance',
    engagement: 'hybrid',
    responseTime: 'Replies within 48h',
    budgetRange: '€4.5-5k/month',
    company: {
      name: 'HealthSpark',
      specializationCategory: 'Product studio',
      specialization: 'Mobile engineering',
      industry: 'HealthTech',
      country: 'Germany',
      region: 'Berlin',
      district: 'Mitte',
      hasAddress: true,
    },
    compensation: {
      min: 4500,
      max: 5000,
      currency: 'EUR',
      period: 'monthly',
      frequency: 'monthly',
      specified: true,
    },
    educationRequirement: 'secondary-vocational',
    experienceLevel: '1-3',
    employmentTypes: ['full-time', 'contract'],
    schedule: '5/2',
    workingHours: {
      label: '8 hours per day',
      hoursPerDay: '8 hours',
      eveningOrNight: false,
    },
    workFormat: 'hybrid',
    otherFlags: ['withAddress', 'withoutAgencies'],
    publishedAt: '2025-02-09T08:00:00Z',
  },
  {
    id: 'net-3',
    title: 'Design partner program – backend/API specialists',
    summary:
      'Aetheris community initiative connecting API specialists with early adopters who need architecture reviews and secure integration advice.',
    tags: ['Node.js', 'Strapi', 'API Design'],
    contact: 'partners@aetheris.dev',
    availability: 'By project',
    location: 'Remote',
    status: 'open',
    category: 'hiring',
    engagement: 'remote',
    responseTime: 'Replies within 12h',
    company: {
      name: 'Aetheris Partnerships',
      specializationCategory: 'Strategic programs',
      specialization: 'API enablement',
      industry: 'Professional Services',
      country: 'Remote',
      region: 'Global',
      hasAddress: false,
      accreditedItCompany: true,
    },
    compensation: {
      min: 80,
      max: 110,
      currency: 'USD',
      period: 'hourly',
      frequency: 'weekly',
      specified: true,
    },
    educationRequirement: 'higher',
    experienceLevel: '6+',
    employmentTypes: ['project'],
    schedule: 'flexible',
    workingHours: {
      label: '4 hours per day',
      hoursPerDay: '4 hours',
      eveningOrNight: true,
    },
    workFormat: 'remote',
    otherFlags: ['accessible', 'accreditedIt'],
    publishedAt: '2025-02-18T14:20:00Z',
  },
  {
    id: 'net-4',
    title: 'Staff platform engineer (Design Systems)',
    summary:
      'We’re assembling a tiger team to launch a design system for a fintech marketplace. Looking for a staff-level engineer with experience scaling component libraries.',
    tags: ['Design Systems', 'Platform', 'Fintech'],
    contact: 'hiring@orbitalhq.com',
    availability: 'Full-time, 6 month contract-to-hire',
    location: 'Onsite · Lisbon',
    status: 'open',
    category: 'hiring',
    engagement: 'onsite',
    responseTime: 'Replies within 72h',
    budgetRange: '€85-95k/year',
    company: {
      name: 'Orbital HQ',
      specializationCategory: 'Platform engineering',
      specialization: 'Design systems',
      industry: 'FinTech',
      country: 'Portugal',
      region: 'Lisbon',
      district: 'Parque das Nações',
      hasAddress: true,
      accreditedItCompany: false,
    },
    compensation: {
      min: 85000,
      max: 95000,
      currency: 'EUR',
      period: 'monthly',
      frequency: 'monthly',
      specified: true,
    },
    educationRequirement: 'higher',
    experienceLevel: '6+',
    employmentTypes: ['full-time'],
    schedule: '5/2',
    workingHours: {
      label: '8 hours per day',
      hoursPerDay: '8 hours',
      eveningOrNight: false,
    },
    workFormat: 'onsite',
    otherFlags: ['withAddress', 'withoutAgencies'],
    publishedAt: '2025-01-28T09:45:00Z',
  },
]

export const networkingHighlights: NetworkingHighlight[] = [
  { id: 'highlight-1', label: 'Matches this month', value: '142', delta: '+18%' },
  { id: 'highlight-2', label: 'Verified mentors', value: '67', delta: '+5%' },
  { id: 'highlight-3', label: 'Avg. response time', value: '21h', delta: '-4h' },
]

export const networkingSavedSearches: NetworkingSavedSearch[] = [
  {
    id: 'saved-1',
    title: 'React mentors · Remote first',
    criteria: ['Mentorship', 'React', 'Remote'],
  },
  {
    id: 'saved-2',
    title: 'Freelance data viz specialists',
    criteria: ['Freelance', 'D3.js', '4-6 weeks'],
  },
  {
    id: 'saved-3',
    title: 'Platform engineers in EU',
    criteria: ['Hiring', 'Platform', 'Hybrid'],
  },
]

export const featuredCompanies: FeaturedCompany[] = [
  {
    id: 'company-1',
    name: 'Orbital HQ',
    focus: 'Fintech marketplace infrastructure',
    openings: 4,
    contact: 'orbitalhq.com/talent',
    hiringFormats: ['remote', 'onsite'],
  },
  {
    id: 'company-2',
    name: 'Northwind Collective',
    focus: 'Story-driven publishing & editorial tooling',
    openings: 2,
    contact: 'northwind.xyz/hiring',
    hiringFormats: ['remote', 'hybrid'],
  },
  {
    id: 'company-3',
    name: 'Atlas Labs',
    focus: 'AI-assisted course authoring platform',
    openings: 3,
    contact: 'atlaslabs.dev/careers',
    hiringFormats: ['remote'],
  },
]

export const talentSignals: TalentSignal[] = [
  {
    id: 'signal-1',
    name: 'Irene Castillo',
    role: 'Senior API Designer',
    availability: '2 projects open · replies < 6h',
    summary: 'Led Strapi migrations for 3 enterprises, now mentoring teams on resilient API contracts.',
    tags: ['Strapi', 'GraphQL', 'Mentorship'],
    responseTime: '6h',
  },
  {
    id: 'signal-2',
    name: 'Haruto Sato',
    role: 'Product Designer · Design Ops',
    availability: 'Open to part-time retainers',
    summary: 'Establishes design systems and async feedback loops for remote-first startups.',
    tags: ['Design Systems', 'Design Ops'],
    responseTime: '12h',
  },
  {
    id: 'signal-3',
    name: 'Maya Fernandez',
    role: 'Staff Platform Engineer',
    availability: 'Booking for Q3',
    summary: 'Specializes in multi-tenant Next.js platforms with granular access control.',
    tags: ['Next.js', 'Platform'],
    responseTime: '24h',
  },
]

export const networkingEvents: NetworkingEvent[] = [
  {
    id: 'event-1',
    title: 'Lightning portfolio reviews',
    date: '2025-03-05T16:00:00Z',
    format: 'live',
    host: 'Aetheris Guild Mentors',
    description: 'Get actionable feedback on your networking profile and positioning in 15 minutes.',
  },
  {
    id: 'event-2',
    title: 'Async hiring board drop',
    date: '2025-03-12T09:00:00Z',
    format: 'async',
    host: 'Aetheris Marketplace',
    description: 'Curated list of product teams hiring for Q2 launches. Limited slots for early responders.',
  },
]

export const featuredCourses: CourseItem[] = [
  {
    id: 'course-1',
    title: 'Building Composable UI with shadcn/ui',
    shortDescription:
      'Hands-on course from the Aetheris team covering component-driven design, theming, and accessibility best practices.',
    author: 'Aetheris Studio',
    level: 'intermediate',
    duration: '6 modules · 4h 30m',
    price: 'paid',
    isOfficial: true,
    format: 'hybrid',
    rating: 4.9,
    students: 1240,
    skills: ['ui-design', 'component-architecture', 'accessibility'],
  },
  {
    id: 'course-2',
    title: 'From Strapi Schema to Production API',
    shortDescription:
      'Community-led workshop teaching how to model content types, write custom controllers, and harden Strapi v5 deployments.',
    author: 'Elena Kovalenko',
    level: 'advanced',
    duration: '5 lessons · 3h',
    price: 'free',
    isOfficial: false,
    format: 'live',
    rating: 4.8,
    students: 860,
    skills: ['strapi', 'api-design', 'devops'],
  },
  {
    id: 'course-3',
    title: 'Networking for Makers: Finding Clients in 2025',
    shortDescription:
      'Playbook for indie developers to build authority, run lightweight discovery calls, and maintain a warm pipeline.',
    author: 'Ravi Nathan',
    level: 'beginner',
    duration: '8 lessons · 2h 15m',
    price: 'paid',
    isOfficial: false,
    format: 'async',
    rating: 4.7,
    students: 1920,
    skills: ['community-building', 'growth', 'sales'],
  },
  {
    id: 'course-4',
    title: 'Designing Course Analytics with Drizzle',
    shortDescription:
      'Learn how to collect, analyze, and visualize cohort health metrics using Drizzle ORM and shadcn/ui charts.',
    author: 'Atlas Labs',
    level: 'intermediate',
    duration: '7 lessons · 3h 45m',
    price: 'paid',
    isOfficial: true,
    format: 'hybrid',
    rating: 4.6,
    students: 540,
    skills: ['analytics', 'drizzle', 'data-visualization'],
  },
  {
    id: 'course-5',
    title: 'Async Mentoring Systems',
    shortDescription:
      'Architect asynchronous feedback loops, build rubric-driven reviews, and manage mentor workloads at scale.',
    author: 'Aetheris Mentorship Guild',
    level: 'advanced',
    duration: '4 modules · 2h 50m',
    price: 'free',
    isOfficial: true,
    format: 'async',
    rating: 4.5,
    students: 430,
    skills: ['mentorship', 'operations', 'automation'],
  },
  {
    id: 'course-6',
    title: 'Creator Monetisation Fundamentals',
    shortDescription:
      'Pricing frameworks, launch playbooks, and retention tactics tailored for Aetheris creators.',
    author: 'Northwind Collective',
    level: 'beginner',
    duration: '5 lessons · 2h',
    price: 'paid',
    isOfficial: false,
    format: 'async',
    rating: 4.4,
    students: 1120,
    skills: ['monetisation', 'pricing', 'marketing'],
  },
]

export const courseSkills: CourseSkill[] = [
  {
    id: 'ui-design',
    label: 'UI systems',
    description: 'Design scalable interfaces with reusable primitives and accessibility baked in.',
    courseIds: ['course-1', 'course-4'],
  },
  {
    id: 'component-architecture',
    label: 'Component architecture',
    description: 'Compose maintainable React apps with shared state and theming.',
    courseIds: ['course-1'],
  },
  {
    id: 'strapi',
    label: 'Strapi operations',
    description: 'Model content, ship secure APIs, and automate deployments.',
    courseIds: ['course-2'],
  },
  {
    id: 'analytics',
    label: 'Analytics & insights',
    description: 'Instrument dashboards, track success metrics, and iterate on courses.',
    courseIds: ['course-4'],
  },
  {
    id: 'mentorship',
    label: 'Mentorship systems',
    description: 'Structure 1:many mentorship, async reviews, and accountability.',
    courseIds: ['course-5'],
  },
  {
    id: 'monetisation',
    label: 'Creator monetisation',
    description: 'Pricing, packaging, and growth loops for course creators.',
    courseIds: ['course-3', 'course-6'],
  },
]

export const courseBundles: CourseBundle[] = [
  {
    id: 'bundle-1',
    title: 'Launch your interactive course',
    goal: 'Launch a polished course in six weeks',
    description: 'Combine UI foundations, content modeling, and analytics to deliver a cohort-ready experience.',
    bestFor: 'First-time course creators and indie studios',
    duration: '6 weeks · 4-6h/week',
    focus: 'Delivery & learner experience',
    courseIds: ['course-1', 'course-2', 'course-4'],
    outcomes: ['Design accessible UI kit', 'Ship Strapi-powered syllabus', 'Measure learner engagement'],
  },
  {
    id: 'bundle-2',
    title: 'Scale mentorship operations',
    goal: 'Build async mentorship programs with predictable quality',
    description: 'Automate reviews, coach mentors, and monetise office hours without burning out.',
    bestFor: 'Lead mentors, education ops managers',
    duration: '4 weeks · 3h/week',
    focus: 'Mentorship & operations',
    courseIds: ['course-5', 'course-2'],
    outcomes: ['Design mentor rubric', 'Automate feedback loops', 'Track mentor load'],
  },
  {
    id: 'bundle-3',
    title: 'Grow your creator business',
    goal: 'Attract students and monetise sustainably',
    description: 'Craft audience funnels, pricing strategies, and partner offerings tailored to Aetheris.',
    bestFor: 'Creators with 0-2 launches',
    duration: '5 weeks · 2-4h/week',
    focus: 'Growth & monetisation',
    courseIds: ['course-3', 'course-6'],
    outcomes: ['Define flagship offer', 'Build partner pipeline', 'Set conversion dashboards'],
  },
]

export const courseCohorts: CourseCohort[] = [
  {
    id: 'cohort-1',
    courseId: 'course-2',
    title: 'Strapi API Lab · March 2025',
    startDate: '2025-03-04T15:00:00Z',
    endDate: '2025-03-28T15:00:00Z',
    format: 'live',
    seats: 32,
    status: 'enrolling',
  },
  {
    id: 'cohort-2',
    courseId: 'course-1',
    title: 'shadcn/ui intensive · April 2025',
    startDate: '2025-04-11T17:00:00Z',
    endDate: '2025-05-09T17:00:00Z',
    format: 'hybrid',
    seats: 24,
    status: 'waitlist',
  },
  {
    id: 'cohort-3',
    courseId: 'course-5',
    title: 'Async mentoring bootcamp · May 2025',
    startDate: '2025-05-06T09:00:00Z',
    endDate: '2025-05-31T09:00:00Z',
    format: 'async',
    seats: 60,
    status: 'enrolling',
  },
]

export const courseTestimonials: CourseTestimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Sofia Malik',
    role: 'Founder, Loomer Labs',
    quote: 'We shipped our first course in 45 days and doubled conversion after adopting the Aetheris UI playbook.',
    courseId: 'course-1',
    outcome: '2x launch conversion',
  },
  {
    id: 'testimonial-2',
    name: 'Jonas Weber',
    role: 'Head of Engineering, Helios Academy',
    quote: 'The Strapi API workflow let us migrate legacy content without downtime and gave editors custom staging tools.',
    courseId: 'course-2',
    outcome: 'Migration in under 2 weeks',
  },
  {
    id: 'testimonial-3',
    name: 'Mira Chen',
    role: 'Mentorship Lead, Northwind Collective',
    quote: 'Async mentoring systems gave us transparent queues, calmer mentors, and happier learners.',
    courseId: 'course-5',
    outcome: 'Mentor response < 8h',
  },
]

export const courseFaq: CourseFaqEntry[] = [
  {
    id: 'faq-1',
    question: 'Как проходит обучение?',
    answer: 'Все курсы доступны в формате on-demand, а гибридные наборы дополняются лайв-сессиями и еженедельными office hours.',
  },
  {
    id: 'faq-2',
    question: 'Есть ли сертификаты?',
    answer: 'Официальные курсы Aetheris выдают цифровой бейдж и PDF-сертификат, когда вы сдаёте итоговой проект и получаете ревью.',
  },
  {
    id: 'faq-3',
    question: 'Можно ли возвратить деньги?',
    answer: 'Для платных курсов действует 14-дневный гарантийный период при условии, что пройдено не более 25% контента.',
  },
  {
    id: 'faq-4',
    question: 'Как стать ментором?',
    answer: 'Оставьте заявку в разделе «Become a mentor». Команда проверит вашу экспертизу и предложит пилотный поток.',
  },
]

export const courseCatalogSections: CourseCatalogSection[] = [
  {
    id: 'catalog-1',
    label: 'Design & UI systems',
    description: 'Всё для продвинутых интерфейсов, дизайн-систем и визуального языка.',
    courseIds: ['course-1', 'course-4'],
  },
  {
    id: 'catalog-2',
    label: 'Platform & API engineering',
    description: 'Превращайте Strapi и платформенные сервисы в устойчивые API.',
    courseIds: ['course-2', 'course-5'],
  },
  {
    id: 'catalog-3',
    label: 'Creator growth & monetisation',
    description: 'Стратегии роста аудиторий, партнёрств и устойчивого дохода.',
    courseIds: ['course-3', 'course-6'],
  },
]

export const trendingArticlesMock: TrendingArticle[] = [
  {
    id: 'trending-1',
    title: 'Designing resilient multi-tenant Strapi APIs',
    author: 'Elena Kovalenko',
    summary:
      'A walkthrough on structuring content types, migrations, and RBAC for multi-tenant platforms.',
    rank: 1,
    publishedAt: '2025-02-18T09:00:00Z',
    views: 1580,
    reactions: 214,
    comments: 42,
    tags: ['Strapi', 'Architecture'],
  },
  {
    id: 'trending-2',
    title: 'From soft launch to scale: forum growth playbook',
    author: 'Ravi Nathan',
    summary: 'Lessons learned when scaling Aetheris from 20 beta users to 20k monthly discussions.',
    rank: 2,
    publishedAt: '2025-02-16T10:30:00Z',
    views: 910,
    reactions: 167,
    comments: 27,
    tags: ['Community', 'Operations'],
  },
  {
    id: 'trending-3',
    title: 'Crafting async mentoring systems with guild guardrails',
    author: 'Mira Chen',
    summary: 'Build reliable review queues, keep mentors happy, and measure learner sentiment without burnout.',
    rank: 3,
    publishedAt: '2025-02-14T12:00:00Z',
    views: 720,
    reactions: 142,
    comments: 19,
    tags: ['Mentorship', 'DX'],
  },
  {
    id: 'trending-4',
    title: 'shadcn/ui layout recipes for cohesive course dashboards',
    author: 'Aetheris Studio',
    summary: 'Reusable layout primitives for analytics, content authoring, and live cohort dashboards.',
    rank: 4,
    publishedAt: '2025-02-12T08:20:00Z',
    views: 640,
    reactions: 121,
    comments: 23,
    tags: ['UI', 'Design systems'],
  },
  {
    id: 'trending-5',
    title: 'Async monetisation playbook for course creators',
    author: 'Northwind Collective',
    summary: 'Recurring revenue frameworks, partner bundles, and pricing experiments that actually stick.',
    rank: 5,
    publishedAt: '2025-02-10T15:45:00Z',
    views: 580,
    reactions: 109,
    comments: 18,
    tags: ['Monetisation', 'Growth'],
  },
]

/**
 * TRENDING ARTICLES MOCK NOTE
 *
 * When replacing `trendingArticlesMock` with live data:
 * - Create a Strapi collection type `trending-article` or derive from article metrics (views, reactions, recency).
 * - Expose an endpoint (e.g. `/api/articles/trending`) that returns ranked articles with the fields used below.
 * - Update `src/api/articles.ts` with a `getTrendingRanked` method and swap the page component to fetch data via TanStack Query.
 * - Remove the mock import from the trending page and handle loading/error skeletons.
 */

export const developerResources: DeveloperResource[] = [
  {
    id: 'dev-1',
    title: 'Changelog · Aetheris Platform v0.9.4',
    category: 'changelog',
    summary: 'New networking graph APIs, improved hydration performance, and audio article beta program.',
    link: '#',
    publishedAt: '2025-02-18T09:00:00Z',
    maintainer: 'Core Platform Team',
    status: 'stable',
    lastVerified: '2025-02-17',
  },
  {
    id: 'dev-2',
    title: 'Open-source kit: Strapi role presets for editorial teams',
    category: 'open-source',
    summary: 'Preconfigured Strapi roles & permissions pack to jump-start editorial workflows with role-based access.',
    link: '#',
    publishedAt: '2025-02-10T12:30:00Z',
    maintainer: 'Community Guild',
    status: 'beta',
    lastVerified: '2025-02-08',
  },
  {
    id: 'dev-3',
    title: 'Guidelines · Designing multi-tenant course catalogs',
    category: 'guideline',
    summary: 'Best practices for modeling course metadata, versioning, and user-generated modules.',
    link: '#',
    publishedAt: '2025-01-31T08:15:00Z',
    maintainer: 'Aetheris DX',
    status: 'stable',
    lastVerified: '2025-02-01',
  },
  {
    id: 'dev-4',
    title: 'Tooling update: CLI scaffolder for shadcn-based dashboards',
    category: 'tooling',
    summary: 'Generate production-ready dashboard shells with authentication, themes, and analytics.',
    link: '#',
    publishedAt: '2025-01-22T16:45:00Z',
    maintainer: 'DX Toolkit',
    status: 'deprecated',
    lastVerified: '2025-01-25',
  },
]

export interface ForumSpotlight {
  id: string
  title: string
  summary: string
  author: string
  tags: string[]
  reads: number
  replies: number
}

export const forumSpotlights: ForumSpotlight[] = [
  {
    id: 'forum-1',
    title: 'Designing resilient multi-tenant Strapi APIs',
    summary: 'A walkthrough on structuring content types, migrations, and RBAC for multi-tenant platforms.',
    author: 'Elena Kovalenko',
    tags: ['Strapi', 'Architecture'],
    reads: 1580,
    replies: 42,
  },
  {
    id: 'forum-2',
    title: 'From soft launch to scale: forum growth playbook',
    summary: 'Lessons learned when scaling Aetheris from 20 beta users to 20k monthly discussions.',
    author: 'Ravi Nathan',
    tags: ['Community', 'Operations'],
    reads: 910,
    replies: 27,
  },
]

export const courseTracks: CourseTrack[] = [
  {
    id: 'track-1',
    title: 'shadcn/ui Mastery Track',
    description: 'Component-driven system design with accessibility, theming, and DX tooling.',
    mentor: 'Aetheris Studio',
    modules: [
      { id: 'module-1', title: 'Composable primitives', duration: '35m', format: 'video' },
      { id: 'module-2', title: 'Design tokens & theming', duration: '18m', format: 'article' },
      { id: 'module-3', title: 'Live audit session', duration: '60m', format: 'live' },
    ],
  },
  {
    id: 'track-2',
    title: 'Strapi Publishing Pipeline',
    description: 'Ship editorial workflows with versioned content, multi-stage review, and caching.',
    mentor: 'DX Toolkit Squad',
    modules: [
      { id: 'module-4', title: 'Content modeling essentials', duration: '28m', format: 'video' },
      { id: 'module-5', title: 'Automating releases', duration: '24m', format: 'article' },
    ],
  },
]

export const developerToolkits: DeveloperToolkit[] = [
  {
    id: 'toolkit-1',
    title: 'CLI scaffolder for dashboards',
    description: 'Generate shadcn-ready dashboards with auth, theme toggles, and analytics.',
    actionLabel: 'View CLI docs',
    href: '#cli-docs',
  },
  {
    id: 'toolkit-2',
    title: 'API contract watchdog',
    description: 'Automated diffing and alerts for Strapi content type updates.',
    actionLabel: 'Explore on GitHub',
    href: '#watchdog',
  },
  {
    id: 'toolkit-3',
    title: 'Federated search starter',
    description: 'Drop-in integration to index forum, courses, and networking content in one search UI.',
    actionLabel: 'Install package',
    href: '#federated-search',
  },
]

export const developerCompatibilityMatrix: DeveloperCompatibilityEntry[] = [
  {
    id: 'compat-1',
    stack: 'Strapi',
    currentVersion: 'v5.1.0',
    recommendedVersion: 'v5.2.0',
    status: 'planned',
    notes: 'Upgrade scheduled after plugin regression tests complete.',
  },
  {
    id: 'compat-2',
    stack: 'React',
    currentVersion: '18.3.0',
    recommendedVersion: '18.3.0',
    status: 'stable',
    notes: 'Verified with concurrent rendering and Suspense boundaries.',
  },
  {
    id: 'compat-3',
    stack: 'Node.js',
    currentVersion: '20.10.0',
    recommendedVersion: '20.12.1',
    status: 'outdated',
    notes: 'Security patches pending for worker_threads race fix.',
  },
  {
    id: 'compat-4',
    stack: 'Aetheris CLI',
    currentVersion: '0.9.4',
    recommendedVersion: '0.10.0-rc1',
    status: 'planned',
    notes: 'Release candidate adds blue/green deployment hooks.',
  },
]

export const developerRoadmap: DeveloperRoadmapItem[] = [
  {
    id: 'roadmap-1',
    title: 'Federated search general availability',
    targetDate: '2025-03-15',
    status: 'in-progress',
    description: 'Ship unified indexing across forum, networking, and course content with zero-downtime reindexing.',
    focus: 'Search & discovery',
  },
  {
    id: 'roadmap-2',
    title: 'Async content review workflows',
    targetDate: '2025-04-02',
    status: 'qa',
    description: 'Add background review queues and Slack approvals for editorial teams.',
    focus: 'Editorial productivity',
  },
  {
    id: 'roadmap-3',
    title: 'Observability starter pack',
    targetDate: '2025-05-10',
    status: 'planned',
    description: 'Bundle Grafana dashboards, alert rules, and log shipping presets for Aetheris stacks.',
    focus: 'Reliability',
  },
  {
    id: 'roadmap-4',
    title: 'Distributor-ready course marketplace',
    targetDate: '2025-02-01',
    status: 'released',
    description: 'Launch marketplace tooling with rev share reporting and coupon management.',
    focus: 'Monetisation',
  },
]

export const developerStarters: DeveloperStarter[] = [
  {
    id: 'starter-1',
    title: 'Course marketplace starter',
    description: 'Next.js project with Strapi course schemas, shadcn/ui layouts, and payments wiring.',
    command: 'pnpm dlx create-aetheris-app@latest --template courses-marketplace',
    repoUrl: 'https://github.com/aetheris/starter-courses',
    tags: ['Next.js', 'Strapi', 'Payments'],
  },
  {
    id: 'starter-2',
    title: 'Developer docs portal',
    description: 'Contentlayer-powered docs with versioning, API playground, and search baked in.',
    command: 'pnpm dlx create-aetheris-app@latest --template docs',
    repoUrl: 'https://github.com/aetheris/starter-docs',
    tags: ['Docs', 'Contentlayer', 'Search'],
  },
  {
    id: 'starter-3',
    title: 'Community analytics dashboard',
    description: 'Preset analytics widgets, retention segments, and metric annotations with Drizzle + shadcn charts.',
    command: 'pnpm dlx create-aetheris-app@latest --template community-analytics',
    repoUrl: 'https://github.com/aetheris/starter-analytics',
    tags: ['Analytics', 'Drizzle', 'shadcn charts'],
  },
]

export const developerSnippets: DeveloperSnippet[] = [
  {
    id: 'snippet-1',
    title: 'Publish article with preview image',
    stack: 'REST',
    summary: 'Upload media to Strapi, crop with react-easy-crop, then publish the article with relations.',
    examples: [
      {
        id: 'snippet-1-curl',
        language: 'curl',
        description: 'Upload image and create entry',
        code: `curl -X POST "$STRAPI_URL/api/upload" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "files=@hero.jpg" \\
  -F "ref=api::article.article"`,
      },
      {
        id: 'snippet-1-ts',
        language: 'typescript',
        description: 'Publish article via Axios client',
        code: `await api.post('/articles', {
  data: {
    title,
    slug,
    preview: uploadedImageId,
    status: 'published',
  },
})`,
      },
    ],
  },
  {
    id: 'snippet-2',
    title: 'Invalidate networking listings',
    stack: 'React Query',
    summary: 'Trigger TanStack Query cache updates after editing a listing.',
    examples: [
      {
        id: 'snippet-2-ts',
        language: 'typescript',
        code: `const queryClient = useQueryClient()
await mutation.mutateAsync(payload)
queryClient.invalidateQueries({ queryKey: ['networking', 'listings'] })`,
      },
    ],
  },
]

export const developerOfficeHours: DeveloperOfficeHour[] = [
  {
    id: 'office-1',
    mentor: 'Elena Kovalenko',
    role: 'Platform Architect',
    topic: 'Scaling Strapi multi-tenancy',
    date: '2025-03-08T17:00:00Z',
    format: 'live',
    slotsRemaining: 6,
    bookingLink: '#office-elena',
  },
  {
    id: 'office-2',
    mentor: 'Ravi Nathan',
    role: 'Indie Product Engineer',
    topic: 'Async course distribution workflows',
    date: '2025-03-12T09:00:00Z',
    format: 'async',
    slotsRemaining: 12,
    bookingLink: '#office-ravi',
  },
  {
    id: 'office-3',
    mentor: 'Maya Fernandez',
    role: 'Staff Platform Engineer',
    topic: 'Feature flag rollouts and guardrails',
    date: '2025-03-15T14:30:00Z',
    format: 'live',
    slotsRemaining: 4,
    bookingLink: '#office-maya',
  },
]

export const developerContributors: DeveloperContributor[] = [
  {
    id: 'contrib-1',
    name: 'Irene Castillo',
    role: 'API Designer',
    commits: 42,
    issuesTriaged: 18,
    pullRequests: 11,
  },
  {
    id: 'contrib-2',
    name: 'Haruto Sato',
    role: 'Design Ops',
    commits: 17,
    issuesTriaged: 29,
    pullRequests: 7,
  },
  {
    id: 'contrib-3',
    name: 'Maya Fernandez',
    role: 'Platform Engineer',
    commits: 54,
    issuesTriaged: 12,
    pullRequests: 19,
  },
]

export const developerSupportChecklists: DeveloperSupportChecklist[] = [
  {
    id: 'support-1',
    title: 'Pre-deploy checklist',
    items: [
      { id: 'item-1', label: 'Run pnpm lint && pnpm test' },
      { id: 'item-2', label: 'Verify Strapi migrations in staging' },
      { id: 'item-3', label: 'Update observability dashboards' },
    ],
  },
  {
    id: 'support-2',
    title: 'Incident response quick links',
    items: [
      { id: 'item-4', label: 'Open PagerDuty template' },
      { id: 'item-5', label: 'Share rollback playbook' },
      { id: 'item-6', label: 'Notify community status page' },
    ],
  },
]

// ==================== STARTUPS & DEVELOPMENT JOURNAL ====================

export interface Startup {
  id: string
  name: string
  tagline: string
  description: string
  logo: string
  coverImage?: string
  category: 'saas' | 'mobile-app' | 'web-app' | 'ai-ml' | 'blockchain' | 'hardware' | 'other'
  stage: 'idea' | 'mvp' | 'beta' | 'launched' | 'scaling'
  foundedDate: string
  team: {
    size: number
    members: Array<{
      id: string
      name: string
      role: string
      avatar?: string
    }>
  }
  stats: {
    followers: number
    totalDonations: number
    updates: number
    investors: number
  }
  links: {
    website?: string
    github?: string
    twitter?: string
    discord?: string
  }
  tags: string[]
  isVerified: boolean
  isFeatured: boolean
}

export interface DevelopmentJournalEntry {
  id: string
  startupId: string
  startup: {
    name: string
    logo: string
  }
  title: string
  content: string
  excerpt: string
  type: 'update' | 'milestone' | 'roadmap' | 'review'
  publishedAt: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  stats: {
    views: number
    reactions: number
    comments: number
  }
  tags: string[]
  previewImage?: string
}

export interface StartupInvestor {
  id: string
  userId: string
  username: string
  avatar?: string
  amount: number
  date: string
  isAnonymous: boolean
}

export interface DevelopmentTool {
  id: string
  name: string
  description: string
  category: 'promotion' | 'analytics' | 'integration' | 'monetization'
  icon: string
  price: {
    type: 'free' | 'paid' | 'freemium'
    amount?: number
    period?: 'month' | 'year' | 'one-time'
  }
  features: string[]
  isPopular: boolean
  usedBy: number
}

export const startups: Startup[] = [
  {
    id: 'startup-1',
    name: 'CodeFlow AI',
    tagline: 'AI-powered code review assistant',
    description: 'Автоматизированный помощник для ревью кода, использующий машинное обучение для выявления потенциальных проблем и предложения улучшений.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=codeflow',
    coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%231e293b" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="32" fill="%2394a3b8"%3ECodeFlow AI%3C/text%3E%3C/svg%3E',
    category: 'ai-ml',
    stage: 'beta',
    foundedDate: '2024-06-15',
    team: {
      size: 5,
      members: [
        { id: 'member-1', name: 'Alex Chen', role: 'CEO & Founder', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
        { id: 'member-2', name: 'Maria Rodriguez', role: 'CTO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria' },
        { id: 'member-3', name: 'Dmitry Ivanov', role: 'Lead ML Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dmitry' },
      ],
    },
    stats: {
      followers: 1247,
      totalDonations: 15000,
      updates: 23,
      investors: 42,
    },
    links: {
      website: 'https://codeflow.ai',
      github: 'https://github.com/codeflow-ai',
      twitter: 'https://twitter.com/codeflowai',
    },
    tags: ['AI', 'Code Review', 'DevTools', 'Machine Learning'],
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'startup-2',
    name: 'TaskMaster Pro',
    tagline: 'Next-gen project management for remote teams',
    description: 'Современная система управления проектами с акцентом на удаленную работу, интеграцией с популярными инструментами и продвинутой аналитикой.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=taskmaster',
    coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%231e293b" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="32" fill="%2394a3b8"%3ETaskMaster Pro%3C/text%3E%3C/svg%3E',
    category: 'saas',
    stage: 'launched',
    foundedDate: '2023-11-20',
    team: {
      size: 8,
      members: [
        { id: 'member-4', name: 'Sarah Johnson', role: 'Founder & CEO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
        { id: 'member-5', name: 'James Park', role: 'Head of Product', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james' },
      ],
    },
    stats: {
      followers: 3421,
      totalDonations: 45000,
      updates: 67,
      investors: 128,
    },
    links: {
      website: 'https://taskmasterpro.com',
      github: 'https://github.com/taskmaster-pro',
      twitter: 'https://twitter.com/taskmasterpro',
      discord: 'https://discord.gg/taskmaster',
    },
    tags: ['SaaS', 'Project Management', 'Remote Work', 'Productivity'],
    isVerified: true,
    isFeatured: true,
  },
  {
    id: 'startup-3',
    name: 'HealthTrack',
    tagline: 'Personal health monitoring made simple',
    description: 'Мобильное приложение для отслеживания здоровья с интеграцией носимых устройств и персонализированными рекомендациями.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=healthtrack',
    category: 'mobile-app',
    stage: 'mvp',
    foundedDate: '2024-09-10',
    team: {
      size: 3,
      members: [
        { id: 'member-6', name: 'Dr. Emily Watson', role: 'Founder', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily' },
      ],
    },
    stats: {
      followers: 892,
      totalDonations: 8500,
      updates: 15,
      investors: 23,
    },
    links: {
      website: 'https://healthtrack.app',
      github: 'https://github.com/healthtrack',
    },
    tags: ['Health', 'Mobile', 'Wearables', 'Wellness'],
    isVerified: false,
    isFeatured: false,
  },
  {
    id: 'startup-4',
    name: 'EcoChain',
    tagline: 'Blockchain for sustainable supply chains',
    description: 'Блокчейн-платформа для отслеживания и верификации устойчивых цепочек поставок с прозрачностью для потребителей.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ecochain',
    coverImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%231e293b" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="32" fill="%2394a3b8"%3EEcoChain%3C/text%3E%3C/svg%3E',
    category: 'blockchain',
    stage: 'beta',
    foundedDate: '2024-03-05',
    team: {
      size: 6,
      members: [
        { id: 'member-7', name: 'Michael Green', role: 'CEO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael' },
        { id: 'member-8', name: 'Lisa Chen', role: 'Blockchain Lead', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa' },
      ],
    },
    stats: {
      followers: 2156,
      totalDonations: 32000,
      updates: 41,
      investors: 87,
    },
    links: {
      website: 'https://ecochain.io',
      github: 'https://github.com/ecochain',
      twitter: 'https://twitter.com/ecochain',
    },
    tags: ['Blockchain', 'Sustainability', 'Supply Chain', 'Web3'],
    isVerified: true,
    isFeatured: false,
  },
]

export const developmentJournalEntries: DevelopmentJournalEntry[] = [
  {
    id: 'journal-1',
    startupId: 'startup-1',
    startup: {
      name: 'CodeFlow AI',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=codeflow',
    },
    title: 'Introducing AI-Powered Code Suggestions v2.0',
    content: '<p>Мы рады представить новую версию нашего AI-движка для предложений кода...</p>',
    excerpt: 'Новая версия AI-движка с улучшенной точностью на 40% и поддержкой 15 новых языков программирования.',
    type: 'update',
    publishedAt: '2025-02-15T10:00:00Z',
    author: {
      id: 'member-1',
      name: 'Alex Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    stats: {
      views: 3421,
      reactions: 287,
      comments: 45,
    },
    tags: ['AI', 'Release', 'Features'],
    previewImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="300"%3E%3Crect fill="%231e293b" width="600" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%2394a3b8"%3EAI Update%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'journal-2',
    startupId: 'startup-2',
    startup: {
      name: 'TaskMaster Pro',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=taskmaster',
    },
    title: 'Roadmap 2025: What\'s Coming Next',
    content: '<p>Наши планы на следующий год включают множество захватывающих функций...</p>',
    excerpt: 'Обзор планов развития на 2025 год: новые интеграции, мобильное приложение и AI-ассистент для планирования.',
    type: 'roadmap',
    publishedAt: '2025-02-10T14:30:00Z',
    author: {
      id: 'member-4',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
    stats: {
      views: 5678,
      reactions: 412,
      comments: 89,
    },
    tags: ['Roadmap', 'Planning', '2025'],
    previewImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="300"%3E%3Crect fill="%231e293b" width="600" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%2394a3b8"%3ERoadmap 2025%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'journal-3',
    startupId: 'startup-1',
    startup: {
      name: 'CodeFlow AI',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=codeflow',
    },
    title: 'Milestone: 10,000 Active Users!',
    content: '<p>Мы достигли невероятной вехи - 10,000 активных пользователей...</p>',
    excerpt: 'Празднуем достижение 10,000 активных пользователей и делимся статистикой роста.',
    type: 'milestone',
    publishedAt: '2025-02-05T09:00:00Z',
    author: {
      id: 'member-2',
      name: 'Maria Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    },
    stats: {
      views: 4532,
      reactions: 567,
      comments: 123,
    },
    tags: ['Milestone', 'Growth', 'Community'],
  },
  {
    id: 'journal-4',
    startupId: 'startup-4',
    startup: {
      name: 'EcoChain',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=ecochain',
    },
    title: 'Beta Launch: Supply Chain Transparency Platform',
    content: '<p>Сегодня мы запускаем бета-версию нашей платформы для прозрачности цепочек поставок...</p>',
    excerpt: 'Открытая бета нашей блокчейн-платформы для отслеживания устойчивых цепочек поставок.',
    type: 'update',
    publishedAt: '2025-02-01T12:00:00Z',
    author: {
      id: 'member-7',
      name: 'Michael Green',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    },
    stats: {
      views: 2891,
      reactions: 234,
      comments: 56,
    },
    tags: ['Beta', 'Launch', 'Blockchain'],
    previewImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="300"%3E%3Crect fill="%231e293b" width="600" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="%2394a3b8"%3EBeta Launch%3C/text%3E%3C/svg%3E',
  },
  {
    id: 'journal-5',
    startupId: 'startup-3',
    startup: {
      name: 'HealthTrack',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=healthtrack',
    },
    title: 'Development Update: January 2025',
    content: '<p>Обзор прогресса разработки за январь 2025...</p>',
    excerpt: 'Месячный отчет о разработке: новые функции, исправления багов и планы на февраль.',
    type: 'review',
    publishedAt: '2025-01-31T16:00:00Z',
    author: {
      id: 'member-6',
      name: 'Dr. Emily Watson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    },
    stats: {
      views: 1456,
      reactions: 98,
      comments: 23,
    },
    tags: ['Update', 'Development', 'Monthly'],
  },
]

export const developmentTools: DevelopmentTool[] = [
  {
    id: 'tool-1',
    name: 'Startup Boost',
    description: 'Продвижение вашего стартапа в топ на 7 дней с гарантированным охватом 10,000+ разработчиков',
    category: 'promotion',
    icon: 'TrendingUp',
    price: {
      type: 'paid',
      amount: 99,
      period: 'one-time',
    },
    features: [
      'Размещение в топе на главной странице',
      'Выделение в списке стартапов',
      'Упоминание в еженедельной рассылке',
      'Аналитика охвата',
    ],
    isPopular: true,
    usedBy: 127,
  },
  {
    id: 'tool-2',
    name: 'Advanced Analytics',
    description: 'Подробная аналитика посещаемости, вовлеченности и конверсии для вашего стартапа',
    category: 'analytics',
    icon: 'BarChart3',
    price: {
      type: 'freemium',
      amount: 29,
      period: 'month',
    },
    features: [
      'Детальная статистика просмотров',
      'Анализ источников трафика',
      'Отслеживание конверсии донатов',
      'Экспорт данных в CSV',
      'Сравнение с конкурентами',
    ],
    isPopular: true,
    usedBy: 89,
  },
  {
    id: 'tool-3',
    name: 'GitHub Integration',
    description: 'Автоматическая синхронизация активности GitHub с журналом разработки',
    category: 'integration',
    icon: 'GitBranch',
    price: {
      type: 'free',
    },
    features: [
      'Отображение активных веток',
      'Автоматические посты о коммитах',
      'Статистика контрибьюторов',
      'Интеграция с релизами',
    ],
    isPopular: false,
    usedBy: 234,
  },
  {
    id: 'tool-4',
    name: 'Investor Dashboard',
    description: 'Специальная панель для инвесторов с детальной информацией о прогрессе стартапа',
    category: 'monetization',
    icon: 'DollarSign',
    price: {
      type: 'paid',
      amount: 49,
      period: 'month',
    },
    features: [
      'Приватные обновления для инвесторов',
      'Финансовые метрики и прогнозы',
      'Ежемесячные отчеты',
      'Прямая связь с командой',
    ],
    isPopular: false,
    usedBy: 45,
  },
  {
    id: 'tool-5',
    name: 'Community Badge',
    description: 'Верификационный значок для проверенных стартапов',
    category: 'promotion',
    icon: 'BadgeCheck',
    price: {
      type: 'paid',
      amount: 199,
      period: 'year',
    },
    features: [
      'Значок верификации на странице',
      'Повышенное доверие сообщества',
      'Приоритет в поиске',
      'Упоминание в блоге платформы',
    ],
    isPopular: true,
    usedBy: 67,
  },
  {
    id: 'tool-6',
    name: 'Email Marketing Automation',
    description: 'Автоматизация email-рассылок для привлечения пользователей и инвесторов',
    category: 'promotion',
    icon: 'Mail',
    price: {
      type: 'freemium',
      amount: 39,
      period: 'month',
    },
    features: [
      'Шаблоны писем для разных этапов',
      'Автоматические триггеры',
      'A/B тестирование заголовков',
      'Аналитика открытий и кликов',
      'Интеграция с CRM',
    ],
    isPopular: true,
    usedBy: 156,
  },
  {
    id: 'tool-7',
    name: 'Social Media Scheduler',
    description: 'Планирование и автоматическая публикация постов в социальных сетях',
    category: 'promotion',
    icon: 'Calendar',
    price: {
      type: 'freemium',
      amount: 19,
      period: 'month',
    },
    features: [
      'Планирование на недели вперед',
      'Поддержка Twitter, LinkedIn, Facebook',
      'Оптимальное время публикации',
      'Аналитика вовлеченности',
      'Репосты из журнала разработки',
    ],
    isPopular: false,
    usedBy: 203,
  },
  {
    id: 'tool-8',
    name: 'Press Kit Generator',
    description: 'Автоматическое создание профессионального пресс-кита для медиа',
    category: 'promotion',
    icon: 'FileText',
    price: {
      type: 'paid',
      amount: 79,
      period: 'one-time',
    },
    features: [
      'Генерация PDF пресс-кита',
      'Логотипы и брендбук',
      'Факты и метрики',
      'Контактная информация',
      'Готовые шаблоны',
    ],
    isPopular: false,
    usedBy: 34,
  },
  {
    id: 'tool-9',
    name: 'User Behavior Tracker',
    description: 'Отслеживание поведения пользователей на странице стартапа',
    category: 'analytics',
    icon: 'Eye',
    price: {
      type: 'freemium',
      amount: 49,
      period: 'month',
    },
    features: [
      'Тепловые карты кликов',
      'Запись сессий пользователей',
      'Анализ путей взаимодействия',
      'Выявление проблемных зон',
      'Конверсионные воронки',
    ],
    isPopular: true,
    usedBy: 178,
  },
  {
    id: 'tool-10',
    name: 'A/B Testing Platform',
    description: 'Проведение A/B тестов для оптимизации конверсии и вовлеченности',
    category: 'analytics',
    icon: 'FlaskConical',
    price: {
      type: 'paid',
      amount: 59,
      period: 'month',
    },
    features: [
      'Визуальный редактор тестов',
      'Статистическая значимость',
      'Автоматическое определение победителя',
      'Многовариантное тестирование',
      'Интеграция с аналитикой',
    ],
    isPopular: false,
    usedBy: 92,
  },
  {
    id: 'tool-11',
    name: 'Conversion Funnel Analyzer',
    description: 'Детальный анализ воронки конверсии от просмотра до доната',
    category: 'analytics',
    icon: 'TrendingDown',
    price: {
      type: 'freemium',
      amount: 35,
      period: 'month',
    },
    features: [
      'Визуализация воронки',
      'Выявление узких мест',
      'Сравнение периодов',
      'Сегментация по источникам',
      'Рекомендации по улучшению',
    ],
    isPopular: false,
    usedBy: 145,
  },
  {
    id: 'tool-12',
    name: 'Slack Integration',
    description: 'Интеграция с Slack для уведомлений и автоматизации',
    category: 'integration',
    icon: 'MessageSquare',
    price: {
      type: 'free',
    },
    features: [
      'Уведомления о новых донатах',
      'Обновления из журнала разработки',
      'Статистика в канале',
      'Команды для управления',
      'Webhook интеграции',
    ],
    isPopular: true,
    usedBy: 312,
  },
  {
    id: 'tool-13',
    name: 'Discord Bot',
    description: 'Бот для Discord сервера с автоматическими обновлениями',
    category: 'integration',
    icon: 'Bot',
    price: {
      type: 'free',
    },
    features: [
      'Автоматические посты о релизах',
      'Команды для статистики',
      'Уведомления о донатах',
      'Роли для инвесторов',
      'Кастомные команды',
    ],
    isPopular: false,
    usedBy: 187,
  },
  {
    id: 'tool-14',
    name: 'Stripe Payment Integration',
    description: 'Готовая интеграция со Stripe для приема платежей и донатов',
    category: 'integration',
    icon: 'CreditCard',
    price: {
      type: 'paid',
      amount: 29,
      period: 'month',
    },
    features: [
      'Прием одноразовых платежей',
      'Подписки и рекуррентные платежи',
      'Управление инвойсами',
      'Автоматические квитанции',
      'Мультивалютность',
    ],
    isPopular: true,
    usedBy: 268,
  },
  {
    id: 'tool-15',
    name: 'API Webhooks Manager',
    description: 'Управление webhook-ами для интеграции с внешними сервисами',
    category: 'integration',
    icon: 'Webhook',
    price: {
      type: 'freemium',
      amount: 25,
      period: 'month',
    },
    features: [
      'Создание и управление webhook-ами',
      'Логирование запросов',
      'Повторная отправка при ошибках',
      'Фильтрация событий',
      'Тестирование webhook-ов',
    ],
    isPopular: false,
    usedBy: 134,
  },
  {
    id: 'tool-16',
    name: 'Subscription Management',
    description: 'Полноценная система управления подписками и рекуррентными платежами',
    category: 'monetization',
    icon: 'Repeat',
    price: {
      type: 'paid',
      amount: 79,
      period: 'month',
    },
    features: [
      'Управление планами подписки',
      'Автоматическое списание',
      'Управление отменами',
      'Промокоды и скидки',
      'Аналитика подписок',
    ],
    isPopular: true,
    usedBy: 198,
  },
  {
    id: 'tool-17',
    name: 'Affiliate Program Builder',
    description: 'Создание и управление партнерской программой для привлечения рефералов',
    category: 'monetization',
    icon: 'Users',
    price: {
      type: 'freemium',
      amount: 45,
      period: 'month',
    },
    features: [
      'Генерация реферальных ссылок',
      'Отслеживание конверсий',
      'Автоматические выплаты',
      'Панель для партнеров',
      'Аналитика эффективности',
    ],
    isPopular: false,
    usedBy: 76,
  },
  {
    id: 'tool-18',
    name: 'Donation Widget',
    description: 'Красивый виджет для приема донатов с кастомизацией',
    category: 'monetization',
    icon: 'Heart',
    price: {
      type: 'free',
    },
    features: [
      'Встраиваемый виджет',
      'Кастомизация дизайна',
      'Множественные способы оплаты',
      'Благодарственные сообщения',
      'Анонимные донаты',
    ],
    isPopular: true,
    usedBy: 421,
  },
  {
    id: 'tool-19',
    name: 'Pricing Page Builder',
    description: 'Конструктор страниц с тарифами без кода',
    category: 'monetization',
    icon: 'Layout',
    price: {
      type: 'freemium',
      amount: 39,
      period: 'month',
    },
    features: [
      'Визуальный редактор',
      'Готовые шаблоны',
      'A/B тестирование тарифов',
      'Интеграция с платежами',
      'Аналитика конверсии',
    ],
    isPopular: false,
    usedBy: 112,
  },
  {
    id: 'tool-20',
    name: 'Revenue Dashboard',
    description: 'Комплексная панель для отслеживания всех финансовых метрик',
    category: 'monetization',
    icon: 'LineChart',
    price: {
      type: 'paid',
      amount: 69,
      period: 'month',
    },
    features: [
      'Обзор доходов и расходов',
      'Прогнозирование роста',
      'Детализация по источникам',
      'Экспорт отчетов',
      'Интеграция с бухгалтерией',
    ],
    isPopular: true,
    usedBy: 143,
  },
  {
    id: 'tool-21',
    name: 'Launch Announcement Tool',
    description: 'Автоматическая публикация анонсов запуска на всех платформах',
    category: 'promotion',
    icon: 'Rocket',
    price: {
      type: 'paid',
      amount: 49,
      period: 'one-time',
    },
    features: [
      'Единый анонс на всех каналах',
      'Кастомизация сообщений',
      'Планирование времени',
      'Отслеживание охвата',
      'Шаблоны для разных типов запусков',
    ],
    isPopular: false,
    usedBy: 58,
  },
  {
    id: 'tool-22',
    name: 'Heatmap Tool',
    description: 'Визуализация взаимодействия пользователей с помощью тепловых карт',
    category: 'analytics',
    icon: 'Thermometer',
    price: {
      type: 'freemium',
      amount: 42,
      period: 'month',
    },
    features: [
      'Тепловые карты кликов',
      'Карты скроллинга',
      'Карты движения мыши',
      'Сегментация по устройствам',
      'Сравнение версий страниц',
    ],
    isPopular: false,
    usedBy: 167,
  },
  {
    id: 'tool-23',
    name: 'Email Newsletter Integration',
    description: 'Интеграция с популярными сервисами email-маркетинга',
    category: 'integration',
    icon: 'Send',
    price: {
      type: 'free',
    },
    features: [
      'Поддержка Mailchimp, SendGrid',
      'Автоматическая синхронизация подписчиков',
      'Сегментация аудитории',
      'Отслеживание открытий',
      'Автоматические триггеры',
    ],
    isPopular: true,
    usedBy: 289,
  },
  {
    id: 'tool-24',
    name: 'Performance Monitor',
    description: 'Мониторинг производительности и доступности вашего стартапа',
    category: 'analytics',
    icon: 'Activity',
    price: {
      type: 'freemium',
      amount: 55,
      period: 'month',
    },
    features: [
      'Мониторинг uptime',
      'Отслеживание скорости загрузки',
      'Алерты при проблемах',
      'Исторические данные',
      'Сравнение с конкурентами',
    ],
    isPopular: false,
    usedBy: 201,
  },
  {
    id: 'tool-25',
    name: 'SEO Optimizer',
    description: 'Автоматическая оптимизация SEO для страницы стартапа',
    category: 'promotion',
    icon: 'Search',
    price: {
      type: 'freemium',
      amount: 34,
      period: 'month',
    },
    features: [
      'Автоматические мета-теги',
      'Оптимизация заголовков',
      'Sitemap генерация',
      'Анализ ключевых слов',
      'Отчеты по позициям',
    ],
    isPopular: false,
    usedBy: 178,
  },
  {
    id: 'tool-26',
    name: 'Content Calendar',
    description: 'Планирование контента для журнала разработки и соцсетей',
    category: 'promotion',
    icon: 'CalendarDays',
    price: {
      type: 'free',
    },
    features: [
      'Визуальный календарь',
      'Шаблоны постов',
      'Напоминания о публикациях',
      'Синхронизация с журналом',
      'Аналитика эффективности',
    ],
    isPopular: true,
    usedBy: 245,
  },
  {
    id: 'tool-27',
    name: 'Influencer Outreach',
    description: 'Поиск и контакт с инфлюенсерами для продвижения стартапа',
    category: 'promotion',
    icon: 'UserPlus',
    price: {
      type: 'paid',
      amount: 89,
      period: 'month',
    },
    features: [
      'База инфлюенсеров',
      'Автоматические шаблоны писем',
      'Отслеживание ответов',
      'Анализ охвата',
      'Управление кампаниями',
    ],
    isPopular: false,
    usedBy: 56,
  },
  {
    id: 'tool-28',
    name: 'Video Trailer Maker',
    description: 'Создание промо-видео для стартапа без навыков монтажа',
    category: 'promotion',
    icon: 'Video',
    price: {
      type: 'freemium',
      amount: 49,
      period: 'month',
    },
    features: [
      'Готовые шаблоны',
      'Автоматический монтаж',
      'Музыка и эффекты',
      'Экспорт в разных форматах',
      'Оптимизация для соцсетей',
    ],
    isPopular: false,
    usedBy: 112,
  },
  {
    id: 'tool-29',
    name: 'Referral Program Builder',
    description: 'Создание реферальной программы для привлечения пользователей',
    category: 'promotion',
    icon: 'UserCheck',
    price: {
      type: 'freemium',
      amount: 38,
      period: 'month',
    },
    features: [
      'Генерация реферальных кодов',
      'Автоматические награды',
      'Панель для рефералов',
      'Отслеживание конверсий',
      'Интеграция с платежами',
    ],
    isPopular: true,
    usedBy: 189,
  },
  {
    id: 'tool-30',
    name: 'Event Tracker',
    description: 'Отслеживание пользовательских событий и действий',
    category: 'analytics',
    icon: 'MousePointerClick',
    price: {
      type: 'freemium',
      amount: 42,
      period: 'month',
    },
    features: [
      'Кастомные события',
      'Сегментация пользователей',
      'Воронки событий',
      'Real-time дашборд',
      'Экспорт данных',
    ],
    isPopular: false,
    usedBy: 167,
  },
  {
    id: 'tool-31',
    name: 'Cohort Analyzer',
    description: 'Анализ когорт пользователей для понимания retention',
    category: 'analytics',
    icon: 'UsersRound',
    price: {
      type: 'paid',
      amount: 64,
      period: 'month',
    },
    features: [
      'Автоматическое группирование',
      'Retention кривые',
      'Сравнение когорт',
      'Прогнозирование',
      'Визуализация трендов',
    ],
    isPopular: false,
    usedBy: 98,
  },
  {
    id: 'tool-32',
    name: 'Error Tracking',
    description: 'Отслеживание ошибок и исключений в реальном времени',
    category: 'analytics',
    icon: 'AlertTriangle',
    price: {
      type: 'freemium',
      amount: 39,
      period: 'month',
    },
    features: [
      'Автоматический сбор ошибок',
      'Stack trace анализ',
      'Уведомления в реальном времени',
      'Группировка похожих ошибок',
      'История исправлений',
    ],
    isPopular: true,
    usedBy: 276,
  },
  {
    id: 'tool-33',
    name: 'Session Replay',
    description: 'Запись сессий пользователей для анализа поведения',
    category: 'analytics',
    icon: 'PlayCircle',
    price: {
      type: 'freemium',
      amount: 52,
      period: 'month',
    },
    features: [
      'Полная запись сессий',
      'Поиск по событиям',
      'Фильтрация по действиям',
      'Экспорт записей',
      'Приватность данных',
    ],
    isPopular: false,
    usedBy: 134,
  },
  {
    id: 'tool-34',
    name: 'Zapier Integration',
    description: 'Интеграция с Zapier для автоматизации рабочих процессов',
    category: 'integration',
    icon: 'Zap',
    price: {
      type: 'free',
    },
    features: [
      'Готовые Zaps',
      'Автоматизация уведомлений',
      'Синхронизация данных',
      'Триггеры событий',
      'Поддержка 5000+ сервисов',
    ],
    isPopular: true,
    usedBy: 312,
  },
  {
    id: 'tool-35',
    name: 'Telegram Bot Builder',
    description: 'Создание Telegram бота для уведомлений и взаимодействия',
    category: 'integration',
    icon: 'MessageCircle',
    price: {
      type: 'freemium',
      amount: 27,
      period: 'month',
    },
    features: [
      'Визуальный конструктор',
      'Автоматические ответы',
      'Уведомления о донатах',
      'Статистика в боте',
      'Кастомные команды',
    ],
    isPopular: false,
    usedBy: 145,
  },
  {
    id: 'tool-36',
    name: 'Google Analytics Integration',
    description: 'Глубокая интеграция с Google Analytics для детальной аналитики',
    category: 'integration',
    icon: 'LineChart',
    price: {
      type: 'free',
    },
    features: [
      'Автоматическая отправка событий',
      'Кастомные измерения',
      'E-commerce трекинг',
      'Цели и конверсии',
      'Синхронизация данных',
    ],
    isPopular: true,
    usedBy: 398,
  },
  {
    id: 'tool-37',
    name: 'Intercom Integration',
    description: 'Интеграция с Intercom для поддержки клиентов',
    category: 'integration',
    icon: 'Headphones',
    price: {
      type: 'freemium',
      amount: 45,
      period: 'month',
    },
    features: [
      'Встроенный чат',
      'Автоматические ответы',
      'История взаимодействий',
      'Сегментация пользователей',
      'Аналитика поддержки',
    ],
    isPopular: false,
    usedBy: 123,
  },
  {
    id: 'tool-38',
    name: 'Notion Integration',
    description: 'Синхронизация данных стартапа с Notion workspace',
    category: 'integration',
    icon: 'FileText',
    price: {
      type: 'free',
    },
    features: [
      'Автоматическое обновление страниц',
      'Синхронизация метрик',
      'Создание отчетов',
      'Управление задачами',
      'Документация проекта',
    ],
    isPopular: false,
    usedBy: 167,
  },
  {
    id: 'tool-39',
    name: 'Pricing Calculator',
    description: 'Интерактивный калькулятор цен для ваших продуктов',
    category: 'monetization',
    icon: 'Calculator',
    price: {
      type: 'freemium',
      amount: 32,
      period: 'month',
    },
    features: [
      'Визуальный конструктор',
      'Множественные тарифы',
      'Скидки и промокоды',
      'Расчет ROI',
      'A/B тестирование',
    ],
    isPopular: false,
    usedBy: 89,
  },
  {
    id: 'tool-40',
    name: 'Invoice Generator',
    description: 'Автоматическая генерация инвойсов для донатов и платежей',
    category: 'monetization',
    icon: 'Receipt',
    price: {
      type: 'freemium',
      amount: 28,
      period: 'month',
    },
    features: [
      'Автоматические инвойсы',
      'Кастомные шаблоны',
      'Мультивалютность',
      'Отправка по email',
      'Отслеживание статусов',
    ],
    isPopular: true,
    usedBy: 234,
  },
  {
    id: 'tool-41',
    name: 'Tax Report Generator',
    description: 'Автоматическая генерация налоговых отчетов',
    category: 'monetization',
    icon: 'FileSpreadsheet',
    price: {
      type: 'paid',
      amount: 79,
      period: 'year',
    },
    features: [
      'Автоматический расчет налогов',
      'Поддержка разных стран',
      'Экспорт в PDF/Excel',
      'Интеграция с бухгалтерией',
      'Напоминания о дедлайнах',
    ],
    isPopular: false,
    usedBy: 67,
  },
  {
    id: 'tool-42',
    name: 'Payment Gateway Manager',
    description: 'Управление несколькими платежными системами из одного места',
    category: 'monetization',
    icon: 'Wallet',
    price: {
      type: 'freemium',
      amount: 55,
      period: 'month',
    },
    features: [
      'Поддержка Stripe, PayPal, Square',
      'Единая панель управления',
      'Автоматическое переключение',
      'Аналитика по провайдерам',
      'Управление возвратами',
    ],
    isPopular: false,
    usedBy: 156,
  },
  {
    id: 'tool-43',
    name: 'Crowdfunding Campaign Manager',
    description: 'Управление краудфандинговой кампанией с отслеживанием прогресса',
    category: 'monetization',
    icon: 'Target',
    price: {
      type: 'freemium',
      amount: 69,
      period: 'month',
    },
    features: [
      'Прогресс-бар целей',
      'Управление наградами',
      'Обновления для бэкеров',
      'Аналитика кампании',
      'Интеграция с платежами',
    ],
    isPopular: false,
    usedBy: 78,
  },
  {
    id: 'tool-44',
    name: 'Loyalty Program Builder',
    description: 'Создание программы лояльности для постоянных пользователей',
    category: 'monetization',
    icon: 'Award',
    price: {
      type: 'freemium',
      amount: 48,
      period: 'month',
    },
    features: [
      'Система баллов',
      'Уровни лояльности',
      'Персональные предложения',
      'Отслеживание активности',
      'Аналитика программы',
    ],
    isPopular: true,
    usedBy: 201,
  },
  {
    id: 'tool-45',
    name: 'Lead Magnet Generator',
    description: 'Создание лид-магнитов для сбора email-адресов',
    category: 'promotion',
    icon: 'Magnet',
    price: {
      type: 'freemium',
      amount: 36,
      period: 'month',
    },
    features: [
      'Готовые шаблоны',
      'Автоматическая раздача',
      'Интеграция с email',
      'Отслеживание конверсий',
      'A/B тестирование',
    ],
    isPopular: false,
    usedBy: 134,
  },
  {
    id: 'tool-46',
    name: 'Competitor Analysis Tool',
    description: 'Анализ конкурентов и их стратегий продвижения',
    category: 'analytics',
    icon: 'ScanSearch',
    price: {
      type: 'paid',
      amount: 89,
      period: 'month',
    },
    features: [
      'Мониторинг конкурентов',
      'Анализ контента',
      'Отслеживание изменений',
      'Сравнение метрик',
      'Рекомендации',
    ],
    isPopular: false,
    usedBy: 45,
  },
  {
    id: 'tool-47',
    name: 'Customer Feedback Collector',
    description: 'Сбор и анализ отзывов от пользователей',
    category: 'analytics',
    icon: 'MessageSquareText',
    price: {
      type: 'freemium',
      amount: 31,
      period: 'month',
    },
    features: [
      'Встроенные формы',
      'NPS опросы',
      'Автоматические напоминания',
      'Анализ тональности',
      'Экспорт отчетов',
    ],
    isPopular: true,
    usedBy: 267,
  },
  {
    id: 'tool-48',
    name: 'API Documentation Generator',
    description: 'Автоматическая генерация документации для API',
    category: 'integration',
    icon: 'BookOpen',
    price: {
      type: 'free',
    },
    features: [
      'Автогенерация из кода',
      'Интерактивные примеры',
      'Тестирование API',
      'Версионирование',
      'Экспорт в разные форматы',
    ],
    isPopular: true,
    usedBy: 289,
  },
]


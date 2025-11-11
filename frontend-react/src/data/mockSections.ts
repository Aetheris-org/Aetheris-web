/**
 * NOTE FOR FUTURE DEVELOPERS / AUTOMATIONS:
 *
 * This file contains temporary mock data for the Networking, Courses, and Developers sections.
 * When integrating with the real backend (e.g. Strapi), follow these steps:
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


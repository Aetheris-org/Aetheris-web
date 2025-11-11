/**
 * NOTE FOR FUTURE DEVELOPERS / AUTOMATIONS:
 *
 * This file contains temporary mock data for the Networking, Courses, and Developers sections.
 * When integrating with the real backend (e.g. Strapi), follow these steps:
 *
 * 1. Create the necessary content types in Strapi (or your preferred CMS):
 *    - Networking opportunity (title, summary, tags, contact method, availability, location, status).
 *    - Course (title, shortDescription, author, level, duration, price/free flag, isOfficial flag).
 *    - Developer resource/update (title, category, summary, link, publishedAt, author or maintainer).
 *
 * 2. Replace the mock queries in the corresponding React pages with data fetched via your API layer.
 *    For example, add functions to `src/api` (e.g. `getNetworkingListings`, `getCourses`, `getDeveloperResources`)
 *    that call your backend, handle pagination/filters, and map the response to the interfaces defined below.
 *
 * 3. Once real data fetching is in place, remove or disable the exports in this file and adjust the pages to use the API hooks.
 *    You can keep the interfaces as shared types for client-side code.
 *
 * 4. Ensure loading/error states are handled in the pages after replacing the mock data with asynchronous requests.
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
}

export interface DeveloperResource {
  id: string
  title: string
  category: 'changelog' | 'open-source' | 'guideline' | 'tooling'
  summary: string
  link: string
  publishedAt: string
  maintainer: string
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
  },
]

export const developerResources: DeveloperResource[] = [
  {
    id: 'dev-1',
    title: 'Changelog · Aetheris Platform v0.9.4',
    category: 'changelog',
    summary: 'New networking graph APIs, improved hydration performance, and audio article beta program.',
    link: '#',
    publishedAt: '2025-02-18T09:00:00Z',
    maintainer: 'Core Platform Team',
  },
  {
    id: 'dev-2',
    title: 'Open-source kit: Strapi role presets for editorial teams',
    category: 'open-source',
    summary: 'Preconfigured Strapi roles & permissions pack to jump-start editorial workflows with role-based access.',
    link: '#',
    publishedAt: '2025-02-10T12:30:00Z',
    maintainer: 'Community Guild',
  },
  {
    id: 'dev-3',
    title: 'Guidelines · Designing multi-tenant course catalogs',
    category: 'guideline',
    summary: 'Best practices for modeling course metadata, versioning, and user-generated modules.',
    link: '#',
    publishedAt: '2025-01-31T08:15:00Z',
    maintainer: 'Aetheris DX',
  },
  {
    id: 'dev-4',
    title: 'Tooling update: CLI scaffolder for shadcn-based dashboards',
    category: 'tooling',
    summary: 'Generate production-ready dashboard shells with authentication, themes, and analytics.',
    link: '#',
    publishedAt: '2025-01-22T16:45:00Z',
    maintainer: 'DX Toolkit',
  },
]


/**
 * MOCK DATA FOR NETWORKING PAGE
 * 
 * ⚠️ ВАЖНО ДЛЯ BACKEND INTEGRATION:
 * 
 * Эти данные являются временными моками для разработки UI.
 * При интеграции с бэкендом:
 * 
 * 1. УДАЛИТЬ этот файл полностью
 * 2. СОЗДАТЬ API endpoints:
 *    - GET /api/networking/companies - список вакансий компаний
 *    - GET /api/networking/client-requests - запросы от заказчиков
 *    - GET /api/networking/freelancer-offers - предложения фрилансеров
 *    - GET /api/networking/:type/:id - детали конкретного предложения
 *    - POST /api/networking/:type - создание нового предложения
 *    - PUT /api/networking/:type/:id - обновление предложения
 *    - DELETE /api/networking/:type/:id - удаление предложения
 *    - POST /api/networking/:type/:id/boost - буст предложения
 *    - GET /api/networking/reviews/:userId - отзывы пользователя
 *    - POST /api/networking/reviews - создание отзыва
 * 
 * 3. ЗАМЕНИТЬ импорты в NetworkingPage.tsx:
 *    import { mockCompanyJobs, ... } from '@/data/networkingMockData'
 *    НА:
 *    import { useQuery } from '@tanstack/react-query'
 *    import { getCompanyJobs, ... } from '@/api/networking'
 * 
 * 4. ИСПОЛЬЗОВАТЬ React Query для загрузки данных:
 *    const { data: companies } = useQuery({
 *      queryKey: ['companies', filters],
 *      queryFn: () => getCompanyJobs(filters)
 *    })
 * 
 * 5. ДОБАВИТЬ в Strapi:
 *    - Content Type: company-job-listing
 *    - Content Type: client-request
 *    - Content Type: freelancer-offer
 *    - Content Type: user-review
 *    - Relation: user -> account-type (enum: company, freelancer, client)
 *    - Relation: listings -> user (many-to-one)
 *    - Relation: reviews -> user (many-to-one)
 * 
 * 6. НАСТРОИТЬ permissions в Strapi:
 *    - Public: find, findOne для всех типов
 *    - Authenticated: create, update, delete только своих записей
 *    - Boosted listings требуют payment verification
 * 
 * 7. ДОБАВИТЬ валидацию на бэкенде:
 *    - Рейтинг: 0-5
 *    - Буст: проверка оплаты и срока действия
 *    - Статус: только владелец может менять
 */

import type {
  CompanyJobListing,
  ClientRequest,
  FreelancerOffer,
  Review,
} from '@/types/networking'

// MOCK: Вакансии от компаний
export const mockCompanyJobs: CompanyJobListing[] = [
  {
    id: '1',
    companyId: 'comp-1',
    companyName: 'TechCorp Solutions',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=TechCorp',
    companyRating: {
      average: 4.8,
      count: 127,
      breakdown: { 5: 95, 4: 25, 3: 5, 2: 2, 1: 0 },
    },
    companyVerified: true,
    title: 'Senior Full-Stack Developer',
    description: 'We are looking for an experienced full-stack developer to join our growing team. You will work on cutting-edge projects using React, Node.js, and cloud technologies.',
    requirements: [
      '5+ years of experience with React and Node.js',
      'Strong understanding of TypeScript',
      'Experience with AWS or Azure',
      'Excellent problem-solving skills',
    ],
    responsibilities: [
      'Develop and maintain web applications',
      'Collaborate with design and product teams',
      'Write clean, maintainable code',
      'Mentor junior developers',
    ],
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD',
      period: 'yearly',
    },
    location: {
      country: 'USA',
      city: 'San Francisco',
      remote: true,
      hybrid: true,
    },
    employmentType: 'full-time',
    experienceLevel: 'senior',
    tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
    benefits: ['Health insurance', '401k matching', 'Flexible hours', 'Remote work'],
    boosted: true,
    boostExpiresAt: '2025-12-01T00:00:00Z',
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-10T15:30:00Z',
    status: 'active',
    applicationsCount: 45,
    viewsCount: 892,
  },
  {
    id: '2',
    companyId: 'comp-2',
    companyName: 'DesignHub Studio',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=DesignHub',
    companyRating: {
      average: 4.5,
      count: 83,
      breakdown: { 5: 60, 4: 18, 3: 4, 2: 1, 1: 0 },
    },
    companyVerified: true,
    title: 'UI/UX Designer',
    description: 'Join our creative team to design beautiful and intuitive user interfaces for web and mobile applications.',
    requirements: [
      '3+ years of UI/UX design experience',
      'Proficiency in Figma and Adobe Creative Suite',
      'Strong portfolio demonstrating user-centered design',
      'Understanding of design systems',
    ],
    responsibilities: [
      'Create wireframes, prototypes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Collaborate with developers and stakeholders',
      'Maintain and evolve design systems',
    ],
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD',
      period: 'yearly',
    },
    location: {
      country: 'UK',
      city: 'London',
      remote: true,
      hybrid: false,
    },
    employmentType: 'full-time',
    experienceLevel: 'middle',
    tags: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    benefits: ['Remote work', 'Professional development budget', 'Flexible hours'],
    boosted: false,
    createdAt: '2025-11-05T14:20:00Z',
    updatedAt: '2025-11-05T14:20:00Z',
    status: 'active',
    applicationsCount: 28,
    viewsCount: 456,
  },
  {
    id: '3',
    companyId: 'comp-3',
    companyName: 'DataFlow Analytics',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=DataFlow',
    companyRating: {
      average: 4.9,
      count: 201,
      breakdown: { 5: 185, 4: 12, 3: 3, 2: 1, 1: 0 },
    },
    companyVerified: true,
    title: 'Machine Learning Engineer',
    description: 'Work on cutting-edge ML projects, building and deploying models at scale.',
    requirements: [
      'PhD or Master\'s in Computer Science, Statistics, or related field',
      'Strong Python and ML framework experience (TensorFlow, PyTorch)',
      'Experience with cloud ML platforms',
      'Published research is a plus',
    ],
    responsibilities: [
      'Design and implement ML models',
      'Optimize model performance and scalability',
      'Collaborate with data scientists and engineers',
      'Deploy models to production',
    ],
    salary: {
      min: 150000,
      max: 220000,
      currency: 'USD',
      period: 'yearly',
    },
    location: {
      country: 'USA',
      city: 'New York',
      remote: false,
      hybrid: true,
    },
    employmentType: 'full-time',
    experienceLevel: 'senior',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'ML', 'AI'],
    benefits: ['Equity', 'Relocation assistance', 'Top-tier health insurance'],
    boosted: true,
    boostExpiresAt: '2025-11-25T00:00:00Z',
    createdAt: '2025-10-28T09:15:00Z',
    updatedAt: '2025-11-08T11:45:00Z',
    status: 'active',
    applicationsCount: 67,
    viewsCount: 1234,
  },
]

// MOCK: Запросы от заказчиков
export const mockClientRequests: ClientRequest[] = [
  {
    id: 'cr-1',
    clientId: 'client-1',
    clientName: 'Sarah Johnson',
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    clientRating: {
      average: 4.7,
      count: 23,
      breakdown: { 5: 18, 4: 4, 3: 1, 2: 0, 1: 0 },
    },
    title: 'E-commerce Website Development',
    description: 'Looking for an experienced developer to build a modern e-commerce platform with payment integration, inventory management, and admin dashboard.',
    requirements: [
      'Experience with React and Next.js',
      'Payment gateway integration (Stripe/PayPal)',
      'Responsive design',
      'SEO optimization',
    ],
    budget: {
      min: 5000,
      max: 8000,
      currency: 'USD',
      type: 'fixed',
    },
    deadline: '2025-12-15T00:00:00Z',
    duration: '6-8 weeks',
    category: 'Web Development',
    tags: ['React', 'Next.js', 'E-commerce', 'Stripe', 'SEO'],
    boosted: true,
    boostExpiresAt: '2025-11-20T00:00:00Z',
    createdAt: '2025-11-08T16:30:00Z',
    updatedAt: '2025-11-08T16:30:00Z',
    status: 'open',
    proposalsCount: 12,
    viewsCount: 234,
  },
  {
    id: 'cr-2',
    clientId: 'client-2',
    clientName: 'Michael Chen',
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    clientRating: {
      average: 5.0,
      count: 15,
      breakdown: { 5: 15, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    title: 'Mobile App UI/UX Redesign',
    description: 'Need a talented designer to redesign our existing mobile app. Focus on improving user experience and modernizing the visual design.',
    requirements: [
      'Strong portfolio of mobile app designs',
      'Experience with iOS and Android design guidelines',
      'Figma proficiency',
      'User research experience',
    ],
    budget: {
      min: 3000,
      max: 5000,
      currency: 'USD',
      type: 'fixed',
    },
    deadline: '2025-12-01T00:00:00Z',
    duration: '3-4 weeks',
    category: 'UI/UX Design',
    tags: ['Mobile Design', 'Figma', 'iOS', 'Android', 'UX Research'],
    boosted: false,
    createdAt: '2025-11-10T10:15:00Z',
    updatedAt: '2025-11-10T10:15:00Z',
    status: 'open',
    proposalsCount: 8,
    viewsCount: 156,
  },
  {
    id: 'cr-3',
    clientId: 'client-3',
    clientName: 'Emma Rodriguez',
    clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    clientRating: {
      average: 4.8,
      count: 31,
      breakdown: { 5: 27, 4: 3, 3: 1, 2: 0, 1: 0 },
    },
    title: 'Data Analysis & Visualization Dashboard',
    description: 'Looking for a data analyst to create interactive dashboards for business metrics. Must have experience with Python and data visualization tools.',
    requirements: [
      'Python (pandas, numpy)',
      'Data visualization (Plotly, D3.js)',
      'SQL experience',
      'Business intelligence background',
    ],
    budget: {
      min: 50,
      max: 80,
      currency: 'USD',
      type: 'hourly',
    },
    duration: '2-3 months',
    category: 'Data Analysis',
    tags: ['Python', 'Data Visualization', 'SQL', 'BI', 'Dashboards'],
    boosted: false,
    createdAt: '2025-11-07T13:45:00Z',
    updatedAt: '2025-11-09T09:20:00Z',
    status: 'open',
    proposalsCount: 15,
    viewsCount: 289,
  },
]

// MOCK: Предложения от фрилансеров
export const mockFreelancerOffers: FreelancerOffer[] = [
  {
    id: 'fo-1',
    freelancerId: 'freelancer-1',
    freelancerName: 'Alex Thompson',
    freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    freelancerRating: {
      average: 4.9,
      count: 156,
      breakdown: { 5: 145, 4: 9, 3: 2, 2: 0, 1: 0 },
    },
    freelancerVerified: true,
    title: 'Full-Stack Web Development Services',
    description: 'Experienced full-stack developer specializing in React, Node.js, and cloud deployment. I help businesses build scalable web applications from concept to launch.',
    services: [
      'Custom web application development',
      'API design and integration',
      'Database design and optimization',
      'Cloud deployment (AWS, Azure)',
      'Performance optimization',
      'Technical consulting',
    ],
    pricing: {
      hourlyRate: 85,
      projectRate: {
        min: 3000,
        max: 15000,
      },
      currency: 'USD',
    },
    availability: 'available',
    responseTime: 'within 2 hours',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL'],
    categories: ['Web Development', 'Backend Development', 'DevOps'],
    portfolio: [
      {
        id: 'p1',
        title: 'SaaS Dashboard Platform',
        description: 'Built a comprehensive analytics dashboard for a B2B SaaS company',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        tags: ['React', 'Node.js', 'PostgreSQL'],
      },
      {
        id: 'p2',
        title: 'E-commerce Marketplace',
        description: 'Developed a multi-vendor marketplace with payment processing',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
        tags: ['Next.js', 'Stripe', 'MongoDB'],
      },
      {
        id: 'p3',
        title: 'Real-time Collaboration Tool',
        description: 'Created a real-time collaboration platform with WebSocket',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
        tags: ['React', 'Socket.io', 'Redis'],
      },
    ],
    experience: {
      years: 7,
      projectsCompleted: 89,
      clientsServed: 64,
    },
    boosted: true,
    boostExpiresAt: '2025-11-30T00:00:00Z',
    createdAt: '2025-10-15T08:00:00Z',
    updatedAt: '2025-11-11T14:20:00Z',
    status: 'active',
    viewsCount: 1567,
    contactsCount: 78,
  },
  {
    id: 'fo-2',
    freelancerId: 'freelancer-2',
    freelancerName: 'Maria Garcia',
    freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    freelancerRating: {
      average: 5.0,
      count: 92,
      breakdown: { 5: 92, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    freelancerVerified: true,
    title: 'UI/UX Design & Brand Identity',
    description: 'Award-winning designer with 8+ years of experience creating beautiful, user-centered designs for startups and established brands.',
    services: [
      'UI/UX design for web and mobile',
      'Brand identity and logo design',
      'Design systems and component libraries',
      'User research and testing',
      'Prototyping and wireframing',
      'Design consultation',
    ],
    pricing: {
      hourlyRate: 95,
      projectRate: {
        min: 4000,
        max: 20000,
      },
      currency: 'USD',
    },
    availability: 'available',
    responseTime: 'within 1 hour',
    skills: ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Prototyping', 'User Research'],
    categories: ['UI/UX Design', 'Brand Design', 'Product Design'],
    portfolio: [
      {
        id: 'p4',
        title: 'FinTech Mobile App',
        description: 'Complete UI/UX design for a banking mobile application',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
        tags: ['Mobile Design', 'Figma', 'iOS'],
      },
      {
        id: 'p5',
        title: 'Brand Identity for Tech Startup',
        description: 'Full brand identity including logo, colors, and guidelines',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        tags: ['Branding', 'Logo Design', 'Identity'],
      },
      {
        id: 'p6',
        title: 'SaaS Dashboard Redesign',
        description: 'Modernized dashboard with improved UX and accessibility',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        tags: ['UI Design', 'Dashboard', 'Accessibility'],
      },
    ],
    experience: {
      years: 8,
      projectsCompleted: 124,
      clientsServed: 87,
    },
    boosted: true,
    boostExpiresAt: '2025-11-28T00:00:00Z',
    createdAt: '2025-09-20T11:30:00Z',
    updatedAt: '2025-11-10T16:45:00Z',
    status: 'active',
    viewsCount: 2103,
    contactsCount: 95,
  },
  {
    id: 'fo-3',
    freelancerId: 'freelancer-3',
    freelancerName: 'David Kim',
    freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    freelancerRating: {
      average: 4.8,
      count: 67,
      breakdown: { 5: 58, 4: 7, 3: 2, 2: 0, 1: 0 },
    },
    freelancerVerified: false,
    title: 'Mobile App Development (iOS & Android)',
    description: 'Specialized mobile developer with expertise in React Native and native iOS/Android development. I build high-performance mobile apps.',
    services: [
      'React Native app development',
      'Native iOS development (Swift)',
      'Native Android development (Kotlin)',
      'App Store/Play Store deployment',
      'Mobile app maintenance',
      'Performance optimization',
    ],
    pricing: {
      hourlyRate: 75,
      projectRate: {
        min: 5000,
        max: 25000,
      },
      currency: 'USD',
    },
    availability: 'busy',
    responseTime: 'within 24 hours',
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'Redux', 'Mobile UI'],
    categories: ['Mobile Development', 'iOS Development', 'Android Development'],
    portfolio: [
      {
        id: 'p7',
        title: 'Fitness Tracking App',
        description: 'Cross-platform fitness app with workout tracking and social features',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
        tags: ['React Native', 'Firebase', 'Health Kit'],
      },
      {
        id: 'p8',
        title: 'Food Delivery Platform',
        description: 'Complete food delivery solution with real-time tracking',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400',
        tags: ['React Native', 'Maps', 'Real-time'],
      },
    ],
    experience: {
      years: 5,
      projectsCompleted: 43,
      clientsServed: 35,
    },
    boosted: false,
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-11-05T12:30:00Z',
    status: 'active',
    viewsCount: 876,
    contactsCount: 42,
  },
]

// MOCK: Отзывы (примеры)
export const mockReviews: Review[] = [
  {
    id: 'r1',
    authorId: 'user-1',
    authorName: 'John Doe',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    rating: 5,
    comment: 'Excellent work! Delivered on time and exceeded expectations. Highly recommended!',
    createdAt: '2025-11-01T14:30:00Z',
    response: {
      text: 'Thank you for the kind words! It was a pleasure working with you.',
      createdAt: '2025-11-02T09:15:00Z',
    },
  },
  {
    id: 'r2',
    authorId: 'user-2',
    authorName: 'Jane Smith',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    rating: 5,
    comment: 'Professional, responsive, and great quality. Will definitely work together again!',
    createdAt: '2025-10-28T11:20:00Z',
  },
  {
    id: 'r3',
    authorId: 'user-3',
    authorName: 'Bob Wilson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    rating: 4,
    comment: 'Good work overall. Minor revisions needed but resolved quickly.',
    createdAt: '2025-10-25T16:45:00Z',
  },
]

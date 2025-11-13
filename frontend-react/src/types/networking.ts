/**
 * NETWORKING TYPES
 * 
 * Эти типы описывают структуру данных для страницы нетворкинга.
 * 
 * BACKEND INTEGRATION NOTES:
 * - Все эти типы должны соответствовать схемам в базе данных
 * - Поля с id должны быть уникальными идентификаторами из БД
 * - Даты должны быть в формате ISO 8601
 * - Изображения (avatar, logo, portfolioImages) должны быть URL-адресами
 * - Рейтинги должны валидироваться на бэкенде (0-5)
 */

// Базовые типы пользователей
export type AccountType = 'company' | 'freelancer' | 'client'

export interface UserRating {
  average: number // 0-5
  count: number
  breakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface Review {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  rating: number // 1-5
  comment: string
  createdAt: string
  response?: {
    text: string
    createdAt: string
  }
}

// Компании
export interface CompanyJobListing {
  id: string
  companyId: string
  companyName: string
  companyLogo?: string
  companyRating: UserRating
  companyVerified: boolean // Платный аккаунт
  
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  
  salary: {
    min?: number
    max?: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly' | 'project'
  }
  
  location: {
    country: string
    city?: string
    remote: boolean
    hybrid: boolean
  }
  
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceLevel: 'junior' | 'middle' | 'senior' | 'lead'
  
  tags: string[]
  benefits?: string[]
  
  // Буст
  boosted: boolean
  boostExpiresAt?: string
  
  createdAt: string
  updatedAt: string
  status: 'active' | 'closed' | 'draft'
  
  applicationsCount: number
  viewsCount: number
}

// Фриланс - Запросы от заказчиков
export interface ClientRequest {
  id: string
  clientId: string
  clientName: string
  clientAvatar?: string
  clientRating: UserRating
  
  title: string
  description: string
  requirements: string[]
  
  budget: {
    min?: number
    max?: number
    currency: string
    type: 'fixed' | 'hourly'
  }
  
  deadline?: string
  duration?: string // "1-2 weeks", "1 month", etc.
  
  category: string
  tags: string[]
  
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
  
  // Буст
  boosted: boolean
  boostExpiresAt?: string
  
  createdAt: string
  updatedAt: string
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  
  proposalsCount: number
  viewsCount: number
}

// Фриланс - Предложения от фрилансеров
export interface FreelancerOffer {
  id: string
  freelancerId: string
  freelancerName: string
  freelancerAvatar?: string
  freelancerRating: UserRating
  freelancerVerified: boolean
  
  title: string
  description: string
  services: string[]
  
  pricing: {
    hourlyRate?: number
    projectRate?: {
      min: number
      max: number
    }
    currency: string
  }
  
  availability: 'available' | 'busy' | 'unavailable'
  responseTime: string // "within 1 hour", "within 24 hours", etc.
  
  skills: string[]
  categories: string[]
  
  portfolio: Array<{
    id: string
    title: string
    description: string
    image?: string
    url?: string
    tags: string[]
  }>
  
  experience: {
    years: number
    projectsCompleted: number
    clientsServed: number
  }
  
  // Буст
  boosted: boolean
  boostExpiresAt?: string
  
  createdAt: string
  updatedAt: string
  status: 'active' | 'inactive'
  
  viewsCount: number
  contactsCount: number
}

// Фильтры
export interface NetworkingFilters {
  search?: string
  category?: string
  tags?: string[]
  
  // Для компаний
  employmentType?: string[]
  experienceLevel?: string[]
  remote?: boolean
  
  // Для фриланса
  budgetMin?: number
  budgetMax?: number
  availability?: string[]
  
  // Общие
  sortBy: 'relevance' | 'newest' | 'rating' | 'boosted'
  showBoostedOnly?: boolean
}

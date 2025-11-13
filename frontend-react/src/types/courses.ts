/**
 * TYPES FOR COURSES SYSTEM
 * 
 * This file defines the complete type system for the courses feature.
 * Courses can be verified (moderation-approved) or community-created.
 * Each course has a roadmap with sections that users can navigate through.
 */

// Course pricing models
export type CoursePricing = 
  | { type: 'free' }
  | { type: 'paid'; price: number; currency: 'USD' | 'EUR' | 'RUB' }
  | { type: 'subscription'; requiredTier: 'basic' | 'premium' | 'pro' }
  | { type: 'level-gated'; requiredLevel: number }

// Course access and monetization
export interface CourseAccess {
  pricing: CoursePricing
  hasAds: boolean // Creator can earn from ads
  adRevenue?: {
    enabled: boolean
    estimatedCPM: number // Cost per 1000 views
  }
}

// Individual lesson/module in a course
export interface CourseLesson {
  id: string
  title: string
  description: string
  duration: number // in minutes
  type: 'video' | 'article' | 'interactive' | 'quiz' | 'assignment'
  content?: string // For article-type lessons
  videoUrl?: string // For video lessons
  isPreview: boolean // Can be viewed without purchasing
  order: number
  completed?: boolean // User progress tracking
}

// Section in course roadmap
export interface CourseSection {
  id: string
  title: string
  description: string
  order: number
  lessons: CourseLesson[]
  estimatedDuration: number // Total minutes for section
  isLocked: boolean // Based on user access
}

// Course author/creator information
export interface CourseAuthor {
  id: string
  username: string
  avatar?: string
  reputation: number
  level: number
  verified: boolean
  bio?: string
  coursesPublished: number
  totalStudents: number
}

// Course statistics and engagement
export interface CourseStats {
  enrolledStudents: number
  completionRate: number // Percentage
  averageRating: number
  totalReviews: number
  totalRevenue?: number // For creator dashboard
  viewCount: number
  lastUpdated: string
}

// Course review/rating
export interface CourseReview {
  id: string
  userId: string
  username: string
  avatar?: string
  rating: number // 1-5
  comment: string
  helpful: number // Number of "helpful" votes
  createdAt: string
  courseProgress: number // Percentage completed when reviewed
}

// Main course interface
export interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  thumbnail?: string
  coverImage?: string
  
  // Author and verification
  author: CourseAuthor
  isVerified: boolean // Moderation-approved
  verificationDate?: string
  moderatorNotes?: string
  
  // Content structure
  sections: CourseSection[]
  totalLessons: number
  totalDuration: number // in minutes
  
  // Categorization
  category: string
  tags: string[]
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  language: string
  
  // Access and pricing
  access: CourseAccess
  
  // Stats and engagement
  stats: CourseStats
  
  // Metadata
  createdAt: string
  updatedAt: string
  publishedAt?: string
  status: 'draft' | 'published' | 'archived' | 'under-review'
  
  // Learning outcomes
  learningOutcomes: string[]
  prerequisites: string[]
  
  // Certificate
  providesCertificate: boolean
  certificateTemplate?: string
}

// Course enrollment/progress tracking
export interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  enrolledAt: string
  lastAccessedAt: string
  progress: {
    completedLessons: string[] // Lesson IDs
    currentSection: string
    currentLesson: string
    overallProgress: number // Percentage
  }
  certificateIssued?: {
    issuedAt: string
    certificateId: string
    certificateUrl: string
  }
}

// Course category for filtering
export interface CourseCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  courseCount: number
}

// Filter options for course catalog
export interface CourseFilters {
  category?: string
  level?: Course['level']
  pricing?: 'free' | 'paid' | 'subscription' | 'level-gated'
  verified?: boolean
  language?: string
  minRating?: number
  tags?: string[]
  search?: string
  sortBy?: 'popular' | 'newest' | 'rating' | 'trending'
}

// Course creation requirements
export interface CourseCreationRequirements {
  minReputation: number
  minLevel: number
  verified: boolean
}

export const COURSE_CREATION_REQUIREMENTS: CourseCreationRequirements = {
  minReputation: 100,
  minLevel: 5,
  verified: false, // Email verification, not course verification
}


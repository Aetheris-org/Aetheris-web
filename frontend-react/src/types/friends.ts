/**
 * TYPES FOR FRIENDS SYSTEM
 * 
 * This file defines the complete type system for the friends feature.
 * Users can send friend requests, accept/decline them, and manage their friend list.
 */

// Friend request status
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined'

// User basic info (for friend cards)
export interface FriendUser {
  id: string
  uuid?: string // UUID для навигации к профилю
  username: string
  displayName?: string
  avatar?: string
  bio?: string
  level: number
  reputation: number
  verified: boolean
  isOnline: boolean
  lastSeen?: string
  mutualFriends?: number
  // Stats
  stats?: {
    followers: number
    following: number
    articles: number
    courses: number
  }
}

// Friend request
export interface FriendRequest {
  id: string
  sender: FriendUser
  receiver: FriendUser
  status: FriendRequestStatus
  message?: string // Optional message when sending request
  createdAt: string
  updatedAt: string
  respondedAt?: string
}

// Friendship (accepted friend request)
export interface Friendship {
  id: string
  user: FriendUser
  friend: FriendUser
  createdAt: string
  // Additional metadata
  isFavorite?: boolean // User can mark friends as favorites
  notes?: string // Private notes about this friend
  tags?: string[] // Custom tags for organizing friends
}

// Friend suggestions (users you might know)
export interface FriendSuggestion {
  user: FriendUser
  reason: 'mutual_friends' | 'same_interests' | 'same_location' | 'popular'
  mutualFriends?: FriendUser[]
  commonTags?: string[]
  score: number // Relevance score for sorting
}

// Filters for friends list
export interface FriendsFilters {
  search?: string
  tags?: string[]
  onlineOnly?: boolean
  favorites?: boolean
  sortBy?: 'name' | 'recent' | 'reputation' | 'level'
}

// Friend activity (for activity feed)
export interface FriendActivity {
  id: string
  friend: FriendUser
  type: 'article_published' | 'course_created' | 'achievement_unlocked' | 'level_up' | 'joined_event'
  title: string
  description?: string
  link?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// Friend statistics
export interface FriendStats {
  totalFriends: number
  onlineFriends: number
  pendingRequests: number
  sentRequests: number
  mutualFriends: number
  recentActivity: number
}

// Notification preferences for friends
export interface FriendNotificationSettings {
  friendRequestReceived: boolean
  friendRequestAccepted: boolean
  friendOnline: boolean
  friendActivity: boolean
  friendMentioned: boolean
}


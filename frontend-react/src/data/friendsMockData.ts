/**
 * MOCK DATA FOR FRIENDS SYSTEM
 * 
 * ⚠️ FOR FUTURE DEVELOPERS / AI ASSISTANTS:
 * 
 * This file contains temporary mock data for the friends feature.
 * When integrating with the real backend (Strapi), follow these steps:
 * 
 * 1. CREATE STRAPI CONTENT TYPES:
 *    - FriendRequest (sender, receiver, status, message, timestamps)
 *    - Friendship (user, friend, isFavorite, notes, tags, createdAt)
 *    - FriendActivity (friend, type, title, description, link, timestamp)
 * 
 * 2. CREATE API ENDPOINTS:
 *    - GET /api/friends - Get user's friends list with filters
 *    - GET /api/friends/requests/received - Get received friend requests
 *    - GET /api/friends/requests/sent - Get sent friend requests
 *    - POST /api/friends/requests - Send friend request
 *    - PUT /api/friends/requests/:id/accept - Accept friend request
 *    - PUT /api/friends/requests/:id/decline - Decline friend request
 *    - DELETE /api/friends/requests/:id - Cancel sent request
 *    - DELETE /api/friends/:id - Remove friend
 *    - PUT /api/friends/:id - Update friendship (favorite, notes, tags)
 *    - GET /api/friends/suggestions - Get friend suggestions
 *    - GET /api/friends/search - Search users
 *    - GET /api/friends/activity - Get friends' recent activity
 *    - GET /api/friends/stats - Get friendship statistics
 * 
 * 3. IMPLEMENT IN src/api/friends.ts:
 *    - getFriends(filters: FriendsFilters) - Fetch friends list
 *    - getReceivedRequests() - Fetch received requests
 *    - getSentRequests() - Fetch sent requests
 *    - sendFriendRequest(userId: string, message?: string) - Send request
 *    - acceptFriendRequest(requestId: string) - Accept request
 *    - declineFriendRequest(requestId: string) - Decline request
 *    - cancelFriendRequest(requestId: string) - Cancel sent request
 *    - removeFriend(friendshipId: string) - Remove friend
 *    - updateFriendship(friendshipId: string, data) - Update friendship
 *    - getSuggestions() - Get friend suggestions
 *    - searchUsers(query: string) - Search users
 *    - getFriendActivity() - Get friends' activity
 *    - getFriendStats() - Get statistics
 * 
 * 4. UPDATE PAGES TO USE API:
 *    - Replace mock imports with useQuery/useMutation hooks
 *    - Add loading states, error handling, and skeleton loaders
 *    - Implement optimistic updates for friend requests
 *    - Add real-time updates using WebSocket or polling
 * 
 * 5. REAL-TIME FEATURES:
 *    - Use WebSocket for online status updates
 *    - Push notifications for friend requests
 *    - Live activity feed updates
 * 
 * 6. PRIVACY & SECURITY:
 *    - Implement privacy settings (who can send requests)
 *    - Block/report functionality
 *    - Rate limiting for friend requests
 * 
 * 7. DELETE THIS FILE after migration is complete.
 */

import type {
  FriendUser,
  FriendRequest,
  Friendship,
  FriendSuggestion,
  FriendActivity,
  FriendStats,
} from '@/types/friends'

// Mock users for friends system
export const mockUsers: FriendUser[] = [
  {
    id: 'user-1',
    username: 'alexdev',
    displayName: 'Alex Developer',
    bio: 'Full-stack developer passionate about React and Node.js',
    level: 15,
    reputation: 2450,
    verified: true,
    isOnline: true,
    mutualFriends: 5,
    stats: {
      followers: 1240,
      following: 320,
      articles: 45,
      courses: 3,
    },
  },
  {
    id: 'user-2',
    username: 'sarahui',
    displayName: 'Sarah UI/UX',
    bio: 'UI/UX Designer crafting beautiful experiences',
    level: 12,
    reputation: 1890,
    verified: true,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    mutualFriends: 8,
    stats: {
      followers: 890,
      following: 210,
      articles: 32,
      courses: 2,
    },
  },
  {
    id: 'user-3',
    username: 'mikebackend',
    displayName: 'Mike Backend',
    bio: 'Backend architect building scalable systems',
    level: 18,
    reputation: 3200,
    verified: true,
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    mutualFriends: 3,
    stats: {
      followers: 1560,
      following: 180,
      articles: 67,
      courses: 5,
    },
  },
  {
    id: 'user-4',
    username: 'emmareact',
    displayName: 'Emma React',
    bio: 'React enthusiast and open source contributor',
    level: 10,
    reputation: 1250,
    verified: false,
    isOnline: true,
    mutualFriends: 12,
    stats: {
      followers: 620,
      following: 340,
      articles: 28,
      courses: 1,
    },
  },
  {
    id: 'user-5',
    username: 'davidmobile',
    displayName: 'David Mobile',
    bio: 'Mobile developer (iOS & Android)',
    level: 14,
    reputation: 2100,
    verified: true,
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    mutualFriends: 6,
    stats: {
      followers: 980,
      following: 250,
      articles: 41,
      courses: 2,
    },
  },
  {
    id: 'user-6',
    username: 'lisadesign',
    displayName: 'Lisa Design',
    bio: 'Product designer focused on user research',
    level: 11,
    reputation: 1450,
    verified: false,
    isOnline: true,
    mutualFriends: 7,
    stats: {
      followers: 720,
      following: 290,
      articles: 19,
      courses: 1,
    },
  },
  {
    id: 'user-7',
    username: 'tomdevops',
    displayName: 'Tom DevOps',
    bio: 'DevOps engineer automating everything',
    level: 16,
    reputation: 2680,
    verified: true,
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    mutualFriends: 4,
    stats: {
      followers: 1120,
      following: 190,
      articles: 53,
      courses: 4,
    },
  },
  {
    id: 'user-8',
    username: 'annajs',
    displayName: 'Anna JavaScript',
    bio: 'JavaScript developer and tech blogger',
    level: 9,
    reputation: 890,
    verified: false,
    isOnline: true,
    mutualFriends: 9,
    stats: {
      followers: 450,
      following: 380,
      articles: 22,
      courses: 0,
    },
  },
  {
    id: 'user-9',
    username: 'chrisdata',
    displayName: 'Chris Data',
    bio: 'Data scientist exploring ML and AI',
    level: 13,
    reputation: 1780,
    verified: true,
    isOnline: false,
    lastSeen: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    mutualFriends: 2,
    stats: {
      followers: 840,
      following: 160,
      articles: 36,
      courses: 3,
    },
  },
  {
    id: 'user-10',
    username: 'sophiaweb',
    displayName: 'Sophia Web',
    bio: 'Web developer learning new technologies',
    level: 7,
    reputation: 560,
    verified: false,
    isOnline: true,
    mutualFriends: 11,
    stats: {
      followers: 280,
      following: 420,
      articles: 12,
      courses: 0,
    },
  },
  {
    id: 'user-11',
    username: 'jakecloud',
    displayName: 'Jake Cloud',
    bio: 'Cloud architect working with AWS and Azure',
    level: 17,
    reputation: 2950,
    verified: true,
    isOnline: false,
    lastSeen: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    mutualFriends: 5,
    stats: {
      followers: 1380,
      following: 140,
      articles: 58,
      courses: 6,
    },
  },
  {
    id: 'user-12',
    username: 'oliviafx',
    displayName: 'Olivia FX',
    bio: 'Frontend developer specializing in animations',
    level: 10,
    reputation: 1120,
    verified: false,
    isOnline: true,
    mutualFriends: 8,
    stats: {
      followers: 590,
      following: 310,
      articles: 24,
      courses: 1,
    },
  },
]

// Current user's friends
export const mockFriendships: Friendship[] = [
  {
    id: 'friendship-1',
    user: mockUsers[0], // Current user (placeholder)
    friend: mockUsers[0], // alexdev
    createdAt: '2024-06-15T10:00:00Z',
    isFavorite: true,
    tags: ['work', 'react'],
  },
  {
    id: 'friendship-2',
    user: mockUsers[0],
    friend: mockUsers[1], // sarahui
    createdAt: '2024-07-20T14:30:00Z',
    isFavorite: true,
    tags: ['design', 'collaboration'],
  },
  {
    id: 'friendship-3',
    user: mockUsers[0],
    friend: mockUsers[2], // mikebackend
    createdAt: '2024-05-10T09:15:00Z',
    isFavorite: false,
    tags: ['backend', 'mentor'],
  },
  {
    id: 'friendship-4',
    user: mockUsers[0],
    friend: mockUsers[3], // emmareact
    createdAt: '2024-08-05T16:45:00Z',
    isFavorite: false,
    tags: ['react', 'opensource'],
  },
  {
    id: 'friendship-5',
    user: mockUsers[0],
    friend: mockUsers[4], // davidmobile
    createdAt: '2024-04-22T11:20:00Z',
    isFavorite: false,
    tags: ['mobile'],
  },
  {
    id: 'friendship-6',
    user: mockUsers[0],
    friend: mockUsers[5], // lisadesign
    createdAt: '2024-09-12T13:00:00Z',
    isFavorite: true,
    tags: ['design', 'ux'],
  },
  {
    id: 'friendship-7',
    user: mockUsers[0],
    friend: mockUsers[6], // tomdevops
    createdAt: '2024-03-18T08:30:00Z',
    isFavorite: false,
    tags: ['devops'],
  },
  {
    id: 'friendship-8',
    user: mockUsers[0],
    friend: mockUsers[7], // annajs
    createdAt: '2024-10-01T15:10:00Z',
    isFavorite: false,
    tags: ['javascript'],
  },
]

// Received friend requests
export const mockReceivedRequests: FriendRequest[] = [
  {
    id: 'request-1',
    sender: mockUsers[8], // chrisdata
    receiver: mockUsers[0], // Current user
    status: 'pending',
    message: 'Hey! I really enjoyed your article on React performance. Would love to connect!',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'request-2',
    sender: mockUsers[9], // sophiaweb
    receiver: mockUsers[0],
    status: 'pending',
    message: 'Hi! We have many mutual friends. Let\'s connect!',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'request-3',
    sender: mockUsers[10], // jakecloud
    receiver: mockUsers[0],
    status: 'pending',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

// Sent friend requests
export const mockSentRequests: FriendRequest[] = [
  {
    id: 'request-4',
    sender: mockUsers[0], // Current user
    receiver: mockUsers[11], // oliviafx
    status: 'pending',
    message: 'Love your animation work! Would be great to connect and learn from you.',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
]

// Friend suggestions
export const mockSuggestions: FriendSuggestion[] = [
  {
    user: mockUsers[8], // chrisdata
    reason: 'mutual_friends',
    mutualFriends: [mockUsers[0], mockUsers[2]],
    score: 95,
  },
  {
    user: mockUsers[9], // sophiaweb
    reason: 'mutual_friends',
    mutualFriends: [mockUsers[0], mockUsers[1], mockUsers[3]],
    score: 92,
  },
  {
    user: mockUsers[10], // jakecloud
    reason: 'same_interests',
    commonTags: ['devops', 'cloud', 'backend'],
    score: 88,
  },
  {
    user: mockUsers[11], // oliviafx
    reason: 'same_interests',
    commonTags: ['frontend', 'react', 'design'],
    score: 85,
  },
]

// Friend activity feed
export const mockFriendActivity: FriendActivity[] = [
  {
    id: 'activity-1',
    friend: mockUsers[0], // alexdev
    type: 'article_published',
    title: 'Published "Advanced React Patterns"',
    description: 'A deep dive into advanced React patterns and best practices',
    link: '/article/123',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
  },
  {
    id: 'activity-2',
    friend: mockUsers[1], // sarahui
    type: 'achievement_unlocked',
    title: 'Unlocked "Design Master" achievement',
    description: 'Reached 50 published design articles',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'activity-3',
    friend: mockUsers[3], // emmareact
    type: 'level_up',
    title: 'Reached Level 10',
    description: 'Congratulations on leveling up!',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: 'activity-4',
    friend: mockUsers[5], // lisadesign
    type: 'course_created',
    title: 'Created "UX Research Fundamentals" course',
    description: 'Learn the basics of user experience research',
    link: '/courses/ux-research-fundamentals',
    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
  },
  {
    id: 'activity-5',
    friend: mockUsers[6], // tomdevops
    type: 'article_published',
    title: 'Published "Docker Best Practices"',
    description: 'Essential Docker practices for production environments',
    link: '/article/456',
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
  },
  {
    id: 'activity-6',
    friend: mockUsers[7], // annajs
    type: 'article_published',
    title: 'Published "JavaScript ES2024 Features"',
    description: 'Exploring the latest JavaScript features',
    link: '/article/789',
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
]

// Friend statistics
export const mockFriendStats: FriendStats = {
  totalFriends: mockFriendships.length,
  onlineFriends: mockFriendships.filter((f) => f.friend.isOnline).length,
  pendingRequests: mockReceivedRequests.length,
  sentRequests: mockSentRequests.length,
  mutualFriends: 15,
  recentActivity: mockFriendActivity.length,
}


/**
 * GraphQL Schema
 * Полная схема для Aetheris platform
 */
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # ============================================
  # ENUMS
  # ============================================
  enum ReactionType {
    like
    dislike
  }

  enum Difficulty {
    easy
    medium
    hard
  }

  enum UserRole {
    user
    admin
  }

  enum NotificationType {
    comment
    comment_reply
    follow
    article_published
    article_like
    comment_like
  }

  # ============================================
  # TYPES
  # ============================================
  type User {
    id: ID!
    email: String!
    username: String!
    name: String!
    bio: String
    avatar: String
    coverImage: String
    provider: String!
    confirmed: Boolean!
    blocked: Boolean!
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relationships
    articles: [Article!]!
    comments: [Comment!]!
    articleReactions: [ArticleReaction!]!
    commentReactions: [CommentReaction!]!
    bookmarks: [Bookmark!]!
    following: [Follow!]!
    followers: [Follow!]!
    notifications: [Notification!]!
  }

  type Article {
    id: ID!
    title: String!
    content: JSON!
    excerpt: String!
    author: User!
    tags: [String!]!
    difficulty: Difficulty!
    previewImage: String
    likesCount: Int!
    dislikesCount: Int!
    views: Int!
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relationships
    comments: [Comment!]!
    reactions: [ArticleReaction!]!
    bookmarks: [Bookmark!]!

    # Computed fields
    userReaction: ReactionType
  }

  type Comment {
    id: ID!
    text: String!
    article: Article!
    author: User!
    parent: Comment
    children: [Comment!]!
    likesCount: Int!
    dislikesCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relationships
    reactions: [CommentReaction!]!

    # Computed fields
    userReaction: ReactionType
  }

  type ArticleReaction {
    id: ID!
    article: Article!
    user: User!
    reaction: ReactionType!
    createdAt: DateTime!
  }

  type CommentReaction {
    id: ID!
    comment: Comment!
    user: User!
    reaction: ReactionType!
    createdAt: DateTime!
  }

  type Bookmark {
    id: ID!
    user: User!
    article: Article!
    createdAt: DateTime!
  }

  type Follow {
    id: ID!
    follower: User!
    following: User!
    createdAt: DateTime!
  }

  type Notification {
    id: ID!
    user: User!
    type: NotificationType!
    actor: User!
    article: Article
    comment: Comment
    isRead: Boolean!
    readAt: DateTime
    metadata: JSON
    createdAt: DateTime!
  }

  # ============================================
  # INPUT TYPES
  # ============================================
  input CreateArticleInput {
    title: String!
    content: JSON!
    excerpt: String!
    tags: [String!]!
    difficulty: Difficulty!
    previewImage: String
    publishedAt: DateTime
  }

  input UpdateArticleInput {
    title: String
    content: JSON
    excerpt: String
    tags: [String!]
    difficulty: Difficulty
    previewImage: String
    publishedAt: DateTime
  }

  input CreateCommentInput {
    articleId: ID!
    text: String!
    parentId: ID
  }

  input UpdateProfileInput {
    username: String
    bio: String
    avatar: String
    coverImage: String
  }

  input SearchArticlesInput {
    search: String
    tags: [String!]
    difficulty: Difficulty
    sort: String
    skip: Int
    take: Int
  }

  # ============================================
  # QUERIES
  # ============================================
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(skip: Int, take: Int): [User!]!

    # Article queries
    article(id: ID!): Article
    articles(skip: Int, take: Int, authorId: ID, published: Boolean): [Article!]!
    searchArticles(input: SearchArticlesInput!): SearchArticlesResult!

    # Comment queries
    comment(id: ID!): Comment
    comments(articleId: ID!, skip: Int, take: Int): [Comment!]!

    # Notification queries
    notifications(skip: Int, take: Int, unreadOnly: Boolean): [Notification!]!
    notificationCount(unreadOnly: Boolean): Int!

    # Relationship queries
    bookmarks(skip: Int, take: Int): [Bookmark!]!
    following(userId: ID!): [User!]!
    followers(userId: ID!): [User!]!
  }

  # ============================================
  # MUTATIONS
  # ============================================
  type Mutation {
    # Article mutations
    createArticle(input: CreateArticleInput!): Article!
    updateArticle(id: ID!, input: UpdateArticleInput!): Article!
    deleteArticle(id: ID!): Boolean!

    # Comment mutations
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, text: String!): Comment!
    deleteComment(id: ID!): Boolean!

    # Reaction mutations
    reactToArticle(articleId: ID!, reaction: ReactionType!): Article!
    reactToComment(commentId: ID!, reaction: ReactionType!): Comment!

    # Bookmark mutations
    toggleBookmark(articleId: ID!): Bookmark

    # Follow mutations
    followUser(userId: ID!): Follow!
    unfollowUser(userId: ID!): Boolean!

    # Profile mutations
    updateProfile(input: UpdateProfileInput!): User!

    # Notification mutations
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
    deleteNotification(id: ID!): Boolean!
  }

  # ============================================
  # RESULT TYPES
  # ============================================
  type SearchArticlesResult {
    articles: [Article!]!
    total: Int!
  }
`;


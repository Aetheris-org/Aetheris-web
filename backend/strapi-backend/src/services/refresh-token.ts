import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from './session-store';

const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export interface RefreshTokenData {
  userId: number;
  createdAt: number;
}

/**
 * Refresh Token Service
 * Manages long-lived refresh tokens stored in Redis
 * 
 * Security features:
 * - 7-day expiry
 * - Stored in Redis (separate from access tokens)
 * - UUID-based tokens (cryptographically random)
 * - One-time use (deleted after refresh)
 */
export const refreshTokenService = {
  /**
   * Generates a new refresh token for a user
   * @param userId - User ID
   * @returns Refresh token string
   */
  async create(userId: number): Promise<string> {
    const refreshToken = uuidv4();
    const key = REFRESH_TOKEN_PREFIX + refreshToken;
    
    const data: RefreshTokenData = {
      userId,
      createdAt: Date.now(),
    };
    
    await sessionStore.set(key, JSON.stringify(data), REFRESH_TOKEN_TTL);
    
    console.log(`✅ Refresh token created for user ${userId} (expires in 7 days)`);
    return refreshToken;
  },

  /**
   * Validates and consumes a refresh token (one-time use)
   * @param refreshToken - Refresh token string
   * @returns User ID if valid, null otherwise
   */
  async validate(refreshToken: string): Promise<number | null> {
    const key = REFRESH_TOKEN_PREFIX + refreshToken;
    const data = await sessionStore.get(key);
    
    if (!data) {
      console.warn(`⚠️  Invalid or expired refresh token: ${refreshToken.substring(0, 8)}...`);
      return null;
    }
    
    // Delete token after use (one-time use for security)
    await sessionStore.delete(key);
    
    const tokenData: RefreshTokenData = JSON.parse(data);
    console.log(`✅ Refresh token validated for user ${tokenData.userId}`);
    
    return tokenData.userId;
  },

  /**
   * Revokes a refresh token (e.g., on logout)
   * @param refreshToken - Refresh token string
   */
  async revoke(refreshToken: string): Promise<void> {
    const key = REFRESH_TOKEN_PREFIX + refreshToken;
    await sessionStore.delete(key);
    console.log(`🔒 Refresh token revoked: ${refreshToken.substring(0, 8)}...`);
  },

  /**
   * Revokes all refresh tokens for a user
   * Note: This requires scanning all keys, which is expensive
   * For production, consider maintaining a user->token mapping
   */
  async revokeAllForUser(userId: number): Promise<void> {
    // For now, we'll just log this
    // In production, you'd want to maintain a user->tokens mapping in Redis
    console.log(`🔒 Request to revoke all tokens for user ${userId} (not implemented)`);
  },
};


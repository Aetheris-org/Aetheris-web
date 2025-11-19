/**
 * Passport.js configuration for OAuth2
 * Настройка Google OAuth2 стратегии
 */
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import logger from '../lib/logger';

// Google OAuth2 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      // ВАЖНО: callbackURL должен указывать на BACKEND, а не frontend!
      // Google будет редиректить на этот URL после авторизации
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:1337/api/connect/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Проверяем наличие email (обязательно для OAuth)
        const email = profile.emails?.[0]?.value;
        if (!email) {
          logger.error('Google OAuth: No email in profile', {
            profileId: profile.id,
            emails: profile.emails,
          });
          return done(new Error('Email is required for OAuth authentication'), null);
        }

        logger.info(`Google OAuth callback: ${profile.id}, ${email}`);
        
        const userProfile = {
          id: profile.id,
          email: email, // Теперь гарантированно есть
          displayName: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          provider: 'google',
        };
        
        return done(null, userProfile);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// JWT Strategy для API аутентификации
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'change-me-in-production',
    },
    async (payload, done) => {
      try {
        // TODO: Проверить пользователя в базе данных через KeystoneJS
        // payload содержит { id, email, username } из JWT токена
        
        logger.info(`JWT authentication: ${payload.id}`);
        
        // Временная заглушка
        const user = {
          id: payload.id,
          email: payload.email,
          username: payload.username,
        };
        
        return done(null, user);
      } catch (error) {
        logger.error('JWT authentication error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    // TODO: Найти пользователя в базе данных через KeystoneJS
    logger.info(`Deserialize user: ${id}`);
    done(null, { id });
  } catch (error) {
    logger.error('Deserialize user error:', error);
    done(error, null);
  }
});

logger.info('✅ Passport.js configured');

export default passport;


/**
 * Passport.js configuration
 * Настройка OAuth2 стратегий для аутентификации
 */
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import logger from '../lib/logger';

// Проверяем наличие обязательных переменных окружения
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:1337/api/connect/google/callback';

if (!googleClientId || !googleClientSecret) {
  logger.warn('⚠️ Google OAuth credentials not configured. Google OAuth will not work.');
  logger.warn('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
} else {
  // Настройка Google OAuth стратегии
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Извлекаем email из профиля Google
          // Google может вернуть email в разных полях
          const email = profile.emails?.[0]?.value || profile.email;
          
          if (!email) {
            logger.error('Google OAuth: No email in profile', {
              profileId: profile.id,
              hasEmails: !!profile.emails && profile.emails.length > 0,
            });
            return done(new Error('No email in Google profile'), null);
          }

          // Извлекаем имя пользователя
          const displayName = profile.displayName || profile.name?.givenName || email.split('@')[0];
          
          // Извлекаем аватар
          const avatar = profile.photos?.[0]?.value || undefined;

          // Возвращаем объект пользователя для обработки в callback
          const user = {
            id: profile.id,
            email: email,
            displayName: displayName,
            avatar: avatar,
            provider: 'google',
          };

          logger.debug('Google OAuth profile processed:', {
            id: user.id,
            email: email.substring(0, 5) + '...', // Логируем только часть email для безопасности
            displayName: user.displayName,
            hasAvatar: !!user.avatar,
          });

          return done(null, user);
        } catch (error) {
          logger.error('Error processing Google OAuth profile:', error);
          return done(error, null);
        }
      }
    )
  );

  logger.info('✅ Google OAuth strategy configured');
}

// Сериализация пользователя для сессии
// В нашем случае мы не сохраняем полный объект пользователя в сессии
// Вместо этого используем KeystoneJS сессии
passport.serializeUser((user: any, done) => {
  // Сохраняем только минимальную информацию
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  // Возвращаем пользователя из сессии
  done(null, user);
});

export default passport;






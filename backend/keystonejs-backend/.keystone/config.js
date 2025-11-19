"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default
});
module.exports = __toCommonJS(keystone_exports);
var import_config = require("dotenv/config");
var import_core7 = require("@keystone-6/core");

// schemas/User.ts
var import_core = require("@keystone-6/core");
var import_fields = require("@keystone-6/core/fields");

// src/access-control.ts
function isReactionOwner({ session: session2, item }) {
  if (!session2?.itemId) return false;
  return String(item.user?.id || item.user) === String(session2.itemId);
}
function isCommentOwner({ session: session2, item }) {
  if (!session2?.itemId) return false;
  return String(item.author?.id || item.author) === String(session2.itemId);
}
function isArticleOwner({ session: session2, item }) {
  if (!session2?.itemId) return false;
  return String(item.author?.id || item.author) === String(session2.itemId);
}
var accessControl = {
  User: {
    operation: {
      query: () => {
        return true;
      },
      create: () => {
        return true;
      },
      update: ({ session: session2, item }) => {
        if (!session2?.itemId) return false;
        const sessionData = session2.data;
        if (sessionData?.role === "admin") return true;
        return String(item.id) === String(session2.itemId);
      },
      delete: ({ session: session2, item }) => {
        if (!session2?.itemId) return false;
        const sessionData = session2.data;
        return sessionData?.role === "admin";
      }
    },
    filter: {
      query: ({ session: session2 }) => {
        if (!session2?.itemId) return true;
        const sessionData = session2.data;
        if (sessionData?.role === "admin") return true;
        return true;
      }
    }
  },
  Article: {
    operation: {
      query: () => true,
      // Чтение статей - публично (фильтр ограничит доступ)
      create: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      update: ({ session: session2, item }) => {
        return isArticleOwner({ session: session2, item });
      },
      delete: ({ session: session2, item }) => {
        return isArticleOwner({ session: session2, item });
      }
    },
    filter: {
      query: ({ session: session2 }) => {
        if (!session2?.itemId) {
          return {
            publishedAt: { not: null }
          };
        }
        return {
          OR: [
            { publishedAt: { not: null } },
            { author: { id: { equals: session2.itemId } } }
          ]
        };
      }
    }
  },
  Comment: {
    operation: {
      query: () => true,
      // Чтение комментариев - публично
      create: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      update: ({ session: session2, item }) => {
        return isCommentOwner({ session: session2, item });
      },
      delete: ({ session: session2, item }) => {
        return isCommentOwner({ session: session2, item });
      }
    },
    filter: {
      query: () => true
      // Все видят все комментарии
    }
  },
  ArticleReaction: {
    operation: {
      query: () => true,
      // Чтение реакций - публично
      create: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      update: ({ session: session2, item }) => {
        return isReactionOwner({ session: session2, item });
      },
      delete: ({ session: session2, item }) => {
        return isReactionOwner({ session: session2, item });
      }
    },
    filter: {
      query: () => true
      // Все видят все реакции
    }
  },
  CommentReaction: {
    operation: {
      query: () => true,
      // Чтение реакций - публично
      create: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      update: ({ session: session2, item }) => {
        return isReactionOwner({ session: session2, item });
      },
      delete: ({ session: session2, item }) => {
        return isReactionOwner({ session: session2, item });
      }
    },
    filter: {
      query: () => true
      // Все видят все реакции
    }
  }
};

// schemas/User.ts
var User = (0, import_core.list)({
  access: accessControl.User,
  hooks: {
    // ВАЖНО: Автоматическое назначение роли 'admin' УБРАНО из соображений безопасности
    // Роль 'admin' может быть назначена ТОЛЬКО через защищенный endpoint /api/setup/initial
    // или вручную существующим администратором через Admin UI
    resolveInput: async ({ resolvedData, operation, context }) => {
      if (operation === "create") {
        if (!resolvedData.role) {
          resolvedData.role = "user";
        }
        if (!resolvedData.provider || resolvedData.provider === "local") {
          if (!resolvedData.password) {
            throw new Error("Password is required for local users");
          }
        }
      }
      return resolvedData;
    }
  },
  fields: {
    name: (0, import_fields.text)({ validation: { isRequired: true } }),
    email: (0, import_fields.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    password: (0, import_fields.password)({
      // Password обязателен для локальных пользователей
      // Для OAuth пользователей можно оставить пустым
      validation: { isRequired: false }
      // KeystoneJS автоматически хеширует пароль при сохранении
    }),
    username: (0, import_fields.text)({
      validation: { isRequired: true, length: { min: 3, max: 50 } },
      isIndexed: "unique"
    }),
    bio: (0, import_fields.text)(),
    avatar: (0, import_fields.text)(),
    // URL строки (от imgBB или Cloudinary)
    coverImage: (0, import_fields.text)(),
    // URL строки (от imgBB или Cloudinary)
    provider: (0, import_fields.select)({
      type: "string",
      options: [
        { label: "Local", value: "local" },
        { label: "Google", value: "google" }
      ],
      defaultValue: "local"
    }),
    confirmed: (0, import_fields.checkbox)({
      defaultValue: false
    }),
    blocked: (0, import_fields.checkbox)({
      defaultValue: false
    }),
    role: (0, import_fields.select)({
      type: "string",
      options: [
        { label: "User", value: "user" },
        { label: "Admin", value: "admin" }
      ],
      defaultValue: "user",
      validation: { isRequired: true }
    }),
    articles: (0, import_fields.relationship)({
      ref: "Article.author",
      many: true
    }),
    comments: (0, import_fields.relationship)({
      ref: "Comment.author",
      many: true
    }),
    articleReactions: (0, import_fields.relationship)({
      ref: "ArticleReaction.user",
      many: true
    }),
    commentReactions: (0, import_fields.relationship)({
      ref: "CommentReaction.user",
      many: true
    }),
    createdAt: (0, import_fields.timestamp)({
      defaultValue: { kind: "now" }
    }),
    updatedAt: (0, import_fields.timestamp)({
      defaultValue: { kind: "now" }
    })
  }
});

// schemas/Article.ts
var import_core2 = require("@keystone-6/core");
var import_fields2 = require("@keystone-6/core/fields");
var import_fields_document = require("@keystone-6/fields-document");
var Article = (0, import_core2.list)({
  access: accessControl.Article,
  fields: {
    title: (0, import_fields2.text)({
      validation: { isRequired: true, length: { min: 10, max: 200 } },
      isIndexed: true
    }),
    content: (0, import_fields_document.document)({
      formatting: true,
      dividers: true,
      links: true,
      layouts: [
        [1, 1],
        [1, 1, 1]
      ]
    }),
    excerpt: (0, import_fields2.text)({
      validation: { length: { max: 500 } }
    }),
    author: (0, import_fields2.relationship)({
      ref: "User.articles",
      many: false,
      validation: { isRequired: true }
    }),
    tags: (0, import_fields2.json)(),
    difficulty: (0, import_fields2.select)({
      type: "string",
      options: [
        { label: "Easy", value: "easy" },
        { label: "Medium", value: "medium" },
        { label: "Hard", value: "hard" }
      ],
      defaultValue: "medium",
      validation: { isRequired: true }
    }),
    previewImage: (0, import_fields2.text)(),
    // URL строки (от imgBB или Cloudinary)
    likes_count: (0, import_fields2.integer)({
      defaultValue: 0,
      validation: { min: 0 }
    }),
    dislikes_count: (0, import_fields2.integer)({
      defaultValue: 0,
      validation: { min: 0 }
    }),
    views: (0, import_fields2.integer)({
      defaultValue: 0,
      validation: { min: 0 }
    }),
    comments: (0, import_fields2.relationship)({
      ref: "Comment.article",
      many: true
    }),
    reactions: (0, import_fields2.relationship)({
      ref: "ArticleReaction.article",
      many: true
    }),
    publishedAt: (0, import_fields2.timestamp)(),
    createdAt: (0, import_fields2.timestamp)({
      defaultValue: { kind: "now" }
    }),
    updatedAt: (0, import_fields2.timestamp)({
      defaultValue: { kind: "now" }
    })
  }
});

// schemas/Comment.ts
var import_core3 = require("@keystone-6/core");
var import_fields3 = require("@keystone-6/core/fields");
var Comment = (0, import_core3.list)({
  access: accessControl.Comment,
  fields: {
    text: (0, import_fields3.text)({
      validation: { isRequired: true, length: { min: 1, max: 1e4 } }
    }),
    article: (0, import_fields3.relationship)({
      ref: "Article.comments",
      many: false,
      validation: { isRequired: true }
    }),
    author: (0, import_fields3.relationship)({
      ref: "User.comments",
      many: false,
      validation: { isRequired: true }
    }),
    parent: (0, import_fields3.relationship)({
      ref: "Comment",
      many: false
    }),
    likes_count: (0, import_fields3.integer)({
      defaultValue: 0,
      validation: { min: 0 }
    }),
    dislikes_count: (0, import_fields3.integer)({
      defaultValue: 0,
      validation: { min: 0 }
    }),
    reactions: (0, import_fields3.relationship)({
      ref: "CommentReaction.comment",
      many: true
    }),
    createdAt: (0, import_fields3.timestamp)({
      defaultValue: { kind: "now" }
    }),
    updatedAt: (0, import_fields3.timestamp)({
      defaultValue: { kind: "now" }
    })
  }
});

// schemas/ArticleReaction.ts
var import_core4 = require("@keystone-6/core");
var import_fields4 = require("@keystone-6/core/fields");
var ArticleReaction = (0, import_core4.list)({
  access: accessControl.ArticleReaction,
  fields: {
    article: (0, import_fields4.relationship)({
      ref: "Article.reactions",
      many: false,
      validation: { isRequired: true }
    }),
    user: (0, import_fields4.relationship)({
      ref: "User.articleReactions",
      many: false,
      validation: { isRequired: true }
    }),
    reaction: (0, import_fields4.select)({
      type: "string",
      options: [
        { label: "Like", value: "like" },
        { label: "Dislike", value: "dislike" }
      ],
      validation: { isRequired: true }
    }),
    createdAt: (0, import_fields4.timestamp)({
      defaultValue: { kind: "now" }
    })
  }
});

// schemas/CommentReaction.ts
var import_core5 = require("@keystone-6/core");
var import_fields5 = require("@keystone-6/core/fields");
var CommentReaction = (0, import_core5.list)({
  access: accessControl.CommentReaction,
  fields: {
    comment: (0, import_fields5.relationship)({
      ref: "Comment.reactions",
      many: false,
      validation: { isRequired: true }
    }),
    user: (0, import_fields5.relationship)({
      ref: "User.commentReactions",
      many: false,
      validation: { isRequired: true }
    }),
    reaction: (0, import_fields5.select)({
      type: "string",
      options: [
        { label: "Like", value: "like" },
        { label: "Dislike", value: "dislike" }
      ],
      validation: { isRequired: true }
    }),
    createdAt: (0, import_fields5.timestamp)({
      defaultValue: { kind: "now" }
    })
  }
});

// schemas/index.ts
var lists = {
  User,
  Article,
  Comment,
  ArticleReaction,
  CommentReaction
};

// src/auth/auth.ts
var import_session = require("@keystone-6/core/session");
var import_auth = require("@keystone-6/auth");

// src/lib/logger.ts
var import_winston = __toESM(require("winston"));
var import_winston_daily_rotate_file = __toESM(require("winston-daily-rotate-file"));
var import_fs = require("fs");
var logFormat = import_winston.default.format.combine(
  import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  import_winston.default.format.errors({ stack: true }),
  import_winston.default.format.splat(),
  import_winston.default.format.json()
);
var consoleFormat = import_winston.default.format.combine(
  import_winston.default.format.colorize(),
  import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  import_winston.default.format.printf(({ timestamp: timestamp6, level, message, ...meta }) => {
    let msg = `${timestamp6} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);
var fileRotateTransport = new import_winston_daily_rotate_file.default({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat
});
var errorFileRotateTransport = new import_winston_daily_rotate_file.default({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
  format: logFormat
});
var logger = import_winston.default.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format: logFormat,
  defaultMeta: { service: "keystonejs-backend" },
  transports: [
    fileRotateTransport,
    errorFileRotateTransport,
    new import_winston.default.transports.Console({
      format: consoleFormat
    })
  ],
  exceptionHandlers: [
    new import_winston.default.transports.File({ filename: "logs/exceptions.log" })
  ],
  rejectionHandlers: [
    new import_winston.default.transports.File({ filename: "logs/rejections.log" })
  ]
});
if (!(0, import_fs.existsSync)("logs")) {
  (0, import_fs.mkdirSync)("logs", { recursive: true });
}
var logger_default = logger;

// src/auth/auth.ts
var session = (0, import_session.statelessSessions)({
  secret: process.env.SESSION_SECRET || "change-me-in-production",
  maxAge: 7 * 24 * 60 * 60
  // 7 дней
  // Явно указываем имя cookie для совместимости
  // По умолчанию KeystoneJS использует 'keystonejs-session'
});
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  sessionData: "id email username role",
  passwordResetLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      logger_default.info(`Password reset token for ${identity}: ${token}`);
    },
    tokensValidForMins: 60
  },
  magicAuthLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      logger_default.info(`Magic auth token for ${identity}: ${token}`);
    },
    tokensValidForMins: 60
  }
});
logger_default.info("\u2705 KeystoneJS authentication configured");

// src/middlewares/index.ts
var import_express = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));
var import_compression = __toESM(require("compression"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_express_session = __toESM(require("express-session"));
var import_connect_redis = __toESM(require("connect-redis"));
var import_morgan = __toESM(require("morgan"));
var import_passport2 = __toESM(require("passport"));
var import_multer = __toESM(require("multer"));

// src/lib/redis.ts
var import_ioredis = __toESM(require("ioredis"));
var redisClient = null;
function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }
  const host = process.env.REDIS_HOST || "localhost";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);
  const password2 = process.env.REDIS_PASSWORD || void 0;
  redisClient = new import_ioredis.default({
    host,
    port,
    password: password2,
    retryStrategy: (times) => {
      if (times > 3) {
        logger_default.warn("Redis connection failed after 3 attempts, using in-memory fallback");
        return null;
      }
      const delay = Math.min(times * 50, 2e3);
      logger_default.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 2e3
    // Таймаут подключения 2 секунды
  });
  redisClient.on("connect", () => {
    logger_default.info("\u2705 Redis client connected");
  });
  redisClient.on("error", (error) => {
    logger_default.error("\u274C Redis client error:", error);
  });
  redisClient.on("close", () => {
    logger_default.warn("\u26A0\uFE0F Redis connection closed");
  });
  redisClient.on("reconnecting", () => {
    logger_default.info("\u{1F504} Redis reconnecting...");
  });
  process.on("SIGTERM", async () => {
    await redisClient?.quit();
  });
  process.on("SIGINT", async () => {
    await redisClient?.quit();
  });
  return redisClient;
}
async function getRedisClientWithFallback() {
  try {
    const client = getRedisClient();
    await client.ping();
    return client;
  } catch (error) {
    logger_default.warn("\u26A0\uFE0F Redis unavailable, using in-memory fallback");
    return null;
  }
}

// src/auth/oauth-handler.ts
async function findOrCreateGoogleUser(context, profile) {
  try {
    const email = profile.email;
    if (!email) {
      logger_default.error("Google OAuth: No email in profile", { profile });
      return null;
    }
    const existingUser = await context.sudo().query.User.findMany({
      where: { email: { equals: email } },
      query: "id email username name avatar provider confirmed",
      take: 1
    });
    if (existingUser.length > 0) {
      const user = existingUser[0];
      const updateData = {};
      if (profile.displayName && user.name !== profile.displayName) {
        updateData.name = profile.displayName;
      }
      if (profile.avatar && user.avatar !== profile.avatar) {
        updateData.avatar = profile.avatar;
      }
      if (user.provider !== "google") {
        updateData.provider = "google";
      }
      if (user.confirmed !== true) {
        updateData.confirmed = true;
      }
      if (Object.keys(updateData).length > 0) {
        await context.sudo().query.User.updateOne({
          where: { id: user.id },
          data: updateData
        });
        logger_default.info(`Updated Google OAuth user: ${user.id}`);
      }
      return {
        id: String(user.id),
        email: user.email,
        username: user.username,
        name: user.name || profile.displayName,
        avatar: user.avatar || profile.avatar
      };
    }
    const baseUsername = profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20) || email.split("@")[0].substring(0, 20);
    let username = baseUsername;
    let counter = 1;
    while (true) {
      const existing = await context.sudo().query.User.findMany({
        where: { username: { equals: username } },
        take: 1
      });
      if (existing.length === 0) {
        break;
      }
      username = `${baseUsername}${counter}`;
      counter++;
      if (counter > 100) {
        throw new Error("Could not generate unique username");
      }
    }
    const newUser = await context.sudo().query.User.createOne({
      data: {
        email,
        username,
        name: profile.displayName,
        avatar: profile.avatar || void 0,
        provider: "google",
        confirmed: true,
        blocked: false,
        role: "user"
        // Новые пользователи получают роль 'user' по умолчанию
        // password не требуется для OAuth пользователей
      },
      query: "id email username name avatar"
    });
    logger_default.info(`Created new Google OAuth user: ${newUser.id}`);
    return {
      id: String(newUser.id),
      email: newUser.email,
      username: newUser.username,
      name: newUser.name || profile.displayName,
      avatar: newUser.avatar || profile.avatar
    };
  } catch (error) {
    logger_default.error("Error in findOrCreateGoogleUser:", error);
    return null;
  }
}

// src/auth/passport.ts
var import_passport = __toESM(require("passport"));
var import_passport_google_oauth20 = require("passport-google-oauth20");
var import_passport_jwt = require("passport-jwt");
import_passport.default.use(
  new import_passport_google_oauth20.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // ВАЖНО: callbackURL должен указывать на BACKEND, а не frontend!
      // Google будет редиректить на этот URL после авторизации
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:1337/api/connect/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          logger_default.error("Google OAuth: No email in profile", {
            profileId: profile.id,
            emails: profile.emails
          });
          return done(new Error("Email is required for OAuth authentication"), null);
        }
        logger_default.info(`Google OAuth callback: ${profile.id}, ${email}`);
        const userProfile = {
          id: profile.id,
          email,
          // Теперь гарантированно есть
          displayName: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          provider: "google"
        };
        return done(null, userProfile);
      } catch (error) {
        logger_default.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);
import_passport.default.use(
  new import_passport_jwt.Strategy(
    {
      jwtFromRequest: import_passport_jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "change-me-in-production"
    },
    async (payload, done) => {
      try {
        logger_default.info(`JWT authentication: ${payload.id}`);
        const user = {
          id: payload.id,
          email: payload.email,
          username: payload.username
        };
        return done(null, user);
      } catch (error) {
        logger_default.error("JWT authentication error:", error);
        return done(error, null);
      }
    }
  )
);
import_passport.default.serializeUser((user, done) => {
  done(null, user.id);
});
import_passport.default.deserializeUser(async (id, done) => {
  try {
    logger_default.info(`Deserialize user: ${id}`);
    done(null, { id });
  } catch (error) {
    logger_default.error("Deserialize user error:", error);
    done(error, null);
  }
});
logger_default.info("\u2705 Passport.js configured");

// src/lib/security-logger.ts
function logSecurityEvent(event) {
  const timestamp6 = event.timestamp || /* @__PURE__ */ new Date();
  const logData = {
    type: event.type,
    ip: event.ip,
    email: event.email,
    userId: event.userId,
    userAgent: event.userAgent,
    reason: event.reason,
    timestamp: timestamp6.toISOString()
  };
  if (event.type === "login_failure" || event.type === "admin_access_denied" || event.type === "rate_limit_exceeded") {
    logger_default.warn(`\u{1F512} Security Event: ${event.type}`, logData);
  } else {
    logger_default.info(`\u{1F512} Security Event: ${event.type}`, logData);
  }
}
function logLoginAttempt(ip, email, userAgent) {
  logSecurityEvent({
    type: "login_attempt",
    ip,
    email,
    userAgent
  });
}
function logAdminAccessDenied(ip, userId, reason, userAgent) {
  logSecurityEvent({
    type: "admin_access_denied",
    ip,
    userId,
    reason,
    userAgent
  });
}
function logAdminAccessGranted(ip, userId, email, userAgent) {
  logSecurityEvent({
    type: "admin_access_granted",
    ip,
    userId,
    email,
    userAgent
  });
}
function logRateLimitExceeded(ip, endpoint, userAgent) {
  logSecurityEvent({
    type: "rate_limit_exceeded",
    ip,
    reason: `Rate limit exceeded for endpoint: ${endpoint}`,
    userAgent
  });
}

// src/middlewares/index.ts
var keystoneContext = null;
function setKeystoneContext(context) {
  keystoneContext = context;
}
async function extendExpressApp(app, context) {
  if (context) {
    setKeystoneContext(context);
  }
  const upload = (0, import_multer.default)({
    storage: import_multer.default.memoryStorage(),
    // Храним файл в памяти для отправки на ImgBB
    limits: {
      fileSize: 8 * 1024 * 1024
      // 8MB максимум
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp"
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(", ")}`));
      }
    }
  });
  app.use((req, res, next) => {
    if (req.path === "/api/upload/image" && req.method === "POST") {
      return next();
    }
    import_express.default.json()(req, res, next);
  });
  app.use((req, res, next) => {
    if (req.path === "/api/upload/image" && req.method === "POST") {
      return next();
    }
    import_express.default.urlencoded({ extended: true })(req, res, next);
  });
  const isDevelopment = process.env.NODE_ENV === "development";
  app.use(
    (0, import_helmet.default)({
      contentSecurityPolicy: isDevelopment ? false : {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'"
            // Требуется для Next.js
          ],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: [
            "'self'",
            "https://oauth2.googleapis.com",
            "https://www.googleapis.com"
          ]
        }
      },
      // Дополнительные security headers
      hsts: {
        maxAge: 31536e3,
        // 1 год
        includeSubDomains: true,
        preload: true
      },
      frameguard: {
        action: "deny"
        // Запрещаем встраивание в iframe (защита от clickjacking)
      },
      noSniff: true,
      // Запрещаем MIME type sniffing
      xssFilter: true,
      // XSS фильтр
      referrerPolicy: {
        policy: "strict-origin-when-cross-origin"
      }
    })
  );
  app.use(
    (0, import_cors.default)({
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        process.env.PUBLIC_URL || "http://localhost:1337"
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
  );
  app.use((0, import_compression.default)());
  const limiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    // 15 минут
    max: 100,
    // максимум 100 запросов с одного IP
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === "/api/graphql";
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: "Too many requests",
        message: "Too many requests from this IP, please try again later."
      });
    }
  });
  app.use("/api/", limiter);
  const oauthLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    max: 10,
    // Увеличиваем лимит для OAuth flow
    message: "Too many OAuth attempts, please try again later.",
    skip: (req) => {
      return req.path === "/api/auth/oauth/session";
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: "Too many OAuth attempts",
        message: "Too many OAuth attempts, please try again later."
      });
    }
  });
  app.use("/api/auth/", oauthLimiter);
  app.use("/api/connect/", oauthLimiter);
  const graphqlLoginLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    // 15 минут
    max: 10,
    // максимум 10 попыток входа с одного IP
    message: "Too many login attempts, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("authenticateUserWithPassword");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (login)", userAgent);
      res.status(429).json({
        error: "Too many login attempts",
        message: "Too many login attempts from this IP, please try again later."
      });
    }
  });
  const graphqlLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    // 15 минут
    max: 500,
    // максимум 500 GraphQL запросов с одного IP (Admin UI может делать много запросов)
    message: "Too many GraphQL requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return false;
      const query = req.body.query || "";
      return query.includes("authenticateUserWithPassword");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql", userAgent);
      res.status(429).json({
        error: "Too many GraphQL requests",
        message: "Too many requests from this IP, please try again later."
      });
    }
  });
  app.use("/api/graphql", graphqlLoginLimiter);
  app.use("/api/graphql", graphqlLimiter);
  if (process.env.NODE_ENV === "development") {
    app.use("/api/graphql", (req, res, next) => {
      const cookies = req.headers.cookie || "";
      const keystoneCookie = cookies.split(";").find((c) => c.trim().startsWith("keystonejs-session="));
      if (keystoneCookie) {
        const token = keystoneCookie.split("=")[1];
        logger_default.debug(`GraphQL request with keystonejs-session cookie: ${token.substring(0, 30)}...`);
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.decode(token, { complete: false });
          if (decoded) {
            logger_default.debug("Decoded JWT payload:", JSON.stringify(decoded, null, 2));
          }
        } catch (error) {
          logger_default.debug("Failed to decode JWT token:", error);
        }
      } else {
        logger_default.debug("GraphQL request WITHOUT keystonejs-session cookie");
      }
      next();
    });
  }
  const redisClient2 = await getRedisClientWithFallback();
  const sessionStore = redisClient2 ? new import_connect_redis.default({ client: redisClient2, prefix: "session:" }) : new import_express_session.default.MemoryStore();
  app.use(
    (0, import_express_session.default)({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "change-me-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 дней
      }
    })
  );
  app.use(import_passport2.default.initialize());
  app.use(import_passport2.default.session());
  app.get("/api/connect/google", async (req, res, next) => {
    try {
      const crypto = require("crypto");
      const state = crypto.randomBytes(32).toString("hex");
      req.session.oauthState = state;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            logger_default.error("Failed to save session with oauthState:", err);
            reject(err);
          } else {
            logger_default.debug("Session saved with oauthState:", state.substring(0, 20) + "...");
            resolve();
          }
        });
      });
      import_passport2.default.authenticate("google", {
        scope: ["profile", "email"],
        state
        // Google вернет этот state в callback
      })(req, res, next);
    } catch (error) {
      logger_default.error("OAuth initiation error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/auth/callback?error=oauth_init_failed`);
    }
  });
  app.get(
    "/api/connect/google/callback",
    // CSRF защита: проверяем state параметр ДО вызова passport.authenticate()
    // Passport.js может удалить state из query string после обработки
    (req, res, next) => {
      const receivedState = req.query.state;
      const savedState = req.session?.oauthState;
      logger_default.debug("OAuth callback state check:", {
        received: receivedState?.substring(0, 20) + "...",
        saved: savedState?.substring(0, 20) + "...",
        sessionId: req.session?.id,
        hasSession: !!req.session
      });
      if (!receivedState || !savedState || receivedState !== savedState) {
        logger_default.error("OAuth callback: CSRF protection failed - invalid state parameter", {
          received: receivedState,
          saved: savedState,
          ip: req.ip,
          sessionId: req.session?.id,
          hasSession: !!req.session
        });
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/auth/callback?error=csrf_protection_failed`);
      }
      delete req.session.oauthState;
      next();
    },
    import_passport2.default.authenticate("google", { failureRedirect: "/login?error=oauth_failed" }),
    async (req, res) => {
      try {
        const ctx = context || keystoneContext;
        if (!ctx) {
          logger_default.error("KeystoneJS context not available for OAuth callback");
          const frontendUrl2 = process.env.FRONTEND_URL || "http://localhost:5173";
          return res.redirect(`${frontendUrl2}/auth/callback?error=server_error`);
        }
        const user = req.user;
        if (!user || !user.email) {
          logger_default.error("OAuth callback: Invalid user data");
          const frontendUrl2 = process.env.FRONTEND_URL || "http://localhost:5173";
          return res.redirect(`${frontendUrl2}/auth/callback?error=invalid_user`);
        }
        const keystoneUser = await findOrCreateGoogleUser(ctx, user);
        if (!keystoneUser) {
          logger_default.error("OAuth callback: Failed to create/find user");
          const frontendUrl2 = process.env.FRONTEND_URL || "http://localhost:5173";
          return res.redirect(`${frontendUrl2}/auth/callback?error=user_creation_failed`);
        }
        req.session.oauthUserId = keystoneUser.id;
        req.session.oauthEmail = keystoneUser.email;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/auth/callback?oauth=success&userId=${keystoneUser.id}`);
      } catch (error) {
        logger_default.error("OAuth callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/auth/callback?error=server_error`);
      }
    }
  );
  app.post("/api/setup/initial", async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: "KeystoneJS context not available" });
      }
      const { z } = await import("zod");
      const setupSchema = z.object({
        email: z.string().email("Invalid email format").min(5).max(255),
        password: z.string().min(8, "Password must be at least 8 characters").max(128),
        username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
        name: z.string().min(1, "Name is required").max(100)
      });
      const validationResult = setupSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        return res.status(400).json({
          error: "Validation failed",
          details: errors
        });
      }
      const { email, password: password2, username, name } = validationResult.data;
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      try {
        const admin = await prisma.$transaction(async (tx) => {
          const existingUsers = await tx.user.findMany({ take: 1 });
          if (existingUsers.length > 0) {
            throw new Error("Initial setup already completed. Users exist in database.");
          }
          const bcrypt = await import("bcryptjs");
          const hashedPassword = await bcrypt.hash(password2, 10);
          const newAdmin = await tx.user.create({
            data: {
              email,
              password: hashedPassword,
              username,
              name,
              role: "admin",
              // Явно устанавливаем роль 'admin' (безопасно, т.к. внутри транзакции)
              provider: "local",
              confirmed: true,
              blocked: false
            }
          });
          return newAdmin;
        }, {
          isolationLevel: "Serializable"
          // Максимальная изоляция для SQLite (блокирует конкурентные запросы)
        });
        logger_default.info(`\u2705 First admin created via initial setup endpoint: ${admin.email}`);
        res.json({
          success: true,
          message: "First admin created successfully",
          user: {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            name: admin.name,
            role: admin.role
          }
        });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error) {
      logger_default.error("Initial setup error:", error);
      if (error.message?.includes("already completed")) {
        return res.status(400).json({
          error: "Initial setup already completed",
          message: error.message
        });
      }
      res.status(500).json({
        error: "Failed to create first admin",
        message: error.message
      });
    }
  });
  app.post("/api/auth/oauth/session", async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: "KeystoneJS context not available" });
      }
      const oauthUserId = req.session?.oauthUserId;
      if (!oauthUserId) {
        return res.status(400).json({ error: "OAuth session not found" });
      }
      const user = await ctx.query.User.findOne({
        where: { id: oauthUserId },
        query: "id email username role"
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const userId = String(user.id);
      const sessionData = {
        id: userId,
        email: user.email,
        username: user.username,
        role: user.role || "user"
      };
      try {
        const sessionContext = {
          ...ctx,
          res
          // Express response объект
        };
        const sessionToken = await ctx.sessionStrategy.start({
          context: sessionContext,
          data: {
            itemId: userId,
            listKey: "User",
            data: sessionData
          }
        });
        if (!sessionToken) {
          logger_default.error("Session token is null or undefined after creation");
          return res.status(500).json({ error: "Failed to create session token" });
        }
        logger_default.debug(`Session token created for user ${user.id}, token length: ${sessionToken.length}`);
      } catch (error) {
        logger_default.error("Error creating session token via sessionStrategy:", error);
        logger_default.error("Error stack:", error.stack);
        return res.status(500).json({ error: "Failed to create session token", details: error.message });
      }
      logger_default.info(`\u2705 OAuth session created for user: ${user.email}`);
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
      delete req.session.oauthUserId;
      delete req.session.oauthEmail;
    } catch (error) {
      logger_default.error("OAuth session creation error:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });
  app.post("/api/upload/image", upload.single("files"), async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: "KeystoneJS context not available" });
      }
      const sessionCookie = req.headers.cookie?.split(";").find((c) => c.trim().startsWith("keystonejs-session="));
      if (!sessionCookie) {
        logger_default.warn("Image upload attempted without session cookie");
        return res.status(401).json({ error: "Authentication required" });
      }
      logger_default.debug("Image upload request from authenticated user");
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }
      const file = req.file;
      logger_default.debug("Image upload request:", {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      const maxFileSize = 8 * 1024 * 1024;
      if (file.size > maxFileSize) {
        return res.status(400).json({
          error: `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`
        });
      }
      const imgbbApiKey = process.env.IMGBB_API_KEY;
      if (!imgbbApiKey) {
        logger_default.error("IMGBB_API_KEY not configured in environment variables");
        const publicUrl = process.env.PUBLIC_URL || "http://localhost:1337";
        const tempUrl = `${publicUrl}/uploads/${Date.now()}-${file.originalname}`;
        logger_default.warn("\u26A0\uFE0F ImgBB not configured, using temporary URL (not persisted)");
        return res.json([{
          id: Date.now().toString(),
          url: tempUrl,
          display_url: tempUrl,
          delete_url: null,
          size: file.size,
          width: null,
          height: null,
          mime: file.mimetype,
          name: file.originalname
        }]);
      }
      const base64Image = file.buffer.toString("base64");
      const formData = new URLSearchParams();
      formData.append("key", imgbbApiKey);
      formData.append("image", base64Image);
      if (file.originalname) {
        formData.append("name", file.originalname);
      }
      const https = await import("https");
      const timeoutMs = 3e4;
      try {
        const imgbbResponse = await new Promise((resolve, reject) => {
          const requestBody = formData.toString();
          let timeout;
          timeout = setTimeout(() => {
            reject(new Error("Request timeout"));
          }, timeoutMs);
          const req2 = https.request(
            {
              hostname: "api.imgbb.com",
              path: "/1/upload",
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(requestBody)
              }
            },
            (res2) => {
              let data = "";
              res2.on("data", (chunk) => {
                data += chunk;
              });
              res2.on("end", () => {
                clearTimeout(timeout);
                try {
                  const jsonData = JSON.parse(data);
                  resolve({
                    statusCode: res2.statusCode || 500,
                    data: jsonData
                  });
                } catch (parseError) {
                  reject(new Error(`Failed to parse response: ${parseError}`));
                }
              });
            }
          );
          req2.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
          });
          req2.on("timeout", () => {
            req2.destroy();
            clearTimeout(timeout);
            reject(new Error("Request timeout"));
          });
          req2.write(requestBody);
          req2.end();
        });
        if (imgbbResponse.statusCode < 200 || imgbbResponse.statusCode >= 300) {
          const errorText = typeof imgbbResponse.data === "string" ? imgbbResponse.data : JSON.stringify(imgbbResponse.data);
          logger_default.error("ImgBB API error:", {
            status: imgbbResponse.statusCode,
            error: errorText
          });
          return res.status(imgbbResponse.statusCode).json({
            error: "Image upload failed",
            details: process.env.NODE_ENV === "development" ? errorText : void 0
          });
        }
        const imgbbData = imgbbResponse.data;
        if (!imgbbData.success || !imgbbData.data) {
          const errorMessage = imgbbData.error?.message || "Unknown error";
          logger_default.error("ImgBB upload failed:", errorMessage);
          return res.status(400).json({
            error: "Image upload failed",
            details: process.env.NODE_ENV === "development" ? errorMessage : void 0
          });
        }
        logger_default.info("\u2705 Image uploaded successfully to ImgBB:", {
          url: imgbbData.data.url,
          size: imgbbData.data.size
        });
        res.json([{
          id: imgbbData.data.id || Date.now().toString(),
          url: imgbbData.data.url || imgbbData.data.display_url,
          display_url: imgbbData.data.display_url,
          delete_url: imgbbData.data.delete_url,
          size: imgbbData.data.size || file.size,
          width: imgbbData.data.width,
          height: imgbbData.data.height,
          mime: file.mimetype,
          name: file.originalname
        }]);
      } catch (uploadError) {
        logger_default.error("Failed to upload image to ImgBB:", uploadError);
        if (process.env.NODE_ENV === "development") {
          return res.status(500).json({
            error: "Image upload failed",
            details: uploadError.message || "Unknown error"
          });
        }
        return res.status(500).json({ error: "Image upload failed. Please try again." });
      }
    } catch (error) {
      logger_default.error("Image upload endpoint error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app.get("/api/auth/csrf", (req, res) => {
    res.json({ csrfToken: null });
  });
  app.post("/api/articles", async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: "KeystoneJS context not available" });
      }
      const sessionContext = {
        ...ctx,
        req,
        res
      };
      let sessionData;
      try {
        sessionData = await ctx.sessionStrategy.get({ context: sessionContext });
      } catch (sessionError) {
        logger_default.debug("Session check failed:", sessionError);
        return res.status(401).json({ error: "Invalid session" });
      }
      if (!sessionData || !sessionData.itemId) {
        logger_default.warn("Article creation attempted without valid session");
        return res.status(401).json({ error: "Authentication required" });
      }
      const userId = sessionData.itemId;
      const body = req.body?.data || req.body;
      if (!body.title || !body.content) {
        return res.status(400).json({ error: "Title and content are required" });
      }
      let contentDocument;
      if (typeof body.content === "string") {
        const htmlContent = body.content.trim();
        if (!htmlContent || htmlContent === "<p></p>" || htmlContent === "<p><br></p>") {
          contentDocument = {
            type: "doc",
            content: [
              {
                type: "paragraph"
              }
            ]
          };
        } else {
          let cleanHtml = htmlContent;
          if (cleanHtml.startsWith("<p>") && cleanHtml.endsWith("</p>")) {
            cleanHtml = cleanHtml.slice(3, -4);
          }
          const paragraphs = cleanHtml.split(/<\/p>\s*<p>|<\/p><p>/).filter((p) => p.trim());
          if (paragraphs.length === 0) {
            contentDocument = {
              type: "doc",
              content: [
                {
                  type: "paragraph"
                }
              ]
            };
          } else {
            const content = [];
            for (const para of paragraphs) {
              const cleanPara = para.replace(/^<p>|<\/p>$/g, "").trim();
              if (!cleanPara) {
                content.push({ type: "paragraph" });
                continue;
              }
              const textContent = cleanPara.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
              const lines = textContent.split("\n").filter((line) => line.trim() || textContent.includes("\n"));
              if (lines.length === 0) {
                content.push({ type: "paragraph" });
              } else {
                for (const line of lines) {
                  if (line.trim()) {
                    content.push({
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: line.trim()
                        }
                      ]
                    });
                  } else {
                    content.push({ type: "paragraph" });
                  }
                }
              }
            }
            contentDocument = {
              type: "doc",
              content: content.length > 0 ? content : [{ type: "paragraph" }]
            };
          }
        }
      } else if (body.content && typeof body.content === "object") {
        contentDocument = body.content;
      } else {
        contentDocument = {
          type: "doc",
          content: [
            {
              type: "paragraph"
            }
          ]
        };
      }
      const article = await ctx.sudo().query.Article.createOne({
        data: {
          title: body.title,
          content: contentDocument,
          excerpt: body.excerpt || null,
          author: { connect: { id: userId } },
          tags: body.tags || [],
          difficulty: body.difficulty || "medium",
          previewImage: body.preview_image || null,
          publishedAt: body.publishedAt || null
        },
        query: "id title content { document } excerpt author { id username avatar } tags difficulty previewImage likes_count dislikes_count views publishedAt createdAt updatedAt"
      });
      const response = {
        data: {
          id: String(article.id),
          attributes: {
            title: article.title,
            content: typeof article.content === "object" && article.content.document ? JSON.stringify(article.content.document) : article.content,
            excerpt: article.excerpt,
            author: {
              data: {
                id: article.author.id,
                attributes: {
                  username: article.author.username,
                  avatar: article.author.avatar
                }
              }
            },
            tags: article.tags,
            difficulty: article.difficulty,
            preview_image: article.previewImage,
            likes_count: article.likes_count,
            dislikes_count: article.dislikes_count,
            views: article.views,
            publishedAt: article.publishedAt,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt
          }
        }
      };
      res.status(201).json(response);
    } catch (error) {
      logger_default.error("Failed to create article:", error);
      res.status(500).json({
        error: "Failed to create article",
        details: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app.put("/api/articles/:id", async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: "KeystoneJS context not available" });
      }
      const sessionContext = {
        ...ctx,
        req,
        res
      };
      let sessionData;
      try {
        sessionData = await ctx.sessionStrategy.get({ context: sessionContext });
      } catch (sessionError) {
        logger_default.debug("Session check failed:", sessionError);
        return res.status(401).json({ error: "Invalid session" });
      }
      if (!sessionData || !sessionData.itemId) {
        logger_default.warn("Article update attempted without valid session");
        return res.status(401).json({ error: "Authentication required" });
      }
      const articleId = req.params.id;
      const body = req.body?.data || req.body;
      const existingArticle = await ctx.query.Article.findOne({
        where: { id: articleId },
        query: "id author { id }"
      });
      if (!existingArticle) {
        return res.status(404).json({ error: "Article not found" });
      }
      if (String(existingArticle.author.id) !== String(sessionData.itemId)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      let contentDocument;
      if (typeof body.content === "string") {
        const htmlContent = body.content.trim();
        if (!htmlContent || htmlContent === "<p></p>" || htmlContent === "<p><br></p>") {
          contentDocument = {
            type: "doc",
            content: [{ type: "paragraph" }]
          };
        } else {
          let cleanHtml = htmlContent;
          if (cleanHtml.startsWith("<p>") && cleanHtml.endsWith("</p>")) {
            cleanHtml = cleanHtml.slice(3, -4);
          }
          const paragraphs = cleanHtml.split(/<\/p>\s*<p>|<\/p><p>/).filter((p) => p.trim());
          const content = [];
          for (const para of paragraphs) {
            const cleanPara = para.replace(/^<p>|<\/p>$/g, "").trim();
            if (!cleanPara) {
              content.push({ type: "paragraph" });
              continue;
            }
            const textContent = cleanPara.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            const lines = textContent.split("\n").filter((line) => line.trim() || textContent.includes("\n"));
            if (lines.length === 0) {
              content.push({ type: "paragraph" });
            } else {
              for (const line of lines) {
                if (line.trim()) {
                  content.push({
                    type: "paragraph",
                    content: [{ type: "text", text: line.trim() }]
                  });
                } else {
                  content.push({ type: "paragraph" });
                }
              }
            }
          }
          contentDocument = {
            type: "doc",
            content: content.length > 0 ? content : [{ type: "paragraph" }]
          };
        }
      } else if (body.content && typeof body.content === "object") {
        contentDocument = body.content;
      } else {
        contentDocument = {
          type: "doc",
          content: [{ type: "paragraph" }]
        };
      }
      const updateData = {};
      if (body.title) updateData.title = body.title;
      if (contentDocument) updateData.content = contentDocument;
      if (body.excerpt !== void 0) updateData.excerpt = body.excerpt;
      if (body.tags) updateData.tags = body.tags;
      if (body.difficulty) updateData.difficulty = body.difficulty;
      if (body.preview_image !== void 0) updateData.previewImage = body.preview_image;
      if (body.publishedAt !== void 0) updateData.publishedAt = body.publishedAt;
      const article = await ctx.sudo().query.Article.updateOne({
        where: { id: articleId },
        data: updateData,
        query: "id title content { document } excerpt author { id username avatar } tags difficulty previewImage likes_count dislikes_count views publishedAt createdAt updatedAt"
      });
      const response = {
        data: {
          id: String(article.id),
          attributes: {
            title: article.title,
            content: typeof article.content === "object" && article.content.document ? JSON.stringify(article.content.document) : article.content,
            excerpt: article.excerpt,
            author: {
              data: {
                id: article.author.id,
                attributes: {
                  username: article.author.username,
                  avatar: article.author.avatar
                }
              }
            },
            tags: article.tags,
            difficulty: article.difficulty,
            preview_image: article.previewImage,
            likes_count: article.likes_count,
            dislikes_count: article.dislikes_count,
            views: article.views,
            publishedAt: article.publishedAt,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt
          }
        }
      };
      res.json(response);
    } catch (error) {
      logger_default.error("Failed to update article:", error);
      res.status(500).json({
        error: "Failed to update article",
        details: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app.use("/api/graphql", (req, res, next) => {
    if (req.method === "POST" && req.body) {
      const body = req.body;
      const query = body.query || "";
      if (query.includes("authenticateUserWithPassword")) {
        const ip = req.ip || req.connection?.remoteAddress || "unknown";
        const userAgent = req.get("user-agent") || "unknown";
        const variables = body.variables || {};
        const email = variables.email || "unknown";
        logLoginAttempt(ip, email, userAgent);
      }
      if (query.includes("createArticle") || query.includes("CreateArticle")) {
        const variables = body.variables || {};
        logger_default.info("[GraphQL] \u26A1 createArticle mutation request:", {
          query: query.substring(0, 500),
          variables: {
            ...variables,
            data: variables.data ? {
              ...variables.data,
              title: variables.data.title,
              content: variables.data.content ? Array.isArray(variables.data.content) ? `[Array of ${variables.data.content.length} blocks, first: ${JSON.stringify(variables.data.content[0] || {}).substring(0, 300)}]` : typeof variables.data.content : "undefined",
              excerpt: variables.data.excerpt,
              tags: variables.data.tags,
              difficulty: variables.data.difficulty,
              previewImage: variables.data.previewImage,
              publishedAt: variables.data.publishedAt
            } : void 0
          }
        });
      }
      if (process.env.NODE_ENV === "development") {
        const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || "unknown";
        const allVariables = body.variables || {};
        logger_default.debug(`[GraphQL] Request: ${queryName}`, {
          query: query.substring(0, 200),
          hasVariables: !!allVariables && Object.keys(allVariables).length > 0
        });
      }
    }
    next();
  });
  app.use("/api/graphql", (req, res, next) => {
    const originalJson = res.json;
    res.json = function(body) {
      if (body && body.errors) {
        logger_default.error("[GraphQL] GraphQL errors in response:", {
          errors: body.errors,
          path: req.path,
          method: req.method
        });
      }
      return originalJson.call(this, body);
    };
    next();
  });
  app.use(
    (0, import_morgan.default)("combined", {
      stream: {
        write: (message) => {
          logger_default.info(message.trim());
        }
      }
    })
  );
  app.use((err, req, res, next) => {
    logger_default.error("Express error:", err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || "Internal server error",
        ...process.env.NODE_ENV === "development" && { stack: err.stack }
      }
    });
  });
  logger_default.info("\u2705 Express middleware configured");
}

// src/graphql/reactions.ts
var import_core6 = require("@keystone-6/core");
var extendGraphqlSchema = import_core6.graphql.extend((base) => {
  const ReactionType = import_core6.graphql.enum({
    name: "ReactionType",
    values: import_core6.graphql.enumValues(["like", "dislike"])
  });
  return {
    mutation: {
      reactToArticle: import_core6.graphql.field({
        type: base.object("Article"),
        args: {
          articleId: import_core6.graphql.arg({ type: import_core6.graphql.nonNull(import_core6.graphql.ID) }),
          reaction: import_core6.graphql.arg({
            type: import_core6.graphql.nonNull(ReactionType)
          })
        },
        async resolve(root, { articleId, reaction }, context) {
          const session2 = context.session;
          if (!session2?.itemId) {
            throw new Error("Authentication required");
          }
          const userId = session2.itemId;
          if (reaction !== "like" && reaction !== "dislike") {
            throw new Error("Invalid reaction type");
          }
          const article = await context.query.Article.findOne({
            where: { id: articleId },
            query: "id likes_count dislikes_count"
          });
          if (!article) {
            throw new Error("Article not found");
          }
          const existingReaction = await context.query.ArticleReaction.findMany({
            where: {
              article: { id: { equals: articleId } },
              user: { id: { equals: userId } }
            },
            query: "id reaction",
            take: 1
          });
          let finalUserReaction = null;
          let newLikes = article.likes_count || 0;
          let newDislikes = article.dislikes_count || 0;
          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            if (currentReaction === reaction) {
              await context.query.ArticleReaction.deleteOne({
                where: { id: existingReaction[0].id }
              });
              finalUserReaction = null;
              if (reaction === "like") {
                newLikes = Math.max(0, newLikes - 1);
              } else {
                newDislikes = Math.max(0, newDislikes - 1);
              }
            } else {
              await context.query.ArticleReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction }
              });
              finalUserReaction = reaction;
              if (reaction === "like") {
                newLikes = newLikes + 1;
                newDislikes = Math.max(0, newDislikes - 1);
              } else {
                newDislikes = newDislikes + 1;
                newLikes = Math.max(0, newLikes - 1);
              }
            }
          } else {
            await context.query.ArticleReaction.createOne({
              data: {
                article: { connect: { id: articleId } },
                user: { connect: { id: userId } },
                reaction
              }
            });
            finalUserReaction = reaction;
            if (reaction === "like") {
              newLikes = newLikes + 1;
            } else {
              newDislikes = newDislikes + 1;
            }
          }
          const updatedArticle = await context.query.Article.updateOne({
            where: { id: articleId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes
            },
            query: `
              id
              title
              content
              excerpt
              author {
                id
                username
                avatar
              }
              previewImage
              tags
              difficulty
              likes_count
              dislikes_count
              views
              publishedAt
              createdAt
              updatedAt
            `
          });
          updatedArticle.userReaction = finalUserReaction;
          logger_default.info(`Article reaction: articleId=${articleId}, userId=${userId}, reaction=${finalUserReaction}`);
          return updatedArticle;
        }
      }),
      reactToComment: import_core6.graphql.field({
        type: base.object("Comment"),
        args: {
          commentId: import_core6.graphql.arg({ type: import_core6.graphql.nonNull(import_core6.graphql.ID) }),
          reaction: import_core6.graphql.arg({
            type: import_core6.graphql.nonNull(ReactionType)
          })
        },
        async resolve(root, { commentId, reaction }, context) {
          const session2 = context.session;
          if (!session2?.itemId) {
            throw new Error("Authentication required");
          }
          const userId = session2.itemId;
          if (reaction !== "like" && reaction !== "dislike") {
            throw new Error("Invalid reaction type");
          }
          const comment = await context.query.Comment.findOne({
            where: { id: commentId },
            query: "id likes_count dislikes_count"
          });
          if (!comment) {
            throw new Error("Comment not found");
          }
          const existingReaction = await context.query.CommentReaction.findMany({
            where: {
              comment: { id: { equals: commentId } },
              user: { id: { equals: userId } }
            },
            query: "id reaction",
            take: 1
          });
          let finalUserReaction = null;
          let newLikes = comment.likes_count || 0;
          let newDislikes = comment.dislikes_count || 0;
          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            if (currentReaction === reaction) {
              await context.query.CommentReaction.deleteOne({
                where: { id: existingReaction[0].id }
              });
              finalUserReaction = null;
              if (reaction === "like") {
                newLikes = Math.max(0, newLikes - 1);
              } else {
                newDislikes = Math.max(0, newDislikes - 1);
              }
            } else {
              await context.query.CommentReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction }
              });
              finalUserReaction = reaction;
              if (reaction === "like") {
                newLikes = newLikes + 1;
                newDislikes = Math.max(0, newDislikes - 1);
              } else {
                newDislikes = newDislikes + 1;
                newLikes = Math.max(0, newLikes - 1);
              }
            }
          } else {
            await context.query.CommentReaction.createOne({
              data: {
                comment: { connect: { id: commentId } },
                user: { connect: { id: userId } },
                reaction
              }
            });
            finalUserReaction = reaction;
            if (reaction === "like") {
              newLikes = newLikes + 1;
            } else {
              newDislikes = newDislikes + 1;
            }
          }
          const updatedComment = await context.query.Comment.updateOne({
            where: { id: commentId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes
            },
            query: `
              id
              text
              author {
                id
                username
                avatar
              }
              parent {
                id
              }
              article {
                id
              }
              likes_count
              dislikes_count
              createdAt
              updatedAt
            `
          });
          updatedComment.userReaction = finalUserReaction;
          logger_default.info(`Comment reaction: commentId=${commentId}, userId=${userId}, reaction=${finalUserReaction}`);
          return updatedComment;
        }
      })
    }
  };
});

// keystone.ts
var databaseURL = process.env.DATABASE_URL || "file:./.tmp/data.db";
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  logger_default.error("\u274C SECURITY WARNING: SESSION_SECRET is too short or missing!");
  logger_default.error("   SESSION_SECRET must be at least 32 characters long.");
  logger_default.error("   Generate a secure secret: openssl rand -base64 64");
  if (process.env.NODE_ENV === "production") {
    logger_default.error("   Application will not start in production with weak SESSION_SECRET.");
    process.exit(1);
  } else {
    logger_default.warn("   \u26A0\uFE0F  Using default secret in development (NOT SECURE FOR PRODUCTION)");
  }
} else {
  logger_default.info("\u2705 SESSION_SECRET is secure (length: " + sessionSecret.length + " characters)");
}
var keystone_default = withAuth(
  (0, import_core7.config)({
    db: {
      provider: "sqlite",
      url: databaseURL,
      useMigrations: true,
      idField: { kind: "autoincrement" }
    },
    lists,
    session,
    graphql: {
      path: "/api/graphql",
      apolloConfig: {
        introspection: process.env.NODE_ENV === "development"
      },
      extendGraphqlSchema
    },
    server: {
      port: parseInt(process.env.PORT || "1337", 10),
      extendExpressApp,
      cors: {
        origin: [
          process.env.FRONTEND_URL || "http://localhost:5173",
          process.env.PUBLIC_URL || "http://localhost:1337"
        ],
        credentials: true
      }
    },
    ui: {
      isAccessAllowed: async (context) => {
        const req = context.req;
        const ip = req?.ip || req?.connection?.remoteAddress || "unknown";
        const userAgent = req?.get?.("user-agent") || "unknown";
        if (!context.session?.itemId) {
          logAdminAccessDenied(ip, void 0, "Not authenticated", userAgent);
          return false;
        }
        const sessionData = context.session.data;
        const userRole = sessionData?.role;
        const userId = context.session.itemId;
        const email = sessionData?.email || "unknown";
        if (userRole !== "admin") {
          logAdminAccessDenied(ip, String(userId), `User role is '${userRole}', not 'admin'`, userAgent);
          return false;
        }
        logAdminAccessGranted(ip, String(userId), email, userAgent);
        return true;
      }
    }
  })
);
//# sourceMappingURL=config.js.map

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
var import_core13 = require("@keystone-6/core");

// schemas/User.ts
var import_core = require("@keystone-6/core");
var import_fields = require("@keystone-6/core/fields");

// src/access-control.ts
function isAdmin(session2) {
  if (!session2?.itemId) return false;
  const sessionData = session2.data;
  return sessionData?.role === "admin";
}
function isReactionOwner({ session: session2, item }) {
  if (!session2?.itemId) return false;
  if (!item) return false;
  return String(item.user?.id || item.user) === String(session2.itemId);
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
        if (isAdmin(session2)) return true;
        return String(item.id) === String(session2.itemId);
      },
      delete: ({ session: session2 }) => {
        return isAdmin(session2);
      }
    },
    filter: {
      query: ({ session: session2 }) => {
        if (!session2?.itemId) return true;
        if (isAdmin(session2)) return true;
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
      update: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      delete: ({ session: session2 }) => {
        return !!session2?.itemId;
      }
    },
    filter: {
      query: ({ session: session2 }) => {
        if (!session2?.itemId) {
          return {
            publishedAt: { not: null }
          };
        }
        if (isAdmin(session2)) return true;
        return {
          OR: [
            { publishedAt: { not: null } },
            { author: { id: { equals: session2.itemId } } }
          ]
        };
      },
      update: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          author: { id: { equals: session2.itemId } }
        };
      },
      delete: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          author: { id: { equals: session2.itemId } }
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
      update: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      delete: ({ session: session2 }) => {
        return !!session2?.itemId;
      }
    },
    filter: {
      query: () => true,
      // Все видят все комментарии
      update: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          author: { id: { equals: session2.itemId } }
        };
      },
      delete: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          author: { id: { equals: session2.itemId } }
        };
      }
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
        if (isAdmin(session2)) return true;
        return isReactionOwner({ session: session2, item });
      },
      delete: ({ session: session2, item }) => {
        if (isAdmin(session2)) return true;
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
        if (isAdmin(session2)) return true;
        return isReactionOwner({ session: session2, item });
      },
      delete: ({ session: session2, item }) => {
        if (isAdmin(session2)) return true;
        return isReactionOwner({ session: session2, item });
      }
    },
    filter: {
      query: () => true
      // Все видят все реакции
    }
  },
  Bookmark: {
    operation: {
      query: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      create: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      update: () => false,
      // Закладки нельзя обновлять
      delete: ({ session: session2 }) => {
        return !!session2?.itemId;
      }
    },
    filter: {
      query: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        return {
          user: { id: { equals: session2.itemId } }
        };
      },
      delete: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          user: { id: { equals: session2.itemId } }
        };
      }
    }
  },
  Follow: {
    operation: {
      query: () => true,
      // Чтение подписок - публично
      create: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      update: () => false,
      // Подписки нельзя обновлять
      delete: ({ session: session2, item }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        if (!item) return false;
        return String(item.follower?.id || item.follower) === String(session2.itemId);
      }
    },
    filter: {
      query: () => true
      // Все видят все подписки
    }
  },
  Notification: {
    operation: {
      query: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      create: () => false,
      // Уведомления создаются только системой через hooks
      update: ({ session: session2 }) => {
        return !!session2?.itemId;
      },
      delete: ({ session: session2 }) => {
        return !!session2?.itemId;
      }
    },
    filter: {
      query: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          user: { id: { equals: session2.itemId } }
        };
      },
      update: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          user: { id: { equals: session2.itemId } }
        };
      },
      delete: ({ session: session2 }) => {
        if (!session2?.itemId) return false;
        if (isAdmin(session2)) return true;
        return {
          user: { id: { equals: session2.itemId } }
        };
      }
    }
  }
};

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
  import_winston.default.format.printf(({ timestamp: timestamp9, level, message, ...meta }) => {
    let msg = `${timestamp9} [${level}]: ${message}`;
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

// src/lib/email-hash.ts
var import_crypto = require("crypto");
var getSecretKey = () => {
  const secret = process.env.EMAIL_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    const errorMsg = "EMAIL_HMAC_SECRET must be set and at least 32 characters long";
    logger_default.error(`hashEmail: ${errorMsg}`);
    throw new Error(errorMsg);
  }
  return secret;
};
function hashEmail(email) {
  if (!email || typeof email !== "string") {
    logger_default.warn("hashEmail: Invalid email provided");
    throw new Error("Email must be a non-empty string");
  }
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail) {
    logger_default.warn("hashEmail: Empty email after normalization");
    throw new Error("Email cannot be empty after normalization");
  }
  if (!normalizedEmail.includes("@")) {
    logger_default.warn("hashEmail: Invalid email format (no @ symbol)");
    throw new Error("Invalid email format");
  }
  const secretKey = getSecretKey();
  const hmac = (0, import_crypto.createHmac)("sha256", secretKey);
  hmac.update(normalizedEmail);
  const hashedEmail = hmac.digest("hex");
  logger_default.debug("Email hashed successfully with HMAC-SHA256", {
    originalLength: email.length,
    hashedLength: hashedEmail.length
    // НЕ логируем оригинальный email для безопасности
  });
  return hashedEmail;
}
function isEmailHash(value) {
  if (!value || typeof value !== "string") {
    return false;
  }
  return value.length === 64 && /^[a-f0-9]{64}$/i.test(value);
}

// schemas/User.ts
var User = (0, import_core.list)({
  access: accessControl.User,
  hooks: {
    // ВАЖНО: Автоматическое назначение роли 'admin' УБРАНО из соображений безопасности
    // Роль 'admin' может быть назначена ТОЛЬКО через защищенный endpoint /api/setup/initial
    // или вручную существующим администратором через Admin UI
    resolveInput: async ({ resolvedData, operation, context }) => {
      if (resolvedData.email && typeof resolvedData.email === "string") {
        if (!isEmailHash(resolvedData.email)) {
          try {
            resolvedData.email = hashEmail(resolvedData.email);
            logger_default.debug("Email automatically hashed in User schema hook", {
              operation
              // НЕ логируем оригинальный email для безопасности
            });
          } catch (error) {
            logger_default.error("Failed to hash email in User schema hook:", error);
            throw new Error("Invalid email format");
          }
        }
      }
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
    bookmarks: (0, import_fields.relationship)({
      ref: "Bookmark.user",
      many: true
    }),
    following: (0, import_fields.relationship)({
      ref: "Follow.follower",
      many: true
    }),
    followers: (0, import_fields.relationship)({
      ref: "Follow.following",
      many: true
    }),
    notifications: (0, import_fields.relationship)({
      ref: "Notification.user",
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
var import_core3 = require("@keystone-6/core");
var import_fields_document = require("@keystone-6/fields-document");

// src/lib/notifications.ts
async function hasDuplicateNotification(context, data, timeWindowMs = 60 * 60 * 1e3) {
  try {
    const userId = String(data.userId);
    const actorId = String(data.actorId);
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    const where = {
      user: { id: { equals: userId } },
      actor: { id: { equals: actorId } },
      type: { equals: data.type },
      createdAt: { gte: cutoffTime.toISOString() }
      // Проверяем только за последний час
    };
    if (data.type === "article_like" || data.type === "comment_like") {
      if (data.articleId) {
        where.article = { id: { equals: String(data.articleId) } };
      }
      if (data.commentId) {
        where.comment = { id: { equals: String(data.commentId) } };
      }
      if (data.metadata?.threshold) {
        const existingNotifications = await context.sudo().query.Notification.findMany({
          where: {
            user: { id: { equals: userId } },
            actor: { id: { equals: actorId } },
            type: { equals: data.type },
            createdAt: { gte: cutoffTime.toISOString() },
            ...data.articleId ? { article: { id: { equals: String(data.articleId) } } } : {},
            ...data.commentId ? { comment: { id: { equals: String(data.commentId) } } } : {}
          },
          query: "id metadata"
        });
        return existingNotifications.some(
          (notif) => notif.metadata?.threshold === data.metadata?.threshold
        );
      }
    } else if (data.type === "comment" || data.type === "comment_reply") {
      if (data.articleId) {
        where.article = { id: { equals: String(data.articleId) } };
      }
      if (data.commentId) {
        where.comment = { id: { equals: String(data.commentId) } };
      }
    } else if (data.type === "follow") {
    }
    const existing = await context.sudo().query.Notification.findMany({
      where,
      query: "id",
      take: 1
    });
    return existing.length > 0;
  } catch (error) {
    logger_default.error(`[hasDuplicateNotification] Error checking for duplicates:`, {
      error: error.message,
      data
    });
    return false;
  }
}
async function createNotification(context, data, skipDuplicateCheck = false) {
  try {
    const userId = String(data.userId);
    const actorId = String(data.actorId);
    if (userId === actorId) {
      logger_default.debug(`[createNotification] Skipping self-notification: userId=${userId}, type=${data.type}`);
      return;
    }
    if (!skipDuplicateCheck) {
      const hasDuplicate = await hasDuplicateNotification(context, data);
      if (hasDuplicate) {
        logger_default.debug(`[createNotification] Duplicate notification found, skipping:`, {
          type: data.type,
          userId,
          actorId,
          articleId: data.articleId,
          commentId: data.commentId
        });
        return;
      }
    }
    const notificationData = {
      user: { connect: { id: userId } },
      actor: { connect: { id: actorId } },
      type: data.type,
      isRead: false
    };
    if (data.articleId) {
      notificationData.article = { connect: { id: String(data.articleId) } };
    }
    if (data.commentId) {
      notificationData.comment = { connect: { id: String(data.commentId) } };
    }
    if (data.metadata) {
      notificationData.metadata = data.metadata;
    }
    logger_default.debug(`[createNotification] Creating notification:`, {
      type: data.type,
      userId,
      actorId,
      articleId: data.articleId,
      commentId: data.commentId
    });
    await context.sudo().query.Notification.createOne({
      data: notificationData
    });
    logger_default.info(`[createNotification] Notification created successfully: type=${data.type}, userId=${userId}, actorId=${actorId}`);
  } catch (error) {
    logger_default.error(`[createNotification] Failed to create notification:`, {
      error: error.message,
      stack: error.stack,
      data
    });
  }
}
function shouldNotifyAboutLike(currentCount, previousCount, thresholds) {
  if (previousCount === 0 && currentCount === 1) {
    return 1;
  }
  for (const threshold of thresholds) {
    if (previousCount < threshold && currentCount >= threshold) {
      return threshold;
    }
  }
  return null;
}

// schemas/Article.ts
var Article = (0, import_core2.list)({
  access: accessControl.Article,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      if (operation === "create") {
        const session2 = context.session;
        logger_default.info(`[Article] resolveInput create: session.itemId=${session2?.itemId}, inputData.author=${JSON.stringify(inputData?.author)}, resolvedData.author=${JSON.stringify(resolvedData?.author)}`);
        if (!session2?.itemId) {
          logger_default.error("[Article] Attempted to create article without authentication");
          throw new Error("Authentication required to create an article");
        }
        let userId = session2.itemId;
        if (typeof userId === "string") {
          const parsedId = parseInt(userId, 10);
          if (!isNaN(parsedId)) {
            userId = parsedId;
          } else {
            logger_default.error(`[Article] Invalid session.itemId format (string, not parsable to int): ${session2.itemId}`);
            throw new Error("Invalid user ID format");
          }
        } else if (typeof userId !== "number") {
          logger_default.error(`[Article] Invalid session.itemId type (not string or number): ${typeof session2.itemId}`);
          throw new Error("Invalid user ID type");
        }
        resolvedData.author = { connect: { id: userId } };
        logger_default.info(`[Article] Auto-setting author from session: userId=${userId}, author=${JSON.stringify(resolvedData.author)}`);
      }
      return resolvedData;
    },
    afterOperation: async ({ operation, item, context, originalItem }) => {
      if (operation === "update" && item) {
        try {
          const currentArticle = await context.query.Article.findOne({
            where: { id: item.id },
            query: `
              id
              publishedAt
              author {
                id
              }
            `
          });
          if (!currentArticle || !currentArticle.author) {
            logger_default.warn(`[Article] afterOperation: Article or author not found: articleId=${item.id}`);
            return;
          }
          const wasPublished = currentArticle.publishedAt !== null;
          const wasPreviouslyPublished = originalItem?.publishedAt !== null;
          if (wasPublished && !wasPreviouslyPublished) {
            logger_default.debug(`[Article] afterOperation: Article published, finding followers:`, {
              articleId: currentArticle.id,
              authorId: currentArticle.author.id
            });
            const followers = await context.query.Follow.findMany({
              where: {
                following: { id: { equals: String(currentArticle.author.id) } }
              },
              query: `
                id
                follower {
                  id
                }
              `
            });
            logger_default.debug(`[Article] afterOperation: Found ${followers.length} followers`);
            for (const follow of followers) {
              if (follow.follower?.id) {
                await createNotification(context, {
                  type: "article_published",
                  userId: follow.follower.id,
                  actorId: currentArticle.author.id,
                  articleId: currentArticle.id
                });
              }
            }
            logger_default.info(`[Article] afterOperation: Created ${followers.length} notifications for article publication`);
          }
        } catch (error) {
          logger_default.error(`[Article] afterOperation: Failed to create notifications:`, {
            error: error.message,
            stack: error.stack,
            articleId: item.id
          });
        }
      }
    }
  },
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
      validation: { isRequired: true, length: { max: 500 } }
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
    bookmarks: (0, import_fields2.relationship)({
      ref: "Bookmark.article",
      many: true
    }),
    userReaction: (0, import_fields2.virtual)({
      field: import_core3.graphql.field({
        type: import_core3.graphql.String,
        async resolve(item, args, context) {
          const session2 = context.session;
          if (!session2?.itemId) {
            return null;
          }
          const userId = session2.itemId;
          const articleId = item.id;
          if (!articleId) {
            return null;
          }
          try {
            const reaction = await context.query.ArticleReaction.findMany({
              where: {
                article: { id: { equals: String(articleId) } },
                user: { id: { equals: userId } }
              },
              query: "reaction",
              take: 1
            });
            return reaction.length > 0 ? reaction[0].reaction : null;
          } catch (error) {
            logger_default.error("Failed to get userReaction for article:", error);
            return null;
          }
        }
      })
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
var import_core4 = require("@keystone-6/core");
var import_fields3 = require("@keystone-6/core/fields");
var import_core5 = require("@keystone-6/core");
var Comment = (0, import_core4.list)({
  access: accessControl.Comment,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      if (operation === "create") {
        const session2 = context.session;
        logger_default.info(`[Comment] resolveInput create: session.itemId=${session2?.itemId}, inputData.author=${JSON.stringify(inputData?.author)}, resolvedData.author=${JSON.stringify(resolvedData?.author)}`);
        if (!session2?.itemId) {
          logger_default.error("[Comment] Attempted to create comment without authentication");
          throw new Error("Authentication required to create a comment");
        }
        const userId = typeof session2.itemId === "string" ? parseInt(session2.itemId, 10) : Number(session2.itemId);
        if (isNaN(userId)) {
          logger_default.error(`[Comment] Invalid userId: ${session2.itemId}`);
          throw new Error("Invalid user ID in session");
        }
        resolvedData.author = { connect: { id: userId } };
        logger_default.info(`[Comment] Auto-setting author from session: userId=${userId} (type: ${typeof userId}), author=${JSON.stringify(resolvedData.author)}`);
      }
      return resolvedData;
    },
    afterOperation: async ({ operation, item, context, originalItem }) => {
      if (operation === "create" && item) {
        try {
          const comment = await context.query.Comment.findOne({
            where: { id: item.id },
            query: `
              id
              author {
                id
              }
              article {
                id
                author {
                  id
                }
              }
              parent {
                id
                author {
                  id
                }
              }
            `
          });
          if (!comment || !comment.author) {
            logger_default.warn(`[Comment] afterOperation: Comment or author not found: commentId=${item.id}`);
            return;
          }
          const commentAuthorId = comment.author.id;
          const articleId = comment.article?.id;
          const articleAuthorId = comment.article?.author?.id;
          const parentCommentId = comment.parent?.id;
          const parentAuthorId = comment.parent?.author?.id;
          logger_default.debug(`[Comment] afterOperation: Creating notifications for comment:`, {
            commentId: comment.id,
            commentAuthorId,
            articleId,
            articleAuthorId,
            parentCommentId,
            parentAuthorId
          });
          if (parentCommentId && parentAuthorId) {
            await createNotification(context, {
              type: "comment_reply",
              userId: parentAuthorId,
              actorId: commentAuthorId,
              articleId,
              commentId: parentCommentId
            }, false);
          } else if (articleId && articleAuthorId) {
            await createNotification(context, {
              type: "comment",
              userId: articleAuthorId,
              actorId: commentAuthorId,
              articleId,
              commentId: comment.id
            }, false);
          }
        } catch (error) {
          logger_default.error(`[Comment] afterOperation: Failed to create notifications:`, {
            error: error.message,
            stack: error.stack,
            commentId: item.id
          });
        }
      }
    }
  },
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
    userReaction: (0, import_fields3.virtual)({
      field: import_core5.graphql.field({
        type: import_core5.graphql.String,
        async resolve(item, args, context) {
          const session2 = context.session;
          if (!session2?.itemId) {
            return null;
          }
          const userId = session2.itemId;
          const commentId = item.id;
          if (!commentId) {
            return null;
          }
          try {
            const reaction = await context.query.CommentReaction.findMany({
              where: {
                comment: { id: { equals: String(commentId) } },
                user: { id: { equals: userId } }
              },
              query: "reaction",
              take: 1
            });
            return reaction.length > 0 ? reaction[0].reaction : null;
          } catch (error) {
            logger_default.error("Failed to get userReaction for comment:", error);
            return null;
          }
        }
      })
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
var import_core6 = require("@keystone-6/core");
var import_fields4 = require("@keystone-6/core/fields");
var ArticleReaction = (0, import_core6.list)({
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
var import_core7 = require("@keystone-6/core");
var import_fields5 = require("@keystone-6/core/fields");
var CommentReaction = (0, import_core7.list)({
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

// schemas/Bookmark.ts
var import_core8 = require("@keystone-6/core");
var import_fields6 = require("@keystone-6/core/fields");
var Bookmark = (0, import_core8.list)({
  access: accessControl.Bookmark,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      if (operation === "create") {
        const session2 = context.session;
        logger_default.info(`[Bookmark] resolveInput create: session.itemId=${session2?.itemId}, inputData.user=${JSON.stringify(inputData?.user)}, resolvedData.user=${JSON.stringify(resolvedData?.user)}`);
        if (!session2?.itemId) {
          logger_default.error("[Bookmark] Attempted to create bookmark without authentication");
          throw new Error("Authentication required to create a bookmark");
        }
        let userId = session2.itemId;
        if (typeof userId === "string") {
          const parsedId = parseInt(userId, 10);
          if (!isNaN(parsedId)) {
            userId = parsedId;
          } else {
            logger_default.error(`[Bookmark] Invalid session.itemId format (string, not parsable to int): ${session2.itemId}`);
            throw new Error("Invalid user ID format");
          }
        } else if (typeof userId !== "number") {
          logger_default.error(`[Bookmark] Invalid session.itemId type (not string or number): ${typeof session2.itemId}`);
          throw new Error("Invalid user ID type");
        }
        resolvedData.user = { connect: { id: userId } };
        logger_default.info(`[Bookmark] Auto-setting user from session: userId=${userId}, user=${JSON.stringify(resolvedData.user)}`);
      }
      return resolvedData;
    }
  },
  fields: {
    user: (0, import_fields6.relationship)({
      ref: "User.bookmarks",
      many: false,
      validation: { isRequired: true }
    }),
    article: (0, import_fields6.relationship)({
      ref: "Article.bookmarks",
      many: false,
      validation: { isRequired: true }
    }),
    createdAt: (0, import_fields6.timestamp)({
      defaultValue: { kind: "now" }
    })
  }
});

// schemas/Follow.ts
var import_core9 = require("@keystone-6/core");
var import_fields7 = require("@keystone-6/core/fields");
var Follow = (0, import_core9.list)({
  access: accessControl.Follow,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      if (operation === "create") {
        const session2 = context.session;
        logger_default.info(`[Follow] resolveInput create: session.itemId=${session2?.itemId}, inputData.follower=${JSON.stringify(inputData?.follower)}, resolvedData.follower=${JSON.stringify(resolvedData?.follower)}`);
        if (!session2?.itemId) {
          logger_default.error("[Follow] Attempted to create follow without authentication");
          throw new Error("Authentication required to create a follow");
        }
        let userId = session2.itemId;
        if (typeof userId === "string") {
          const parsedId = parseInt(userId, 10);
          if (!isNaN(parsedId)) {
            userId = parsedId;
          } else {
            logger_default.error(`[Follow] Invalid session.itemId format (string, not parsable to int): ${session2.itemId}`);
            throw new Error("Invalid user ID format");
          }
        } else if (typeof userId !== "number") {
          logger_default.error(`[Follow] Invalid session.itemId type (not string or number): ${typeof session2.itemId}`);
          throw new Error("Invalid user ID type");
        }
        resolvedData.follower = { connect: { id: userId } };
        logger_default.info(`[Follow] Auto-setting follower from session: userId=${userId}, follower=${JSON.stringify(resolvedData.follower)}`);
      }
      return resolvedData;
    },
    afterOperation: async ({ operation, item, context }) => {
      if (operation === "create" && item) {
        try {
          const follow = await context.query.Follow.findOne({
            where: { id: item.id },
            query: `
              id
              follower {
                id
              }
              following {
                id
              }
            `
          });
          if (!follow || !follow.follower || !follow.following) {
            logger_default.warn(`[Follow] afterOperation: Follow or relationships not found: followId=${item.id}`);
            return;
          }
          const followerId = follow.follower.id;
          const followingId = follow.following.id;
          logger_default.debug(`[Follow] afterOperation: Creating notification for follow:`, {
            followId: follow.id,
            followerId,
            followingId
          });
          await createNotification(context, {
            type: "follow",
            userId: followingId,
            actorId: followerId
          }, false);
        } catch (error) {
          logger_default.error(`[Follow] afterOperation: Failed to create notification:`, {
            error: error.message,
            stack: error.stack,
            followId: item.id
          });
        }
      }
    }
  },
  fields: {
    follower: (0, import_fields7.relationship)({
      ref: "User.following",
      many: false,
      validation: { isRequired: true }
    }),
    following: (0, import_fields7.relationship)({
      ref: "User.followers",
      many: false,
      validation: { isRequired: true }
    }),
    createdAt: (0, import_fields7.timestamp)({
      defaultValue: { kind: "now" }
    })
  }
});

// schemas/Notification.ts
var import_core10 = require("@keystone-6/core");
var import_fields8 = require("@keystone-6/core/fields");
var Notification = (0, import_core10.list)({
  access: accessControl.Notification,
  hooks: {
    afterOperation: async ({ operation, item, context, originalItem }) => {
      if (operation === "update" && item) {
        logger_default.info(`[Notification] afterOperation update:`, {
          notificationId: item.id,
          isRead: item.isRead,
          readAt: item.readAt,
          originalIsRead: originalItem?.isRead
        });
      }
    }
  },
  fields: {
    user: (0, import_fields8.relationship)({
      ref: "User.notifications",
      many: false,
      validation: { isRequired: true },
      isIndexed: true
    }),
    type: (0, import_fields8.select)({
      type: "string",
      options: [
        { label: "Comment", value: "comment" },
        { label: "Comment Reply", value: "comment_reply" },
        { label: "Follow", value: "follow" },
        { label: "Article Published", value: "article_published" },
        { label: "Article Like", value: "article_like" },
        { label: "Comment Like", value: "comment_like" }
      ],
      validation: { isRequired: true },
      isIndexed: true
    }),
    actor: (0, import_fields8.relationship)({
      ref: "User",
      many: false,
      validation: { isRequired: true }
    }),
    article: (0, import_fields8.relationship)({
      ref: "Article",
      many: false
    }),
    comment: (0, import_fields8.relationship)({
      ref: "Comment",
      many: false
    }),
    isRead: (0, import_fields8.checkbox)({
      defaultValue: false,
      isIndexed: true
    }),
    readAt: (0, import_fields8.timestamp)(),
    metadata: (0, import_fields8.json)(),
    createdAt: (0, import_fields8.timestamp)({
      defaultValue: { kind: "now" },
      isIndexed: true
    })
  }
});

// schemas/index.ts
var lists = {
  User,
  Article,
  Comment,
  ArticleReaction,
  CommentReaction,
  Bookmark,
  Follow,
  Notification
};

// src/auth/auth.ts
var import_session = require("@keystone-6/core/session");
var import_auth = require("@keystone-6/auth");
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
  sessionData: "id username role",
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрали email из sessionData (он хеширован и не нужен в сессии)
  passwordResetLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      logger_default.info(`Password reset token requested (OAuth2 only, not implemented)`);
    },
    tokensValidForMins: 60
  },
  magicAuthLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      logger_default.info(`Magic auth token requested (OAuth2 only, not implemented)`);
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
var import_crypto2 = require("crypto");
function hashEmailOld(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const hash = (0, import_crypto2.createHash)("sha256");
  hash.update(normalizedEmail);
  return hash.digest("hex");
}
async function findOrCreateGoogleUser(context, profile) {
  try {
    const email = profile.email;
    if (!email) {
      logger_default.error("Google OAuth: No email in profile", {
        profileId: profile.id,
        hasEmails: !!profile.emails && profile.emails.length > 0
      });
      return null;
    }
    const hashedEmail = hashEmail(email);
    let existingUser = await context.sudo().query.User.findMany({
      where: { email: { equals: hashedEmail } },
      query: "id email username name avatar provider confirmed",
      take: 1
    });
    if (existingUser.length === 0) {
      const oldHashedEmail = hashEmailOld(email);
      existingUser = await context.sudo().query.User.findMany({
        where: { email: { equals: oldHashedEmail } },
        query: "id email username name avatar provider confirmed",
        take: 1
      });
      if (existingUser.length > 0) {
        logger_default.info(`Found user with old email hash format, will rehash to HMAC-SHA256: ${existingUser[0].id}`);
      }
    }
    if (existingUser.length > 0) {
      const user = existingUser[0];
      const updateData = {};
      if (user.email !== hashedEmail) {
        updateData.email = hashedEmail;
        logger_default.info(`Rehashing email for user ${user.id} from old format to HMAC-SHA256`);
      }
      if (profile.displayName && user.name !== profile.displayName) {
        updateData.name = profile.displayName;
      }
      if (profile.avatar && (!user.avatar || user.avatar.trim() === "")) {
        updateData.avatar = profile.avatar;
        logger_default.debug("Updating avatar from Google OAuth (user had no avatar)", {
          userId: user.id,
          googleAvatar: profile.avatar
        });
      } else if (profile.avatar && user.avatar && user.avatar !== profile.avatar) {
        logger_default.debug("Skipping avatar update from Google OAuth (user has custom avatar)", {
          userId: user.id,
          currentAvatar: user.avatar,
          googleAvatar: profile.avatar
        });
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
        email: "",
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
        username: user.username,
        name: user.name || profile.displayName,
        avatar: user.avatar || profile.avatar
      };
    }
    const baseUsername = profile.displayName ? profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20) : email.split("@")[0].substring(0, 20);
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
        email: hashedEmail,
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сохраняем хеш email вместо оригинального
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
      email: "",
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
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
var googleClientId = process.env.GOOGLE_CLIENT_ID;
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
var googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:1337/api/connect/google/callback";
if (!googleClientId || !googleClientSecret) {
  logger_default.warn("\u26A0\uFE0F Google OAuth credentials not configured. Google OAuth will not work.");
  logger_default.warn("   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
} else {
  import_passport.default.use(
    new import_passport_google_oauth20.Strategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || profile.email;
          if (!email) {
            logger_default.error("Google OAuth: No email in profile", {
              profileId: profile.id,
              hasEmails: !!profile.emails && profile.emails.length > 0
            });
            return done(new Error("No email in Google profile"), null);
          }
          const displayName = profile.displayName || profile.name?.givenName || email.split("@")[0];
          const avatar = profile.photos?.[0]?.value || void 0;
          const user = {
            id: profile.id,
            email,
            displayName,
            avatar,
            provider: "google"
          };
          logger_default.debug("Google OAuth profile processed:", {
            id: user.id,
            email: email.substring(0, 5) + "...",
            // Логируем только часть email для безопасности
            displayName: user.displayName,
            hasAvatar: !!user.avatar
          });
          return done(null, user);
        } catch (error) {
          logger_default.error("Error processing Google OAuth profile:", error);
          return done(error, null);
        }
      }
    )
  );
  logger_default.info("\u2705 Google OAuth strategy configured");
}
import_passport.default.serializeUser((user, done) => {
  done(null, user);
});
import_passport.default.deserializeUser((user, done) => {
  done(null, user);
});

// src/lib/security-logger.ts
function logSecurityEvent(event) {
  const timestamp9 = event.timestamp || /* @__PURE__ */ new Date();
  const logData = {
    type: event.type,
    ip: event.ip,
    email: event.email,
    userId: event.userId,
    userAgent: event.userAgent,
    reason: event.reason,
    timestamp: timestamp9.toISOString()
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
    email: "hidden",
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем email (даже хешированный) для безопасности
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
    email: "hidden",
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем email (даже хешированный) для безопасности
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
  const commentLimiter = (0, import_express_rate_limit.default)({
    windowMs: 25 * 1e3,
    // 25 секунд
    max: 1,
    // максимум 1 запрос
    message: "Too many comment requests, please try again later.",
    skip: (req) => {
      return !req.path.includes("/comments");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: "Too many comment requests",
        message: "Too many comment requests. Please wait 25 seconds before trying again.",
        waitTime: 25
      });
    }
  });
  app.use("/api/", commentLimiter);
  const uploadLimiter = (0, import_express_rate_limit.default)({
    windowMs: 60 * 1e3,
    // 1 минута
    max: 5,
    // максимум 5 запросов
    message: "Too many upload requests, please try again later.",
    skip: (req) => {
      return !req.path.includes("/upload");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: "Too many upload requests",
        message: "Too many upload requests. Please wait a minute before trying again.",
        waitTime: 60
      });
    }
  });
  app.use("/api/", uploadLimiter);
  const limiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    // 15 минут
    max: 100,
    // максимум 100 запросов с одного IP
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === "/api/graphql" || req.path.includes("/comments") || req.path.includes("/upload");
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
    windowMs: 5 * 60 * 1e3,
    // 5 минут (синхронизировано с клиентом)
    max: 5,
    // максимум 5 попыток входа с одного IP (синхронизировано с клиентом)
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
        message: "Too many login attempts from this IP, please try again later.",
        waitTime: 300
        // 5 минут в секундах
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
      if (query.includes("authenticateUserWithPassword")) return true;
      const adminQueryIndicators = [
        "adminMeta",
        "StaticAdminMeta",
        "ItemPage",
        "RelationshipSelect",
        "ListPage",
        "keystone {",
        "__typename"
        // Admin UI часто использует __typename
      ];
      const isAdminQuery = adminQueryIndicators.some(
        (indicator) => query.includes(indicator)
      );
      return isAdminQuery;
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
  const graphqlCommentLimiter = (0, import_express_rate_limit.default)({
    windowMs: 25 * 1e3,
    // 25 секунд
    max: 1,
    // максимум 1 запрос
    message: "Too many comment requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      const commentMutations = ["createComment", "updateComment", "deleteComment"];
      return !commentMutations.some((mutation) => query.includes(mutation));
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (comment)", userAgent);
      res.status(429).json({
        error: "Too many comment requests",
        message: "Too many comment requests. Please wait 25 seconds before trying again.",
        waitTime: 25
      });
    }
  });
  const graphqlReactionLimiter = (0, import_express_rate_limit.default)({
    windowMs: 5 * 1e3,
    // 5 секунд
    max: 3,
    // максимум 3 реакции
    message: "Too many reaction requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("reactToArticle") && !query.includes("reactToComment");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (reaction)", userAgent);
      res.status(429).json({
        error: "Too many reaction requests",
        message: "Too many reaction requests. Please wait 5 seconds before trying again.",
        waitTime: 5
      });
    }
  });
  const graphqlFollowLimiter = (0, import_express_rate_limit.default)({
    windowMs: 5 * 1e3,
    // 5 секунд
    max: 2,
    // максимум 2 подписки/отписки
    message: "Too many follow requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("createFollow") && !query.includes("deleteFollow");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (follow)", userAgent);
      res.status(429).json({
        error: "Too many follow requests",
        message: "Too many follow requests. Please wait 5 seconds before trying again.",
        waitTime: 5
      });
    }
  });
  const graphqlDraftAutoSaveLimiter = (0, import_express_rate_limit.default)({
    windowMs: 60 * 1e3,
    // 1 минута
    max: 10,
    // максимум 10 автосохранений в минуту
    message: "Too many auto-save requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("updateDraft") || query.includes("createArticle");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (draft auto-save)", userAgent);
      res.status(429).json({
        error: "Too many auto-save requests",
        message: "Too many auto-save requests. Please wait a moment before trying again.",
        waitTime: 60
      });
    }
  });
  const graphqlArticleMutationLimiter = (0, import_express_rate_limit.default)({
    windowMs: 60 * 1e3,
    // 1 минута
    max: 1,
    // максимум 1 мутация
    message: "Too many article mutation requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      const articleMutations = ["createArticle", "updateArticle"];
      return !articleMutations.some((mutation) => query.includes(mutation));
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (article mutation)", userAgent);
      res.status(429).json({
        error: "Too many article mutation requests",
        message: "Too many article mutation requests. Please wait 60 seconds before trying again.",
        waitTime: 60
      });
    }
  });
  const graphqlDeleteLimiter = (0, import_express_rate_limit.default)({
    windowMs: 60 * 1e3,
    // 1 минута
    max: 5,
    // максимум 5 удалений
    message: "Too many delete requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("deleteArticle") && !query.includes("deleteDraft");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (delete)", userAgent);
      res.status(429).json({
        error: "Too many delete requests",
        message: "Too many delete requests. Please wait a minute before trying again.",
        waitTime: 60
      });
    }
  });
  const graphqlBookmarkLimiter = (0, import_express_rate_limit.default)({
    windowMs: 5 * 1e3,
    // 5 секунд
    max: 1,
    // максимум 1 операция
    message: "Too many bookmark requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("createBookmark") && !query.includes("deleteBookmark");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (bookmark)", userAgent);
      res.status(429).json({
        error: "Too many bookmark requests",
        message: "Too many bookmark requests. Please wait 5 seconds before trying again.",
        waitTime: 5
      });
    }
  });
  const graphqlProfileUpdateLimiter = (0, import_express_rate_limit.default)({
    windowMs: 10 * 1e3,
    // 10 секунд
    max: 1,
    // максимум 1 обновление профиля
    message: "Too many profile update requests, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("updateProfile");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (profile update)", userAgent);
      res.status(429).json({
        error: "Too many profile update requests",
        message: "Too many profile update requests. Please wait 10 seconds before trying again.",
        waitTime: 10
      });
    }
  });
  const graphqlSignUpLimiter = (0, import_express_rate_limit.default)({
    windowMs: 5 * 60 * 1e3,
    // 5 минут
    max: 3,
    // максимум 3 попытки регистрации
    message: "Too many sign up attempts, please try again later.",
    skip: (req) => {
      if (req.method !== "POST" || !req.body) return true;
      const query = req.body.query || "";
      return !query.includes("createUser") || query.includes("authenticateUserWithPassword");
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const userAgent = req.get("user-agent") || "unknown";
      logRateLimitExceeded(ip, "/api/graphql (sign up)", userAgent);
      res.status(429).json({
        error: "Too many sign up attempts",
        message: "Too many sign up attempts. Please wait 5 minutes before trying again.",
        waitTime: 300
      });
    }
  });
  app.use("/api/graphql", graphqlLoginLimiter);
  app.use("/api/graphql", graphqlSignUpLimiter);
  app.use("/api/graphql", graphqlCommentLimiter);
  app.use("/api/graphql", graphqlReactionLimiter);
  app.use("/api/graphql", graphqlFollowLimiter);
  app.use("/api/graphql", graphqlDraftAutoSaveLimiter);
  app.use("/api/graphql", graphqlArticleMutationLimiter);
  app.use("/api/graphql", graphqlDeleteLimiter);
  app.use("/api/graphql", graphqlBookmarkLimiter);
  app.use("/api/graphql", graphqlProfileUpdateLimiter);
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
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              logger_default.error("Failed to save session with oauthUserId:", err);
              reject(err);
            } else {
              logger_default.debug("Session saved with oauthUserId:", keystoneUser.id);
              resolve();
            }
          });
        });
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
      const { z: z2 } = await import("zod");
      const setupSchema = z2.object({
        email: z2.string().email("Invalid email format").min(5).max(255),
        password: z2.string().min(8, "Password must be at least 8 characters").max(128),
        username: z2.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
        name: z2.string().min(1, "Name is required").max(100)
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
      const hashedEmail = hashEmail(email);
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
              email: hashedEmail,
              // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сохраняем хеш email вместо оригинального
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
        logger_default.info(`\u2705 First admin created via initial setup endpoint: ${admin.id}`);
        res.json({
          success: true,
          message: "First admin created successfully",
          user: {
            id: admin.id,
            email: "",
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
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
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не включаем email в sessionData (он хеширован и не нужен)
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
      logger_default.info(`\u2705 OAuth session created for user: ${user.id}`);
      res.json({
        success: true,
        user: {
          id: user.id,
          email: "",
          // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
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
      logger_default.debug("Image upload request received:", {
        method: req.method,
        path: req.path,
        hasFile: !!req.file,
        cookies: req.headers.cookie ? "present" : "missing",
        contentType: req.headers["content-type"]
      });
      const ctx = context || keystoneContext;
      if (!ctx) {
        logger_default.error("KeystoneJS context not available for image upload", {
          hasContext: !!context,
          hasKeystoneContext: !!keystoneContext
        });
        return res.status(500).json({ error: "KeystoneJS context not available" });
      }
      if (!ctx.sessionStrategy) {
        logger_default.error("KeystoneJS sessionStrategy not available", {
          hasContext: !!ctx,
          contextKeys: Object.keys(ctx || {})
        });
        return res.status(500).json({ error: "Session strategy not available" });
      }
      logger_default.debug("KeystoneJS context available for image upload", {
        hasSessionStrategy: !!ctx.sessionStrategy,
        sessionStrategyType: typeof ctx.sessionStrategy
      });
      const sessionContext = {
        ...ctx,
        req,
        res
      };
      let sessionData;
      try {
        sessionData = await ctx.sessionStrategy.get({ context: sessionContext });
        logger_default.debug("Image upload session check:", {
          hasSession: !!sessionData,
          itemId: sessionData?.itemId,
          cookies: req.headers.cookie ? "present" : "missing"
        });
      } catch (sessionError) {
        logger_default.error("Session check failed for image upload:", {
          error: sessionError?.message,
          stack: sessionError?.stack,
          name: sessionError?.name,
          cookies: req.headers.cookie ? "present" : "missing"
        });
        return res.status(401).json({
          error: "Authentication required",
          details: process.env.NODE_ENV === "development" ? sessionError?.message : void 0
        });
      }
      if (!sessionData?.itemId) {
        logger_default.warn("Image upload attempted without authentication", {
          hasSession: !!sessionData,
          cookies: req.headers.cookie ? "present" : "missing"
        });
        return res.status(401).json({ error: "Authentication required" });
      }
      logger_default.debug("Image upload request from authenticated user:", {
        userId: sessionData.itemId
      });
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
      logger_default.debug("Preparing ImgBB upload:", {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        base64Length: base64Image.length,
        hasApiKey: !!imgbbApiKey
      });
      const formData = new URLSearchParams();
      formData.append("key", imgbbApiKey);
      formData.append("image", base64Image);
      if (file.originalname) {
        formData.append("name", file.originalname);
      }
      const requestBody = formData.toString();
      logger_default.debug("ImgBB request body length:", requestBody.length);
      const https = await import("https");
      const timeoutMs = 3e4;
      try {
        const requestBody2 = formData.toString();
        logger_default.debug("ImgBB request body length:", requestBody2.length);
        const imgbbResponse = await new Promise((resolve, reject) => {
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
                "Content-Length": Buffer.byteLength(requestBody2)
              }
            },
            (res2) => {
              let data = "";
              res2.on("data", (chunk) => {
                data += chunk.toString();
              });
              res2.on("end", () => {
                clearTimeout(timeout);
                logger_default.debug("ImgBB API response:", {
                  statusCode: res2.statusCode,
                  headers: res2.headers,
                  dataLength: data.length,
                  dataPreview: data.substring(0, 200)
                });
                if (!data || data.trim().length === 0) {
                  logger_default.error("ImgBB API returned empty response", {
                    statusCode: res2.statusCode,
                    headers: res2.headers
                  });
                  reject(new Error(`Empty response from ImgBB API (status: ${res2.statusCode})`));
                  return;
                }
                if (res2.statusCode && (res2.statusCode < 200 || res2.statusCode >= 300)) {
                  logger_default.error("ImgBB API returned error status:", {
                    statusCode: res2.statusCode,
                    data: data.substring(0, 1e3),
                    headers: res2.headers
                  });
                }
                try {
                  const jsonData = JSON.parse(data);
                  resolve({
                    statusCode: res2.statusCode || 500,
                    data: jsonData
                  });
                } catch (parseError) {
                  logger_default.error("Failed to parse ImgBB response:", {
                    error: parseError.message,
                    dataLength: data.length,
                    dataPreview: data.substring(0, 1e3),
                    statusCode: res2.statusCode,
                    headers: res2.headers,
                    contentType: res2.headers["content-type"]
                  });
                  reject(new Error(`Failed to parse response: ${parseError.message}. Status: ${res2.statusCode}, Response preview: ${data.substring(0, 200)}`));
                }
              });
              res2.on("error", (error) => {
                clearTimeout(timeout);
                logger_default.error("ImgBB API response error:", error);
                reject(error);
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
          req2.write(requestBody2);
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
        logger_default.error("Failed to upload image to ImgBB:", {
          error: uploadError.message,
          code: uploadError.code,
          stack: uploadError.stack
        });
        if (process.env.NODE_ENV === "development") {
          return res.status(500).json({
            error: "Image upload failed",
            details: uploadError.message || "Unknown error",
            code: uploadError.code
          });
        }
        return res.status(500).json({ error: "Image upload failed. Please try again." });
      }
    } catch (error) {
      logger_default.error("Image upload endpoint error:", {
        error: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        type: typeof error,
        keys: Object.keys(error || {})
      });
      if (error.message?.includes("Authentication") || error.message?.includes("session")) {
        return res.status(401).json({
          error: "Authentication required",
          details: process.env.NODE_ENV === "development" ? error.message : void 0
        });
      }
      res.status(500).json({
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : void 0,
        code: process.env.NODE_ENV === "development" ? error.code : void 0
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
              const lines = textContent.split("\n").filter((line) => line.trim());
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
            const lines = textContent.split("\n").filter((line) => line.trim());
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
  app.use("/api/graphql", async (req, res, next) => {
    if (req.method === "POST" && req.body) {
      const body = req.body;
      const query = body.query || "";
      if (query.includes("authenticateUserWithPassword")) {
        const ip = req.ip || req.connection?.remoteAddress || "unknown";
        const userAgent = req.get("user-agent") || "unknown";
        const variables = body.variables || {};
        const originalEmail = variables.identity || variables.email;
        logger_default.info("[authenticateUserWithPassword] Middleware triggered", {
          hasEmail: !!originalEmail,
          emailType: typeof originalEmail,
          isEmailHash: originalEmail ? isEmailHash(originalEmail) : "N/A",
          emailLength: originalEmail ? originalEmail.length : 0,
          hasIdentity: !!variables.identity,
          hasEmailVar: !!variables.email
        });
        if (originalEmail && typeof originalEmail === "string" && !isEmailHash(originalEmail)) {
          logger_default.info("[authenticateUserWithPassword] Email is not hashed, will hash it");
          try {
            const hashedEmail = hashEmail(originalEmail);
            const ctx = keystoneContext;
            if (ctx) {
              const { createHash: createHash2 } = await import("crypto");
              const hashEmailOld2 = (email) => {
                const normalizedEmail = email.toLowerCase().trim();
                const hash = createHash2("sha256");
                hash.update(normalizedEmail);
                return hash.digest("hex");
              };
              let user = await ctx.sudo().query.User.findMany({
                where: { email: { equals: hashedEmail } },
                take: 1
              });
              logger_default.info(`[authenticateUserWithPassword] Checking user with new hash (HMAC-SHA256): found=${user.length > 0}`);
              if (user.length === 0) {
                const oldHashedEmail = hashEmailOld2(originalEmail);
                logger_default.info(`[authenticateUserWithPassword] User not found with new hash, trying old hash (SHA-256)`);
                user = await ctx.sudo().query.User.findMany({
                  where: { email: { equals: oldHashedEmail } },
                  take: 1
                });
                logger_default.info(`[authenticateUserWithPassword] Checking user with old hash (SHA-256): found=${user.length > 0}`);
                if (user.length > 0) {
                  logger_default.info(`[authenticateUserWithPassword] Found user ${user[0].id} with old email hash format, rehashing to HMAC-SHA256`);
                  await ctx.sudo().query.User.updateOne({
                    where: { id: user[0].id },
                    data: { email: hashedEmail }
                  });
                  const updatedUser = await ctx.sudo().query.User.findMany({
                    where: { id: { equals: user[0].id } },
                    query: "id email",
                    take: 1
                  });
                  if (updatedUser.length > 0 && updatedUser[0].email === hashedEmail) {
                    logger_default.info(`[authenticateUserWithPassword] Rehashed email for user ${user[0].id} from old format to HMAC-SHA256 - verified`);
                  } else {
                    logger_default.error(`[authenticateUserWithPassword] Failed to verify email rehash for user ${user[0].id}`);
                  }
                } else {
                  logger_default.warn(`[authenticateUserWithPassword] User not found with either hash format - authentication will likely fail`);
                }
              } else {
                logger_default.info(`[authenticateUserWithPassword] User found with new hash (HMAC-SHA256)`);
              }
            } else {
              logger_default.warn("[authenticateUserWithPassword] KeystoneJS context not available for email hash migration check");
            }
            variables.identity = hashedEmail;
            if (variables.email) {
              variables.email = hashedEmail;
            }
            body.variables = variables;
            logger_default.info("[authenticateUserWithPassword] Email hashed and passed to KeystoneJS (HMAC-SHA256)");
          } catch (error) {
            logger_default.error("[authenticateUserWithPassword] Failed to hash email:", error);
          }
        } else if (originalEmail && isEmailHash(originalEmail)) {
          logger_default.info("[authenticateUserWithPassword] Email already hashed, passing to KeystoneJS as-is");
        } else {
          logger_default.warn("[authenticateUserWithPassword] Email is missing or invalid", {
            hasEmail: !!originalEmail,
            emailType: typeof originalEmail,
            hasIdentity: !!variables.identity,
            hasEmailVar: !!variables.email
          });
        }
        logLoginAttempt(ip, "hidden", userAgent);
      }
      if (query.includes("sendUserPasswordResetLink") || query.includes("redeemUserPasswordResetToken") || query.includes("validateUserPasswordResetToken")) {
        const variables = body.variables || {};
        if (variables.email && typeof variables.email === "string" && !isEmailHash(variables.email)) {
          try {
            variables.email = hashEmail(variables.email);
            body.variables = variables;
            logger_default.debug("Email hashed for password reset operation", {
              operation: query.match(/(sendUserPasswordResetLink|redeemUserPasswordResetToken|validateUserPasswordResetToken)/)?.[1] || "unknown"
              // НЕ логируем оригинальный email для безопасности
            });
          } catch (error) {
            logger_default.error("Failed to hash email for password reset operation:", error);
          }
        }
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
      if (req.body && req.body.query && req.body.query.includes("authenticateUserWithPassword")) {
        if (body && body.data && body.data.authenticate) {
          const authResult = body.data.authenticate;
          if (authResult.__typename === "UserAuthenticationWithPasswordSuccess") {
            logger_default.info("[authenticateUserWithPassword] Authentication successful", {
              userId: authResult.item?.id
            });
          } else if (authResult.__typename === "UserAuthenticationWithPasswordFailure") {
            logger_default.warn("[authenticateUserWithPassword] Authentication failed", {
              message: authResult.message
            });
          }
        } else if (body && body.errors) {
          logger_default.error("[authenticateUserWithPassword] Authentication error in response", {
            errors: body.errors
          });
        }
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

// src/graphql/combined.ts
var import_core12 = require("@keystone-6/core");

// src/graphql/articles.ts
var import_core11 = require("@keystone-6/core");
var import_zod = require("zod");
var SearchArticlesInputSchema = import_zod.z.object({
  search: import_zod.z.string().optional(),
  tags: import_zod.z.array(import_zod.z.string()).optional(),
  difficulty: import_zod.z.enum(["easy", "medium", "hard", "beginner", "intermediate", "advanced"]).optional(),
  sort: import_zod.z.enum(["newest", "oldest", "popular"]).optional(),
  skip: import_zod.z.number().int().min(0).optional(),
  take: import_zod.z.number().int().min(1).max(100).optional()
});
function extractTextFromSlateDocument(document2) {
  if (!document2) return "";
  let text4 = "";
  const extractTextFromNode = (node) => {
    if (!node) return;
    if (typeof node === "string") {
      text4 += node + " ";
      return;
    }
    if (typeof node === "object") {
      if (node.text && typeof node.text === "string") {
        text4 += node.text + " ";
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          extractTextFromNode(child);
        }
      } else if (node.children) {
        extractTextFromNode(node.children);
      }
    }
  };
  if (Array.isArray(document2)) {
    for (const node of document2) {
      extractTextFromNode(node);
    }
  } else if (typeof document2 === "object") {
    if (Array.isArray(document2.children)) {
      for (const node of document2.children) {
        extractTextFromNode(node);
      }
    } else {
      extractTextFromNode(document2);
    }
  }
  return text4.trim();
}
function hasAllTags(articleTags, filterTags) {
  if (!Array.isArray(articleTags) || filterTags.length === 0) {
    return filterTags.length === 0;
  }
  const normalizedArticleTags = articleTags.map(
    (tag) => String(tag).toLowerCase().trim()
  );
  const normalizedFilterTags = filterTags.map((tag) => tag.toLowerCase().trim());
  return normalizedFilterTags.every(
    (filterTag) => normalizedArticleTags.includes(filterTag)
  );
}
function matchesSearch(text4, searchQuery) {
  if (!searchQuery || searchQuery.trim().length === 0) return true;
  if (!text4 || text4.trim().length === 0) return false;
  const normalizedText = text4.toLowerCase().trim();
  const normalizedSearch = searchQuery.toLowerCase().trim();
  return normalizedText.includes(normalizedSearch);
}
async function searchAndFilterArticles(context, args) {
  const validatedArgs = SearchArticlesInputSchema.parse({
    search: args.search || void 0,
    tags: args.tags || void 0,
    difficulty: args.difficulty || void 0,
    sort: args.sort || "newest",
    skip: args.skip || 0,
    take: args.take || 10
  });
  logger_default.info("[searchArticles] Query received:", {
    search: validatedArgs.search,
    tags: validatedArgs.tags,
    difficulty: validatedArgs.difficulty,
    sort: validatedArgs.sort,
    skip: validatedArgs.skip,
    take: validatedArgs.take
  });
  const where = {
    publishedAt: { not: null }
  };
  if (validatedArgs.difficulty) {
    let difficultyValue = validatedArgs.difficulty;
    const originalValue = difficultyValue;
    if (difficultyValue === "beginner") {
      difficultyValue = "easy";
    } else if (difficultyValue === "intermediate") {
      difficultyValue = "medium";
    } else if (difficultyValue === "advanced") {
      difficultyValue = "hard";
    }
    logger_default.debug(`[searchArticles] Difficulty filter:`, {
      original: originalValue,
      mapped: difficultyValue,
      whereFilter: { equals: difficultyValue }
    });
    where.difficulty = { equals: difficultyValue };
  }
  const allArticles = await context.sudo().query.Article.findMany({
    where,
    query: `
      id
      title
      content {
        document
      }
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
      userReaction
    `
  });
  logger_default.debug(`[searchArticles] Found ${allArticles.length} articles before filtering`);
  if (validatedArgs.difficulty) {
    const difficultyCounts = allArticles.reduce((acc, article) => {
      const diff = article.difficulty || "unknown";
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {});
    logger_default.debug(`[searchArticles] Articles by difficulty before filter:`, difficultyCounts);
  }
  let filteredArticles = allArticles;
  if (validatedArgs.tags && validatedArgs.tags.length > 0) {
    filteredArticles = filteredArticles.filter(
      (article) => hasAllTags(article.tags, validatedArgs.tags)
    );
    logger_default.debug(`[searchArticles] After tags filter: ${filteredArticles.length} articles`);
  }
  if (validatedArgs.search && validatedArgs.search.trim().length > 0) {
    const searchQuery = validatedArgs.search.trim();
    logger_default.debug(`[searchArticles] Filtering by search query: "${searchQuery}"`);
    filteredArticles = filteredArticles.filter((article) => {
      const titleMatch = matchesSearch(article.title || "", searchQuery);
      const excerptMatch = matchesSearch(article.excerpt || "", searchQuery);
      let contentMatch = false;
      let contentText = "";
      if (article.content && article.content.document) {
        contentText = extractTextFromSlateDocument(article.content.document);
        contentMatch = matchesSearch(contentText, searchQuery);
      }
      const matches = titleMatch || excerptMatch || contentMatch;
      if (filteredArticles.indexOf(article) < 3) {
        logger_default.debug(`[searchArticles] Article "${article.title?.substring(0, 50)}...":`, {
          titleMatch,
          excerptMatch,
          contentMatch,
          contentTextLength: contentText.length,
          matches
        });
      }
      return matches;
    });
    logger_default.debug(`[searchArticles] After search filter: ${filteredArticles.length} articles`);
  }
  let sortedArticles = [...filteredArticles];
  if (validatedArgs.sort === "newest") {
    sortedArticles.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  } else if (validatedArgs.sort === "oldest") {
    sortedArticles.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateA - dateB;
    });
  } else if (validatedArgs.sort === "popular") {
    sortedArticles.sort((a, b) => {
      const likesA = (a.likes_count || 0) - (a.dislikes_count || 0);
      const likesB = (b.likes_count || 0) - (b.dislikes_count || 0);
      return likesB - likesA;
    });
  }
  const total = sortedArticles.length;
  const skip = validatedArgs.skip || 0;
  const take = validatedArgs.take || 10;
  const paginatedArticles = sortedArticles.slice(skip, skip + take);
  logger_default.debug("[searchArticles] Paginated articles:", {
    count: paginatedArticles.length,
    firstArticle: paginatedArticles[0] ? {
      id: paginatedArticles[0].id,
      idType: typeof paginatedArticles[0].id,
      hasAuthor: !!paginatedArticles[0].author,
      authorId: paginatedArticles[0].author?.id,
      authorIdType: typeof paginatedArticles[0].author?.id
    } : null
  });
  const serializedArticles = await Promise.all(
    paginatedArticles.map(async (article) => {
      const articleId = typeof article.id === "string" ? parseInt(article.id, 10) : article.id;
      if (!articleId || isNaN(articleId)) {
        logger_default.warn(`[searchArticles] Invalid article ID: ${article.id}`);
        return null;
      }
      try {
        const fullArticle = await context.sudo().query.Article.findOne({
          where: { id: String(articleId) },
          query: `
            id
            title
            content {
              document
            }
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
            comments {
              id
            }
            userReaction
          `
        });
        if (!fullArticle) {
          logger_default.warn(`[searchArticles] Article ${articleId} not found`);
          return null;
        }
        const serialized = {
          ...fullArticle,
          id: articleId
        };
        if (serialized.author && serialized.author.id) {
          const authorId = typeof serialized.author.id === "string" ? parseInt(serialized.author.id, 10) : serialized.author.id;
          if (!isNaN(authorId)) {
            serialized.author = {
              ...serialized.author,
              id: authorId
            };
          }
        }
        if (serialized.publishedAt && typeof serialized.publishedAt === "string") {
          serialized.publishedAt = new Date(serialized.publishedAt);
        }
        if (serialized.createdAt && typeof serialized.createdAt === "string") {
          serialized.createdAt = new Date(serialized.createdAt);
        }
        if (serialized.updatedAt && typeof serialized.updatedAt === "string") {
          serialized.updatedAt = new Date(serialized.updatedAt);
        }
        if (serialized.comments && Array.isArray(serialized.comments)) {
          serialized.comments = serialized.comments.map((comment) => {
            if (comment && comment.id) {
              const commentId = typeof comment.id === "string" ? parseInt(comment.id, 10) : comment.id;
              if (!isNaN(commentId)) {
                return { id: commentId };
              }
            }
            return comment;
          });
        }
        return serialized;
      } catch (error) {
        logger_default.error(`[searchArticles] Failed to load article ${articleId}:`, error);
        return null;
      }
    })
  );
  const validArticles = serializedArticles.filter((article) => article !== null);
  logger_default.debug(`[searchArticles] Loaded ${validArticles.length} full articles from ${paginatedArticles.length} filtered articles`);
  logger_default.info(`[searchArticles] Returning ${serializedArticles.length} articles (total: ${total})`);
  if (!Array.isArray(serializedArticles)) {
    logger_default.error("[searchArticles] serializedArticles is not an array:", typeof serializedArticles);
    return {
      articles: [],
      total: 0
    };
  }
  return {
    articles: serializedArticles,
    total
  };
}

// src/graphql/combined.ts
var extendGraphqlSchema = import_core12.graphql.extend((base) => {
  const ReactionType = import_core12.graphql.enum({
    name: "ReactionType",
    values: import_core12.graphql.enumValues(["like", "dislike"])
  });
  const SearchArticleAuthor = import_core12.graphql.object()({
    name: "SearchArticleAuthor",
    fields: {
      id: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) }),
      username: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.String) }),
      avatar: import_core12.graphql.field({ type: import_core12.graphql.String })
    }
  });
  const ReactToArticleAuthor = import_core12.graphql.object()({
    name: "ReactToArticleAuthor",
    fields: {
      id: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) }),
      username: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.String) }),
      avatar: import_core12.graphql.field({ type: import_core12.graphql.String })
    }
  });
  const ReactToArticleContent = import_core12.graphql.object()({
    name: "ReactToArticleContent",
    fields: {
      document: import_core12.graphql.field({ type: import_core12.graphql.JSON })
    }
  });
  const ReactToArticleResult = import_core12.graphql.object()({
    name: "ReactToArticleResult",
    fields: {
      id: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) }),
      title: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.String) }),
      content: import_core12.graphql.field({
        type: ReactToArticleContent,
        resolve: (article) => article.content
      }),
      excerpt: import_core12.graphql.field({ type: import_core12.graphql.String }),
      author: import_core12.graphql.field({
        type: ReactToArticleAuthor,
        resolve: (article) => article.author
      }),
      previewImage: import_core12.graphql.field({ type: import_core12.graphql.String }),
      tags: import_core12.graphql.field({ type: import_core12.graphql.list(import_core12.graphql.nonNull(import_core12.graphql.String)) }),
      difficulty: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.String) }),
      likes_count: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.Int) }),
      dislikes_count: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.Int) }),
      views: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.Int) }),
      publishedAt: import_core12.graphql.field({ type: import_core12.graphql.DateTime }),
      createdAt: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.DateTime) }),
      updatedAt: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.DateTime) }),
      comments: import_core12.graphql.field({
        type: import_core12.graphql.list(import_core12.graphql.object()({
          name: "ReactToArticleComment",
          fields: {
            id: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) })
          }
        })),
        resolve: (article) => article.comments
      }),
      userReaction: import_core12.graphql.field({ type: import_core12.graphql.String })
    }
  });
  const SearchArticleContent = import_core12.graphql.object()({
    name: "SearchArticleContent",
    fields: {
      document: import_core12.graphql.field({
        type: import_core12.graphql.JSON,
        resolve: (content) => content?.document || content
      })
    }
  });
  const SearchArticle = import_core12.graphql.object()({
    name: "SearchArticle",
    fields: {
      id: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) }),
      title: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.String) }),
      content: import_core12.graphql.field({
        type: SearchArticleContent,
        resolve: (article) => article.content
      }),
      excerpt: import_core12.graphql.field({ type: import_core12.graphql.String }),
      author: import_core12.graphql.field({
        type: SearchArticleAuthor,
        resolve: (article) => article.author
      }),
      previewImage: import_core12.graphql.field({ type: import_core12.graphql.String }),
      tags: import_core12.graphql.field({ type: import_core12.graphql.list(import_core12.graphql.nonNull(import_core12.graphql.String)) }),
      difficulty: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.String) }),
      likes_count: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.Int) }),
      dislikes_count: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.Int) }),
      views: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.Int) }),
      publishedAt: import_core12.graphql.field({ type: import_core12.graphql.DateTime }),
      createdAt: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.DateTime) }),
      updatedAt: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.DateTime) }),
      comments: import_core12.graphql.field({
        type: import_core12.graphql.list(import_core12.graphql.object()({
          name: "SearchArticleComment",
          fields: {
            id: import_core12.graphql.field({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) })
          }
        })),
        resolve: (article) => article.comments || []
      }),
      userReaction: import_core12.graphql.field({ type: import_core12.graphql.String })
    }
  });
  const SearchArticlesResult = import_core12.graphql.object()({
    name: "SearchArticlesResult",
    fields: {
      articles: import_core12.graphql.field({
        type: import_core12.graphql.list(SearchArticle),
        resolve: (result) => result.articles
      }),
      total: import_core12.graphql.field({
        type: import_core12.graphql.nonNull(import_core12.graphql.Int),
        resolve: (result) => result.total
      })
    }
  });
  return {
    query: {
      // Query для поиска и фильтрации статей
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Возвращаем объект с articles и total вместо просто массива
      searchArticles: import_core12.graphql.field({
        type: SearchArticlesResult,
        args: {
          search: import_core12.graphql.arg({ type: import_core12.graphql.String }),
          tags: import_core12.graphql.arg({ type: import_core12.graphql.list(import_core12.graphql.String) }),
          difficulty: import_core12.graphql.arg({ type: import_core12.graphql.String }),
          sort: import_core12.graphql.arg({ type: import_core12.graphql.String }),
          skip: import_core12.graphql.arg({ type: import_core12.graphql.Int }),
          take: import_core12.graphql.arg({ type: import_core12.graphql.Int })
        },
        async resolve(root, args, context) {
          try {
            logger_default.debug("[searchArticles] Resolver called with args:", args);
            const normalizedArgs = {
              search: args.search ?? void 0,
              tags: args.tags ? args.tags.filter((tag) => tag !== null) : void 0,
              difficulty: args.difficulty ?? void 0,
              sort: args.sort ?? void 0,
              skip: args.skip ?? void 0,
              take: args.take ?? void 0
            };
            const result = await searchAndFilterArticles(context, normalizedArgs);
            logger_default.debug("[searchArticles] Result from searchAndFilterArticles:", {
              articlesCount: result.articles?.length || 0,
              total: result.total,
              firstArticleId: result.articles?.[0]?.id,
              firstArticleIdType: typeof result.articles?.[0]?.id
            });
            if (result.articles && result.articles.length > 0) {
              logger_default.debug("[searchArticles] First article before return:", {
                id: result.articles[0].id,
                idType: typeof result.articles[0].id,
                hasAuthor: !!result.articles[0].author,
                author: result.articles[0].author ? {
                  id: result.articles[0].author.id,
                  idType: typeof result.articles[0].author.id,
                  username: result.articles[0].author.username
                } : null
              });
            }
            return {
              articles: result.articles,
              total: result.total
            };
          } catch (error) {
            logger_default.error("[searchArticles] Error:", error);
            throw error;
          }
        }
      })
    },
    mutation: {
      // Mutation для реакций на статьи
      // Используем кастомный тип, чтобы избежать автоматической загрузки связанных данных
      reactToArticle: import_core12.graphql.field({
        type: ReactToArticleResult,
        args: {
          articleId: import_core12.graphql.arg({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) }),
          reaction: import_core12.graphql.arg({
            type: import_core12.graphql.nonNull(ReactionType)
          })
        },
        async resolve(root, { articleId, reaction }, context) {
          logger_default.info(`[reactToArticle] START: articleId=${articleId}, reaction=${reaction}`);
          const session2 = context.session;
          if (!session2?.itemId) {
            logger_default.error(`[reactToArticle] Authentication required`);
            throw new Error("Authentication required");
          }
          const userId = session2.itemId;
          const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : userId;
          if (isNaN(userIdNum)) {
            logger_default.error(`[reactToArticle] Invalid userId: ${userId}`);
            throw new Error("Invalid user ID");
          }
          logger_default.info(`[reactToArticle] userId=${userIdNum}`);
          const articleIdNum = typeof articleId === "string" ? parseInt(articleId, 10) : articleId;
          if (isNaN(articleIdNum)) {
            logger_default.error(`[reactToArticle] Invalid articleId: ${articleId}`);
            throw new Error("Invalid article ID");
          }
          if (reaction !== "like" && reaction !== "dislike") {
            logger_default.error(`[reactToArticle] Invalid reaction type: ${reaction}`);
            throw new Error("Invalid reaction type");
          }
          const article = await context.query.Article.findOne({
            where: { id: String(articleIdNum) },
            query: `
              id
              likes_count
              dislikes_count
              author {
                id
              }
            `
          });
          if (!article) {
            logger_default.error(`[reactToArticle] Article not found: articleId=${articleIdNum}`);
            throw new Error("Article not found");
          }
          const existingReactionResult = await context.query.ArticleReaction.findMany({
            where: {
              article: { id: { equals: String(articleIdNum) } },
              user: { id: { equals: userIdNum } }
            },
            query: "id reaction",
            take: 1
          });
          const existingReaction = Array.isArray(existingReactionResult) ? existingReactionResult : [];
          let finalUserReaction = null;
          const previousLikes = article.likes_count || 0;
          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            if (currentReaction === reaction) {
              await context.sudo().query.ArticleReaction.deleteOne({
                where: { id: existingReaction[0].id }
              });
              finalUserReaction = null;
            } else {
              await context.sudo().query.ArticleReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction }
              });
              finalUserReaction = reaction;
            }
          } else {
            await context.query.ArticleReaction.createOne({
              data: {
                article: { connect: { id: String(articleIdNum) } },
                user: { connect: { id: userIdNum } },
                reaction
              }
            });
            finalUserReaction = reaction;
          }
          const likeReactions = await context.sudo().query.ArticleReaction.count({
            where: {
              article: { id: { equals: String(articleIdNum) } },
              reaction: { equals: "like" }
            }
          });
          const dislikeReactions = await context.sudo().query.ArticleReaction.count({
            where: {
              article: { id: { equals: String(articleIdNum) } },
              reaction: { equals: "dislike" }
            }
          });
          const newLikes = likeReactions;
          const newDislikes = dislikeReactions;
          await context.sudo().query.Article.updateOne({
            where: { id: String(articleIdNum) },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes
            },
            query: "id"
          });
          if (reaction === "like" && finalUserReaction === "like" && article.author?.id) {
            try {
              const thresholds = [1, 5, 10, 50, 100, 500, 1e3];
              const threshold = shouldNotifyAboutLike(newLikes, previousLikes, thresholds);
              if (threshold !== null) {
                const timeWindow = threshold === 1 ? 60 * 60 * 1e3 : void 0;
                const cutoffTime = timeWindow ? new Date(Date.now() - timeWindow) : null;
                const where = {
                  user: { id: { equals: String(article.author.id) } },
                  article: { id: { equals: String(articleIdNum) } },
                  type: { equals: "article_like" }
                };
                if (cutoffTime) {
                  where.createdAt = { gte: cutoffTime.toISOString() };
                }
                const existingNotifications = await context.sudo().query.Notification.findMany({
                  where,
                  query: "id metadata createdAt"
                });
                const hasNotificationForThreshold = existingNotifications.some(
                  (notif) => notif.metadata?.threshold === threshold
                );
                if (!hasNotificationForThreshold) {
                  await createNotification(context, {
                    type: "article_like",
                    userId: article.author.id,
                    actorId: userIdNum,
                    articleId: String(articleIdNum),
                    metadata: {
                      threshold,
                      likesCount: newLikes
                    }
                  }, true);
                }
              }
            } catch (error) {
              logger_default.error(`[reactToArticle] Failed to create like notification:`, error);
            }
          }
          const articleData = await context.sudo().prisma.article.findUnique({
            where: { id: articleIdNum },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true
                }
              },
              comments: {
                select: {
                  id: true
                }
              }
            }
          });
          if (!articleData) {
            logger_default.error(`[reactToArticle] Article not found after update: articleId=${articleIdNum}`);
            throw new Error("Article not found");
          }
          const userReactionRecord = await context.sudo().prisma.articleReaction.findFirst({
            where: {
              articleId: articleIdNum,
              userId: userIdNum
            },
            select: {
              reaction: true
            }
          });
          const userReaction = userReactionRecord?.reaction || null;
          const updatedArticle = {
            id: String(articleData.id),
            title: articleData.title,
            content: articleData.content,
            excerpt: articleData.excerpt,
            author: articleData.author ? {
              id: String(articleData.author.id),
              username: articleData.author.username,
              avatar: articleData.author.avatar
            } : null,
            previewImage: articleData.previewImage,
            tags: Array.isArray(articleData.tags) ? articleData.tags : [],
            difficulty: articleData.difficulty,
            likes_count: articleData.likes_count,
            dislikes_count: articleData.dislikes_count,
            views: articleData.views,
            publishedAt: articleData.publishedAt,
            createdAt: articleData.createdAt,
            updatedAt: articleData.updatedAt,
            comments: articleData.comments.map((c) => ({ id: String(c.id) })),
            userReaction
          };
          return updatedArticle;
        }
      }),
      // Mutation для реакций на комментарии
      reactToComment: import_core12.graphql.field({
        type: base.object("Comment"),
        args: {
          commentId: import_core12.graphql.arg({ type: import_core12.graphql.nonNull(import_core12.graphql.ID) }),
          reaction: import_core12.graphql.arg({
            type: import_core12.graphql.nonNull(ReactionType)
          })
        },
        async resolve(root, { commentId, reaction }, context) {
          logger_default.info(`[reactToComment] START: commentId=${commentId}, reaction=${reaction}`);
          const session2 = context.session;
          if (!session2?.itemId) {
            logger_default.error(`[reactToComment] Authentication required`);
            throw new Error("Authentication required");
          }
          const userId = session2.itemId;
          if (reaction !== "like" && reaction !== "dislike") {
            logger_default.error(`[reactToComment] Invalid reaction type: ${reaction}`);
            throw new Error("Invalid reaction type");
          }
          const comment = await context.query.Comment.findOne({
            where: { id: commentId },
            query: `
              id
              likes_count
              dislikes_count
              author {
                id
              }
              article {
                id
              }
            `
          });
          if (!comment) {
            logger_default.error(`[reactToComment] Comment not found: commentId=${commentId}`);
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
          const previousLikes = comment.likes_count || 0;
          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            if (currentReaction === reaction) {
              await context.sudo().query.CommentReaction.deleteOne({
                where: { id: existingReaction[0].id }
              });
              finalUserReaction = null;
            } else {
              await context.sudo().query.CommentReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction }
              });
              finalUserReaction = reaction;
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
          }
          const likeReactions = await context.sudo().query.CommentReaction.count({
            where: {
              comment: { id: { equals: commentId } },
              reaction: { equals: "like" }
            }
          });
          const dislikeReactions = await context.sudo().query.CommentReaction.count({
            where: {
              comment: { id: { equals: commentId } },
              reaction: { equals: "dislike" }
            }
          });
          const newLikes = likeReactions;
          const newDislikes = dislikeReactions;
          await context.sudo().query.Comment.updateOne({
            where: { id: commentId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes
            },
            query: "id"
          });
          if (reaction === "like" && finalUserReaction === "like" && comment.author?.id) {
            try {
              const thresholds = [1, 3, 5, 10, 25];
              const threshold = shouldNotifyAboutLike(newLikes, previousLikes, thresholds);
              if (threshold !== null) {
                const timeWindow = threshold === 1 ? 60 * 60 * 1e3 : void 0;
                const cutoffTime = timeWindow ? new Date(Date.now() - timeWindow) : null;
                const where = {
                  user: { id: { equals: String(comment.author.id) } },
                  comment: { id: { equals: commentId } },
                  type: { equals: "comment_like" }
                };
                if (cutoffTime) {
                  where.createdAt = { gte: cutoffTime.toISOString() };
                }
                const existingNotifications = await context.sudo().query.Notification.findMany({
                  where,
                  query: "id metadata createdAt"
                });
                const hasNotificationForThreshold = existingNotifications.some(
                  (notif) => notif.metadata?.threshold === threshold
                );
                if (!hasNotificationForThreshold) {
                  await createNotification(context, {
                    type: "comment_like",
                    userId: comment.author.id,
                    actorId: userId,
                    articleId: comment.article?.id,
                    commentId,
                    metadata: {
                      threshold,
                      likesCount: newLikes
                    }
                  }, true);
                }
              }
            } catch (error) {
              logger_default.error(`[reactToComment] Failed to create like notification:`, error);
            }
          }
          const updatedComment = await context.sudo().query.Comment.findOne({
            where: { id: commentId },
            query: `
              id
              text
              likes_count
              dislikes_count
              userReaction
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
            `
          });
          return updatedComment;
        }
      }),
      // Mutation для обновления профиля пользователя
      updateProfile: import_core12.graphql.field({
        type: base.object("User"),
        args: {
          username: import_core12.graphql.arg({ type: import_core12.graphql.String }),
          bio: import_core12.graphql.arg({ type: import_core12.graphql.String }),
          avatar: import_core12.graphql.arg({ type: import_core12.graphql.String }),
          coverImage: import_core12.graphql.arg({ type: import_core12.graphql.String })
        },
        async resolve(root, args, context) {
          logger_default.info("[updateProfile] START:", {
            hasUsername: !!args.username,
            hasBio: args.bio !== void 0,
            hasAvatar: args.avatar !== void 0,
            hasCoverImage: args.coverImage !== void 0
          });
          const session2 = context.session;
          if (!session2?.itemId) {
            logger_default.error("[updateProfile] Authentication required");
            throw new Error("Authentication required");
          }
          const userId = session2.itemId;
          logger_default.info(`[updateProfile] userId=${userId}`);
          if (args.username !== void 0 && (args.username.length < 3 || args.username.length > 50)) {
            throw new Error("Username must be between 3 and 50 characters");
          }
          if (args.bio !== void 0 && args.bio !== null && args.bio.length > 500) {
            throw new Error("Bio must be 500 characters or less");
          }
          const updateData = {};
          if (args.username !== void 0) {
            updateData.username = args.username;
          }
          if (args.bio !== void 0) {
            updateData.bio = args.bio === null || args.bio === "" ? null : args.bio.trim();
          }
          if (args.avatar !== void 0) {
            updateData.avatar = args.avatar === null || args.avatar === "" ? null : args.avatar;
          }
          if (args.coverImage !== void 0) {
            updateData.coverImage = args.coverImage === null || args.coverImage === "" ? null : args.coverImage;
          }
          logger_default.debug("[updateProfile] Update data prepared:", {
            hasUsername: "username" in updateData,
            hasBio: "bio" in updateData,
            bioValue: "bio" in updateData ? updateData.bio === null ? "null" : `"${updateData.bio.substring(0, 50)}"` : "not set",
            hasAvatar: "avatar" in updateData,
            avatarValue: "avatar" in updateData ? updateData.avatar === null ? "null" : "url" : "not set",
            hasCoverImage: "coverImage" in updateData,
            coverImageValue: "coverImage" in updateData ? updateData.coverImage === null ? "null" : "url" : "not set"
          });
          logger_default.info(`[updateProfile] Updating user profile: userId=${userId}`);
          logger_default.debug("[updateProfile] UpdateData before update:", JSON.stringify(updateData, null, 2));
          const currentUser = await context.sudo().query.User.findOne({
            where: { id: String(userId) },
            query: "id username bio avatar coverImage"
            // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрали email из query
          });
          if (!currentUser) {
            logger_default.error(`[updateProfile] User not found: userId=${userId}`);
            throw new Error("User not found");
          }
          const finalUpdateData = {};
          if (args.username !== void 0 && args.username !== currentUser.username) {
            finalUpdateData.username = args.username;
          }
          if (args.bio !== void 0) {
            const newBio = args.bio === null || args.bio === "" ? "" : args.bio.trim();
            const currentBio = currentUser.bio || "";
            if (newBio !== currentBio) {
              finalUpdateData.bio = newBio;
            }
          }
          if (args.avatar !== void 0) {
            const newAvatar = args.avatar === null || args.avatar === "" ? null : args.avatar;
            if (newAvatar !== currentUser.avatar) {
              finalUpdateData.avatar = newAvatar;
            }
          }
          if (args.coverImage !== void 0) {
            const newCoverImage = args.coverImage === null || args.coverImage === "" ? null : args.coverImage;
            if (newCoverImage !== currentUser.coverImage) {
              finalUpdateData.coverImage = newCoverImage;
            }
          }
          logger_default.debug("[updateProfile] Final update data:", JSON.stringify(finalUpdateData, null, 2));
          let updatedUser;
          if (Object.keys(finalUpdateData).length > 0) {
            updatedUser = await context.sudo().query.User.updateOne({
              where: { id: String(userId) },
              data: finalUpdateData,
              query: "id username bio avatar coverImage createdAt updatedAt"
              // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрали email из query
            });
          } else {
            updatedUser = await context.sudo().query.User.findOne({
              where: { id: String(userId) },
              query: "id username bio avatar coverImage createdAt updatedAt"
              // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрали email из query
            });
          }
          if (!updatedUser) {
            logger_default.error(`[updateProfile] User not found after update: userId=${userId}`);
            throw new Error("User not found");
          }
          const result = {
            ...updatedUser,
            createdAt: updatedUser.createdAt instanceof Date ? updatedUser.createdAt : new Date(updatedUser.createdAt),
            updatedAt: updatedUser.updatedAt instanceof Date ? updatedUser.updatedAt : new Date(updatedUser.updatedAt)
          };
          logger_default.info(`[updateProfile] SUCCESS: userId=${userId}, username=${result.username}`);
          return result;
        }
      })
    }
  };
});

// keystone.ts
var databaseURL = process.env.DATABASE_URL || "file:./.tmp/data.db";
var getDatabaseProvider = () => {
  if (databaseURL.startsWith("postgresql://") || databaseURL.startsWith("postgres://")) {
    return "postgresql";
  }
  return "sqlite";
};
var dbProvider = getDatabaseProvider();
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
var emailHmacSecret = process.env.EMAIL_HMAC_SECRET;
if (!emailHmacSecret || emailHmacSecret.length < 32) {
  logger_default.error("\u274C SECURITY WARNING: EMAIL_HMAC_SECRET is too short or missing!");
  logger_default.error("   EMAIL_HMAC_SECRET must be at least 32 characters long.");
  logger_default.error("   Generate a secure secret: openssl rand -base64 64");
  if (process.env.NODE_ENV === "production") {
    logger_default.error("   Application will not start in production with weak EMAIL_HMAC_SECRET.");
    process.exit(1);
  } else {
    logger_default.warn("   \u26A0\uFE0F  EMAIL_HMAC_SECRET not set or too short - email hashing will fail");
  }
} else {
  logger_default.info("\u2705 EMAIL_HMAC_SECRET is secure (length: " + emailHmacSecret.length + " characters)");
}
if (process.env.NODE_ENV === "production") {
  const requiredVars = ["DATABASE_URL", "FRONTEND_URL", "SESSION_SECRET", "EMAIL_HMAC_SECRET"];
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    logger_default.error(`\u274C Missing required environment variables for production: ${missing.join(", ")}`);
    logger_default.error("   Application cannot start without these variables.");
    process.exit(1);
  }
  logger_default.info("\u2705 All required environment variables are set for production");
}
var keystone_default = withAuth(
  (0, import_core13.config)({
    db: {
      provider: dbProvider,
      url: databaseURL,
      useMigrations: true,
      idField: { kind: dbProvider === "postgresql" ? "uuid" : "autoincrement" }
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
        if (userRole !== "admin") {
          logAdminAccessDenied(ip, String(userId), `User role is '${userRole}', not 'admin'`, userAgent);
          return false;
        }
        logAdminAccessGranted(ip, String(userId), "hidden", userAgent);
        return true;
      }
    }
  })
);
//# sourceMappingURL=config.js.map

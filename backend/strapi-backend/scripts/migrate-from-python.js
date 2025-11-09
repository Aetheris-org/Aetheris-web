/**
 * Migration script: Python/FastAPI SQLite → Strapi
 * 
 * This script reads data from the old Python backend's SQLite database
 * and migrates it to Strapi using the Entity Service API.
 * 
 * Usage: node scripts/migrate-from-python.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to old SQLite database
const OLD_DB_PATH = path.join(__dirname, '../../articles.db');

console.log('🔄 Starting migration from Python backend to Strapi...');
console.log(`📂 Old database: ${OLD_DB_PATH}`);

// Open old database
const oldDb = new sqlite3.Database(OLD_DB_PATH, (err) => {
  if (err) {
    console.error('❌ Failed to connect to old database:', err.message);
    console.log('\n⚠️  Skipping data migration. Run this script later if you have existing data to migrate.');
    process.exit(0);
  }
  console.log('✅ Connected to old SQLite database');
});

/**
 * Map old user usernames to new Strapi user IDs
 * Since we use Google OAuth, users are already in Strapi
 */
const usernameToIdMap = {};

/**
 * Map old article IDs to new Strapi article IDs
 */
const articleIdMap = {};

/**
 * Main migration function
 */
async function migrate() {
  try {
    // Import Strapi
    const { default: Strapi } = await import('@strapi/strapi');
    const strapi = await Strapi().load();

    console.log('\n📊 Step 1: Mapping users...');
    await mapUsers(strapi);

    console.log('\n📄 Step 2: Migrating articles...');
    await migrateArticles(strapi, oldDb);

    console.log('\n💬 Step 3: Migrating comments...');
    await migrateComments(strapi, oldDb);

    console.log('\n🔖 Step 4: Migrating bookmarks...');
    await migrateBookmarks(strapi, oldDb);

    console.log('\n🔔 Step 5: Migrating notifications...');
    await migrateNotifications(strapi, oldDb);

    console.log('\n✅ Migration completed successfully!');
    
    // Close connections
    oldDb.close();
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    oldDb.close();
    process.exit(1);
  }
}

/**
 * Map old usernames to new Strapi user IDs
 */
async function mapUsers(strapi) {
  const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
    fields: ['id', 'username'],
    limit: 1000
  });

  for (const user of users) {
    usernameToIdMap[user.username] = user.id;
  }

  console.log(`✅ Mapped ${users.length} users`);
}

/**
 * Migrate articles from old DB to Strapi
 */
async function migrateArticles(strapi, oldDb) {
  return new Promise((resolve, reject) => {
    oldDb.all('SELECT * FROM articles', [], async (err, rows) => {
      if (err) {
        console.error('❌ Error reading articles:', err);
        return reject(err);
      }

      console.log(`📄 Found ${rows.length} articles to migrate`);

      for (const row of rows) {
        try {
          // Map author username to user ID
          const authorId = usernameToIdMap[row.author];
          if (!authorId) {
            console.warn(`⚠️  Skipping article ${row.id}: author "${row.author}" not found in Strapi`);
            continue;
          }

          // Parse tags
          let tags = [];
          try {
            tags = row.tags ? JSON.parse(row.tags) : [];
          } catch (e) {
            tags = row.tags ? row.tags.split(',').map(t => t.trim()) : [];
          }

          // Create article in Strapi
          const article = await strapi.entityService.create('api::article.article', {
            data: {
              title: row.title,
              content: row.content,
              author: authorId,
              tags: tags,
              difficulty: row.difficulty || 'medium',
              likes_count: row.likes || 0,
              dislikes_count: row.dislikes || 0,
              comments_count: row.comments_count || 0,
              publishedAt: row.status === 'published' ? row.created_at || new Date() : null,
              createdAt: row.created_at,
              updatedAt: row.created_at
            }
          });

          articleIdMap[row.id] = article.id;
          console.log(`✅ Migrated article: "${row.title}" (${row.id} → ${article.id})`);
        } catch (error) {
          console.error(`❌ Error migrating article ${row.id}:`, error.message);
        }
      }

      console.log(`✅ Migrated ${Object.keys(articleIdMap).length} articles`);
      resolve();
    });
  });
}

/**
 * Migrate comments from old DB to Strapi
 */
async function migrateComments(strapi, oldDb) {
  return new Promise((resolve, reject) => {
    oldDb.all('SELECT * FROM comments ORDER BY id ASC', [], async (err, rows) => {
      if (err) {
        console.error('❌ Error reading comments:', err);
        return reject(err);
      }

      console.log(`💬 Found ${rows.length} comments to migrate`);

      const commentIdMap = {};

      for (const row of rows) {
        try {
          // Map author ID
          const authorId = row.author_id;
          if (!authorId) {
            console.warn(`⚠️  Skipping comment ${row.id}: no author ID`);
            continue;
          }

          // Map article ID
          const newArticleId = articleIdMap[row.article_id];
          if (!newArticleId) {
            console.warn(`⚠️  Skipping comment ${row.id}: article ${row.article_id} not found`);
            continue;
          }

          // Map parent ID if exists
          let newParentId = null;
          if (row.parent_id) {
            newParentId = commentIdMap[row.parent_id];
            if (!newParentId) {
              console.warn(`⚠️  Comment ${row.id}: parent ${row.parent_id} not found yet`);
            }
          }

          // Create comment in Strapi
          const comment = await strapi.entityService.create('api::comment.comment', {
            data: {
              text: row.text,
              article: newArticleId,
              author: authorId,
              parent: newParentId,
              likes_count: row.likes || 0,
              dislikes_count: row.dislikes || 0,
              updated_at_custom: row.updated_at,
              createdAt: row.created_at,
              updatedAt: row.updated_at || row.created_at
            }
          });

          commentIdMap[row.id] = comment.id;
          console.log(`✅ Migrated comment ${row.id} → ${comment.id}`);
        } catch (error) {
          console.error(`❌ Error migrating comment ${row.id}:`, error.message);
        }
      }

      console.log(`✅ Migrated ${Object.keys(commentIdMap).length} comments`);
      resolve();
    });
  });
}

/**
 * Migrate bookmarks from old DB to Strapi
 */
async function migrateBookmarks(strapi, oldDb) {
  return new Promise((resolve, reject) => {
    oldDb.all('SELECT * FROM article_bookmarks', [], async (err, rows) => {
      if (err) {
        console.error('❌ Error reading bookmarks:', err);
        return reject(err);
      }

      console.log(`🔖 Found ${rows.length} bookmarks to migrate`);

      let migratedCount = 0;
      for (const row of rows) {
        try {
          const newArticleId = articleIdMap[row.article_id];
          if (!newArticleId) {
            console.warn(`⚠️  Skipping bookmark: article ${row.article_id} not found`);
            continue;
          }

          await strapi.entityService.create('api::article-bookmark.article-bookmark', {
            data: {
              user: row.user_id,
              article: newArticleId,
              createdAt: row.created_at,
              updatedAt: row.created_at
            }
          });

          migratedCount++;
        } catch (error) {
          console.error(`❌ Error migrating bookmark:`, error.message);
        }
      }

      console.log(`✅ Migrated ${migratedCount} bookmarks`);
      resolve();
    });
  });
}

/**
 * Migrate notifications from old DB to Strapi
 */
async function migrateNotifications(strapi, oldDb) {
  return new Promise((resolve, reject) => {
    oldDb.all('SELECT * FROM notifications', [], async (err, rows) => {
      if (err) {
        console.error('❌ Error reading notifications:', err);
        return reject(err);
      }

      console.log(`🔔 Found ${rows.length} notifications to migrate`);

      let migratedCount = 0;
      for (const row of rows) {
        try {
          const newArticleId = row.related_article_id ? articleIdMap[row.related_article_id] : null;

          await strapi.entityService.create('api::notification.notification', {
            data: {
              user: row.user_id,
              type: row.type,
              title: row.title,
              message: row.message,
              is_read: row.is_read === 1,
              related_article: newArticleId,
              related_comment: null, // Comment mapping would require separate map
              createdAt: row.created_at,
              updatedAt: row.created_at
            }
          });

          migratedCount++;
        } catch (error) {
          console.error(`❌ Error migrating notification:`, error.message);
        }
      }

      console.log(`✅ Migrated ${migratedCount} notifications`);
      resolve();
    });
  });
}

// Run migration
migrate();


/**
 * Скрипт для создания тестовых статей в Strapi v5 (через SQLite)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '.tmp', 'data.db');

const slugify = (value) =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 200);

function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function seedArticles() {
  console.log('🌱 Создание тестовых статей...\n');

  const db = new sqlite3.Database(DB_PATH);

  try {
    console.log('1️⃣ Поиск пользователя (автора)...');
    const author = await getAsync(db, `SELECT id FROM up_users LIMIT 1`);

    if (!author) {
      console.error('❌ Пользователь не найден. Сначала авторизуйтесь через Google OAuth.');
      return;
    }

    console.log(`✅ Автор найден (ID: ${author.id})\n`);

    const existing = await getAsync(
      db,
      `SELECT id FROM articles_author_lnk WHERE user_id = ? LIMIT 1`,
      [author.id]
    );

    if (existing) {
      console.log('ℹ️  Статьи уже существуют. Пропускаем сидинг.\n');
      return;
    }

    const now = new Date().toISOString();
    const articles = [
      {
        title: 'Getting Started with React and TypeScript',
        excerpt:
          'Learn how to combine React with TypeScript for building type-safe web applications.',
        difficulty: 'easy',
        tags: ['react', 'typescript', 'tutorial'],
        content: `# Introduction to React with TypeScript

React and TypeScript are a powerful combination for building modern web applications. TypeScript adds static typing to JavaScript, which helps catch errors early and improves code quality.

## Why Use TypeScript with React?

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Improved autocomplete and refactoring
3. **Self-Documenting Code**: Types serve as documentation
4. **Easier Refactoring**: Confidence when making changes

## Getting Started

First, create a new React app with TypeScript:

\`\`\`bash
npx create-react-app my-app --template typescript
\`\`\`

## Basic Component Example

\`\`\`typescript
interface Props {
  name: string;
  age: number;
}

const UserCard: React.FC<Props> = ({ name, age }) => {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
};
\`\`\`

This is just the beginning of your TypeScript journey with React!`,
      },
      {
        title: 'Advanced State Management with Zustand',
        excerpt:
          'Discover Zustand, a lightweight and powerful state management solution for React applications.',
        difficulty: 'medium',
        tags: ['react', 'zustand', 'state-management'],
        content: `# Zustand: A Minimalist State Management Solution

Zustand is a small, fast, and scalable state management library for React. It's simpler than Redux and more flexible than Context API.

## Why Zustand?

- **Minimal Boilerplate**: No providers or reducers needed
- **TypeScript Support**: First-class TypeScript support
- **DevTools**: Works with Redux DevTools
- **Small Bundle Size**: Only 1KB gzipped

## Creating a Store

\`\`\`typescript
import create from 'zustand'

interface BearState {
  bears: number
  increase: () => void
  decrease: () => void
}

const useStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
}))
\`\`\`

## Using the Store

\`\`\`typescript
function BearCounter() {
  const bears = useStore((state) => state.bears)
  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increase = useStore((state) => state.increase)
  return <button onClick={increase}>Add bear</button>
}
\`\`\`

Zustand makes state management simple and enjoyable!`,
      },
      {
        title: 'Building RESTful APIs with Strapi',
        excerpt: 'Learn how to build powerful RESTful APIs quickly using Strapi headless CMS.',
        difficulty: 'medium',
        tags: ['strapi', 'api', 'cms', 'backend'],
        content: `# Strapi: The Leading Open-Source Headless CMS

Strapi is a flexible, open-source headless CMS that gives developers the freedom to choose their favorite tools and frameworks.

## Key Features

- **Customizable**: Extend and customize everything
- **Self-Hosted**: Full control over your data
- **RESTful & GraphQL**: Choose your API style
- **Role-Based Access Control**: Secure your content

## Getting Started

Install Strapi with one command:

\`\`\`bash
npx create-strapi-app@latest my-project --quickstart
\`\`\`

## Creating a Content Type

1. Go to Content-Type Builder
2. Click "Create new collection type"
3. Add fields (text, media, relations, etc.)
4. Save and restart

## API Endpoints

Strapi automatically generates REST endpoints:

- GET /api/articles - List all articles
- GET /api/articles/:id - Get one article
- POST /api/articles - Create article
- PUT /api/articles/:id - Update article
- DELETE /api/articles/:id - Delete article

## Permissions

Configure who can access what in Settings → Users & Permissions Plugin → Roles.

Start building your API in minutes with Strapi!`,
      },
      {
        title: 'Mastering Tailwind CSS',
        excerpt: 'Master the utility-first approach to CSS with Tailwind and build beautiful UIs faster.',
        difficulty: 'easy',
        tags: ['css', 'tailwind', 'design', 'frontend'],
        content: `# Tailwind CSS: Utility-First CSS Framework

Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without leaving your HTML.

## Why Tailwind?

- **Rapid Development**: Build faster with utility classes
- **Customizable**: Configure everything via tailwind.config.js
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Built-in dark mode support

## Installation

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

## Basic Example

\`\`\`html
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
    Hello Tailwind!
  </h2>
  <p class="text-gray-600 dark:text-gray-300">
    This is a card built with Tailwind CSS utilities.
  </p>
  <button class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
    Click me
  </button>
</div>
\`\`\`

Tailwind makes styling enjoyable and productive!`,
      },
      {
        title: 'Understanding React Hooks in Depth',
        excerpt: 'A comprehensive guide to React Hooks, from basics to advanced patterns.',
        difficulty: 'medium',
        tags: ['react', 'hooks', 'javascript', 'tutorial'],
        content: `# Deep Dive into React Hooks

React Hooks revolutionized how we write React components. Let's explore the most important hooks and their use cases.

## useState

The most basic hook for managing component state:

\`\`\`typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
\`\`\`

## useEffect

Handle side effects in your components:

\`\`\`typescript
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup code
  };
}, [dependencies]);
\`\`\`

## useCallback

Memoize functions to prevent unnecessary re-renders:

\`\`\`typescript
const handleClick = useCallback(() => {
  console.log('Clicked!');
}, []);
\`\`\`

## useMemo

Memoize expensive computations:

\`\`\`typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
\`\`\`

## useRef

Access DOM elements or store mutable values:

\`\`\`typescript
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);
\`\`\`

Master these hooks and you'll be a React pro!`,
      },
    ];

    console.log(`2️⃣ Создание ${articles.length} статей...`);
    for (const article of articles) {
      const documentId = crypto.randomUUID();
      const slug = slugify(article.title);

      const result = await runAsync(
        db,
        `INSERT INTO articles (
          document_id,
          title,
          slug,
          excerpt,
          content,
          status,
          tags,
          difficulty,
          likes_count,
          dislikes_count,
          comments_count,
          views,
          published_at,
          created_at,
          updated_at,
          locale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          documentId,
          article.title,
          slug,
          article.excerpt,
          article.content,
          'published',
          JSON.stringify(article.tags),
          article.difficulty,
          0,
          0,
          0,
          0,
          now,
          now,
          now,
          'en',
        ]
      );

      const articleId = result.lastID;

      await runAsync(
        db,
        `INSERT INTO articles_author_lnk (article_id, user_id)
         VALUES (?, ?)`,
        [articleId, author.id]
      );

      console.log(`   ✅ ${article.title}`);
    }

    console.log('\n🎉 Статьи успешно добавлены!');
  } catch (error) {
    console.error('❌ Ошибка при создании статей:', error.message);
  } finally {
    db.close();
  }
}

seedArticles();


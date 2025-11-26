# 🎨 Aetheris React

Современная платформа для статей, построенная с **React**, **TypeScript** и **shadcn/ui**.

Полностью переписанная версия Vue приложения с минималистичным дизайном в стиле современных SaaS приложений.

## ✨ Особенности

- 🎨 **Минималистичный дизайн** в стиле shadcn/ui
- 🌓 **Светлая/Темная тема** с плавным переключением
- 📱 **Адаптивный дизайн** для всех устройств
- ⚡ **Высокая производительность** с Vite
- 🔒 **Type-safe** с TypeScript
- 🎯 **Современный стек** технологий
- 🚀 **Быстрая разработка** с Hot Module Replacement

## 🛠 Tech Stack

### Core
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Сборщик и dev server

### Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Компоненты UI
- **Radix UI** - Headless UI примитивы
- **Lucide React** - Иконки

### State & Data
- **TanStack Query** - Управление серверным состоянием
- **Zustand** - Глобальное состояние
- **Axios** - HTTP клиент

### Routing
- **React Router v6** - Маршрутизация

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd frontend-react
npm install
```

### 2. Запуск dev сервера

```bash
npm run dev
```

Откроется на **http://localhost:5173**

### 3. Сборка для продакшена

```bash
npm run build
```

## 📄 Созданные страницы

### ✅ Готовые страницы

1. **HomePage** (`/`) - Главная с списком статей
2. **ArticlePage** (`/article/:id`) - Просмотр статьи
3. **ProfilePage** (`/profile/:id`) - Профиль пользователя
4. **AuthPage** (`/auth`) - Авторизация/Регистрация
5. **CreateArticlePage** (`/create`) - Создание статьи
6. **SettingsPage** (`/settings/*`) - Настройки с подразделами

Подробнее в **[PAGES_GUIDE.md](./PAGES_GUIDE.md)**

## 🎨 Дизайн система

Подробное описание дизайна в **[DESIGN.md](./DESIGN.md)**

### Цветовая схема

**Светлая тема** (по умолчанию):
- Чистый белый фон
- Темный текст
- Минималистичные границы

**Темная тема**:
- Глубокий темный фон
- Светлый текст
- Контрастные элементы

### Компоненты

Все компоненты из **shadcn/ui**:
- Button, Input, Card, Badge
- Dialog, Tabs, Separator
- Toast, Label

## 📁 Структура проекта

```
frontend-react/
├── src/
│   ├── api/              # GraphQL API клиенты
│   │   ├── articles-graphql.ts
│   │   ├── auth-graphql.ts
│   │   └── bookmarks-graphql.ts
│   ├── components/       # React компоненты
│   │   ├── ui/          # shadcn/ui компоненты
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleCardLine.tsx
│   │   ├── ArticleCardSquare.tsx
│   │   └── ThemeToggle.tsx
│   ├── lib/             # Утилиты
│   │   ├── axios.ts     # HTTP клиент (для upload)
│   │   ├── graphql.ts   # GraphQL клиент
│   │   └── utils.ts     # Общие утилиты
│   ├── pages/           # Страницы
│   │   ├── HomePage.tsx
│   │   ├── ArticlePage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── CreateArticlePage.tsx
│   │   └── SettingsPage.tsx
│   ├── stores/          # Zustand stores
│   │   ├── authStore.ts
│   │   └── viewModeStore.ts
│   ├── types/           # TypeScript типы
│   │   ├── article.ts
│   │   └── user.ts
│   ├── App.tsx          # Главный компонент
│   ├── main.tsx         # Entry point
│   └── index.css        # Глобальные стили
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔧 Доступные скрипты

```bash
# Разработка
npm run dev          # Запуск dev сервера (http://localhost:5173)

# Сборка
npm run build        # Сборка для продакшена
npm run preview      # Превью продакшен сборки

# Линтинг
npm run lint         # Проверка кода с ESLint
```

## 🌐 API интеграция

Приложение интегрировано с **KeystoneJS** backend через GraphQL:

- **GraphQL Endpoint**: `http://localhost:3000/api/graphql`
- **Аутентификация**: Session-based (cookies)
- **OAuth2**: Google OAuth для входа

## 🎯 Основные фичи

### HomePage
- ✅ Список статей с пагинацией
- ✅ Поиск по статьям
- ✅ Фильтрация по тегам
- ✅ Trending статьи
- ✅ 3 режима отображения
- ✅ Адаптивный дизайн

### ArticlePage
- ✅ Полный текст статьи
- ✅ Информация об авторе
- ✅ Лайки и реакции
- ✅ Закладки
- ✅ Шаринг
- 🔄 Комментарии (coming soon)

### ProfilePage
- ✅ Информация о пользователе
- ✅ Статистика
- ✅ Вкладки Articles/Comments
- 🔄 Список статей (coming soon)

### AuthPage
- ✅ Sign In форма
- ✅ Sign Up форма
- ✅ Валидация
- 🔄 OAuth (coming soon)

### CreateArticlePage
- ✅ Создание статьи
- ✅ Добавление тегов
- ✅ Выбор сложности
- ✅ Сохранение черновика
- 🔄 Markdown редактор (coming soon)

### SettingsPage
- ✅ Настройки профиля
- ✅ Переключатель темы
- 🔄 Остальные настройки (coming soon)

## 📚 Документация

- **[PAGES_GUIDE.md](./PAGES_GUIDE.md)** - Описание всех страниц
- **[DESIGN.md](./DESIGN.md)** - Дизайн система

## 🔜 Coming Soon

- 💬 Система комментариев
- 🔔 Уведомления
- 📝 Markdown редактор
- 🔍 Расширенный поиск
- 📊 Аналитика
- 🌐 Интернационализация (i18n)

## 📝 License

MIT

---

**Создано с ❤️ используя React + shadcn/ui**

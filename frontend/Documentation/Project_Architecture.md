# АРХИТЕКТУРА ПРОЕКТА

## ТЕХНОЛОГИИ

### Frontend
- **Vue.js 3** + TypeScript + Vite
- **PrimeVue** - UI компоненты
- **Vue Router** - маршрутизация
- **SCSS** - стилизация

### Backend (планируется)
- **Python** - основной язык
- **FastAPI/Flask** - веб-фреймворк
- **PostgreSQL/MySQL** - база данных
- **JWT** - аутентификация

## СТРУКТУРА ПРОЕКТА

```
/
├── frontend/                    # Vue.js приложение
│   ├── src/
│   │   ├── components/          # Переиспользуемые компоненты
│   │   ├── views/              # Страницы приложения
│   │   ├── composables/        # Бизнес-логика
│   │   ├── types/              # TypeScript типы
│   │   ├── router/             # Маршрутизация
│   │   ├── services/           # API сервисы
│   │   ├── api/                # API методы
│   │   ├── assets/             # Статические ресурсы
│   │   │   ├── icons/          # Vue компоненты иконок
│   │   │   ├── imgs/           # Изображения
│   │   │   └── svgs/           # SVG файлы
│   │   ├── examples/           # Примеры компонентов
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── vite-env.d.ts
│   ├── Documentation/          # API документация
│   └── index.html
│
├── backend/                    # Python сервер
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   └── requirements.txt
│
├── examples/                   # HTML примеры страниц
├── node_modules/               # Node.js зависимости
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── env.example
├── LICENSE
├── README.md
└── TODO-List.md
```

## ОСНОВНЫЕ КОМПОНЕНТЫ

### Страницы
- **Home** - главная страница
- **Articles** - список статей (10 на страницу, 20-25 в списке)
- **Login/SignIn** - авторизация/регистрация
- **CreateArticle** - создание статей
- **Profile** - профиль пользователя

### Компоненты
- **AppHeader** - шапка с навигацией
- **AppFooter** - подвал сайта
- **ArticleCard** - карточка статьи
- **ThemeSwitcher** - переключатель тем

## API СТРУКТУРА

### Аутентификация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - авторизация
- `GET /api/auth/me` - текущий пользователь
- `POST /api/auth/logout` - выход

### Статьи
- `GET /api/articles` - список статей
- `GET /api/articles/:id` - статья по ID
- `POST /api/articles` - создание статьи
- `PUT /api/articles/:id` - обновление
- `DELETE /api/articles/:id` - удаление

### Действия
- `POST /api/articles/:id/like` - лайк
- `POST /api/articles/:id/bookmark` - закладка
- `GET/POST /api/articles/:id/comments` - комментарии

## СИСТЕМА ВАЛИДАЦИИ

### Frontend
- Валидация форм в реальном времени
- Санитизация пользовательского ввода
- Проверка длины и формата полей

### Backend (планируется)
- Валидация на сервере
- Хеширование паролей
- JWT токены
- Rate limiting

## БЕЗОПАСНОСТЬ

- XSS защита через Vue.js
- CSRF токены (планируется)
- Валидация всех входных данных
- HTTPS в продакшене

## РАЗВЕРТЫВАНИЕ

### Frontend
- `npm run build` - сборка
- Статические файлы на CDN
- Nginx для раздачи

### Backend
- Python приложение
- База данных
- Redis для кеширования (планируется)

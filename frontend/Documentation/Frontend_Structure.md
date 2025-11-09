# СТРУКТУРА FRONTEND

## ОСНОВНЫЕ КОМПОНЕНТЫ

### Страницы (Views)
- `Home.vue` - главная страница
- `Articles.vue` - список статей
- `Login.vue` - авторизация
- `SignIn.vue` - регистрация
- `CreateArticle.vue` - создание статьи
- `Profile.vue` - профиль пользователя

### Компоненты (Components)
- `AppHeader.vue` - шапка сайта
- `AppFooter.vue` - подвал сайта
- `ArticleCard.vue` - карточка статьи
- `ThemeSwitcher.vue` - переключатель тем

### Composables
- `useArticles.ts` - управление статьями
- `useValidation.ts` - валидация форм
- `useTheme.ts` - управление темами

## API ИНТЕГРАЦИЯ

### HTTP клиент
- Базовый URL: настраивается в переменных окружения
- Автоматическое добавление JWT токенов
- Обработка ошибок

### Основные методы
```typescript
// Статьи
fetchArticles(filters?, pagination?)
createArticle(articleData)
updateArticle(id, updates)
deleteArticle(id)
likeArticle(id)
bookmarkArticle(id)

// Аутентификация
login(credentials)
register(userData)
logout()
getCurrentUser()
```

## ВАЛИДАЦИЯ

### Никнейм
- 3-24 символа
- Буквы, цифры, _, -
- Не начинается с цифры

### Email
- Валидный формат
- До 254 символов

### Пароль
- 8-48 символов
- Заглавная, строчная, цифра, спецсимвол

## СТАТУСЫ ЗАГРУЗКИ

```typescript
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)
```

## ОБРАБОТКА ОШИБОК

- Показ ошибок пользователю
- Логирование в консоль

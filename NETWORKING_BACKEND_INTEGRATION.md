# Networking Page - Backend Integration Guide

## 📋 Обзор

Страница нетворкинга (`NetworkingPage.tsx`) в настоящее время использует мок-данные. Этот документ описывает, как интегрировать реальный бэкенд с базой данных.

## 🗂️ Структура данных

### Типы пользователей

Система поддерживает 3 типа аккаунтов:

1. **Company** (Компания) - платный аккаунт для размещения вакансий
2. **Freelancer** (Фрилансер) - может создавать предложения услуг
3. **Client** (Заказчик/Посетитель) - может создавать запросы на работу

### Основные сущности

#### 1. Company Job Listing (Вакансии от компаний)
- Создаются только verified компаниями (платная подписка)
- Могут быть забустены за дополнительную плату
- Включают информацию о зарплате, требованиях, локации

#### 2. Client Request (Запросы от заказчиков)
- Описание необходимой работы
- Бюджет (fixed или hourly)
- Дедлайн и длительность проекта

#### 3. Freelancer Offer (Предложения фрилансеров)
- Описание услуг
- Портфолио
- Цены (hourly rate или project rate)
- Статус доступности

## 🔧 Шаги интеграции

### Шаг 1: Создание Content Types в Strapi

#### 1.1 User Profile Extension

Добавьте поле `accountType` к существующей модели `user`:

```typescript
// backend/strapi-backend/src/extensions/users-permissions/content-types/user/schema.json
{
  "attributes": {
    // ... существующие поля
    "accountType": {
      "type": "enumeration",
      "enum": ["company", "freelancer", "client"],
      "default": "client"
    },
    "verified": {
      "type": "boolean",
      "default": false
    },
    "companyName": {
      "type": "string"
    },
    "companyLogo": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    }
  }
}
```

#### 1.2 Company Job Listing

```bash
# Создайте новый Content Type через Strapi Admin или вручную:
# backend/strapi-backend/src/api/company-job/content-types/company-job/schema.json
```

Структура:
- `company` (relation: many-to-one с user)
- `title` (string, required)
- `description` (richtext, required)
- `requirements` (json)
- `responsibilities` (json)
- `salary` (json: {min, max, currency, period})
- `location` (json: {country, city, remote, hybrid})
- `employmentType` (enum: full-time, part-time, contract, internship)
- `experienceLevel` (enum: junior, middle, senior, lead)
- `tags` (json)
- `benefits` (json)
- `boosted` (boolean)
- `boostExpiresAt` (datetime)
- `status` (enum: active, closed, draft)
- `applicationsCount` (integer, default: 0)
- `viewsCount` (integer, default: 0)

#### 1.3 Client Request

```bash
# backend/strapi-backend/src/api/client-request/content-types/client-request/schema.json
```

Структура:
- `client` (relation: many-to-one с user)
- `title` (string, required)
- `description` (richtext, required)
- `requirements` (json)
- `budget` (json: {min, max, currency, type})
- `deadline` (datetime)
- `duration` (string)
- `category` (string)
- `tags` (json)
- `attachments` (json)
- `boosted` (boolean)
- `boostExpiresAt` (datetime)
- `status` (enum: open, in-progress, completed, cancelled)
- `proposalsCount` (integer, default: 0)
- `viewsCount` (integer, default: 0)

#### 1.4 Freelancer Offer

```bash
# backend/strapi-backend/src/api/freelancer-offer/content-types/freelancer-offer/schema.json
```

Структура:
- `freelancer` (relation: many-to-one с user)
- `title` (string, required)
- `description` (richtext, required)
- `services` (json)
- `pricing` (json: {hourlyRate, projectRate, currency})
- `availability` (enum: available, busy, unavailable)
- `responseTime` (string)
- `skills` (json)
- `categories` (json)
- `portfolio` (json)
- `experience` (json: {years, projectsCompleted, clientsServed})
- `boosted` (boolean)
- `boostExpiresAt` (datetime)
- `status` (enum: active, inactive)
- `viewsCount` (integer, default: 0)
- `contactsCount` (integer, default: 0)

#### 1.5 Review System

```bash
# backend/strapi-backend/src/api/user-review/content-types/user-review/schema.json
```

Структура:
- `author` (relation: many-to-one с user)
- `targetUser` (relation: many-to-one с user)
- `rating` (integer, min: 1, max: 5, required)
- `comment` (text, required)
- `response` (json: {text, createdAt})
- `relatedListing` (polymorphic relation)

### Шаг 2: API Endpoints

Создайте следующие endpoints в Strapi:

#### Company Jobs
- `GET /api/company-jobs` - список вакансий (с фильтрами)
- `GET /api/company-jobs/:id` - детали вакансии
- `POST /api/company-jobs` - создание (только для verified companies)
- `PUT /api/company-jobs/:id` - обновление (только владелец)
- `DELETE /api/company-jobs/:id` - удаление (только владелец)
- `POST /api/company-jobs/:id/boost` - буст вакансии (требует оплаты)
- `POST /api/company-jobs/:id/increment-views` - увеличить счетчик просмотров

#### Client Requests
- `GET /api/client-requests` - список запросов
- `GET /api/client-requests/:id` - детали запроса
- `POST /api/client-requests` - создание
- `PUT /api/client-requests/:id` - обновление (только владелец)
- `DELETE /api/client-requests/:id` - удаление (только владелец)
- `POST /api/client-requests/:id/boost` - буст запроса
- `POST /api/client-requests/:id/submit-proposal` - отправить предложение

#### Freelancer Offers
- `GET /api/freelancer-offers` - список предложений
- `GET /api/freelancer-offers/:id` - детали предложения
- `POST /api/freelancer-offers` - создание (только для freelancers)
- `PUT /api/freelancer-offers/:id` - обновление (только владелец)
- `DELETE /api/freelancer-offers/:id` - удаление (только владелец)
- `POST /api/freelancer-offers/:id/boost` - буст предложения
- `POST /api/freelancer-offers/:id/contact` - связаться с фрилансером

#### Reviews
- `GET /api/user-reviews?targetUser=:userId` - отзывы о пользователе
- `POST /api/user-reviews` - создать отзыв
- `PUT /api/user-reviews/:id` - ответить на отзыв (только владелец профиля)

### Шаг 3: Permissions в Strapi

Настройте права доступа в Strapi Admin:

#### Public (неавторизованные)
- `find` и `findOne` для всех типов listings
- Только чтение отзывов

#### Authenticated (авторизованные)
- Все права Public
- `create`, `update`, `delete` только для своих записей
- Создание отзывов
- Отправка предложений/заявок

#### Company (verified)
- Все права Authenticated
- Создание company-jobs
- Буст listings (с проверкой оплаты)

#### Freelancer
- Все права Authenticated
- Создание freelancer-offers

### Шаг 4: Frontend API Layer

Создайте файл `frontend-react/src/api/networking.ts`:

```typescript
import { apiClient } from './axios'
import type {
  CompanyJobListing,
  ClientRequest,
  FreelancerOffer,
  NetworkingFilters,
} from '@/types/networking'

// Company Jobs
export async function getCompanyJobs(filters: NetworkingFilters) {
  const params = buildQueryParams(filters)
  const res = await apiClient.get('/api/company-jobs', { params })
  return transformResponse(res.data)
}

export async function getCompanyJob(id: string) {
  const res = await apiClient.get(`/api/company-jobs/${id}`)
  return transformSingleResponse(res.data)
}

export async function createCompanyJob(data: Partial<CompanyJobListing>) {
  const res = await apiClient.post('/api/company-jobs', { data })
  return transformSingleResponse(res.data)
}

export async function boostCompanyJob(id: string, paymentToken: string) {
  const res = await apiClient.post(`/api/company-jobs/${id}/boost`, {
    paymentToken,
  })
  return res.data
}

// Client Requests
export async function getClientRequests(filters: NetworkingFilters) {
  const params = buildQueryParams(filters)
  const res = await apiClient.get('/api/client-requests', { params })
  return transformResponse(res.data)
}

// ... аналогично для других endpoints

// Helper functions
function buildQueryParams(filters: NetworkingFilters) {
  const params: any = {
    populate: '*',
    sort: filters.sortBy === 'newest' ? 'createdAt:desc' : undefined,
  }
  
  if (filters.search) {
    params['filters[$or][0][title][$containsi]'] = filters.search
    params['filters[$or][1][description][$containsi]'] = filters.search
  }
  
  if (filters.showBoostedOnly) {
    params['filters[boosted][$eq]'] = true
  }
  
  // ... добавьте остальные фильтры
  
  return params
}

function transformResponse(data: any) {
  // Трансформируйте Strapi response в ваш формат
  return {
    data: data.data.map(transformSingleItem),
    total: data.meta.pagination.total,
  }
}
```

### Шаг 5: Обновление NetworkingPage.tsx

Замените мок-данные на React Query:

```typescript
// Удалите эти импорты:
// import { mockCompanyJobs, ... } from '@/data/networkingMockData'

// Добавьте:
import { useQuery } from '@tanstack/react-query'
import { getCompanyJobs, getClientRequests, getFreelancerOffers } from '@/api/networking'

// В компоненте:
const { data: companiesData, isLoading: loadingCompanies } = useQuery({
  queryKey: ['company-jobs', { 
    search: searchQuery,
    sortBy,
    employmentTypes,
    experienceLevels,
    remoteOnly,
    selectedTags,
    showBoostedOnly,
  }],
  queryFn: () => getCompanyJobs({
    search: searchQuery,
    sortBy,
    employmentType: employmentTypes,
    experienceLevel: experienceLevels,
    remote: remoteOnly,
    tags: selectedTags,
    showBoostedOnly,
  }),
})

const filteredCompanies = companiesData?.data ?? []

// Аналогично для client requests и freelancer offers
```

### Шаг 6: Payment Integration для Boost

Интегрируйте платежную систему (Stripe/PayPal):

```typescript
// frontend-react/src/components/BoostListingDialog.tsx
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

export function BoostListingDialog({ listingId, listingType }) {
  const stripe = useStripe()
  const elements = useElements()
  
  const handleBoost = async () => {
    // 1. Создайте payment intent на бэкенде
    const { clientSecret } = await createBoostPaymentIntent(listingId, listingType)
    
    // 2. Подтвердите платеж
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    })
    
    if (error) {
      toast.error(error.message)
      return
    }
    
    // 3. Активируйте буст
    await boostListing(listingId, listingType, paymentIntent.id)
    toast.success('Listing boosted successfully!')
  }
  
  // ... UI
}
```

### Шаг 7: Real-time Updates (опционально)

Для real-time обновлений счетчиков используйте WebSockets или Strapi's built-in webhooks:

```typescript
// frontend-react/src/hooks/useRealtimeNetworking.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'

export function useRealtimeNetworking() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL)
    
    socket.on('company-job:updated', (data) => {
      queryClient.invalidateQueries(['company-jobs'])
    })
    
    socket.on('client-request:new-proposal', (data) => {
      queryClient.invalidateQueries(['client-requests', data.requestId])
    })
    
    return () => {
      socket.disconnect()
    }
  }, [queryClient])
}
```

## 🔒 Security Considerations

1. **Валидация на бэкенде**: Всегда валидируйте данные на сервере
2. **Rate limiting**: Ограничьте количество запросов (особенно для boost)
3. **Проверка владельца**: Убедитесь, что пользователь может редактировать только свои записи
4. **Проверка verified статуса**: Только verified компании могут создавать вакансии
5. **Проверка оплаты**: Буст должен активироваться только после успешной оплаты

## 📊 Analytics & Monitoring

Добавьте отслеживание:
- Просмотры listings
- Клики на кнопки контакта
- Конверсия буста
- Популярные теги и категории

```typescript
// frontend-react/src/utils/analytics.ts
export function trackListingView(listingId: string, listingType: string) {
  // Google Analytics
  gtag('event', 'view_listing', {
    listing_id: listingId,
    listing_type: listingType,
  })
  
  // Backend tracking
  apiClient.post(`/api/${listingType}/${listingId}/increment-views`)
}
```

## 🧪 Testing

Создайте тесты для:
1. API endpoints (integration tests)
2. Фильтрация и сортировка
3. Permissions и authorization
4. Payment flow
5. Real-time updates

## 📝 Migration Plan

1. **Phase 1**: Создайте Content Types и API endpoints
2. **Phase 2**: Настройте permissions и тестируйте через Postman
3. **Phase 3**: Интегрируйте frontend API layer
4. **Phase 4**: Замените мок-данные на реальные запросы
5. **Phase 5**: Добавьте payment integration
6. **Phase 6**: Тестирование и оптимизация
7. **Phase 7**: Deploy и мониторинг

## 🔗 Полезные ссылки

- [Strapi Documentation](https://docs.strapi.io/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Stripe Integration Guide](https://stripe.com/docs/stripe-js/react)

## ❓ FAQ

**Q: Как хранить рейтинги пользователей?**
A: Рассчитывайте рейтинг динамически из reviews или храните в отдельном поле с автоматическим обновлением через lifecycle hooks.

**Q: Как работает буст?**
A: После оплаты устанавливается `boosted: true` и `boostExpiresAt`. Cron job автоматически отключает буст после истечения срока.

**Q: Нужно ли хранить портфолио отдельно?**
A: Можно хранить как JSON в freelancer-offer или создать отдельный Content Type `portfolio-item` с relation.

**Q: Как обрабатывать изображения?**
A: Используйте Strapi Media Library. Для портфолио можно использовать external URLs или загружать в Strapi.


# 🚀 Миграция на Supabase REST API

## 📋 План миграции

### Этап 1: Настройка Supabase (RLS + Database Functions)
- [x] Создать миграции для Row Level Security
- [ ] Создать Database Functions для кастомной логики
- [ ] Настроить политики доступа

### Этап 2: Создание TypeScript клиента
- [ ] Создать Supabase клиент для фронтенда
- [ ] Типизировать все запросы
- [ ] Реализовать кастомные функции (searchArticles, computed fields)

### Этап 3: Переписать фронтенд
- [ ] Заменить GraphQL запросы на REST API
- [ ] Обновить хуки и компоненты
- [ ] Обновить аутентификацию

### Этап 4: Удаление Express сервера
- [ ] Удалить Express + Apollo Server
- [ ] Очистить зависимости
- [ ] Обновить документацию

## 📚 Документация Supabase

- [REST API](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [TypeScript Client](https://supabase.com/docs/reference/javascript/typescript-support)


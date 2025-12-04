# Как получить DATABASE_URL в Supabase

## Способ 1: Через Settings → Database

1. В левом меню нажмите **Settings** (⚙️) - это в самом низу меню
2. Выберите **Database**
3. Прокрутите вниз до секции **Connection string** или **Connection pooling**
4. Выберите вкладку **URI** (не "Session mode" или "Transaction mode")
5. Скопируйте строку подключения

## Способ 2: Через Database → Settings

1. В левом меню нажмите **Database** (иконка базы данных)
2. В разделе **CONFIGURATION** нажмите **Settings**
3. Найдите секцию **Connection string**
4. Выберите вкладку **URI**
5. Скопируйте строку

## Способ 3: Составить вручную

Если не можете найти connection string, составьте его вручную:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Где:
- `[YOUR-PASSWORD]` - пароль базы данных
- `[PROJECT-REF]` - ваш project reference (из URL: `https://[PROJECT-REF].supabase.co`)

В вашем случае:
- Project reference: `lublvnvoawndnmkgndct`
- URL будет: `postgresql://postgres:ВАШ_ПАРОЛЬ@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres`

## Где найти пароль базы данных?

1. **Settings** → **Database** → **Database password**
2. Если не помните пароль - нажмите **Reset database password**
3. Скопируйте новый пароль (он показывается только один раз!)

## Пример готового DATABASE_URL

```
postgresql://postgres:ваш-пароль-здесь@db.lublvnvoawndnmkgndct.supabase.co:5432/postgres
```


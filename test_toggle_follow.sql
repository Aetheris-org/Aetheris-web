-- Тест функции toggle_follow
-- Замените эти UUID на реальные ID пользователей из вашей базы

-- Пример использования (замените на реальные UUID):
-- SELECT toggle_follow('user1-uuid-here'::uuid, 'user2-uuid-here'::uuid);

-- Проверим что функция существует и работает
SELECT proname, pg_get_function_identity_arguments(oid) as args
FROM pg_proc 
WHERE proname = 'toggle_follow';

-- Пример вызова (нужно заменить на реальные UUID):
-- SELECT toggle_follow('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid);

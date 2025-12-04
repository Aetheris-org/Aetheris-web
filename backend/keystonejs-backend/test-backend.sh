#!/bin/bash
# Скрипт для тестирования backend

cd "$(dirname "$0")"

echo "🧹 Очистка кэша..."
rm -rf .keystone node_modules/.cache

echo "🚀 Запуск backend..."
npm run dev



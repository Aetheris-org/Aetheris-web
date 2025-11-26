#!/usr/bin/env node

/**
 * Скрипт для исправления next.config.js после генерации KeystoneJS
 * Исправляет ошибку "Html should not be imported outside of pages/_document"
 * путем отключения статического экспорта Admin UI
 */

const fs = require('fs');
const path = require('path');

const nextConfigPath = path.join(__dirname, '../.keystone/admin/next.config.js');

if (!fs.existsSync(nextConfigPath)) {
  console.log('⚠️  next.config.js not found, skipping fix');
  process.exit(0);
}

let configContent = fs.readFileSync(nextConfigPath, 'utf8');

// Проверяем, не добавлена ли уже настройка output
if (configContent.includes("output: 'standalone'") || configContent.includes('output: "standalone"')) {
  console.log('✅ next.config.js already has output: standalone');
  process.exit(0);
}

// Добавляем output: 'standalone' внутри объекта nextConfig, перед закрывающей скобкой
const lines = configContent.split('\n');
let insertIndex = -1;

// Ищем закрывающую скобку объекта nextConfig (не последнюю)
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  // Ищем строку с transpilePackages или пустую строку перед закрывающей скобкой объекта
  if (line.includes('transpilePackages')) {
    // Ищем следующую строку с закрывающей скобкой или пустую строку
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === '}' && !lines[j].includes('module.exports')) {
        insertIndex = j;
        break;
      }
      if (lines[j].trim() === '' && j < lines.length - 1 && lines[j + 1].trim() === '}') {
        insertIndex = j + 1;
        break;
      }
    }
    break;
  }
}

if (insertIndex === -1) {
  // Если не нашли, ищем любую закрывающую скобку перед module.exports
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '}' && !lines[i].includes('module.exports')) {
      insertIndex = i;
      break;
    }
  }
}

if (insertIndex > 0) {
  // Добавляем настройку output внутри объекта
  const indent = lines[insertIndex].match(/^(\s*)/)?.[1] || '    ';
  lines.splice(insertIndex, 0, `${indent}// Отключаем статический экспорт - Admin UI должен работать только в runtime`,
    `${indent}// Это исправляет ошибку "Html should not be imported outside of pages/_document"`,
    `${indent}output: 'standalone',`);
  
  const newContent = lines.join('\n');
  fs.writeFileSync(nextConfigPath, newContent, 'utf8');
  console.log('✅ Fixed next.config.js: added output: standalone');
} else {
  console.log('⚠️  Could not find insertion point in next.config.js');
  process.exit(1);
}


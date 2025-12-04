/**
 * Патч для логирования проблемных relationship полей
 * Запустите этот скрипт перед npm run dev
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/@keystone-6/core/dist/create-admin-meta-1808d8f7.cjs.prod.js');

console.log('🔍 Патчинг create-admin-meta для логирования...');

let content = fs.readFileSync(filePath, 'utf8');

// Добавляем логирование перед вызовом getAdminMeta
const oldCode = `      currentAdminMeta = adminMetaRoot;
      try {
        var _list$fields$fieldMet, _list$fields$fieldMet2, _list$fields$fieldMet3;
        fieldMetaRootVal.fieldMeta = (_list$fields$fieldMet = (_list$fields$fieldMet2 = (_list$fields$fieldMet3 = list.fields[fieldMetaRootVal.path]).getAdminMeta) === null || _list$fields$fieldMet2 === void 0 ? void 0 : _list$fields$fieldMet2.call(_list$fields$fieldMet3)) !== null && _list$fields$fieldMet !== void 0 ? _list$fields$fieldMet : null;`;

const newCode = `      currentAdminMeta = adminMetaRoot;
      try {
        var _list$fields$fieldMet, _list$fields$fieldMet2, _list$fields$fieldMet3;
        const fieldPath = fieldMetaRootVal.path;
        const listKey = key;
        const field = list.fields[fieldPath];
        const isRelationship = field && field.dbField && field.dbField.kind === 'relation';
        if (isRelationship) {
          console.log(\`[DEBUG] Processing relationship field: \${listKey}.\${fieldPath}, ref: \${field.dbField.list}\`);
        }
        fieldMetaRootVal.fieldMeta = (_list$fields$fieldMet = (_list$fields$fieldMet2 = (_list$fields$fieldMet3 = field).getAdminMeta) === null || _list$fields$fieldMet2 === void 0 ? void 0 : _list$fields$fieldMet2.call(_list$fields$fieldMet3)) !== null && _list$fields$fieldMet !== void 0 ? _list$fields$fieldMet : null;`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  
  // Также добавляем логирование в getAdminMetaForRelationshipField
  const oldErrorCode = `function getAdminMetaForRelationshipField() {
  if (currentAdminMeta === undefined) {
    throw new Error('unexpected call to getAdminMetaInRelationshipField');
  }`;
  
  const newErrorCode = `function getAdminMetaForRelationshipField() {
  if (currentAdminMeta === undefined) {
    const error = new Error('unexpected call to getAdminMetaInRelationshipField');
    console.error('[ERROR] getAdminMetaForRelationshipField called when currentAdminMeta is undefined');
    console.error('[ERROR] Stack trace:', new Error().stack);
    throw error;
  }`;
  
  if (content.includes(oldErrorCode)) {
    content = content.replace(oldErrorCode, newErrorCode);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Патч применен успешно!');
} else {
  console.log('⚠️  Код не найден, возможно файл уже изменен или версия другая');
  console.log('Попробуйте найти строку с "currentAdminMeta = adminMetaRoot" вручную');
}



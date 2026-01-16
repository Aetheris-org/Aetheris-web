# Инструкция по очистке данных восстановления черновиков

Если плашка восстановления черновика застряла в цикле, выполните следующие команды в консоли браузера (F12 → Console):

## Быстрое решение - очистить все данные восстановления:

```javascript
// Очистить все черновики из localStorage
Object.keys(localStorage).filter(key => key.startsWith('draft_')).forEach(key => localStorage.removeItem(key));

// Очистить список обработанных черновиков из sessionStorage
sessionStorage.removeItem('draftRecovery_processed');

console.log('Данные восстановления черновиков очищены! Перезагрузите страницу.');
```

## Или по отдельности:

```javascript
// Только очистить черновики
Object.keys(localStorage).filter(key => key.startsWith('draft_')).forEach(key => localStorage.removeItem(key));

// Только очистить список обработанных
sessionStorage.removeItem('draftRecovery_processed');
```

После выполнения команд перезагрузите страницу (F5 или Ctrl+R).

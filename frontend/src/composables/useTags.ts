import { ref, computed } from 'vue'

// Статический список всех доступных тегов
const tagColorGroups: Record<'success' | 'info' | 'warning' | 'danger' | 'secondary', string[]> = {
  success: [
    'javaScript',
    'vue.js',
    'react',
    'node.js',
    'web development',
    'frontend',
    'tutorial',
    'guide'
  ],
  info: [
    'python',
    'typescript',
    'angular',
    'programming',
    'backend',
    'database',
    'sql',
    'api',
    'rest'
  ],
  warning: [
    'design',
    'ui/ux',
    'mobile development',
    'game development',
    'unity',
    'unreal engine',
    'review',
    'interview'
  ],
  danger: [
    'security',
    'testing',
    'cryptography',
    'devops',
    'docker',
    'kubernetes',
    'blockchain'
  ],
  secondary: [
    'tools',
    'git',
    'nosql',
    'fullstack',
    'artificial intelligence',
    'machine learning',
    'graphql',
    'microservices',
    'cloud',
    'aws',
    'azure',
    'google cloud',
    'linux',
    'windows',
    'macos',
    'news',
    'case study',
    'architecture',
    'algorithms',
    'design patterns'
  ]
}

// Объединяем все теги в один массив
const allTags = [
  ...tagColorGroups.success,
  ...tagColorGroups.info,
  ...tagColorGroups.warning,
  ...tagColorGroups.danger,
  ...tagColorGroups.secondary
]

// Создаем Set для быстрого поиска
const tagsSet = new Set(allTags)

export function useTags() {
  // Функция для получения цвета тега на основе его группы
  const getTagSeverity = (tag: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
    for (const [severity, tags] of Object.entries(tagColorGroups)) {
      if (tags.includes(tag)) {
        return severity as 'success' | 'info' | 'warning' | 'danger' | 'secondary'
      }
    }
    return 'secondary' // По умолчанию
  }

  // Функция для фильтрации тегов по поисковому запросу
  const filterTags = (searchQuery: string, excludeTags: string[] = []) => {
    if (!searchQuery.trim()) {
      return allTags.filter(tag => !excludeTags.includes(tag))
    }
    
    const query = searchQuery.toLowerCase().trim()
    return allTags
      .filter(tag => 
        tag.toLowerCase().includes(query) && 
        !excludeTags.includes(tag)
      )
  }

  // Функция для проверки существования тега
  const isTagExists = (tag: string): boolean => {
    return tagsSet.has(tag)
  }

  // Функция для добавления нового тега (если нужно)
  const addCustomTag = (tag: string): boolean => {
    if (!isTagExists(tag)) {
      allTags.push(tag)
      tagsSet.add(tag)
      return true
    }
    return false
  }

  return {
    allTags,
    tagColorGroups,
    getTagSeverity,
    filterTags,
    isTagExists,
    addCustomTag
  }
}

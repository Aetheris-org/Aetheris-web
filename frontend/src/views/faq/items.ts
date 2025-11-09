export type FaqBlock =
  | { type: 'text'; value: string }
  | { type: 'image'; src: string; alt?: string }

export type FaqItem = {
  id: string
  title: string
  subtitle?: string
  content?: string // legacy short preview
  blocks?: FaqBlock[] // preferred: mixed text/images
  images?: string[]
}

export const faqItems: FaqItem[] = [
  {
    id: 'likes',
    title: 'Как получать симпатии?',
    subtitle: 'Краткая подсказка',
    content:
      'Симпатии ставят другие пользователи, если они посчитали ваше сообщение или тему полезной.',
    blocks: [
      { type: 'text', value: 'Симпатии ставят другие пользователи, если они посчитали ваше сообщение или тему полезной.' },
      { type: 'image', src: '/src/assets/imgs/faq/example1.png', alt: 'Пример полезного сообщения' },
      { type: 'text', value: 'Пишите по делу, подробно, с примерами и источниками — и симпатии не заставят себя ждать.' }
    ]
  },
  {
    id: 'notifications',
    title: 'Где увидеть уведомления?',
    subtitle: 'Новые реакции и ответы',
    content:
      'Все уведомления отображаются в шапке сайта в блоке колокольчика, а также на отдельной странице уведомлений.'
  }
]

export function getFaqItemById(id: string): FaqItem | undefined {
  return faqItems.find(i => i.id === id)
}



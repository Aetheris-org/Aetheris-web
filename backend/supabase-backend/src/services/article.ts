/**
 * Article Service
 * Бизнес-логика для работы со статьями
 */
import { GraphQLContext } from '../graphql/context';
import logger from '../lib/logger';

interface SearchArticlesArgs {
  search?: string;
  tags?: string[];
  difficulty?: string;
  sort?: string;
  skip?: number;
  take?: number;
}

export async function searchAndFilterArticles(
  context: GraphQLContext,
  input: SearchArticlesArgs
) {
  const {
    search,
    tags = [],
    difficulty,
    sort = 'newest',
    skip = 0,
    take = 10,
  } = input;

  const where: any = {
    publishedAt: { not: null },
  };

  // Поиск по тексту (в заголовке и excerpt)
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Фильтр по тегам
  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  // Фильтр по сложности
  if (difficulty) {
    where.difficulty = difficulty;
  }

  // Сортировка
  let orderBy: any = {};
  switch (sort) {
    case 'newest':
      orderBy = { publishedAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { publishedAt: 'asc' };
      break;
    case 'popular':
      orderBy = { views: 'desc' };
      break;
    default:
      orderBy = { publishedAt: 'desc' };
  }

  const [articles, total] = await Promise.all([
    context.prisma.article.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    }),
    context.prisma.article.count({ where }),
  ]);

  // Добавляем userReaction для каждого article
  const articlesWithReactions = await Promise.all(
    articles.map(async (article) => {
      if (!context.user) {
        return { ...article, userReaction: null };
      }

      const reaction = await context.prisma.articleReaction.findUnique({
        where: {
          articleId_userId: {
            articleId: article.id,
            userId: context.user.id,
          },
        },
      });

      return {
        ...article,
        userReaction: reaction?.reaction || null,
      };
    })
  );

  logger.debug('Search articles result', {
    count: articlesWithReactions.length,
    total,
    filters: { search, tags, difficulty, sort },
  });

  return {
    articles: articlesWithReactions,
    total,
  };
}


/**
 * Политика для проверки авторизации пользователя
 * Просто проверяет, что пользователь авторизован
 */
export default async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  return true;
};


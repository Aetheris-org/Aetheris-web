/**
 * `can-see-draft` policy
 * Allows access to draft articles only if user is the author
 */

export default (policyContext, config, { strapi }) => {
  const { id } = policyContext.params;
  const userId = policyContext.state.user?.id;

  return {
    name: 'can-see-draft',
    async handler() {
      try {
        // Fetch the article
        const article = await strapi.entityService.findOne('api::article.article', id, {
          populate: { author: { fields: ['id'] } }
        });

        if (!article) {
          return false;
        }

        // If published, everyone can see it
        if (article.publishedAt) {
          return true;
        }

        // If draft, only author can see it
        if (!userId) {
          return false;
        }

        const authorId = article.author?.id;
        return authorId === userId;
      } catch (error) {
        console.error('❌ can-see-draft policy error:', error);
        return false;
      }
    }
  };
};


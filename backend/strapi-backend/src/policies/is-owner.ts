/**
 * `is-owner` policy
 * Checks if the authenticated user is the owner of the resource
 */

export default (policyContext, config, { strapi }) => {
  const { id } = policyContext.params;
  const userId = policyContext.state.user?.id;

  if (!userId) {
    return false;
  }

  // Get the content type from the route
  const contentType = config.contentType || policyContext.state.route.info.type;

  return {
    name: 'is-owner',
    async handler() {
      try {
        // Fetch the resource
        const entity = await strapi.entityService.findOne(contentType, id, {
          populate: { author: { fields: ['id'] } }
        });

        if (!entity) {
          return false;
        }

        // Check if user is the author
        const authorId = entity.author?.id;
        return authorId === userId;
      } catch (error) {
        console.error('❌ is-owner policy error:', error);
        return false;
      }
    }
  };
};


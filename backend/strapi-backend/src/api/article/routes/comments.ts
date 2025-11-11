export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/:documentId/comments',
      handler: 'api::comment.comment.findForArticle',
    },
    {
      method: 'POST',
      path: '/articles/:documentId/comments',
      handler: 'api::comment.comment.createForArticle',
    },
  ],
};



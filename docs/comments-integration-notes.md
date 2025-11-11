## Comments Integration Migration Notes

This document captures the temporary client-side implementation for article comments and outlines the steps required to replace the mock behaviour with real Strapi-backed comments.

### Current Temporary Behaviour

- Client writes are stored in `localStorage` via `useLocalCommentsStore` (`frontend-react/src/stores/localCommentsStore.ts`).  
- New comments (and replies) are merged with read-only data returned by `getArticleComments`.  
- UI badges (`Local preview`) highlight entries that only exist locally to the current user.

### Migration Checklist

1. **Enable Strapi Permissions**
   - Ensure the `/api/articles/:documentId/comments` POST route is enabled for authenticated users.
   - Confirm the controller/service returns author data (`username`, `avatar`) to match the expected frontend shape.

2. **Replace Local Persistence**
   - Swap the local mutation placeholder in `ArticlePage.tsx` (`handleSubmitComment` & `handleSubmitReply`) with the exported `createArticleComment` API call.
   - Pass `parentId` when replying to comments so the backend creates threaded discussions.
   - On success:
     - Clear any local draft state.
     - Invalidate React Query cache: `queryClient.invalidateQueries({ queryKey: ['article-comments', id] })`.
     - Optionally, optimistic-update the cache instead of invalidating.
   - Remove `useLocalCommentsStore` usage and delete `localCommentsStore.ts`.

3. **Remove Local-only UI Flags**
   - Delete the `Local preview` badge and any conditional styling that highlights local entries.
   - Remove other guard rails referencing local data once backend persistence is live.

4. **Error Handling & Edge Cases**
   - Surface backend validation errors to the user (e.g. throttling, moderation rules).
   - Handle pagination or infinite-scroll if the comment count is large.
   - Add loading/progress states for mutation requests (disable buttons, show skeletons, etc.).

5. **Tests & QA**
   - Cover optimistic rendering, reply threads, and fetch failure states.
   - Verify comments render consistently across locales and themes.
   - Confirm avatars fallback gracefully when missing.

When all steps are complete, remove this document and any TODO references pointing to it.



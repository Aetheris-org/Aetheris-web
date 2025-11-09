/**
 * Comment service
 */

import { factories } from '@strapi/strapi';

// Store reactions in memory (replace with Redis/Database for production)
interface CommentReaction {
  userId: number;
  commentId: number;
  reaction: 'like' | 'dislike';
}

const commentReactionsStore: Map<string, CommentReaction> = new Map();

function getReactionKey(userId: number, commentId: number): string {
  return `comment:${userId}:${commentId}`;
}

export default factories.createCoreService('api::comment.comment', ({ strapi }) => ({
  /**
   * Handle comment reaction (like/dislike)
   */
  async handleReaction(commentId: number, userId: number, reaction: 'like' | 'dislike') {
    const key = getReactionKey(userId, commentId);
    const existingReaction = commentReactionsStore.get(key);

    // Get current comment
    const comment: any = await strapi.entityService.findOne('api::comment.comment', commentId, {
      populate: ['author'] as any
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    let likesCount = comment.likes_count || 0;
    let dislikesCount = comment.dislikes_count || 0;

    // Remove old reaction if exists
    if (existingReaction) {
      if (existingReaction.reaction === 'like') {
        likesCount = Math.max(0, likesCount - 1);
      } else {
        dislikesCount = Math.max(0, dislikesCount - 1);
      }

      // If same reaction, remove it (toggle)
      if (existingReaction.reaction === reaction) {
        commentReactionsStore.delete(key);

        await strapi.entityService.update('api::comment.comment', commentId, {
          data: {
            likes_count: likesCount,
            dislikes_count: dislikesCount
          }
        });

        return {
          ...comment,
          likes_count: likesCount,
          dislikes_count: dislikesCount,
          user_reaction: null
        };
      }
    }

    // Add new reaction
    if (reaction === 'like') {
      likesCount += 1;
    } else {
      dislikesCount += 1;
    }

    commentReactionsStore.set(key, { userId, commentId, reaction });

    // Update comment counters
    const updatedComment: any = await strapi.entityService.update('api::comment.comment', commentId, {
      data: {
        likes_count: likesCount,
        dislikes_count: dislikesCount
      },
      populate: ['author'] as any
    });

    // Create notification for comment author if liked by someone else
    if (reaction === 'like' && comment.author?.id && comment.author.id !== userId) {
      await strapi.entityService.create('api::notification.notification', {
        data: {
          user: comment.author.id,
          type: 'comment_like',
          title: 'Comment Liked',
          message: 'Someone liked your comment',
          related_comment: commentId,
          is_read: false
        }
      });
    }

    return {
      ...updatedComment,
      user_reaction: reaction
    };
  },

  /**
   * Get user's reaction for a comment
   */
  async getUserReaction(commentId: number, userId: number): Promise<'like' | 'dislike' | null> {
    const key = getReactionKey(userId, commentId);
    const reaction = commentReactionsStore.get(key);
    return reaction?.reaction || null;
  }
}));


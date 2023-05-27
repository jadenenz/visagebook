import { privateProcedure } from "./../trpc";
import { clerkClient } from "@clerk/nextjs/server";
import type { Post, Comment } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import type { User } from "@clerk/nextjs/dist/api";
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    fullName: `${user.firstName || "no first name"} ${
      user.lastName || "no last name "
    }`,
    profileImageUrl: user.profileImageUrl,
  };
};

interface CommentWithUserData extends Comment {
  commentAuthorData: {
    id: string;
    fullName: string;
    profileImageUrl: string;
  };
}

type PostWithComments = Post & { comments: Comment[] };
type PostWithCommentsAndUserData = Post & { comments: CommentWithUserData[] };
const addUserDataToPosts = async (posts: PostWithComments[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    const newComments = post.comments.map((comment) => {
      const commentAuthor = users.find((user) => user.id === comment.authorId);
      if (!commentAuthor)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Comment author not found",
        });
      const finalComment: CommentWithUserData = {
        ...comment,
        commentAuthorData: {
          ...commentAuthor,
        },
      };
      return finalComment;
    });

    if (!author || !author.fullName)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    const finalPost: PostWithCommentsAndUserData = {
      ...post,
      comments: newComments,
    };

    return {
      post: finalPost,
      author: {
        ...author,
        fullName: author.fullName,
      },
    };
  });
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
      include: {
        comments: true,
      },
    });
    return addUserDataToPosts(posts);
  }),

  getLikedPosts: publicProcedure.query(async ({ ctx }) => {
    const likedPosts = await ctx.prisma.likedPosts.findMany();
    return likedPosts;
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(400),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),

  postComment: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(200),
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const comment = await ctx.prisma.comment.create({
        data: {
          content: input.content,
          authorId: authorId,
          parentPostId: input.postId,
        },
      });
      return comment;
    }),

  likePost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const postId = input.postId;
      const likedPost = await ctx.prisma.likedPosts.create({
        data: {
          postId: postId,
          userId: userId,
        },
      });
      return likedPost;
    }),

  // NEED TO MAKE UNIQUE QUERY FOR LIKEDPOST
  unlikePost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deletedPost = await ctx.prisma.likedPosts.delete({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: ctx.userId,
          },
        },
      });
      return deletedPost;
    }),
});
export {};

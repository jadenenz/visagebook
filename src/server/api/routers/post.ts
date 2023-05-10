import { clerkClient } from "@clerk/nextjs/server";
import type { Post, Comment } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";

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
});
export {};

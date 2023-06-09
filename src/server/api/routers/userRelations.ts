import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { type User_Relationship } from "@prisma/client";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";

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

const addUserDataToRequest = async (relations: User_Relationship[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: relations.map((relation) => relation.relatingUser),
      limit: 100,
    })
  ).map(filterUserForClient);

  return relations.map((relation) => {
    const relatingUser = users.find(
      (user) => user.id === relation.relatingUser
    );

    if (!relatingUser || !relatingUser.fullName)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User sending friend request not found",
      });

    return {
      ...relation,
      relatingUser,
    };
  });
};

export const userRelationsRouter = createTRPCRouter({
  requestById: privateProcedure
    .input(
      z.object({
        relatedUserId: string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const relation = await ctx.prisma.user_Relationship.upsert({
        where: {
          relatingUser_relatedUser: {
            relatingUser: ctx.userId,
            relatedUser: input.relatedUserId,
          },
          type: {
            not: "friend",
          },
        },
        update: { type: "pending" },
        create: {
          relatingUser: ctx.userId,
          relatedUser: input.relatedUserId,
          type: "pending",
        },
      });

      if (!relation)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
    }),

  acceptById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const relation = await ctx.prisma.user_Relationship.update({
        where: { id: input.id },
        data: {
          type: "friend",
        },
      });

      if (!relation) throw new TRPCError({ code: "NOT_FOUND" });

      //Make a new record for the friend pair of the accepted friend request
      //that mirrors the relatedUser and relatingUser
      const newFriend = await ctx.prisma.user_Relationship.create({
        data: {
          relatingUser: relation.relatedUser,
          relatedUser: relation.relatingUser,
          type: "friend",
        },
      });

      if (!newFriend) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }),

  unfriendById: privateProcedure
    .input(
      z.object({
        relatedUserId: string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deletedRelation = await ctx.prisma.user_Relationship.delete({
        where: {
          relatingUser_relatedUser: {
            relatingUser: ctx.userId,
            relatedUser: input.relatedUserId,
          },
        },
      });
      const deletedRelation2 = await ctx.prisma.user_Relationship.delete({
        where: {
          relatingUser_relatedUser: {
            relatingUser: input.relatedUserId,
            relatedUser: ctx.userId,
          },
        },
      });

      if (!deletedRelation)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      if (!deletedRelation2)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const relations = await ctx.prisma.user_Relationship.findMany({
      take: 100,
    });
    return addUserDataToRequest(relations);
  }),
});

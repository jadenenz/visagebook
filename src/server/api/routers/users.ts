import { clerkClient } from "@clerk/nextjs/server";
import { type Post } from "@prisma/client";
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

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const users = (await clerkClient.users.getUserList()).map(
      filterUserForClient
    );
    return users;
  }),

  getById: publicProcedure
    .input(
      z.object({
        content: z.string(),
      })
    )
    .query(async ({ input }) => {
      const user = await clerkClient.users.getUser(input.content);
      return filterUserForClient(user);
    }),
});

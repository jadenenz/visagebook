import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";

export const userRelationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const relations = await ctx.prisma.user_Relationship.findMany({
      take: 100,
    });
    return relations;
  }),
});

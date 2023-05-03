import { createTRPCRouter } from "~/server/api/trpc";
import { postRouter } from "./routers/post";
import { userRelationsRouter } from "./routers/userRelations";
import { userRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postRouter,
  relations: userRelationsRouter,
  users: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

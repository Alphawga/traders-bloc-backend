import { publicProcedure, router } from "./trpc";
import * as superAdmin from "./modules/super-admin";
import * as admin from "./modules/admin";
import * as users from "./modules/users";


export const appRouter = router({
  ...superAdmin,
  ...admin,
  ...users,
  ealthCheck: publicProcedure.query(() => {
    return { message: "API up and running..." };
  }),
});

export type AppRouter = typeof appRouter;

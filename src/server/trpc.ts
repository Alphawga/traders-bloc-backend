import { t, createProcedure } from "@/server/context";
import { AdminRole } from "@prisma/client";

export const { router } = t;

export const publicProcedure = t.procedure;
export const authenticatedProcedure = createProcedure();
export const adminProcedure = createProcedure(AdminRole.ADMIN);
export const superAdminProcedure = createProcedure(AdminRole.SUPER_ADMIN);
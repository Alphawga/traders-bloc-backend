import { t, createProcedure } from "@/server/context";
import { BLOCK_PERMISSIONS } from "@/lib/contants";

export const { router } = t;

export const publicProcedure = t.procedure;
export const authenticatedProcedure = createProcedure();
export const adminProcedure = createProcedure(BLOCK_PERMISSIONS.ADMIN);
export const superAdminProcedure = createProcedure(BLOCK_PERMISSIONS.ADMIN);
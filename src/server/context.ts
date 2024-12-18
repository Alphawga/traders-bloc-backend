import { BLOCK_PERMISSIONS } from "@/lib/contants";
import { initTRPC, TRPCError } from "@trpc/server";
import { Session } from "next-auth";
import SuperJSON from "superjson";
import prisma from "@/lib/prisma";

export const t = initTRPC.context<{ session?: Session | null }>().create({ transformer: SuperJSON });

export async function checkPermission(userId: string, requiredPermission: string) {
  const claim = await prisma.claim.findFirst({
    where: {
      user_id: userId,
      active: true,
      OR: [
        {
          // Check direct permission
          permission: {
            action: requiredPermission,
            active: true,
          }
        },
        {
          // Check role-based permission
          role: {
            permissions: {
              some: {
                permission: {
                  action: requiredPermission,
                  active: true,
                }
              }
            }
          }
        }
      ]
    },
    include: {
      permission: true,
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  return !!claim;
}

export function createProcedure(requiredPermission?: string) {
  return t.procedure.use(async (opts) => {
    const { session } = opts.ctx;

    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (requiredPermission) {
      const hasPermission = await checkPermission(session.user.id, requiredPermission);
      
      if (!hasPermission) {
        throw new TRPCError({ 
          code: "FORBIDDEN",
          message: `Missing required permission: ${requiredPermission}`
        });
      }
    }

    return opts.next({ ctx: { session } });
  });
}
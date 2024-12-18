import { Session } from "next-auth";
import prisma from "./prisma";
import { BLOCK_PERMISSIONS } from "./contants";

export interface PermissionCheckResult {
  permissions: string[];
  userId: string;
  hasPermission: (permission: keyof typeof BLOCK_PERMISSIONS) => boolean;
  hasAnyPermission: (permissions: Array<keyof typeof BLOCK_PERMISSIONS>) => boolean;
  hasAllPermissions: (permissions: Array<keyof typeof BLOCK_PERMISSIONS>) => boolean;
}

export async function getUserPermissions(session?: Session | null): Promise<PermissionCheckResult> {
  if (!session?.user?.id) {
    return {
      permissions: [],
      userId: '',
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
    };
  }

  const userClaims = await prisma.claim.findMany({
    where: {
      user_id: session.user.id,
      active: true,
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

  const permissions = userClaims.flatMap(claim => {
    const directPermission = claim.permission?.action;
    const rolePermissions = claim.role?.permissions.map(p => p.permission.action) ?? [];
    return [directPermission, ...rolePermissions];
  }).filter(Boolean) as string[];

  const hasPermission = (permission: keyof typeof BLOCK_PERMISSIONS) => 
    permissions.includes(BLOCK_PERMISSIONS[permission]);

  const hasAnyPermission = (perms: Array<keyof typeof BLOCK_PERMISSIONS>) => 
    perms.some(permission => hasPermission(permission));

  const hasAllPermissions = (perms: Array<keyof typeof BLOCK_PERMISSIONS>) => 
    perms.every(permission => hasPermission(permission));

  return {
    permissions,
    userId: session.user.id,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}


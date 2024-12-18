import { useSession } from "next-auth/react";
import { BLOCK_PERMISSIONS } from "@/lib/contants";

export function usePermission() {
  const { data: session } = useSession();

 

  const hasPermission = (permission: keyof typeof BLOCK_PERMISSIONS) => {
    const hasPermission = session?.user.permissions?.includes(BLOCK_PERMISSIONS[permission]) ?? false;
   
    return hasPermission;
  };

  const hasAnyPermission = (permissions: Array<keyof typeof BLOCK_PERMISSIONS>) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Array<keyof typeof BLOCK_PERMISSIONS>) => {
    return permissions.every(permission => hasPermission(permission));
  };

  const getRole = () => session?.user.role;

  const isAdmin = () => session?.user.role === "ADMIN";

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRole,
    isAdmin,
    permissions: session?.user.permissions ?? [],
    role: session?.user.role,
  };
} 
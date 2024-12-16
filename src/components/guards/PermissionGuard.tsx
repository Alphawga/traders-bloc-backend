import { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";
import { BLOCK_PERMISSIONS } from "@/lib/contants";

interface PermissionGuardProps {
  children: ReactNode;
  permission: keyof typeof BLOCK_PERMISSIONS;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
} 
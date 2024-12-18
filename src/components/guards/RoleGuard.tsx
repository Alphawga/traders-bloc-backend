import { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";

interface RoleGuardProps {
  children: ReactNode;
  role: string;
  fallback?: ReactNode;
}

export function RoleGuard({ children, role, fallback = null }: RoleGuardProps) {
  const { getRole } = usePermission();

  if (getRole() !== role) {
    return fallback;
  }

  return <>{children}</>;
} 
import { useAuth } from './use-auth'
import { hasPermission, hasAnyPermission, hasAllPermissions, canAccessView, UserRole } from '@/lib/roles'

export function usePermissions() {
  const { session } = useAuth()
  const userRole = session?.role

  return {
    userRole,
    hasPermission: (permissionId: string) => hasPermission(userRole, permissionId),
    hasAnyPermission: (permissionIds: string[]) => hasAnyPermission(userRole, permissionIds),
    hasAllPermissions: (permissionIds: string[]) => hasAllPermissions(userRole, permissionIds),
    canAccessView: (view: string) => canAccessView(userRole, view),
    isAdmin: userRole === 'admin',
    isAnalyst: userRole === 'analyst' || userRole === 'admin',
    isOperator: userRole === 'operator' || userRole === 'analyst' || userRole === 'admin',
    isViewer: !!userRole
  }
}

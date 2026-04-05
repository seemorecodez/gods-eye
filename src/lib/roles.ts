export type UserRole = 'admin' | 'analyst' | 'operator' | 'viewer'

export interface Permission {
  id: string
  name: string
  description: string
  category: 'data' | 'ai' | 'map' | 'export' | 'admin'
}

export interface RoleDefinition {
  id: UserRole
  name: string
  description: string
  permissions: string[]
  level: number
}

export const PERMISSIONS: Record<string, Permission> = {
  'view:stack': {
    id: 'view:stack',
    name: 'View Stack',
    description: 'View repository stack and architecture',
    category: 'data'
  },
  'view:monitor': {
    id: 'view:monitor',
    name: 'View Data Monitor',
    description: 'View data source health and status',
    category: 'data'
  },
  'view:pipeline': {
    id: 'view:pipeline',
    name: 'View Pipeline',
    description: 'View AI processing pipeline',
    category: 'ai'
  },
  'view:map': {
    id: 'view:map',
    name: 'View Map',
    description: 'View collaborative map interface',
    category: 'map'
  },
  'view:analytics': {
    id: 'view:analytics',
    name: 'View Analytics',
    description: 'View API and system analytics',
    category: 'data'
  },
  'create:annotation': {
    id: 'create:annotation',
    name: 'Create Annotations',
    description: 'Add annotations to map markers',
    category: 'map'
  },
  'edit:annotation': {
    id: 'edit:annotation',
    name: 'Edit Annotations',
    description: 'Edit existing annotations',
    category: 'map'
  },
  'delete:annotation': {
    id: 'delete:annotation',
    name: 'Delete Annotations',
    description: 'Delete annotations',
    category: 'map'
  },
  'run:ml-prediction': {
    id: 'run:ml-prediction',
    name: 'Run ML Predictions',
    description: 'Execute machine learning predictions',
    category: 'ai'
  },
  'retrain:model': {
    id: 'retrain:model',
    name: 'Retrain Models',
    description: 'Retrain ML models with new data',
    category: 'ai'
  },
  'export:pdf': {
    id: 'export:pdf',
    name: 'Export PDF Reports',
    description: 'Generate and export PDF reports',
    category: 'export'
  },
  'export:data': {
    id: 'export:data',
    name: 'Export Data',
    description: 'Export data in CSV, JSON, GeoJSON formats',
    category: 'export'
  },
  'manage:threats': {
    id: 'manage:threats',
    name: 'Manage Threat Alerts',
    description: 'Create and manage threat alerts',
    category: 'admin'
  },
  'manage:cameras': {
    id: 'manage:cameras',
    name: 'Manage Camera Feeds',
    description: 'Add, edit, or remove camera feeds',
    category: 'admin'
  },
  'manage:users': {
    id: 'manage:users',
    name: 'Manage Users',
    description: 'Manage user accounts and roles',
    category: 'admin'
  },
  'manage:settings': {
    id: 'manage:settings',
    name: 'Manage Settings',
    description: 'Configure system settings',
    category: 'admin'
  },
  'acknowledge:alerts': {
    id: 'acknowledge:alerts',
    name: 'Acknowledge Alerts',
    description: 'Acknowledge system alerts',
    category: 'data'
  },
  'configure:refresh': {
    id: 'configure:refresh',
    name: 'Configure Refresh Intervals',
    description: 'Set data refresh intervals',
    category: 'admin'
  }
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to view data and reports',
    level: 1,
    permissions: [
      'view:stack',
      'view:monitor',
      'view:pipeline',
      'view:map',
      'view:analytics'
    ]
  },
  operator: {
    id: 'operator',
    name: 'Operator',
    description: 'Can view data, create annotations, and run ML predictions',
    level: 2,
    permissions: [
      'view:stack',
      'view:monitor',
      'view:pipeline',
      'view:map',
      'view:analytics',
      'create:annotation',
      'edit:annotation',
      'run:ml-prediction',
      'export:pdf',
      'export:data',
      'acknowledge:alerts'
    ]
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    description: 'Full analytical capabilities including threat management',
    level: 3,
    permissions: [
      'view:stack',
      'view:monitor',
      'view:pipeline',
      'view:map',
      'view:analytics',
      'create:annotation',
      'edit:annotation',
      'delete:annotation',
      'run:ml-prediction',
      'retrain:model',
      'export:pdf',
      'export:data',
      'manage:threats',
      'acknowledge:alerts'
    ]
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access and configuration',
    level: 4,
    permissions: Object.keys(PERMISSIONS)
  }
}

export function hasPermission(userRole: UserRole | undefined, permissionId: string): boolean {
  if (!userRole) return false
  const role = ROLES[userRole]
  return role.permissions.includes(permissionId)
}

export function hasAnyPermission(userRole: UserRole | undefined, permissionIds: string[]): boolean {
  if (!userRole) return false
  return permissionIds.some(permissionId => hasPermission(userRole, permissionId))
}

export function hasAllPermissions(userRole: UserRole | undefined, permissionIds: string[]): boolean {
  if (!userRole) return false
  return permissionIds.every(permissionId => hasPermission(userRole, permissionId))
}

export function getPermissionsByCategory(category: Permission['category']): Permission[] {
  return Object.values(PERMISSIONS).filter(p => p.category === category)
}

export function getRolePermissions(role: UserRole): Permission[] {
  const roleDefinition = ROLES[role]
  return roleDefinition.permissions.map(id => PERMISSIONS[id]).filter(Boolean)
}

export function canAccessView(userRole: UserRole | undefined, view: string): boolean {
  const viewPermissionMap: Record<string, string> = {
    'stack': 'view:stack',
    'monitor': 'view:monitor',
    'pipeline': 'view:pipeline',
    'map': 'view:map',
    'activity': 'view:monitor',
    'ml-predictions': 'view:pipeline',
    'emergent-patterns': 'view:pipeline',
    'threat-alerts': 'view:monitor',
    'analytics': 'view:analytics',
    'guide': 'view:stack'
  }
  
  const requiredPermission = viewPermissionMap[view]
  if (!requiredPermission) return true
  
  return hasPermission(userRole, requiredPermission)
}

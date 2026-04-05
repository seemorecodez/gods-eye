import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { ROLES, PERMISSIONS, UserRole, getRolePermissions } from '@/lib/roles'
import { Shield, User, LockKey, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

export function RoleManagementPanel() {
  const { session, updateRole } = useAuth()
  const { hasPermission, userRole } = usePermissions()
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(userRole)

  const canManageRoles = hasPermission('manage:users')

  if (!canManageRoles) {
    return (
      <Alert className="bg-card border-border">
        <AlertDescription className="text-muted-foreground">
          You don't have permission to manage user roles. Contact an administrator for access.
        </AlertDescription>
      </Alert>
    )
  }

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole)
    updateRole(newRole)
    toast.success(`Role updated to ${ROLES[newRole].name}`, {
      description: `You now have ${newRole} level permissions`
    })
  }

  const currentRolePermissions = userRole ? getRolePermissions(userRole) : []
  const selectedRolePermissions = selectedRole ? getRolePermissions(selectedRole) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ROLE & PERMISSIONS MANAGEMENT</h2>
          <p className="text-sm text-muted-foreground">Configure user roles and access control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User size={20} className="text-accent" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session && (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={session.avatarUrl}
                    alt={session.login}
                    className="w-12 h-12 rounded-full border-2 border-accent"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{session.login}</p>
                    <p className="text-xs text-muted-foreground">{session.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <Badge
                      variant={session.role === 'admin' ? 'default' : 'secondary'}
                      className="font-mono"
                    >
                      {ROLES[session.role].name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Access Level</span>
                    <span className="text-sm font-mono text-accent">
                      Level {ROLES[session.role].level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Permissions</span>
                    <span className="text-sm font-mono text-accent">
                      {currentRolePermissions.length}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={20} className="text-accent" />
              Role Assignment
            </CardTitle>
            <CardDescription>Change user role to adjust permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Select Role</label>
              <Select
                value={selectedRole}
                onValueChange={(value) => handleRoleChange(value as UserRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLES) as UserRole[]).map((roleKey) => {
                    const role = ROLES[roleKey]
                    return (
                      <SelectItem key={roleKey} value={roleKey}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{role.name}</span>
                          <span className="text-xs text-muted-foreground">
                            (Level {role.level})
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">
                  {ROLES[selectedRole].name} Description
                </p>
                <p className="text-sm text-muted-foreground">
                  {ROLES[selectedRole].description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">Total Permissions:</span>
                  <Badge className="font-mono">
                    {selectedRolePermissions.length}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LockKey size={20} className="text-accent" />
            Available Roles
          </CardTitle>
          <CardDescription>Role hierarchy and permission breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(ROLES) as UserRole[]).map((roleKey) => {
              const role = ROLES[roleKey]
              const isCurrentRole = roleKey === userRole

              return (
                <Card
                  key={roleKey}
                  className={`bg-muted border ${
                    isCurrentRole ? 'border-accent' : 'border-border'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      {isCurrentRole && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Level {role.level} Access
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-semibold text-foreground mb-1">
                        {role.permissions.length} Permissions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedRole && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">
              {ROLES[selectedRole].name} Permissions
            </CardTitle>
            <CardDescription>
              Detailed permission breakdown for {ROLES[selectedRole].name} role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedRolePermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/50"
                >
                  <CheckCircle size={20} className="text-status-active mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {permission.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {permission.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {selectedRolePermissions.length === 0 && (
              <div className="text-center py-8">
                <XCircle size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No permissions available for this role
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Permission Categories</CardTitle>
          <CardDescription>Overview of all available permissions by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['data', 'ai', 'map', 'export', 'admin'].map((category) => {
              const categoryPermissions = Object.values(PERMISSIONS).filter(
                (p) => p.category === category
              )

              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground capitalize">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {categoryPermissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <span className="text-accent">•</span>
                        {perm.name}
                      </div>
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {categoryPermissions.length} permissions
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

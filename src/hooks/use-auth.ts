import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'
import { UserRole } from '@/lib/roles'

export interface UserSession {
  userId: number
  login: string
  avatarUrl: string
  email: string
  isOwner: boolean
  role: UserRole
  lastLogin: number
  preferences: {
    defaultView: string
    mapCenter: [number, number]
    mapZoom: number
    theme: 'light' | 'dark'
    notifications: boolean
  }
}

export function useAuth() {
  const [session, setSession] = useKV<UserSession | null>('user-session', null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initializeAuth() {
      try {
        const user = await window.spark.user()
        
        if (!user) {
          setIsLoading(false)
          return
        }
        
        setSession((currentSession) => {
          if (!currentSession || currentSession.userId !== user.id) {
            return {
              userId: user.id,
              login: user.login,
              avatarUrl: user.avatarUrl,
              email: user.email,
              isOwner: user.isOwner,
              role: user.isOwner ? ('admin' as UserRole) : ('viewer' as UserRole),
              lastLogin: Date.now(),
              preferences: {
                defaultView: 'stack',
                mapCenter: [0, 0] as [number, number],
                mapZoom: 2,
                theme: 'dark' as const,
                notifications: true
              }
            }
          } else {
            return {
              ...currentSession,
              role: currentSession.role || (user.isOwner ? ('admin' as UserRole) : ('viewer' as UserRole)),
              lastLogin: Date.now()
            }
          }
        })
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const updatePreferences = (preferences: Partial<UserSession['preferences']>) => {
    setSession((currentSession) => {
      if (!currentSession) return null
      return {
        ...currentSession,
        preferences: {
          ...currentSession.preferences,
          ...preferences
        }
      }
    })
  }

  const updateRole = (role: UserRole) => {
    setSession((currentSession) => {
      if (!currentSession) return null
      return {
        ...currentSession,
        role
      }
    })
  }

  const logout = () => {
    setSession(null)
  }

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    updatePreferences,
    updateRole,
    logout
  }
}

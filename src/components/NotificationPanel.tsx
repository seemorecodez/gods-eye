import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, CheckCircle, Trash, WarningCircle, Info, XCircle } from '@phosphor-icons/react'
import { useNotifications, SystemNotification } from '@/hooks/use-notifications'
import { formatDistanceToNow } from 'date-fns'

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications()

  const getIcon = (notification: SystemNotification) => {
    switch (notification.severity) {
      case 'success':
        return <CheckCircle size={20} className="text-status-active" weight="fill" />
      case 'warning':
        return <WarningCircle size={20} className="text-status-warning" weight="fill" />
      case 'error':
        return <XCircle size={20} className="text-status-critical" weight="fill" />
      default:
        return <Info size={20} className="text-accent" weight="fill" />
    }
  }

  const getTypeColor = (type: SystemNotification['type']) => {
    switch (type) {
      case 'permission':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'role':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'data':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'export':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      case 'alert':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'security':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell size={24} className="text-accent" weight="fill" />
              SYSTEM NOTIFICATIONS
            </CardTitle>
            <CardDescription>
              Real-time alerts for permission changes, role updates, and system events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="default" className="text-lg px-3 py-1">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check size={16} className="mr-2" />
            Mark All Read
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            <Trash size={16} className="mr-2" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-4 transition-all ${
                    notification.read
                      ? 'bg-muted/30 border-border opacity-60'
                      : 'bg-card border-accent shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notification)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground">
                            {notification.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getTypeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="h-7 w-7 p-0"
                            >
                              <Check size={16} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {notification.userName && (
                          <span>by {notification.userName}</span>
                        )}
                        <span>
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                          <div className="space-y-1">
                            {Object.entries(notification.metadata).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="text-foreground">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

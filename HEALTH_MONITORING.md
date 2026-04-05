# Health Monitoring System

## Overview

The God's Eye platform now includes a comprehensive health monitoring system that automatically detects when data sources go offline, tracks sync times, and implements intelligent reconnection logic with exponential backoff.

## Features

### 1. Automatic Health Monitoring
- **Continuous Health Checks**: Every data source is monitored every 30 seconds
- **Real-time Status Updates**: Health status updates reflect in the UI within 5 seconds
- **GitHub API Validation**: Each health check validates the repository is accessible via GitHub API

### 2. Alert Notifications
- **Instant Toast Notifications**: Pop-up alerts for critical events
- **Alert Dashboard**: Dedicated alert panel in the Monitor tab
- **Alert Types**:
  - 🔴 **OFFLINE**: Data source is unreachable
  - 🟡 **DEGRADED**: Data source experiencing issues
  - 🟡 **SLOW SYNC**: Sync time exceeds 5-minute threshold
  - 🟢 **RECONNECTED**: Data source successfully restored

### 3. Exponential Backoff Reconnection
- **Initial Retry**: 1 second after first failure
- **Exponential Growth**: Each retry doubles the wait time (1s → 2s → 4s → 8s...)
- **Maximum Backoff**: Caps at 5 minutes between retries
- **Max Attempts**: Up to 10 reconnection attempts before marking as critical
- **Automatic Recovery**: Automatically resumes normal monitoring when reconnected

### 4. Health Metrics
Each data source card displays:
- **Uptime Percentage**: Success rate over last 50 health checks
- **Average Response Time**: Mean response time in milliseconds
- **Total Health Checks**: Cumulative health check count
- **Reconnection Status**: Visual progress indicator during reconnection attempts

## Architecture

### Health Monitor (`/src/lib/health-monitor.ts`)
Core singleton service that manages:
- Health check execution
- Reconnection attempt tracking
- Alert generation and management
- Listener notifications

### React Hook (`/src/hooks/use-health-monitor.ts`)
Provides React components with:
- Real-time alert updates
- Health status for each data source
- Alert acknowledgment functions
- Metrics retrieval

### Alert Notifications Component (`/src/components/AlertNotifications.tsx`)
Displays:
- Active alerts with animated entry/exit
- Alert type badges and icons
- Timestamp with relative time
- Individual and bulk acknowledgment

### Enhanced Data Source Card (`/src/components/DataSourceCard.tsx`)
Shows:
- Real-time health status
- Reconnection progress bar
- Next retry countdown
- Performance metrics

## Configuration

### Thresholds
```typescript
SYNC_THRESHOLD_MS = 5 * 60 * 1000        // 5 minutes
MAX_RETRY_ATTEMPTS = 10                   // Maximum reconnection attempts
INITIAL_BACKOFF_MS = 1000                 // 1 second initial backoff
MAX_BACKOFF_MS = 5 * 60 * 1000           // 5 minutes maximum backoff
```

### Monitoring Intervals
- Health checks: Every 30 seconds
- Status updates: Every 5 seconds
- Metrics refresh: Every 2 seconds

## Usage

### In Components
```typescript
import { useHealthMonitor } from '@/hooks/use-health-monitor'
import { dataSources } from '@/lib/data'

function MyComponent() {
  const { alerts, healthStatuses, acknowledgeAlert } = useHealthMonitor(dataSources)
  
  return (
    <div>
      {alerts.length > 0 && (
        <AlertNotifications 
          alerts={alerts}
          onAcknowledge={acknowledgeAlert}
        />
      )}
    </div>
  )
}
```

### Direct API Usage
```typescript
import { healthMonitor } from '@/lib/health-monitor'

// Start monitoring a data source
healthMonitor.startMonitoring(dataSource, 30000)

// Get health metrics
const metrics = healthMonitor.getMetrics(dataSourceId)

// Get reconnection status
const status = healthMonitor.getReconnectionStatus(dataSourceId)

// Listen for alert changes
const unsubscribe = healthMonitor.onAlertsChanged((alerts) => {
  console.log('New alerts:', alerts)
})
```

## Health Status Levels

### 🟢 Active (Green)
- Success rate: > 60%
- All systems operational
- Pulsing indicator animation

### 🟡 Warning (Orange)
- Success rate: 40-60%
- Experiencing intermittent issues
- Steady indicator

### 🔴 Critical (Red)
- Success rate: < 40%
- Offline or severely degraded
- Reconnection attempts in progress

## Exponential Backoff Strategy

The system uses exponential backoff to avoid overwhelming failing services:

| Attempt | Wait Time | Cumulative Wait |
|---------|-----------|-----------------|
| 1       | 1s        | 1s              |
| 2       | 2s        | 3s              |
| 3       | 4s        | 7s              |
| 4       | 8s        | 15s             |
| 5       | 16s       | 31s             |
| 6       | 32s       | 1m 3s           |
| 7       | 1m 4s     | 2m 7s           |
| 8       | 2m 8s     | 4m 15s          |
| 9       | 5m        | 9m 15s          |
| 10      | 5m        | 14m 15s         |

## Data Source Status

All data sources are now online and actively monitored:

- ✅ **ACLED Conflict Events** - Active
- ✅ **Sentinel-2 Imagery** - Active
- ✅ **Google Earth Engine** - Active (previously degraded, now fixed)
- ✅ **OSINT COVID-19 Pattern** - Active
- ✅ **Conflict Analysis DB** - Active (previously offline, now fixed)

## Future Enhancements

- [ ] Historical health trend graphs
- [ ] Custom alert webhooks
- [ ] Configurable thresholds per data source
- [ ] Email/SMS alert delivery
- [ ] Health check scheduling customization
- [ ] Automated incident reports

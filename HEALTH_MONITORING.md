# Health Monitoring System

The God's E

The God's Eye platform now includes a comprehensive health monitoring system that automatically detects when data sources go offline, tracks sync times, and implements intelligent reconnection logic with exponential backoff.

## Features


- **Instant Toast Notifications**: Pop-up alerts for critical events
- **Alert Types**:
  - 🟡 **DEGRADED**: Data source experiencing issues

### 3. Exponential Backoff
- **Exponential Growth**: Each retry doubles the wait time (1s → 2s 
- **Max Attempts**: Up to 10 reconnection attempts before marki
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
### Monitoring Interv



```typescript
import { data
function MyComponent() {
  
    <div>
        <AlertNotifications 
   

  )
```
### Direct API Usage
import { healthMonitor } from '@/l



// Get reconnecti

const unsubscribe = healthMonitor.onAlertsChanged((alerts) =>
})


- Success rate: > 60%
- 
### 🟡 War
- Experie

- Success rate: < 40%
- Reconnection attempts i
## Exponential Backoff Strategy
The system
| Attemp
| 1       
| 3
|
| 7





- ✅ **OSINT COVID-19 Pattern** - 


- [ ] Custom alert we
- [ ] Email/SMS alert delivery































































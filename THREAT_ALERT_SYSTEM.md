# AUTOMATED THREAT ALERT SYSTEM

## Overview

The God's Eye platform now includes a comprehensive automated threat alert system that monitors critical patterns detected by ML/AI systems and sends email notifications to designated stakeholders when configurable thresholds are exceeded.

## System Architecture

### Components

1. **ThreatAlertSystem** (`/src/lib/threat-alert-system.ts`)
   - Core alert logic and email notification system
   - Configuration management
   - Stakeholder management
   - Alert history tracking with persistence

2. **ThreatAlertManagement** (`/src/components/ThreatAlertManagement.tsx`)
   - UI for managing stakeholders, configurations, and viewing alert history
   - Accessible via "Threat Alerts" tab in main navigation

3. **Integration Points**
   - **Emergent Pattern Detection**: Triggers alerts when high-probability patterns are detected
   - **ML Predictions**: Triggers alerts for high/critical threat levels and satellite anomalies
   - **Multi-Source Fusion**: Alerts when intelligence domains correlate

## Alert Types

### 1. CRITICAL_THREAT
- **Trigger**: ML threat analysis identifies HIGH or CRITICAL threat levels
- **Default Threshold**: 75% confidence minimum
- **Default Cooldown**: 30 minutes
- **Example**: "CRITICAL threat detected in Damascus, Syria"

### 2. EMERGENT_PATTERN
- **Trigger**: Pattern detection identifies non-obvious correlations with high probability
- **Default Threshold**: 70% confidence minimum
- **Default Cooldown**: 60 minutes
- **Example**: "Port congestion + fertilizer shortage + ethnic polarization = 78% probability of violence"

### 3. DATA_ANOMALY
- **Trigger**: Reserved for future data source anomaly detection
- **Default Threshold**: 80% confidence minimum
- **Default Cooldown**: 120 minutes
- **Purpose**: Detect unusual patterns in data ingestion or quality

### 4. ML_HIGH_CONFIDENCE
- **Trigger**: Satellite imagery analysis detects anomalies with high confidence
- **Default Threshold**: 85% confidence minimum
- **Default Cooldown**: 45 minutes
- **Example**: "Satellite anomalies detected - military vehicle buildup observed"

## Email Notification System

### Email Format

Emails are generated in both plain text and HTML formats with:
- Alert severity indicator (🔴 CRITICAL or 🟠 HIGH)
- Alert type and confidence score
- Timestamp and trigger source
- Location (when applicable)
- Threat summary and description
- Key contributing factors
- Supporting data points
- Actionable recommendation
- Unique alert ID for tracking

### Email Delivery

Emails are currently logged to the browser console in production format. The system is designed to integrate with:
- SMTP relay services
- Transactional email APIs (SendGrid, Mailgun, etc.)
- Enterprise email systems

**Console Output Format:**
```
=== THREAT ALERT EMAIL ===
TO: Operations Lead <ops.lead@intelligence.gov>, Chief Analyst <chief.analyst@intelligence.gov>
SUBJECT: 🔴 CRITICAL ALERT: High-confidence military buildup detected
TIMESTAMP: 2024-01-15T14:30:00.000Z
---
[Full email body with all alert details]
===========================
```

## Configuration Management

### Alert Configurations

Each alert type has an independent configuration:

- **Enabled/Disabled**: Toggle alerts on/off
- **Minimum Confidence**: Only send when ML confidence exceeds threshold (50-100%)
- **Minimum Severity**: Filter by HIGH or CRITICAL only
- **Cooldown Period**: Minimum time between alerts of same type (15-240 minutes)
- **Email Recipients**: Select which stakeholders receive this alert type

### Stakeholder Management

Add and manage email recipients:
- **Name**: Stakeholder full name
- **Email**: Email address for notifications
- **Role**: Job title or position
- **Alert Types**: Which alert types this stakeholder should receive
- **Enabled/Disabled**: Toggle stakeholder active status

**Default Stakeholders:**
1. Operations Lead (all alert types)
2. Chief Analyst (threat and pattern alerts)
3. Technical Lead (data and ML alerts)

## Alert Cooldowns

Cooldowns prevent alert fatigue by limiting notification frequency:
- Each alert type has independent cooldown timer
- Timer starts when alert email is sent
- Subsequent detections within cooldown period are logged but not emailed
- Cooldown is configurable per alert type (15-240 minutes)

## Data Persistence

All data persists across sessions using the Spark KV storage:

- **Alert History**: Last 500 alerts stored
- **Alert Configurations**: Per-type settings
- **Stakeholder List**: All configured recipients
- **Cooldown Timers**: Last sent timestamp per alert type
- **Email Logs**: Sent email records with full payload

**Storage Keys:**
- `threat-alerts-history` - Alert history array
- `alert-configurations` - Configuration objects
- `stakeholder-emails` - Stakeholder list
- `last-alert-sent` - Cooldown tracking map
- `email-log-{timestamp}` - Individual email records

## Alert Workflow

### Detection → Alert → Email Flow

1. **Pattern/Threat Detection**
   - ML system analyzes data and generates prediction
   - Confidence score and severity determined

2. **Alert Evaluation**
   - Check if alert type is enabled
   - Verify confidence meets minimum threshold
   - Confirm severity meets minimum requirement
   - Check cooldown period hasn't been violated

3. **Alert Creation**
   - Generate unique alert ID
   - Compile threat summary and factors
   - Store alert in history
   - Mark as pending acknowledgment

4. **Email Generation**
   - Create plain text and HTML email bodies
   - Identify relevant stakeholders based on alert type
   - Filter stakeholders by enabled status
   - Generate recipient list

5. **Notification Delivery**
   - Log email to console (production format)
   - Store email payload for audit trail
   - Update cooldown timer
   - Mark alert as "email sent"

6. **Acknowledgment**
   - Stakeholders can acknowledge via UI
   - Records username and timestamp
   - Alerts marked as acknowledged in history

## Integration Examples

### Emergent Pattern Detection

```typescript
// After detecting pattern with LLM
if (data.probability >= 0.70 && data.confidence >= 0.70) {
  const severity = data.probability >= 0.85 ? 'CRITICAL' : 'HIGH'
  await threatAlertSystem.checkAndCreateAlert(
    'EMERGENT_PATTERN',
    severity,
    data.title,
    `Multi-source intelligence fusion detected emergent pattern...`,
    data.confidence,
    data.fusionChain,  // Key factors
    data.recommendation,
    'MULTI_SOURCE_FUSION',
    selectedDomains.map(d => ({
      source: d.domain,
      value: d.capabilities
    }))
  )
}
```

### ML Threat Analysis

```typescript
// After threat analysis generation
if ((analysis.threatLevel === 'HIGH' || analysis.threatLevel === 'CRITICAL') 
    && analysis.confidence >= 0.75) {
  await threatAlertSystem.checkAndCreateAlert(
    'CRITICAL_THREAT',
    analysis.threatLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
    `${analysis.threatLevel} threat detected in ${location}`,
    `ML threat analysis model identified ${analysis.threatLevel.toLowerCase()} threat...`,
    analysis.confidence,
    analysis.keyFactors,
    analysis.recommendation,
    'ML_PREDICTION',
    [
      { source: 'Region', value: region },
      { source: 'Location', value: location },
      { source: 'Threat Level', value: analysis.threatLevel }
    ],
    { region: location }
  )
}
```

### Satellite Anomaly Detection

```typescript
// After satellite analysis
if (analysis.anomalies.length > 0 && analysis.confidence >= 0.85) {
  await threatAlertSystem.checkAndCreateAlert(
    'ML_HIGH_CONFIDENCE',
    analysis.anomalies.length >= 3 ? 'CRITICAL' : 'HIGH',
    `Satellite anomalies detected in ${location}`,
    `YOLOv8 satellite analysis detected ${analysis.anomalies.length} anomalies...`,
    analysis.confidence,
    analysis.anomalies,
    `Investigate detected objects: ${analysis.detectedObjects.join(', ')}...`,
    'ML_PREDICTION',
    [
      { source: 'Detected Objects', value: analysis.detectedObjects.join(', ') },
      { source: 'Land Cover Change', value: analysis.landCoverChange }
    ],
    { region: location }
  )
}
```

## User Interface

### Threat Alerts Tab

Three sub-tabs for complete alert management:

#### 1. Alert History
- Chronological list of all triggered alerts
- Filterable by acknowledgment status
- Visual severity indicators (red/orange badges)
- Detailed alert cards showing:
  - Alert type and severity
  - Email sent status
  - Confidence score and timestamp
  - Location and trigger source
  - Key factors and data points
  - Recommendation
  - Acknowledgment status
- One-click acknowledgment button

#### 2. Stakeholders
- Grid view of all configured stakeholders
- Visual indicators for active/inactive status
- Add new stakeholder dialog
- Toggle stakeholder on/off
- View subscribed alert types
- Remove stakeholder functionality
- Shows active stakeholder count

#### 3. Configuration
- One card per alert type
- Enable/disable toggle
- Minimum confidence slider (50-100%)
- Cooldown period slider (15-240 minutes)
- Stakeholder selection checkboxes
- Save button per configuration
- Visual feedback for settings

## Best Practices

### Configuring Thresholds

- **Critical Infrastructure Monitoring**: Set confidence to 80%+, cooldown 15-30 minutes
- **Pattern Analysis**: Set confidence to 70%+, cooldown 60-120 minutes
- **Routine Monitoring**: Set confidence to 85%+, cooldown 120-240 minutes

### Managing Stakeholders

- Assign different alert types to different roles
- Operations teams: All alert types
- Analysts: Threat and pattern alerts only
- Technical teams: Data anomaly and ML alerts
- Disable vacation/away stakeholders instead of removing

### Alert Fatigue Prevention

- Use appropriate cooldown periods for each alert type
- Set confidence thresholds to reduce false positives
- Regularly review alert history for tuning opportunities
- Acknowledge processed alerts promptly

## Future Enhancements

Potential improvements to the system:

1. **Email Service Integration**
   - Direct SMTP/API integration for real email delivery
   - Email templates with organizational branding
   - Delivery confirmation and bounce handling

2. **Alert Escalation**
   - Multi-tier notification (email → SMS → voice call)
   - Time-based escalation if unacknowledged
   - On-call rotation support

3. **Advanced Filtering**
   - Geographic region filtering
   - Time-of-day rules
   - Alert correlation and deduplication
   - Custom threshold rules per region

4. **Analytics Dashboard**
   - Alert volume trending
   - Response time metrics
   - False positive rate tracking
   - Stakeholder engagement metrics

5. **Integration Extensions**
   - Slack/Teams webhooks
   - PagerDuty/Opsgenie integration
   - SIEM system forwarding
   - Ticketing system creation

## Security Considerations

- Email addresses stored in browser KV storage (client-side only)
- No actual emails sent from browser (requires backend service)
- Alert data persisted locally per user session
- Implement backend email relay for production deployment
- Consider encryption for sensitive alert content
- Audit trail maintained for all sent notifications

## Troubleshooting

### Alerts Not Triggering
- Check alert type is enabled in Configuration tab
- Verify confidence threshold isn't too high
- Confirm not in cooldown period
- Check stakeholders are configured and enabled

### Missing Email Recipients
- Verify stakeholder is enabled
- Confirm stakeholder subscribed to that alert type
- Check alert type configuration includes stakeholder

### Too Many Alerts
- Increase confidence thresholds
- Extend cooldown periods
- Adjust minimum severity to CRITICAL only
- Review and disable less critical alert types

## Technical Reference

### Alert Data Structure

```typescript
interface ThreatAlert {
  id: string
  alertType: 'CRITICAL_THREAT' | 'EMERGENT_PATTERN' | 'DATA_ANOMALY' | 'ML_HIGH_CONFIDENCE'
  severity: 'HIGH' | 'CRITICAL'
  title: string
  description: string
  location?: { region: string; coordinates?: { lat: number; lng: number } }
  confidence: number
  keyFactors: string[]
  recommendation: string
  timestamp: Date
  triggerSource: 'ML_PREDICTION' | 'PATTERN_DETECTION' | 'THREAT_ANALYSIS' | 'MULTI_SOURCE_FUSION'
  dataPoints: { source: string; value: string }[]
  emailSent: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}
```

### API Methods

```typescript
// Create alert (with automatic email if thresholds met)
await threatAlertSystem.checkAndCreateAlert(
  alertType, severity, title, description,
  confidence, keyFactors, recommendation,
  triggerSource, dataPoints, location
)

// Get alert history
const alerts = await threatAlertSystem.getAlertHistory()

// Acknowledge alert
await threatAlertSystem.acknowledgeAlert(alertId, username)

// Manage configurations
const configs = await threatAlertSystem.getAlertConfigurations()
await threatAlertSystem.updateAlertConfiguration(config)

// Manage stakeholders
const stakeholders = await threatAlertSystem.getStakeholders()
await threatAlertSystem.addStakeholder(stakeholder)
await threatAlertSystem.updateStakeholder(stakeholder)
await threatAlertSystem.removeStakeholder(stakeholderId)
```

---

**System Status**: ✅ Fully Operational
**Last Updated**: 2024
**Version**: 1.0.0

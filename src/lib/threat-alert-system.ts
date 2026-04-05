declare const spark: {
  kv: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
  }
}

export interface ThreatAlert {
  id: string
  alertType: 'CRITICAL_THREAT' | 'EMERGENT_PATTERN' | 'DATA_ANOMALY' | 'ML_HIGH_CONFIDENCE'
  severity: 'HIGH' | 'CRITICAL'
  title: string
  description: string
  location?: {
    region: string
    coordinates?: { lat: number; lng: number }
  }
  confidence: number
  keyFactors: string[]
  recommendation: string
  timestamp: Date
  triggerSource: 'ML_PREDICTION' | 'PATTERN_DETECTION' | 'THREAT_ANALYSIS' | 'MULTI_SOURCE_FUSION'
  dataPoints: {
    source: string
    value: string
  }[]
  emailSent: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

export interface AlertConfiguration {
  id: string
  enabled: boolean
  alertType: ThreatAlert['alertType']
  minConfidence: number
  minSeverity: 'HIGH' | 'CRITICAL'
  cooldownMinutes: number
  emailRecipients: StakeholderEmail[]
}

export interface StakeholderEmail {
  id: string
  name: string
  email: string
  role: string
  alertTypes: ThreatAlert['alertType'][]
  enabled: boolean
}

export interface EmailTemplate {
  subject: string
  body: string
  htmlBody: string
}

export class ThreatAlertSystem {
  private readonly STORAGE_KEY_ALERTS = 'threat-alerts-history'
  private readonly STORAGE_KEY_CONFIG = 'alert-configurations'
  private readonly STORAGE_KEY_STAKEHOLDERS = 'stakeholder-emails'
  private readonly STORAGE_KEY_LAST_SENT = 'last-alert-sent'

  async checkAndCreateAlert(
    alertType: ThreatAlert['alertType'],
    severity: 'HIGH' | 'CRITICAL',
    title: string,
    description: string,
    confidence: number,
    keyFactors: string[],
    recommendation: string,
    triggerSource: ThreatAlert['triggerSource'],
    dataPoints: { source: string; value: string }[],
    location?: { region: string; coordinates?: { lat: number; lng: number } }
  ): Promise<ThreatAlert | null> {
    const configs = await this.getAlertConfigurations()
    const relevantConfig = configs.find(c => c.alertType === alertType && c.enabled)

    if (!relevantConfig) {
      return null
    }

    if (confidence < relevantConfig.minConfidence) {
      return null
    }

    if (severity === 'HIGH' && relevantConfig.minSeverity === 'CRITICAL') {
      return null
    }

    const shouldSend = await this.checkCooldown(alertType, relevantConfig.cooldownMinutes)
    if (!shouldSend) {
      return null
    }

    const alert: ThreatAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertType,
      severity,
      title,
      description,
      location,
      confidence,
      keyFactors,
      recommendation,
      timestamp: new Date(),
      triggerSource,
      dataPoints,
      emailSent: false
    }

    await this.saveAlert(alert)
    await this.sendEmailNotifications(alert, relevantConfig)

    return alert
  }

  private async checkCooldown(alertType: ThreatAlert['alertType'], cooldownMinutes: number): Promise<boolean> {
    try {
      const lastSentMap = await spark.kv.get<Record<string, Date>>(this.STORAGE_KEY_LAST_SENT) || {}
      const lastSent = lastSentMap[alertType]
      
      if (!lastSent) {
        return true
      }

      const lastSentTime = new Date(lastSent).getTime()
      const now = Date.now()
      const cooldownMs = cooldownMinutes * 60 * 1000

      return (now - lastSentTime) >= cooldownMs
    } catch {
      return true
    }
  }

  private async updateLastSent(alertType: ThreatAlert['alertType']): Promise<void> {
    try {
      const lastSentMap = await spark.kv.get<Record<string, Date>>(this.STORAGE_KEY_LAST_SENT) || {}
      lastSentMap[alertType] = new Date()
      await spark.kv.set(this.STORAGE_KEY_LAST_SENT, lastSentMap)
    } catch (error) {
      console.error('Failed to update last sent timestamp:', error)
    }
  }

  private async saveAlert(alert: ThreatAlert): Promise<void> {
    try {
      const alerts = await spark.kv.get<ThreatAlert[]>(this.STORAGE_KEY_ALERTS) || []
      alerts.unshift(alert)
      
      const maxAlerts = 500
      if (alerts.length > maxAlerts) {
        alerts.splice(maxAlerts)
      }
      
      await spark.kv.set(this.STORAGE_KEY_ALERTS, alerts)
    } catch (error) {
      console.error('Failed to save alert:', error)
    }
  }

  async getAlertHistory(): Promise<ThreatAlert[]> {
    try {
      return await spark.kv.get<ThreatAlert[]>(this.STORAGE_KEY_ALERTS) || []
    } catch {
      return []
    }
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      const alerts = await this.getAlertHistory()
      const alertIndex = alerts.findIndex(a => a.id === alertId)
      
      if (alertIndex !== -1) {
        alerts[alertIndex].acknowledgedBy = acknowledgedBy
        alerts[alertIndex].acknowledgedAt = new Date()
        await spark.kv.set(this.STORAGE_KEY_ALERTS, alerts)
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  async getAlertConfigurations(): Promise<AlertConfiguration[]> {
    try {
      const configs = await spark.kv.get<AlertConfiguration[]>(this.STORAGE_KEY_CONFIG)
      if (configs && configs.length > 0) {
        return configs
      }
      
      const defaultConfigs = this.getDefaultConfigurations()
      await spark.kv.set(this.STORAGE_KEY_CONFIG, defaultConfigs)
      return defaultConfigs
    } catch {
      return this.getDefaultConfigurations()
    }
  }

  async updateAlertConfiguration(config: AlertConfiguration): Promise<void> {
    try {
      const configs = await this.getAlertConfigurations()
      const index = configs.findIndex(c => c.id === config.id)
      
      if (index !== -1) {
        configs[index] = config
      } else {
        configs.push(config)
      }
      
      await spark.kv.set(this.STORAGE_KEY_CONFIG, configs)
    } catch (error) {
      console.error('Failed to update alert configuration:', error)
    }
  }

  async getStakeholders(): Promise<StakeholderEmail[]> {
    try {
      const stakeholders = await spark.kv.get<StakeholderEmail[]>(this.STORAGE_KEY_STAKEHOLDERS)
      if (stakeholders && stakeholders.length > 0) {
        return stakeholders
      }
      
      const defaultStakeholders = this.getDefaultStakeholders()
      await spark.kv.set(this.STORAGE_KEY_STAKEHOLDERS, defaultStakeholders)
      return defaultStakeholders
    } catch {
      return this.getDefaultStakeholders()
    }
  }

  async addStakeholder(stakeholder: StakeholderEmail): Promise<void> {
    try {
      const stakeholders = await this.getStakeholders()
      stakeholders.push(stakeholder)
      await spark.kv.set(this.STORAGE_KEY_STAKEHOLDERS, stakeholders)
    } catch (error) {
      console.error('Failed to add stakeholder:', error)
    }
  }

  async updateStakeholder(stakeholder: StakeholderEmail): Promise<void> {
    try {
      const stakeholders = await this.getStakeholders()
      const index = stakeholders.findIndex(s => s.id === stakeholder.id)
      
      if (index !== -1) {
        stakeholders[index] = stakeholder
      } else {
        stakeholders.push(stakeholder)
      }
      
      await spark.kv.set(this.STORAGE_KEY_STAKEHOLDERS, stakeholders)
    } catch (error) {
      console.error('Failed to update stakeholder:', error)
    }
  }

  async removeStakeholder(stakeholderId: string): Promise<void> {
    try {
      const stakeholders = await this.getStakeholders()
      const filtered = stakeholders.filter(s => s.id !== stakeholderId)
      await spark.kv.set(this.STORAGE_KEY_STAKEHOLDERS, filtered)
    } catch (error) {
      console.error('Failed to remove stakeholder:', error)
    }
  }

  private async sendEmailNotifications(alert: ThreatAlert, config: AlertConfiguration): Promise<void> {
    try {
      const recipients = config.emailRecipients.filter(
        r => r.enabled && r.alertTypes.includes(alert.alertType)
      )

      if (recipients.length === 0) {
        return
      }

      const template = this.generateEmailTemplate(alert)
      
      const emailPayload = {
        alert,
        template,
        recipients: recipients.map(r => ({
          name: r.name,
          email: r.email,
          role: r.role
        })),
        timestamp: new Date().toISOString()
      }

      console.log('=== THREAT ALERT EMAIL ===')
      console.log('TO:', recipients.map(r => `${r.name} <${r.email}>`).join(', '))
      console.log('SUBJECT:', template.subject)
      console.log('TIMESTAMP:', new Date().toISOString())
      console.log('---')
      console.log(template.body)
      console.log('===========================')

      await this.logEmailSent(emailPayload)
      
      alert.emailSent = true
      await this.updateLastSent(alert.alertType)
      
    } catch (error) {
      console.error('Failed to send email notifications:', error)
    }
  }

  private async logEmailSent(payload: any): Promise<void> {
    try {
      const logKey = `email-log-${Date.now()}`
      await spark.kv.set(logKey, payload)
    } catch (error) {
      console.error('Failed to log email:', error)
    }
  }

  private generateEmailTemplate(alert: ThreatAlert): EmailTemplate {
    const severityIcon = alert.severity === 'CRITICAL' ? '🔴' : '🟠'
    const confidencePercent = Math.round(alert.confidence * 100)
    
    const subject = `${severityIcon} ${alert.severity} ALERT: ${alert.title}`
    
    const body = `
GOD'S EYE INTELLIGENCE PLATFORM
AUTOMATED THREAT ALERT

═══════════════════════════════════════════════════════════

ALERT TYPE: ${alert.alertType.replace(/_/g, ' ')}
SEVERITY: ${alert.severity}
CONFIDENCE: ${confidencePercent}%
TIMESTAMP: ${alert.timestamp.toISOString()}
TRIGGER SOURCE: ${alert.triggerSource.replace(/_/g, ' ')}

${alert.location ? `LOCATION: ${alert.location.region}${alert.location.coordinates ? ` (${alert.location.coordinates.lat.toFixed(4)}, ${alert.location.coordinates.lng.toFixed(4)})` : ''}` : ''}

═══════════════════════════════════════════════════════════

THREAT SUMMARY:
${alert.title}

DESCRIPTION:
${alert.description}

KEY FACTORS:
${alert.keyFactors.map((factor, i) => `  ${i + 1}. ${factor}`).join('\n')}

DATA POINTS:
${alert.dataPoints.map(dp => `  • ${dp.source}: ${dp.value}`).join('\n')}

RECOMMENDATION:
${alert.recommendation}

═══════════════════════════════════════════════════════════

This is an automated alert generated by the God's Eye Intelligence Platform.
Alert ID: ${alert.id}

Please acknowledge this alert and take appropriate action.
    `.trim()

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'JetBrains Mono', monospace; background: #0f0f23; color: #e0e0e0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #1a1a2e; border: 2px solid ${alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}; padding: 30px; }
    .header { background: ${alert.severity === 'CRITICAL' ? '#991b1b' : '#92400e'}; padding: 20px; margin: -30px -30px 20px -30px; border-bottom: 2px solid ${alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}; }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .severity { display: inline-block; padding: 8px 16px; background: ${alert.severity === 'CRITICAL' ? '#dc2626' : '#d97706'}; color: white; font-weight: bold; margin-top: 10px; }
    .section { margin: 20px 0; padding: 15px; background: #16213e; border-left: 4px solid #64ffda; }
    .section-title { color: #64ffda; font-weight: bold; margin-bottom: 10px; font-size: 14px; }
    .data-grid { display: grid; grid-template-columns: 150px 1fr; gap: 10px; margin: 10px 0; }
    .data-label { color: #64ffda; font-weight: bold; }
    .data-value { color: #e0e0e0; }
    .factors, .datapoints { margin: 10px 0; }
    .factors li, .datapoints li { margin: 5px 0; color: #e0e0e0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #888; font-size: 12px; }
    .confidence { display: inline-block; padding: 4px 12px; background: #065f46; color: #10b981; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${severityIcon} GOD'S EYE THREAT ALERT</h1>
      <div class="severity">${alert.severity} PRIORITY</div>
    </div>
    
    <div class="section">
      <div class="section-title">ALERT DETAILS</div>
      <div class="data-grid">
        <div class="data-label">Alert Type:</div>
        <div class="data-value">${alert.alertType.replace(/_/g, ' ')}</div>
        
        <div class="data-label">Confidence:</div>
        <div class="data-value"><span class="confidence">${confidencePercent}%</span></div>
        
        <div class="data-label">Timestamp:</div>
        <div class="data-value">${new Date(alert.timestamp).toLocaleString()}</div>
        
        <div class="data-label">Trigger Source:</div>
        <div class="data-value">${alert.triggerSource.replace(/_/g, ' ')}</div>
        
        ${alert.location ? `
        <div class="data-label">Location:</div>
        <div class="data-value">${alert.location.region}${alert.location.coordinates ? ` (${alert.location.coordinates.lat.toFixed(4)}, ${alert.location.coordinates.lng.toFixed(4)})` : ''}</div>
        ` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">THREAT SUMMARY</div>
      <h2 style="color: #64ffda; margin-top: 0;">${alert.title}</h2>
      <p style="line-height: 1.6;">${alert.description}</p>
    </div>

    <div class="section">
      <div class="section-title">KEY FACTORS</div>
      <ul class="factors">
        ${alert.keyFactors.map(factor => `<li>${factor}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">SUPPORTING DATA</div>
      <ul class="datapoints">
        ${alert.dataPoints.map(dp => `<li><strong>${dp.source}:</strong> ${dp.value}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">RECOMMENDATION</div>
      <p style="line-height: 1.6; color: #fbbf24; font-weight: bold;">${alert.recommendation}</p>
    </div>

    <div class="footer">
      <p>This is an automated alert generated by the God's Eye Geospatial Intelligence Platform.</p>
      <p>Alert ID: <code>${alert.id}</code></p>
      <p>Please acknowledge this alert and coordinate appropriate response measures.</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    return { subject, body, htmlBody }
  }

  private getDefaultConfigurations(): AlertConfiguration[] {
    return [
      {
        id: 'config-critical-threat',
        enabled: true,
        alertType: 'CRITICAL_THREAT',
        minConfidence: 0.75,
        minSeverity: 'HIGH',
        cooldownMinutes: 30,
        emailRecipients: []
      },
      {
        id: 'config-emergent-pattern',
        enabled: true,
        alertType: 'EMERGENT_PATTERN',
        minConfidence: 0.70,
        minSeverity: 'HIGH',
        cooldownMinutes: 60,
        emailRecipients: []
      },
      {
        id: 'config-data-anomaly',
        enabled: true,
        alertType: 'DATA_ANOMALY',
        minConfidence: 0.80,
        minSeverity: 'CRITICAL',
        cooldownMinutes: 120,
        emailRecipients: []
      },
      {
        id: 'config-ml-high-confidence',
        enabled: true,
        alertType: 'ML_HIGH_CONFIDENCE',
        minConfidence: 0.85,
        minSeverity: 'HIGH',
        cooldownMinutes: 45,
        emailRecipients: []
      }
    ]
  }

  private getDefaultStakeholders(): StakeholderEmail[] {
    return [
      {
        id: 'stakeholder-ops-lead',
        name: 'Operations Lead',
        email: 'ops.lead@intelligence.gov',
        role: 'Operations Director',
        alertTypes: ['CRITICAL_THREAT', 'EMERGENT_PATTERN', 'DATA_ANOMALY', 'ML_HIGH_CONFIDENCE'],
        enabled: true
      },
      {
        id: 'stakeholder-analyst-chief',
        name: 'Chief Analyst',
        email: 'chief.analyst@intelligence.gov',
        role: 'Senior Intelligence Analyst',
        alertTypes: ['CRITICAL_THREAT', 'EMERGENT_PATTERN', 'ML_HIGH_CONFIDENCE'],
        enabled: true
      },
      {
        id: 'stakeholder-tech-lead',
        name: 'Technical Lead',
        email: 'tech.lead@intelligence.gov',
        role: 'Technical Director',
        alertTypes: ['DATA_ANOMALY', 'ML_HIGH_CONFIDENCE'],
        enabled: true
      }
    ]
  }

  async initializeSystem(): Promise<void> {
    await this.getAlertConfigurations()
    await this.getStakeholders()
  }
}

export const threatAlertSystem = new ThreatAlertSystem()

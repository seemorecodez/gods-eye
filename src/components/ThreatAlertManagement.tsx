import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { ExportButton } from '@/components/ExportButton'

declare const spark: {
  user: () => Promise<{ login: string; email: string; avatarUrl: string }>
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bell,
  EnvelopeSimple,
  Plus,
  Trash,
  Warning,
  CheckCircle,
  Clock,
  User,
  Gear,
  ListChecks
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ThreatAlert,
  AlertConfiguration,
  StakeholderEmail,
  threatAlertSystem
} from '@/lib/threat-alert-system'

export function ThreatAlertManagement() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'stakeholders' | 'config'>('alerts')
  const [alerts, setAlerts] = useState<ThreatAlert[]>([])
  const [configurations, setConfigurations] = useState<AlertConfiguration[]>([])
  const [stakeholders, setStakeholders] = useState<StakeholderEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [addStakeholderOpen, setAddStakeholderOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await threatAlertSystem.initializeSystem()
      const [alertHistory, configs, stakeHoldersList] = await Promise.all([
        threatAlertSystem.getAlertHistory(),
        threatAlertSystem.getAlertConfigurations(),
        threatAlertSystem.getStakeholders()
      ])
      setAlerts(alertHistory)
      setConfigurations(configs)
      setStakeholders(stakeHoldersList)
    } catch (error) {
      console.error('Failed to load alert data:', error)
      toast.error('Failed to load alert system data')
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    const user = await spark.user()
    await threatAlertSystem.acknowledgeAlert(alertId, user.login)
    await loadData()
    toast.success('Alert acknowledged')
  }

  const handleUpdateConfiguration = async (config: AlertConfiguration) => {
    await threatAlertSystem.updateAlertConfiguration(config)
    await loadData()
    toast.success('Configuration updated')
  }

  const handleToggleStakeholder = async (stakeholder: StakeholderEmail) => {
    const updated = { ...stakeholder, enabled: !stakeholder.enabled }
    await threatAlertSystem.updateStakeholder(updated)
    await loadData()
    toast.success(`Stakeholder ${updated.enabled ? 'enabled' : 'disabled'}`)
  }

  const handleRemoveStakeholder = async (stakeholderId: string) => {
    await threatAlertSystem.removeStakeholder(stakeholderId)
    await loadData()
    toast.success('Stakeholder removed')
  }

  const getSeverityColor = (severity: 'HIGH' | 'CRITICAL') => {
    return severity === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'
  }

  const getAlertTypeLabel = (type: ThreatAlert['alertType']) => {
    return type.replace(/_/g, ' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Clock size={48} className="mx-auto mb-4 text-accent animate-spin" />
          <p className="text-muted-foreground">Loading alert system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Bell size={32} className="text-accent" weight="fill" />
          <h2 className="text-2xl font-bold text-foreground">AUTOMATED THREAT ALERTS</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Email notifications for critical patterns and high-confidence ML predictions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <ListChecks size={18} className="mr-2" />
            Alert History
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <User size={18} className="mr-2" />
            Stakeholders
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Gear size={18} className="mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {alerts.length} total alerts • {alerts.filter(a => !a.acknowledgedBy).length} pending
            </p>
            <ExportButton
              data={alerts.map(alert => ({
                id: alert.id,
                patternType: getAlertTypeLabel(alert.alertType),
                severity: alert.severity,
                title: alert.title,
                description: alert.description,
                timestamp: new Date(alert.timestamp).toISOString(),
                acknowledgedBy: alert.acknowledgedBy || 'N/A',
                emailSent: alert.emailSent
              }))}
              filename="threat-alerts"
              type="threats"
            />
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              <AnimatePresence>
                {alerts.length === 0 ? (
                  <Card className="p-8 text-center border-border bg-card">
                    <Bell size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No alerts triggered yet</p>
                  </Card>
                ) : (
                  alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 border-border bg-card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getSeverityColor(alert.severity)} text-white`}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline" className="border-accent text-accent">
                                {getAlertTypeLabel(alert.alertType)}
                              </Badge>
                              {alert.emailSent && (
                                <Badge variant="outline" className="border-green-600 text-green-600">
                                  <EnvelopeSimple size={14} className="mr-1" />
                                  Email Sent
                                </Badge>
                              )}
                              {alert.acknowledgedBy && (
                                <Badge variant="outline" className="border-blue-600 text-blue-600">
                                  <CheckCircle size={14} className="mr-1" />
                                  Acknowledged
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-1">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Confidence:</span>{' '}
                                <span className="text-accent font-bold">{Math.round(alert.confidence * 100)}%</span>
                              </div>
                              {alert.location && (
                                <div>
                                  <span className="text-muted-foreground">Location:</span>{' '}
                                  <span className="text-foreground">{alert.location.region}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Timestamp:</span>{' '}
                                <span className="text-foreground">{new Date(alert.timestamp).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Source:</span>{' '}
                                <span className="text-foreground">{alert.triggerSource.replace(/_/g, ' ')}</span>
                              </div>
                            </div>

                            {alert.keyFactors.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-semibold text-accent mb-1">Key Factors:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {alert.keyFactors.map((factor, i) => (
                                    <li key={i}>• {factor}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="bg-muted/30 p-3 rounded border border-border">
                              <p className="text-sm font-semibold text-accent mb-1">Recommendation:</p>
                              <p className="text-sm text-foreground">{alert.recommendation}</p>
                            </div>

                            {alert.acknowledgedBy && (
                              <div className="mt-3 text-xs text-muted-foreground">
                                Acknowledged by {alert.acknowledgedBy} at {new Date(alert.acknowledgedAt!).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {!alert.acknowledgedBy && (
                            <Button
                              size="sm"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="bg-accent text-accent-foreground hover:bg-accent/80"
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="stakeholders" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {stakeholders.filter(s => s.enabled).length} active stakeholders
            </p>
            <AddStakeholderDialog onAdded={loadData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stakeholders.map(stakeholder => (
              <Card key={stakeholder.id} className="p-4 border-border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stakeholder.enabled ? 'bg-accent' : 'bg-muted'}`}>
                      <User size={20} className={stakeholder.enabled ? 'text-accent-foreground' : 'text-muted-foreground'} weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{stakeholder.name}</h3>
                      <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                    </div>
                  </div>
                  <Switch
                    checked={stakeholder.enabled}
                    onCheckedChange={() => handleToggleStakeholder(stakeholder)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <EnvelopeSimple size={16} className="text-accent" />
                    <span className="text-foreground font-mono">{stakeholder.email}</span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Subscribed Alert Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {stakeholder.alertTypes.map(type => (
                        <Badge key={type} variant="outline" className="text-xs border-accent text-accent">
                          {getAlertTypeLabel(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveStakeholder(stakeholder.id)}
                >
                  <Trash size={16} className="mr-1" />
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {configurations.map(config => (
            <ConfigurationCard
              key={config.id}
              config={config}
              stakeholders={stakeholders}
              onUpdate={handleUpdateConfiguration}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AddStakeholderDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<ThreatAlert['alertType'][]>([
    'CRITICAL_THREAT',
    'EMERGENT_PATTERN',
    'ML_HIGH_CONFIDENCE'
  ])

  const alertTypes: ThreatAlert['alertType'][] = [
    'CRITICAL_THREAT',
    'EMERGENT_PATTERN',
    'DATA_ANOMALY',
    'ML_HIGH_CONFIDENCE'
  ]

  const handleSubmit = async () => {
    if (!name || !email || !role) {
      toast.error('Please fill in all fields')
      return
    }

    const stakeholder: StakeholderEmail = {
      id: `stakeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      alertTypes: selectedAlertTypes,
      enabled: true
    }

    await threatAlertSystem.addStakeholder(stakeholder)
    toast.success('Stakeholder added successfully')
    setOpen(false)
    setName('')
    setEmail('')
    setRole('')
    setSelectedAlertTypes(['CRITICAL_THREAT', 'EMERGENT_PATTERN', 'ML_HIGH_CONFIDENCE'])
    onAdded()
  }

  const toggleAlertType = (type: ThreatAlert['alertType']) => {
    if (selectedAlertTypes.includes(type)) {
      setSelectedAlertTypes(selectedAlertTypes.filter(t => t !== type))
    } else {
      setSelectedAlertTypes([...selectedAlertTypes, type])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
          <Plus size={16} className="mr-1" />
          Add Stakeholder
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Stakeholder</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a stakeholder to receive automated threat alert emails
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@organization.gov"
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Senior Analyst"
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Alert Types</Label>
            <div className="space-y-2">
              {alertTypes.map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Switch
                    checked={selectedAlertTypes.includes(type)}
                    onCheckedChange={() => toggleAlertType(type)}
                  />
                  <span className="text-sm text-foreground">{type.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-accent/80">
            Add Stakeholder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfigurationCard({
  config,
  stakeholders,
  onUpdate
}: {
  config: AlertConfiguration
  stakeholders: StakeholderEmail[]
  onUpdate: (config: AlertConfiguration) => void
}) {
  const [enabled, setEnabled] = useState(config.enabled)
  const [minConfidence, setMinConfidence] = useState(config.minConfidence * 100)
  const [cooldown, setCooldown] = useState(config.cooldownMinutes)
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>(
    config.emailRecipients.map(r => r.id)
  )

  const handleSave = () => {
    const recipients = stakeholders.filter(s => selectedStakeholders.includes(s.id))
    const updated: AlertConfiguration = {
      ...config,
      enabled,
      minConfidence: minConfidence / 100,
      cooldownMinutes: cooldown,
      emailRecipients: recipients
    }
    onUpdate(updated)
  }

  const toggleStakeholder = (stakeholderId: string) => {
    if (selectedStakeholders.includes(stakeholderId)) {
      setSelectedStakeholders(selectedStakeholders.filter(id => id !== stakeholderId))
    } else {
      setSelectedStakeholders([...selectedStakeholders, stakeholderId])
    }
  }

  const getAlertTypeLabel = (type: ThreatAlert['alertType']) => {
    return type.replace(/_/g, ' ')
  }

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {getAlertTypeLabel(config.alertType)}
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure email alerts for this detection type
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <Separator className="my-4 bg-border" />

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-foreground">Minimum Confidence</Label>
            <span className="text-sm font-bold text-accent">{minConfidence}%</span>
          </div>
          <Slider
            value={[minConfidence]}
            onValueChange={(v) => setMinConfidence(v[0])}
            min={50}
            max={100}
            step={5}
            className="w-full"
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Only send alerts when confidence exceeds this threshold
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-foreground">Cooldown Period</Label>
            <span className="text-sm font-bold text-accent">{cooldown} min</span>
          </div>
          <Slider
            value={[cooldown]}
            onValueChange={(v) => setCooldown(v[0])}
            min={15}
            max={240}
            step={15}
            className="w-full"
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum time between alerts of this type
          </p>
        </div>

        <div>
          <Label className="text-foreground mb-2 block">Email Recipients</Label>
          <div className="space-y-2">
            {stakeholders.filter(s => s.enabled).map(stakeholder => (
              <div key={stakeholder.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <Switch
                  checked={selectedStakeholders.includes(stakeholder.id)}
                  onCheckedChange={() => toggleStakeholder(stakeholder.id)}
                  disabled={!enabled}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{stakeholder.name}</p>
                  <p className="text-xs text-muted-foreground">{stakeholder.email}</p>
                </div>
              </div>
            ))}
            {stakeholders.filter(s => s.enabled).length === 0 && (
              <p className="text-sm text-muted-foreground">No active stakeholders</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/80"
          disabled={!enabled}
        >
          Save Configuration
        </Button>
      </div>
    </Card>
  )
}

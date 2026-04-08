# Plugin Development Guide

**Add new data sources to God's Eye in under 30 minutes.**

---

## Why Plugins Matter

Every data source someone adds makes God's Eye more useful for everyone. The plugin system lets you:
- Integrate your favorite API
- Share specialized intelligence feeds
- Contribute without touching core code
- Get credit for your work

---

## Plugin Architecture

Plugins are **dead simple** - just a TypeScript object that fetches data and returns markers.

### Basic Structure

```typescript
import { DataSourcePlugin } from '@/lib/plugin-types'

export const myPlugin: DataSourcePlugin = {
  // Required fields
  id: 'unique-id',           // kebab-case, no spaces
  name: 'Display Name',       // Shown in UI
  icon: 'icon-name',          // Phosphor icon name
  category: 'natural',        // 'natural', 'transport', 'infrastructure', 'communications', 'space', 'other'
  
  // Data fetching
  async fetch() {
    // Fetch from API
    // Transform to markers
    // Return array
  },
  
  // Refresh timing
  refreshInterval: 300,       // Seconds between refreshes
  
  // Optional fields
  description: 'What this shows',
  attribution: 'Data source name',
  website: 'https://datasource.com',
  rateLimit: {
    requests: 100,
    period: 3600              // per hour
  }
}
```

---

## Step-by-Step: Your First Plugin

Let's add USGS earthquake data.

### 1. Create Plugin File

```bash
touch src/plugins/earthquakes.ts
```

### 2. Define the Plugin

```typescript
// src/plugins/earthquakes.ts
import { DataSourcePlugin, MapMarker } from '@/lib/plugin-types'

export const earthquakesPlugin: DataSourcePlugin = {
  id: 'usgs-earthquakes',
  name: 'USGS Earthquakes',
  icon: 'wave',
  category: 'natural',
  description: 'Recent earthquake activity from USGS',
  attribution: 'U.S. Geological Survey',
  website: 'https://earthquake.usgs.gov',
  refreshInterval: 300, // 5 minutes
  
  async fetch(): Promise<MapMarker[]> {
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
      )
      
      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        title: feature.properties.title,
        type: 'earthquake',
        
        // Additional data shown in popup
        metadata: {
          magnitude: feature.properties.mag,
          depth: `${feature.geometry.coordinates[2]} km`,
          time: new Date(feature.properties.time).toLocaleString(),
          felt: feature.properties.felt || 'Not reported',
          tsunami: feature.properties.tsunami ? 'Yes' : 'No',
          url: feature.properties.url
        },
        
        // Visual styling
        color: getMagnitudeColor(feature.properties.mag),
        size: getMagnitudeSize(feature.properties.mag)
      }))
    } catch (error) {
      console.error('Failed to fetch earthquake data:', error)
      return [] // Graceful failure
    }
  }
}

function getMagnitudeColor(mag: number): string {
  if (mag >= 6) return 'red'
  if (mag >= 4) return 'orange'
  if (mag >= 2) return 'yellow'
  return 'green'
}

function getMagnitudeSize(mag: number): number {
  return Math.max(8, mag * 4) // Larger earthquakes = bigger markers
}
```

### 3. Register the Plugin

```typescript
// src/plugins/index.ts
import { earthquakesPlugin } from './earthquakes'
import { wildfiresPlugin } from './wildfires' // Other plugins

export const allPlugins = [
  earthquakesPlugin,
  wildfiresPlugin,
  // Add yours here
]
```

### 4. Test It

```bash
npm run dev
```

Open the app, enable your layer, and verify:
- Markers appear in correct locations
- Popup shows all metadata
- Colors/sizes are appropriate
- Refreshes at correct interval

---

## Plugin API Reference

### DataSourcePlugin Interface

```typescript
interface DataSourcePlugin {
  // Identity
  id: string                    // Unique identifier (kebab-case)
  name: string                  // Display name in UI
  icon: string                  // Phosphor icon name
  category: PluginCategory      // Groups plugins in UI
  
  // Core functionality
  fetch: () => Promise<MapMarker[]>  // Get data and return markers
  refreshInterval: number            // Seconds between refreshes
  
  // Optional metadata
  description?: string          // Tooltip text
  attribution?: string          // Data source credit
  website?: string             // Link to data source
  rateLimit?: RateLimit        // API limits to respect
  
  // Advanced (optional)
  onMarkerClick?: (marker: MapMarker) => void  // Custom click handler
  popupTemplate?: (marker: MapMarker) => string // Custom HTML popup
  legend?: LegendItem[]        // Custom legend entries
}
```

### MapMarker Interface

```typescript
interface MapMarker {
  // Required
  id: string | number          // Unique identifier
  lat: number                  // Latitude (-90 to 90)
  lng: number                  // Longitude (-180 to 180)
  title: string                // Primary label
  type: string                 // Category (for filtering)
  
  // Optional display
  color?: string               // Marker color (CSS color)
  size?: number                // Marker size (pixels)
  icon?: string                // Custom icon name
  opacity?: number             // 0 to 1
  
  // Optional data
  metadata?: Record<string, any>  // Shown in popup
  timestamp?: number              // Unix timestamp
  expiresAt?: number              // Auto-remove after
  
  // Optional interactions
  clickable?: boolean          // Can be clicked (default: true)
  draggable?: boolean          // Can be moved (default: false)
  popup?: string               // Custom HTML popup content
}
```

### Plugin Categories

```typescript
type PluginCategory = 
  | 'natural'          // Weather, earthquakes, wildfires
  | 'transport'        // Flights, ships, trains
  | 'infrastructure'   // Cell towers, power grids
  | 'communications'   // Radio, internet
  | 'space'            // Satellites, space weather
  | 'economic'         // ATMs, stock exchanges
  | 'other'            // Anything else
```

---

## Real Plugin Examples

### 1. Simple: Bitcoin ATMs

```typescript
export const bitcoinATMsPlugin: DataSourcePlugin = {
  id: 'bitcoin-atms',
  name: 'Bitcoin ATMs',
  icon: 'currency-btc',
  category: 'economic',
  refreshInterval: 3600, // 1 hour
  
  async fetch() {
    const response = await fetch('https://coinatmradar.com/api/atms')
    const atms = await response.json()
    
    return atms.map(atm => ({
      id: atm.id,
      lat: atm.lat,
      lng: atm.lng,
      title: atm.name,
      type: 'bitcoin-atm',
      metadata: {
        manufacturer: atm.manufacturer,
        buyLimit: atm.buy_limit,
        sellLimit: atm.sell_limit
      }
    }))
  }
}
```

### 2. Advanced: Wildfires with Severity

```typescript
export const wildfiresPlugin: DataSourcePlugin = {
  id: 'nasa-firms-wildfires',
  name: 'NASA FIRMS Wildfires',
  icon: 'fire',
  category: 'natural',
  refreshInterval: 600, // 10 minutes
  rateLimit: { requests: 100, period: 3600 },
  
  async fetch() {
    const response = await fetch(
      'https://firms.modaps.eosdis.nasa.gov/api/area/csv/...your-key...'
    )
    const csv = await response.text()
    const fires = parseCSV(csv)
    
    return fires.map(fire => ({
      id: `${fire.latitude}_${fire.longitude}_${fire.acq_time}`,
      lat: parseFloat(fire.latitude),
      lng: parseFloat(fire.longitude),
      title: `Wildfire (${fire.confidence}% confidence)`,
      type: 'wildfire',
      
      color: getSeverityColor(fire.brightness),
      size: getBrightnessSize(fire.brightness),
      
      metadata: {
        satellite: fire.satellite,
        confidence: `${fire.confidence}%`,
        brightness: `${fire.brightness}K`,
        scan: `${fire.scan} km²`,
        detected: fire.acq_date + ' ' + fire.acq_time
      },
      
      timestamp: parseFireDate(fire.acq_date, fire.acq_time),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // Remove after 24hr
    }))
  },
  
  legend: [
    { color: 'red', label: 'High intensity (>350K)' },
    { color: 'orange', label: 'Medium intensity (320-350K)' },
    { color: 'yellow', label: 'Low intensity (<320K)' }
  ]
}
```

### 3. Complex: Ship Tracking with Filtering

```typescript
export const shipsPlugin: DataSourcePlugin = {
  id: 'ais-ships',
  name: 'AIS Ship Tracking',
  icon: 'boat',
  category: 'transport',
  refreshInterval: 60, // 1 minute
  
  async fetch() {
    const response = await fetch('https://api.vesselfinder.com/...')
    const vessels = await response.json()
    
    return vessels
      .filter(v => v.speed > 0) // Only moving ships
      .map(vessel => ({
        id: vessel.mmsi,
        lat: vessel.lat,
        lng: vessel.lng,
        title: vessel.name || `MMSI ${vessel.mmsi}`,
        type: vessel.type || 'unknown',
        
        icon: getShipIcon(vessel.type),
        color: getShipColor(vessel.type),
        rotation: vessel.heading, // Rotate icon to heading
        
        metadata: {
          mmsi: vessel.mmsi,
          type: vessel.type,
          flag: vessel.flag,
          speed: `${vessel.speed} knots`,
          heading: `${vessel.heading}°`,
          destination: vessel.destination,
          eta: vessel.eta
        }
      }))
  },
  
  onMarkerClick(marker) {
    // Custom click handler
    console.log('Ship clicked:', marker.id)
    window.open(`https://www.vesselfinder.com/vessels/${marker.id}`, '_blank')
  }
}
```

---

## Best Practices

### 1. Handle Errors Gracefully
```typescript
async fetch() {
  try {
    // Your code
  } catch (error) {
    console.error('Plugin error:', error)
    return [] // Return empty array, don't crash app
  }
}
```

### 2. Respect Rate Limits
```typescript
rateLimit: {
  requests: 100,
  period: 3600 // per hour
}
```
The system will automatically throttle your plugin.

### 3. Set Reasonable Refresh Intervals
- **Real-time data:** 30-60 seconds
- **Frequently changing:** 5-10 minutes
- **Rarely changing:** 30-60 minutes
- **Static-ish data:** 2-24 hours

### 4. Clean Up Old Data
```typescript
expiresAt: Date.now() + (24 * 60 * 60 * 1000) // Remove after 24 hours
```

### 5. Provide Attribution
```typescript
attribution: 'Data from USGS',
website: 'https://earthquake.usgs.gov'
```

### 6. Use Appropriate Colors
```typescript
// Use oklch for consistency with theme
color: 'oklch(0.70 0.20 145)' // Green
color: 'oklch(0.75 0.18 80)'  // Yellow
color: 'oklch(0.60 0.22 25)'  // Red
```

---

## Testing Your Plugin

### Local Testing
```bash
npm run dev
```

1. Enable your plugin layer
2. Verify markers appear
3. Click markers, check popups
4. Wait for refresh, verify updates
5. Check browser console for errors

### Production Testing
```bash
npm run build
npm run preview
```

Test in production mode to catch build issues.

---

## Publishing Your Plugin

### 1. Add Documentation
```typescript
// src/plugins/my-plugin.ts
/**
 * USGS Earthquake Data Plugin
 * 
 * Displays recent earthquake activity from the U.S. Geological Survey.
 * Updates every 5 minutes with quakes from the last 24 hours.
 * 
 * Data source: https://earthquake.usgs.gov
 * API docs: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
 * 
 * @author Your Name
 * @license MIT
 */
```

### 2. Create Pull Request
1. Fork the repo
2. Create branch: `plugin/your-plugin-name`
3. Add your plugin
4. Update `src/plugins/index.ts`
5. Add entry to `README.md` plugin list
6. Open PR with description

### 3. PR Template
```markdown
## Plugin: [Name]

### Description
Brief description of what this plugin shows.

### Data Source
- Provider: [Name]
- API: [URL]
- License: [License type]
- Rate limits: [Details]

### Testing
- [ ] Tested locally
- [ ] Markers appear correctly
- [ ] Popups show correct data
- [ ] Refresh works
- [ ] No console errors

### Screenshots
[Add screenshot of your plugin in action]
```

---

## Plugin Ideas

### Easy
- ⚡ Lightning strikes (Blitzortung)
- 🌊 Ocean buoys (NOAA)
- 🏙️ Air quality (OpenAQ)
- ⛽ Gas prices (GasBuddy API)
- 🚴 Bike share stations

### Medium
- 📡 Radio towers (OpenCellID)
- 🚂 Train tracking (various APIs)
- 🌐 Internet outages (Downdetector)
- 🏭 Power plants (OpenInfra)
- 📻 Ham radio repeaters

### Hard
- 🔌 Power grid (multiple sources)
- 🌍 Border crossings (various)
- 💧 Water quality (EPA + regional)
- 🏗️ Construction permits (city APIs)
- 📶 Cell tower data (OpenCellID + FCC)

---

## Get Help

- **Questions?** [Open a discussion](../../discussions/new?category=plugin-development)
- **Bug in plugin system?** [Report it](../../issues/new)
- **Need API help?** Ask in discussions, we'll help find free APIs

---

**Now go build something useful! 🔌**

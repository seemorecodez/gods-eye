# Product Requirements Document

## Mission Statement

**Real-time open-source intelligence map - track global events, flights, satellites, and weather in one place.**

---

## The Problem

OSINT analysts, aviation spotters, storm chasers, and researchers juggle 5-10 browser tabs:
- FlightRadar24 for aircraft
- Windy for weather and webcams
- ISS tracker sites
- News feeds for events
- Manual correlation in spreadsheets

**God's Eye solves this with one unified map.**

---

## Core Philosophy

### What We Are
✅ A **tool** that does one thing exceptionally well  
✅ Open-source and always free  
✅ Real data only, zero fake simulations  
✅ Plugin-first architecture for community growth  
✅ Client-side only (no backend needed)  

### What We're NOT
❌ An "AI-powered intelligence platform" with buzzwords  
❌ A startup trying to monetize users  
❌ An enterprise SaaS product  
❌ A social network or collaboration platform  
❌ Anything requiring complex backend infrastructure  

---

## User Personas

### 1. Aviation Spotter
**Goal:** Track military and interesting flights near home  
**Frequency:** Daily (3-5x per day)  
**Key Feature:** Real-time flight data with military callsign filtering  
**Success:** "I check this every morning to see what's flying nearby"

### 2. OSINT Researcher
**Goal:** Correlate signals across multiple data sources  
**Frequency:** Weekly for specific investigations  
**Key Feature:** Multiple data layers + export capabilities  
**Success:** "This saved me hours of manual correlation work"

### 3. Storm Chaser
**Goal:** Monitor weather + visual confirmation via webcams  
**Frequency:** Daily during storm season  
**Key Feature:** Weather overlay + live webcam feeds  
**Success:** "Best free tool for real-time weather + ground truth"

### 4. ISS Photographer
**Goal:** Never miss a visible ISS pass  
**Frequency:** Daily checks + alerts  
**Key Feature:** Satellite tracking with pass predictions  
**Success:** "I haven't missed a good ISS pass in months"

### 5. Satellite Tracker
**Goal:** Monitor orbital assets and constellation changes  
**Frequency:** Several times per week  
**Key Feature:** Real-time satellite positions with orbital data  
**Success:** "I can track all my favorite satellites in one place"

---

## Core Features (v1.0)

### 1. Unified Map Interface
**What:** Single interactive global map with layer controls  
**Why:** One view for everything eliminates tab-switching  
**How:** 
- React Leaflet for 2D map
- Layer toggles in top-right corner
- Marker clustering for performance
- Mobile-responsive controls

**Success Criteria:**
- All data layers on one map
- <2 second load time
- Smooth on mobile devices
- Works in all modern browsers

### 2. Real Flight Tracking
**What:** Live aircraft positions via OpenSky Network API  
**Why:** Most-requested OSINT data source  
**How:**
- Fetch every 30 seconds
- Military flight detection (ICAO24 prefixes)
- Popup shows: callsign, altitude, speed, heading
- Filter: All / Commercial / Military

**Success Criteria:**
- Shows real aircraft positions globally
- Updates every 30 seconds
- Military filter works accurately
- Graceful fallback if API unavailable

### 3. Real Weather Data
**What:** Live conditions from 1,600+ stations (Open-Meteo)  
**Why:** Essential for operational planning and correlation  
**How:**
- Color-coded temperature overlay
- Popup shows: temp, wind, humidity, visibility, pressure
- Auto-refresh every 5 minutes

**Success Criteria:**
- Global coverage with density in populated areas
- Color gradient intuitive (blue=cold, red=hot)
- Data updates automatically
- No simulated data

### 4. Real Satellite Tracking
**What:** ISS + 10 satellites with orbital mechanics  
**Why:** Space-based intelligence and photography planning  
**How:**
- ISS with special marker (red pulse)
- Orbital position calculations
- Popup shows: altitude, velocity, orbital period
- Updates every 10 seconds

**Success Criteria:**
- Accurate orbital positions
- ISS prominently featured
- Includes key sats: Hubble, Sentinel, Landsat, NOAA
- Pass predictions *(future)*

### 5. Real Webcam Feeds
**What:** 100+ live public webcams via Windy API  
**Why:** Visual ground truth for events  
**How:**
- Global city coverage
- Popup shows: title, location, stream link
- Online/offline status indicator
- Click to open stream in new tab

**Success Criteria:**
- Links to real live streams
- Status accurate (not all will be online)
- Geographically distributed
- Fast preview images

### 6. Plugin System
**What:** Simple architecture for community data sources  
**Why:** Scales value without central development  
**How:**
- TypeScript interface for plugins
- Fetch data, return markers
- Auto-refresh on interval
- Graceful error handling

**Success Criteria:**
- Plugin development <30 minutes
- Clear documentation (PLUGIN_GUIDE.md)
- Example plugin included (earthquakes)
- 5+ community plugins within 3 months

### 7. Saved Locations *(v1.1)*
**What:** Pin places you monitor regularly  
**Why:** Makes daily use frictionless  
**How:**
- useKV for persistence
- Name + coordinates + notes
- Quick jump to location
- Free tier: 5 locations

**Success Criteria:**
- Persists across sessions
- Fast access (sidebar or dropdown)
- Works offline
- Obvious UI for adding

### 8. Alert System *(v1.1)*
**What:** Notifications for nearby events  
**Why:** Proactive monitoring without constant checking  
**How:**
- Rule-based alerts (e.g., "ISS within 100km")
- Browser notifications
- Alert history
- Free tier: 3 alerts

**Success Criteria:**
- Reliable notifications
- Low false-positive rate
- Easy rule creation
- Battery-friendly on mobile

---

## Design Direction

### Visual Identity
**Technical command center aesthetic** - professional, data-dense, authoritative.

Think:
- NASA mission control
- Research laboratory workstations
- Professional aviation displays

NOT:
- Consumer app glossiness
- Social media vibrancy
- Gaming aesthetics

### Color Palette
**Dark technical theme with high-contrast data visualization**

Core colors:
- Background: `oklch(0.12 0.01 250)` - Deep space blue-black
- Foreground: `oklch(0.85 0.01 240)` - Cool light gray
- Accent: `oklch(0.75 0.15 200)` - Laser cyan for critical actions
- Status colors:
  - Active: `oklch(0.70 0.20 145)` - Green
  - Warning: `oklch(0.75 0.18 80)` - Amber
  - Critical: `oklch(0.60 0.22 25)` - Red

All WCAG AA compliant contrast ratios.

### Typography
- **Headings:** Space Grotesk (geometric, technical)
- **Body/Data:** JetBrains Mono (monospace, readable at small sizes)

Hierarchy:
- H1: 32px/bold/tight
- H2: 24px/semibold
- Body: 14px/regular/1.6 line-height
- Caption: 12px/wide letter-spacing

### Layout
- Single-page app with tab navigation (top)
- Map takes full viewport (no sidebar clutter)
- Controls float over map (top-right)
- Mobile: bottom drawer for controls

### Icons
Phosphor Icons throughout:
- Flight: `airplane`
- Weather: `cloud-rain`
- Satellite: `satellite`
- Camera: `camera`
- Location: `map-pin`
- Settings: `gear`

### Animations
**Technical and precise** - no bounce, no playfulness

- Fade-in: 150ms ease-out
- Slide: 200ms ease-out
- Pulse: 2s ease-in-out infinite (status indicators)
- Zoom: 300ms ease-in-out (map transitions)

---

## Technical Architecture

### Stack
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + Shadcn UI v4
- **Mapping:** React Leaflet (2D) + Three.js (optional 3D)
- **State:** React hooks + useKV (persistence)
- **Build:** Vite
- **Hosting:** GitHub Pages (static)

### APIs Used (All Free)
- OpenSky Network (flights)
- Open-Meteo (weather)
- Windy Webcams (cameras)
- Celestrak (satellites)
- USGS (earthquakes - plugin)

### Plugin Architecture
```typescript
interface DataSourcePlugin {
  id: string
  name: string
  icon: string
  category: PluginCategory
  fetch: () => Promise<MapMarker[]>
  refreshInterval: number
}
```

See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) for details.

---

## Success Metrics

### Usage
- Daily active users
- Average session duration >5 minutes
- Users with saved locations
- Return rate (3+ visits)
- Alert click-through rate

### Community
- GitHub stars
- Active contributors
- Plugin submissions
- Issue resolution time <7 days
- PR merge rate >50%

### Impact
- Citations in OSINT reports
- Mentions in research papers
- Featured in tool roundups
- Used by journalists

### Sustainability *(v2.0)*
- GitHub Sponsors revenue
- Grant funding secured
- Institutional partnerships
- Optional pro subscriptions

---

## Anti-Patterns to Avoid

1. **Feature creep** - Say no to scope expansion
2. **Fake data** - Real or nothing
3. **Over-engineering** - Simple beats perfect
4. **Ignoring users** - Build what people actually need
5. **Complexity** - Make contribution stupid easy

---

## Roadmap

### v1.0 (Now) - Core Launch
- One unified map
- Real data only
- Plugin system
- Community docs

### v1.1 (1 month) - Retention
- Saved locations
- Alert system
- 5+ community plugins
- Mobile polish

### v1.2 (3 months) - Richness
- 15+ data sources
- Advanced filtering
- Historical playback
- Data export

### v2.0 (6 months) - Sustainability
- Optional pro features
- Offline mode
- Grant funding
- 10k+ weekly users

See [ROADMAP.md](./ROADMAP.md) for details.

---

## Open Questions

1. Should we support custom map tiles in v1.0 or v1.1?
2. What's the right free tier limit for saved locations? (5? 10?)
3. Do we need 3D globe view or is 2D map sufficient?
4. Should alerts work offline via service worker?
5. How do we handle plugin versioning/breaking changes?

*These will be answered through community feedback post-launch.*

---

**Document Version:** 2.0  
**Last Updated:** 2024-01-15  
**Next Review:** After v1.0 launch

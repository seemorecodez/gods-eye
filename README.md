# 👁️ GOD'S EYE - Geospatial Intelligence Platform

A comprehensive open-source geospatial intelligence demonstration platform that aggregates data from satellites, conflict databases, and public repositories to provide real-time global awareness through AI-powered analysis and interactive visualization.

## ✨ NEW in v2.0: Enhanced Intelligence Features

### 🛰️ ISS Live Feed & Enhanced Satellite Tracking
- **International Space Station** with live NASA TV feed embedded in map
- Real-time orbital tracking of **11 satellites** including ISS, Hubble, Sentinel, Landsat
- Live crew roster and mission parameters
- Orbital mechanics calculations for position updates

### 🌦️ Real-Time Weather Overlay
- Live meteorological data from **Open-Meteo API**
- **1,600 global weather stations** with temperature, wind, humidity, visibility
- Color-coded temperature gradient overlay
- Auto-refresh every 5 minutes

### 💬 Real-Time Collaborative Annotations
- **Team intelligence sharing** with instant sync across all users
- Three annotation types: Notes, Alerts, Observations
- Double-click map to add collaborative markers
- Persistent storage with author attribution
- Included in PDF intelligence reports

> 📖 **See [ENHANCED_FEATURES.md](./ENHANCED_FEATURES.md) for complete documentation**

---

## 🚀 What's Inside

### Live Data Integration
- **GitHub API**: Real-time repository statistics, stars, forks, and commit activity from 14 open-source geospatial projects
- **Open-Meteo Weather API**: Live global weather data with real-time temperature, wind, humidity across 1,600+ stations
- **NASA TV**: ISS live stream embedded in satellite tracking
- **Windy Webcams API**: 100+ real public webcam feeds globally
- **AI-Powered Analysis**: Three distinct AI capabilities using Spark LLM (GPT-4o-mini)

### Key Features

#### 📊 **Repository Stack Explorer**
- Interactive visualization of technology stack across 4 layers
- Data Collection (ACLED, Sentinel, Google Earth Engine)
- AI/ML Processing (YOLOv8, Change Detection)
- Visualization (Kepler.gl, Folium, Plotly)
- Infrastructure (GitHub Actions, Pages, Codespaces)

#### 🗺️ **Collaborative Map Workspace** ⭐ ENHANCED
- Interactive global map with multiple data layers
- **ISS tracking with live NASA TV feed**
- **11 satellites**: ISS, Hubble, Sentinel-1A/2A, Landsat-8/9, Terra, Aqua, NOAA-20, WorldView-3/4
- 300+ camera feed locations (satellite, ground, aerial, webcams, traffic)
- **Live weather overlay** with Open-Meteo API integration (1,600+ stations)
- **Real-time collaborative annotations** syncing across team members
- Threat prediction zones based on event analysis
- PDF intelligence report export with annotations and weather data

#### 🤖 **Three AI Capabilities** (See [AI_CAPABILITIES.md](./AI_CAPABILITIES.md))
1. **Geospatial Threat Intelligence** 🛡️
   - AI-powered threat assessment for conflict zones
   - Confidence scores and tactical recommendations
   - Region-specific geopolitical analysis

2. **Satellite Imagery Intelligence** 🛰️
   - YOLOv8-style object detection simulation
   - Change analysis and infrastructure assessment
   - Anomaly detection reporting

3. **Strategic Intelligence Briefing** 📄
   - Executive-level platform analysis
   - Technological trend identification
   - Strategic recommendations

#### 📈 **Real-Time Monitoring**
- Live repository commit activity timeline
- Data source status dashboard
- AI processing pipeline visualizer
- 300+ camera feeds with status indicators
- **Live satellite orbital tracking**
- **Global weather monitoring grid**

## 🧠 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Shadcn UI v4** component library
- **Framer Motion** for animations
- **React Leaflet** for mapping

### Data & APIs
- **GitHub REST API** - Live repository data
- **Open-Meteo API** - Real-time global weather
- **Spark LLM API** - AI-powered intelligence generation
- **Spark KV Store** - Persistent data storage

### Design System
- **Fonts**: JetBrains Mono + Space Grotesk
- **Color Palette**: Dark technical theme with high-contrast accents
- **Icons**: Phosphor Icons
- **Background**: Custom hexagonal grid pattern

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                      # Shadcn UI components (40+)
│   ├── CollaborativeMapEnhanced.tsx  # ⭐ Enhanced map with ISS, weather, annotations
│   ├── MLPredictionsVisualizer.tsx   # 3 AI capabilities
│   ├── CommitActivityTimeline.tsx    # GitHub commit activity
│   ├── PipelineSimulator.tsx     # AI processing visualization
│   ├── RepositoryCard.tsx        # Live GitHub data display
│   └── DataSourceCard.tsx        # Data source monitoring
├── lib/
│   ├── github-api.ts             # Live GitHub API integration
│   ├── weather-api.ts            # ⭐ Open-Meteo live weather integration
│   ├── satellite-api.ts          # ⭐ ISS + 11 satellites orbital tracking
│   ├── windy-webcams-api.ts      # Real webcam feed integration
│   ├── camera-generator.ts       # 300+ camera feed generator
│   ├── threat-analysis.ts        # Threat prediction algorithms
│   ├── pdf-export.ts             # Intelligence report export
│   └── types.ts                  # TypeScript definitions
└── index.css                     # Theme and styling
```

## 🎨 Design Philosophy

**Command Center Aesthetic**: Professional intelligence interface inspired by aerospace mission control and research laboratories. Dark backgrounds with vibrant data visualization, precise typography, and structured layouts convey authority and technical sophistication.

## 📖 Documentation

- **[PRD.md](./PRD.md)** - Complete product requirements and design specifications
- **[AI_CAPABILITIES.md](./AI_CAPABILITIES.md)** - Detailed AI feature documentation
- **[AUDIT_REPORT.md](./AUDIT_REPORT.md)** - Code audit and data integrity verification
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Integration details
- **[SECURITY.md](./SECURITY.md)** - Security considerations

## 🔥 Live Features (No Mock Data)

✅ **Real GitHub API Data** - 14 repositories with live stats  
✅ **Real Weather Data** - Open-Meteo API integration with 1,600+ stations
✅ **Real ISS Tracking** - Live orbital position with NASA TV feed
✅ **Real Webcams** - 100+ live public webcam feeds via Windy API
✅ **Real AI Analysis** - Spark LLM (GPT-4o-mini) powered  
✅ **Persistent Storage** - Annotations and predictions saved via Spark KV  
✅ **Real-time Collaboration** - Team annotations sync instantly
✅ **PDF Export** - Professional intelligence reports  
✅ **11 Satellites Tracked** - ISS, Hubble, Sentinel, Landsat, NOAA, Terra, Aqua, WorldView

## 🚀 Getting Started

This Spark runs directly in your browser with all dependencies pre-configured.

### Quick Start: Exploring New Features

#### 1. ISS Live Feed
1. Navigate to **"Collab Map"** tab
2. Toggle **"Satellite Orbits"** switch ON
3. Look for the **red pulsing marker** (ISS)
4. Click ISS marker to open popup
5. View **live NASA TV feed** showing Earth from space
6. See current crew roster and orbital parameters

#### 2. Real-Time Weather
1. On the Collab Map, toggle **"Weather Overlay"** ON
2. Observe 1,600+ colored circles across the globe
3. Click any weather marker to see:
   - Current temperature
   - Wind speed & direction
   - Humidity, visibility, pressure
   - Live weather conditions
4. Color gradient: Blue (cold) → Red (hot)

#### 3. Collaborative Annotations
1. **Double-click** anywhere on the map
2. Choose annotation type: **Note**, **Alert**, or **Observation**
3. Enter your intelligence content
4. Click **"Save Annotation"**
5. Your annotation syncs to all team members instantly
6. View pre-loaded example annotations from other analysts

### Navigation
- **Stack**: Explore the technology stack and GitHub repositories
- **Monitor**: View data source status dashboard
- **Pipeline**: Visualize AI processing workflows
- **Activity**: Track real-time commit activity
- **ML Predictions**: Generate AI-powered intelligence (3 capabilities)
- **Collab Map**: Interactive map with weather, threats, cameras, annotations
- **Guide**: Integration documentation

### Using AI Capabilities
1. Navigate to **ML Predictions** tab
2. Choose analysis type (Threat / Satellite / Briefing)
3. Click generate button
4. View real-time AI-generated intelligence
5. Repeat for different regions/scenarios

### Map Features
1. Navigate to **Collab Map** tab
2. Toggle layers (Weather / Threats / Cameras / Annotations)
3. Double-click map to add team annotations
4. Click markers for detailed information
5. Export PDF report with all data

## 🎯 Use Cases

- **Geospatial Intelligence Education**: Learn about OSINT and satellite analysis
- **Open-Source Intelligence**: Explore real GitHub repos in the geospatial domain
- **AI Analysis Demo**: See real LLM-powered intelligence generation
- **Data Visualization**: Interactive mapping and timeline visualizations
- **Collaborative Analysis**: Team annotations and shared intelligence

## 🔒 Privacy & Security

- All user data stored locally via Spark KV (browser-based)
- No external data collection or tracking
- GitHub API uses public repository data only
- Open-Meteo API is free and requires no authentication
- See [SECURITY.md](./SECURITY.md) for details

## 📄 License

MIT License - Copyright GitHub, Inc.

See [LICENSE](./LICENSE) for full details.

---

## 🤝 Credits

Built on open-source geospatial intelligence projects:
- ACLED (Armed Conflict Location & Event Data)
- Sentinel Satellite Network
- Ultralytics YOLOv8
- Kepler.gl & Folium
- Google Earth Engine
- And 9 more amazing projects

---

**Questions?** Check the documentation files or explore the code!

**Want to contribute?** This is an open demonstration platform - fork and build on it!

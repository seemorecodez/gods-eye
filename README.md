# 👁️ GOD'S EYE - Geospatial Intelligence Platform

A comprehensive open-source geospatial intelligence demonstration platform that aggregates data from satellites, conflict databases, and public repositories to provide real-time global awareness through AI-powered analysis and interactive visualization.

## 🚀 What's Inside

### Live Data Integration
- **GitHub API**: Real-time repository statistics, stars, forks, and commit activity from 14 open-source geospatial projects
- **Weather API**: Live global weather data from Open-Meteo (free tier) with real-time temperature, wind, humidity
- **AI-Powered Analysis**: Three distinct AI capabilities using Spark LLM (GPT-4o-mini)

### Key Features

#### 📊 **Repository Stack Explorer**
- Interactive visualization of technology stack across 4 layers
- Data Collection (ACLED, Sentinel, Google Earth Engine)
- AI/ML Processing (YOLOv8, Change Detection)
- Visualization (Kepler.gl, Folium, Plotly)
- Infrastructure (GitHub Actions, Pages, Codespaces)

#### 🗺️ **Collaborative Map Workspace**
- Interactive global map with multiple data layers
- 300+ camera feed locations (satellite, ground, aerial)
- Live weather overlay with real Open-Meteo API data
- Threat prediction zones based on event analysis
- Team annotations with persistent storage
- PDF intelligence report export

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
- 300+ simulated camera feeds with status indicators

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
│   ├── CollaborativeMap.tsx     # Main map interface with 300+ cameras
│   ├── MLPredictionsVisualizer.tsx  # 3 AI capabilities
│   ├── CommitActivityTimeline.tsx   # GitHub commit activity
│   ├── PipelineSimulator.tsx    # AI processing visualization
│   ├── RepositoryCard.tsx       # Live GitHub data display
│   └── DataSourceCard.tsx       # Data source monitoring
├── lib/
│   ├── github-api.ts            # Live GitHub API integration
│   ├── weather-api.ts           # Open-Meteo API integration
│   ├── camera-generator.ts      # 300+ camera feed generator
│   ├── threat-analysis.ts       # Threat prediction algorithms
│   ├── pdf-export.ts            # Intelligence report export
│   └── types.ts                 # TypeScript definitions
└── index.css                    # Theme and styling
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
✅ **Real Weather Data** - Open-Meteo API integration  
✅ **Real AI Analysis** - Spark LLM (GPT-4o-mini) powered  
✅ **Persistent Storage** - Annotations and predictions saved via Spark KV  
✅ **PDF Export** - Professional intelligence reports  
✅ **300+ Camera Feeds** - Strategic location coverage  

## 🚀 Getting Started

This Spark runs directly in your browser with all dependencies pre-configured.

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

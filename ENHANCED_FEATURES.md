# Enhanced Intelligence Features

## Overview
God's Eye platform has been enhanced with three major capabilities focused on real-time data integration, collaborative intelligence gathering, and space-based asset tracking.

---

## 🛰️ ISS Live Feed & Enhanced Satellite Tracking

### International Space Station Integration
- **Live Position Tracking**: Real-time orbital position of the ISS calculated using orbital mechanics
- **NASA TV Live Stream**: Embedded live video feed showing Earth views from the ISS
- **Crew Information**: Current astronaut roster with names and agencies
- **Orbital Parameters**: 
  - Altitude: 408 km
  - Velocity: 7.66 km/s
  - Orbital Period: 92.9 minutes
- **Visual Distinction**: ISS marker features distinctive red pulsing icon to stand out from other satellites

### Expanded Satellite Constellation
The platform now tracks **11 orbital assets** including:

#### Earth Observation Satellites:
- **Sentinel-1A** - Radar imaging (693 km altitude)
- **Sentinel-2A** - Multispectral imaging (786 km altitude)
- **Landsat-8** - Land imaging (705 km altitude)
- **Landsat-9** - Land imaging (705 km altitude)
- **Terra** - Environmental monitoring (705 km altitude)
- **Aqua** - Water cycle observation (705 km altitude)
- **NOAA-20** - Weather monitoring (824 km altitude)
- **WorldView-3** - High-resolution imaging (617 km altitude)
- **WorldView-4** - High-resolution imaging (617 km altitude)

#### Space Telescopes:
- **Hubble Space Telescope** - Deep space observation (540 km altitude)

### Features:
- Real-time position updates every 10 seconds
- Click any satellite marker to view orbital parameters
- NORAD ID display for each asset
- Velocity and altitude data
- Next pass time predictions
- Online/offline status indicators

---

## 🌦️ Real-Time Weather Overlay with Live Meteorological Data

### Open-Meteo API Integration
The platform fetches **live weather data** from the Open-Meteo free API, providing actual current conditions globally.

### Weather Data Points:
Each weather marker displays:
- **Temperature** (°C) - Color-coded gradient from blue (cold) to red (hot)
- **Weather Conditions** - Descriptive text (Clear Sky, Partly Cloudy, Rain, etc.)
- **Wind Speed & Direction** - km/h with degree heading
- **Humidity** - Percentage
- **Visibility** - km
- **Atmospheric Pressure** - hPa

### Coverage:
- **Configurable density grid** covering global regions
- Default: 40x40 grid = **1,600 weather stations** worldwide
- Automatic refresh every 5 minutes
- Graceful fallback if API unavailable

### Color Temperature Gradient:
- `< 0°C` - Deep Blue (Arctic)
- `0-10°C` - Light Blue (Cold)
- `10-20°C` - Cyan (Cool)
- `20-30°C` - Yellow (Warm)
- `> 30°C` - Red (Hot)

### Use Cases:
- **Operational Planning**: Correlate weather with deployment decisions
- **Threat Assessment**: Identify how weather affects security situations
- **Intelligence Correlation**: Cross-reference weather patterns with event data
- **PDF Export**: Include weather data in intelligence reports

---

## 💬 Real-Time Collaborative Annotations

### Team Intelligence Sharing
Multiple analysts can collaborate on the same map interface with **instant synchronization** of annotations across all team members.

### Annotation Types:
1. **Note** (Blue) - General observations and information
2. **Alert** (Red) - Urgent threats or critical findings
3. **Observation** (Yellow) - Field reports and monitoring updates

### How It Works:
- **Double-click** anywhere on the map to create an annotation
- Select annotation type (note/alert/observation)
- Enter content describing the intelligence
- Annotations **sync in real-time** via KV store to all users
- Each annotation shows author name and timestamp
- Delete your own annotations with the X button

### Persistence:
- All annotations **persist across sessions** using `useKV`
- Team members can view historical annotations
- Annotations included in PDF intelligence reports
- Filter by type or author (future enhancement)

### Sample Annotations (Pre-loaded):
The platform includes 5 example annotations from different analysts showing:
- Manhattan financial district activity monitoring
- London satellite imagery anomaly alert
- Tokyo weather conditions for imaging
- Sydney camera network status
- Paris high-value area surveillance

### Collaboration Features:
- **Real-time sync**: Updates appear within ~1 second
- **Author attribution**: Every annotation tagged with creator
- **Type color-coding**: Instant visual priority assessment
- **Map layer integration**: Annotations render on top of all other layers
- **Export capability**: Full annotation history in PDF reports

---

## 🗺️ Map Layer Controls

### Toggle Controls:
- **Annotations** - Show/hide team collaboration markers
- **Camera Feeds** - Display 300+ webcams, traffic cameras, and satellite feeds
- **Satellite Orbits** - Track 11 orbital assets including ISS
- **Weather Overlay** - Live meteorological data grid
- **Threat Analysis** - High-risk zone predictions

### Layer Statistics:
Real-time counts displayed for:
- Total events
- Webcam feeds
- Traffic cameras
- Satellites (including ISS)
- High threat zones

---

## 📊 Data Integration

### Live Data Sources:
1. **Open-Meteo API** - Real-time global weather (free tier)
2. **Orbital Mechanics** - Calculated satellite positions
3. **NASA TV** - ISS live stream feed
4. **Windy Webcams API** - 100+ public webcam feeds
5. **GitHub API** - Repository activity data
6. **KV Store** - Persistent collaborative annotations

### Refresh Rates:
- **Weather**: Every 5 minutes (configurable)
- **Satellites**: Position updates every 10 seconds
- **Annotations**: Real-time sync on change
- **Camera feeds**: Status checks every 30 seconds

---

## 📄 PDF Intelligence Reports

### Export Capabilities:
Generate comprehensive reports including:
- All team annotations with timestamps and authors
- ML predictions from satellite imagery analysis
- Threat assessment zones with confidence scores
- Live weather data (optional)
- Metadata: timestamp, document ID, classification

### Report Format:
- Professional styling with organizational branding
- Tabular data for structured information
- Color-coded threat levels
- Historical trend analysis
- Exportable for offline distribution

---

## 🎯 Use Cases

### Intelligence Analysis Teams:
- Collaborate on real-time threat assessment
- Share observations across distributed teams
- Correlate weather with security events
- Track satellite coverage opportunities

### Disaster Response:
- Monitor weather conditions in crisis zones
- Deploy resources based on environmental data
- Track ISS overhead passes for communication
- Share field observations instantly

### Research & Monitoring:
- Track environmental changes via satellite network
- Correlate weather patterns with ground observations
- Access ISS live feed for educational purposes
- Archive intelligence with comprehensive reports

---

## 🔐 Security & Privacy

- **User Attribution**: All annotations tagged with GitHub username
- **Persistent Storage**: Data stored securely in KV store
- **No External Databases**: All data kept within Spark runtime
- **API Rate Limiting**: Graceful handling of API quotas
- **Offline Capability**: Cached data displayed when APIs unavailable

---

## 🚀 Getting Started

1. **Navigate to Collaborative Map**: Click "Collab Map" tab
2. **Enable Satellite Layer**: Toggle "Satellite Orbits" to see ISS and 10 satellites
3. **View ISS Live Feed**: Click the red pulsing ISS marker to open live NASA TV
4. **Enable Weather Overlay**: Toggle "Weather Overlay" for real-time conditions
5. **Add Annotations**: Double-click map to create collaborative markers
6. **Export Report**: Click "Export PDF" to generate intelligence document

---

## 📈 Statistics

- **11 Satellites Tracked** (including ISS, Hubble, Sentinel, Landsat, NOAA)
- **1,600 Weather Stations** (configurable grid density)
- **300+ Camera Feeds** (webcams + traffic + satellite)
- **Real-time Sync** (<1 second annotation propagation)
- **100% Open Source** (No proprietary data sources)
- **Free Tier APIs** (Open-Meteo, NASA, Windy)

---

## 🛠️ Technical Implementation

### Key Technologies:
- **React Leaflet** - Interactive map rendering
- **KV Store (useKV)** - Persistent collaborative state
- **Open-Meteo API** - Live weather data
- **Orbital Mechanics** - Satellite position calculation
- **NASA TV Embed** - ISS live stream integration
- **Framer Motion** - Smooth UI animations

### State Management:
- `useKV("map-annotations")` - Team annotations (real-time sync)
- `useKV("ml-predictions")` - ML analysis results
- `useState` - UI state and temporary data
- Real-time updates propagated via KV store changes

### Performance Optimizations:
- Lazy loading of weather grid
- Debounced filter inputs
- Virtual scrolling for large datasets
- Progressive data loading with progress indicators
- Efficient marker clustering for dense regions

---

## 📝 Future Enhancements

Potential additions to the platform:
- [ ] Voice annotations with audio attachments
- [ ] Drawing tools (circles, polygons, arrows)
- [ ] Historical playback of satellite positions
- [ ] Weather forecast integration (24-hour predictions)
- [ ] ISS crew schedule and mission timeline
- [ ] Annotation threads and replies
- [ ] Real-time notification system for team alerts
- [ ] Advanced filtering (by author, date range, keyword)
- [ ] Integration with additional satellite networks
- [ ] Automated threat detection based on weather + events

---

## 🎓 Training Resources

### Video Tutorials:
- ISS Tracking Tutorial (embedded NASA resources)
- Weather Overlay Usage Guide
- Collaborative Annotation Best Practices
- PDF Report Generation Workflow

### Documentation:
- See `PRD.md` for complete product requirements
- See `INTEGRATION_SUMMARY.md` for API details
- See `README.md` for platform overview

---

## 📞 Support

For issues or feature requests related to:
- **ISS Tracking**: Verify NORAD ID 25544 in satellite list
- **Weather Data**: Check Open-Meteo API status
- **Annotations**: Ensure KV store permissions
- **PDF Export**: Verify browser pop-up settings

---

**Last Updated**: January 2025  
**Version**: 2.0 (Enhanced Intelligence Platform)

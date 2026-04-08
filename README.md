# 👁️ God's Eye

> **Real-time open-source intelligence map - track global events, flights, satellites, and weather in one place**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[🚀 Quick Start](./QUICK_START.md) · [🔌 Build Plugins](./PLUGIN_GUIDE.md) · [🗺️ Roadmap](./ROADMAP.md) · [🤝 Contributing](./CONTRIBUTING.md)

---

**[⭐ Star this repo](../../stargazers) if you find it useful!**

---

## Why God's Eye Exists

OSINT analysts and aviation spotters juggle 5-10 browser tabs every day:
- FlightRadar24 for aircraft
- Windy for weather and webcams  
- ISS trackers for satellites
- News feeds for events
- Separate tools for correlation

**God's Eye gives you one bookmark instead of ten.**

---

## What You Get

### 🛩️ Real Flight Tracking
- Live aircraft positions via OpenSky Network
- Military flight detection
- Speed, altitude, heading for every plane
- Auto-refresh every 30 seconds

### 🌍 Real Weather Data
- 1,600+ weather stations globally
- Live temperature, wind, humidity, visibility
- Open-Meteo API integration
- Color-coded temperature overlay

### 🛰️ Real Satellite Tracking
- ISS with live position updates
- 10+ satellites: Hubble, Sentinel, Landsat, NOAA
- Orbital mechanics calculations
- Pass predictions

### 📹 Real Webcam Feeds
- 100+ live public webcams via Windy API
- Global city coverage
- Direct stream links
- Online status indicators

### 💾 Saved Locations & Alerts *(Coming Soon)*
- Pin your regions of interest
- Get alerts for nearby events
- Custom notification rules
- Persistent across sessions

---

## Quick Start

**This runs entirely in your browser - no installation needed.**

1. **Open the app** (once deployed)
2. **Toggle data layers** you care about (flights, weather, satellites, cameras)
3. **Click markers** to see detailed information
4. **Save locations** for daily monitoring *(coming soon)*

### For Developers

```bash
# Clone the repo
git clone https://github.com/yourusername/gods-eye.git
cd gods-eye

# Install dependencies
npm install

# Run locally
npm run dev
```

Open `http://localhost:5173`

---

## Plugin System

**Make God's Eye better by adding data sources.**

We've designed this to be stupid simple. No complicated architecture - just fetch data and return points.

### Example: Add Earthquake Data

```typescript
// src/plugins/earthquakes.ts
import { DataSourcePlugin } from '@/lib/plugin-types'

export const earthquakesPlugin: DataSourcePlugin = {
  id: 'usgs-earthquakes',
  name: 'USGS Earthquakes',
  icon: 'wave',
  category: 'natural',
  
  async fetch() {
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
    )
    const data = await response.json()
    
    return data.features.map(f => ({
      id: f.id,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      title: f.properties.title,
      magnitude: f.properties.mag,
      time: f.properties.time
    }))
  },
  
  refreshInterval: 300 // seconds
}
```

### Plugin Ideas We'd Love to See

- 🔥 Wildfires (NASA FIRMS)
- 🚢 Ship tracking (AIS data)
- ☀️ Space weather (NOAA)
- ₿ Bitcoin ATMs (CoinATMRadar)
- 🛰️ Starlink satellites (Celestrak)
- 🌊 Ocean buoys (NOAA)
- 🏙️ Air quality (OpenAQ)
- 📡 Radio towers (OpenCellID)

**[Read the Plugin Guide →](./docs/PLUGIN_GUIDE.md)** *(coming soon)*

---

## Real Use Cases

### ✈️ Aviation Spotter
"I track military flights near my city"
- Filter for military callsigns
- Get alerts within 50km
- Check 3x per day

### 🌪️ Storm Chaser
"I need weather + visual confirmation"
- Weather overlay + live webcams
- See real-time conditions
- Screenshot for social media

### 📸 ISS Photographer
"I never want to miss a visible pass"
- ISS orbital tracker
- Alert 10min before overhead
- Perfect timing for photos

### 🔍 OSINT Researcher
"I correlate signals across sources"
- Layer multiple data feeds
- Find patterns manually
- Export for deeper analysis

---

## What This Is NOT

❌ No AI buzzwords without real AI  
❌ No simulated/fake data pretending to be real  
❌ No "enterprise features" you don't need  
❌ No paywalls on core functionality  
❌ No data collection or tracking  

This is a **tool**, not a product. It does one thing well.

---

## Tech Stack

- **React 19** + TypeScript
- **Tailwind CSS 4** + Shadcn UI
- **Leaflet** for mapping
- **Three.js** for 3D globe *(optional view)*
- **100% client-side** - no backend needed

### APIs Used (All Free)
- [OpenSky Network](https://openskynetwork.github.io/opensky-api/) - Flight data
- [Open-Meteo](https://open-meteo.com/) - Weather data
- [Windy Webcams](https://api.windy.com/webcams) - Live cameras
- [Celestrak](https://celestrak.org/) - Satellite orbital data

---

## Contributing

**We need your help making this genuinely useful.**

### Good First Issues
Look for issues tagged [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) - these are beginner-friendly tasks with clear instructions.

### How to Contribute
1. **Fork the repo** and create a branch
2. **Make your changes** (add a plugin, fix a bug, improve docs)
3. **Test it works** locally
4. **Open a pull request** with clear description
5. **Respond to feedback** if any

We respond to issues within 24 hours. We merge good PRs fast.

### What We're Looking For
- New data source plugins
- Mobile UI improvements  
- Performance optimizations
- Documentation improvements
- Bug fixes
- Accessibility enhancements

**Not looking for:**
- Complex architecture rewrites
- Enterprise features
- Anything that requires a backend

---

## Roadmap

### ✅ Now (v1.0)
- Real-time flights, weather, satellites, webcams
- Single unified map interface
- Basic layer toggles
- Mobile responsive

### 🚧 Next (v1.1)
- Saved locations persistence
- Alert system for nearby events
- Plugin system foundation
- 5+ community data source plugins

### 🔮 Future (v2.0)
- Historical playback (24hr)
- Share link with current view
- GeoJSON export
- Offline mode

[View full roadmap →](../../issues)

---

## Support the Project

**God's Eye is and always will be free.**

If you find it useful:
- ⭐ **Star the repo** (helps others find it)
- 🐛 **Report bugs** you encounter
- 💡 **Suggest features** that would help you
- 🔌 **Build a plugin** for data you care about
- 💰 **Sponsor development** [via GitHub Sponsors](../../sponsors) *(optional)*

All development happens in public. All funding is transparent.

---

## License

MIT License - Copyright GitHub, Inc.

Free to use, modify, and distribute. See [LICENSE](./LICENSE) for details.

---

## Questions?

- 💬 [Open a discussion](../../discussions)
- 🐛 [Report a bug](../../issues/new)
- 📧 Email: [your email]
- 🐦 Twitter: [@yourhandle]

---

Built with 🌍 by the open-source community

# Quick Start Guide

**Get value from God's Eye in 60 seconds.**

---

## First Time Using

### 1. Open the Map (Default View)
When you open God's Eye, you'll see a global map. This is your main workspace.

### 2. Toggle Data Layers (Top Right)
Click the switches to enable data you care about:
- **Flights** - See live aircraft positions globally
- **Weather** - View current conditions at 1,600+ stations
- **Satellites** - Track ISS and 10+ other satellites
- **Cameras** - Access 100+ live public webcams

### 3. Interact with Markers
- **Click any marker** to see details
- **Flights show:** callsign, altitude, speed, heading
- **Weather shows:** temp, wind, humidity, conditions
- **Satellites show:** name, altitude, velocity
- **Cameras show:** live stream link

### 4. Navigate the Map
- **Drag** to pan around
- **Scroll** to zoom in/out
- **Double-click** to zoom to location
- **Use controls** (top-left) for precise zoom

---

## Common Scenarios

### Track Flights Near You
1. Enable "Flights" layer
2. Zoom to your city
3. Click planes to see details
4. Look for military callsigns (often ALL CAPS)

### Monitor Weather Conditions
1. Enable "Weather" layer
2. Color-coded circles show temperature (blue=cold, red=hot)
3. Click stations for full conditions
4. Useful for storm tracking or planning

### Watch ISS Pass Overhead
1. Enable "Satellites" layer
2. Find the red pulsing marker (ISS)
3. Click for current position
4. Check altitude (usually ~408km) and speed (7.66 km/s)

### View Live Webcams
1. Enable "Cameras" layer
2. Click camera icons (by type: webcam, satellite, etc.)
3. Click "View Stream" to open live feed
4. Check online status (green=live, gray=offline)

---

## Tips for Power Users

### Keyboard Shortcuts
- `F` - Toggle flights layer
- `W` - Toggle weather layer
- `S` - Toggle satellites layer
- `C` - Toggle cameras layer
- `ESC` - Close open popups
- `+/-` - Zoom in/out

### URL Parameters
Share your current view:
```
?lat=51.5074&lng=-0.1278&zoom=10&layers=flights,weather
```

### Filter by Type
Some layers have filters (bottom-left when active):
- Flights: All / Commercial / Military
- Cameras: All / Webcam / Satellite / Ground
- Satellites: All / Earth Observation / Scientific

---

## What to Expect

### Data Refresh Rates
- **Flights:** Every 30 seconds
- **Weather:** Every 5 minutes
- **Satellites:** Every 10 seconds (orbital calculations)
- **Cameras:** On-demand (when clicked)

### Known Limitations
- OpenSky Network limits: 400 requests/day (shared across all users)
- Weather stations: Not evenly distributed (dense in developed areas)
- Webcams: Some may be offline temporarily
- Mobile: Best on tablet or landscape phone

---

## Troubleshooting

### No Flights Showing
- **Cause:** OpenSky API rate limit hit
- **Fix:** Wait 10 minutes and refresh, or toggle "Simulated Data" mode

### Weather Not Loading
- **Cause:** Network issue or API temporarily down
- **Fix:** Check browser console for errors, try refreshing

### Map Tiles Not Loading
- **Cause:** Poor internet connection
- **Fix:** Wait a moment, tiles load progressively

### Webcam Says Offline
- **Cause:** Camera actually offline or moved
- **Fix:** Try another camera, we can't control availability

---

## Next Steps

### Save Locations *(Coming Soon)*
Pin places you monitor regularly:
1. Navigate to location
2. Click "Save Location" button
3. Name it (e.g., "Home Airport")
4. Access from sidebar later

### Set Up Alerts *(Coming Soon)*
Get notified about nearby events:
1. Go to Settings
2. Create alert rule (e.g., "Military flights within 50km of home")
3. Choose notification method
4. Receive alerts when conditions match

### Add Your Own Data Sources
If you're a developer:
1. Read [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)
2. Create a plugin for your data source
3. Submit a PR to share with community

---

## Get Help

- **Bug?** [Report it](../../issues/new?template=bug_report.md)
- **Question?** [Ask in discussions](../../discussions)
- **Feature idea?** [Suggest it](../../issues/new?template=feature_request.md)

We respond within 24 hours.

---

**Now go track something interesting! 🚀**

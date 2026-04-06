# God's Eye - Data Sources Documentation

## Overview
This document explains which data sources are using real live data vs simulated/AI-generated data in the Unified Intelligence Globe.

## ✅ Real Live Data Sources

### 1. Flight Tracking
- **Source**: OpenSky Network API (`https://opensky-network.org/api`)
- **What it provides**: Live aircraft positions worldwide
- **Data includes**: 
  - Callsign, ICAO24 identifier
  - Real-time latitude/longitude/altitude
  - Speed, heading, vertical rate
  - Origin airport (when available)
  - Military vs civilian classification
- **Update frequency**: Fetches up to 500 live flights on load/refresh
- **API Limits**: Free tier, no authentication required
- **File**: `/src/lib/airline-traffic.ts` - `fetchRealFlights()`

### 2. Camera Feeds
- **Source**: Windy Webcams API (`https://api.windy.com/webcams/api`)
- **What it provides**: Public webcam feeds worldwide
- **Data includes**:
  - Webcam name and location
  - Live stream URLs
  - Provider information
  - Online/offline status
  - Geographic coordinates
- **Update frequency**: Fetches up to 300 cameras on load/refresh
- **File**: `/src/lib/windy-webcams-api.ts` - `fetchWindyWebcams()`

### 3. Weather Data
- **Source**: Open-Meteo API (`https://api.open-meteo.com`)
- **What it provides**: Real-time weather conditions globally
- **Data includes**:
  - Temperature (°C)
  - Humidity (%)
  - Wind speed and direction
  - Atmospheric pressure
  - Visibility
  - Weather conditions (clear, cloudy, rain, snow, etc.)
- **Update frequency**: Generates grid of weather stations when weather layer enabled
- **API Limits**: Free tier, no authentication required
- **File**: `/src/lib/weather-api.ts` - `fetchLiveWeatherData()` and `generateWeatherGrid()`

## 🤖 Simulated/AI-Generated Data

### 4. Satellite Positions
- **Current Implementation**: Mathematical orbital calculations
- **What it provides**: Simulated satellite positions based on orbital mechanics
- **Data includes**:
  - Sentinel-1A, Landsat-8, Terra, NOAA-20, WorldView-3
  - Calculated latitude/longitude based on orbital parameters
  - Orbital altitude (km)
  - Velocity estimates
  - Next pass predictions
- **Why simulated**: Real-time satellite tracking requires TLE (Two-Line Element) data from Space-Track.org which requires authentication
- **File**: `/src/lib/satellite-api.ts` - `fetchSatellitePasses()`
- **Potential upgrade**: Could integrate with Space-Track.org API with user credentials

### 5. Threat Predictions
- **Current Implementation**: AI-powered analysis using Spark LLM
- **What it provides**: Machine learning-based threat assessments
- **Data includes**:
  - Threat level (low, moderate, high, critical)
  - Confidence scores
  - Contributing factors
  - Geographic risk zones
- **Why AI-generated**: This is analytical data derived from pattern recognition, not raw sensor data
- **File**: `/src/lib/threat-analysis.ts` - `generateThreatPredictions()`
- **Note**: This is intentionally AI-generated as it's predictive analysis, not raw data

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED GLOBE MAP                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── 🌐 OpenSky Network (LIVE)
                              │    └─ Flight positions
                              │
                              ├─── 🌐 Windy Webcams (LIVE)
                              │    └─ Camera feeds
                              │
                              ├─── 🌐 Open-Meteo (LIVE)
                              │    └─ Weather data
                              │
                              ├─── 📊 Calculated (SIMULATED)
                              │    └─ Satellite orbits
                              │
                              └─── 🤖 AI/ML (GENERATED)
                                   └─ Threat predictions
```

## How to Verify Data is Live

1. **Flight Data**: 
   - Click on any flight marker on the globe
   - Verify the callsign matches real-world flights
   - Check FlightRadar24.com for confirmation
   - Live data badge shows "🔴 LIVE DATA" in top-left corner

2. **Camera Feeds**:
   - Click on any camera marker
   - Click "Open Live Stream" button to view actual webcam
   - Status shows "online" for active feeds

3. **Weather Data**:
   - Enable weather layer
   - Compare temperature/conditions with weather.com
   - Data updates from Open-Meteo API in real-time

## Previously Used Simulated Data (Now Fixed)

- ❌ **Flight data was simulated by default** → ✅ Now uses OpenSky Network by default
- ❌ **Confusing "Real Data" toggle** → ✅ Removed - always uses real data now
- ❌ **No clear indication of data sources** → ✅ Clear "LIVE DATA" badge and documentation

## Future Enhancement Opportunities

1. **Satellite Tracking**: Integrate Space-Track.org API (requires free account)
2. **Traffic Cameras**: Add city-specific traffic camera feeds
3. **Marine Tracking**: Add AIS ship tracking data
4. **Conflict Events**: Integrate ACLED real-time conflict database
5. **Earthquake Data**: Add USGS real-time seismic activity
6. **Fire Tracking**: NASA FIRMS satellite fire detection

## API Rate Limits & Considerations

- **OpenSky Network**: Free tier, reasonable limits for testing
- **Windy Webcams**: Free API with generous limits
- **Open-Meteo**: Free weather API, no authentication needed
- All APIs are free-tier and don't require authentication keys
- Rate limiting is handled gracefully with fallback messages

## Technical Notes

- The globe initially had a toggle between "real" and "simulated" flight data
- This was confusing because most data (cameras, weather) was already real
- We've removed the toggle and now **always use live data** for all available sources
- Only satellite positions remain simulated due to API authentication requirements
- Threat predictions are AI-generated by design (they're analytical, not raw data)

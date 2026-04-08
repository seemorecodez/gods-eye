# Roadmap

**God's Eye development priorities and timeline.**

Community votes on features via [GitHub Discussions](../../discussions/categories/roadmap).

---

## Current Version: v0.9 (Alpha)

**Status:** Feature-complete prototype, preparing for v1.0 launch

---

## v1.0 - Core Launch (Target: 2 weeks)

### Goals
- One killer map interface
- Real data only (zero simulated)
- Plugin system foundation
- Community-ready

### Tasks
- [x] Create open-source strategy
- [x] Write comprehensive docs (README, QUICK_START, PLUGIN_GUIDE, CONTRIBUTING)
- [x] Build plugin system architecture
- [x] Add first community plugin (earthquakes)
- [ ] Consolidate to single map view (remove duplicate maps)
- [ ] Remove all simulated data references
- [ ] Add 2 more plugins (wildfires, lightning)
- [ ] Implement saved locations (useKV)
- [ ] Add basic alert system
- [ ] Mobile-responsive controls
- [ ] Performance: <2s load time
- [ ] Tag 10 "good first issues"

### Success Metrics
- All real data sources working
- Plugin system functional
- Documentation complete
- Ready for community launch

---

## v1.1 - User Retention (Target: 4 weeks)

### Goals
- Make it sticky (daily use)
- First community contributors
- Mobile excellence

### Features
- [ ] **Saved Locations** - Pin up to 5 places (free)
- [ ] **Basic Alerts** - 3 alert rules (free)
  - "ISS passing overhead"
  - "Military flights within X km"
  - "Earthquake above magnitude Y"
- [ ] **Historical Playback** - Last 24 hours (free)
- [ ] **Share Links** - URL with current view/layers
- [ ] **Keyboard Shortcuts** - Power user efficiency
- [ ] **Dark/Light Mode** - Accessibility

### Community
- [ ] 5+ community-contributed plugins
- [ ] First PR merged from external contributor
- [ ] Plugin showcase page
- [ ] Weekly "featured plugin" highlights

### Success Metrics
- 100+ GitHub stars
- 10+ active contributors
- 1,000+ weekly active users
- Average session >5 minutes

---

## v1.2 - Data Richness (Target: 8 weeks)

### Goals
- Become the go-to OSINT map
- 20+ data sources
- Advanced filtering

### Features
- [ ] **Advanced Filters**
  - Filter by time range
  - Filter by data source
  - Filter by region/radius
  - Combined filters (AND/OR logic)
- [ ] **Data Export**
  - GeoJSON export
  - CSV export
  - Screenshot with attribution
- [ ] **Custom Map Tiles**
  - OpenStreetMap (default)
  - Satellite imagery
  - Terrain
  - Dark mode tiles
- [ ] **Marker Clustering**
  - Auto-cluster on zoom out
  - Show count badges
  - Expand on click
- [ ] **Time Slider**
  - Scrub through historical data
  - Animate changes over time
  - Compare before/after

### Plugins (Target: 15+)
- [ ] Wildfires (NASA FIRMS)
- [ ] Lightning strikes (Blitzortung)
- [ ] Ships (AIS data)
- [ ] Trains (various APIs)
- [ ] Ocean buoys (NOAA)
- [ ] Air quality (OpenAQ)
- [ ] Space weather (NOAA)
- [ ] Bitcoin ATMs (CoinATMRadar)
- [ ] Starlink satellites (Celestrak)
- [ ] Radio towers (OpenCellID)
- [ ] + Community contributions

### Success Metrics
- 500+ GitHub stars
- 25+ contributors
- 5,000+ weekly active users
- Featured on Hacker News

---

## v2.0 - Sustainability (Target: 6 months)

### Goals
- Self-sustaining project
- Institutional recognition
- Optional pro tier

### Features
- [ ] **Pro Features** (Optional paid)
  - Unlimited saved locations (free: 5)
  - Unlimited alerts (free: 3)
  - Historical playback unlimited (free: 24hr)
  - API access for automation
  - Priority plugin requests
- [ ] **Offline Mode**
  - Service worker caching
  - Work without internet
  - Sync when back online
- [ ] **Collaboration** (If demand exists)
  - Real-time cursor sharing
  - Team workspaces
  - Shared saved locations
  - Annotation system
- [ ] **Advanced Visualization**
  - Heatmaps
  - Connection lines
  - 3D globe view (optional)
  - Temporal animations

### Community
- [ ] Plugin marketplace
- [ ] Plugin ratings/reviews
- [ ] Plugin categories/collections
- [ ] Top contributors page
- [ ] Monthly community calls

### Sustainability
- [ ] GitHub Sponsors active
- [ ] OpenCollective setup
- [ ] Applied for 3+ grants
  - Mozilla Open Source Support
  - Sovereign Tech Fund
  - Protocol Labs
- [ ] First institutional user
- [ ] Cited in research paper

### Success Metrics
- 1,000+ GitHub stars
- 50+ contributors
- 10,000+ weekly active users
- $500+/month sustainable funding
- Used in journalism/research

---

## Future Ideas (No Timeline)

**These might happen if there's strong community demand:**

- Mobile apps (iOS/Android)
- Desktop app (Electron)
- Browser extension
- API for developers
- Embeddable widget
- White-label version
- Enterprise support
- Training/workshops

**We're NOT building:**
- Social features (likes, comments, follows)
- User-generated content moderation
- Real-time chat
- Video conferencing
- Document collaboration
- Project management tools
- CRM features
- E-commerce
- Anything that requires heavy backend infrastructure

---

## How to Influence the Roadmap

### Vote on Features
1. Go to [Discussions > Roadmap](../../discussions/categories/roadmap)
2. Upvote features you want
3. Comment with your use case

### Suggest New Features
1. [Open a discussion](../../discussions/new?category=ideas)
2. Explain the problem and solution
3. Community votes with 👍
4. High-voted items added to roadmap

### Build It Yourself
1. Most features can be plugins
2. Read [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)
3. Submit a PR
4. Get it merged

---

## Release Schedule

### Major versions (X.0)
- Every 3-6 months
- Breaking changes allowed
- Big new features

### Minor versions (1.X)
- Monthly
- New features
- No breaking changes

### Patches (1.1.X)
- As needed
- Bug fixes
- Performance improvements

---

## Current Focus

**Right now we're laser-focused on v1.0 launch:**

1. Strip out all simulated data
2. Consolidate to one map
3. Polish plugin system
4. Complete documentation
5. Tag good first issues
6. Launch to communities

Everything else can wait.

---

## Questions?

- 💬 [Discuss roadmap](../../discussions/categories/roadmap)
- 🗳️ [Vote on features](../../discussions)
- 💡 [Suggest ideas](../../discussions/new?category=ideas)

---

**Updated:** 2024-01-15  
**Next review:** After v1.0 launch

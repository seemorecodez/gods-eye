# Planning Guide

A comprehensive geospatial intelligence platform that aggregates open-source data from satellites, conflict databases, and public repositories to provide real-time global awareness through AI-powered analysis and interactive visualization.

**Experience Qualities**:
1. **Commanding** - Users should feel they have unprecedented access to global intelligence through a powerful, data-dense interface that doesn't shy away from complexity
2. **Precise** - Every interaction and data point must convey technical accuracy and professional-grade reliability, inspiring confidence in critical decision-making
3. **Expansive** - The interface should feel like peering into a vast interconnected system, with layers of data revealing themselves progressively without overwhelming

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This platform integrates multiple data sources, AI processing layers, real-time visualization, and requires sophisticated state management across different analysis modes, making it a complex multi-view application.

## Essential Features

### Repository Stack Explorer
- **Functionality**: Interactive visualization of the technology stack showing all GitHub repositories organized by layer (Data Collection, AI/ML Processing, Visualization, Infrastructure)
- **Purpose**: Provides users with a comprehensive understanding of the system architecture and direct access to source repositories
- **Trigger**: Default landing view on application load
- **Progression**: User views categorized stack → Clicks on repository card → Expanded details with description, stars, language → External link to GitHub opens in new tab
- **Success criteria**: All repositories are accurately categorized, clickable, and display key metadata (stars, language, last updated)

### Data Source Monitor
- **Functionality**: Real-time status dashboard showing simulated connectivity and data freshness for each data collection source (ACLED, Sentinel, Google Earth Engine, etc.)
- **Purpose**: Gives users confidence in data reliability and helps identify potential gaps in coverage
- **Trigger**: Accessible via main navigation tab
- **Progression**: User navigates to monitor → Views status grid with color-coded health indicators → Clicks on source for detailed metrics → Sees last sync time, record count, coverage area
- **Success criteria**: Status indicators update in real-time, color coding is intuitive (green/yellow/red), detailed metrics are accurate

### AI Analysis Pipeline Visualizer
- **Functionality**: Visual flowchart showing how data moves through the AI/ML processing layer, from raw satellite imagery through multiple AI models (YOLOv8, Change Detection, Conflict Prediction, Sentiment Analysis, Infrastructure Analysis) to analyzed outputs
- **Purpose**: Demystifies the expanded AI processing workflow with 8+ distinct ML models and helps users understand confidence levels and processing stages across different analysis types
- **Trigger**: Accessed via "Pipeline" navigation tab
- **Progression**: User views processing flow diagram → Sees active processing jobs across multiple AI models → Clicks on stage for technical details → Views model architecture, processing time, accuracy metrics for each specialized model
- **Success criteria**: Flow diagram shows 8+ AI models clearly and animated, processing stages include object detection, change analysis, conflict prediction, sentiment analysis, infrastructure monitoring, users can trace data lineage through multiple model types

### Interactive Geospatial Map
- **Functionality**: Global map interface with layered data visualization showing conflict events, satellite coverage areas, detected changes, real-time weather overlay, threat predictions, and 300+ camera feeds
- **Purpose**: Core intelligence interface where users can visually analyze spatial patterns, environmental conditions, threat levels, and live surveillance data
- **Trigger**: Accessible via "Collab Map" navigation tab (primary intelligence interface)
- **Progression**: User opens map → Toggles data layers (events/weather/threats/cameras) → Zooms to region of interest → Clicks markers for detailed information → Double-clicks to add team annotations → Exports comprehensive PDF reports
- **Success criteria**: Map loads 300+ camera feeds efficiently, weather overlay updates in real-time, threat zones display with confidence scores, PDF export includes all annotations and ML predictions

### Repository Integration Guide
- **Functionality**: Step-by-step documentation showing how each GitHub repository in the stack contributes to the overall system
- **Purpose**: Educational tool for users wanting to replicate or extend the platform
- **Trigger**: Accessible via "Guide" section or info icons throughout the interface
- **Progression**: User selects a repository → Reads integration overview → Views code snippets → Sees example outputs → Links to full documentation
- **Success criteria**: Integration steps are clear, code examples are syntax-highlighted, examples are realistic

### Weather Overlay System
- **Functionality**: Live global weather data from Open-Meteo API displaying real-time temperature, wind, humidity, visibility, and atmospheric conditions across geographic regions
- **Purpose**: Environmental intelligence layer for operational planning and threat assessment correlation using actual meteorological data
- **Trigger**: Toggled via "Weather Overlay" switch on collaborative map
- **Progression**: User enables weather layer → Grid of colored circles appears showing real temperature zones from Open-Meteo → Clicks weather marker for live conditions → Correlates actual weather data with threat assessments → Sees real-time updates
- **Success criteria**: Weather grid fetches live data from Open-Meteo API, covers global regions at configurable resolution, displays actual current conditions, color coding indicates real temperature zones, data refreshes automatically

### Threat Level Prediction System
- **Functionality**: AI-powered threat analysis using historical event patterns to predict high-risk zones with confidence scores and contributing factors
- **Purpose**: Proactive threat identification based on data-driven analysis of past incidents and current patterns
- **Trigger**: Toggled via "Threat Analysis" switch on collaborative map
- **Progression**: User enables threat layer → High/critical threat zones appear as color-coded rectangles → Clicks zone for threat level details → Reviews historical data trends → Views contributing risk factors → Exports threat assessment to PDF report
- **Success criteria**: Threat predictions analyze historical events within 10-unit radius, confidence scores calculated from event density, factors list explains reasoning, historical trend data shows 90-day patterns

### Live Webcam Feed Network
- **Functionality**: Comprehensive global surveillance network integrating real public webcam feeds from Windy Webcams API, plus simulated satellite and border cameras, across major cities and strategic locations
- **Purpose**: Live visual intelligence layer providing real-time monitoring capabilities from actual public webcams at tourist sites, city centers, and high-activity zones combined with simulated strategic feeds
- **Trigger**: Toggled via "Camera Feeds" switch, individual feeds clickable on map
- **Progression**: User enables camera layer → Real webcam icons appear from Windy API globally → Filters by camera type (webcam/satellite/ground/aerial) → Clicks camera for live feed preview → Views actual webcam streams with titles, locations, player links → Monitors online status indicators → Opens live player in new tab
- **Success criteria**: Fetches 100+ real webcam feeds from Windy API, augmented with simulated cameras for strategic coverage, displays actual webcam titles and locations, provides direct links to live streams, shows preview images where available, cameras distributed realistically with global coverage

### PDF Intelligence Report Export
- **Functionality**: Comprehensive report generation combining team annotations, ML predictions, threat assessments, and optional weather data into formatted PDF document
- **Purpose**: Enable professional intelligence briefings and documentation for offline analysis and distribution
- **Trigger**: "Export PDF" button on collaborative map interface
- **Progression**: User clicks Export PDF → Selects report contents (annotations/predictions/threats/weather) → Reviews summary → Confirms generation → Browser print dialog opens with formatted report → User saves or prints PDF
- **Success criteria**: PDF includes all selected data types, formatted with professional styling, includes metadata (timestamp, document ID, classification), threat levels clearly visualized, historical trend tables included, report opens in new window for printing

### Emergent Pattern Detection
- **Functionality**: Multi-domain intelligence fusion system that discovers non-obvious correlations across imagery, signals, cyber, economic, environmental, and social data sources, using continuous learning ML models to predict conflict events
- **Purpose**: Uncover hidden causal chains and complex correlations that human analysts might miss by analyzing patterns across 6 disparate intelligence domains simultaneously
- **Trigger**: Accessible via "Emergent Patterns" navigation tab
- **Progression**: User opens emergent patterns view → Sees multi-domain data fusion overview → Clicks "Detect Emergent Pattern" → AI analyzes 3-5 domains simultaneously → System generates correlation chain with probability score → User reviews fusion logic showing step-by-step how domains connect → Reads actionable intelligence recommendation → Retrains model with "Retrain Model" button to improve accuracy → Filters patterns by region and confidence threshold
- **Success criteria**: Each pattern shows specific correlations (e.g., "Port congestion + fertilizer shortage + ethnic polarization = 78% probability of violence within 60 days"), fusion chain explains domain interconnections, model retraining improves accuracy scores, all patterns persist across sessions with useKV, confidence and probability scores displayed prominently, patterns include realistic data from Sentinel-2, Landsat, ISS, ADS-B Exchange, AIS, Censored Planet, IODA, UN Comtrade, CHIRPS, MODIS, GDELT, and ACLED sources

### Real-Time Data Refresh System
- **Functionality**: Configurable automatic refresh intervals for all data sources including repositories, data source status, commit activity, ML predictions, camera feeds, weather data, threat alerts, emergent patterns, and API metrics with granular control over each source
- **Purpose**: Ensure platform displays most current intelligence data without manual intervention while allowing fine-tuned control over refresh frequency and system load
- **Trigger**: Automatic refresh on configured intervals, manual refresh via buttons, configuration accessible via "Refresh" settings tab
- **Progression**: System auto-refreshes data at configured intervals → User navigates to Refresh Settings → Adjusts individual refresh intervals using sliders (15s to 10m) → Toggles data sources on/off → Views last refresh timestamps → Pauses/resumes all refreshes → Resets to defaults → Changes persist across sessions
- **Success criteria**: Each data type refreshes independently at configured intervals, refresh settings persist using useKV, visual indicators show last refresh time and active status, pause/resume affects all sources, admin users can configure intervals, non-admin users see current settings but cannot modify

### Advanced Data Visualization Dashboard
- **Functionality**: Comprehensive analytics dashboard with interactive charts including time series trends, category distributions, language popularity, repository activity radar, size/popularity correlations using area charts, bar charts, pie charts, line charts, radar charts, and scatter plots
- **Purpose**: Provide deep analytical insights into repository metrics, commit patterns, and ecosystem trends through rich visualizations that reveal patterns not visible in raw data
- **Trigger**: Accessible via "Data Viz" navigation tab, auto-refreshes based on repository refresh interval
- **Progression**: User navigates to Data Viz → Selects visualization type (Trends/Distributions/Comparisons) → Views interactive charts → Hovers for detailed tooltips → Manually refreshes data → Exports chart data → Analyzes trends over time → Compares metrics across categories
- **Success criteria**: All charts render with live GitHub API data, tooltips show precise values, charts update when data refreshes, responsive design works on all screen sizes, color coding matches platform theme, data points are interactive and labeled clearly

### User Roles & Permissions System
- **Functionality**: Role-based access control (RBAC) with four role tiers (Viewer, Operator, Analyst, Admin) each with specific permission sets controlling access to views, data operations, ML model execution, exports, threat management, camera management, user administration, and settings configuration
- **Purpose**: Secure platform access by ensuring users can only perform actions appropriate to their role level, preventing unauthorized modifications while enabling collaboration
- **Trigger**: Role assignment on user authentication, role management accessible via "Roles" tab for admin users
- **Progression**: User authenticates → System assigns role based on isOwner status or stored preference → Role determines visible tabs and available actions → Admin navigates to Roles tab → Selects user role from dropdown → Views detailed permission breakdown → Understands permission categories (data/ai/map/export/admin) → Role change persists across sessions
- **Success criteria**: Four distinct roles with hierarchical permissions (Viewer < Operator < Analyst < Admin), permission checks enforced on all protected actions, tabs hidden based on role permissions, role badge displayed in header, role changes persist with useKV, admin can view all permissions by category, permission descriptions clearly explain access levels, isOwner users default to admin role

## Edge Case Handling

- **No Active Data Sources**: Display prominent empty state with instructions to configure API keys and data connections, show example data mode toggle
- **Repository API Rate Limits**: Gracefully cache GitHub metadata and display last known state with timestamp, show rate limit reset countdown
- **Map Rendering Failures**: Fall back to simplified map view, display error boundaries with actionable recovery options
- **Slow Network Conditions**: Implement progressive loading with skeleton states, prioritize critical data layers, allow offline browsing of cached data
- **Unsupported Browsers**: Detect WebGL/Canvas capabilities and show compatibility warning with recommended browsers
- **Large Dataset Filtering**: Use debounced inputs, virtual scrolling for lists, and show loading indicators for operations >500ms
- **Missing Geospatial Data**: Display data quality indicators, show coverage gaps on map, provide alternative data source suggestions

## Design Direction

The design should evoke the feeling of a professional intelligence command center - sophisticated, data-dense, and purposeful. Think aerospace mission control meets cutting-edge research laboratory. The interface should feel like a powerful tool for serious analysis rather than a consumer app, with a technical aesthetic that embraces complexity while maintaining clarity. Dark backgrounds provide contrast for vibrant data visualization, while precise typography and structured layouts convey authority and precision.

## Color Selection

Dark, technical palette with high-contrast data visualization accents inspired by satellite imagery processing and military-grade systems.

- **Primary Color**: Deep Space Blue `oklch(0.25 0.05 250)` - Communicates technical sophistication and depth, reminiscent of night sky and satellite operations
- **Secondary Colors**: 
  - Satellite Silver `oklch(0.45 0.02 240)` - Metallic accent for secondary UI elements and borders
  - Data Charcoal `oklch(0.18 0.01 250)` - Card backgrounds and elevated surfaces
- **Accent Color**: Laser Cyan `oklch(0.75 0.15 200)` - High-energy highlight for active states, CTAs, and critical alerts
- **Foreground/Background Pairings**:
  - Primary (Deep Space Blue `oklch(0.25 0.05 250)`): White text `oklch(0.98 0 0)` - Ratio 8.2:1 ✓
  - Background (Near Black `oklch(0.12 0.01 250)`): Light Gray text `oklch(0.85 0.01 240)` - Ratio 12.5:1 ✓
  - Accent (Laser Cyan `oklch(0.75 0.15 200)`): Dark text `oklch(0.15 0.01 250)` - Ratio 11.8:1 ✓
  - Card (Data Charcoal `oklch(0.18 0.01 250)`): White text `oklch(0.98 0 0)` - Ratio 9.5:1 ✓

Additional data visualization colors:
- Active Source Green: `oklch(0.70 0.20 145)` - Healthy/connected status
- Warning Amber: `oklch(0.75 0.18 80)` - Degraded/warning states  
- Critical Red: `oklch(0.60 0.22 25)` - Offline/error states
- Processing Purple: `oklch(0.65 0.18 290)` - AI pipeline active states

## Font Selection

The typeface should convey technical precision and modern computing aesthetics while remaining highly readable at small sizes for data-dense interfaces.

- **Primary Font**: JetBrains Mono - Monospaced font that reinforces the technical, code-adjacent nature of the platform while providing excellent readability for mixed alphanumeric data
- **Secondary Font**: Space Grotesk - Geometric sans-serif for headings and UI labels that complements the technical aesthetic with a contemporary edge

**Typographic Hierarchy**:
- H1 (Section Titles): Space Grotesk Bold/32px/tight letter-spacing (-0.02em)/line-height 1.2
- H2 (Subsection Headers): Space Grotesk SemiBold/24px/normal letter-spacing/line-height 1.3
- H3 (Card Headers): Space Grotesk Medium/18px/normal letter-spacing/line-height 1.4
- Body (Primary Text): JetBrains Mono Regular/14px/normal letter-spacing/line-height 1.6
- Caption (Metadata/Labels): JetBrains Mono Regular/12px/wide letter-spacing (0.02em)/line-height 1.5
- Code/Data Values: JetBrains Mono Medium/13px/normal letter-spacing/line-height 1.5

## Animations

Animations should feel technical and precise, like data systems coming online and processing information. Use subtle fade-ins and slide transitions for panel changes, smooth zoom and pan for map interactions, and pulsing indicators for real-time data updates. Avoid bouncy or playful easing - favor linear or slight ease-out curves that feel mechanical and deliberate. Data visualizations should animate with purpose, such as connection lines drawing from point to point or status indicators smoothly transitioning through states. Keep durations fast (150-250ms) to maintain the feeling of a responsive, high-performance system.

## Component Selection

**Components**:
- **Tabs**: For main navigation between Stack Explorer, Data Monitor, Pipeline, Map, and Guide views
- **Card**: Repository cards, data source status cards, metric displays - with subtle border and elevated shadow
- **Badge**: For repository languages, status indicators (online/offline/degraded), data tags
- **Separator**: To create clear boundaries between data sections and layer controls
- **Accordion**: For expandable repository details and configuration sections
- **Dialog**: For detailed repository information, data export options, and settings
- **Hover Card**: Quick preview of repository stats when hovering over cards in stack view
- **Scroll Area**: For long lists of repositories, events, and log entries
- **Switch**: Toggle data layers on/off in map view, enable/disable processing stages
- **Select**: Filter dropdowns for event types, date ranges, and data sources
- **Tooltip**: Contextual help for technical terminology and UI controls
- **Progress**: Show data loading states, processing pipeline completion
- **Slider**: Date range selection, opacity control for map layers

**Customizations**:
- Custom hexagonal grid pattern background using `repeating-linear-gradient` to reinforce technical/satellite aesthetic
- Custom map component integration area (placeholder for future Leaflet/Mapbox integration)
- Custom network graph visualization for repository dependencies using D3
- Custom status indicator component with animated pulse effect for real-time data
- Custom timeline component for data processing pipeline stages

**States**:
- Buttons: Default has subtle border and bg-primary, hover adds glow effect with shadow, active state scales down slightly (0.98), disabled reduces opacity to 0.5
- Inputs: Default has border-input, focus adds ring in accent color with slight glow, error state adds border-destructive with shake animation
- Cards: Default has subtle elevation, hover lifts with increased shadow and slight scale (1.01), selected state adds accent border with glow
- Badges: Solid fill for status (green/amber/red), subtle outline for tags, pulsing animation for "live" indicators

**Icon Selection**:
- Stack/Layers: `Stack`, `Cube` for architecture and infrastructure
- Data: `Database`, `CloudArrowDown`, `Satellite` for data sources
- AI/Processing: `BrainCircuit`, `Cpu`, `GitBranch` for ML pipeline
- Map: `Globe`, `MapPin`, `Target` for geospatial features
- Status: `CheckCircle`, `WarningCircle`, `XCircle` for health indicators
- Actions: `Play`, `Pause`, `ArrowsClockwise` for controls
- Navigation: `List`, `ChartBar`, `Map`, `BookOpen` for main tabs
- External: `ArrowSquareOut`, `GithubLogo` for repository links

**Spacing**:
- Section padding: `p-8` (32px) for main containers
- Card padding: `p-6` (24px) for content areas
- Element gaps: `gap-6` (24px) for major sections, `gap-4` (16px) for related items, `gap-2` (8px) for tight groups
- Margins: `mb-8` for section breaks, `mb-4` for subsections, `mb-2` for labels

**Mobile**:
- Tabs convert to dropdown select menu on mobile (<768px)
- Repository cards stack vertically with full width
- Map controls move to bottom drawer instead of sidebar
- Data tables convert to card-based layout with expandable details
- Multi-column layouts collapse to single column
- Font sizes reduce slightly: H1 to 24px, Body to 13px
- Touch targets expand to minimum 44x44px for all interactive elements
- Horizontal scrolling enabled for wide data tables with sticky first column

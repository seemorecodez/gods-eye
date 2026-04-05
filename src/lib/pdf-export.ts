import { MapAnnotation, MLPrediction, ThreatPrediction, WeatherData } from './types'

interface ExportData {
  annotations?: MapAnnotation[]
  predictions?: MLPrediction[]
  threatAnalysis?: ThreatPrediction[]
  weatherData?: WeatherData[]
}

export async function generatePDFReport(data: ExportData): Promise<void> {
  const reportContent = generateReportHTML(data)
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.')
  }

  printWindow.document.write(reportContent)
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

function generateReportHTML(data: ExportData): string {
  const timestamp = new Date().toISOString()
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>God's Eye Intelligence Report - ${new Date().toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.6;
      color: #000;
      background: #fff;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 3px;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #666;
    }
    
    .metadata {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 15px;
      background: #f5f5f5;
      border: 1px solid #ddd;
    }
    
    .metadata-item {
      font-size: 10px;
    }
    
    .metadata-item strong {
      display: block;
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #000;
    }
    
    .item {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      background: #fafafa;
      page-break-inside: avoid;
    }
    
    .item-header {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 12px;
    }
    
    .item-content {
      margin-left: 15px;
    }
    
    .field {
      margin-bottom: 5px;
      display: flex;
    }
    
    .field-label {
      font-weight: bold;
      min-width: 120px;
      color: #333;
    }
    
    .field-value {
      flex: 1;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border: 1px solid #000;
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
      margin-right: 5px;
    }
    
    .badge-critical { background: #000; color: #fff; }
    .badge-high { background: #666; color: #fff; }
    .badge-moderate { background: #999; color: #fff; }
    .badge-low { background: #fff; color: #000; }
    
    .confidence {
      font-family: monospace;
      background: #f0f0f0;
      padding: 2px 6px;
      border: 1px solid #ccc;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #000;
      text-align: center;
      font-size: 9px;
      color: #666;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .section {
        page-break-after: auto;
      }
      
      .item {
        page-break-inside: avoid;
      }
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background: #f0f0f0;
      font-weight: bold;
      font-size: 10px;
      text-transform: uppercase;
    }
    
    td {
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>GOD'S EYE</h1>
    <div class="subtitle">Geospatial Intelligence Report</div>
  </div>
  
  <div class="metadata">
    <div class="metadata-item">
      <strong>Report Generated</strong>
      ${new Date().toLocaleString()}
    </div>
    <div class="metadata-item">
      <strong>Classification</strong>
      UNCLASSIFIED
    </div>
    <div class="metadata-item">
      <strong>Document ID</strong>
      GE-${timestamp.slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}
    </div>
  </div>
  
  ${data.threatAnalysis && data.threatAnalysis.length > 0 ? `
  <div class="section">
    <div class="section-title">Threat Analysis & Predictions</div>
    ${data.threatAnalysis.map(threat => `
      <div class="item">
        <div class="item-header">
          <span class="badge badge-${threat.threatLevel}">${threat.threatLevel.toUpperCase()}</span>
          Location: ${threat.lat.toFixed(4)}°, ${threat.lng.toFixed(4)}°
        </div>
        <div class="item-content">
          <div class="field">
            <span class="field-label">Confidence:</span>
            <span class="field-value"><span class="confidence">${(threat.confidence * 100).toFixed(1)}%</span></span>
          </div>
          <div class="field">
            <span class="field-label">Prediction:</span>
            <span class="field-value">${threat.prediction}</span>
          </div>
          <div class="field">
            <span class="field-label">Contributing Factors:</span>
            <span class="field-value">${threat.factors.join(', ') || 'None identified'}</span>
          </div>
          <div class="field">
            <span class="field-label">Analysis Time:</span>
            <span class="field-value">${threat.timestamp.toLocaleString()}</span>
          </div>
          ${threat.historicalData.length > 0 ? `
          <div class="field" style="margin-top: 10px;">
            <span class="field-label">Historical Trend:</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event Count</th>
                <th>Avg Severity</th>
              </tr>
            </thead>
            <tbody>
              ${threat.historicalData.slice(-5).map(hd => `
                <tr>
                  <td>${hd.date.toLocaleDateString()}</td>
                  <td>${hd.eventCount}</td>
                  <td>${hd.severity.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${data.predictions && data.predictions.length > 0 ? `
  <div class="section">
    <div class="section-title">ML Model Predictions</div>
    ${data.predictions.map(pred => `
      <div class="item">
        <div class="item-header">
          ${pred.modelName} - ${pred.inputType}
        </div>
        <div class="item-content">
          <div class="field">
            <span class="field-label">Prediction:</span>
            <span class="field-value">${pred.prediction}</span>
          </div>
          <div class="field">
            <span class="field-label">Confidence:</span>
            <span class="field-value"><span class="confidence">${(pred.confidence * 100).toFixed(1)}%</span></span>
          </div>
          <div class="field">
            <span class="field-label">Processing Time:</span>
            <span class="field-value">${pred.metadata.processingTime}ms</span>
          </div>
          ${pred.metadata.objectsDetected ? `
          <div class="field">
            <span class="field-label">Objects Detected:</span>
            <span class="field-value">${pred.metadata.objectsDetected}</span>
          </div>
          ` : ''}
          ${pred.metadata.modelVersion ? `
          <div class="field">
            <span class="field-label">Model Version:</span>
            <span class="field-value">${pred.metadata.modelVersion}</span>
          </div>
          ` : ''}
          <div class="field">
            <span class="field-label">Timestamp:</span>
            <span class="field-value">${pred.timestamp.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${data.annotations && data.annotations.length > 0 ? `
  <div class="section">
    <div class="section-title">Team Annotations</div>
    ${data.annotations.map(ann => `
      <div class="item">
        <div class="item-header">
          <span class="badge badge-low">${ann.type.toUpperCase()}</span>
          ${ann.lat.toFixed(4)}°, ${ann.lng.toFixed(4)}°
        </div>
        <div class="item-content">
          <div class="field">
            <span class="field-label">Content:</span>
            <span class="field-value">${ann.content}</span>
          </div>
          <div class="field">
            <span class="field-label">Author:</span>
            <span class="field-value">${ann.author}</span>
          </div>
          <div class="field">
            <span class="field-label">Timestamp:</span>
            <span class="field-value">${ann.timestamp.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${data.weatherData && data.weatherData.length > 0 ? `
  <div class="section">
    <div class="section-title">Weather Conditions</div>
    <table>
      <thead>
        <tr>
          <th>Location</th>
          <th>Temp (°C)</th>
          <th>Conditions</th>
          <th>Wind (km/h)</th>
          <th>Humidity (%)</th>
          <th>Visibility (km)</th>
        </tr>
      </thead>
      <tbody>
        ${data.weatherData.slice(0, 20).map(w => `
          <tr>
            <td>${w.lat.toFixed(2)}°, ${w.lng.toFixed(2)}°</td>
            <td>${w.temperature.toFixed(1)}</td>
            <td>${w.conditions}</td>
            <td>${w.windSpeed.toFixed(1)} @ ${w.windDirection}°</td>
            <td>${w.humidity.toFixed(0)}</td>
            <td>${w.visibility.toFixed(1)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${data.weatherData.length > 20 ? `
    <p style="margin-top: 10px; font-size: 10px; color: #666;">
      Showing 20 of ${data.weatherData.length} weather observations
    </p>
    ` : ''}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>This report was generated by God's Eye Geospatial Intelligence Platform</p>
    <p>Built entirely from open-source GitHub repositories</p>
    <p>Document ID: GE-${timestamp.slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
  </div>
</body>
</html>
  `
}

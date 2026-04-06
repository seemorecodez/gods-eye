export interface ExportOptions {
  filename: string
  format: 'csv' | 'png' | 'svg'
  quality?: number
}

export async function exportChartToCSV(data: any[], filename: string): Promise<void> {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const headers = Object.keys(data[0])
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header]
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportChartToPNG(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Chart element not found')
  }

  const svgElement = element.querySelector('svg')
  if (!svgElement) {
    throw new Error('SVG element not found in chart')
  }

  const svgData = new XMLSerializer().serializeToString(svgElement)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const img = new Image()
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = svgElement.clientWidth * 2
      canvas.height = svgElement.clientHeight * 2
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'))
          return
        }
        
        const link = document.createElement('a')
        const pngUrl = URL.createObjectURL(blob)
        link.setAttribute('href', pngUrl)
        link.setAttribute('download', `${filename}.png`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        URL.revokeObjectURL(pngUrl)
        resolve()
      }, 'image/png')
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load SVG image'))
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  })
}

export async function exportChartToSVG(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Chart element not found')
  }

  const svgElement = element.querySelector('svg')
  if (!svgElement) {
    throw new Error('SVG element not found in chart')
  }

  const svgClone = svgElement.cloneNode(true) as SVGElement
  
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  
  const svgData = new XMLSerializer().serializeToString(svgClone)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.svg`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportChart(elementId: string, data: any[], options: ExportOptions): Promise<void> {
  switch (options.format) {
    case 'csv':
      await exportChartToCSV(data, options.filename)
      break
    case 'png':
      await exportChartToPNG(elementId, options.filename)
      break
    case 'svg':
      await exportChartToSVG(elementId, options.filename)
      break
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

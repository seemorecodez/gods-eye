import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { exportToCSV, exportToJSON, exportToGeoJSON, ExportData } from '@/lib/export-utils'
import { Download, FileCsv, FileJs, MapPin } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ExportButtonProps {
  data: Record<string, unknown>[]
  filename: string
  type: 'annotations' | 'predictions' | 'threats' | 'patterns'
  geoJSONFeatures?: Array<{
    coordinates: [number, number]
    properties: Record<string, unknown>
  }>
}

export function ExportButton({ data, filename, type, geoJSONFeatures }: ExportButtonProps) {
  const handleExportCSV = () => {
    try {
      exportToCSV(data, `${filename}.csv`)
      toast.success('Exported to CSV', {
        description: `${data.length} records exported successfully`
      })
    } catch (error) {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleExportJSON = () => {
    try {
      const exportData: ExportData = {
        type,
        data,
        metadata: {
          exportedAt: Date.now(),
          exportedBy: 'God\'s Eye Platform',
          version: '1.0.0'
        }
      }
      exportToJSON(exportData, `${filename}.json`)
      toast.success('Exported to JSON', {
        description: `${data.length} records exported successfully`
      })
    } catch (error) {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleExportGeoJSON = () => {
    if (!geoJSONFeatures || geoJSONFeatures.length === 0) {
      toast.error('No geospatial data available', {
        description: 'This data cannot be exported as GeoJSON'
      })
      return
    }

    try {
      exportToGeoJSON(geoJSONFeatures, `${filename}.geojson`)
      toast.success('Exported to GeoJSON', {
        description: `${geoJSONFeatures.length} features exported successfully`
      })
    } catch (error) {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download size={16} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileCsv size={16} className="mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJs size={16} className="mr-2" />
          Export as JSON
        </DropdownMenuItem>
        {geoJSONFeatures && geoJSONFeatures.length > 0 && (
          <DropdownMenuItem onClick={handleExportGeoJSON}>
            <MapPin size={16} className="mr-2" />
            Export as GeoJSON
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

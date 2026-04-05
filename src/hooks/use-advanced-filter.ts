import { useState, useMemo } from 'react'

export interface FilterConfig<T> {
  searchTerm: string
  filters: Partial<Record<keyof T, unknown>>
  sortBy?: keyof T
  sortOrder: 'asc' | 'desc'
}

export function useAdvancedFilter<T extends Record<string, unknown>>(
  data: T[],
  searchableFields: (keyof T)[]
) {
  const [config, setConfig] = useState<FilterConfig<T>>({
    searchTerm: '',
    filters: {},
    sortOrder: 'desc'
  })

  const filteredData = useMemo(() => {
    let result = [...data]

    if (config.searchTerm) {
      const searchLower = config.searchTerm.toLowerCase()
      result = result.filter(item =>
        searchableFields.some(field => {
          const value = item[field]
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    Object.entries(config.filters).forEach(([key, filterValue]) => {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        result = result.filter(item => {
          const itemValue = item[key as keyof T]
          
          if (typeof filterValue === 'object' && 'min' in filterValue && 'max' in filterValue) {
            const numValue = Number(itemValue)
            return numValue >= (filterValue.min as number) && numValue <= (filterValue.max as number)
          }
          
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue)
          }
          
          return itemValue === filterValue
        })
      }
    })

    if (config.sortBy) {
      result.sort((a, b) => {
        const aVal = a[config.sortBy!]
        const bVal = b[config.sortBy!]
        
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return config.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        const aStr = String(aVal)
        const bStr = String(bVal)
        const comparison = aStr.localeCompare(bStr)
        return config.sortOrder === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, config, searchableFields])

  const setSearchTerm = (searchTerm: string) => {
    setConfig(prev => ({ ...prev, searchTerm }))
  }

  const setFilter = (key: keyof T, value: unknown) => {
    setConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }))
  }

  const clearFilter = (key: keyof T) => {
    setConfig(prev => {
      const newFilters = { ...prev.filters }
      delete newFilters[key]
      return { ...prev, filters: newFilters }
    })
  }

  const clearAllFilters = () => {
    setConfig(prev => ({
      ...prev,
      searchTerm: '',
      filters: {}
    }))
  }

  const setSorting = (sortBy: keyof T, sortOrder: 'asc' | 'desc') => {
    setConfig(prev => ({ ...prev, sortBy, sortOrder }))
  }

  return {
    filteredData,
    config,
    setSearchTerm,
    setFilter,
    clearFilter,
    clearAllFilters,
    setSorting
  }
}

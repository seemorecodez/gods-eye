import { earthquakesPlugin } from './earthquakes'

export const allPlugins = [
  earthquakesPlugin,
]

export const getPluginById = (id: string) => {
  return allPlugins.find(p => p.id === id)
}

export const getPluginsByCategory = (category: string) => {
  return allPlugins.filter(p => p.category === category)
}

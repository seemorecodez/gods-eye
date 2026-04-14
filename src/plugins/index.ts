import { earthquakesPlugin } from './earthquakes'
import { wildfirePlugin } from './wildfires'
import { lightningPlugin } from './lightning'

export const allPlugins = [
  earthquakesPlugin,
  wildfirePlugin,
  lightningPlugin,
]

export const getPluginById = (id: string) => {
  return allPlugins.find(p => p.id === id)
}

export const getPluginsByCategory = (category: string) => {
  return allPlugins.filter(p => p.category === category)
}

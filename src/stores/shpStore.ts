import { NamedGeoJson } from '../types'
import { useViewerStore } from './viewerStore'

export const useShpStore = defineStore('shpStore', () => {

  const { addShp: addLayer, removeShp: removeLayer } = useViewerStore()

  const shpList: Ref<NamedGeoJson[]> = ref([])

  const createShp = (newShp: NamedGeoJson): void => {
    shpList.value.push(newShp)
  }

  const addShp = async (name: string): Promise<void> => {
    const res: NamedGeoJson | undefined = shpList.value.find(shp => shp.name === name)
    if (res) await addLayer(res)
  }

  const removeShp = (name: string): void => removeLayer(name)

  return {
    shpList,
    createShp,
    addShp,
    removeShp
  }
})
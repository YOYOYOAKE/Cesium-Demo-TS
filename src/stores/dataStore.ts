import { defineStore } from 'pinia'
import { Reactive } from 'vue'
import { GeoDataList, GeoData } from '../types'
import { useViewerStore } from './viewerStore'
import { GeoJSON } from 'geojson'

export const useDataStore = defineStore('dataStore',
  () => {

    const { addLayer, removeLayer } = useViewerStore()

    const sheetName: Ref<string> = ref('')
    const sheetHeaders: Ref<string[]> = ref([])
    const sheetContent: Ref<Record<string, string | number>[]> = ref([])

    const dataList: Reactive<GeoDataList> = reactive([])

    const createData = (newData: GeoData): void => {
      dataList.push(newData)
    }

    const addData = async (name: string): Promise<void> => {
      const res: GeoData | undefined = dataList.find((shp) => {
        return shp.name === name
      })
      if (res) {
        await addLayer(res)
      }
    }

    const removeData = (name: string): void => {
      removeLayer(name)
    }

    const saveData = (fieldsMap: Record<string, string>): void => {

      // Extract the data from the sheetContent

      const result = sheetContent.value.map((item) => {
        const newObj: Record<string, string | number> = {}
        for (const key in fieldsMap) {
          const fieldName: string = fieldsMap[key]
          newObj[key] = item[fieldName]
        }
        return newObj
      })

      // Transform the result into a GeoJSON object

      const geoJson: GeoJSON = {
        type: 'FeatureCollection',
        features: result.map(point => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lng as number, point.lat as number]
          },
          properties: {}
        }))
      }

      createData({
        name: sheetName.value,
        geoJson: geoJson
      })

      sheetName.value = ''
      sheetHeaders.value = []
      sheetContent.value = []
    }

    return {
      sheetName,
      sheetHeaders,
      sheetContent,
      dataList,
      createData,
      addData,
      removeData,
      saveData
    }
  })
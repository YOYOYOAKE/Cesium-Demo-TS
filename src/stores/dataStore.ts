import { defineStore } from 'pinia'
import { Reactive } from 'vue'
import { GeoDataList, GeoData } from '../types'
import { useViewerStore } from './viewerStore'


export const useDataStore = defineStore('dataStore',
  () => {

    const { addLayer, removeLayer } = useViewerStore()

    const sheetHeaders: Ref<Array<string>> = ref([])
    const sheetContent: Ref<Array<Array<string>>> = ref([])

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

    return {
      sheetHeaders,
      sheetContent,
      dataList,
      createData,
      addData,
      removeData
    }
  })
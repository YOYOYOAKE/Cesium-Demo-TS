import { defineStore } from 'pinia'
import { useViewerStore } from './viewerStore'
import { Reactive } from 'vue'

import { type NamedPointCoordinates } from '../types'
// import { Viewer } from 'cesium'


export const useDataStore = defineStore('dataStore',
  () => {

    const { addPrimitiveByCoordinates } = useViewerStore()


    const sheetName: Ref<string> = ref('')
    const sheetHeaders: Ref<string[]> = ref([])
    const sheetContent: Ref<Record<string, string | number>[]> = ref([])

    const dataList: Reactive<NamedPointCoordinates[]> = reactive([])

    const createData = (newData: NamedPointCoordinates): void => {
      dataList.push(newData)
    }

    const addData = async (name: string): Promise<void> => {
      const res: NamedPointCoordinates | undefined = dataList.find((data) => {
        return data.name === name
      })

      console.log(res)

      if (res) {
        addPrimitiveByCoordinates(res)

      }
    }

    const removeData = (name: string): void => {
      // removeLayer(name)
      console.log(name)
    }

    const saveData = (fieldsMap: Record<string, string>): void => {
      const result: [number, number][] = sheetContent.value.map((item) => {
        return [item[fieldsMap.lng] as number, item[fieldsMap.lat] as number]
      })

      createData({
        name: sheetName.value,
        coordinates: result
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
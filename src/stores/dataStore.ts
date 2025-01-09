import { defineStore } from 'pinia'
import { useViewerStore } from './viewerStore'
import { Reactive } from 'vue'
import { type NamedPointCoordinates } from '../types'

export const useDataStore = defineStore('dataStore',
  () => {

    const viewerStore = useViewerStore()

    // Define the sheet object
    const sheet: {
      name: string,
      headers: string[],
      content: Record<string, string | number>[]
    } = {
      name: '',
      headers: [],
      content: []
    }

    const setSheet = (name: string, headers: string[], content: Record<string, string | number>[]): void => {
      sheet.name = name
      sheet.headers = headers
      sheet.content = content
    }

    const getSheet = () => {
      return sheet
    }

    const dataList: Reactive<NamedPointCoordinates[]> = reactive([])

    const createData = (newData: NamedPointCoordinates): void => {
      dataList.push(newData)
    }

    const updateData = async (name: string): Promise<void> => {
      const res: NamedPointCoordinates | undefined = dataList.find((data) => {
        return data.name === name
      })

      if (res) {
        viewerStore.addPointsCollection(res)
      }
    }

    const saveData = (fieldsMap: Record<string, string>): void => {
      const result: [number, number][] = sheet.content.map((item) => {
        return [item[fieldsMap.lng] as number, item[fieldsMap.lat] as number]
      })

      createData({
        name: sheet.name,
        coordinates: result
      })

      // Reset the sheet object after saving the data
      sheet.name = ''
      sheet.headers = []
      sheet.content = []
    }

    return {
      setSheet, getSheet,
      dataList,
      createData,
      updateData,
      saveData
    }
  })
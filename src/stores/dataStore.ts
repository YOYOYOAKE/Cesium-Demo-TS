import { defineStore } from 'pinia'
import { useViewerStore } from './viewerStore'
import { Reactive } from 'vue'
import { type NamedPointCoordinates } from '../types'

export const useDataStore = defineStore('dataStore',
  () => {

    const viewerStore = useViewerStore()

    // #region Sheet Data

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

    const getSheet = () => sheet

    // #endregion

    // #region Data List

    const dataList: Reactive<NamedPointCoordinates[]> = reactive([])

    const updateData = async (name: string): Promise<void> => {
      const res: NamedPointCoordinates | undefined = dataList.find((data) => data.name === name)

      if (res) viewerStore.updatePointsCollection(res)
    }

    const saveData = (fieldsMap: Record<string, string>): void => {
      const coordinates: [number, number][] = sheet.content.map((item) => {
        return [item[fieldsMap.lng] as number, item[fieldsMap.lat] as number]
      })

      dataList.push({
        name: sheet.name,
        coordinates
      })

      // Reset the sheet object after saving the data
      sheet.name = ''
      sheet.headers = []
      sheet.content = []
    }

    // #endregion

    return {
      setSheet, getSheet,
      dataList, updateData, saveData
    }
  })
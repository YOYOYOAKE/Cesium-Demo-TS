import { useViewerStore } from './viewerStore'
import { NamedOdCoordinates, type NamedPointCoordinates } from '../types'
import { getParabolaCollection } from '../utils/parabolaCauculater'

export const useDataStore = defineStore('dataStore',
  () => {

    const viewerStore = useViewerStore()

    // #region 原始表格

    const sheet: Ref<{
      name: string,
      headers: string[],
      content: Record<string, string | number>[]
    }> = ref({
      name: '',
      headers: [],
      content: []
    })

    const setSheet = (name: string, headers: string[], content: Record<string, string | number>[]): void => {
      sheet.value.name = name
      sheet.value.headers = headers
      sheet.value.content = content
    }

    // #endregion

    // #region 点、OD数据列表

    const pointDataList: Ref<NamedPointCoordinates[]> = ref([])

    const odDataList: Ref<NamedOdCoordinates[]> = ref([])

    // #endregion

    // #region 更新与保存数据

    const updateData = (name: string) => {
      let res: NamedPointCoordinates | NamedOdCoordinates | undefined = pointDataList.value.find((data) => data.name === name)

      if (res) {
        viewerStore.updatePointsCollection(res)
      } else {
        res = odDataList.value.find((data) => data.name === name)
        if (res) viewerStore.updateOdCollection(res)
      }
    }

    const saveData = (fieldsMap: Record<string, string>, dataType: 'point' | 'od'): void => {

      if (dataType === 'point') {
        const coordinates: [number, number][] = sheet.value.content.map((item) => {
          return [item[fieldsMap.lng] as number, item[fieldsMap.lat] as number]
        })
        pointDataList.value.push({
          name: sheet.value.name,
          coordinates
        })
      } else if (dataType === 'od') {
        const coordinates: { o: [number, number], d: [number, number] }[] = sheet.value.content.map((item) => {
          return {
            o: [item[fieldsMap.oLng] as number, item[fieldsMap.oLat] as number],
            d: [item[fieldsMap.dLng] as number, item[fieldsMap.dLat] as number]
          }
        })
        odDataList.value.push({
          name: sheet.value.name,
          coordinates: getParabolaCollection(coordinates)
        })
      }

      // 保存数据后清空表格对象
      setSheet('', [], [])
    }


    // #endregion


    return {
      sheet, setSheet,
      pointDataList, odDataList,
      updateData, saveData
    }
  })
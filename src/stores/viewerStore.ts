import {defineStore} from 'pinia'
import {ImageryLayer, Viewer} from 'cesium'
import {Reactive, reactive} from 'vue'
import {AMapImageryProvider} from '@cesium-china/cesium-map'
import * as Cesium from 'cesium'
import {type GeoData, GeoDataLayerList, type GeoDataList} from '../types'

export const useViewerStore = defineStore('cesiumViewer',
  () => {

    // region Viewer

    let cesiumViewer = reactive<Viewer | {}>({})
    const setCesiumViewer = (viewer: Viewer): void => {
      cesiumViewer = viewer
    }

    // endregion

    // region Base Map

    const addBaseMap = (mapStyle: 'img' | 'elec' | 'cva'): void => {
      if (cesiumViewer instanceof Viewer) {
        cesiumViewer.imageryLayers.addImageryProvider(new AMapImageryProvider({
          style: mapStyle,
          crs: 'WGS84',
        }))
      }
    }

    const removeAllMap = (): void => {
      if (cesiumViewer instanceof Viewer) {
        cesiumViewer.imageryLayers.removeAll()
      }
    }

    // endregion

    // region Annotation Map

    let annoMap: ImageryLayer
    // Because annotation map is same with base map in Cesium, saving the annotation map index is necessary to ensure Cesium will not remove a wrong map.
    let annoMapIndex: number

    const addAnnoMap = (): void => {
      if (cesiumViewer instanceof Viewer) {
        annoMap = cesiumViewer.imageryLayers.addImageryProvider(new AMapImageryProvider({
          style: 'cva',
          crs: 'WGS84',
        }))
        // Here save the index of annotation layer.
        annoMapIndex = cesiumViewer.imageryLayers.indexOf(annoMap)
      }
    }

    const removeAnnoMap = (): void => {
      // Only when annotation map is exist (the index is greater than -1), the following will be executed.
      if (cesiumViewer instanceof Viewer && annoMapIndex >= 0) {
        cesiumViewer.imageryLayers.remove(cesiumViewer.imageryLayers.get(annoMapIndex))
      }
    }

    // endregion

    // region Shp

    const shpList: Reactive<GeoDataList> = reactive([])

    const createShp = (newShp: GeoData): void => {
      shpList.push(newShp)
    }

    const addShp = async (name: string): Promise<void> => {
      const res: GeoData | undefined = shpList.find((shp) => {
        return shp.name === name
      })
      if (res) {
        await addLayer(res)
      }
    }

    const removeShp = (name: string): void => {
      removeLayer(name)
    }

    // endregion

    // region Data

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

    // endregion

    // region Layer

    /*
      Here are two problems.
      1. In Cesium, to render a shp file layer, or to render a point layer, we must format them to GeoJSON, KML or other vector format.
      We need to handle these vector format data to cesium data source, then Cesium can render these data.
      So there is no differences among these data, Cesium will save them to the same list, and it is not necessary for us to deliberately distinguish them.
      2. Not the same as base layer, we usually add or remove different data, and these operation will scrambled layer index.
      To solve this problem, we defined a name property to every data source as the unique identification.
     */

    const currentLayerList: Reactive<GeoDataLayerList> = reactive([])

    const addLayer = async (data: GeoData): Promise<void> => {
      if (cesiumViewer instanceof Viewer) {
        const dataSource = await cesiumViewer.dataSources.add(await Cesium.GeoJsonDataSource.load(data.geoJson))
        dataSource.name = data.name

        currentLayerList.push({
          name: data.name,
          dataSource: dataSource,
        })
      }
    }

    const removeLayer = (name: string): void => {
      if (cesiumViewer instanceof Viewer) {
        const removedShpLayer = currentLayerList.find((item) => {
          return item.name === name
        })
        if (removedShpLayer) {
          cesiumViewer.dataSources.remove(cesiumViewer.dataSources.getByName(removedShpLayer.name)[0])
        }
      }
    }

    // endregion


    return {
      cesiumViewer, setCesiumViewer,
      addBaseMap, removeAllMap,
      addAnnoMap, removeAnnoMap,
      shpList, createShp, addShp, removeShp,
      dataList, createData, addData, removeData,
    }
  })
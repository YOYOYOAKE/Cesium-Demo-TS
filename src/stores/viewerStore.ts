import { defineStore } from 'pinia'
import { Reactive, reactive } from 'vue'
import { AMapImageryProvider } from '@cesium-china/cesium-map'
import * as Cesium from 'cesium'

import { NamedPointCoordinates, type NamedGeoJson, type NamedGeoJsonLayer } from '../types'
import { type ImageryLayer, Viewer } from 'cesium'

export const useViewerStore = defineStore('cesiumViewer',
  () => {

    // region Viewer

    let cesiumViewer = reactive<Viewer | object>({})
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

    // region Layer

    /*
      Here are two problems.
      1. In Cesium, to render a shp file layer, or to render a point layer, we must format them to GeoJSON, KML or other vector format.
      We need to handle these vector format data to cesium data source, then Cesium can render these data.
      So there is no differences among these data, Cesium will save them to the same list, and it is not necessary for us to deliberately distinguish them.
      2. Not the same as base layer, we usually add or remove different data, and these operation will scrambled layer index.
      To solve this problem, we defined a name property to every data source as the unique identification.
     */

    const currentLayerList: Reactive<NamedGeoJsonLayer[]> = reactive([])

    const addLayer = async (data: NamedGeoJson): Promise<void> => {
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

    const addPrimitiveByCoordinates = (data: NamedPointCoordinates): void => {
      const { coordinates } = data
      if (cesiumViewer instanceof Viewer) {
        const pointCollection = cesiumViewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
        coordinates.forEach((coordinate) => {
          pointCollection.add({
            position: Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1]),
            color: Cesium.Color.RED,
            pixelSize: 10,
          })
        })
      }
    }

    return {
      cesiumViewer, setCesiumViewer,
      addBaseMap, removeAllMap,
      addAnnoMap, removeAnnoMap,
      addLayer, removeLayer,
      addPrimitiveByCoordinates
    }
  })
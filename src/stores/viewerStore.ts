import { defineStore } from 'pinia'
import { Reactive, reactive } from 'vue'
import { AMapImageryProvider } from '@cesium-china/cesium-map'
import * as Cesium from 'cesium'

import { type NamedPointCoordinates, type NamedGeoJson, type NamedGeoJsonLayer } from '../types'
import { type ImageryLayer } from 'cesium'

export const useViewerStore = defineStore('cesiumViewer',
  () => {

    // @ts-expect-error: Mount instance of Cesium viewer to global object `window`
    const cesiumViewer = window.CesiumViewer

    // #region Base Map

    const updateBaseMap = (mapStyle: 'img' | 'elec' | 'cva'): void => {
      cesiumViewer.imageryLayers.removeAll()
      cesiumViewer.imageryLayers.addImageryProvider(new AMapImageryProvider({
        style: mapStyle,
        crs: 'WGS84',
      }))
    }

    // const removeAllMap = (): void => {
    // }

    // #endregion

    // #region Annotation Map

    let annoMap: ImageryLayer
    // Because annotation map is same with base map in Cesium, saving the annotation map index is necessary to ensure Cesium will not remove a wrong map.
    let annoMapIndex: number

    const addAnnoMap = (): void => {
      annoMap = cesiumViewer.imageryLayers.addImageryProvider(new AMapImageryProvider({
        style: 'cva',
        crs: 'WGS84',
      }))
      // Here save the index of annotation layer.
      annoMapIndex = cesiumViewer.imageryLayers.indexOf(annoMap)
    }

    const removeAnnoMap = (): void => {
      // Only when annotation map is exist (the index is greater than -1), the following will be executed.
      if (annoMapIndex >= 0) {
        cesiumViewer.imageryLayers.remove(cesiumViewer.imageryLayers.get(annoMapIndex))
      }
    }

    // #endregion

    // #region Layer

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
      const dataSource = await cesiumViewer.dataSources.add(await Cesium.GeoJsonDataSource.load(data.geoJson))
      dataSource.name = data.name

      currentLayerList.push({
        name: data.name,
        dataSource: dataSource,
      })
    }

    const removeLayer = (name: string): void => {
      const removedShpLayer = currentLayerList.find((item) => {
        return item.name === name
      })
      if (removedShpLayer) {
        cesiumViewer.dataSources.remove(cesiumViewer.dataSources.getByName(removedShpLayer.name)[0])
      }
    }

    // #endregion

    // #region Points Collection

    let pointCollection: Cesium.PointPrimitiveCollection | null = null

    const updatePointsCollection = (data: NamedPointCoordinates): void => {
      const { coordinates } = data
      if (pointCollection) {
        cesiumViewer.scene.primitives.remove(pointCollection)
        pointCollection = null
      }
      pointCollection = cesiumViewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
      coordinates.forEach((coordinate) => {
        pointCollection?.add({
          position: Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1]),
          color: Cesium.Color.RED,
          pixelSize: 10,
        })
      })
    }

    // #endregion

    // #region CityModel

    let cityModel: Cesium.Cesium3DTileset | null = null

    const addCityModel = async () => {
      const tileset = await Cesium.Cesium3DTileset.fromUrl('/models/tileset.json')
      cityModel = cesiumViewer.scene.primitives.add(tileset)
    }

    const removeCityModel = () => {
      cesiumViewer.scene.primitives.remove(cityModel)
    }

    // #endregion

    return {
      cesiumViewer,
      updateBaseMap,
      // removeAllMap,
      addAnnoMap, removeAnnoMap,
      addLayer, removeLayer,
      updatePointsCollection,
      addCityModel, removeCityModel,
      // addPrimitive, removePrimitive
    }
  })
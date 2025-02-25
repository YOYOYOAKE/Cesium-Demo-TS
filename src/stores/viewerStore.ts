import { AMapImageryProvider } from '@cesium-china/cesium-map'
import * as Cesium from 'cesium'
import { NamedPointCollection, NamedGeoJson, NamedDataSource, NamedParabola3Collection } from '../types'

const TILESET_URL: string = 'http://47.93.253.166:9000/tileset.json'

export const useViewerStore = defineStore('cesiumViewer',
  () => {
    // @ts-expect-error: 将Cesium Viewer的实例挂在到全局对象window上，以便在其他地方调用。
    const cesiumViewer: Cesium.Viewer = window.CesiumViewer

    // #region 底图

    const updateBaseMap = (mapStyle: 'img' | 'elec' | 'cva'): void => {
      cesiumViewer.imageryLayers.removeAll()
      cesiumViewer.imageryLayers.addImageryProvider(new AMapImageryProvider({
        style: mapStyle,
        crs: 'WGS84',
      }))
    }

    // #endregion

    // #region 注记图层

    let annoMapIndex: number = 0

    const addAnnoMap = (): void => {
      const annoMap = cesiumViewer.imageryLayers.addImageryProvider(new AMapImageryProvider({
        style: 'cva',
        crs: 'WGS84',
      }))
      // 保存一下注记图层的索引，以便后续删除。
      annoMapIndex = cesiumViewer.imageryLayers.indexOf(annoMap)
    }

    const removeAnnoMap = (): void => {
      // 当注记图层存在时（索引大于-1），才会执行以下操作。
      if (annoMapIndex >= 0) cesiumViewer.imageryLayers.remove(cesiumViewer.imageryLayers.get(annoMapIndex))
    }

    // #endregion

    // #region Shp

    // 将GeoJSON加载为Cesium中的DataSource来实现Shp图层
    const currentShpList: NamedDataSource[] = []

    const addShp = async (data: NamedGeoJson): Promise<void> => {
      const dataSource = await cesiumViewer.dataSources.add(await Cesium.GeoJsonDataSource.load(data.geoJson))
      dataSource.name = data.name

      currentShpList.push({
        name: data.name,
        dataSource,
      })
    }

    const removeShp = (name: string): void => {
      const removedShpLayer = currentShpList.find((item) => item.name === name)
      if (removedShpLayer) {
        // dataSources.getByName()方法返回的是一个数组，而由于之前限定了命名不能重复，所以数组中只有一个元素，解构赋值出第一个即可。
        const [removed] = cesiumViewer.dataSources.getByName(removedShpLayer.name)
        cesiumViewer.dataSources.remove(removed)
      }
    }

    // #endregion

    // #region 点数据和OD数据

    let pointCollection: Cesium.PointPrimitiveCollection | null = null

    // 因为地图上只同时存在一个点集，所以此处使用“update”而非“add”
    const updatePointsCollection = ({ coordinates }: NamedPointCollection): void => {
      clearMap()

      // 以Primitive方式将点绘制到Cesium中
      pointCollection = cesiumViewer.scene.primitives.add(new Cesium.PointPrimitiveCollection())
      coordinates.forEach((coordinate) => {
        pointCollection?.add({
          position: Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1]),
          color: Cesium.Color.RED,
          pixelSize: 2,
        })
      })
    }

    const updateOdCollection = ({ parabolas }: NamedParabola3Collection): void => {
      clearMap()

      // 以Entity方式将抛物线绘制到Cesium中
      parabolas.forEach(parabola => {
        const positions: Cesium.Cartesian3[] = []
        parabola.forEach(coordinate => {
          const position = Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1], coordinate[2])

          // 有时候会出现坐标转换出错的情况，此时不添加到positions中渲染
          if (position.x && position.y && position.z) positions.push(position)
        })

        cesiumViewer.entities.add({
          polyline: {
            positions: positions,
            width: 0.4,
            material: Cesium.Color.RED
          }
        })
      })
    }

    const clearMap = (): void => {
      if (pointCollection) {
        cesiumViewer.scene.primitives.remove(pointCollection)
        pointCollection = null
      }
      cesiumViewer.entities.removeAll()
    }

    // #endregion

    // #region 建筑白模

    let cityModel: Cesium.Cesium3DTileset | null = null

    const addCityModel = async () => {
      const tileset = await Cesium.Cesium3DTileset.fromUrl(TILESET_URL)
      cityModel = cesiumViewer.scene.primitives.add(tileset)
    }

    const removeCityModel = () => {
      cesiumViewer.scene.primitives.remove(cityModel)
    }

    // #endregion

    return {
      cesiumViewer,
      updateBaseMap,
      addAnnoMap, removeAnnoMap,
      addShp, removeShp,
      updatePointsCollection, updateOdCollection,
      addCityModel, removeCityModel,
    }
  })
import {GeoJSON} from 'geojson'
import {DataSource} from 'cesium'

export interface GeoData {
  name: string,
  geoJson: GeoJSON
}

export type GeoDataList = Array<GeoData>

export interface GeoDataLayer {
  name: string,
  dataSource: DataSource
}

export type GeoDataLayerList = Array<GeoDataLayer>
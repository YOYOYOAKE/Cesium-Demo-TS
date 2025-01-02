import { GeoJSON } from 'geojson'
import { DataSource } from 'cesium'

export interface NamedGeoJson {
  name: string,
  geoJson: GeoJSON
}

export interface NamedGeoJsonLayer {
  name: string,
  dataSource: DataSource
}

export interface NamedPointCoordinates {
  name: string,
  coordinates: [number, number][]
}
import { GeoJSON } from 'geojson'
import { DataSource } from 'cesium'

export type NamedGeoJson = {
  name: string,
  geoJson: GeoJSON
}

export type NamedDataSource = {
  name: string,
  dataSource: DataSource
}

export type Coordinate2 = [number, number]

export type Coordinate3 = [number, number, number]

export type NamedPointCollection = {
  name: string,
  coordinates: Coordinate2[]
}

export type NamedParabola3Collection = {
  name: string,
  parabolas: Coordinate3[][]
}

export type SheetObject = {
  name: string,
  headers: string[],
  content: Record<string, string | number>[]
}

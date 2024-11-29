import { PostGeoBodyType } from '@/models/geolocation'
import { customType } from 'drizzle-orm/pg-core'
import * as wkx from 'wkx'
import { Buffer } from 'buffer'

export const polygonDB = customType<{
  data: PostGeoBodyType
  driverData: string
}>({
  dataType() {
    return 'geometry(POLYGON, 4326)'
  },
  toDriver(value: PostGeoBodyType): string {
    const points = value
      .map(point => `${point.longitude} ${point.latitude}`)
      .join(', ')
    return `SRID=4326;POLYGON((${points}, ${value[0].longitude} ${value[0].latitude}))`
  },
  fromDriver: function (value: string): PostGeoBodyType {
    // Parse the WKT string to a GeoJSON object
    const wkbBuffer = Buffer.from(value, 'hex')
    const geometry = wkx.Geometry.parse(wkbBuffer).toGeoJSON() as GeoJSONPolygon

    // Convert coordinates to longitude and latitude pairs
    const coordinates = geometry.coordinates[0]
    return coordinates.map(value => {
      const [longitude, latitude] = value as [number, number]
      return { longitude, latitude }
    })
  },
})

interface GeoJSONPolygon {
  type: string
  coordinates: [number, number][][] // Coordinates for Polygon: array of rings, each ring is an array of points
}

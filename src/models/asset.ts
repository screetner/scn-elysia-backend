import { t } from 'elysia'

export const GetAssetByAssetId = t.Object({
  assetId: t.String(),
})

export interface assetData {
  assetId: string
  geoCoordinate: [number, number]
  assetType: string
  imageUrl: string
  recordedUser: string
  recordedAt: Date
}

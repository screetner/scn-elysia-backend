import { t } from 'elysia'

export const GetAssetByAssetId = t.Object({
  assetId: t.String(),
})

export const GetAssetsByOrgId = t.Object({
  inBorder: t.Boolean(),
})

export interface assetData {
  assetId: string
  geoCoordinate: [number, number]
  assetType: string
  imageUrl: string
  recordedUser: string
  recordedAt: Date
}

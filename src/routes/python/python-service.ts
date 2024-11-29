import { assetList } from '@/models/python'
import { db } from '@/database/database'
import * as schemas from '@/database/schemas'

export async function postAsset(data: assetList) {
  const recordedUser = data.recordedUserId
  const values = data.assets.map(asset => {
    const geoCoordinate: [number, number] = [
      asset.geoCoordinate.lat,
      asset.geoCoordinate.lng,
    ]
    return {
      geoCoordinate,
      assetTypeId: asset.assetTypeId,
      imageFileLink: asset.imageFileName,
      recordedUser,
      recordedAt: new Date(asset.recordedAt),
    }
  })

  await db.insert(schemas.assetTable).values(values)
}

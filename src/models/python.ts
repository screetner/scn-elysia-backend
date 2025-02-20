import { Static, t } from 'elysia'

export const PostAssetBody = t.Object({
  recordedUserId: t.String(),
  assets: t.Array(
    t.Object({
      assetTypeId: t.String(),
      geoCoordinate: t.Object({
        lat: t.Number(),
        lng: t.Number(),
      }),
      imageFileName: t.String(),
      recordedAt: t.Date(),
    }),
  ),
})

export const PostProcessFailBody = t.Object({
  videoSessionId: t.String(),
})

export const SuccessSubject = 'Asset Upload Success'
export const FailSubject = 'Asset Upload Fail'
export const errorMessage =
  'Upload timeout or connection interrupted. Please ensure stable internet connection and try again.'
export type assetList = Static<typeof PostAssetBody>

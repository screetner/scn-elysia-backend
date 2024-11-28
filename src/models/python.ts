import {Static, t} from "elysia";

export const PostAssetBody = t.Object({
    recordedUserId : t.String(),
    assets : t.Array(t.Object({
        assetTypeId : t.String(),
        geoCoordinate : t.Object({
            lat : t.Number(),
            lng : t.Number()
        }),
        imageFileName : t.String(),
        recordedAt : t.Date()
    }))
})

export type assetList = Static<typeof PostAssetBody>
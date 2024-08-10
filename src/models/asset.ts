import {t} from 'elysia'

export const GetAssetByAssetId = t.Object({
    assetId : t.String()
})

export const GetAssetByOrgId = t.Object({
    orgId : t.String()
})
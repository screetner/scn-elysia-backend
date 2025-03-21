import { Elysia } from 'elysia'
import { checkAccessToken } from '@/middleware/jwtRequire'
import { assetData, GetAssetByAssetId, GetAssetsByOrgId } from '@/models/asset'
import {
  countAssetsByOrgId,
  deleteAssetById,
  findAssetByIds,
  findAssetsByOrgId,
  generateAssetImageUrl,
} from '@/routes/assets/asset-services'
import { getGeo } from '@/routes/geolocation/geolocation-service'
import { getSAS } from '@/routes/organization/organization-service'

export const asset = (app: Elysia) =>
  app.group('assets', app => {
    return app
      .use(checkAccessToken)
      .get(
        '/assetId/:assetId',
        async ({ error, payload, params }) => {
          const assetId = params.assetId
          try {
            const assetsData: assetData = await findAssetByIds(assetId)
            const SAS = await getSAS(payload.orgId!)
            return generateAssetImageUrl(SAS, assetsData)
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get Asset by AssetId',
            tags: ['Asset'],
          },
          params: GetAssetByAssetId,
        },
      )
      .get(
        '/orgId',
        async ({ error, query, payload }) => {
          try {
            const inBorder = query.inBorder ? query.inBorder : true
            const [border, assets] = await Promise.all([
              getGeo(payload.orgId!),
              findAssetsByOrgId(payload.orgId!, inBorder),
            ])
            return {
              border,
              assets,
            }
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get All Assets by OrgId',
            tags: ['Asset'],
            query: GetAssetsByOrgId,
          },
        },
      )
      .get(
        '/org/:orgId',
        async ({ error, params, payload }) => {
          try {
            if (!payload.isOwner) return error(401, 'Unauthorized')

            const orgId = params.orgId

            const [total] = await countAssetsByOrgId(orgId)

            return total
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get Total Assets by OrgId for Owner',
            tags: ['Asset'],
          },
        },
      )
      .delete(
        '/assetId/:assetId',
        async ({ error, params, payload }) => {
          const assetId = params.assetId
          try {
            await deleteAssetById(assetId, payload.orgId!)
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Delete Asset by AssetId',
            tags: ['Asset'],
          },
          params: GetAssetByAssetId,
        },
      )
  })

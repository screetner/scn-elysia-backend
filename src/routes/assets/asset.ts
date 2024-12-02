import { Elysia } from 'elysia'
import { checkAccessToken } from '@/middleware/jwtRequire'
import { assetData, GetAssetByAssetId } from '@/models/asset'
import {
  countAssetsByOrgId,
  findAssetsByIds,
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
          const assetIds = params.assetId.split(',')
          try {
            const assetsData: assetData[] = await findAssetsByIds(assetIds)
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
        async ({ error, payload }) => {
          try {
            const [border, assets] = await Promise.all([
              getGeo(payload.orgId!),
              findAssetsByOrgId(payload.orgId!),
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
  })

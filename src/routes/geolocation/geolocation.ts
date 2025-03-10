import { Elysia } from 'elysia'
import { PostGeoBody } from '@/models/geolocation'
import { postGeo, getGeo } from '@/routes/geolocation/geolocation-service'
import { checkAccessToken } from '@/middleware/jwtRequire'

export const geolocation = (app: Elysia) =>
  app.group('geolocation', app => {
    return app
      .use(checkAccessToken)
      .patch(
        '/organization-border',
        async ({ body, error, payload }) => {
          try {
            const response = await postGeo(body, payload!.orgId)

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          permission: {
            web: {
              manageGeometry: true,
            },
          },
          body: PostGeoBody,
          detail: {
            title: 'Post Geolocation',
            description: 'Post Geolocation for Organization',
            tags: ['Geolocation'],
          },
        },
      )
      .get(
        '/',
        async ({ error, payload }) => {
          try {
            const response = await getGeo(payload!.orgId)

            if (!response) return error(401, 'Unauthorized')

            return {
              border: response,
            }
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get Geolocation for Organization',
            tags: ['Geolocation'],
          },
        },
      )
  })

import { Elysia } from 'elysia'
import { PostAssetBody } from '@/models/python'
import { postAsset } from '@/routes/python/python-service'
import { updateVideoSessionHelper } from '@/routes/videoSession/videoSession-service'
import {
  VideoSessionIdParams,
  videoSessionStateEnum,
} from '@/models/videoSession'

export const python = (app: Elysia) =>
  app.group('python', app => {
    return app
      .post(
        '',
        async ({ error, body }) => {
          try {
            return await postAsset(body)
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Post Asset',
            tags: ['Python'],
          },
          body: PostAssetBody,
        },
      )
      .patch(
        '/updateProcess',
        async ({ error, body }) => {
          try {
            return await updateVideoSessionHelper(
              body.videoSessionId,
              100,
              videoSessionStateEnum.CAN_DELETE,
            )
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Update Process',
            tags: ['Python'],
          },
          body: VideoSessionIdParams,
        },
      )
  })

import { Elysia } from 'elysia'
import { PostAssetBody, PostProcessFailBody } from '@/models/python'
import { postAsset } from '@/routes/python/python-service'
import { updateVideoSessionHelper } from '@/routes/videoSession/videoSession-service'
import {
  VideoSessionIdParams,
  videoSessionStateEnum,
} from '@/models/videoSession'
import { sendAlertEmail, uploadFailCase } from '@/routes/email/email-service'

export const python = (app: Elysia) =>
  app.group('python', app => {
    return app
      .post(
        '',
        async ({ error, body }) => {
          try {
            if (body.assets.length !== 0) await postAsset(body)
            return await sendAlertEmail(body.recordedUserId, true)
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
      .post(
        '/process/fail',
        async ({ error, body }) => {
          try {
            return await uploadFailCase(body.videoSessionId)
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description:
              'Post Process Fail Data to Email for Admin users and Record User',
            tags: ['Python'],
          },
          body: PostProcessFailBody,
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

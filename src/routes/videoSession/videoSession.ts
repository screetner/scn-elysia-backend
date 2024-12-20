import { Elysia } from 'elysia'
import { checkAccessToken } from '@/middleware/jwtRequire'
import * as videoModel from '@/models/videoSession'
import {
  generateSessionFolderPath,
  postVideoSession,
  removeVideoSession,
  updateVideoSession,
} from '@/routes/videoSession/videoSession-service'
import trickProcess from '@/libs/azure-process'

export const videoSession = (app: Elysia) =>
  app.group('videoSession', app => {
    return app
      .use(checkAccessToken)
      .post(
        '/create',
        async ({ error, payload, body }) => {
          try {
            return await postVideoSession(payload!.userId, body)
          } catch (e) {
            return error(500, e)
          }
        },
        {
          permission: {
            mobile: {
              videosProcess: true,
            },
          },
          detail: {
            description: 'Post Video Session',
            tags: ['Video Session'],
          },
          body: videoModel.PostVideoBody,
        },
      )
      .patch(
        '/updateProcess',
        async ({ error, payload, body }) => {
          try {
            const isUpdated = await updateVideoSession(
              body.videoSessionId,
              body.uploadProgress,
              payload!.userId,
            )

            if (isUpdated) {
              const generatePromise = generateSessionFolderPath({
                videoSessionId: body.videoSessionId,
                organizationId: payload!.orgId,
                organizationName: payload!.orgName,
              })
              const processPromise = generatePromise.then(requestBody =>
                trickProcess(requestBody),
              )

              await Promise.all([generatePromise, processPromise])
            }

            return { message: 'Update Success' }
          } catch (e) {
            return error(500, e)
          }
        },
        {
          permission: {
            mobile: {
              videosProcess: true,
            },
          },
          detail: {
            description: 'Update Status of Video Session',
            tags: ['Video Session'],
          },
          body: videoModel.UpdateVideoState,
        },
      )
      .patch(
        '/processing',
        async ({ error, payload, body }) => {
          try {
            const generatePromise = generateSessionFolderPath({
              videoSessionId: body.videoSessionId,
              organizationId: payload!.orgId,
              organizationName: payload!.orgName,
            })
            const processPromise = generatePromise.then(requestBody =>
              trickProcess(requestBody),
            )

            await Promise.all([generatePromise, processPromise])

            return { message: 'Start Processing' }
          } catch (e) {
            return error(500, e)
          }
        },
        {
          permission: {
            mobile: {
              videosProcess: true,
            },
          },
          detail: {
            description: 'Start Processing Video Session',
            tags: ['Video Session'],
          },
          body: videoModel.ProcessingState,
        },
      )
      .delete(
        '/remove',
        async ({ error, params }) => {
          try {
            return await removeVideoSession(params.videoSessionId)
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Remove Video Session',
            tags: ['Video Session'],
          },
          params: videoModel.VideoSessionIdParams,
        },
      )
  })

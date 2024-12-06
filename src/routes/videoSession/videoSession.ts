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
            const updatePromise = updateVideoSession(
              body.videoSessionId,
              body.uploadProgress,
              payload!.userId,
            )

            const generateAndProcessPromise = (async () => {
              const requestBody: videoModel.RequestPythonDetection =
                await generateSessionFolderPath({
                  videoSessionId: body.videoSessionId,
                  organizationId: payload!.orgId,
                  organizationName: payload!.orgName,
                })
              await trickProcess(requestBody)
            })()

            await Promise.all([updatePromise, generateAndProcessPromise])

            return { message: 'Update Success' }
          } catch (e) {
            return error(500, e)
          }
        },
        {
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
            const generateAndProcessPromise = (async () => {
              const requestBody: videoModel.RequestPythonDetection =
                await generateSessionFolderPath({
                  videoSessionId: body.videoSessionId,
                  organizationId: payload!.orgId,
                  organizationName: payload!.orgName,
                })
              await trickProcess(requestBody)
            })()

            await Promise.all([generateAndProcessPromise])

            return { message: 'Update Success' }
          } catch (e) {
            return error(500, e)
          }
        },
        {
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

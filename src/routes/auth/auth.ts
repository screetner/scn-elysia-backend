import { Elysia } from 'elysia'
import { accessTokenExpire, findUser } from './auth-services'
import { JWTPayload, LoginBody } from '@/models/auth'
import { CustomResponse } from '@/custom/Response'
import { rolePermission } from '@/models/role'
import sendLog from '@/libs/log'
import { refreshToken } from '@/routes/auth/refreshToken'
import { redisClient } from '@/libs/redisClient'
import { getUserPermission } from '@/middleware/checkPermissions'

export const auth = (app: Elysia) =>
  app.group('auth', app => {
    return app.use(refreshToken).post(
      '/login',
      async ({ body, error, jwtAccess, jwtRefresh, jwtTusd }) => {
        try {
          const user = await findUser(body)

          if (!user) return error(401, 'Unauthorized')

          const isCorrect = await Bun.password.verify(
            body.password,
            user.password,
          )

          if (!isCorrect) {
            sendLog({
              userId: user.userId,
              description: 'Login',
              status: false,
            })

            return error(401, 'Unauthorized')
          }

          const isOwner =
            user.role.organization.name === process.env.OWNER_ORGANIZATION_NAME!

          const payload: JWTPayload = {
            userId: user.userId,
            username: user.username,
            roleId: user.role.roleId,
            roleName: user.role.roleName,
            abilityScope: user.role.abilityScope as rolePermission,
            email: user.email,
            orgId: user.role.organizationId,
            orgName: user.role.organization.name,
            isOwner,
          }

          const result = {
            user: {
              accessToken: await jwtAccess.sign(payload),
              userId: payload.userId,
              username: payload.username,
              email: payload.email,
              roleName: payload.roleName,
              orgName: payload.orgName,
              accessTokenExpiry: accessTokenExpire(60),
              refreshToken: await jwtRefresh.sign(payload),
              refreshTokenExpiry: accessTokenExpire(60 * 60 * 24 * 7),
              tusdToken: await jwtTusd.sign(payload),
              tusdTokenExpiry: accessTokenExpire(60 * 60 * 24 * 7),
              isOwner,
            },
          }

          sendLog({
            userId: user.userId,
            description: 'Login',
            status: true,
          })

          redisClient.hset('user:role', payload.userId, payload.roleId)
          redisClient.hset(
            'role:permission',
            payload.roleId,
            JSON.stringify(payload.abilityScope),
          )
          await getUserPermission(payload.userId)

          return CustomResponse.ok(result).toStandardResponse()
        } catch (e) {
          return error(500, e)
        }
      },
      {
        body: LoginBody,
        detail: {
          title: 'Login',
          description: 'Login to the system',
          tags: ['Auth'],
        },
      },
    )
  })

import { Elysia } from 'elysia'
import {
  jwtAccessSetup,
  jwtInviteSetup,
  jwtRefreshSetup,
  jwtTusdSetup,
} from '@/routes/auth/setup'
import { JWTInvitePayload, JWTPayload } from '@/models/auth'
import { checkPermission } from '@/middleware/checkPermissions'

// @ts-ignore
const checkImproperToken = async (
  token: string | undefined,
  tokenType: string,
  set: any,
  jwtVerifier: any,
) => {
  if (!token) {
    set.status = 401
    throw Error(`${tokenType} is missing`)
  }
  const payload: JWTPayload = await jwtVerifier.verify(token)
  if (!payload) {
    set.status = 403
    throw Error(`${tokenType} is invalid`)
  }
  return { payload }
}

// @ts-ignore
const checkImproperInviteToken = async (
  token: string | undefined,
  tokenType: string,
  set: any,
  jwtVerifier: any,
) => {
  if (!token) {
    set.status = 401
    throw Error(`${tokenType} is missing`)
  }
  const payload: JWTInvitePayload = await jwtVerifier.verify(token)
  if (!payload) {
    set.status = 403
    throw Error(`${tokenType} is invalid`)
  }
  return { payload }
}

export const checkAccessToken = (app: Elysia) =>
  app
    .use(jwtAccessSetup)
    .derive(async function handler({ jwtAccess, set, request: { headers } }) {
      const token = headers.get('Authorization')?.split(' ')[1]
      return checkImproperToken(token, 'Access token', set, jwtAccess)
    })
    .macro(({ onBeforeHandle }) => ({
      permission(requiredPermissions?: Record<string, any>) {
        onBeforeHandle(async (context: any) => {
          const payload: JWTPayload = context.payload!

          if (requiredPermissions) {
            const hasPermission = await checkPermission(
              requiredPermissions,
              payload,
            )

            if (!hasPermission) {
              context.set.status = 401
              throw new Error('Not enough permission')
            }
          }
        })
      },
    }))

export const checkRefreshToken = (app: Elysia) =>
  app.use(jwtRefreshSetup).derive(async function handler({
    jwtRefresh,
    set,
    request: { headers },
  }) {
    const token = headers.get('AuthorizationRefresh')?.split(' ')[1]
    return checkImproperToken(token, 'Refresh token', set, jwtRefresh)
  })

export const checkTusdToken = (app: Elysia) =>
  app.use(jwtTusdSetup).derive(async function handler({
    jwtTusd,
    set,
    request: { headers },
  }) {
    const token = headers.get('AuthorizationTusd')?.split(' ')[1]
    return checkImproperToken(token, 'Tusd token', set, jwtTusd)
  })

export const checkInviteToken = (app: Elysia) =>
  app.use(jwtInviteSetup).derive(async function handler({
    jwtInvite,
    set,
    request: { headers },
  }) {
    const token = headers.get('AuthorizationRegister')?.split(' ')[1]
    return checkImproperInviteToken(token, 'Invite token', set, jwtInvite)
  })

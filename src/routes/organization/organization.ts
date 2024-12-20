import { Elysia } from 'elysia'
import { checkAccessToken } from '@/middleware/jwtRequire'
import {
  createOrganization,
  getAllOrganization,
  getInviteList,
  getOrganizationInformation,
} from '@/routes/organization/organization-service'
import {
  createOrganizationBody,
  inviteOrganizationBody,
  organizationData,
  organizationInformation,
} from '@/models/organization'
import {
  addInviteToDatabase,
  checkEmailExist,
  sendInviteEmail,
} from '@/routes/member/member-service'
import { sendInviteToken } from '@/models/member'
import { jwtInviteSetup } from '@/routes/auth/setup'
import { getAdminId } from '@/routes/role/role-service'

export const organization = (app: Elysia) =>
  app.group('organization', app => {
    return app
      .use(checkAccessToken)
      .use(jwtInviteSetup)
      .get(
        '/all',
        async ({ error, payload }) => {
          try {
            if (!payload.isOwner) return error(401, 'Unauthorized')

            const response: organizationData[] = await getAllOrganization()

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get Organization Information',
            tags: ['Organization'],
          },
        },
      )
      .get(
        '/information/:orgId',
        async ({ error, params, payload }) => {
          try {
            if (!payload.isOwner) return error(401, 'Unauthorized')

            const orgId = params.orgId

            const response: organizationInformation =
              await getOrganizationInformation(orgId)

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get Organization Information',
            tags: ['Organization'],
          },
        },
      )
      .post(
        '/create',
        async ({ error, payload, body, jwtInvite }) => {
          try {
            if (!payload.isOwner) return error(401, 'Unauthorized')

            await checkEmailExist(body.adminEmail)
            const data = await createOrganization(body.orgName)

            const sendInviteTokens: sendInviteToken[] = []
            await Promise.all(
              body.adminEmail.map(async email => {
                const token = await jwtInvite.sign({
                  email,
                  orgId: data.orgId,
                  roleId: data.adminRoleId,
                })
                sendInviteTokens.push({ email, token })
              }),
            )

            await Promise.all([
              addInviteToDatabase(payload.userId, data.orgId, sendInviteTokens),
              sendInviteEmail(sendInviteTokens),
            ])
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Create Organization',
            tags: ['Organization'],
          },
          body: createOrganizationBody,
        },
      )
      .post(
        '/invite-admin',
        async ({ error, payload, body, jwtInvite }) => {
          try {
            if (!payload.isOwner) return error(401, 'Unauthorized')

            await checkEmailExist(body.adminEmail)

            const adminId = await getAdminId(body.orgId)

            const sendInviteTokens: sendInviteToken[] = []
            await Promise.all(
              body.adminEmail.map(async email => {
                const token = await jwtInvite.sign({
                  email,
                  orgId: payload.orgId,
                  roleId: adminId,
                })
                sendInviteTokens.push({ email, token })
              }),
            )

            await Promise.all([
              addInviteToDatabase(
                payload.userId,
                payload.orgId,
                sendInviteTokens,
              ),
              sendInviteEmail(sendInviteTokens),
            ])
          } catch (e) {
            return error(500, e)
          }
        },
        {
          permission: {
            web: {
              member: {
                invite: true,
              },
            },
          },
          detail: {
            description: 'Invite member to organization',
            tags: ['Organization'],
          },
          body: inviteOrganizationBody,
        },
      )
      .get(
        '/invite-list',
        async ({ error, payload }) => {
          try {
            const response = await getInviteList(payload.orgId)

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get Invite List',
            tags: ['Organization'],
          },
        },
      )
  })

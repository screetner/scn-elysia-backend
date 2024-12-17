import { Elysia } from 'elysia'
import { checkAccessToken } from '@/middleware/jwtRequire'
import {
  assignRole,
  changeRoleName,
  createRole,
  deleteRole,
  getRoleInformation,
  getRoleOrganization,
  getUnassignedRole,
  unassignRole,
  updateRolePermission,
} from '@/routes/role/role-service'
import {
  AssignRoleBody,
  RoleIdParams,
  updateRoleUser,
  roleInOrg,
  roleManagement,
  roleMemberInformation,
  UnassignRoleBody,
  UpdateRoleName,
  updateRoleName,
  roleInformation,
  UpdateRolePermission,
} from '@/models/role'

export const role = (app: Elysia) =>
  app.group('role', app => {
    return app
      .use(checkAccessToken)
      .get(
        '/',
        async ({ error, payload }) => {
          try {
            const response: roleInOrg[] = await getRoleOrganization(
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description:
              'Get All Role Organization for Organization and Members foreach Role',
            tags: ['Role'],
          },
        },
      )
      .get(
        '/org/:orgId',
        async ({ error, params, payload }) => {
          try {
            const orgId = params.orgId

            if (!payload.isOwner) return error(401, 'Unauthorized')

            const response: roleInOrg[] = await getRoleOrganization(orgId)

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description:
              'Get All Role Organization for Organization and Members foreach Role by OrganizationId',
            tags: ['Role'],
          },
        },
      )
      .get(
        '/option',
        async ({ error, payload }) => {
          try {
            const response: roleInOrg[] = await getRoleOrganization(
              payload!.orgId,
            )
            const result = response.map(role => {
              return {
                label: role.roleName,
                value: role.roleId,
              }
            })

            if (!result) return error(401, 'Unauthorized')

            return result
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get All Role Organization for Organization',
            tags: ['Role'],
          },
        },
      )
      .get(
        '/unassigned',
        async ({ error, payload }) => {
          try {
            const response: roleMemberInformation[] = await getUnassignedRole(
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Get All Unassigned Role of users in Organization',
            tags: ['Role'],
          },
        },
      )
      .get(
        '/:roleId',
        async ({ error, params, payload }) => {
          try {
            const roleId = params.roleId
            const response: roleManagement = await getRoleInformation(
              roleId,
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description:
              'Get Role Information and Members Information by RoleId',
            tags: ['Role'],
          },
          params: RoleIdParams,
        },
      )
      .patch(
        '/assign-role',
        async ({ error, payload, body }) => {
          try {
            const response: updateRoleUser[] = await assignRole(
              body.userId,
              body.roleId,
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Assign Role to User',
            tags: ['Role'],
          },
          body: AssignRoleBody,
        },
      )
      .patch(
        '/unassign-role',
        async ({ error, payload, body }) => {
          try {
            const response: updateRoleUser = await unassignRole(
              body.userId,
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Unassign Role from User',
            tags: ['Role'],
          },
          body: UnassignRoleBody,
        },
      )
      .patch(
        '/update-role-name',
        async ({ error, payload, body }) => {
          try {
            if (!body.newName || body.newName.trim() === '') {
              return error(400, 'Role name cannot be empty')
            }

            const response: updateRoleName = await changeRoleName(
              body.roleId,
              body.newName,
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Update Role Name',
            tags: ['Role'],
          },
          body: UpdateRoleName,
        },
      )
      .delete(
        '/remove/:roleId',
        async ({ error, params, payload }) => {
          try {
            const roleId = params.roleId
            const response: roleInformation = await deleteRole(
              roleId,
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Remove Role from Organization',
            tags: ['Role'],
          },
          params: RoleIdParams,
        },
      )
      .post(
        '/new-role',
        async ({ error, payload }) => {
          try {
            const response: roleInformation = await createRole(payload!.orgId)

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Create New Role in Organization',
            tags: ['Role'],
          },
        },
      )
      .put(
        '/permission',
        async ({ error, payload, body }) => {
          try {
            const response: roleInformation = await updateRolePermission(
              body.roleId,
              body.permission,
              payload!.orgId,
            )

            if (!response) return error(401, 'Unauthorized')

            return response
          } catch (e) {
            return error(500, e)
          }
        },
        {
          detail: {
            description: 'Update Role Permission in Organization by RoleId',
            tags: ['Role'],
          },
          body: UpdateRolePermission,
        },
      )
  })

import {Static, t} from 'elysia'

export interface roleInOrg {
    roleId: string,
    roleName: string,
    members: number,
}

export interface roleMemberInformation {
    userId: string,
    username: string,
    email: string,
}

export interface roleInformation {
    roleId: string,
    roleName: string,
}

export interface roleManagement {
    roleInfo: roleInformation,
    roleMembers: roleMemberInformation[],
    rolePermissions: rolePermission,
}

export interface updateRoleUser {
    userId: string,
}
export interface updateRoleName {
    roleId: string,
    oldName: string,
    newName: string,
}

export const DEFAULT_ROLE = 'Default';
export const NEW_ROLE = 'New Role';
export const DEFAULT_PERMISSION: rolePermission = {
    mobile: {
        access: true,
        videosProcess: false,
    },
    web: {
        access: true,
        manageGeometry: false,
        member: {
            invite: false,
        },
        role: {
            create: false,
            delete: false,
            managePermission: false,
            manageMember: false,
        }
    },
}

export const RoleIdParams = t.Object({
    roleId : t.String()
})

export const AssignRoleBody = t.Object({
    userId : t.Array(t.String()),
    roleId : t.String()
})

export const UnassignRoleBody = t.Object({
    userId : t.String()
})

export const UpdateRoleName = t.Object({
    roleId : t.String(),
    newName : t.String(),
})

export const permission = t.Object({
    mobile : t.Object({
        access : t.Boolean(),
        videosProcess : t.Boolean(),
    }),
    web : t.Object({
        access : t.Boolean(),
        manageGeometry : t.Boolean(),
        member : t.Object({
            invite : t.Boolean(),
        }),
        role : t.Object({
            create : t.Boolean(),
            delete : t.Boolean(),
            managePermission : t.Boolean(),
            manageMember : t.Boolean(),
        })
    })
})

export type rolePermission = Static<typeof permission>;

export const UpdateRolePermission = t.Object({
    roleId : t.String(),
    permission : permission
})

import {t} from 'elysia'

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

export interface rolePermission {
    mobile: {
        access: boolean,
        videosProcess: boolean,
    },
    web: {
        access: boolean,
        manageGeometry: boolean,
        roleSetting: boolean,
    },
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
        roleSetting: false,
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

export const UpdateRolePermission = t.Object({
    roleId : t.String(),
    permission : t.Object({
        mobile : t.Object({
            access : t.Boolean(),
            videosProcess : t.Boolean(),
        }),
        web : t.Object({
            access : t.Boolean(),
            manageGeometry : t.Boolean(),
            roleSetting : t.Boolean(),
        })
    })
})
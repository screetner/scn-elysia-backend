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

export const DEFAULT_ROLE = 'Default';

export const GetRoleInfoByRoleId = t.Object({
    roleId : t.String()
})
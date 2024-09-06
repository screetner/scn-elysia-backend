export interface roleInOrg {
    roleId: string,
    roleName: string,
    members: number,
}

export interface unassignedRole {
    userId: string,
    username: string,
    email: string,
}

export const DEFAULT_ROLE = 'Default';
import {t} from "elysia";

export interface organizationData {
    orgId: string,
    orgName: string,
    orgMember: number,
    orgAssets: number,
}

export interface createOrganizationResult {
    orgId: string,
    defaultRoleId: string,
    adminRoleId: string,
}

export const createOrganizationBody = t.Object({
    adminEmail: t.Array(t.String()),
    orgName: t.String(),
});

export const inviteOrganizationBody = t.Object({
    adminEmail: t.Array(t.String()),
    orgId: t.String(),
});
import {db} from "@/database/database";
import {count, eq} from "drizzle-orm";
import * as schemas from "@/database/schemas";
import * as role from "@/models/role";

export async function getRoleOrganization(organizationId: string): Promise<role.roleInOrg[]> {
    return db.select({
        roleId: schemas.roleTable.roleId,
        roleName: schemas.roleTable.roleName,
        members: count(schemas.userTable.userId).as('members'),
    })
        .from(schemas.roleTable)
        .leftJoin(schemas.userTable, eq(schemas.roleTable.roleId, schemas.userTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId))
        .groupBy(schemas.roleTable.roleId);
}

export async function getUnassignedRole(organizationId: string): Promise<role.roleMemberInformation[]> {
    return db.select({
        userId: schemas.userTable.userId,
        username: schemas.userTable.username,
        email: schemas.userTable.email,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.roleTable.roleId, schemas.userTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId) && eq(schemas.roleTable.roleName, role.DEFAULT_ROLE));
}

export async function getRoleInformation(roleId: string, organizationId: string): Promise<role.roleManagement> {
    const [roleInformation] = await db.select({
        roleId: schemas.roleTable.roleId,
        roleName: schemas.roleTable.roleName,
        abilityScope: schemas.roleTable.abilityScope,
    })
        .from(schemas.roleTable)
        .where(eq(schemas.roleTable.roleId, roleId) && eq(schemas.roleTable.organizationId, organizationId));

    if (!roleInformation) {
        throw new Error(`Role with ID ${roleId} not found in organization ${organizationId}`);
    }

    const roleMembers: role.roleMemberInformation[] = await db.select({
        userId: schemas.userTable.userId,
        username: schemas.userTable.username,
        email: schemas.userTable.email,
    })
        .from(schemas.userTable)
        .where(eq(schemas.userTable.roleId, roleId));

    const roleInfo: role.roleInformation = roleInformation as role.roleInformation;
    const rolePermissions: role.rolePermission = roleInformation.abilityScope as role.rolePermission;

    return {
        roleInfo,
        roleMembers,
        rolePermissions,
    };
}
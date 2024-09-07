import {db} from "@/database/database";
import {and, count, eq, inArray} from "drizzle-orm";
import * as schemas from "@/database/schemas";
import * as roleModel from "@/models/role";

export async function getRoleOrganization(organizationId: string): Promise<roleModel.roleInOrg[]> {
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

export async function getUnassignedRole(organizationId: string): Promise<roleModel.roleMemberInformation[]> {
    return db.select({
        userId: schemas.userTable.userId,
        username: schemas.userTable.username,
        email: schemas.userTable.email,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.roleTable.roleId, schemas.userTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId) && eq(schemas.roleTable.roleName, roleModel.DEFAULT_ROLE));
}

export async function getRoleInformation(roleId: string, organizationId: string): Promise<roleModel.roleManagement> {
    const [roleInformation] = await db.select({
        roleId: schemas.roleTable.roleId,
        roleName: schemas.roleTable.roleName,
        abilityScope: schemas.roleTable.abilityScope,
    })
        .from(schemas.roleTable)
        .where(and(eq(schemas.roleTable.roleId, roleId), eq(schemas.roleTable.organizationId, organizationId)));

    if (!roleInformation) {
        throw new Error(`Role with ID ${roleId} not found in organization ${organizationId}`);
    }

    const roleMembers: roleModel.roleMemberInformation[] = await db.select({
        userId: schemas.userTable.userId,
        username: schemas.userTable.username,
        email: schemas.userTable.email,
    })
        .from(schemas.userTable)
        .where(eq(schemas.userTable.roleId, roleId));

    return {
        roleInfo: roleInformation as roleModel.roleInformation,
        roleMembers,
        rolePermissions: roleInformation.abilityScope as roleModel.rolePermission,
    };
}

export async function assignRole(userIds: string[], roleId: string, organizationId: string): Promise<roleModel.roleAssign[]> {
    const [newRole] = await db.select({
        roleId: schemas.roleTable.roleId,
        organizationId: schemas.roleTable.organizationId,
    })
        .from(schemas.roleTable)
        .where(and(eq(schemas.roleTable.roleId, roleId), eq(schemas.roleTable.organizationId, organizationId)));

    if (!newRole) {
        throw new Error(`Role with ID ${roleId} not found`);
    }

    const userRoles = await db.select({
        roleId: schemas.userTable.roleId,
        roleName: schemas.roleTable.roleName,
        organizationId: schemas.roleTable.organizationId,
        username: schemas.userTable.username,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .where(inArray(schemas.userTable.userId, userIds));

    userRoles.forEach(userRole => {
        if (userRole.roleName !== roleModel.DEFAULT_ROLE) {
            throw new Error(`User ${userRole.username} already has a role assigned`);
        }
        if (userRole.organizationId !== newRole.organizationId) {
            throw new Error(`User ${userRole.username} is not part of the organization`);
        }
    });

    return db.update(schemas.userTable)
        .set({
            roleId: roleId,
        })
        .where(inArray(schemas.userTable.userId, userIds))
        .returning({userId: schemas.userTable.userId});
}
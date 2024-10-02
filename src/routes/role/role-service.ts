import {db} from "@/database/database";
import {and, count, eq, inArray, like, not, notExists} from "drizzle-orm";
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
        .where(and(eq(schemas.roleTable.organizationId, organizationId), eq(schemas.roleTable.roleName, roleModel.DEFAULT_ROLE)));
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

export async function assignRole(userIds: string[], roleId: string, organizationId: string): Promise<roleModel.updateRoleUser[]> {
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

export async function unassignRole(userId: string, organizationId: string): Promise<roleModel.updateRoleUser> {
    const [defaultRole] = await db.select({
        roleId: schemas.roleTable.roleId,
    })
        .from(schemas.roleTable)
        .where(and(eq(schemas.roleTable.organizationId, organizationId), eq(schemas.roleTable.roleName, roleModel.DEFAULT_ROLE)));

    if (!defaultRole) {
        throw new Error(`Default role not found in organization ${organizationId}`);
    }

    const [userData] = await db.select({
        userId: schemas.userTable.userId,
        username: schemas.userTable.username,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .where(and(
            eq(schemas.userTable.userId, userId),
            not(eq(schemas.userTable.roleId, defaultRole.roleId)),
            eq(schemas.roleTable.organizationId, organizationId),
        ));

    if (!userData) {
        throw new Error(`User ${userId} not found or already has the default role`);
    }

    const [updatedUser] = await db.update(schemas.userTable)
        .set({
            roleId: defaultRole.roleId,
        })
        .where(eq(schemas.userTable.userId, userId))
        .returning({ userId: schemas.userTable.userId });

    return updatedUser;
}

export async function changeRoleName(roleId: string, roleName: string, organizationId: string): Promise<roleModel.updateRoleName> {
    const [role] = await db.select({
        roleId: schemas.roleTable.roleId,
        roleName: schemas.roleTable.roleName,
    })
        .from(schemas.roleTable)
        .where(and(
            eq(schemas.roleTable.roleId, roleId),
            eq(schemas.roleTable.organizationId, organizationId),
            not(eq(schemas.roleTable.roleName, roleModel.DEFAULT_ROLE)),
            not(eq(schemas.roleTable.roleName, roleModel.ADMIN_ROLE)),
        ));

    if (!role) {
        throw new Error(`Role '${roleName}' not found in your organization`);
    }

    const [newName] = await db.update(schemas.roleTable)
        .set({
            roleName,
        })
        .where(eq(schemas.roleTable.roleId, roleId))
        .returning({ roleName: schemas.roleTable.roleName });

    return {
        roleId: roleId,
        oldName: role.roleName,
        newName: newName.roleName,
    };
}

export async function deleteRole(roleId: string, organizationId: string): Promise<roleModel.roleInformation> {
    const [role] = await db.select({
        roleId: schemas.roleTable.roleId,
        roleName: schemas.roleTable.roleName,
    })
        .from(schemas.roleTable)
        .where(and(
            eq(schemas.roleTable.roleId, roleId),
            eq(schemas.roleTable.organizationId, organizationId),
            notExists(
                db.select()
                    .from(schemas.userTable)
                    .where(eq(schemas.userTable.roleId, roleId))
            ),
        ));

    if (!role) {
        throw new Error(`Role with ID ${roleId} not found in organization ${organizationId} or has users assigned`);
    }

    await db.delete(schemas.roleTable)
        .where(eq(schemas.roleTable.roleId, roleId));

    return role;
}

export async function createRole(organizationId: string): Promise<roleModel.roleInformation> {
    let roleName = roleModel.NEW_ROLE;

    const existingRoles = await db.select({
        roleName: schemas.roleTable.roleName,
    })
        .from(schemas.roleTable)
        .where(and(
            eq(schemas.roleTable.organizationId, organizationId),
            like(schemas.roleTable.roleName, `${roleModel.NEW_ROLE}%`)
        ));

    if (existingRoles.length > 0) {
        const suffix = existingRoles.length;
        roleName = `${roleModel.NEW_ROLE} ${suffix}`;
    }

    const [newRole] = await db.insert(schemas.roleTable)
        .values({
            organizationId,
            roleName,
            abilityScope: roleModel.DEFAULT_PERMISSION,
        })
        .returning({ roleId: schemas.roleTable.roleId, roleName: schemas.roleTable.roleName });

    return newRole;
}

export async function updateRolePermission(roleId: string, permission: roleModel.rolePermission, organizationId: string): Promise<roleModel.roleInformation> {
    const [role] = await db.select({
        roleId: schemas.roleTable.roleId,
        roleName: schemas.roleTable.roleName,
    })
        .from(schemas.roleTable)
        .where(and(
            eq(schemas.roleTable.roleId, roleId),
            eq(schemas.roleTable.organizationId, organizationId),
        ));

    if (!role) {
        throw new Error(`Role with ID ${roleId} not found in organization ${organizationId}`);
    }

    await db.update(schemas.roleTable)
        .set({
            abilityScope: permission,
        })
        .where(eq(schemas.roleTable.roleId, roleId));

    return role;
}
import {db} from "@/database/database";
import {count, eq} from "drizzle-orm";
import * as schemas from "@/database/schemas";
import {DEFAULT_ROLE} from "@/models/role";

export async function getRoleOrganization(organizationId: string) {
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

export async function getUnassignedRole(organizationId: string) {
    return db.select({
        userId: schemas.userTable.userId,
        username: schemas.userTable.username,
        email: schemas.userTable.email,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.roleTable.roleId, schemas.userTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId) && eq(schemas.roleTable.roleName, DEFAULT_ROLE));
}
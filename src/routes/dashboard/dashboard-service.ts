import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {and, count, eq} from "drizzle-orm";

export async function countMembers(organizationId: string): Promise<number> {
    return db.select({})
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId))
        .then((res) => res.length);
}

export async function countInvites(organizationId: string) {
    return db.select({
        inviteTotal: count(schemas.inviteTable.inviteId).as('inviteTotal'),
        inviteActivate: count(schemas.inviteTable.activatedAt).as('inviteActivate'),
    })
        .from(schemas.inviteTable)
        .where(eq(schemas.inviteTable.organizationId, organizationId));
}

export async function countAdmins(organizationId: string): Promise<number> {
    return db.select({})
        .from(schemas.roleTable)
        .where(and(eq(schemas.roleTable.organizationId, organizationId), eq(schemas.roleTable.roleName, 'Admin')))
        .then((res) => res.length);
}
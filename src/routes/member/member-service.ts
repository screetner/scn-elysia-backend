import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {desc, eq} from "drizzle-orm";
import * as memberModel from "@/models/member";

export async function getRecentMember(organizationId: string, limit: number): Promise<memberModel.getRecentMember[]> {
    return db.select({
        userId: schemas.userTable.userId,
        userName: schemas.userTable.username,
        email: schemas.userTable.email,
        roleName: schemas.roleTable.roleName,
        createdAt: schemas.userTable.createdAt,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId))
        .orderBy(desc(schemas.userTable.createdAt))
        .limit(limit);
}
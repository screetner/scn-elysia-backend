import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {and, eq, isNotNull} from "drizzle-orm";  // ตรวจสอบว่า isNotNull มีการ import อย่างถูกต้อง
import * as dashboardModel from "@/models/dashboard";

export async function getDashboardInformation(organizationId: string): Promise<dashboardModel.dashboardInformation> {
    const [members, inviteTotal, inviteActivate, admin] = await Promise.all([
        db.select({})
            .from(schemas.userTable)
            .leftJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
            .where(eq(schemas.roleTable.organizationId, organizationId))
            .then((res) => res.length),

        db.select({})
            .from(schemas.inviteTable)
            .where(eq(schemas.inviteTable.organizationId, organizationId))
            .then((res) => res.length),

        db.select({})
            .from(schemas.inviteTable)
            .where(and(eq(schemas.inviteTable.organizationId, organizationId), isNotNull(schemas.inviteTable.activatedAt)))
            .then((res) => res.length),

        db.select({})
            .from(schemas.roleTable)
            .where(and(eq(schemas.roleTable.organizationId, organizationId), eq(schemas.roleTable.roleName, 'Admin')))
            .then((res) => res.length)
    ]);

    return {
        members,
        inviteTotal,
        inviteActivate,
        admin,
    };
}
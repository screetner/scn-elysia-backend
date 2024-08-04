import { db } from "@/database/database";
import { organizationTable, roleTable, userTable } from "@/database/schemas";
import {password} from "bun";
import {eq} from "drizzle-orm";

export const createMockData = async () => {
    let organizationId: string, roleId: string, userId: string

    const org = await db.transaction(async (trx) => {
        const organizationIdPromise = db.insert(organizationTable).values({
                name: "Mock Organization",
            })
            .$returningId()

        organizationId = (await organizationIdPromise)[0].organizationId

        return trx.query.organizationTable.findFirst({
            where: eq(organizationTable.organizationId, organizationId),
        });
    });

    const role = await db.transaction(async (trx) => {
        const roleIdPromise = db.insert(roleTable).values({
            organizationId: organizationId,
            roleName: "Admin",
            abilityScope: {canCreate: true, canRead: true, canUpdate: true, canDelete: true},
            })
            .$returningId();

        roleId = (await roleIdPromise)[0].roleId;

        return trx.query.roleTable.findFirst({
            where: eq(roleTable.roleId, roleId),
        });
    });

    const user = await db.transaction(async (trx) => {
        const userIdPromise = db.insert(userTable).values({
                roleId: roleId,
                email: "admin@aujung.me",
                username: "admin",
                password: await password.hash("admin", "bcrypt"),
            })
            .$returningId();

        userId = (await userIdPromise)[0].userId;

        return trx.query.userTable.findFirst({
            where: eq(userTable.userId, userId),
        });
    });

    return {
        organization: org,
        role: role,
        user: user
    }
};

export const clearMockData = async () => {
    const user = await db.delete(userTable)
    const role = await db.delete(roleTable)
    const org = await db.delete(organizationTable)

    return {
        user: user,
        role: role,
        org: org
    }
}
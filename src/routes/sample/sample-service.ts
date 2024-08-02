import { db } from "@/database/database";
import { organizationTable, roleTable, userTable } from "@/database/schemas";
import {password} from "bun";

export const createMockData = async () => {
    const [org] = await db.insert(organizationTable).values({
        name: "Mock Organization",
    }).returning({id: organizationTable.organizationId});

    const [role] = await db.insert(roleTable).values({
        organizationId: org.id,
        roleName: "Admin",
        abilityScope: {canCreate: true, canRead: true, canUpdate: true, canDelete: true},
    }).returning({id: roleTable.roleId});

    const [user] = await db.insert(userTable).values({
        roleId: role.id,
        email: "admin@aujung.me",
        username: "admin",
        password: await password.hash("admin", "bcrypt"),
    }).returning({id: userTable.userId});

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
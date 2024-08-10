import { db } from "@/database/database";
import * as schemas from "@/database/schemas";
import {password} from "bun";

export const createMockData = async () => {
    const [org] = await db.insert(schemas.organizationTable).values({
        name: "Mock Organization",
    }).returning({id: schemas.organizationTable.organizationId});

    const [role] = await db.insert(schemas.roleTable).values({
        organizationId: org.id,
        roleName: "Admin",
        abilityScope: {canCreate: true, canRead: true, canUpdate: true, canDelete: true},
    }).returning({id: schemas.roleTable.roleId});

    const [user] = await db.insert(schemas.userTable).values({
        roleId: role.id,
        email: "admin@aujung.me",
        username: "admin",
        password: await password.hash("admin", "bcrypt"),
    }).returning({id: schemas.userTable.userId});

    const [assetType] = await db.insert(schemas.assetTypeTable).values({
        assetType: 'billboard'
    }).returning({id: schemas.assetTypeTable.assetTypeId});

    const [asset] = await db.insert(schemas.assetTable).values({
        geoCoordinate: [18.788, 98.986],
        assetTypeId: assetType.id,
        imageFileLink: 'https://placehold.co/600x400',
        recordedUser: user.id,
        recordedAt: new Date()
    }).returning({id: schemas.assetTable.assetId})

    return {org, role, user, assetType, asset}
};

export const clearMockData = async () => {
    const asset = await db.delete(schemas.assetTable)
    const assetType = await db.delete(schemas.assetTypeTable)
    const user = await db.delete(schemas.userTable)
    const role = await db.delete(schemas.roleTable)
    const org = await db.delete(schemas.organizationTable)
    return {user, role, org, assetType, asset}
}
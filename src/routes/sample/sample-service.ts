import { db } from "@/database/database";
import * as schemas from "@/database/schemas";
import {password} from "bun";
import {DEFAULT_PERMISSION, DEFAULT_ROLE} from "@/models/role";

export const createMockData = async () => {
    const [org] = await db.insert(schemas.organizationTable).values({
        name: "Mock Organization",
    }).returning({id: schemas.organizationTable.organizationId});

    const [ownerOrg] = await db.insert(schemas.organizationTable).values({
        name: process.env.OWNER_ORGANIZATION_NAME!,
    }).returning({id: schemas.organizationTable.organizationId});

    const [defaultRole] = await db.insert(schemas.roleTable).values({
        organizationId: org.id,
        roleName: DEFAULT_ROLE,
        abilityScope: DEFAULT_PERMISSION,
    }).returning({id: schemas.roleTable.roleId});

    const [ownerDefaultRole] = await db.insert(schemas.roleTable).values({
        organizationId: ownerOrg.id,
        roleName: DEFAULT_ROLE,
        abilityScope: DEFAULT_PERMISSION,
    }).returning({id: schemas.roleTable.roleId});

    const [role] = await db.insert(schemas.roleTable).values({
        organizationId: org.id,
        roleName: "Admin",
        abilityScope: DEFAULT_PERMISSION,
    }).returning({id: schemas.roleTable.roleId});

    const [ownerRole] = await db.insert(schemas.roleTable).values({
        organizationId: ownerOrg.id,
        roleName: "Admin",
        abilityScope: DEFAULT_PERMISSION,
    }).returning({id: schemas.roleTable.roleId});

    const [user] = await db.insert(schemas.userTable).values({
        roleId: role.id,
        email: "admin@aujung.me",
        username: "admin",
        password: await password.hash("admin", "bcrypt"),
    }).returning({id: schemas.userTable.userId});

    const [ownerUser] = await db.insert(schemas.userTable).values({
        roleId: ownerRole.id,
        email: "owner@aujung.me",
        username: "owner",
        password: await password.hash("owner", "bcrypt"),
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

    return {org, ownerOrg, defaultRole, ownerDefaultRole, role, ownerRole, user, ownerUser, assetType, asset}
};

export const clearMockData = async () => {
    const invite = await db.delete(schemas.inviteTable)
    const asset = await db.delete(schemas.assetTable)
    const assetType = await db.delete(schemas.assetTypeTable)
    const user = await db.delete(schemas.userTable)
    const role = await db.delete(schemas.roleTable)
    const org = await db.delete(schemas.organizationTable)
    return {user, role, org, assetType, asset, invite}
}
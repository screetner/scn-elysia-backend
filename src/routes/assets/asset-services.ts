import {db} from "@/database/database";
import {eq, inArray} from "drizzle-orm";
import * as schemas from "@/database/schemas";

export async function findAssetById(assetId: string) {
    return db.query.assetTable.findFirst({
        where : eq(schemas.assetTable.assetId, assetId)
    });
}

export async function findAssetsByIds(assetIds: string[]) {
    return db.query.assetTable.findMany({
        where: inArray(schemas.assetTable.assetId, assetIds)
    });
}

export async function findAssetsByOrgId(orgId: string) {
    return db.select({
        assetId: schemas.assetTable.assetId,
        geoCoordinate: schemas.assetTable.geoCoordinate,
        assetType: schemas.assetTypeTable.assetType,
        recordedUser: schemas.userTable.username,
        organizationName: schemas.organizationTable.name,
    })
        .from(schemas.assetTable)
        .innerJoin(schemas.userTable, eq(schemas.assetTable.recordedUser, schemas.userTable.userId))
        .innerJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .innerJoin(schemas.organizationTable, eq(schemas.roleTable.organizationId, schemas.organizationTable.organizationId))
        .innerJoin(schemas.assetTypeTable, eq(schemas.assetTable.assetTypeId, schemas.assetTypeTable.assetTypeId))
        .where(eq(schemas.organizationTable.organizationId, orgId));
}

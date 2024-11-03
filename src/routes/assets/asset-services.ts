import {db} from "@/database/database";
import {count, eq, inArray} from "drizzle-orm";
import * as schemas from "@/database/schemas";
import * as process from "node:process";
import {
    DataLakeSASPermissions,
    generateDataLakeSASQueryParameters,
    StorageSharedKeyCredential
} from "@azure/storage-file-datalake";

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

export async function countAssetsByOrgId(orgId: string) {
    return db.select({
        total: count(schemas.assetTable.assetId).as('total')
    })
        .from(schemas.assetTable)
        .innerJoin(schemas.userTable, eq(schemas.assetTable.recordedUser, schemas.userTable.userId))
        .innerJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .innerJoin(schemas.organizationTable, eq(schemas.roleTable.organizationId, schemas.organizationTable.organizationId))
        .innerJoin(schemas.assetTypeTable, eq(schemas.assetTable.assetTypeId, schemas.assetTypeTable.assetTypeId))
        .where(eq(schemas.organizationTable.organizationId, orgId));
}

export async function generateSAS(dirName : string){
    const accountName = process.env.AZURE_ACCOUNT_NAME || "";
    const accountKey = process.env.AZURE_ACCOUNT_KEY || "";

    const containerName = process.env.AZURE_CONTAINER_NAME || "";

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes());
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const permissions = new DataLakeSASPermissions();
    permissions.read = true;

    // Generate the SAS token
    const sasQueryParameter = generateDataLakeSASQueryParameters({
        fileSystemName: containerName,
        pathName: dirName,
        isDirectory: true,
        startsOn: startDate,
        expiresOn: expiryDate,
        permissions: permissions,
    }, sharedKeyCredential)

    return sasQueryParameter.toString()
}

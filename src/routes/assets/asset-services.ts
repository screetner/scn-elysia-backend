import { db } from '@/database/database'
import { and, count, eq, sql } from 'drizzle-orm'
import * as schemas from '@/database/schemas'
import * as process from 'node:process'
import {
  DataLakeSASPermissions,
  generateDataLakeSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-file-datalake'
import * as assetModel from '@/models/asset'
import { getSAS } from '@/routes/organization/organization-service'
import { BlobClient } from '@azure/storage-blob'

export async function findAssetByIds(
  assetId: string,
): Promise<assetModel.assetData> {
  const [result] = await db
    .select({
      assetId: schemas.assetTable.assetId,
      geoCoordinate: schemas.assetTable.geoCoordinate,
      assetType: schemas.assetTypeTable.assetType,
      imageUrl: schemas.assetTable.imageFileLink,
      recordedUser: schemas.userTable.username,
      recordedAt: schemas.assetTable.recordedAt,
    })
    .from(schemas.assetTable)
    .innerJoin(
      schemas.assetTypeTable,
      eq(schemas.assetTable.assetTypeId, schemas.assetTypeTable.assetTypeId),
    )
    .innerJoin(
      schemas.userTable,
      eq(schemas.assetTable.recordedUser, schemas.userTable.userId),
    )
    .where(eq(schemas.assetTable.assetId, assetId))
  return result
}

export async function findAssetsByOrgId(
  orgId: string,
  inBorder: boolean = true,
) {
  return db
    .select({
      assetId: schemas.assetTable.assetId,
      geoCoordinate: schemas.assetTable.geoCoordinate,
      assetType: schemas.assetTypeTable.assetType,
      recordedUser: schemas.userTable.username,
      organizationName: schemas.organizationTable.name,
    })
    .from(schemas.assetTable)
    .innerJoin(
      schemas.userTable,
      eq(schemas.assetTable.recordedUser, schemas.userTable.userId),
    )
    .innerJoin(
      schemas.roleTable,
      eq(schemas.userTable.roleId, schemas.roleTable.roleId),
    )
    .innerJoin(
      schemas.organizationTable,
      eq(
        schemas.roleTable.organizationId,
        schemas.organizationTable.organizationId,
      ),
    )
    .innerJoin(
      schemas.assetTypeTable,
      eq(schemas.assetTable.assetTypeId, schemas.assetTypeTable.assetTypeId),
    )
    .where(
      inBorder
        ? and(
            sql`ST_Contains(
              ST_GeomFromEWKB(${schemas.organizationTable.border}),
              ST_SetSRID(ST_MakePoint(
              (${schemas.assetTable.geoCoordinate})[1],
              (${schemas.assetTable.geoCoordinate})[0]
              ), 4326)
              )`,
            eq(schemas.organizationTable.organizationId, orgId),
          )
        : eq(schemas.organizationTable.organizationId, orgId),
    )
}

export async function deleteAssetById(assetId: string, orgId: string) {
  try {
    const data = await findAssetByIds(assetId).then(data => {
      if (!data) throw new Error(`Asset with ID ${assetId} not found`)
      return data
    })

    const sasToken = await getSAS(orgId)
    const imageUrl = generateAssetImageUrl(sasToken, data).imageUrl

    const blobClient = new BlobClient(imageUrl)

    await blobClient.delete()

    await db
      .delete(schemas.assetTable)
      .where(eq(schemas.assetTable.assetId, assetId))
  } catch (e) {
    console.error(e)
  }
}

export async function countAssetsByOrgId(orgId: string) {
  return db
    .select({
      total: count(schemas.assetTable.assetId).as('total'),
    })
    .from(schemas.assetTable)
    .innerJoin(
      schemas.userTable,
      eq(schemas.assetTable.recordedUser, schemas.userTable.userId),
    )
    .innerJoin(
      schemas.roleTable,
      eq(schemas.userTable.roleId, schemas.roleTable.roleId),
    )
    .innerJoin(
      schemas.organizationTable,
      eq(
        schemas.roleTable.organizationId,
        schemas.organizationTable.organizationId,
      ),
    )
    .innerJoin(
      schemas.assetTypeTable,
      eq(schemas.assetTable.assetTypeId, schemas.assetTypeTable.assetTypeId),
    )
    .where(eq(schemas.organizationTable.organizationId, orgId))
}

export async function generateSAS(dirName: string) {
  const accountName = process.env.AZURE_ACCOUNT_NAME || ''
  const accountKey = process.env.AZURE_ACCOUNT_KEY || ''

  const containerName = process.env.AZURE_CONTAINER_NAME || ''

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey,
  )

  const startDate = new Date()
  startDate.setMinutes(startDate.getMinutes())
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 720)

  const permissions = new DataLakeSASPermissions()
  permissions.read = true
  permissions.delete = true

  // Generate the SAS token
  const sasQueryParameter = generateDataLakeSASQueryParameters(
    {
      fileSystemName: containerName,
      pathName: dirName,
      isDirectory: true,
      startsOn: startDate,
      expiresOn: expiryDate,
      permissions: permissions,
    },
    sharedKeyCredential,
  )

  return sasQueryParameter.toString()
}

export function generateAssetImageUrl(
  sas: string,
  assetData: assetModel.assetData,
): assetModel.assetData {
  return {
    ...assetData,
    imageUrl:
      (assetData.imageUrl = `${process.env.BLOB_BASE_PATH}${assetData.imageUrl}?${sas}`),
  }
}

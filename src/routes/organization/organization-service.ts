import { db } from '@/database/database'
import * as schemas from '@/database/schemas'
import { and, eq, not } from 'drizzle-orm'
import { countDistinct } from 'drizzle-orm/sql/functions/aggregate'
import * as OrgModel from '@/models/organization'
import {
  ADMIN_PERMISSION,
  ADMIN_ROLE,
  DEFAULT_PERMISSION,
  DEFAULT_ROLE,
} from '@/models/role'
import { OWNER_ORGANIZATION_NAME } from '@/models/organization'
import { generateSAS } from '@/routes/assets/asset-services'

export async function getAllOrganization(): Promise<
  OrgModel.organizationData[]
> {
  return db
    .select({
      orgId: schemas.organizationTable.organizationId,
      orgName: schemas.organizationTable.name,
      orgMember: countDistinct(schemas.userTable.userId),
      orgAssets: countDistinct(schemas.assetTable.assetId),
    })
    .from(schemas.organizationTable)
    .leftJoin(
      schemas.roleTable,
      eq(
        schemas.organizationTable.organizationId,
        schemas.roleTable.organizationId,
      ),
    )
    .leftJoin(
      schemas.userTable,
      eq(schemas.roleTable.roleId, schemas.userTable.roleId),
    )
    .leftJoin(
      schemas.assetTable,
      eq(schemas.userTable.userId, schemas.assetTable.recordedUser),
    )
    .where(not(eq(schemas.organizationTable.name, OWNER_ORGANIZATION_NAME)))
    .groupBy(
      schemas.organizationTable.organizationId,
      schemas.organizationTable.name,
    )
}

export async function createOrganization(
  name: string,
): Promise<OrgModel.createOrganizationResult> {
  const [existingOrg] = await db
    .select({
      orgId: schemas.organizationTable.organizationId,
    })
    .from(schemas.organizationTable)
    .where(eq(schemas.organizationTable.name, name))

  if (existingOrg) {
    throw new Error(`Organization with name ${name} already exists`)
  }

  const [org] = await db
    .insert(schemas.organizationTable)
    .values({ name })
    .returning({ id: schemas.organizationTable.organizationId })

  const [[defaultRole], [adminRole]] = await Promise.all([
    db
      .insert(schemas.roleTable)
      .values({
        organizationId: org.id,
        roleName: DEFAULT_ROLE,
        abilityScope: DEFAULT_PERMISSION,
      })
      .returning({ id: schemas.roleTable.roleId }),
    db
      .insert(schemas.roleTable)
      .values({
        organizationId: org.id,
        roleName: ADMIN_ROLE,
        abilityScope: ADMIN_PERMISSION,
      })
      .returning({ id: schemas.roleTable.roleId }),
  ])

  return {
    orgId: org.id,
    defaultRoleId: defaultRole.id,
    adminRoleId: adminRole.id,
  }
}

export async function getOrganizationInformation(
  orgId: string,
): Promise<OrgModel.organizationInformation> {
  const [organization] = await db
    .select({
      name: schemas.organizationTable.name,
      border: schemas.organizationTable.border,
      createdAt: schemas.organizationTable.createdAt,
      updatedAt: schemas.organizationTable.updatedAt,
    })
    .from(schemas.organizationTable)
    .where(eq(schemas.organizationTable.organizationId, orgId))

  return organization
}

export async function getInviteList(
  orgId: string,
): Promise<OrgModel.inviteData[]> {
  return db
    .select({
      inviterEmail: schemas.userTable.email,
      inviteeEmail: schemas.inviteTable.email,
      time: schemas.inviteTable.createdAt,
    })
    .from(schemas.inviteTable)
    .leftJoin(
      schemas.userTable,
      eq(schemas.inviteTable.userId, schemas.userTable.userId),
    )
    .where(eq(schemas.inviteTable.organizationId, orgId))
}

export async function getSAS(orgId: string): Promise<string> {
  const [sas] = await db
    .select({
      orgName: schemas.organizationTable.name,
      sas: schemas.organizationTable.sasToken,
      sasExpireDate: schemas.organizationTable.sasTokenExpireDate,
    })
    .from(schemas.organizationTable)
    .where(and(eq(schemas.organizationTable.organizationId, orgId)))

  const checkDate = new Date()

  if (sas.sasExpireDate && sas.sasExpireDate >= checkDate && sas.sas) {
    return sas.sas
  } else {
    checkDate.setHours(checkDate.getHours() + 720)
    const dirName = `${sas.orgName}_${orgId}`.replace(/ /g, '_')
    const sasToken = await generateSAS(dirName)
    await db
      .update(schemas.organizationTable)
      .set({
        sasToken: sasToken,
        sasTokenExpireDate: checkDate,
      })
      .where(and(eq(schemas.organizationTable.organizationId, orgId)))
    return sasToken
  }
}

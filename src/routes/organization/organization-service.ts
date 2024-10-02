import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {eq} from "drizzle-orm";
import {countDistinct} from "drizzle-orm/sql/functions/aggregate";
import * as OrgModel from "@/models/organization";

export async function getAllOrganization(): Promise<OrgModel.organizationData[]> {
    return db.select({
        orgId: schemas.organizationTable.organizationId,
        orgName: schemas.organizationTable.name,
        orgMember: countDistinct(schemas.userTable.userId),
        orgAssets: countDistinct(schemas.assetTable.assetId),
    })
        .from(schemas.organizationTable)
        .leftJoin(schemas.roleTable, eq(schemas.organizationTable.organizationId, schemas.roleTable.organizationId))
        .leftJoin(schemas.userTable, eq(schemas.roleTable.roleId, schemas.userTable.roleId))
        .leftJoin(schemas.assetTable, eq(schemas.userTable.userId, schemas.assetTable.recordedUser))
        .groupBy(
            schemas.organizationTable.organizationId,
            schemas.organizationTable.name
        );
}

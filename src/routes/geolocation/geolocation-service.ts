import {db} from "@/database/database";
import {eq, sql} from "drizzle-orm";
import {PostGeoBodyType} from "@/models/geolocation/geolocation";
import {PolygonType} from "@/database/customTypes"
import {organizationTable} from "@/database/schemas";

export async function postGeo(body: PostGeoBodyType, organizationId: string) {
    const border: PolygonType = body;

    return await db.transaction(async (trx) => {
        await trx.update(organizationTable)
            .set({ border })
            .where(eq(organizationTable.organizationId, organizationId))
            .execute();

        return trx.query.organizationTable.findFirst({
            columns: {
                organizationId: true,
            },
            where: eq(organizationTable.organizationId, organizationId),
        });
    });
}

export async function getGeo(organizationId: string) {
    return db.query.organizationTable.findFirst({
        columns: {
            border: true,
        },
        where: eq(organizationTable.organizationId, organizationId)
    });
}
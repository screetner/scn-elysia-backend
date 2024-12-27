import { db } from '@/database/database'
import { eq } from 'drizzle-orm'
import { PostGeoBodyType } from '@/models/geolocation'
import { organizationTable } from '@/database/schemas'

export async function postGeo(body: PostGeoBodyType, organizationId: string) {
  const border = body.length === 0 ? null : body

  return db
    .update(organizationTable)
    .set({ border })
    .where(eq(organizationTable.organizationId, organizationId))
    .returning({ id: organizationTable.organizationId })
}

export async function getGeo(organizationId: string) {
  const border = await db.query.organizationTable.findFirst({
    columns: {
      border: true,
    },
    where: eq(organizationTable.organizationId, organizationId),
  })
  return border?.border ?? []
}

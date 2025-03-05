import { db } from '@/database/database'
import * as schemas from '@/database/schemas'
import { and, count, eq, gte, lt } from 'drizzle-orm'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import * as dashboardModel from '@/models/dashboard'
import { ADMIN_ROLE } from '@/models/role'

export async function countMembers(
  organizationId: string,
): Promise<dashboardModel.memberInformation> {
  const currentDate = new Date()
  const currentMonthStart = startOfMonth(currentDate)
  const currentMonthEnd = endOfMonth(currentDate)

  const previousMonthDate = subMonths(currentDate, 1)
  const previousMonthStart = startOfMonth(previousMonthDate)
  const previousMonthEnd = endOfMonth(previousMonthDate)

  const allMembers = await db
    .select({})
    .from(schemas.userTable)
    .leftJoin(
      schemas.roleTable,
      eq(schemas.userTable.roleId, schemas.roleTable.roleId),
    )
    .where(eq(schemas.roleTable.organizationId, organizationId))
    .then(res => res.length)

  const currentMonthCount = await db
    .select({})
    .from(schemas.userTable)
    .leftJoin(
      schemas.roleTable,
      eq(schemas.userTable.roleId, schemas.roleTable.roleId),
    )
    .where(
      and(
        eq(schemas.roleTable.organizationId, organizationId),
        gte(schemas.userTable.createdAt, currentMonthStart),
        lt(schemas.userTable.createdAt, currentMonthEnd),
      ),
    )
    .then(res => res.length)

  const previousMonthCount = await db
    .select({})
    .from(schemas.userTable)
    .leftJoin(
      schemas.roleTable,
      eq(schemas.userTable.roleId, schemas.roleTable.roleId),
    )
    .where(
      and(
        eq(schemas.roleTable.organizationId, organizationId),
        gte(schemas.userTable.createdAt, previousMonthStart),
        lt(schemas.userTable.createdAt, previousMonthEnd),
      ),
    )
    .then(res => res.length)

  const percentageIncrease =
    previousMonthCount === 0
      ? 100
      : ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100

  return {
    allMembers,
    percentageIncrease,
  }
}

export async function countInvites(
  organizationId: string,
): Promise<dashboardModel.inviteInformation> {
  const [inviteData] = await db
    .select({
      inviteTotal: count(schemas.inviteTable.inviteId).as('inviteTotal'),
      inviteActivate: count(schemas.inviteTable.activatedAt).as(
        'inviteActivate',
      ),
    })
    .from(schemas.inviteTable)
    .where(eq(schemas.inviteTable.organizationId, organizationId))
  return inviteData
}

export async function countAdmins(organizationId: string): Promise<number> {
  const [adminCount] = await db
    .select({ count: count(schemas.userTable.userId) })
    .from(schemas.userTable)
    .innerJoin(
      schemas.roleTable,
      eq(schemas.userTable.roleId, schemas.roleTable.roleId),
    )
    .where(
      and(
        eq(schemas.roleTable.organizationId, organizationId),
        eq(schemas.roleTable.roleName, ADMIN_ROLE),
      ),
    )

  return adminCount.count
}

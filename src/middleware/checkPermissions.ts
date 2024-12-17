import { JWTPayload } from '@/models/auth'
import { rolePermission } from '@/models/role'
import { redisClient } from '@/libs/redisClient'
import { db } from '@/database/database'
import * as schemas from '@/database/schemas'
import { eq } from 'drizzle-orm'

type PermissionCheck = Partial<{
  [K in keyof rolePermission]: Partial<Record<keyof rolePermission[K], boolean>>
}>

export const checkPermissions = async (
  payload: JWTPayload,
  ...permissionSets: PermissionCheck[]
): Promise<boolean> => {
  if (!payload) {
    return false
  }

  let data = await getUserPermissionFromRedis(payload.userId)
  if (!data) {
    data = await getUserPermissionFromDB(payload.roleId)
    setUserPermissionToRedis(payload.userId, payload.roleId, data)
  }

  return permissionSets.every(permissionSet =>
    Object.entries(permissionSet).every(([category, permissions]) =>
      Object.entries(permissions).every(
        ([permission, required]) =>
          !required ||
          data[category as keyof rolePermission]?.[
            permission as keyof rolePermission[keyof rolePermission]
          ] === true,
      ),
    ),
  )
}

export async function getUserPermissionFromRedis(
  userId: string,
): Promise<rolePermission | null> {
  try {
    const luaScript = `
    local userRole = redis.call('HGET', 'user:role', ARGV[1])
    if userRole then
      return redis.call('HGET', 'role:permission', userRole)
    else
      return nil
    end
    `
    const permission = (await redisClient.eval(
      luaScript,
      0,
      userId,
    )) as unknown as string

    return permission ? (JSON.parse(permission) as rolePermission) : null
  } catch (e) {
    console.log(e)
    return null // Ensures a return value even on error
  }
}

async function getUserPermissionFromDB(
  roleId: string,
): Promise<rolePermission> {
  const [data] = await db
    .select({
      permission: schemas.roleTable.abilityScope,
    })
    .from(schemas.roleTable)
    .where(eq(schemas.roleTable.roleId, roleId))
  return data.permission as rolePermission
}

export async function setUserPermissionToRedis(
  userId: string,
  roleId: string,
  permission: rolePermission,
) {
  redisClient.hset('user:role', userId, roleId)
  redisClient.hset('role:permission', roleId, JSON.stringify(permission))
}

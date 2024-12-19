import { JWTPayload } from '@/models/auth'
import { rolePermission } from '@/models/role'
import { redisClient } from '@/libs/redisClient'
import { db } from '@/database/database'
import * as schemas from '@/database/schemas'
import { eq } from 'drizzle-orm'

export async function checkPermission(
  requiredPermissions: Record<string, any>,
  payload: JWTPayload,
): Promise<boolean> {
  if (!payload) return false
  if (!requiredPermissions) return true

  let userPermissions = await getUserPermissionFromRedis(payload.userId)
  if (!userPermissions) {
    userPermissions = await getUserPermissionFromDB(payload.roleId)
    setUserPermissionToRedis(payload.userId, payload.roleId, userPermissions)
  }

  return matchPermissions(requiredPermissions, userPermissions)
}

function matchPermissions(
  requiredPermissions: Record<string, any>,
  userPermissions: Record<string, any>,
): boolean {
  return Object.entries(requiredPermissions).every(([key, value]) => {
    if (typeof value === 'object') {
      return matchPermissions(value, userPermissions?.[key])
    }
    return userPermissions?.[key] === value
  })
}

async function getUserPermissionFromRedis(
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
    return null
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

import { JWTPayload } from '@/models/auth'
import { rolePermission } from '@/models/role'
import { redisClient } from '@/libs/redisClient'

type PermissionCheck = Partial<{
  [K in keyof rolePermission]: Partial<Record<keyof rolePermission[K], boolean>>
}>

export const checkPermissions = (
  payload: JWTPayload,
  ...permissionSets: PermissionCheck[]
): boolean => {
  if (!payload) {
    return false
  }

  return permissionSets.every(permissionSet =>
    Object.entries(permissionSet).every(([category, permissions]) =>
      Object.entries(permissions).every(
        ([permission, required]) =>
          !required ||
          payload.abilityScope[category as keyof rolePermission]?.[
            permission as keyof rolePermission[keyof rolePermission]
          ] === true,
      ),
    ),
  )
}

export async function getUserPermission(
  userId: string,
): Promise<string | null> {
  const luaScript = `
    local userRole = redis.call('HGET', 'user:role', ARGV[1])
    if userRole then
      return redis.call('HGET', 'role:permission', userRole)
    else
      return nil
    end
  `

  // Execute the Lua script
  const permission = await redisClient.eval(luaScript, 0, userId)
  console.log(permission)
  console.log(typeof permission)
  return null // Returns the permission or null if not found
}

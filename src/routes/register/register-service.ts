import { db } from '@/database/database'
import * as schemas from '@/database/schemas'
import { eq } from 'drizzle-orm'
import { JWTInvitePayload } from '@/models/auth'
import * as registerModel from '@/models/register'
import { password } from 'bun'

export async function checkMemberToken(token: string) {
  const [invite] = await db
    .select({
      token: schemas.inviteTable.token,
    })
    .from(schemas.inviteTable)
    .where(eq(schemas.inviteTable.token, token))

  if (!invite) {
    throw new Error(`Invite token ${token} not found`)
  }
}

export async function addNewMember(
  memberData: registerModel.register,
  jwtInvite: JWTInvitePayload,
  token: string,
) {
  try {
    const [userId] = await db
      .insert(schemas.userTable)
      .values({
        username: memberData.username,
        password: await password.hash(memberData.password, 'bcrypt'),
        email: jwtInvite.email,
        roleId: jwtInvite.roleId,
      })
      .returning({ userId: schemas.userTable.userId })

    await db
      .update(schemas.inviteTable)
      .set({
        activatedAt: new Date(),
      })
      .where(eq(schemas.inviteTable.token, token))

    return userId
  } catch (e: any) {
    throw Error(e.message)
  }
}

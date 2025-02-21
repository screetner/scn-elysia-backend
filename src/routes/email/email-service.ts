import { db } from '@/database/database'
import { eq, sql } from 'drizzle-orm'
import { ADMIN_ROLE } from '@/models/role'
import { sendEmailAlertMessage, sendEmailInviteMessage } from '@/libs/emailform'
import { errorMessage } from '@/models/python'
import * as schemas from '@/database/schemas'
import * as memberModel from '@/models/member'
import { subject } from '@/models/member'

export async function sendEmail(
  userId: string,
  isCanSend: boolean,
  videoSessionName?: string,
) {
  const result = await db.execute(sql`
        SELECT u2.email
        FROM users u1
                 JOIN roles r1 ON r1."roleId" = u1."roleId"
                 JOIN roles r2 ON r2."organizationId" = r1."organizationId"
                 JOIN users u2 ON u2."roleId" = r2."roleId"
        WHERE (u2."userId" = u1."userId" OR r2."roleName" = ${ADMIN_ROLE})
          AND u1."userId" = ${userId}
    `)

  if (isCanSend) {
    result.slice(0, result.count).map(row => {
      console.log(row.email)
      sendEmailAlertMessage(row.email as string, isCanSend)
    })
  } else {
    result.slice(0, result.count).map(row => {
      sendEmailAlertMessage(
        row.email as string,
        isCanSend,
        videoSessionName!,
        errorMessage,
      )
    })
  }
}

export async function uploadFailCase(videoSessionId: string) {
  const [data] = await db
    .select({
      videoSessionName: schemas.videoSessionTable.videoSessionName,
      userId: schemas.videoSessionTable.uploadUserId,
    })
    .from(schemas.videoSessionTable)
    .where(eq(schemas.videoSessionTable.videoSessionId, videoSessionId))

  await sendEmail(data.userId, false, data.videoSessionName)
}

export async function sendInviteEmail(
  sendInviteTokens: memberModel.sendInviteToken[],
) {
  await Promise.all(
    sendInviteTokens.map(async sendInviteToken => {
      const url =
        process.env.FN_URL! + `/en/register?token=${sendInviteToken.token}`
      await sendEmailInviteMessage(
        sendInviteToken.email,
        subject,
        url,
        sendInviteToken.token,
      )
    }),
  )
}

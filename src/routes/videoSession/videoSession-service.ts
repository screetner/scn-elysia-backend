import { videoSessionStateEnum } from '@/models/videoSession'
import { db } from '@/database/database'
import * as schemas from '@/database/schemas'
import { and, eq } from 'drizzle-orm'

export async function postVideoSession(
  userId: string,
  postData: {
    uploadProgress: number
    videoNames: string[]
    videoSessionName: string
  },
) {
  if (postData.uploadProgress < 0 || postData.uploadProgress > 100) {
    throw new Error(
      'Invalid input data: uploadProgress must be between 0 and 100',
    )
  }

  if (!Array.isArray(postData.videoNames) || postData.videoNames.length === 0) {
    throw new Error('Invalid input data: videoNames must be a non-empty array')
  }

  const [result] = await db
    .insert(schemas.videoSessionTable)
    .values({
      uploadUserId: userId,
      uploadProgress: postData.uploadProgress,
      videoNames: postData.videoNames,
      videoSessionName: postData.videoSessionName,
      state: videoSessionStateEnum.UPLOADING,
    })
    .returning({ videoSessionId: schemas.videoSessionTable.videoSessionId })

  return result
}

export async function updateVideoSession(
  videoSessionId: string,
  uploadProgress: number,
  state: videoSessionStateEnum,
  userId: string,
) {
  const [videoSession] = await db
    .select({
      state: schemas.videoSessionTable.state,
    })
    .from(schemas.videoSessionTable)
    .where(
      and(
        eq(schemas.videoSessionTable.videoSessionId, videoSessionId),
        eq(schemas.videoSessionTable.uploadUserId, userId),
      ),
    )

  if (!videoSession) {
    throw new Error(`Video session with ID ${videoSessionId} not found`)
  }

  const [result] = await updateVideoSessionHelper(
    videoSessionId,
    uploadProgress,
    state,
  )

  return result
}

export async function updateVideoSessionHelper(
  videoSessionId: string,
  uploadProgress: number,
  state: videoSessionStateEnum,
) {
  return db
    .update(schemas.videoSessionTable)
    .set({
      state,
      uploadProgress,
    })
    .where(eq(schemas.videoSessionTable.videoSessionId, videoSessionId))
    .returning({ videoSessionId: schemas.videoSessionTable.videoSessionId })
}

export async function removeVideoSession(videoSessionId: string) {
  const [videoSession] = await db
    .select({
      state: schemas.videoSessionTable.state,
    })
    .from(schemas.videoSessionTable)
    .where(and(eq(schemas.videoSessionTable.videoSessionId, videoSessionId)))

  if (!videoSession) {
    throw new Error(`Video session with ID ${videoSessionId} not found`)
  }

  if (videoSession.state !== videoSessionStateEnum.CAN_DELETE) {
    throw new Error(
      `Cannot remove video session with ID ${videoSessionId} because it is not in the '${videoSessionStateEnum.CAN_DELETE}' state`,
    )
  }

  await db
    .delete(schemas.videoSessionTable)
    .where(eq(schemas.videoSessionTable.videoSessionId, videoSessionId))

  return { videoSessionId }
}

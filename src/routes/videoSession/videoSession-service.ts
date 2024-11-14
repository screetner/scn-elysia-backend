import {postVideo, videoSessionStateEnum} from "@/models/videoSession";
import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {and, eq} from "drizzle-orm";

export async function postVideoSession(userId: string, data: postVideo) {
    const [result] = await db.insert(schemas.videoSessionTable).values({
        uploadUserId: userId,
        uploadProgress: data.uploadProgress,
        videoNames: data.videoNames,
        state: videoSessionStateEnum.UPLOADING,
    }).returning({ videoSessionId: schemas.videoSessionTable.videoSessionId });

    return result;
}

export async function updateVideoSession(videoSessionId: string, uploadProgress: number,state: videoSessionStateEnum, userId: string) {
    const [videoSession] = await db.select({
        state: schemas.videoSessionTable.state,
    })
        .from(schemas.videoSessionTable)
        .where(
            and(
                eq(schemas.videoSessionTable.videoSessionId, videoSessionId),
                eq(schemas.videoSessionTable.uploadUserId, userId)
            )
        );

    if (!videoSession) {
        throw new Error(`Video session with ID ${videoSessionId} not found`);
    }

    // if (videoSession.state === videoSessionStateEnum.CAN_DELETE) {
    //     throw new Error(`Cannot update video session with ID ${videoSessionId} because it is in the 'canDelete' state`);
    // }

    const [result] = await db.update(schemas.videoSessionTable)
        .set({
            state,
            uploadProgress,
        })
        .where(eq(schemas.videoSessionTable.videoSessionId, videoSessionId))
        .returning({ videoSessionId: schemas.videoSessionTable.videoSessionId });

    return result;
}

export async function removeVideoSession(videoSessionId: string, userId: string) {
    const [videoSession] = await db.select({
        state: schemas.videoSessionTable.state,
    })
        .from(schemas.videoSessionTable)
        .where(
            and(
                eq(schemas.videoSessionTable.videoSessionId, videoSessionId),
                eq(schemas.videoSessionTable.uploadUserId, userId)
            )
        );

    if (!videoSession) {
        throw new Error(`Video session with ID ${videoSessionId} not found`);
    }

    if (videoSession.state !== videoSessionStateEnum.CAN_DELETE) {
        throw new Error(`Cannot remove video session with ID ${videoSessionId} because it is not in the 'canDelete' state`);
    }

    await db.delete(schemas.videoSessionTable)
        .where(eq(schemas.videoSessionTable.videoSessionId, videoSessionId));

    return { videoSessionId };
}
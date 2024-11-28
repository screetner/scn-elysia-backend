import {t} from "elysia";

export enum videoSessionStateEnum {
    UPLOADING = 'uploading',
    UPLOADED = 'uploaded',
    PROCESSING = 'processing',
    PROCESSED = 'processed',
    CAN_DELETE = 'canDelete',
}

export const PostVideoBody = t.Object({
    uploadProgress: t.Number(),
    videoNames: t.Array(t.String()),
    videoSessionName: t.String(),
});

export const validStates = Object.values(videoSessionStateEnum);
export const INVALID_STATE = 'Invalid state';

export const UpdateVideoState = t.Object({
    videoSessionId: t.String(),
    state: t.String(),
    uploadProgress: t.Number(),
});

export const VideoSessionIdParams = t.Object({
    videoSessionId: t.String(),
});
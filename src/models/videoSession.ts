import {t} from "elysia";

export enum videoSessionStateEnum {
    UPLOADING = 'uploading',
    PROCESSING = 'processing',
    CAN_DELETE = 'canDelete',
}

export const PostVideoBody = t.Object({
    uploadProgress: t.Number(),
    videoNames: t.Array(t.String()),
    videoSessionName: t.String(),
});

export const UpdateVideoState = t.Object({
    videoSessionId: t.String(),
    uploadProgress: t.Number(),
});

export const VideoSessionIdParams = t.Object({
    videoSessionId: t.String(),
});
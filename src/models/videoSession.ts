import { t } from 'elysia'

export enum videoSessionStateEnum {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  CAN_DELETE = 'canDelete',
}

export const PostVideoBody = t.Object({
  uploadProgress: t.Number(),
  videoNames: t.Array(t.String()),
  videoSessionName: t.String(),
})

export const UpdateVideoState = t.Object({
  videoSessionId: t.String(),
  uploadProgress: t.Number(),
})

export const ProcessingState = t.Object({
  videoSessionId: t.String(),
})

export const VideoSessionIdParams = t.Object({
  videoSessionId: t.String(),
})

export interface RequestPythonDetection {
  sessionId: string
  session_folder_path: string
  session_detected_folder_path: string
}

export interface GenerateVideoSession {
  videoSessionId: string
  organizationId: string
  organizationName: string
}

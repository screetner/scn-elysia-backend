import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import * as videoModel from "@/models/videoSession";
import {postVideoSession, removeVideoSession, updateVideoSession} from "@/routes/videoSession/videoSession-service";

export const videoSession = (app: Elysia) =>
    app.group("videoSession", (app) => {
        return app
            .use(checkAccessToken)
            .post('/create', async ({error, payload, body}) => {
                try {
                    return await postVideoSession(payload!.userId, body);
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Post Video Session",
                    tags: ["Video Session"]
                },
                body: videoModel.PostVideoBody
            })
            .patch('/updateState', async ({error, payload, body}) => {
                try {
                    const state = videoModel.validStates.includes(body.state as videoModel.videoSessionStateEnum) ?
                        body.state as videoModel.videoSessionStateEnum :
                        videoModel.INVALID_STATE;

                    if (state === videoModel.INVALID_STATE) {
                        return error(400, videoModel.INVALID_STATE);
                    }

                    return await updateVideoSession(body.videoSessionId, body.uploadProgress, state, payload!.userId);
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Update Status of Video Session",
                    tags: ["Video Session"]
                },
                body: videoModel.UpdateVideoState
            })
            .delete('/remove', async ({error, payload, params}) => {
                try {
                    return await removeVideoSession(params.videoSessionId, payload!.userId);
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Remove Video Session",
                    tags: ["Video Session"],
                },
                params: videoModel.VideoSessionIdParams
            })
    }
    );

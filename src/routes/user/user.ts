import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {passwordSchema} from "@/models/user";
import {changePassword} from "@/routes/user/user-services";

export const user = (app: Elysia) =>
    app.group("user", (app) => {
        return app
            .use(checkAccessToken)
            .get('/info', async ({error, payload}) => {
                try {
                    return payload;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Get User Information",
                    tags: ["User"]
                }
            })
            .patch('/change-password', async ({error, payload, body}) => {
                try {
                    await changePassword(payload.userId, body.newPassword, body.oldPassword);
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Change User Password",
                    tags: ["User"]
                },
                body: passwordSchema
            })
    },
    );
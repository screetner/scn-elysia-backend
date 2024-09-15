import {Elysia} from "elysia";
import {checkTusdToken} from "@/middleware/jwtRequire";

export const tusd = (app: Elysia) =>
    app.group("tusd", (app) => {
            return app
                .use(checkTusdToken)
                .get('user/info', async ({error, payload}) => {
                    try {
                        return payload;
                    } catch (e) {
                        return error(500, e)
                    }
                }, {
                    detail: {
                        description: "Get User Information from tusd token",
                        tags: ["Tusd"]
                    }
                })
        },
    );
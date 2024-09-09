import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";

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
    },
    );
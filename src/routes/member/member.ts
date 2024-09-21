import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {memberRecentQuery} from "@/models/member";
import {getRecentMember} from "@/routes/member/member-service";

export const member = (app: Elysia) =>
    app.group("member", (app) => {
        return app
            .use(checkAccessToken)
            .get('/recent', async ({error, payload, query}) => {
                try {
                    const response = await getRecentMember(payload.orgId, query.limit as unknown as number);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Get recent member in limit",
                    tags: ["Member"]
                },
                query: memberRecentQuery
            })
    },
    );
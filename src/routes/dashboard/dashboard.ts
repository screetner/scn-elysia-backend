import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {getDashboardInformation} from "@/routes/dashboard/dashboard-service";
import {dashboardInformation} from "@/models/dashboard";

export const dashboard = (app: Elysia) =>
    app.group("dashboard", (app) => {
        return app
            .use(checkAccessToken)
            .get('/info', async ({error, payload}) => {
                try {
                    const response: dashboardInformation = await getDashboardInformation(payload.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Get dashboard information",
                    tags: ["Dashboard"]
                }
            })
    },
    );
import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {getRoleOrganization} from "@/routes/role/role-service";
import {roleInOrg} from "@/models/role";

export const role = (app: Elysia) =>
    app.group("role", (app) => {
        return app
            .use(checkAccessToken)
            .get("/", async ({error, payload}) => {
                try {
                    const response: roleInOrg[] = await getRoleOrganization(payload!.orgId)

                    if (!response) return error(401, "Unauthorized")

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    title: "Get Role Organization",
                    description: "Get All Role Organization for Organization",
                    tags: ["Role"]
                }
            })
    },
    );
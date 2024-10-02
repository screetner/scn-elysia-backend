import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {getAllOrganization} from "@/routes/organization/organization-service";
import {organizationData} from "@/models/organization";

export const organization = (app: Elysia) =>
    app.group("organization", (app) => {
        return app
            .use(checkAccessToken)
            .get('/all', async ({error, payload}) => {
                try {
                    if (!payload.isOwner) return error(401, "Unauthorized")

                    const response: organizationData[] = await getAllOrganization()

                    if (!response) return error(401, "Unauthorized")

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Get Organization Information",
                    tags: ["Organization"]
                }
            })
    },
    );

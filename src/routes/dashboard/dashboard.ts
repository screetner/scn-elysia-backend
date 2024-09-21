import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {countAdmins, countInvites, countMembers} from "@/routes/dashboard/dashboard-service";
import {inviteInformation, memberInformation} from "@/models/dashboard";

export const dashboard = (app: Elysia) =>
    app.group("dashboard", (app) => {
        return app
            .use(checkAccessToken)
            .get('/member', async ({error, payload}) => {
                try {
                    const response: memberInformation = await countMembers(payload.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Get member information for this organization",
                    tags: ["Dashboard"]
                }
            })
            .get('/invite', async ({error, payload}) => {
                try {
                    const response: inviteInformation = await countInvites(payload.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Get invite information for this organization",
                    tags: ["Dashboard"]
                }
            })
            .get('/admin', async ({error, payload}) => {
                try {
                    const response = await countAdmins(payload.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Get admin information for this organization",
                    tags: ["Dashboard"]
                }
            })
    },
    );
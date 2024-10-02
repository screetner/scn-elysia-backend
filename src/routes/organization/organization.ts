import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {createOrganization, getAllOrganization} from "@/routes/organization/organization-service";
import {createOrganizationBody, organizationData} from "@/models/organization";
import {addInviteToDatabase, checkEmailExist, sendInviteEmail} from "@/routes/member/member-service";
import {sendInviteToken} from "@/models/member";
import {jwtInviteSetup} from "@/routes/auth/setup";

export const organization = (app: Elysia) =>
    app.group("organization", (app) => {
        return app
            .use(checkAccessToken)
            .use(jwtInviteSetup)
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
            .post('/create', async ({error, payload, body, jwtInvite}) => {
                try {
                    if (!payload.isOwner) return error(401, "Unauthorized")

                    await checkEmailExist(body.adminEmail)
                    const data = await createOrganization(body.orgName)

                    const sendInviteTokens: sendInviteToken[] = [];
                    await Promise.all(body.adminEmail.map(async email => {
                        const token = await jwtInvite.sign({ email, orgId: data.orgId, roleId: data.adminRoleId });
                        sendInviteTokens.push({ email, token });
                    }));

                    await Promise.all([
                        addInviteToDatabase(payload.userId, data.orgId, sendInviteTokens.map(e => e.token)),
                        sendInviteEmail(sendInviteTokens)
                    ]);
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Create Organization",
                    tags: ["Organization"]
                },
                body: createOrganizationBody
            })
    },
    );

import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {memberInvitesBody, memberRecentQuery, sendInviteToken} from "@/models/member";
import {addInviteToDatabase, checkEmailExist, getRecentMember, sendInviteEmail} from "@/routes/member/member-service";
import {jwtInviteSetup} from "@/routes/auth/setup";

export const member = (app: Elysia) =>
    app.group("member", (app) => {
        return app
            .use(checkAccessToken)
            .use(jwtInviteSetup)
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
            .post('/invite', async ({error, payload, body, jwtInvite}) => {
                try {
                    await checkEmailExist(body.emails);

                    const sendInviteTokens: sendInviteToken[] = [];
                    await Promise.all(body.emails.map(async email => {
                        const token = await jwtInvite.sign({ email, orgId: payload.orgId, roleId: body.defaultRoleId });
                        console.log(token);
                        console.log(email);
                        sendInviteTokens.push({ email, token });
                    }));
                    console.log(sendInviteTokens);

                    await Promise.all([
                        addInviteToDatabase(payload.userId, payload.orgId, sendInviteTokens.map(e => e.token)),
                        sendInviteEmail(sendInviteTokens)
                    ]);
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Invite member to organization",
                    tags: ["Member"]
                },
                body: memberInvitesBody
            })
    },
    );
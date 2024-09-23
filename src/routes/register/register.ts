import {Elysia} from "elysia";
import {checkInviteToken} from "@/middleware/jwtRequire";
import {checkMemberToken, addNewMember} from "@/routes/register/register-service";
import {RegisterBody} from "@/models/register";

export const register = (app: Elysia) =>
    app.group('register', (app) => {
        return app
            .use(checkInviteToken)
            .get('/check', async ({error, payload, request: {headers}}) => {
                try {
                    const token = headers.get("AuthorizationRegister")?.split(" ")[1]!;
                    await checkMemberToken(token);
                    return payload;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Check invite token",
                    tags: ["Register"]
                }
            }).post('/', async ({error, body, payload, request: {headers}}) => {
                try{
                    const token = headers.get("AuthorizationRegister")?.split(" ")[1]!;
                    return await addNewMember(body, payload, token);
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    description: "Register new member",
                    tags: ["Register"]
                },
                body: RegisterBody
            });
    },);
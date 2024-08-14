import {Elysia} from "elysia";
import {
    accessTokenExpire,
    findUser
} from "./auth-services"
import {JWTPayload, LoginBody} from "@/models/auth";
import {jwtAccessSetup, jwtRefreshSetup} from "@/routes/auth/setup";
import {CustomResponse} from "@/custom/Response";
import {refreshToken} from "@/routes/auth/refreshToken";

export const auth = (app: Elysia) =>
    app.group("auth", (app) => {
        return app
            .use(jwtAccessSetup)
            .use(jwtRefreshSetup)
            .use(refreshToken)
            .post("/login", async ({body, error, jwtAccess, jwtRefresh}) => {
                try{
                    const user = await findUser(body)

                    if(!user) return error(401,"Unauthorized")

                    const isCorrect = await Bun.password.verify(body.password, user.password)

                    if(!isCorrect) return error(401,"Unauthorized")

                    const payload : JWTPayload = {
                        userId :user.userId,
                        username : user.username,
                        roleId : user.role.roleId,
                        roleName : user.role.roleName,
                        abilityScope: user.role.abilityScope,
                        email : user.email,
                        orgId : user.role.organizationId,
                        orgName : user.role.organization.name,
                    }

                    const result = {
                        user: {
                            accessToken: await jwtAccess.sign(payload),
                            username: payload.username,
                            email: payload.email,
                            roleName: payload.roleName,
                            orgName: payload.orgName,
                            accessTokenExpiry : accessTokenExpire(600),
                            refreshToken: await jwtRefresh.sign(payload),
                        }
                    };

                    return CustomResponse.ok(result).toStandardResponse()

                }catch (e){
                    return error(500,e)
                }
            }, {
                body: LoginBody,
                detail: {
                    title: "Login",
                    description: "Login to the system",
                    tags: ["Auth"]
                }
            })
        },
    );
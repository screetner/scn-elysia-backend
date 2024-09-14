import {Elysia} from "elysia";
import {accessTokenExpire, findUser} from "./auth-services"
import {JWTPayload, LoginBody} from "@/models/auth";
import {CustomResponse} from "@/custom/Response";
import {refreshToken} from "@/routes/auth/refreshToken";
import {rolePermission} from "@/models/role";
import {refreshTokenExpire, tokenTypeEnum} from "@/models/token";
import {checkToken, createToken} from "@/routes/token/token-service";

export const auth = (app: Elysia) =>
    app.group("auth", (app) => {
        return app
            .use(refreshToken)
            .post("/login", async ({body, error, jwtAccess, jwtRefresh}) => {
                try{
                    const user = await findUser(body)

                    if(!user) return error(401,"Unauthorized")

                    const isCorrect = await Bun.password.verify(body.password, user.password)

                    if(!isCorrect) return error(401,"Unauthorized")

                    const refreshTokenExpiry = accessTokenExpire(refreshTokenExpire);

                    const payload : JWTPayload = {
                        userId :user.userId,
                        username : user.username,
                        roleId : user.role.roleId,
                        roleName : user.role.roleName,
                        abilityScope: user.role.abilityScope as rolePermission,
                        email : user.email,
                        orgId : user.role.organizationId,
                        orgName : user.role.organization.name,
                        refreshTokenExpiry,
                    }

                    let refreshToken;
                    const tokenInDB = await checkToken(user.userId, tokenTypeEnum.ACCESS);
                    if (!tokenInDB) {
                        refreshToken = await jwtRefresh.sign(payload);
                        createToken(user.userId, tokenTypeEnum.REFRESH, refreshToken);
                    } else {
                        refreshToken = tokenInDB.token;
                    }

                    const result = {
                        user: {
                            accessToken: await jwtAccess.sign(payload),
                            username: payload.username,
                            email: payload.email,
                            roleName: payload.roleName,
                            orgName: payload.orgName,
                            accessTokenExpiry : accessTokenExpire(60),
                            refreshToken,
                            refreshTokenExpiry,
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
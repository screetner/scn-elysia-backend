import {Elysia} from "elysia";
import {
    findUser
} from "./auth-services"
import {JWTPayload, LoginBody} from "@/models/auth/auth";
import {jwt} from "@elysiajs/jwt";

export const auth = (app: Elysia) =>
    app.group("auth", (app) => {
        return app
            .use(jwt({
                name: "jwt",
                secret: process.env.JWT_SECRET || "secret"
            }))
            .get("/check/:name", async ({ jwt ,params}) => {
                const value = await jwt.sign(params)
                return {
                    accessToken: value
                }
            },{
                detail: {
                    title: "Check",
                    description: "Check the user",
                    tags: ["Auth"]
                }
            })
            .post("/login", async ({body, error, jwt}) => {
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

                    return {
                        user : {
                            accessToken: await jwt.sign(payload as unknown as Record<string ,string | number>),
                            username: payload.username,
                            email: payload.email,
                            roleName: payload.roleName,
                            orgName: payload.orgName,
                        }
                    }

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
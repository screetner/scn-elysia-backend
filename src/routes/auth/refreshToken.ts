import {Elysia} from "elysia";
import {checkRefreshToken} from "@/middleware/jwtRequire";
import {jwtAccessSetup, jwtRefreshSetup} from "@/routes/auth/setup";
import {accessTokenExpire} from "@/routes/auth/auth-services";

export const refreshToken = new Elysia()
    .use(checkRefreshToken)
    .use(jwtAccessSetup)
    .use(jwtRefreshSetup)
    .get("/refresh", async ({jwtAccess,payload, jwtRefresh}) => {
        return {
            accessToken: await jwtAccess.sign(payload),
            accessTokenExpiry : accessTokenExpire(60),
            refreshToken: await jwtRefresh.sign(payload)
        }
    }, {
        detail: {
            title: "Refresh Token",
            description: "Refresh the access token",
            tags: ["Auth"]
        }
    })
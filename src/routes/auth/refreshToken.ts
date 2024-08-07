import {Elysia} from "elysia";
import {checkRefreshToken} from "@/middleware/jwtRequire";
import {jwtAccessSetup} from "@/routes/auth/setup";
import {accessTokenExpire} from "@/routes/auth/auth-services";

export const refreshToken = new Elysia()
    .use(checkRefreshToken)
    .use(jwtAccessSetup)
    .get("/refresh", async ({jwtAccess,payload}) => {
        return {
            accessToken: await jwtAccess.sign(payload),
            accessTokenExpiry : accessTokenExpire(600),
        }
    }, {
        detail: {
            title: "Refresh Token",
            description: "Refresh the access token",
            tags: ["Auth"]
        }
    })
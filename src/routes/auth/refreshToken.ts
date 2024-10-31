import {Elysia} from "elysia";
import {checkRefreshToken} from "@/middleware/jwtRequire";
import {jwtAccessSetup, jwtRefreshSetup, jwtTusdSetup} from "@/routes/auth/setup";
import {accessTokenExpire} from "@/routes/auth/auth-services";

export const refreshToken = new Elysia()
    .use(checkRefreshToken)
    .use(jwtAccessSetup)
    .use(jwtRefreshSetup)
    .use(jwtTusdSetup)
    .get("/refresh", async ({jwtAccess, payload, jwtRefresh, jwtTusd}) => {
        const [accessToken, refreshToken, tusdToken] = await Promise.all([
            jwtAccess.sign(payload),
            jwtRefresh.sign(payload),
            jwtTusd.sign(payload)
        ]);
        return {
            accessToken,
            accessTokenExpiry : accessTokenExpire(60),
            refreshToken,
            refreshTokenExpiry : accessTokenExpire(60*60*24*7),
            tusdToken,
            tusdTokenExpiry : accessTokenExpire(60*60*24*7)
        }
    }, {
        detail: {
            title: "Refresh Token",
            description: "Refresh the access token",
            tags: ["Auth"]
        }
    })
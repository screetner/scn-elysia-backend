import {Elysia} from "elysia";
import {jwtAccessSetup, jwtRefreshSetup} from "@/routes/auth/setup";
import {JWTPayload} from "@/models/auth";

// @ts-ignore
const checkImproperToken = async (token: string | undefined, tokenType: string, set, jwtVerifier) => {
    if (!token) {
        set.status = 401;
        throw Error(`${tokenType} is missing`);
    }
    const payload: JWTPayload = await jwtVerifier.verify(token);
    if (!payload) {
        set.status = 403;
        throw Error(`${tokenType} is invalid`);
    }
    return { payload };
};

export const checkAccessToken = (app: Elysia) =>
    app
        .use(jwtAccessSetup)
        .derive(async function handler({jwtAccess, set, request: {headers}}) {
            const token = headers.get("Authorization")?.split(" ")[1];
            return checkImproperToken(token, "Access token", set, jwtAccess);
        });

export const checkRefreshToken = (app: Elysia) =>
    app.use(jwtRefreshSetup)
        .derive(async function handler({jwtRefresh, set, request: {headers}}) {
            const token = headers.get("AuthorizationRefresh")?.split(" ")[1];
            return checkImproperToken(token, "Refresh token", set, jwtRefresh);
        });
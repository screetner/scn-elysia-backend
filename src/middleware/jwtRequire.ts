import {Elysia} from "elysia";
import {jwtAccessSetup, jwtRefreshSetup} from "@/routes/auth/setup";

// @ts-ignore
const checkImproperToken = async (token: string | undefined, set, jwtVerifier) => {
    if (!token) {
        set.status = 401;
        return {
            success: false,
            message: "Unauthorized",
            data: null,
        };
    }
    const payload = await jwtVerifier.verify(token);
    if (!payload) {
        set.status = 401;
        return {
            success: false,
            message: "Unauthorized",
            data: null,
        };
    }
    return { payload };
};

export const checkAccessToken = (app: Elysia) =>
    app
        .use(jwtAccessSetup)
        .derive(async function handler({jwtAccess, set, request: {headers}}) {
            const token = headers.get("Authorization")?.split(" ")[1];
            return checkImproperToken(token, set, jwtAccess);
        });

export const checkRefreshToken = (app: Elysia) =>
    app.use(jwtRefreshSetup)
        .derive(async function handler({jwtRefresh, set, request: {headers}}) {
            const token = headers.get("AuthorizationRefresh")?.split(" ")[1];
            return checkImproperToken(token, set, jwtRefresh);
        });
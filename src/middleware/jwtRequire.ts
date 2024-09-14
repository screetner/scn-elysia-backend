import {Elysia} from "elysia";
import {jwtAccessSetup, jwtRefreshSetup} from "@/routes/auth/setup";
import {JWTPayload} from "@/models/auth";
import {tokenTypeEnum} from "@/models/token";
import {checkToken} from "@/routes/token/token-service";

// @ts-ignore
const checkImproperToken = async (token: string | undefined, tokenType: tokenTypeEnum, set, jwtVerifier) => {
    if (!token) {
        set.status = 401;
        throw Error(`${tokenType} token is missing`);
    }

    const payload: JWTPayload = await jwtVerifier.verify(token);
    if (await checkToken(payload.userId, tokenType)) {

    } else {
        set.status = 403;
        throw Error(`${tokenType} token is invalid`);
    }

    if (!payload) {
        set.status = 403;
        throw Error(`${tokenType} token is invalid`);
    }
    return { payload };
};

export const checkAccessToken = (app: Elysia) =>
    app
        .use(jwtAccessSetup)
        .derive(async function handler({jwtAccess, set, request: {headers}}) {
            const token = headers.get("Authorization")?.split(" ")[1];
            return checkImproperToken(token, tokenTypeEnum.ACCESS, set, jwtAccess);
        });

export const checkRefreshToken = (app: Elysia) =>
    app.use(jwtRefreshSetup)
        .derive(async function handler({jwtRefresh, set, request: {headers}}) {
            const token = headers.get("AuthorizationRefresh")?.split(" ")[1];
            return checkImproperToken(token, tokenTypeEnum.REFRESH, set, jwtRefresh);
        });
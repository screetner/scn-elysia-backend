import {Elysia} from "elysia";
import {jwt} from "@elysiajs/jwt";
import {JWTInvitePayloadSchema, JWTPayloadSchema} from "@/models/auth";

export const jwtAccessSetup = new Elysia({
    name: "jwtAccess",
}).use(
    jwt({
        name: "jwtAccess",
        schema: JWTPayloadSchema,
        secret: process.env.JWT_SECRET || "secret",
        exp: "1m",
    })
);

export const jwtRefreshSetup = new Elysia({
    name: "jwtRefresh",
}).use(
    jwt({
        name: "jwtRefresh",
        schema: JWTPayloadSchema,
        secret: process.env.JWT_REFRESH_SECRET!,
        exp: "7d",
    })
);

export const jwtTusdSetup = new Elysia({
    name: "jwtTusd",
}).use(
    jwt({
        name: "jwtTusd",
        schema: JWTPayloadSchema,
        secret: process.env.JWT_TUSD_SECRET!,
        exp: "7d",
    })
);

export const jwtInviteSetup = new Elysia({
    name: "jwtInvite",
}).use(
    jwt({
        name: "jwtInvite",
        schema: JWTInvitePayloadSchema,
        secret: process.env.JWT_INVITE_SECRET!,
        exp: "7d",
    })
);

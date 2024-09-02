import {Elysia} from "elysia";
import {jwt} from "@elysiajs/jwt";
import {JWTPayloadSchema} from "@/models/auth";

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
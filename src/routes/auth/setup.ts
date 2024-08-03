import {Elysia, t} from "elysia";
import {jwt} from "@elysiajs/jwt";

export const jwtAccessSetup = new Elysia({
    name: "jwtAccess",
}).use(
    jwt({
        name: "jwtAccess",
        schema: t.Object({
            userId : t.String(),
            username : t.String(),
            roleId : t.String(),
            roleName : t.String(),
            abilityScope: t.Object({
                canRead: t.Boolean(),
                canCreate: t.Boolean(),
                canUpdate: t.Boolean(),
                canDelete: t.Boolean(),
            }),
            email : t.String(),
            orgId : t.String(),
            orgName : t.String(),
        }),
        secret: process.env.JWT_SECRET || "secret",
        exp: "10m",
    })
);

export const jwtRefreshSetup = new Elysia({
    name: "jwtRefresh",
}).use(
    jwt({
        name: "jwtRefresh",
        schema: t.Object({
            userId: t.String(),
        }),
        secret: process.env.JWT_REFRESH_SECRET!,
        exp: "7d",
    })
);
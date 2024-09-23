import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import * as routes from "@/routes";
import {jwt} from "@elysiajs/jwt";
import { Logestic } from 'logestic';

new Elysia()
    .use(Logestic.preset('common'))
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET || "secret"
    }))
    .use(swagger({
        documentation: {
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [{ bearerAuth: [] }],
        },
        provider: 'scalar'
    }))
    .use(routes.auth)
    .use(routes.geolocation)
    .use(routes.sample)
    .use(routes.asset)
    .use(routes.role)
    .use(routes.user)
    .use(routes.tusd)
    .use(routes.member)
    .use(routes.dashboard)
    .use(routes.register)
    .get("/", () => "Hello Elysia")
    .listen(3000);

console.log("server is running on http://localhost:3000");

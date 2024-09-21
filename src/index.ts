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
            tags: [
                { name: 'Auth', description: 'Authentication endpoints' },
                { name: 'Sample', description: 'Sample endpoints' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [{ bearerAuth: [] }]
        },
        provider: 'swagger-ui'
    }))
    .use(routes.auth)
    .use(routes.geolocation)
    .use(routes.sample)
    .use(routes.asset)
    .use(routes.role)
    .use(routes.user)
    .use(routes.tusd)
    .use(routes.member)
    .get("/", () => "Hello Elysia")
    .listen(3000);

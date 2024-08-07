import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import {auth, sample, geolocation} from "@/routes";
import {jwt} from "@elysiajs/jwt";
import { Logestic } from 'logestic';

const app = new Elysia()
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
            ]
        }
    }))
    .use(auth)
    .use(geolocation)
    .use(sample)
    .get("/", () => "Hello Elysia")
    .listen(3000);
